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
