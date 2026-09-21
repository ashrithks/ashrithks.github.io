(() => {
  const root = document.documentElement;
  const preference = window.matchMedia('(prefers-color-scheme: dark)');
  const appearance = document.querySelector('.appearance');
  const appearanceToggle = document.querySelector('.appearance-toggle');
  const appearancePanel = document.querySelector('.appearance-panel');
  const defaults = { palette: 'paper', font: 'modern', mode: 'system' };
  const allowed = {
    palette: ['paper', 'ocean', 'forest', 'plum'],
    font: ['modern', 'editorial', 'mono'],
    mode: ['light', 'dark', 'system'],
  };
  const storageKeys = { palette: 'aks-palette', font: 'aks-font', mode: 'aks-theme' };
  const settings = { ...defaults };
  Object.keys(settings).forEach(key => {
    try {
      const value = localStorage.getItem(storageKeys[key]);
      if (allowed[key].includes(value)) settings[key] = value;
    } catch { /* Appearance controls also work without browser storage. */ }
  });
  const applyAppearance = () => {
    root.dataset.palette = settings.palette;
    root.dataset.font = settings.font;
    root.dataset.theme = settings.mode === 'system' ? (preference.matches ? 'dark' : 'light') : settings.mode;
    appearancePanel.querySelectorAll('input[type="radio"]').forEach(input => {
      input.checked = settings[input.name] === input.value;
    });
    document.querySelector('meta[name="theme-color"]').content = getComputedStyle(root).getPropertyValue('--paper').trim();
  };
  const saveAppearance = () => {
    Object.keys(settings).forEach(key => {
      try { localStorage.setItem(storageKeys[key], settings[key]); } catch { /* Keep the session choice. */ }
    });
  };
  const closeAppearance = (returnFocus = false) => {
    appearancePanel.hidden = true;
    appearanceToggle.setAttribute('aria-expanded', 'false');
    if (returnFocus) appearanceToggle.focus();
  };
  appearanceToggle.addEventListener('click', () => {
    if (!appearancePanel.hidden) {
      closeAppearance();
      return;
    }
    closeMenu();
    appearancePanel.hidden = false;
    appearanceToggle.setAttribute('aria-expanded', 'true');
    appearancePanel.querySelector('input[name="palette"]:checked').focus();
  });
  document.querySelector('.appearance-close').addEventListener('click', () => closeAppearance(true));
  appearancePanel.addEventListener('change', event => {
    const { name, value } = event.target;
    if (!Object.hasOwn(allowed, name) || !allowed[name].includes(value)) return;
    settings[name] = value;
    applyAppearance();
    saveAppearance();
  });
  document.querySelector('.appearance-reset').addEventListener('click', () => {
    Object.assign(settings, defaults);
    applyAppearance();
    saveAppearance();
  });
  document.addEventListener('pointerdown', event => {
    if (!appearance.contains(event.target)) closeAppearance();
  });
  appearance.addEventListener('focusout', event => {
    if (event.relatedTarget && !appearance.contains(event.relatedTarget)) closeAppearance();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !appearancePanel.hidden) {
      event.preventDefault();
      closeAppearance(true);
    }
  });
  preference.addEventListener('change', () => {
    if (settings.mode === 'system') applyAppearance();
  });
  applyAppearance();
  appearance.hidden = false;
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.navigation');
  menuToggle.hidden = false;
  root.classList.add('js');
  const closeMenu = () => {
    menuToggle.setAttribute('aria-expanded', 'false');
    nav.classList.remove('is-open');
  };
  menuToggle.addEventListener('click', () => {
    closeAppearance();
    const isOpen = menuToggle.getAttribute('aria-expanded') !== 'true';
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    nav.classList.toggle('is-open', isOpen);
  });
  nav.addEventListener('click', (event) => { if (event.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      menuToggle.focus();
    }
  });
  window.matchMedia('(min-width: 961px)').addEventListener('change', closeMenu);
  document.querySelector('#year').textContent = new Date().getFullYear();
  // Expand the relevant role when a work card links directly to it.
  const openExperience = () => {
    if (!location.hash) return;
    const target = document.getElementById(location.hash.slice(1));
    if (target?.classList.contains('experience-row')) target.querySelector('details').open = true;
  };
  window.addEventListener('hashchange', openExperience);
  openExperience();

  // Animate only visible elements: nothing relies on JavaScript to become readable.
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const motionToggle = document.querySelector('.motion-toggle');
  const motionLabel = document.querySelector('.motion-label');
  const motionIndicator = document.querySelector('.motion-indicator');
  let userPaused = false;
  try { userPaused = localStorage.getItem('aks-motion-paused') === 'true'; } catch { /* Motion remains optional. */ }
  const motionIsEnabled = () => !motionPreference.matches && !userPaused;
  const updateMotionControl = () => {
    const enabled = motionIsEnabled();
    root.dataset.motion = enabled ? 'running' : 'paused';
    motionToggle.hidden = false;
    motionToggle.disabled = motionPreference.matches;
    motionToggle.setAttribute('aria-pressed', String(!enabled));
    motionLabel.textContent = motionPreference.matches ? 'Reduced motion' : enabled ? 'Pause animations' : 'Play animations';
    motionIndicator.textContent = enabled ? 'Ⅱ' : '▷';
  };
  document.querySelectorAll('.expertise-stack li').forEach((skill, index) => {
    skill.style.setProperty('--skill-index', index % 7);
  });
  const activeAnimations = new Set();
  const revealed = new WeakSet();
  const revealedGroups = new WeakSet();
  const groups = new Map();
  let revealObserver;
  let introPlayed = false;
  const easing = 'cubic-bezier(.16, 1, .3, 1)';
  const profiles = {
    rise: { from: { opacity: 0, transform: 'translateY(26px)' }, duration: 850 },
    title: { from: { opacity: 0.15, transform: 'translateY(32px)', clipPath: 'inset(0 0 100% 0)' }, duration: 1100 },
    card: { from: { opacity: 0, transform: 'translateY(38px) scale(.985)' }, duration: 950 },
    badge: { from: { opacity: 0, transform: 'translateY(12px) scale(.94)' }, duration: 600 },
    side: { from: { opacity: 0, transform: 'translateX(-18px)' }, duration: 800 },
    portrait: { from: { opacity: 0, transform: 'translateY(24px) scale(.96)' }, duration: 1200 },
  };

  const reveal = (element, delay = 0, profile = 'rise') => {
    if (!element || !motionIsEnabled() || !element.animate || revealed.has(element)) return;
    revealed.add(element);
    // Focused controls and their containers must remain immediately readable.
    if (element.contains(document.activeElement)) return;
    const { from, duration } = profiles[profile];
    const to = { opacity: 1, transform: 'none' };
    if (from.clipPath) to.clipPath = 'inset(0 0 0% 0)';
    const animation = element.animate([from, to], { duration, delay, easing, fill: 'backwards' });
    activeAnimations.add(animation);
    const clear = () => activeAnimations.delete(animation);
    animation.finished.then(clear, clear);
  };
  const sequence = (container, selector, delay = 0, step = 75, profile = 'rise') => {
    container.querySelectorAll(selector).forEach((element, index) => reveal(element, delay + index * step, profile));
  };
  const register = (selector, play) => {
    document.querySelectorAll(selector).forEach(element => groups.set(element, play));
  };
  register('.section-heading, .writing-section > div, .contact-intro', (element, delay) => {
    sequence(element, '.eyebrow', delay, 0);
    sequence(element, 'h2', delay + 90, 0, 'title');
    sequence(element, ':scope > p:not(.eyebrow), :scope > a, .contact-location', delay + 210);
  });
  register('.career-strip', (element, delay) => {
    sequence(element, ':scope > div:first-child, :scope > p', delay, 100);
    sequence(element, '.company-brand', delay + 180, 110, 'badge');
  });
  register('.expertise-item', (element, delay) => {
    reveal(element, delay, 'card');
    sequence(element, '.expertise-stack li', delay + 180, 55, 'badge');
  });
  register('.work-card', (element, delay) => {
    reveal(element, delay, 'card');
    sequence(element, '.tags > span', delay + 200, 65, 'badge');
  });
  register('.experience-row', (element, delay) => {
    sequence(element, '.experience-date, .experience-index', delay, 80, 'side');
    sequence(element, '.experience-main > *', delay + 100, 85);
  });
  register('.about-copy > *, .article-link, .contact-option, .section-end', (element, delay) => {
    reveal(element, delay, element.matches('h2') ? 'title' : 'rise');
  });

  const stopMotion = () => {
    revealObserver?.disconnect();
    activeAnimations.forEach(animation => animation.cancel());
    activeAnimations.clear();
  };

  const setupMotion = () => {
    stopMotion();
    updateMotionControl();
    if (!motionIsEnabled() || !('IntersectionObserver' in window)) return;
    if (!introPlayed && (!location.hash || location.hash === '#top')) {
      const introduction = document.querySelectorAll(
        '.hero-copy > .eyebrow, .hero-title, .hero-copy h2, .intro, .hero-links, .hero-specialties'
      );
      introduction.forEach((element, index) => reveal(element, index * 90, element.matches('h1, h2') ? 'title' : 'rise'));
      reveal(document.querySelector('.portrait'), 180, 'portrait');
      introPlayed = true;
    }
    revealObserver = new IntersectionObserver(entries => {
      // Stagger siblings in the same visible row, not every card down the page.
      // A one-column mobile layout therefore never waits for offscreen siblings.
      const rows = new Map();
      entries.filter(entry => entry.isIntersecting).sort((a, b) =>
        a.boundingClientRect.top - b.boundingClientRect.top || a.boundingClientRect.left - b.boundingClientRect.left
      ).forEach(entry => {
        const element = entry.target;
        revealObserver.unobserve(element);
        if (revealedGroups.has(element)) return;
        revealedGroups.add(element);
        const top = entry.boundingClientRect.top;
        const siblings = rows.get(element.parentElement) || [];
        const row = siblings.find(item => Math.abs(item.top - top) < 24);
        const delay = row ? Math.min(++row.index * 110, 220) : 0;
        if (!row) siblings.push({ top, index: 0 });
        rows.set(element.parentElement, siblings);
        // Fast scrolling and restored scroll positions should not animate passed content.
        if (entry.boundingClientRect.bottom <= 96) return;
        groups.get(element)(element, delay);
      });
    }, { threshold: 0, rootMargin: '0px 0px 24px 0px' });
    groups.forEach((play, element) => {
      if (!revealedGroups.has(element)) revealObserver.observe(element);
    });
  };

  motionToggle.addEventListener('click', () => {
    userPaused = !userPaused;
    try { localStorage.setItem('aks-motion-paused', String(userPaused)); } catch { /* Keep the session choice. */ }
    setupMotion();
  });
  motionPreference.addEventListener('change', setupMotion);
  document.addEventListener('focusin', event => {
    // Skip pending entrances too when keyboard navigation jumps ahead of scrolling.
    groups.forEach((play, element) => {
      if (element.contains(event.target)) {
        revealedGroups.add(element);
        revealObserver?.unobserve(element);
      }
    });
    activeAnimations.forEach(animation => {
      if (animation.effect?.target?.contains(event.target)) animation.finish();
    });
  });
  window.addEventListener('beforeprint', stopMotion);
  window.addEventListener('afterprint', setupMotion);
  setupMotion();
})();
