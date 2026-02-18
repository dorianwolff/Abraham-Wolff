import { mountPage, sectionCard, textBlock, el } from '../ui.js';
import { t } from '../i18n.js';

export async function renderHomepage(app) {
  const titleEl = el('span', { class: 'grad-text' }, ['Da capo sine fine']);

  const heroWrap = el('div', { class: 'hero-img-wrap' }, [
    el('img', {
      class: 'hero-img',
      src: './Images/A&W_view.webp',
      alt: 'Exhibition view',
      loading: 'eager',
    }),
  ]);

  const dates = el('div', { class: 'home-dates' }, [t('home.dates')]);

  mountPage(
    app,
    {
      navActive: 'home',
    },
    [
      el('header', { class: 'mast mast--page' }, [
        el('div', { class: 'title title--page' }, [titleEl]),
      ]),
      heroWrap,
      dates,
    ]
  );
}
