import { getLang, setLang, t } from './i18n.js';

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

export function mountPage(app, { title, subtitle, navActive, bodyClass } = {}, contentChildren = []) {
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
  ensureLangSideToggle();

  if (title || subtitle) {
    const mast = el('header', { class: 'mast mast--page' });
    if (title) mast.appendChild(el('div', { class: 'title title--page grad-text' }, [title]));
    if (subtitle) mast.appendChild(el('div', { class: 'sub' }, [subtitle]));
    shell.appendChild(mast);
  }

  const page = el('div', { class: 'page' }, contentChildren);
  shell.appendChild(page);
  app.appendChild(shell);
}

export function siteNav(active) {
  const items = [
    { href: '#/', label: t('nav.home'), key: 'home' },
    { href: '#/about', label: t('nav.about'), key: 'about' },
    { href: '#/artists', label: t('nav.artists'), key: 'artists' },
    { href: '#/practical-info', label: t('nav.practical'), key: 'practical' },
  ];

  const nav = el('nav', { class: 'nav' });
  const list = el('div', { class: 'nav-links' });

  for (const it of items) {
    const a = el('a', { class: 'nav-link', href: it.href }, [it.label]);
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

export function textBlock(text) {
  return el('p', {}, [text]);
}

export function sectionCard(title, children = []) {
  return el('section', { class: 'content-card' }, [el('h2', { class: 'content-card-title' }, [title]), ...children]);
}

export function externalLink(label, href) {
  return el('a', { href, target: '_blank', rel: 'noopener noreferrer' }, [label]);
}
