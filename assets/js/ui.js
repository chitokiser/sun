import { t, tx } from './i18n.js';
import { formatPrice } from './products.js';
import { cart } from './cart.js';

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const safeUrl = (u) => (/^https?:\/\//i.test(u || '') ? u : '');

export const ICONS = {
  cart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6.2"/><circle cx="10" cy="20" r="1.4"/><circle cx="17" cy="20" r="1.4"/></svg>',
  user: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg>',
  menu: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  globe: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18"/></svg>',
  physical_product: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5z"/><path d="M3 7.5 12 12l9-4.5M12 12v9"/></svg>',
  service: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 18v-5a8 8 0 0 1 16 0v5"/><rect x="2.5" y="14" width="4" height="6" rx="1.5"/><rect x="17.5" y="14" width="4" height="6" rx="1.5"/></svg>',
  menu_type: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 9h12v5a6 6 0 0 1-12 0z"/><path d="M17 10h1.5a2.5 2.5 0 0 1 0 5H17M8 3c0 1.5 1 1.5 1 3M12 3c0 1.5 1 1.5 1 3"/></svg>',
  booking: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>',
  check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
  truck: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 6h11v10h-11zM13.5 9.5h4l3 3.5V16h-7"/><circle cx="6.5" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/></svg>',
  chat: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v11H9l-5 4z"/><path d="M8 10h8M8 13h5"/></svg>',
  star: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/></svg>',
};
export const typeIcon = (type) => ICONS[type === 'menu' ? 'menu_type' : type] || ICONS.physical_product;

export function productVisual(p, cls = '') {
  const img = safeUrl(p.images?.[0]);
  if (img) return `<img class="${cls}" src="${esc(img)}" alt="${esc(tx(p.name))}" loading="lazy">`;
  return `<div class="${cls} ph ph--${esc(p.type || 'physical_product')}" aria-hidden="true">${typeIcon(p.type)}</div>`;
}

export function productCard(p) {
  return `
  <article class="pcard${p.soldOut ? ' is-soldout' : ''}" data-pid="${esc(p.id)}" tabindex="0" role="button" aria-label="${esc(tx(p.name))}">
    <div class="pcard__media">
      ${productVisual(p, 'pcard__img')}
      ${p.sample ? `<span class="tag tag--sample">${t('sample.badge')}</span>` : ''}
      ${p.soldOut ? `<span class="tag tag--soldout">${t('p.soldout')}</span>` : ''}
    </div>
    <div class="pcard__body">
      <span class="pcard__type">${t('type.' + p.type) !== 'type.' + p.type ? t('type.' + p.type) : ''}</span>
      <h3 class="pcard__name">${esc(tx(p.name))}</h3>
      <p class="pcard__price">${formatPrice(p.price, p.currency)}</p>
    </div>
  </article>`;
}

/** 상품 목록 컨테이너에 카드 클릭 → 상세 모달 연결 */
export function bindProductGrid(container, getProducts) {
  const open = (el) => {
    const p = getProducts().find((x) => x.id === el.dataset.pid);
    if (p) openProductModal(p);
  };
  container.addEventListener('click', (e) => { const el = e.target.closest('[data-pid]'); if (el) open(el); });
  container.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const el = e.target.closest('[data-pid]'); if (el) { e.preventDefault(); open(el); }
  });
}

export function openProductModal(p) {
  const wrap = document.createElement('div');
  wrap.className = 'modal';
  wrap.innerHTML = `
    <div class="modal__backdrop" data-close></div>
    <div class="modal__panel" role="dialog" aria-modal="true" aria-labelledby="pm-title">
      <button class="iconbtn modal__close" data-close aria-label="close">${ICONS.close}</button>
      <div class="pm">
        <div class="pm__media">${productVisual(p, 'pm__img')}</div>
        <div class="pm__info">
          <span class="pcard__type">${esc(t('type.' + p.type))}</span>
          <h2 id="pm-title" class="pm__name">${esc(tx(p.name))}</h2>
          <p class="pm__price" data-price>${formatPrice(p.price, p.currency)}</p>
          ${p.description ? `<p class="pm__desc">${esc(tx(p.description)).replace(/\n/g, '<br>')}</p>` : ''}
          ${p.options.length ? `
            <label class="field"><span>${t('p.option')}</span>
              <select data-opt>${p.options.map((o, i) => `<option value="${i}">${esc(o.name)}${o.addedPrice ? ` (+${formatPrice(o.addedPrice, p.currency)})` : ''}</option>`).join('')}</select>
            </label>` : ''}
          <div class="field"><span>${t('p.qty')}</span>
            <div class="qty"><button type="button" data-dec aria-label="-">−</button><input data-qty type="number" min="1" value="1" inputmode="numeric"><button type="button" data-inc aria-label="+">+</button></div>
          </div>
          <button class="btn btn--primary btn--block" data-add ${p.soldOut ? 'disabled' : ''}>${p.soldOut ? t('p.soldout') : t('p.add')}</button>
        </div>
      </div>
    </div>`;
  document.body.appendChild(wrap);
  document.body.classList.add('no-scroll');
  const $ = (s) => wrap.querySelector(s);
  const qtyEl = $('[data-qty]');
  const optEl = $('[data-opt]');
  const opt = () => (optEl ? p.options[Number(optEl.value)] : null);
  const refresh = () => { $('[data-price]').textContent = formatPrice((p.price + (opt()?.addedPrice || 0)) * Math.max(1, Number(qtyEl.value) || 1), p.currency); };
  const close = () => { wrap.remove(); document.body.classList.remove('no-scroll'); document.removeEventListener('keydown', onKey); };
  const onKey = (e) => { if (e.key === 'Escape') close(); };
  document.addEventListener('keydown', onKey);
  wrap.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', close));
  $('[data-dec]').onclick = () => { qtyEl.value = Math.max(1, (Number(qtyEl.value) || 1) - 1); refresh(); };
  $('[data-inc]').onclick = () => { qtyEl.value = (Number(qtyEl.value) || 1) + 1; refresh(); };
  qtyEl.oninput = refresh; if (optEl) optEl.onchange = refresh;
  $('[data-add]').onclick = () => {
    cart.add({ ...p, name: tx(p.name) }, { option: opt(), qty: Math.max(1, Number(qtyEl.value) || 1) });
    close(); toast(t('p.added'));
  };
  $('.modal__close').focus();
}

let toastTimer;
export function toast(msg) {
  let el = document.querySelector('.toast');
  if (!el) { el = document.createElement('div'); el.className = 'toast'; el.setAttribute('role', 'status'); document.body.appendChild(el); }
  el.textContent = msg; el.classList.add('is-on');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('is-on'), 2600);
}
