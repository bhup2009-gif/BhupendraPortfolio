import { resolveAction, safeResponse } from "./routes.mjs";
const KEY = "portfolio-concierge-resume-v1";
export function writeResume(storage, value) {
  try {
    storage.setItem(
      KEY,
      JSON.stringify({
        version: 1,
        expires: Date.now() + 30 * 60 * 1000,
        ...value,
      }),
    );
  } catch {}
}
export function readResume(storage, base) {
  try {
    const value = JSON.parse(storage.getItem(KEY));
    storage.removeItem(KEY);
    if (
      !value ||
      value.version !== 1 ||
      typeof value.expires !== "number" ||
      !Number.isFinite(value.expires) ||
      value.expires < Date.now() ||
      value.expires > Date.now() + 31 * 60 * 1000 ||
      !resolveAction(value.action, base)
    )
      return null;
    return {
      action: value.action,
      topic: typeof value.topic === "string" ? value.topic : null,
      messages: Array.isArray(value.messages)
        ? value.messages
            .filter(
              (m) =>
                m &&
                ["user", "assistant"].includes(m.role) &&
                typeof m.text === "string" &&
                m.text.length <= 3000,
            )
            .slice(-12)
            .map((m) => {
              let response = null;
              try {
                if (m.role === "assistant" && m.response)
                  response = safeResponse({ ...m.response, text: m.text });
              } catch {}
              return {
                role: m.role,
                text: m.text,
                ...(response ? { response } : {}),
              };
            })
        : [],
    };
  } catch {
    return null;
  }
}
export function createNavigator({ base, env = window, onNotice = () => {} }) {
  let timer = null;
  function highlight(id) {
    const action = resolveAction(id, base);
    if (!action) return false;
    const target = action.hash
      ? env.document.getElementById(action.hash)
      : env.document.querySelector("main");
    if (!target) {
      onNotice("This section is not available on the current page.");
      return false;
    }
    env.document
      .querySelectorAll(".portfolio-concierge-highlight")
      .forEach((n) => n.classList.remove("portfolio-concierge-highlight"));
    target.classList.add("portfolio-concierge-highlight");
    target.scrollIntoView({
      behavior: env.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
      block: "start",
    });
    if (action.hash) env.history.replaceState(null, "", "#" + action.hash);
    env.clearTimeout(timer);
    timer = env.setTimeout(
      () => target.classList.remove("portfolio-concierge-highlight"),
      6500,
    );
    onNotice("Highlighted: " + action.label);
    return true;
  }
  return {
    highlight,
    go(id, { messages = [], topic = null } = {}) {
      const action = resolveAction(id, base);
      if (!action) {
        onNotice("Only verified portfolio destinations are allowed.");
        return false;
      }
      const same =
        action.url.pathname === env.location.pathname ||
        (env.location.pathname === new URL(base).pathname &&
          action.page === "index.html");
      if (action.asset) {
        env.open(action.url.href, "_blank", "noopener,noreferrer");
        return true;
      }
      if (same) return highlight(id);
      try {
        writeResume(env.sessionStorage, { action: id, messages, topic });
      } catch {}
      env.location.assign(action.url.href);
      return true;
    },
  };
}
