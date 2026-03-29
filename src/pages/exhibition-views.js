import { mountPage, el } from '../ui.js';
import { t } from '../i18n.js';

export async function renderExhibitionViews(app) {
  const enableTapOverlay =
    window.matchMedia && window.matchMedia('(hover: none) and (pointer: coarse)').matches;

  const images = [
    {
      src: './resources/installation/installation-01.jpg',
      alt: 'Exhibition view 1',
      featured: true,
      orientation: 'landscape',
      captionKey: 'exhibition_views.caption_1',
    },
    {
      src: './resources/installation/installation-03.jpg',
      alt: 'Exhibition view 2',
      orientation: 'landscape',
      captionKey: 'exhibition_views.caption_2',
    },
    {
      src: './resources/installation/installation-02.jpg',
      alt: 'Exhibition view 3',
      orientation: 'portrait',
      captionKey: 'exhibition_views.caption_3',
    },
    {
      src: './resources/installation/installation-05.jpg',
      alt: 'Exhibition view 4',
      orientation: 'portrait',
      captionKey: 'exhibition_views.caption_4',
    },
    {
      src: './resources/installation/installation-04.jpg',
      alt: 'Exhibition view 5',
      orientation: 'landscape',
      captionKey: 'exhibition_views.caption_5',
    },
    {
      src: './resources/installation/installation-06.jpg',
      alt: 'Exhibition view 6',
      orientation: 'landscape',
      captionKey: 'exhibition_views.caption_6',
    },
    {
      src: './resources/installation/installation-07.jpg',
      alt: 'Exhibition view 7',
      orientation: 'portrait',
      wide: true,
      captionKey: 'exhibition_views.caption_7',
    },
  ];

  const grid = el(
    'div',
    { class: 'installation-grid' },
    images.map((img) => {
      const orientationClass = img.orientation === 'portrait' ? 'installation-item--portrait' : 'installation-item--landscape';
      const wideClass = img.wide ? ' installation-item--wide' : '';
      const figure = el('figure', {
        class: img.featured
          ? `installation-item installation-item--featured ${orientationClass}${wideClass}`
          : `installation-item ${orientationClass}${wideClass}`,
      });

      const overlay = el('div', { class: 'installation-overlay' }, [t(img.captionKey)]);
      const media = el('div', { class: 'installation-media' }, [
        el('img', {
          class: 'installation-img',
          src: img.src,
          alt: img.alt,
          loading: 'lazy',
        }),
        overlay,
      ]);

      figure.appendChild(media);
      if (enableTapOverlay) {
        figure.addEventListener('click', () => {
          figure.classList.toggle('is-credit-visible');
        });
      }

      return figure;
    })
  );

  mountPage(
    app,
    {
      title: t('exhibition_views.title'),
      navActive: 'exhibition-views',
      bodyClass: 'page-exhibition-views',
      showCredit: false,
    },
    [grid]
  );
}
