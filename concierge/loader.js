/* Portfolio AI Concierge: lightweight shell; knowledge, speech and chat load on open. */
(() => {
  if (document.getElementById("portfolio-ai-concierge")) return;
  const assetBase = new URL(".", document.currentScript.src);
  const base = new URL("../", assetBase);
  const host = document.createElement("div");
  host.id = "portfolio-ai-concierge";
  const shadow = host.attachShadow({ mode: "open" });
  shadow.innerHTML = `<style>
  :host{all:initial;position:fixed;right:max(20px,env(safe-area-inset-right));bottom:max(20px,env(safe-area-inset-bottom));width:56px;height:56px;z-index:80;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif;color:#17212a;color-scheme:light}
  *,*::before,*::after{box-sizing:border-box}button{font:inherit;cursor:pointer}button:focus-visible{outline:3px solid #2467db;outline-offset:5px}.launcher{border:1px solid #ffffffb8;background:linear-gradient(150deg,#fafaff,#e8edf4);width:56px;height:56px;display:grid;place-items:center;border-radius:50%;padding:4px;box-shadow:0 5px 24px #273d5a30,0 0 0 1px #cbd5e34d;position:relative}.orb{display:block;position:relative;width:46px;height:46px;border-radius:50%;overflow:hidden;background:#163d6b;isolation:isolate;box-shadow:inset 0 0 12px #ffffff90}.orb::before{content:"";position:absolute;inset:-50%;background:conic-gradient(from 30deg,#24c3de,#6a61ef,#d685e3,#5da8fb,#4be9c3,#2c86d3,#c6a0fb,#24c3de);filter:blur(7px);animation:concierge-flow 12s linear infinite}.orb::after{content:"";position:absolute;inset:0;border-radius:50%;background:radial-gradient(ellipse at 30% 15%,#ffffffc7,transparent 49%),radial-gradient(ellipse at 70% 90%,#102e7770,transparent 60%);box-shadow:inset 0 0 0 1px #ffffff90}.orb-mark{position:absolute;inset:0;display:grid;place-items:center;color:white;font-size:24px;z-index:1;text-shadow:0 1px 10px #35559e66}.launcher-label{position:absolute;right:0;bottom:66px;opacity:0;white-space:nowrap;background:#ffffffeb;color:#3d4756;border:1px solid #e6e8ed;border-radius:20px;padding:7px 12px;font-size:11px;box-shadow:0 3px 12px #1e35580b;pointer-events:none}.launcher:hover .launcher-label,.launcher:focus-visible .launcher-label{opacity:1}.launcher[aria-expanded=true] .launcher-label{display:none}.launcher[data-state=listening]{box-shadow:0 0 0 5px #44c8b933,0 5px 24px #273d5a30}.launcher[data-state=listening] .orb::before{animation-duration:2.5s}.launcher[data-state=thinking] .orb::before{animation-duration:1.8s}.launcher[data-state=speaking] .orb{animation:concierge-breathe 1.5s ease-in-out infinite}.launcher[data-state=error]{box-shadow:0 0 0 3px #db896e55}.shell-error{position:absolute;bottom:70px;right:0;width:250px;padding:12px;border:1px solid #e2d0c9;border-radius:12px;background:#fff9f5;color:#744b3d;font-size:12px;line-height:1.6;box-shadow:0 8px 30px #0001}.shell-error[hidden]{display:none}@keyframes concierge-flow{to{transform:rotate(360deg)}}@keyframes concierge-breathe{50%{transform:scale(.91)}}@media(max-width:600px){:host{right:max(14px,env(safe-area-inset-right));bottom:max(14px,env(safe-area-inset-bottom))}.launcher-label{display:none}}@media(prefers-reduced-motion:reduce){.orb,.orb::before{animation:none!important}}:host([data-paused]) .orb,:host([data-paused]) .orb::before{animation-play-state:paused!important}
  </style><button class="launcher" type="button" aria-label="Open portfolio assistant" aria-haspopup="dialog" aria-expanded="false" aria-controls="concierge-panel" data-state="idle"><span class="orb" aria-hidden="true"><span class="orb-mark">✦</span></span><span class="launcher-label">Ask Bhupendra</span></button><div class="shell-error" role="alert" hidden></div>`;
  document.body.append(host);
  const globalStyle = document.createElement("style");
  globalStyle.textContent = `html.portfolio-concierge-available .back-top{right:94px}.portfolio-concierge-highlight{outline:3px solid #69a6e5!important;outline-offset:8px!important;box-shadow:0 0 0 12px #69a6e516;border-radius:8px;scroll-margin-top:110px}@media(max-width:600px){html.portfolio-concierge-available .back-top{right:86px}}@media print{#portfolio-ai-concierge{display:none!important}.portfolio-concierge-highlight{outline:none!important;box-shadow:none!important}}`;
  document.head.append(globalStyle);
  document.documentElement.classList.add("portfolio-concierge-available");
  const launcher = shadow.querySelector(".launcher"),
    error = shadow.querySelector(".shell-error");
  let widget = null,
    loading = false;
  async function open() {
    if (widget) {
      widget.toggle();
      return;
    }
    if (loading) return;
    loading = true;
    error.hidden = true;
    launcher.dataset.state = "thinking";
    launcher.setAttribute("aria-busy", "true");
    try {
      const module = await import(new URL("widget.mjs", assetBase).href);
      widget = await module.mount({ shadow, launcher, assetBase, base });
      widget.open();
    } catch {
      launcher.dataset.state = "error";
      error.textContent =
        "The guide could not load. Check your connection, then tap the orb to retry. Your portfolio still works normally.";
      error.hidden = false;
    } finally {
      loading = false;
      launcher.removeAttribute("aria-busy");
    }
  }
  launcher.addEventListener("click", open);
  document.addEventListener("visibilitychange", () =>
    host.toggleAttribute("data-paused", document.hidden),
  );
  // Resume only a conversation the visitor already opened and used for navigation.
  try {
    const pending = JSON.parse(
      sessionStorage.getItem("portfolio-concierge-resume-v1"),
    );
    if (
      pending?.version === 1 &&
      pending.expires > Date.now() &&
      pending.expires < Date.now() + 31 * 60 * 1000 &&
      typeof pending.action === "string"
    )
      open();
  } catch {}
})();
