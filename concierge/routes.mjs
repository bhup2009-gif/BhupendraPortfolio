// Only these owned routes/anchors can be used by local or future model actions.
export const ACTIONS = Object.freeze({
  home: { page: "index.html", hash: "main", label: "Portfolio home" },
  projects: {
    page: "index.html",
    hash: "case-studies",
    label: "Explore selected projects",
  },
  experience: {
    page: "about-me.html",
    hash: "experience",
    label: "View professional experience",
  },
  about: { page: "about-me.html", hash: "main", label: "About Bhupendra" },
  skills: {
    page: "about-me.html",
    hash: "capabilities",
    label: "Explore skills & tools",
  },
  ai: { page: "index.html", hash: "ai-lab", label: "Explore AI lab" },
  education: {
    page: "about-me.html",
    hash: "iit-delhi",
    label: "View IIT Delhi learning",
  },
  contact: {
    page: "index.html",
    hash: "contact",
    label: "Go to contact details",
  },
  kyvos: {
    page: "projects-kyvos.html",
    hash: "top",
    label: "Explore Kyvos case study",
  },
  leadership: {
    page: "projects-kyvos.html",
    hash: "s09",
    label: "See cross-functional leadership",
  },
  kyvosUX: {
    page: "projects-kyvos.html",
    hash: "s03",
    label: "Read the Kyvos UX approach",
  },
  kyvosOutcomes: {
    page: "projects-kyvos.html",
    hash: "s10",
    label: "Read outcomes & evidence",
  },
  txt2create: {
    page: "projects-txt2create.html",
    hash: "main",
    label: "Explore TXT2Create",
  },
  talkbar: {
    page: "projects-talkbar.html",
    hash: "main",
    label: "Explore Talkbar",
  },
  ethos: {
    page: "projects-self-custody-vault.html",
    hash: "main",
    label: "Explore Ethos wallet",
  },
  alfred: {
    page: "projects-alfred.html",
    hash: "main",
    label: "Explore Alfred",
  },
  beta: {
    page: "projects-beta-24.html",
    hash: "main",
    label: "Explore Beta 24",
  },
  family: {
    page: "projects-family-tree.html",
    hash: "main",
    label: "Explore Family Tree",
  },
  smartHome: {
    page: "projects-smart-home.html",
    hash: "main",
    label: "Explore Smart Home",
  },
  meditation: {
    page: "projects-meditation.html",
    hash: "main",
    label: "Explore High Vibe Affirmations",
  },
  enterprise: {
    page: "projects-enterprise.html",
    hash: "main",
    label: "Explore enterprise work",
  },
  cafeos: {
    page: "index.html",
    hash: "project-cafeos",
    label: "Highlight the CaféOS project",
  },
  htmlFigma: {
    page: "index.html",
    hash: "tool-html-figma",
    label: "Explore HTML → Figma",
  },
  expenses: {
    page: "index.html",
    hash: "tool-expenses",
    label: "Explore Expense Tracker",
  },
  contentAnalysis: {
    page: "index.html",
    hash: "tool-content-analysis",
    label: "Explore Content Analysis",
  },
  designAudit: {
    page: "index.html",
    hash: "tool-design-audit",
    label: "Explore Design Audit",
  },
  webCapture: {
    page: "index.html",
    hash: "tool-webpage-capture",
    label: "Explore Webpage Capture",
  },
  resume: {
    page: "Bhupendra_Rathore_Resume.pdf",
    hash: "",
    label: "Open published resume",
    asset: true,
  },
});
export function resolveAction(id, base) {
  if (typeof id !== "string" || !Object.hasOwn(ACTIONS, id)) return null;
  try {
    const root = new URL(base),
      action = ACTIONS[id],
      url = new URL(action.page, root);
    if (
      !["https:", "http:"].includes(root.protocol) ||
      url.origin !== root.origin ||
      !url.pathname.startsWith(root.pathname) ||
      root.search ||
      root.hash
    )
      return null;
    url.hash = action.hash;
    return { ...action, id, url };
  } catch {
    return null;
  }
}
export const hasNavigationIntent = (text) =>
  /\b(show|open|take me|go to|navigate|scroll|highlight|view|see|bring me)\b/i.test(
    text,
  );
export function safeResponse(value) {
  if (
    !value ||
    typeof value.text !== "string" ||
    !value.text.trim() ||
    value.text.length > 3000
  )
    throw Error("Invalid assistant response");
  const valid = (id) => typeof id === "string" && Object.hasOwn(ACTIONS, id);
  return {
    text: value.text.trim(),
    topic: valid(value.topic) ? value.topic : null,
    actions: Array.isArray(value.actions)
      ? [...new Set(value.actions.filter(valid))].slice(0, 4)
      : [],
    sources: Array.isArray(value.sources)
      ? [...new Set(value.sources.filter(valid))].slice(0, 3)
      : [],
    autoAction: valid(value.autoAction) ? value.autoAction : null,
  };
}
