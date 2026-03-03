import { mountPage, sectionCard, textBlock, el } from '../ui.js';
import { t } from '../i18n.js';

export async function renderAbout(app) {
  const curatorBlock = ({ name, imgSrc, alt }) =>
    el('div', { class: 'curator' }, [
      el('img', {
        class: 'curator-img',
        src: imgSrc,
        alt,
        loading: 'lazy',
      }),
      el('div', { class: 'curator-meta' }, [
        el('div', { class: 'curator-name' }, [name]),
        el('div', { class: 'curator-text' }, ['']),
      ]),
    ]);

  const curators = [
    curatorBlock({
      name: 'Julia Tavares',
      imgSrc: './Images/artists/Julia%20Tavares%20(curator).JPG',
      alt: 'Julia Tavares',
    }),
    curatorBlock({
      name: 'Amalia Mytilineou',
      imgSrc: './Images/artists/Amalia%20Mytilineou%20(curator).jpeg',
      alt: 'Amalia Mytilineou',
    }),
  ];
  if (Math.random() < 0.5) curators.reverse();

  mountPage(
    app,
    {
      navActive: 'about',
      bodyClass: 'page-about',
      showCredit: false,
    },
    [
      el('div', { class: 'about-grid' }, [
        el('div', { class: 'about-col about-col--exhibition' }, [
          sectionCard('', [textBlock('')]),
        ]),
        el('div', { class: 'about-col about-col--curators' }, [
          sectionCard(t('about.curators_title'), [
            el('div', { class: 'curators' }, [
              ...curators,
            ]),
          ]),
        ]),
      ]),
    ]
  );
}
