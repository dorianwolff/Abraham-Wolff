import { mountPage, sectionCard, textBlock, el } from '../ui.js';
import { t } from '../i18n.js';

export async function renderAbout(app) {
  mountPage(
    app,
    {
      navActive: 'about',
      bodyClass: 'page-about',
      showCredit: true,
    },
    [
      sectionCard(t('about.curators_title'), [
        el('div', { class: 'curators' }, [
          el('div', { class: 'curators-media' }, [
            el('img', {
              class: 'curators-img',
              src: './Images/artists/Julia%20Tavares%20(curator).JPG',
              alt: 'Julia Tavares',
              loading: 'lazy',
            }),
          ]),
          el('div', { class: 'curators-names' }, ['Julia Julia Tavares', ' ', '&', ' ', 'Amalia Mytilineou']),
        ]),
      ]),
      sectionCard(t('section.about'), [
        textBlock(''),
      ]),
    ]
  );
}
