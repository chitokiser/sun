import { initLayout, session, login } from '../layout.js';
import { t } from '../i18n.js';
import { subscribeProducts, PRODUCT_TYPES } from '../products.js';
import { productCard, bindProductGrid, typeIcon, ICONS } from '../ui.js';

initLayout('home');

let products = [];
const grid = document.querySelector('[data-grid]');
const cats = document.querySelector('[data-cats]');
document.querySelectorAll('[data-ic]').forEach((el) => { el.innerHTML = ICONS[el.dataset.ic]; });

function renderCats() {
  cats.innerHTML = PRODUCT_TYPES.map((type) => `
    <a class="cat" href="shop.html?type=${type}">
      <span class="cat__ic">${typeIcon(type)}</span>
      <span class="cat__t">${t('type.' + type)}</span>
      <span class="cat__d">${t('type.' + type + '.d')}</span>
    </a>`).join('');
}
function renderGrid() {
  document.querySelector('[data-sample-notice]').hidden = !products.some((p) => p.sample);
  grid.innerHTML = products.length ? products.slice(0, 8).map(productCard).join('') : `<p class="muted">${t('shop.empty')}</p>`;
}

bindProductGrid(grid, () => products);
subscribeProducts((list) => { products = list; renderGrid(); },
  () => { grid.innerHTML = `<p class="muted">${t('shop.error')}</p>`; });

document.querySelectorAll('[data-join]').forEach((b) => b.addEventListener('click', () => { if (!session.user) login(); }));
session.onChange((u) => {
  const l = document.querySelector('[data-join-label]');
  if (l) { l.dataset.i18n = u ? 'join.done' : 'join.cta'; l.textContent = t(l.dataset.i18n); }
});

renderCats();
document.addEventListener('langchange', () => { renderCats(); renderGrid(); });
