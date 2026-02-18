import { mountPage, sectionCard, textBlock } from '../ui.js';
import { t } from '../i18n.js';

export async function renderExhibitionText(app) {
  mountPage(
    app,
    {
      title: t('exhibition_text.title'),
      navActive: 'exhibition-text',
    },
    [
      sectionCard(t('section.text'), [
        textBlock(''),
      ]),
    ]
  );
}
