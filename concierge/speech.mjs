export function speechErrorMessage(code) {
  return (
    {
      "not-allowed":
        "Microphone permission was denied. You can keep typing, or enable microphone access in your browser settings.",
      "service-not-allowed":
        "Voice input is blocked by this browser. Text chat still works.",
      "audio-capture":
        "No microphone was found. Check your input device or use text chat.",
      "no-speech":
        "I didn’t hear a question. Try the microphone again, or type it below.",
      network:
        "The browser’s speech service could not connect. Try text chat instead.",
      "language-not-supported":
        "This speech service does not support the selected language. Please use text chat.",
      aborted: "Listening stopped.",
    }[code] || "Voice input could not start. Please try text chat."
  );
}
export function createSpeechController({
  env = window,
  onState = () => {},
  onError = () => {},
  onInterim = () => {},
  onFinal = () => {},
  timers = globalThis,
} = {}) {
  let recognition = null,
    utterance = null,
    listenTimer = null,
    speakTimer = null,
    active = false,
    closed = false,
    serial = 0;
  const Recognition = env.SpeechRecognition || env.webkitSpeechRecognition;
  const canRecognise = !!Recognition && env.isSecureContext !== false;
  const canSpeak = !!env.speechSynthesis && !!env.SpeechSynthesisUtterance;
  function stopListening({ quiet = true } = {}) {
    serial++;
    active = false;
    timers.clearTimeout(listenTimer);
    listenTimer = null;
    if (recognition) {
      const old = recognition;
      recognition = null;
      old.onresult = old.onerror = old.onend = old.onstart = null;
      try {
        old.abort();
      } catch {}
    }
    onInterim("");
    if (!quiet) onState("idle");
  }
  function stopSpeaking({ quiet = true } = {}) {
    timers.clearTimeout(speakTimer);
    speakTimer = null;
    if (utterance) {
      utterance.onstart = utterance.onend = utterance.onerror = null;
      utterance = null;
      try {
        env.speechSynthesis.cancel();
      } catch {}
    }
    if (!quiet) onState("idle");
  }
  function listen() {
    if (closed) return;
    if (!canRecognise) {
      onError(
        env.isSecureContext === false
          ? "Microphone access needs HTTPS or localhost. Text chat still works."
          : "Voice input isn’t available in this browser. Type a question below.",
      );
      return;
    }
    stopListening();
    stopSpeaking();
    const ticket = ++serial;
    let finalReceived = false;
    try {
      recognition = new Recognition();
      recognition.lang = "en-IN";
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      active = true;
      recognition.onstart = () => {
        if (ticket === serial && active) onState("listening");
      };
      recognition.onresult = (event) => {
        if (ticket !== serial || !active) return;
        let interim = "",
          final = "";
        for (let i = event.resultIndex || 0; i < event.results.length; i++) {
          const result = event.results[i],
            text = result[0]?.transcript || "";
          if (result.isFinal) final += text;
          else interim += text;
        }
        onInterim(interim);
        if (final.trim() && !finalReceived) {
          finalReceived = true;
          stopListening();
          onFinal(final.trim().slice(0, 600));
        }
      };
      recognition.onerror = (event) => {
        if (ticket !== serial || !active) return;
        const code = event.error;
        stopListening();
        if (code !== "aborted") onError(speechErrorMessage(code));
        else onState("idle");
      };
      recognition.onend = () => {
        if (ticket !== serial || !active) return;
        stopListening();
        if (!finalReceived) onState("idle");
      };
      recognition.start();
      listenTimer = timers.setTimeout(() => {
        if (ticket !== serial || !active) return;
        stopListening();
        onError(speechErrorMessage("no-speech"));
      }, 15000);
      onState("listening");
    } catch {
      stopListening();
      onError(
        "The microphone could not start. Please use text chat or try again.",
      );
    }
  }
  function speak(text, { onDone = () => {} } = {}) {
    if (closed) return;
    if (!canSpeak) {
      onError(
        "Spoken replies aren’t supported here. The full answer is available as text.",
      );
      onDone();
      return;
    }
    stopListening();
    stopSpeaking();
    let done = false;
    const finish = (failed = false) => {
      if (done) return;
      done = true;
      timers.clearTimeout(speakTimer);
      utterance = null;
      onState(failed ? "error" : "idle");
      onDone();
    };
    try {
      utterance = new env.SpeechSynthesisUtterance(String(text).slice(0, 2200));
      utterance.lang = "en-IN";
      utterance.rate = 1;
      const voices = env.speechSynthesis.getVoices?.() || [];
      const voice =
        voices.find((v) => v.lang === "en-IN") ||
        voices.find((v) => v.lang?.startsWith("en"));
      if (voice) utterance.voice = voice;
      utterance.onstart = () => onState("speaking");
      utterance.onend = () => finish();
      utterance.onerror = (event) => {
        if (!["canceled", "interrupted"].includes(event.error))
          onError(
            "Speech playback was blocked or interrupted. You can read the answer or tap Read answer to retry.",
          );
        finish(!["canceled", "interrupted"].includes(event.error));
      };
      onState("speaking");
      env.speechSynthesis.speak(utterance);
      speakTimer = timers.setTimeout(
        () => {
          stopSpeaking();
          finish();
        },
        Math.min(90000, Math.max(20000, String(text).length * 80)),
      );
    } catch {
      stopSpeaking();
      onError(
        "Speech playback could not start. The text answer is still available.",
      );
      onDone();
    }
  }
  function stop() {
    stopListening();
    stopSpeaking();
    onState("idle");
  }
  return {
    canRecognise,
    canSpeak,
    listen,
    speak,
    stop,
    stopListening,
    stopSpeaking,
    destroy() {
      stop();
      closed = true;
    },
    get listening() {
      return active;
    },
    get speaking() {
      return !!utterance;
    },
  };
}
