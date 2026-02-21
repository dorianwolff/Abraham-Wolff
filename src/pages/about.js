import { mountPage, sectionCard, textBlock, el } from '../ui.js';
import { t } from '../i18n.js';

export async function renderAbout(app) {
  mountPage(
    app,
    {
      title: t('about.title'),
      navActive: 'about',
      bodyClass: 'page-about',
    },
    [
      sectionCard(t('about.curators_title'), [
        el('div', { class: 'curators' }, [
          el('div', { class: 'curators-names' }, ['Amalia Mytilineou & Julia Tavares']),
        ]),
      ]),
      sectionCard(t('section.about'), [
        textBlock(''),
      ]),
    ]
  );
}
