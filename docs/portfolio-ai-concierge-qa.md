# Portfolio AI Concierge — validation

Reviewed 26 October 2026 against the existing buildless portfolio.

## Automated checks

- 24 Node tests cover the six requested intents, follow-ups, honest unknown/private-information fallback, qualified metrics, all safe routes and anchors, all 12 HTML integrations, provider response validation, bounded navigation recovery, and speech lifecycle/error behavior.
- Knowledge verification passes for 23 records across 12 source pages. Evidence excerpts and semantic fingerprints detect stale source copy.
- Voice tests use injected browser API doubles; they do not capture a microphone or play audio.

## Browser checks completed

Using the local server under the real `/BhupendraPortfolio/` project subpath:

- First visit fetches only the deferred launcher. Widget modules, CSS and knowledge load after opening.
- TXT2Create text question returns the sourced answer.
- Best UX case-study command opens the Kyvos page and restores the conversation.
- Leadership command scrolls to and highlights Kyvos section `s09`.
- External-URL navigation request is refused without changing the page.
- HTML-like input is rendered as text, without creating an image or executing markup.
- Escape closes the panel. Microphone and spoken replies remain off by default.
- Phone viewport 390 × 844: document width 375 px, panel left 14 px and right 361 px; no assistant-induced horizontal overflow. Input, send, close and voice controls remain visible. The existing back-to-top control is separated from the orb.
- Existing HTML, shared CSS and shared JavaScript changes are limited to integration script tags and stable IDs; original page scripts/styles are preserved.

## Remaining device checks

Actual microphone permission prompts, transcription quality, OS voice playback, mobile virtual-keyboard behavior, screen-reader announcements and browser-specific Web Speech support require manual device checks. No hardware voice certification or quantitative performance score is claimed. See the setup guide for the manual checklist.
