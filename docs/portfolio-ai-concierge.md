# Portfolio AI Concierge

A functioning, free, browser-based portfolio guide integrated into all 12 existing pages. It answers using a reviewed local knowledge base and explicit rules/retrieval, not an LLM. No API keys, paid services, account, package installation or build step is required.

## Local setup

From the repository root:

```sh
python3 -m http.server 8000
```

Open `http://localhost:8000/`. For GitHub Pages, the loader resolves its own asset location and derives the site root from it, so `/BhupendraPortfolio/` works without hardcoded absolute paths. Do not double-click the HTML files: browser module/fetch policies require an HTTP server.

The public integration is one deferred `<script src="concierge/loader.js" defer></script>` on each page. The homepage adds stable IDs for its contact footer, CaféOS card and independent tool cards. Existing `local.js`, `local.css`, certificate viewer, page content, links, Kyvos scripts/styles, email copy, coffee gestures and resume remain intact. The back-to-top control moves horizontally to leave space for the 56 px orb.

## Visitor experience

- Open the bottom-right orb. Nothing opens automatically on a first visit.
- Type a question or choose a suggested question.
- Answers cite known portfolio destinations and include relevant action buttons.
- Explicit commands such as “Show me your best UX case study” navigate to the known page/anchor, highlight the section, and resume the conversation there.
- Ask “show it” after discussing a project for a contextual follow-up.
- Use the microphone button to start a **single** listening turn. Press Stop, Close, or Escape to stop. Hiding/leaving the page also stops speech and recognition.
- Spoken replies are **off by default**. Enable them explicitly for answers to future questions, or choose **Read answer** for one answer. Enabling the setting does not play the greeting.
- Clear conversation resets the current transcript and context. It does not alter the portfolio.

## Architecture

| File | Responsibility |
| --- | --- |
| `concierge/loader.js` | Small deferred launcher; isolated Shadow DOM; lazy import and retry; back-to-top spacing |
| `concierge/widget.mjs` | Conversation UI, explicit input controls, status, source/action rendering, cancellation |
| `concierge/widget.css` | Glass panel, responsive sizing, state feedback, reduced-motion styles |
| `concierge/knowledge.json` | 23 reviewed records, public source files, evidence excerpts and semantic source fingerprints |
| `concierge/engine.mjs` | Local intent/retrieval provider, context, honest fallback; unused future remote provider adapter |
| `concierge/routes.mjs` | Curated action IDs; same-origin route resolution; response validation |
| `concierge/navigation.mjs` | Allowed navigation, scrolling/highlight, bounded tab-only resume |
| `concierge/speech.mjs` | SpeechRecognition/webkitSpeechRecognition and speechSynthesis lifecycle; injected dependencies for tests |
| `scripts/verify-knowledge.py` | Detect stale source copy and verify supporting excerpts |
| `tests/concierge.test.mjs` | Intent, safety, integration, route, recovery and voice adapter checks |

Initial load adds only the launcher (about 5.5 KB uncompressed). Chat modules, styles and knowledge are loaded on deliberate open. After assistant-driven navigation only, the previously opened conversation is restored and its modules load intentionally. The orb uses CSS animation; there is no continuous JavaScript animation loop. Reduced-motion preferences disable animation and use instant section scrolling.

## Knowledge and accuracy

Knowledge was reviewed against the local published source on **26 October 2026**. Professional history and product descriptions are portfolio-reported, not independently verified employment or performance claims. The guide supports experience, Kyvos, TXT2Create, Talkbar, AI/education, leadership, skills, contact, the other project pages, CaféOS and the five independent homepage tools.

It does not invent availability, salary, private contact details, clients or metrics. Kyvos outcomes retain the page's measurement qualification. Alfred retains the qualification about conflicting reported retention figures. Questions outside the reviewed scope receive a useful fallback.

To update facts, review the corresponding HTML and change the relevant knowledge record, supporting excerpts and `reviewedAt`. Refresh that document's semantic fingerprint only after reviewing the copy. The verifier intentionally fails when source text changes so stale professional details do not silently pass.

## Safe navigation

Navigation accepts an action ID, never an arbitrary URL from a question or model. The registry maps IDs to owned HTML files and existing anchors. Routes must resolve under the portfolio's same-origin base. The published resume is an explicit known asset and opens only via a visitor action. The external CaféOS card is highlighted; visitors choose whether to follow its original external link.

Messages use `textContent`, not user/model HTML. A future provider's text and actions are validated, and unsupported action/source IDs are discarded. Autonomous navigation is accepted only in response to an explicit navigation request.

## Privacy and Web Speech limitations

- The site has no chat backend, API keys, telemetry, transcript upload or audio recording.
- The transcript lives in memory. Only assistant-triggered cross-page navigation writes up to 12 messages to `sessionStorage`, for at most 30 minutes; it is consumed once on the next page. This allows continued conversation in the same tab. Storage-blocked browsers still work, but may lose the transcript on navigation.
- Browser speech recognition is not universally supported. Standard and `webkit` constructors are feature-detected. HTTPS or localhost is required for microphone operation in supporting browsers.
- Some browsers send audio to their own online recognition service. Voice can therefore require internet even though text answers are local. This is disclosed in the widget before the visitor chooses to use voice.
- Permission denial, unavailable devices, service errors, network failure and silence show clear text fallback states. There is no automatic retry or background listening.
- Speech synthesis depends on installed browser/OS voices and playback policy. Unsupported playback keeps the text answer available.
- This prototype cannot understand arbitrary questions like an LLM. It uses curated knowledge, aliases, matching and limited conversational context.

References: [MDN Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API), [SpeechRecognition compatibility and server-based recognition](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition), [SpeechSynthesis.speak](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/speak).

## Future LLM extension

The provider contract is `answer({message, context: {topic}, signal}) → {text, topic, actions, sources, autoAction}`. `createRemoteProvider` demonstrates a same-origin JSON endpoint. It is not active. A production backend must hold credentials server-side, handle rate limits/privacy and return only registry action IDs. GitHub Pages cannot host that backend itself; use a separately operated same-origin proxy or a hosting architecture with server routes. Never add a model key to HTML, JavaScript, JSON, GitHub Pages configuration exposed to visitors or query parameters.

## Tests

```sh
node --test tests/concierge.test.mjs
python3 scripts/verify-knowledge.py
```

Node 20+ is suitable for the development tests; the site itself is buildless. Voice lifecycle tests use deterministic injected API doubles, without capturing a microphone or playing sound. Real permission prompts, actual microphone transcription, OS voices and speech playback should be checked manually in the browsers/devices you intend to support. Do not infer hardware voice certification from simulated tests.

Manual checklist:

1. First visit: orb stays small; no permission prompt or audio; original navigation works.
2. Open: text input, suggestions and sources work; no microphone or audio starts.
3. Ask all six suggested commands; verify expected answer and owned route.
4. Keyboard: Tab through controls, Enter to send, Shift+Enter for a line break, Escape to close.
5. Voice: explicitly start microphone, allow once, ask a command, then test Stop and denied permission. Ensure audio does not start until spoken replies/Read answer is explicitly selected.
6. Close/hide/navigate while listening or speaking; verify it stops and never restarts automatically.
7. Test unsupported voice, reduced motion, mobile portrait/landscape and virtual keyboard.
8. Test certificate dialog/zoom, back-to-top, email copy, links and resume after integration.
