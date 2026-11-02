(() => {
  'use strict';
  const projects = {
    'projects-kyvos.html': 'Kyvos detailed case study',
    'projects-self-custody-vault.html': 'Ethos Self-Custody Vault'
  };
  const current = location.pathname.split('/').pop();
  const key = 'portfolio-access-once:' + location.pathname;
  let needsEntry = Boolean(projects[current]);
  if (needsEntry) {
    try {
      if (sessionStorage.getItem(key) === 'allowed') {
        sessionStorage.removeItem(key);
        needsEntry = false;
      }
    } catch (_) { /* The code can still be entered on this page. */ }
    if (needsEntry) {
      document.documentElement.classList.add('case-access-pending');
      const cloak = document.createElement('style');
      cloak.textContent = '.case-access-pending body>*:not(.case-access-dialog){display:none!important}';
      document.head.append(cloak);
    }
  }
  const style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = new URL('access-gate.css?v=20261103', document.currentScript.src).href;
  document.head.append(style);
  document.addEventListener('DOMContentLoaded', () => {
    const dialog = document.createElement('dialog');
    dialog.className = 'case-access-dialog';
    dialog.setAttribute('aria-labelledby', 'case-access-title');
    dialog.setAttribute('aria-describedby', 'case-access-description');
    dialog.innerHTML = `<form class="case-access-form" novalidate>
      <button type="button" class="case-access-close" aria-label="Close access code popup">×</button>
      <p class="case-access-kicker">CASE STUDY ACCESS</p>
      <h2 id="case-access-title">Enter access code</h2>
      <p id="case-access-description">Enter your code to view <span class="case-access-project"></span>.</p>
      <label for="case-access-code">Access code</label>
      <input id="case-access-code" name="access-code" type="password" autocomplete="off" autocapitalize="none" spellcheck="false" required aria-describedby="case-access-error">
      <p id="case-access-error" class="case-access-error" role="alert"></p>
      <button class="case-access-submit" type="submit">View case study <span aria-hidden="true">↗</span></button>
      <div class="case-access-contact"><p>Need an access code? Ask Bhupendra.</p>
      <a href="https://www.linkedin.com/in/bhupendra-rathore-b4b64588/" target="_blank" rel="noopener noreferrer">Request on LinkedIn ↗</a>
      <a href="mailto:bhup2009@gmail.com?subject=Portfolio%20case%20study%20access">bhup2009@gmail.com</a></div>
    </form>`;
    document.body.append(dialog);
    const input = dialog.querySelector('input');
    const error = dialog.querySelector('.case-access-error');
    let destination;
    let entryPage = false;
    let returnFocus;
    function open(url, name, direct = false, trigger = null) {
      destination = url;
      entryPage = direct;
      returnFocus = trigger;
      dialog.querySelector('.case-access-project').textContent = name;
      input.value = '';
      input.removeAttribute('aria-invalid');
      error.textContent = '';
      dialog.showModal();
      input.focus();
    }
    function dismiss() {
      if (entryPage) {
        location.replace(new URL('index.html#case-studies', location.href));
      } else {
        dialog.close();
        returnFocus?.focus();
      }
    }
    dialog.querySelector('.case-access-close').addEventListener('click', dismiss);
    dialog.addEventListener('cancel', event => { event.preventDefault(); dismiss(); });
    dialog.addEventListener('click', event => { if (event.target === dialog) dismiss(); });
    input.addEventListener('input', () => {
      error.textContent = '';
      input.removeAttribute('aria-invalid');
    });
    dialog.querySelector('form').addEventListener('submit', event => {
      event.preventDefault();
      if (input.value.trim() !== 'INSIDEUX') {
        error.textContent = 'That code is incorrect. Try again or request access below.';
        input.setAttribute('aria-invalid', 'true');
        input.focus();
        input.select();
        return;
      }
      if (entryPage) {
        document.documentElement.classList.remove('case-access-pending');
        needsEntry = false;
        entryPage = false;
        dialog.close();
        return;
      }
      const target = new URL(destination, location.href);
      if (target.origin === location.origin && projects[target.pathname.split('/').pop()]) {
        try { sessionStorage.setItem('portfolio-access-once:' + target.pathname, 'allowed'); } catch (_) {}
      }
      location.assign(target.href);
    });
    document.addEventListener('click', event => {
      const link = event.target.closest('a[href]');
      if (!link || link.hasAttribute('download')) return;
      const url = new URL(link.href, location.href);
      const page = url.pathname.split('/').pop();
      const cafe = url.hostname === 'cafeos-from-idea-to-launch.blitheelf66.chatgpt.site';
      const local = url.origin === location.origin && projects[page] && page !== current;
      if (!cafe && !local) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      open(url.href, cafe ? 'CaféOS' : projects[page], false, link);
    }, true);
    if (needsEntry) open(location.href, projects[current], true);
  });
})();
