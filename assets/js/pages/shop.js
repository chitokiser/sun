import { initLayout } from '../layout.js';
import { t, tx } from '../i18n.js';
import { subscribeProducts, PRODUCT_TYPES } from '../products.js';
import { productCard, bindProductGrid } from '../ui.js';

initLayout('shop');

const params = new URLSearchParams(location.search);
const state = { type: PRODUCT_TYPES.includes(params.get('type')) ? params.get('type') : 'all', q: '', sort: 'default' };
let products = [];
let loaded = false;
const grid = document.querySelector('[data-grid]');
const filter = document.querySelector('[data-filter]');

function visible() {
  const q = state.q.trim().toLowerCase();
  let list = products.filter((p) => (state.type === 'all' || p.type === state.type)
    && (!q || tx(p.name).toLowerCase().includes(q) || tx(p.description).toLowerCase().includes(q)));
  if (state.sort === 'low') list = [...list].sort((a, b) => a.price - b.price);
  if (state.sort === 'high') list = [...list].sort((a, b) => b.price - a.price);
  return list;
}

function renderFilter() {
  const types = PRODUCT_TYPES.filter((ty) => !loaded || ty === state.type || products.some((p) => p.type === ty));
  filter.innerHTML = ['all', ...(loaded ? types : [])].map((type) => {
    const n = type === 'all' ? products.length : products.filter((p) => p.type === type).length;
    return `<button class="chip${state.type === type ? ' is-on' : ''}" role="tab" aria-selected="${state.type === type}" data-type="${type}">
      ${type === 'all' ? t('cat.all') : t('type.' + type)}${loaded ? ` <span class="chip__n">${n}</span>` : ''}</button>`;
  }).join('');
}

function render() {
  renderFilter();
  if (!loaded) return;
  const list = visible();
  document.querySelector('[data-sample-notice]').hidden = !products.some((p) => p.sample);
  document.querySelector('[data-count]').textContent = `${list.length}${t('shop.count')}`;
  grid.innerHTML = list.length ? list.map(productCard).join('') : `<p class="muted">${t('shop.empty')}</p>`;
}

filter.addEventListener('click', (e) => {
  const b = e.target.closest('[data-type]'); if (!b) return;
  state.type = b.dataset.type;
  const url = new URL(location.href);
  if (state.type === 'all') url.searchParams.delete('type'); else url.searchParams.set('type', state.type);
  history.replaceState(null, '', url);
  render();
});
document.querySelector('[data-search]').addEventListener('input', (e) => { state.q = e.target.value; render(); });
document.querySelector('[data-sort]').addEventListener('change', (e) => { state.sort = e.target.value; render(); });

bindProductGrid(grid, () => products);
subscribeProducts((list) => { products = list; loaded = true; render(); },
  () => { grid.innerHTML = `<p class="muted">${t('shop.error')}</p>`; });

render();
document.addEventListener('langchange', render);
