import { ACTIONS, hasNavigationIntent, safeResponse } from "./routes.mjs";
export const normalise = (text) =>
  String(text)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
const stop = new Set(
  "a an and are as at be by can do for from has have he her him his how i in is it me my of on or our please tell than that the their them there these this to us was we were what when which who why will with would you your about".split(
    " ",
  ),
);
const words = (s) =>
  normalise(s)
    .split(" ")
    .filter((w) => w.length > 1 && !stop.has(w));
const suggestion =
  "Try “Tell me about your experience”, “Show your best UX case study”, “What is TXT2Create?” or “How can I contact you?”";
function fromRecord(record, message) {
  const nav = hasNavigationIntent(message);
  return safeResponse({
    text: record.answer,
    topic: record.id,
    actions: record.actions,
    sources: record.actions.filter((id) => !ACTIONS[id]?.asset).slice(0, 2),
    autoAction: nav ? record.actions[0] : null,
  });
}
export function createLocalProvider(knowledge) {
  if (
    !knowledge ||
    knowledge.version !== 1 ||
    !Array.isArray(knowledge.records)
  )
    throw Error("The portfolio knowledge could not be loaded.");
  const records = knowledge.records,
    byId = new Map(records.map((r) => [r.id, r]));
  return {
    kind: "local",
    async answer({ message, context = {}, signal } = {}) {
      if (signal?.aborted) throw new DOMException("Cancelled", "AbortError");
      if (typeof message !== "string" || !message.trim())
        throw Error("Type a question first.");
      if (message.length > 600)
        throw Error("Keep your question under 600 characters.");
      const q = normalise(message);
      if (
        /(?:javascript:|data:|vbscript:|\.\.\/|https?:\/\/|\/\/)/i.test(
          message,
        ) &&
        hasNavigationIntent(message)
      )
        return safeResponse({
          text: "I can only navigate known pages and sections in this portfolio. Choose one of the verified destinations below.",
          actions: ["projects", "about"],
          sources: [],
          topic: null,
        });
      if (
        /\b(salary|compensation|phone number|mobile number|home address|date of birth|marital|availability|available to join|notice period|expected ctc|current ctc|private|password|api key|ignore instructions)\b/.test(
          q,
        )
      )
        return safeResponse({
          text: "That information is not verified in my portfolio knowledge. For availability, compensation or other personal details, please contact Bhupendra directly at bhup2009@gmail.com.",
          actions: ["contact"],
          sources: ["contact"],
          topic: null,
        });
      if (/^(hi|hey|hello|good morning|good evening|help)( there)?$/.test(q))
        return safeResponse({
          text:
            "Hi! I’m Bhupendra’s portfolio guide. I can help you explore his experience, UX case studies, AI work, skills and contact details. " +
            suggestion,
          actions: ["experience", "kyvos", "txt2create"],
          sources: [],
          topic: null,
        });
      if (/^(thank you|thanks|great|perfect|nice|ok|okay)$/.test(q))
        return safeResponse({
          text: "You’re welcome. Would you like to explore a case study, his leadership work or contact details?",
          actions: ["kyvos", "leadership", "contact"],
          sources: [],
          topic: context.topic,
        });
      if (
        /^(tell me more|more|more about (it|this|that)|what was (your|his) role|what was (your|his) contribution|show (it|this|that)|open (it|this|that)|take me there|go there)$/.test(
          q,
        ) &&
        byId.has(context.topic)
      )
        return fromRecord(byId.get(context.topic), message);
      if (
        /\b(results|outcomes|metrics|impact|conversion|roi|retention|numbers)\b/.test(
          q,
        ) &&
        (/\bkyvos\b/.test(q) ||
          context.topic === "kyvos" ||
          context.topic === "leadership")
      )
        return safeResponse({
          text: "The Kyvos case study documents contribution-level outcomes: clearer website structure, product storytelling, consistent visual patterns and cross-functional execution. It explicitly says engagement, conversion and CTR uplift have not been independently established. I won’t invent numerical results.",
          topic: "kyvos",
          actions: ["kyvosOutcomes", "kyvos"],
          sources: ["kyvosOutcomes"],
          autoAction: hasNavigationIntent(message) ? "kyvosOutcomes" : null,
        });
      if (/\b(resume|cv)\b/.test(q) && hasNavigationIntent(message))
        return safeResponse({
          text: "The published resume is available below. Open it to view the PDF in a new tab.",
          topic: "experience",
          actions: ["resume", "experience"],
          sources: ["experience"],
        });
      if (/\b(cafeos|cafe os)\b/.test(q))
        return fromRecord(byId.get("cafeos"), message);
      if (
        /\b(best|featured|strongest)\b.*\b(case|ux|work|project)\b|\bux case study\b/.test(
          q,
        )
      )
        return fromRecord(byId.get("kyvos"), message);
      const scored = records
        .map((r) => {
          let score = 0;
          for (const alias of r.aliases) {
            const a = normalise(alias);
            if ((" " + q + " ").includes(" " + a + " "))
              score = Math.max(score, 6 + a.split(" ").length * 4);
          }
          const queryWords = words(q),
            haystack = words(
              r.title + " " + r.aliases.join(" ") + " " + r.answer,
            );
          for (const word of new Set(queryWords)) {
            if (haystack.includes(word)) score += 1.5;
          }
          if (
            queryWords.length &&
            queryWords.every((w) => haystack.includes(w))
          )
            score += 2;
          return { r, score };
        })
        .sort((a, b) => b.score - a.score);
      if (scored[0]?.score >= 6) return fromRecord(scored[0].r, message);
      if (/\b(projects|portfolio|work samples|case studies)\b/.test(q))
        return safeResponse({
          text: "The featured work includes Kyvos for enterprise UX and brand experience, TXT2Create for 0-to-1 AI product delivery, Talkbar for conversational AI, Ethos and Alfred for fintech, and CaféOS for a café POS. There are also mobility, wellness, connected-home and family-relationship explorations.",
          topic: "kyvos",
          actions: ["projects", "kyvos", "txt2create", "cafeos"],
          sources: ["projects"],
          autoAction: hasNavigationIntent(message) ? "projects" : null,
        });
      return safeResponse({
        text:
          "I don’t have a verified answer to that in the published portfolio. I’m a free local knowledge guide, not a general-purpose AI model. " +
          suggestion,
        actions: ["experience", "kyvos", "contact"],
        sources: [],
        topic: null,
      });
    },
  };
}
// Extension seam only. No remote provider is enabled in the free prototype.
// A future server owns model credentials; this browser receives only validated text/action IDs.
export function createRemoteProvider({ endpoint, origin, fetchImpl = fetch }) {
  const url = new URL(endpoint, origin);
  if (
    url.origin !== new URL(origin).origin ||
    !["https:", "http:"].includes(url.protocol)
  )
    throw Error("The future assistant endpoint must be same-origin.");
  return {
    kind: "remote",
    async answer({ message, context, signal }) {
      const r = await fetchImpl(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          context: { topic: context?.topic || null },
        }),
        signal,
        credentials: "same-origin",
      });
      if (!r.ok) throw Error("The assistant service is unavailable.");
      const answer = safeResponse(await r.json());
      if (!hasNavigationIntent(message)) answer.autoAction = null;
      return answer;
    },
  };
}
