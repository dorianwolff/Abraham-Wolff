import { mountPage, el } from '../ui.js';
import { t } from '../i18n.js';

export async function renderInstallationPhotos(app) {
  const enableTapOverlay =
    window.matchMedia && window.matchMedia('(hover: none) and (pointer: coarse)').matches;

  const images = [
    { src: './resources/installation/installation-01.jpg', alt: 'Installation photo 1', featured: true, orientation: 'landscape' },
    { src: './resources/installation/installation-03.jpg', alt: 'Installation photo 3', orientation: 'landscape' },
    { src: './resources/installation/installation-02.jpg', alt: 'Installation photo 2', orientation: 'portrait' },
    { src: './resources/installation/installation-05.jpg', alt: 'Installation photo 5', orientation: 'portrait' },
    { src: './resources/installation/installation-04.jpg', alt: 'Installation photo 4', orientation: 'landscape' },
    { src: './resources/installation/installation-06.jpg', alt: 'Installation photo 6', orientation: 'landscape' },
    { src: './resources/installation/installation-07.jpg', alt: 'Installation photo 7', orientation: 'portrait', wide: true },
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

      const overlay = el('div', { class: 'installation-overlay' }, [t('installation_photos.credit')]);
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
      title: t('installation_photos.title'),
      navActive: 'installation-photos',
      bodyClass: 'page-installation',
      showCredit: false,
    },
    [grid]
  );
}
