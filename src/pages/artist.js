import { loadArtistBio } from '../data.js';
import { mountPage, el, externalLink } from '../ui.js';
import { getLang, t } from '../i18n.js';

function resolveAssetHref(href) {
  const raw = String(href || '');
  const normalized = raw
    .replace(/^\.\//, '')
    .replace(/^\//, '')
    .replace(/^resources\/portfolios\//, 'resources/')
    .replace(/^\.\/resources\/portfolios\//, 'resources/')
    .replace(/^\.\/resources\//, 'resources/');

  const basePath = window.location.pathname.endsWith('/')
    ? window.location.pathname
    : `${window.location.pathname}/`;

  return new URL(normalized, `${window.location.origin}${basePath}`).toString();
}

function pdfBlock(title, href) {
  const safeHref = resolveAssetHref(href);
  const obj = document.createElement('object');
  obj.className = 'pdf-embed';
  obj.setAttribute('data', safeHref);
  obj.setAttribute('type', 'application/pdf');
  obj.textContent = 'PDF cannot be displayed.';

  return el('div', { class: 'pdf-asset' }, [
    el('div', { class: 'pdf-preview' }, [obj]),
    el('div', { class: 'pdf-actions' }, [
      el('a', { class: 'pdf-download', href: safeHref, download: '' }, [t('pdf.download')]),
    ]),
  ]);
}

export async function renderArtist(app, { slug }) {
  let bio;
  try {
    bio = await loadArtistBio(slug);
  } catch {
    bio = { name: slug, years: '', origin: '', discipline: '', paragraphs: [] };
  }

  const getBioParagraphs = () => {
    const lang = getLang();
    const byLang = bio?.bios && typeof bio.bios === 'object' ? bio.bios : null;
    const candidate = byLang ? byLang[lang] : null;

    const pick = (v) => (Array.isArray(v) ? v.filter(Boolean) : []);
    const primary = pick(candidate);
    if (primary.length) return primary;

    const fallbackLang = lang === 'fr' ? 'en' : 'fr';
    const secondary = pick(byLang ? byLang[fallbackLang] : null);
    if (secondary.length) return secondary;

    return pick(Array.isArray(bio?.paragraphs) ? bio.paragraphs : []);
  };

  const pageChildren = [];

  const back = el(
    'a',
    {
      class: 'back',
      href: '#/artists',
    },
    [t('artist.back')]
  );
  pageChildren.push(back);
  pageChildren.push(el('div', { class: 'hline' }));

  const birthParts = [];
  if (bio.birthDate) birthParts.push(`${t('artist.born')} ${bio.birthDate}`);
  if (bio.basedIn) birthParts.push(`${t('artist.based')} ${bio.basedIn}`);

  const bioChildren = [
    el('h1', { class: 'grad-text' }, [bio.name || slug]),
    el('div', { class: 'byline' }, [
      [bio.discipline, bio.origin, bio.years].filter(Boolean).join('  ·  '),
    ]),
  ];

  if (birthParts.length) {
    bioChildren.push(el('div', { class: 'bio-birth' }, [birthParts.join('  ·  ')]));
  }

  const bioCard = el('section', { class: 'bio' }, bioChildren);

  const portraitSrc = bio.portrait || bio.portraitUrl || null;
  const cardSrc = bio.playingCard || bio.playingCardUrl || null;
  const website = bio.website || bio.site || null;

  if (portraitSrc || cardSrc || website) {
    const media = el('div', { class: 'artist-media' });
    if (cardSrc) {
      media.appendChild(
        el('img', {
          class: 'artist-media-img artist-media-img--card',
          src: cardSrc,
          alt: `${bio.name || slug} playing card`,
          loading: 'lazy',
        })
      );
    }
    if (portraitSrc) {
      media.appendChild(
        el('img', {
          class: 'artist-media-img artist-media-img--portrait',
          src: portraitSrc,
          alt: `${bio.name || slug} portrait`,
          loading: 'lazy',
        })
      );
    }
    if (website) {
      media.appendChild(el('div', { class: 'artist-website' }, [externalLink(t('artist.website'), website)]));
    }
    bioCard.appendChild(media);
  }

  const bioText = el('div', { class: 'bio-text' });
  const renderBioText = () => {
    bioText.innerHTML = '';
    const paras = getBioParagraphs();
    for (const p of paras) bioText.appendChild(el('p', {}, [p]));
  };
  renderBioText();
  window.addEventListener('i18n:change', renderBioText);
  bioCard.appendChild(bioText);

  pageChildren.push(bioCard);

  const pdfs = Array.isArray(bio.pdfs) ? bio.pdfs : [];
  if (pdfs.length) {
    const assets = el('section', { class: 'assets' });
    for (let i = 0; i < pdfs.length; i += 1) {
      const pdf = pdfs[i];
      const href = typeof pdf === 'string' ? pdf : pdf?.href;
      const title = (typeof pdf === 'string' ? null : pdf?.title) || 'Portfolio';
      if (!href) continue;
      assets.appendChild(pdfBlock(title, href));
    }
    pageChildren.push(assets);
  }

  mountPage(
    app,
    {
      navActive: 'artists',
    },
    pageChildren
  );
}
