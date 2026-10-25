# Portfolio AI Concierge — implementation plan

## Source inspection

Inspected the public GitHub Pages site and cloned `bhup2009-gif/BhupendraPortfolio` at `f113cb5`. It is a buildless static HTML/CSS/vanilla-JS portfolio. Twelve HTML pages include the homepage, about page and ten project pages. Shared styling/interactions live in local.css/local.js; Kyvos has independent inline styles and script. Existing interactions include anchor scrolling, email copy, back-to-top, responsive navigation, certificate dialog/zoom, hero pointer effects and coffee experiments.

Published sources contain the requested professional background, TXT2Create, Talkbar, enterprise leadership, Kyvos, skills, education, portfolio projects and public contact links. CafeOS currently links to an external private case-study site; the concierge should highlight its existing homepage card, rather than automatically navigate away from the portfolio origin.

## Implementation

1. Add a lightweight, deferred loader to every existing page. Create the compact bottom-right CSS orb inside an isolated Shadow DOM. Move the existing back-to-top control alongside it without altering that control's behavior.
2. On first deliberate open, load widget code, styles, structured knowledge and a local answer provider. Preserve zero-build GitHub Pages compatibility and project-subdirectory URLs.
3. Provide sourced text responses, contextual follow-ups, suggestions, transcript, clear conversation action and an explicit local-knowledge label. Never invent unsupported personal details or outcome metrics.
4. Restrict action IDs to a curated route/anchor registry. Scroll/highlight existing content, navigate known pages and resume a short-lived tab conversation across assistant-triggered navigation. Never accept a model/user-provided URL as a navigation instruction.
5. Add opt-in speech recognition and speech synthesis behind explicit visitor controls. Use one utterance per microphone action; stop on close/navigation/hidden page, handle browser/permission/network/no-speech states and keep text usable. No microphone or audio on load/open.
6. Support idle/listening/thinking/speaking/error feedback, mobile safe areas, keyboard/Escape behavior, reduced motion, labelled controls and polite live announcements.
7. Provide an unused, validated provider interface for future same-origin LLM integration, with no frontend keys.
8. Validate knowledge provenance, route safety, intent matching, voice lifecycle/error handling and markup integration with automated tests. Test actual text/navigation/mobile/keyboard interactions in the browser. Report real-device voice limits honestly.

## Delivery

Commit the integrated changes on the feature branch, with source audit, local setup, test results and manual voice checklist. Attempt GitHub delivery using existing authorized credentials only; never request, expose or embed tokens. If repository write access is unavailable, provide the complete integration and a portable patch/package, clearly stating that the public site has not changed.

## Implementation status

Implemented in `concierge/` with 23 reviewed knowledge records, curated route actions, Shadow DOM UI isolation, lazy module/style/knowledge loading, explicit voice controls, short-lived navigation recovery and a future validated provider seam. Original shared CSS/JS and Kyvos content/styles remain unchanged. Source edits to the existing HTML are the deferred loader tag and stable homepage anchors only.
