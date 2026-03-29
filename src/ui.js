import { getLang, setLang, t } from './i18n.js';

const ARTISTS_LISTING_STATE_KEY = 'artistsListingState:v1';

export function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') node.className = v;
    else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v);
    else node.setAttribute(k, v);
  }
  for (const c of children) {
    if (typeof c === 'string') node.appendChild(document.createTextNode(c));
    else if (c) node.appendChild(c);
  }
  return node;
}

export function mountPage(app, { title, subtitle, navActive, bodyClass, showCredit } = {}, contentChildren = []) {
  app.innerHTML = '';

  const prev = document.body.dataset.pageTheme;
  if (prev) document.body.classList.remove(prev);
  if (bodyClass) {
    document.body.classList.add(bodyClass);
    document.body.dataset.pageTheme = bodyClass;
  } else {
    delete document.body.dataset.pageTheme;
  }

  const shell = el('section', { class: 'shell fade-in' });
  shell.appendChild(siteNav(navActive));
  ensureThemeSideToggle();
  ensureLangSideToggle();

  if (title || subtitle) {
    const mast = el('header', { class: 'mast mast--page' });
    if (title) mast.appendChild(el('div', { class: 'title title--page grad-text' }, [title]));
    if (subtitle) mast.appendChild(el('div', { class: 'sub' }, [subtitle]));
    shell.appendChild(mast);
  }

  const page = el('div', { class: 'page' }, contentChildren);
  shell.appendChild(page);

  if (showCredit) {
    const credit = el('footer', { class: 'site-credit' }, [t('site.credit')]);
    shell.appendChild(credit);
  }
  app.appendChild(shell);
}

export function siteNav(active) {
  const items = [
    { href: '#/', label: t('nav.home'), key: 'home' },
    { href: '#/about', label: t('nav.about'), key: 'about' },
    { href: '#/artists', label: t('nav.artists'), key: 'artists' },
    { href: '#/exhibition-views', label: t('nav.exhibition_views'), key: 'exhibition-views' },
    { href: '#/practical-info', label: t('nav.practical'), key: 'practical' },
  ];

  const nav = el('nav', { class: 'nav' });
  const list = el('div', { class: 'nav-links' });

  const clearArtistsListingState = () => {
    try {
      sessionStorage.removeItem(ARTISTS_LISTING_STATE_KEY);
    } catch {
      // ignore
    }
  };

  for (const it of items) {
    const a = el(
      'a',
      {
        class: 'nav-link',
        href: it.href,
        onclick: () => {
          clearArtistsListingState();
        },
      },
      [it.label]
    );
    if (active && it.key === active) a.classList.add('is-active');
    list.appendChild(a);
  }

  nav.appendChild(list);
  return nav;
}

function ensureLangSideToggle() {
  if (document.getElementById('lang-toggle')) return;

  const toggle = el(
    'button',
    {
      id: 'lang-toggle',
      class: 'lang-toggle',
      type: 'button',
      onclick: () => {
        const lang = getLang();
        setLang(lang === 'fr' ? 'en' : 'fr');
      },
      'aria-label': t('lang.label'),
    },
    [getLang() === 'fr' ? t('lang.en') : t('lang.fr')]
  );

  window.addEventListener('i18n:change', () => {
    toggle.textContent = getLang() === 'fr' ? t('lang.en') : t('lang.fr');
    toggle.setAttribute('aria-label', t('lang.label'));
  });

  document.body.appendChild(toggle);
}

function sunIcon() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('width', '18');
  svg.setAttribute('height', '18');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '1.8');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');

  const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  circle.setAttribute('cx', '12');
  circle.setAttribute('cy', '12');
  circle.setAttribute('r', '4');
  svg.appendChild(circle);

  const rays = [
    'M12 2v2',
    'M12 20v2',
    'M4.93 4.93l1.41 1.41',
    'M17.66 17.66l1.41 1.41',
    'M2 12h2',
    'M20 12h2',
    'M4.93 19.07l1.41-1.41',
    'M17.66 6.34l1.41-1.41',
  ];

  for (const d of rays) {
    const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.setAttribute('d', d);
    svg.appendChild(p);
  }

  return svg;
}

function moonIcon() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('width', '18');
  svg.setAttribute('height', '18');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '1.8');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');

  const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  p.setAttribute('d', 'M21 12.1A9 9 0 1 1 11.9 3a7 7 0 0 0 9.1 9.1Z');
  svg.appendChild(p);
  return svg;
}

function getTheme() {
  try {
    return localStorage.getItem('theme') || 'light';
  } catch {
    return 'light';
  }
}

function setTheme(theme) {
  const t = theme === 'light' ? 'light' : 'dark';
  document.body.classList.toggle('theme-light', t === 'light');
  try {
    localStorage.setItem('theme', t);
  } catch {
    // ignore
  }

  const btn = document.getElementById('theme-toggle');
  if (btn) {
    btn.replaceChildren(t === 'light' ? moonIcon() : sunIcon());
    btn.setAttribute('aria-label', t === 'light' ? 'Switch to dark mode' : 'Switch to light mode');
  }
}

function ensureThemeSideToggle() {
  if (document.getElementById('theme-toggle')) return;

  const btn = el(
    'button',
    {
      id: 'theme-toggle',
      class: 'theme-toggle',
      type: 'button',
      onclick: () => {
        const next = document.body.classList.contains('theme-light') ? 'dark' : 'light';
        setTheme(next);
      },
      'aria-label': 'Switch to light mode',
    },
    []
  );

  document.body.appendChild(btn);
  setTheme(getTheme());
}

export function textBlock(text) {
  return el('p', {}, [text]);
}

export function sectionCard(title, children = []) {
  return el('section', { class: 'content-card' }, [el('h2', { class: 'content-card-title' }, [title]), ...children]);
}

export function externalLink(label, href) {
  return el('a', { href, target: '_blank', rel: 'noopener noreferrer' }, [label]);
}
