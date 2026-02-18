import { mountPage, sectionCard, textBlock } from '../ui.js';
import { t } from '../i18n.js';

export async function renderDaCapo(app) {
  mountPage(
    app,
    {
      title: t('da_capo.title'),
      navActive: 'da-capo',
    },
    [
      sectionCard(t('section.text'), [
        textBlock(''),
      ]),
    ]
  );
}
