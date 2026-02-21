import { mountPage, sectionCard, textBlock, el } from '../ui.js';
import { t } from '../i18n.js';

export async function renderHomepage(app) {
  const heroWrap = el('div', { class: 'hero-img-wrap' }, [
    el('img', {
      class: 'hero-img',
      src: './Images/homepage.png',
      alt: 'Exhibition view',
      loading: 'eager',
    }),
  ]);

  const dateParts = String(t('home.dates')).split('\n');
  const dateChildren = [];
  for (let i = 0; i < dateParts.length; i += 1) {
    if (i) dateChildren.push(document.createElement('br'));
    dateChildren.push(dateParts[i]);
  }
  const dates = el('div', { class: 'home-dates' }, dateChildren);

  mountPage(
    app,
    {
      navActive: 'home',
    },
    [
      heroWrap,
      dates,
    ]
  );
}
