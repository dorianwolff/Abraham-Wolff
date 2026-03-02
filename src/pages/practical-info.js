import { mountPage, sectionCard, textBlock, el, externalLink } from '../ui.js';
import { t } from '../i18n.js';

export async function renderPracticalInfo(app) {
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
            el('div', { class: 'info-v' }, ['Abraham & Wolff, 12 Rue des Saints-Pères, 75007 Paris']),
          ]),
          el('div', { class: 'info-row' }, [
            el('div', { class: 'info-k' }, [t('practical.phone')]),
            el('div', { class: 'info-v' }, ['+33 786 0457 23']),
          ]),
          el('div', { class: 'info-row' }, [
            el('div', { class: 'info-k' }, [t('practical.dates')]),
            el('div', { class: 'info-v' }, ['14.03.2026 - 09.05.2026']),
          ]),
          el('div', { class: 'info-row' }, [
            el('div', { class: 'info-k' }, [t('practical.timings')]),
            el('div', { class: 'info-v' }, ['Tuesday 11am - 6pm, Wednesday - Saturday 11am - 7pm']),
          ]),
        ]),
      ]),
      sectionCard(t('practical.links_title'), [
        el('div', { class: 'link-row' }, [
          externalLink(t('practical.email'), 'mailto:dacaposinefine@gmail.com'),
          el('span', { class: 'link-sep' }, ['·']),
          externalLink(t('practical.abraham_wolff_website'), 'https://www.abraham-wolff.com/accueil/'),
        ]),
      ]),
    ]
  );
}
