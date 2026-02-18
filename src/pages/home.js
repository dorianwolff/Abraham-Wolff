import { loadArtists } from '../data.js';

function el(tag, attrs = {}, children = []) {
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

function attachTilt(card) {
  if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) return;

  let rect = null;
  const onEnter = () => {
    rect = card.getBoundingClientRect();
    card.style.transition = 'transform 120ms cubic-bezier(0.2, 0.8, 0.2, 1)';
  };

  const onMove = (e) => {
    if (!rect) rect = card.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const rx = (py - 0.5) * -10;
    const ry = (px - 0.5) * 12;
    card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translate3d(0, -4px, 0)`;
  };

  const onLeave = () => {
    rect = null;
    card.style.transition = 'transform 420ms cubic-bezier(0.2, 0.8, 0.2, 1)';
    card.style.transform = '';
  };

  card.addEventListener('pointerenter', onEnter);
  card.addEventListener('pointermove', onMove);
  card.addEventListener('pointerleave', onLeave);
}

function setupScrollReveal(cards) {
  if (!('IntersectionObserver' in window)) {
    for (const c of cards) c.classList.add('revealed');
    return;
  }

  const obs = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.classList.add('revealed');
        obs.unobserve(e.target);
      }
    },
    { root: null, threshold: 0.22 }
  );

  for (const c of cards) obs.observe(c);
}

function publishScrollEnd(cards) {
  const last = cards[cards.length - 1];
  if (!last) return;
  const endAt = last.offsetTop + last.offsetHeight - window.innerHeight * 0.65;
  window.dispatchEvent(
    new CustomEvent('catalog:scrollEnd', { detail: { scrollEnd: Math.max(1, endAt) } })
  );
}

export async function renderHome(app) {
  app.innerHTML = '';

  const shell = el('section', { class: 'shell fade-in' });

  const mast = el('header', { class: 'mast' }, [
    el('div', { class: 'kicker' }, ['Da capo sine fine']),
    el('div', { class: 'title' }, ['Artist Catalog']),
  ]);

  const grid = el('div', { class: 'grid deck', id: 'artist-grid' });

  shell.appendChild(mast);
  shell.appendChild(grid);
  app.appendChild(shell);

  const data = await loadArtists();
  const artists = Array.isArray(data?.artists) ? data.artists : [];

  window.dispatchEvent(
    new CustomEvent('catalog:count', {
      detail: { count: artists.length, seed: Date.now() + Math.floor(Math.random() * 1e9) },
    })
  );

  const cards = [];

  const baseOffsets = [0, 46, 18, 62, 30, 78];

  for (let idx = 0; idx < artists.length; idx += 1) {
    const artist = artists[idx];
    const offset = baseOffsets[idx % baseOffsets.length];
    const wobble = (idx % 2 === 0 ? -1 : 1) * Math.min(10, 3 + idx);

    const card = el(
      'article',
      {
        class: 'card',
        role: 'link',
        tabindex: '0',
        'data-slug': artist.slug,
        'data-side': idx % 2 === 0 ? 'left' : 'right',
        onclick: () => {
          window.location.hash = `#/artist/${encodeURIComponent(artist.slug)}`;
        },
        onkeydown: (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            window.location.hash = `#/artist/${encodeURIComponent(artist.slug)}`;
          }
        },
      },
      [
        el('div', { class: 'card-top' }, [
          el('div', { class: 'card-name' }, [artist.name || artist.slug]),
          el('div', { class: 'card-years' }, [artist.years || '']),
        ]),
        el('div', { class: 'card-meta' }, [
          el('div', { class: 'chip' }, [artist.discipline || 'Artist']),
          el('div', { class: 'rule' }),
          el('div', { class: 'chip' }, [artist.origin || '']),
        ]),
        el('div', { class: 'card-cta' }, ['Open bio']),
      ]
    );

    card.style.setProperty('--i', String(idx));
    card.style.setProperty('--offsetY', `${offset}px`);
    card.style.setProperty('--lean', `${wobble}deg`);

    attachTilt(card);
    grid.appendChild(card);
    cards.push(card);
  }

  setupScrollReveal(cards);

  publishScrollEnd(cards);

  if (window.__catalogHomeResizeHandler) {
    window.removeEventListener('resize', window.__catalogHomeResizeHandler);
  }

  let resizeRaf = 0;
  window.__catalogHomeResizeHandler = () => {
    if (resizeRaf) return;
    resizeRaf = requestAnimationFrame(() => {
      resizeRaf = 0;
      publishScrollEnd(cards);
    });
  };
  window.addEventListener('resize', window.__catalogHomeResizeHandler);
}
