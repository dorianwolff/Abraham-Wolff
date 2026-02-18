const STORAGE_KEY = 'lang';

const DICT = {
  en: {
    'lang.label': 'Language',
    'lang.en': 'EN',
    'lang.fr': 'FR',

    'nav.home': 'Home',
    'nav.about': 'About us',
    'nav.da_capo': 'Da capo sine fine',
    'nav.exhibition_text': 'Exhibition text',
    'nav.bibliography': 'Bibliography',
    'nav.exhibition_views': 'Exhibition views',
    'nav.artists': 'Participating artists',
    'nav.practical': 'Practical info',

    'home.subtitle': 'Catalog',
    'home.dates': 'Dates coming soon',
    'home.tile_exhibition_title': 'Exhibition text',
    'home.tile_exhibition_sub': 'Read the curatorial text',
    'home.tile_artists_title': 'Participating artists',
    'home.tile_artists_sub': 'Browse artists',
    'home.tile_practical_title': 'Practical info',
    'home.tile_practical_sub': 'Address, dates, contact',

    'about.title': 'About us',
    'about.curators_title': 'Curators',

    'da_capo.title': 'Da capo sine fine',

    'exhibition_text.title': 'Exhibition text',

    'bibliography.title': 'Bibliography / reference texts',

    'exhibition_views.title': 'Exhibition views',

    'artists.title': 'Participating artists',
    'artists.open_bio': 'Open bio',

    'artist.back': '\u2190  Participating artists',
    'artist.website': 'Website',
    'artist.born': 'Born',
    'artist.based': 'Based in',

    'practical.title': 'Practical info',
    'practical.contact_title': 'Contact',
    'practical.address': 'Address',
    'practical.phone': 'Phone number',
    'practical.dates': 'Dates / timings',
    'practical.contact': 'Contact',
    'practical.links_title': 'Links',
    'practical.email': 'Email',
    'practical.website': 'Website',

    'section.about': 'About',
    'section.text': 'Text',
    'section.references': 'References',
    'section.views': 'Views',

    'pdf.download': 'Download',
    'pdf.open': 'Open',
  },
  fr: {
    'lang.label': 'Langue',
    'lang.en': 'EN',
    'lang.fr': 'FR',

    'nav.home': 'Accueil',
    'nav.about': '\u00c0 propos',
    'nav.da_capo': 'Da capo sine fine',
    'nav.exhibition_text': "Texte d'exposition",
    'nav.bibliography': 'Bibliographie',
    'nav.exhibition_views': "Vues de l'exposition",
    'nav.artists': 'Artistes participant\u00b7e\u00b7s',
    'nav.practical': 'Infos pratiques',

    'home.subtitle': 'Catalogue',
    'home.dates': 'Dates \u00e0 venir',
    'home.dates_label': 'Dates',
    'home.tile_exhibition_title': "Texte d'exposition",
    'home.tile_exhibition_sub': 'Lire le texte de commissariat',
    'home.tile_artists_title': 'Artistes participant\u00b7e\u00b7s',
    'home.tile_artists_sub': 'Parcourir les artistes',
    'home.tile_practical_title': 'Infos pratiques',
    'home.tile_practical_sub': 'Adresse, dates, contact',

    'about.title': '\u00c0 propos',
    'about.curators_title': 'Commissaires',

    'da_capo.title': 'Da capo sine fine',

    'exhibition_text.title': "Texte d'exposition",

    'bibliography.title': 'Bibliographie / textes de référence',

    'exhibition_views.title': "Vues de l'exposition",

    'artists.title': 'Artistes participant\u00b7e\u00b7s',
    'artists.open_bio': 'Ouvrir la bio',

    'artist.back': '\u2190  Artistes participant\u00b7e\u00b7s',
    'artist.website': 'Site web',
    'artist.born': 'N\u00e9\u00b7e',
    'artist.based': 'Bas\u00e9\u00b7e \u00e0',

    'practical.title': 'Infos pratiques',
    'practical.contact_title': 'Contact',
    'practical.address': 'Adresse',
    'practical.phone': 'Téléphone',
    'practical.dates': 'Dates / horaires',
    'practical.contact': 'Contact',
    'practical.links_title': 'Liens',
    'practical.email': 'Email',
    'practical.website': 'Site web',

    'section.about': 'À propos',
    'section.text': 'Texte',
    'section.references': 'Références',
    'section.views': 'Vues',

    'pdf.download': 'Télécharger',
    'pdf.open': 'Ouvrir',
  },
};

let currentLang = 'en';

export function getLang() {
  return currentLang;
}

export function setLang(next) {
  const lang = next === 'fr' ? 'fr' : 'en';
  currentLang = lang;
  try {
    localStorage.setItem(STORAGE_KEY, currentLang);
  } catch {
    // ignore
  }
  window.dispatchEvent(new CustomEvent('i18n:change', { detail: { lang: currentLang } }));
}

export function initI18n() {
  let stored = null;
  try {
    stored = localStorage.getItem(STORAGE_KEY);
  } catch {
    stored = null;
  }
  if (stored === 'fr' || stored === 'en') currentLang = stored;
  else currentLang = 'en';
}

export function t(key) {
  const dict = DICT[currentLang] || DICT.en;
  return dict[key] ?? DICT.en[key] ?? key;
}
