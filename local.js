const toast = document.querySelector('#toast');
let toastTimeout;
const notify = (message) => {
  clearTimeout(toastTimeout);
  toast.textContent = message;
  toast.classList.add('visible');
  toastTimeout = setTimeout(() => toast.classList.remove('visible'), 2400);
};
document.querySelectorAll('[data-copy-email]').forEach((button) => {
  button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText('bhup2009@gmail.com');
      notify('Email copied — bhup2009@gmail.com');
    } catch {
      notify('Email me at bhup2009@gmail.com');
    }
  });
});
const scrollBehavior = () => matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth';
const scrollToSection = (hash) => {
  let target;
  try {
    target = document.getElementById(decodeURIComponent(hash.slice(1)));
  } catch {
    return false;
  }
  if (!target) return false;
  target.scrollIntoView({ behavior: scrollBehavior(), block: 'start' });
  if (location.hash !== hash) history.pushState(null, '', hash);
  return true;
};

document.querySelectorAll('a[href]').forEach((link) => {
  const destination = new URL(link.href, location.href);
  if (destination.origin !== location.origin || !destination.hash || link.target === '_blank') return;
  link.addEventListener('click', (event) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.hasAttribute('download')) return;
    if (destination.pathname === location.pathname && destination.search === location.search) {
      if (scrollToSection(destination.hash)) event.preventDefault();
      return;
    }
    try {
      sessionStorage.setItem('portfolio-scroll', JSON.stringify({ path: destination.pathname + destination.search, hash: destination.hash }));
    } catch {
      return;
    }
    event.preventDefault();
    location.assign(destination.pathname + destination.search);
  });
});

try {
  const pendingScroll = JSON.parse(sessionStorage.getItem('portfolio-scroll'));
  sessionStorage.removeItem('portfolio-scroll');
  if (pendingScroll?.path === location.pathname + location.search) {
    window.addEventListener('load', () => requestAnimationFrame(() => scrollToSection(pendingScroll.hash)), { once: true });
  }
} catch {}

document.querySelector('.back-top').addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: scrollBehavior() });
});

// Sparse background dots respond only to a fine pointer; no animation loop.
const minimalHero = document.querySelector('.minimal-hero');
if (minimalHero) {
  const field = minimalHero.querySelector('.hero-particles');
  const pointerMotion = matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
  const dots = Array.from({ length: 30 }, (_, index) => {
    const dot = document.createElement('span');
    dot.className = 'hero-particle';
    // Deterministic, irregular distribution keeps the field stable across visits.
    const x = ((index * 37 + 11) % 97) + 1;
    const y = ((index * 53 + 7) % 89) + 5;
    dot.style.left = `${x}%`;
    dot.style.top = `${y}%`;
    field.append(dot);
    return { dot, x, y };
  });
  const cursor = document.createElement('span');
  cursor.className = 'hero-cursor';
  field.append(cursor);
  let pointerFrame = 0;
  let pointerX = 0;
  let pointerY = 0;
  const resetParticles = () => {
    minimalHero.classList.remove('is-pointer-active');
    cancelAnimationFrame(pointerFrame);
    pointerFrame = 0;
    dots.forEach(({ dot }) => { dot.style.transform = ''; });
  };
  minimalHero.addEventListener('pointermove', (event) => {
    if (!pointerMotion.matches || event.pointerType === 'touch') return;
    const bounds = minimalHero.getBoundingClientRect();
    minimalHero.classList.add('is-pointer-active');
    pointerX = event.clientX - bounds.left;
    pointerY = event.clientY - bounds.top;
    if (pointerFrame) return;
    pointerFrame = requestAnimationFrame(() => {
      pointerFrame = 0;
      const fieldBounds = field.getBoundingClientRect();
      cursor.style.transform = `translate(${pointerX + bounds.left - fieldBounds.left}px, ${pointerY + bounds.top - fieldBounds.top}px)`;
      dots.forEach(({ dot, x, y }) => {
        const dx = pointerX - (fieldBounds.width * x / 100 + fieldBounds.left - bounds.left);
        const dy = pointerY - (fieldBounds.height * y / 100 + fieldBounds.top - bounds.top);
        const influence = Math.max(0, 1 - Math.hypot(dx, dy) / 380);
        dot.style.transform = `translate(${(dx * influence * .35).toFixed(2)}px, ${(dy * influence * .35).toFixed(2)}px)`;
      });
    });
  }, { passive: true });
  minimalHero.addEventListener('pointerleave', resetParticles);
  pointerMotion.addEventListener('change', resetParticles);
}

const certificateDialog = document.querySelector('#certificate-dialog');
if (certificateDialog) {
  const certificateTrigger = document.querySelector('.certificate-view');
  certificateTrigger.addEventListener('click', () => certificateDialog.showModal());
  certificateDialog.querySelector('.certificate-close').addEventListener('click', () => certificateDialog.close());
  certificateDialog.addEventListener('click', (event) => {
    if (event.target !== certificateDialog) return;
    const bounds = certificateDialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) certificateDialog.close();
  });
  certificateDialog.addEventListener('close', () => certificateTrigger.focus({ preventScroll: true }));
}

if (certificateDialog) {
  const zoomButton = certificateDialog.querySelector('.certificate-zoom');
  const resetCertificateZoom = () => {
    certificateDialog.classList.remove('is-zoomed');
    zoomButton.setAttribute('aria-pressed', 'false');
    zoomButton.innerHTML = 'Zoom in <span aria-hidden="true">＋</span>';
  };
  zoomButton.addEventListener('click', () => {
    const zoomed = certificateDialog.classList.toggle('is-zoomed');
    zoomButton.setAttribute('aria-pressed', String(zoomed));
    zoomButton.innerHTML = zoomed ? 'Fit to screen <span aria-hidden="true">−</span>' : 'Zoom in <span aria-hidden="true">＋</span>';
  });
  certificateDialog.addEventListener('close', resetCertificateZoom);
}

// Small gestures for the coffee-time experiments.
(() => {
  const universe = document.querySelector('.coffee-universe');
  if (!universe) return;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  universe.querySelectorAll('article.creation').forEach(card => {
    card.addEventListener('pointermove', event => {
      if (reducedMotion.matches || event.pointerType !== 'mouse') return;
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--tilt-y', `${((event.clientX - rect.left) / rect.width - .5) * 5}deg`);
      card.style.setProperty('--tilt-x', `${((event.clientY - rect.top) / rect.height - .5) * -5}deg`);
    });
    card.addEventListener('pointerleave', () => {
      card.style.removeProperty('--tilt-x');
      card.style.removeProperty('--tilt-y');
    });
  });
  let resetBrew;
  universe.querySelector('.coffee-brew')?.addEventListener('click', () => {
    clearTimeout(resetBrew);
    universe.classList.remove('is-brewing');
    void universe.offsetWidth;
    universe.classList.add('is-brewing');
    universe.querySelector('.brew-status').textContent = 'Freshly brewed. What if…?';
    resetBrew = setTimeout(() => {
      universe.classList.remove('is-brewing');
      universe.querySelector('.brew-status').textContent = 'A little caffeine. A lot of curiosity.';
    }, 2400);
  });
})();
