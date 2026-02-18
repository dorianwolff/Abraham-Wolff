import { mountPage, sectionCard, textBlock } from '../ui.js';
import { t } from '../i18n.js';

export async function renderExhibitionViews(app) {
  mountPage(
    app,
    {
      title: t('exhibition_views.title'),
      navActive: 'exhibition-views',
    },
    [
      sectionCard(t('section.views'), [
        textBlock(''),
      ]),
    ]
  );
}
