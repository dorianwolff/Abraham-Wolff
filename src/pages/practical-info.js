import { mountPage, sectionCard, textBlock, el, externalLink } from '../ui.js';
import { t } from '../i18n.js';

export async function renderPracticalInfo(app) {
  const address = 'Abraham & Wolff, 12 Rue des Saints-Pères, 75007 Paris';
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

  mountPage(
    app,
    {
      navActive: 'practical',
      bodyClass: 'page-practical',
    },
    [
      sectionCard(t('practical.contact_title'), [
        el('div', { class: 'info-grid' }, [
          el('div', { class: 'info-row' }, [
            el('div', { class: 'info-k' }, [t('practical.address')]),
            el('div', { class: 'info-v' }, [externalLink(address, mapsUrl)]),
          ]),
          el('div', { class: 'info-row' }, [
            el('div', { class: 'info-k' }, [t('practical.phone')]),
            el('div', { class: 'info-v' }, ['+33 9 52 94 52 97']),
          ]),
          el('div', { class: 'info-row' }, [
            el('div', { class: 'info-k' }, [t('practical.dates')]),
            el('div', { class: 'info-v' }, ['14th March - 9th May, 2026']),
          ]),
          el('div', { class: 'info-row' }, [
            el('div', { class: 'info-k' }, [t('practical.timings')]),
            el('div', { class: 'info-v' }, [
              'Tuesday 11am - 6pm',
              document.createElement('br'),
              'Wednesday - Saturday 11am - 7pm',
            ]),
          ]),
        ]),
      ]),
      sectionCard(t('practical.links_title'), [
        el('div', { class: 'link-row' }, [
          externalLink(t('practical.email'), 'mailto:dacaposinefine@gmail.com'),
          el('span', { class: 'link-sep' }, ['·']),
          externalLink(t('practical.abraham_wolff_website'), 'https://www.abraham-wolff.com/accueil/'),
        ]),
        el('div', { class: 'practical-contrib' }, [
          el('div', { class: 'practical-contrib-title' }, [t('practical.contributions')]),
          el('div', { class: 'practical-contrib-text' }, [t('site.credit')]),
        ]),
      ]),
    ]
  );
}
