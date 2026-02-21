import { mountPage, el } from '../ui.js';
import { t } from '../i18n.js';
import { arrowWheel } from '../ui/arrowWheel.js';

export async function renderHomepage(app) {
  const names = [
    'Oscar Bony',
    'Taras',
    'Camille Brée',
    'Anna de Castro Barbosa',
    'Juan Gugger',
    'Hélène Janicot',
    'Dilara Koz',
    'Adrien Lagrange',
    'Seung Won Kwon',
    'Patricio Lima Quintana',
    'Lyz Parayzo',
    'Hanna Rochereau',
    'Mick Schmitt',
  ];

  const heroWrap = arrowWheel(names);

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
