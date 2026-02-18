import { mountPage, sectionCard, textBlock } from '../ui.js';
import { t } from '../i18n.js';

export async function renderBibliography(app) {
  mountPage(
    app,
    {
      title: t('bibliography.title'),
      navActive: 'bibliography',
    },
    [
      sectionCard(t('section.references'), [
        textBlock(''),
      ]),
    ]
  );
}
