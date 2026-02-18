import { mountPage, sectionCard, textBlock, el, externalLink } from '../ui.js';
import { t } from '../i18n.js';

export async function renderPracticalInfo(app) {
  mountPage(
    app,
    {
      title: t('practical.title'),
      navActive: 'practical',
    },
    [
      sectionCard(t('practical.contact_title'), [
        el('div', { class: 'info-grid' }, [
          el('div', { class: 'info-row' }, [el('div', { class: 'info-k' }, [t('practical.address')]), el('div', { class: 'info-v' }, [''])]),
          el('div', { class: 'info-row' }, [el('div', { class: 'info-k' }, [t('practical.phone')]), el('div', { class: 'info-v' }, [''])]),
          el('div', { class: 'info-row' }, [el('div', { class: 'info-k' }, [t('practical.dates')]), el('div', { class: 'info-v' }, [''])]),
          el('div', { class: 'info-row' }, [el('div', { class: 'info-k' }, [t('practical.contact')]), el('div', { class: 'info-v' }, [''])]),
        ]),
      ]),
      sectionCard(t('practical.links_title'), [
        el('div', { class: 'link-row' }, [externalLink(t('practical.email'), 'mailto:'), el('span', { class: 'link-sep' }, ['·']), externalLink(t('practical.website'), '')]),
      ]),
    ]
  );
}
