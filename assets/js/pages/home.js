import { initLayout } from '../layout.js';
import { t } from '../i18n.js';
import { subscribeProducts } from '../products.js';
import { productCard, bindProductGrid, typeIcon, ICONS } from '../ui.js';

initLayout('home');

let products = [];
const grid = document.querySelector('[data-grid]');
const cats = document.querySelector('[data-cats]');
document.querySelectorAll('[data-ic]').forEach((el) => { el.innerHTML = ICONS[el.dataset.ic]; });

const AREAS = [
  { n: 1, icon: 'service', href: 'shop.html' },
  { n: 2, icon: 'fire', href: 'shop.html' },
  { n: 3, icon: 'booking', href: 'contact.html' },
];
function renderCats() {
  cats.innerHTML = AREAS.map((a) => `
    <a class="cat cat--area" href="${a.href}">
      <span class="cat__ic">${ICONS[a.icon] || typeIcon(a.icon)}</span>
      <span class="cat__t">${t('area.' + a.n + '.t')}</span>
      <span class="cat__d">${t('area.' + a.n + '.d')}</span>
      <span class="cat__more">${t('area.more')} →</span>
    </a>`).join('');
}
function renderGrid() {
  document.querySelector('[data-sample-notice]').hidden = !products.some((p) => p.sample);
  grid.innerHTML = products.length ? products.slice(0, 8).map(productCard).join('') : `<p class="muted">${t('shop.empty')}</p>`;
}

bindProductGrid(grid, () => products);
subscribeProducts((list) => { products = list; renderGrid(); },
  () => { grid.innerHTML = `<p class="muted">${t('shop.error')}</p>`; });

document.querySelectorAll('[data-join]').forEach((b) => b.addEventListener('click', () => { location.href = 'contact.html'; }));

renderCats();
document.addEventListener('langchange', () => { renderCats(); renderGrid(); });
