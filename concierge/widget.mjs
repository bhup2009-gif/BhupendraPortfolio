import { createLocalProvider } from "./engine.mjs";
import {
  ACTIONS,
  resolveAction,
  safeResponse,
  hasNavigationIntent,
} from "./routes.mjs";
import { createSpeechController } from "./speech.mjs";
import { createNavigator, readResume } from "./navigation.mjs";
const icon = {
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  clear: '<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7"/>',
  mic: '<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3m-4 0h8"/>',
  send: '<path d="m5 12 7-7 7 7M12 5v15"/>',
  volume:
    '<path d="m11 5-6 4H2v6h3l6 4ZM15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',
  mute: '<path d="m11 5-6 4H2v6h3l6 4Zm6 4 5 6m0-6-5 6"/>',
};
const svg = (name) =>
  `<svg viewBox="0 0 24 24" aria-hidden="true">${icon[name]}</svg>`;
const promptItems = [
  "Tell me about your experience.",
  "Show me your best UX case study.",
  "What is TXT2Create?",
  "What is your experience with AI?",
  "Show your leadership projects.",
  "How can I contact you?",
];
export async function mount({
  shadow,
  launcher,
  assetBase,
  base,
  providerFactory = createLocalProvider,
}) {
  const old = shadow.querySelector(".panel");
  if (old) old.remove();
  let style = shadow.querySelector("[data-widget-style]");
  let styleReady = Promise.resolve();
  if (!style) {
    style = document.createElement("link");
    style.rel = "stylesheet";
    style.href = new URL("widget.css", assetBase).href;
    style.dataset.widgetStyle = "true";
    styleReady = new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        style.remove();
        reject(Error("Styles unavailable"));
      }, 10000);
      style.onload = () => {
        clearTimeout(timer);
        resolve();
      };
      style.onerror = () => {
        clearTimeout(timer);
        style.remove();
        reject(Error("Styles unavailable"));
      };
    });
    shadow.append(style);
  }
  const [response] = await Promise.all([
    fetch(new URL("knowledge.json", assetBase), { credentials: "same-origin" }),
    styleReady,
  ]);
  if (!response.ok) throw Error("Knowledge unavailable");
  const knowledge = await response.json();
  const provider = providerFactory(knowledge);
  const panel = document.createElement("section");
  panel.className = "panel";
  panel.id = "concierge-panel";
  panel.hidden = true;
  panel.tabIndex = -1;
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-modal", "false");
  panel.setAttribute("aria-labelledby", "concierge-title");
  panel.dataset.state = "idle";
  panel.innerHTML = `<div class="activity" aria-hidden="true"></div><header class="panel-head"><span class="head-avatar" aria-hidden="true">✦</span><div class="head-copy"><h2 id="concierge-title">Bhupendra’s portfolio guide</h2><p class="status" aria-live="polite">Ready when you are</p></div><div class="head-actions"><button class="icon-btn clear-btn" aria-label="Clear conversation" title="Clear conversation">${svg("clear")}</button><button class="icon-btn close-btn" aria-label="Close portfolio assistant" title="Close">${svg("close")}</button></div></header><div class="mode-note">Portfolio AI Concierge · free local-knowledge prototype</div><div class="conversation" role="log" aria-label="Portfolio conversation" aria-live="polite" aria-relevant="additions"></div><div class="notice" role="status" hidden></div><div class="error-note" role="alert" hidden></div><div class="interim" aria-live="polite"></div><div class="composer-wrap"><form class="composer"><button type="button" class="mic-btn" aria-label="Start microphone" aria-pressed="false" title="Ask using your microphone">${svg("mic")}</button><textarea rows="1" maxlength="600" aria-label="Your portfolio question" placeholder="Ask about my work…"></textarea><button type="submit" class="send-btn" aria-label="Send question">${svg("send")}</button></form><div class="composer-footer"><button class="voice-toggle" aria-label="Enable spoken replies" aria-pressed="false">${svg("mute")}<span>Spoken replies off</span></button><button class="stop-btn" hidden>Stop</button><span class="count">0 / 600</span></div></div><details class="privacy"><summary>Voice, privacy & how this works</summary><p>Text answers come from this portfolio’s reviewed local knowledge, not a general AI model. No API keys, chat backend or chat analytics. This conversation stays in this tab; a short-lived copy is used only for assistant navigation. Voice is off until you enable it. Your browser may send microphone audio to its own speech service and may need an internet connection. No audio is saved by this site. Close or Stop ends listening and speech.</p></details>`;
  shadow.append(panel);
  const find = (s) => panel.querySelector(s),
    log = find(".conversation"),
    input = find("textarea"),
    status = find(".status"),
    error = find(".error-note"),
    notice = find(".notice"),
    interim = find(".interim"),
    mic = find(".mic-btn"),
    voice = find(".voice-toggle"),
    stop = find(".stop-btn");
  let opened = false,
    state = "idle",
    voiceReplies = false,
    request = 0,
    abort = null,
    navTimer = null,
    topic = null,
    records = [];
  function setState(next) {
    state = next;
    panel.dataset.state = next;
    launcher.dataset.state = next;
    const labels = {
      idle: "Ready when you are",
      listening: "Listening · tap Stop to finish",
      thinking: "Finding portfolio details",
      speaking: "Speaking · tap Stop to pause",
      error: "Text chat is always available",
    };
    status.textContent = labels[next] || labels.idle;
    mic.setAttribute("aria-pressed", String(next === "listening"));
    mic.setAttribute(
      "aria-label",
      next === "listening" ? "Stop microphone" : "Start microphone",
    );
    stop.hidden = !["listening", "speaking", "thinking"].includes(next);
    log.setAttribute("aria-busy", String(next === "thinking"));
  }
  function showError(message) {
    error.textContent = message;
    error.hidden = false;
    setState("error");
  }
  function resetError() {
    error.hidden = true;
    notice.hidden = true;
  }
  const nav = createNavigator({
    base: base.href,
    onNotice: (message) => {
      notice.textContent = message;
      notice.hidden = false;
    },
  });
  const speech = createSpeechController({
    onState: setState,
    onError: showError,
    onInterim: (text) => {
      interim.textContent = text;
    },
    onFinal: (text) => ask(text),
  });
  if (!speech.canRecognise) {
    mic.setAttribute("aria-disabled", "true");
    mic.title = "Voice input unavailable here. Use text chat.";
    find(".mode-note").textContent =
      "Free local portfolio knowledge · text mode in this browser";
  }
  if (!speech.canSpeak) {
    voice.disabled = true;
    voice.title = "Spoken replies unavailable in this browser.";
    voice.querySelector("span").textContent = "Text replies";
  }
  function stopAll() {
    request++;
    abort?.abort();
    abort = null;
    clearTimeout(navTimer);
    navTimer = null;
    speech.stop();
    interim.textContent = "";
  }
  function navigate(id) {
    stopAll();
    return nav.go(id, { messages: records.slice(-12), topic });
  }
  function button(text, className, handler) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = className;
    b.textContent = text;
    b.addEventListener("click", handler);
    return b;
  }
  function append(role, text, responseData = null) {
    const article = document.createElement("article");
    article.className = "message " + role;
    const label = document.createElement("span");
    label.className = "message-label";
    label.textContent = role === "user" ? "YOU" : "PORTFOLIO GUIDE";
    const p = document.createElement("p");
    p.className = "message-text";
    p.textContent = text;
    article.append(label, p);
    if (responseData) {
      const actions = document.createElement("div");
      actions.className = "message-actions";
      for (const id of responseData.actions) {
        const action = resolveAction(id, base);
        if (action)
          actions.append(
            button(action.label + " ↗", "action-btn", () => navigate(id)),
          );
      }
      article.append(actions);
      if (responseData.sources.length) {
        const sources = document.createElement("div");
        sources.className = "sources";
        const prefix = document.createElement("span");
        prefix.textContent = "Portfolio source:";
        sources.append(prefix);
        for (const id of responseData.sources) {
          if (ACTIONS[id])
            sources.append(
              button(ACTIONS[id].label, "source-link", () => navigate(id)),
            );
        }
        article.append(sources);
      }
    }
    if (role === "assistant" && speech.canSpeak) {
      const read = button("Read answer", "read-btn", () => {
        resetError();
        clearTimeout(navTimer);
        speech.speak(text);
      });
      read.insertAdjacentHTML("afterbegin", svg("volume"));
      article.append(read);
    }
    log.append(article);
    records.push({
      role,
      text,
      ...(responseData ? { response: { ...responseData } } : {}),
    });
    while (records.length > 30) {
      records.shift();
      log.firstElementChild?.remove();
    }
    log.scrollTop = log.scrollHeight;
    return article;
  }
  function greeting() {
    append(
      "assistant",
      "Hi, I’m Bhupendra’s portfolio guide. I can help you explore his experience, UX case studies, AI projects and skills. What would you like to know?",
    );
    const promptLabel = document.createElement("p");
    promptLabel.className = "suggestion-label";
    promptLabel.textContent = "A FEW PLACES TO START";
    log.append(promptLabel);
    const prompts = document.createElement("div");
    prompts.className = "prompts";
    promptItems.forEach((p) => prompts.append(button(p, "", () => ask(p))));
    log.append(prompts);
  }
  async function ask(message) {
    if (!opened) return;
    message = String(message).trim();
    if (!message) {
      input.focus();
      return;
    }
    if (message.length > 600) {
      showError("Keep your question under 600 characters.");
      return;
    }
    stopAll();
    resetError();
    const ticket = ++request;
    abort = new AbortController();
    input.value = "";
    find(".count").textContent = "0 / 600";
    append("user", message);
    setState("thinking");
    try {
      const result = safeResponse(
        await provider.answer({
          message,
          context: { topic },
          signal: abort.signal,
        }),
      );
      if (ticket !== request || !opened) return;
      topic = result.topic;
      append("assistant", result.text, result);
      setState("idle");
      const auto =
        result.autoAction && hasNavigationIntent(message)
          ? result.autoAction
          : null;
      if (auto && resolveAction(auto, base) && !ACTIONS[auto].asset) {
        if (voiceReplies && speech.canSpeak) {
          speech.speak(
            "Opening " +
              ACTIONS[auto].label.replace(
                /^(View|Explore|Go to|Highlight|Read|See) /,
                "",
              ) +
              ".",
            {
              onDone: () => {
                if (ticket === request && opened) navigate(auto);
              },
            },
          );
          navTimer = setTimeout(() => {
            if (ticket === request && opened) navigate(auto);
          }, 5000);
        } else
          navTimer = setTimeout(() => {
            if (ticket === request && opened) navigate(auto);
          }, 350);
      } else if (voiceReplies && speech.canSpeak) speech.speak(result.text);
    } catch (e) {
      if (ticket !== request || e.name === "AbortError") return;
      showError(
        "I couldn’t answer just now. Please try again. The published pages are still available.",
      );
    } finally {
      if (ticket === request) abort = null;
    }
  }
  function open() {
    opened = true;
    panel.hidden = false;
    launcher.setAttribute("aria-expanded", "true");
    launcher.setAttribute("aria-label", "Close portfolio assistant");
    launcher.dataset.state = state;
    panel.focus({ preventScroll: true });
  }
  function close() {
    opened = false;
    stopAll();
    panel.hidden = true;
    launcher.setAttribute("aria-expanded", "false");
    launcher.setAttribute("aria-label", "Open portfolio assistant");
    error.hidden = true;
    notice.hidden = true;
    launcher.focus({ preventScroll: true });
  }
  find(".close-btn").addEventListener("click", close);
  find(".clear-btn").addEventListener("click", () => {
    stopAll();
    resetError();
    topic = null;
    records = [];
    log.replaceChildren();
    try {
      sessionStorage.removeItem("portfolio-concierge-resume-v1");
    } catch {}
    greeting();
    input.focus();
  });
  find("form").addEventListener("submit", (e) => {
    e.preventDefault();
    ask(input.value);
  });
  input.addEventListener("input", () => {
    find(".count").textContent = input.value.length + " / 600";
  });
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey && !e.isComposing) {
      e.preventDefault();
      ask(input.value);
    }
  });
  mic.addEventListener("click", () => {
    resetError();
    if (speech.listening) {
      speech.stop();
      return;
    }
    stopAll();
    speech.listen();
  });
  voice.addEventListener("click", () => {
    voiceReplies = !voiceReplies;
    voice.setAttribute("aria-pressed", String(voiceReplies));
    voice.setAttribute(
      "aria-label",
      voiceReplies ? "Disable spoken replies" : "Enable spoken replies",
    );
    voice.querySelector("span").textContent = voiceReplies
      ? "Spoken replies on"
      : "Spoken replies off";
    voice.querySelector("svg").outerHTML = svg(
      voiceReplies ? "volume" : "mute",
    );
    if (!voiceReplies) speech.stopSpeaking({ quiet: false });
  });
  stop.addEventListener("click", () => {
    stopAll();
    resetError();
  });
  shadow.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && opened) {
      e.preventDefault();
      e.stopPropagation();
      close();
    }
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopAll();
  });
  window.addEventListener("pagehide", stopAll);
  let tabStorage;
  try {
    tabStorage = sessionStorage;
  } catch {}
  const resume = readResume(tabStorage, base);
  if (resume) {
    topic = resume.topic;
    resume.messages.forEach((m) => append(m.role, m.text, m.response || null));
    if (!records.length) greeting();
    const reveal = () => nav.highlight(resume.action);
    if (document.readyState === "complete") requestAnimationFrame(reveal);
    else window.addEventListener("load", reveal, { once: true });
  } else greeting();
  setState("idle");
  return {
    open,
    close,
    toggle() {
      opened ? close() : open();
    },
  };
}
