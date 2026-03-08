import { loadArtists } from '../data.js';
import { mountPage, el } from '../ui.js';
import { t } from '../i18n.js';

const ARTISTS_LISTING_STATE_KEY = 'artistsListingState:v1';

function readListingState() {
  try {
    const raw = sessionStorage.getItem(ARTISTS_LISTING_STATE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    const order = Array.isArray(parsed.order) ? parsed.order.filter(Boolean) : [];
    const scrollY = Number(parsed.scrollY);
    return {
      order,
      scrollY: Number.isFinite(scrollY) ? Math.max(0, scrollY) : 0,
    };
  } catch {
    return null;
  }
}

function writeListingState({ order, scrollY }) {
  try {
    sessionStorage.setItem(
      ARTISTS_LISTING_STATE_KEY,
      JSON.stringify({ order: Array.isArray(order) ? order : [], scrollY: Number(scrollY) || 0 })
    );
  } catch {
    // ignore
  }
}

export function clearArtistsListingState() {
  try {
    sessionStorage.removeItem(ARTISTS_LISTING_STATE_KEY);
  } catch {
    // ignore
  }
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

export async function renderArtists(app) {
  const grid = el('div', { class: 'grid deck', id: 'artist-grid' });

  mountPage(
    app,
    {
      navActive: 'artists',
      bodyClass: 'page-artists',
    },
    [grid]
  );

  const data = await loadArtists();
  const artists = Array.isArray(data?.artists) ? data.artists : [];

  const listingState = readListingState();
  const bySlug = new Map(artists.map((a) => [a?.slug, a]));
  const restoredArtists = [];
  if (listingState?.order?.length) {
    for (const slug of listingState.order) {
      const a = bySlug.get(slug);
      if (a) restoredArtists.push(a);
    }
  }
  if (restoredArtists.length) {
    const used = new Set(restoredArtists.map((a) => a.slug));
    for (const a of artists) {
      if (a?.slug && !used.has(a.slug)) restoredArtists.push(a);
    }
  }

  const shuffledArtists = restoredArtists.length ? restoredArtists : [...artists];
  if (!restoredArtists.length) {
    for (let i = shuffledArtists.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = shuffledArtists[i];
      shuffledArtists[i] = shuffledArtists[j];
      shuffledArtists[j] = tmp;
    }
  } else {
    window.__skipScrollResetOnce = true;
  }

  window.dispatchEvent(
    new CustomEvent('catalog:count', {
      detail: { count: artists.length, seed: Date.now() + Math.floor(Math.random() * 1e9) },
    })
  );

  const cards = [];
  const baseOffsets = [0, 46, 18, 62, 30, 78];

  for (let idx = 0; idx < shuffledArtists.length; idx += 1) {
    const artist = shuffledArtists[idx];
    const offset = baseOffsets[idx % baseOffsets.length];
    const wobble = (idx % 2 === 0 ? -1 : 1) * Math.min(10, 3 + idx);

    const cardChildren = [
      el('div', { class: 'card-top' }, [
        el('div', { class: 'card-name grad-text' }, [artist.name || artist.slug]),
        el('div', { class: 'card-years' }, [artist.years || '']),
      ]),
    ];

    if (artist.cardImage) {
      const img = el('img', {
        class: 'card-img',
        src: artist.cardImage,
        alt: artist.name || artist.slug,
        loading: 'lazy',
      });
      img.addEventListener('error', () => {
        img.remove();
        const parent = img.closest ? img.closest('article') : null;
        if (parent) parent.classList.remove('card--has-img');
      });
      cardChildren.push(img);
    }

    cardChildren.push(
      el('div', { class: 'card-meta' }, [
        el('div', { class: 'chip' }, [artist.discipline || '']),
        el('div', { class: 'rule' }),
        el('div', { class: 'chip' }, [artist.origin || '']),
      ]),
      el('div', { class: 'card-cta' }, [t('artists.open_bio')])
    );

    const card = el(
      'article',
      {
        class: artist.cardImage ? 'card card--has-img' : 'card',
        role: 'link',
        tabindex: '0',
        'data-slug': artist.slug,
        'data-side': idx % 2 === 0 ? 'left' : 'right',
        onclick: () => {
          writeListingState({
            order: shuffledArtists.map((a) => a.slug).filter(Boolean),
            scrollY: window.scrollY,
          });
          window.location.hash = `#/artist/${encodeURIComponent(artist.slug)}`;
        },
        onkeydown: (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            writeListingState({
              order: shuffledArtists.map((a) => a.slug).filter(Boolean),
              scrollY: window.scrollY,
            });
            window.location.hash = `#/artist/${encodeURIComponent(artist.slug)}`;
          }
        },
      },
      cardChildren
    );

    if (card.querySelector('.card-img')) card.classList.add('card--has-img');

    card.style.setProperty('--i', String(idx));
    card.style.setProperty('--offsetY', `${offset}px`);
    card.style.setProperty('--lean', `${wobble}deg`);

    attachTilt(card);
    grid.appendChild(card);
    cards.push(card);
  }

  setupScrollReveal(cards);
  publishScrollEnd(cards);

  if (restoredArtists.length) {
    const y = listingState?.scrollY || 0;
    requestAnimationFrame(() => {
      window.scrollTo({ top: y, left: 0, behavior: 'instant' });
      clearArtistsListingState();
    });
  }

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
