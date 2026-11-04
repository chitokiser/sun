/** 공통 레이아웃: 헤더 · 모바일 메뉴 · 장바구니 서랍 · 푸터 · 로그인 상태 */
import { MERCHANT } from './config.js';
import { t, tx, getLang, setLang, applyI18n } from './i18n.js';
import { cart } from './cart.js';
import { formatPrice as fmt } from './products.js';
const formatPrice = (n, c) => (Number(n) > 0 ? fmt(n, c) : t('p.quote'));
import { ICONS, esc, toast } from './ui.js';

const NAV = [
  ['home', 'index.html', 'nav.home'],
  ['shop', 'shop.html', 'nav.shop'],
  ['about', 'about.html', 'nav.about'],
  ['contact', 'contact.html', 'nav.contact'],
];

export const session = {
  user: null,
  listeners: new Set(),
  onChange(fn) { this.listeners.add(fn); fn(this.user); },
  set(u) { this.user = u; this.listeners.forEach((fn) => fn(u)); },
};

let firebaseMod = null;
async function loadFirebase() {
  if (!firebaseMod) firebaseMod = await import('./firebase.js');
  return firebaseMod;
}

export async function login() {
  try {
    const { fb } = await loadFirebase();
    const res = await fb.signIn();
    const { ensureMemberRegistration } = await import('./members.js');
    await ensureMemberRegistration(res.user);
    toast(`${t('auth.welcome')}, ${res.user.displayName || res.user.email}`);
  } catch (e) {
    if (e?.code !== 'auth/popup-closed-by-user' && e?.code !== 'auth/cancelled-popup-request') {
      console.error('[auth]', e); toast(t('auth.failed'));
    }
  }
}
async function logout() { const { fb } = await loadFirebase(); await fb.signOut(); }

const brandName = () => tx(MERCHANT.brand);

function logoHtml() {
  const srcset = MERCHANT.logoUrl2x ? ` srcset="${esc(MERCHANT.logoUrl)} 1x, ${esc(MERCHANT.logoUrl2x)} 2x"` : '';
  return `<a class="logo" href="index.html" aria-label="${esc(brandName())}">
    <img class="logo__mark" src="${esc(MERCHANT.logoUrl)}"${srcset} alt="" width="40" height="39" onerror="this.hidden=true;this.nextElementSibling.hidden=false">
    <span class="logo__sun" hidden></span>
    <span class="logo__text">${esc(MERCHANT.brand.vi)}</span>
  </a>`;
}

function headerHtml(active) {
  const links = NAV.map(([k, href, key]) => `<a href="${href}" class="${k === active ? 'is-active' : ''}" ${k === active ? 'aria-current="page"' : ''} data-i18n="${key}"></a>`).join('');
  return `
  <div class="topbar"><div class="wrap"><span data-i18n="topbar"></span></div></div>
  <header class="header"><div class="wrap header__in">
    <button class="iconbtn header__burger" data-nav-toggle aria-label="menu">${ICONS.menu}</button>
    ${logoHtml()}
    <nav class="nav" aria-label="main">${links}</nav>
    <div class="header__actions">
      <button class="langbtn" data-lang aria-label="language">${ICONS.globe}<span data-lang-label></span></button>
      <button class="iconbtn" data-auth aria-label="account">${ICONS.user}<span class="header__user" data-auth-label></span></button>
      <button class="iconbtn cartbtn" data-cart-open aria-label="cart">${ICONS.cart}<span class="cartbtn__n" data-cart-count hidden></span></button>
    </div>
  </div></header>
  <div class="mnav" data-mnav hidden>
    <div class="mnav__backdrop" data-nav-toggle></div>
    <nav class="mnav__panel">${links}</nav>
  </div>`;
}

function footerHtml() {
  const c = MERCHANT.contact, b = MERCHANT.business;
  const rows = [
    tx(b.representative) && [t('footer.rep'), tx(b.representative)],
    b.taxCode && [t('footer.tax'), b.taxCode],
    b.capital && [t('footer.capital'), b.capital],
    tx(b.established) && [t('footer.est'), tx(b.established)],
    tx(c.address) && [t('footer.hq'), tx(c.address)],
    c.phone && [t('contact.phoneL'), c.phone],
    c.email && [t('contact.emailL'), c.email],
  ].filter(Boolean);
  return `<footer class="footer"><div class="wrap footer__in">
    <div class="footer__brand">
      <p class="footer__name">${esc(brandName())}</p>
      <p class="footer__partner"><span class="dot"></span>${t('footer.partner')}</p>
    </div>
    <div class="footer__corp">
      <p class="footer__label">${t('footer.corp')}</p>
      <p class="footer__company">${esc(b.companyNameEn || tx(b.companyName))}${tx(b.companyName) && b.companyNameEn ? ` <span>(${esc(tx(b.companyName))})</span>` : ''}</p>
      <dl class="footer__info">${rows.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
    </div>
    <nav class="footer__nav">${NAV.map(([, href, key]) => `<a href="${href}">${t(key)}</a>`).join('')}<a href="${esc(MERCHANT.bestclubUrl)}" target="_blank" rel="noopener">BestClub ↗</a></nav>
    <p class="footer__copy">© ${new Date().getFullYear()} ${esc(b.companyNameEn || MERCHANT.brand.vi)}. ${t('footer.rights')}${b.taxCode ? ` · Tax Code: ${esc(b.taxCode)}` : ''}</p>
  </div></footer>`;
}

function drawerHtml() {
  return `<div class="drawer" data-drawer hidden>
    <div class="drawer__backdrop" data-cart-close></div>
    <aside class="drawer__panel" role="dialog" aria-modal="true" aria-labelledby="cart-title">
      <div class="drawer__head"><h2 id="cart-title" data-i18n="cart.title"></h2><button class="iconbtn" data-cart-close aria-label="close">${ICONS.close}</button></div>
      <div class="drawer__body" data-cart-body></div>
      <div class="drawer__foot" data-cart-foot></div>
    </aside>
  </div>`;
}

function renderCart() {
  const body = document.querySelector('[data-cart-body]');
  const foot = document.querySelector('[data-cart-foot]');
  const items = cart.items();
  const n = cart.count();
  document.querySelectorAll('[data-cart-count]').forEach((el) => { el.textContent = n > 99 ? '99+' : n; el.hidden = n === 0; });
  if (!body) return;
  if (!items.length) { body.innerHTML = `<p class="muted center pad">${t('cart.empty')}</p>`; foot.innerHTML = ''; return; }
  body.innerHTML = items.map((i) => `
    <div class="citem">
      <div class="citem__info"><p class="citem__name">${esc(i.name)}</p>${i.option ? `<p class="citem__opt">${esc(i.option)}</p>` : ''}
        <p class="citem__price">${formatPrice(i.unitPrice * i.qty, i.currency)}</p></div>
      <div class="citem__ctrl">
        <div class="qty qty--sm"><button data-q="-1" data-k="${esc(i.key)}" aria-label="-">−</button><span>${i.qty}</span><button data-q="1" data-k="${esc(i.key)}" aria-label="+">+</button></div>
        <button class="linkbtn" data-rm="${esc(i.key)}">${t('cart.remove')}</button>
      </div>
    </div>`).join('');
  const email = MERCHANT.contact.email;
  const summary = items.map((i) => `- ${i.name}${i.option ? ` (${i.option})` : ''} x${i.qty}`).join('\n');
  const mail = email ? `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(`[${MERCHANT.brand.vi}] Order`)}&body=${encodeURIComponent(summary + `\n\nTotal: ${formatPrice(cart.total(), cart.currency())}`)}` : '';
  foot.innerHTML = `
    <div class="drawer__total"><span>${t('cart.total')}</span><strong>${formatPrice(cart.total(), cart.currency())}</strong></div>
    <button class="btn btn--primary btn--block" data-checkout>${t('cart.checkout')}</button>
    ${mail ? `<a class="btn btn--ghost btn--block" href="${mail}">${t('cart.inquiry')}</a>` : ''}
    <p class="muted small">${t('cart.note')}</p>`;
}

export function initLayout(active) {
  document.getElementById('site-header').innerHTML = headerHtml(active);
  document.getElementById('site-footer').innerHTML = footerHtml();
  document.body.insertAdjacentHTML('beforeend', drawerHtml());

  const paint = () => {
    applyI18n();
    document.querySelector('[data-lang-label]').textContent = getLang() === 'ko' ? 'VI' : 'KO';
    document.getElementById('site-footer').innerHTML = footerHtml();
    renderCart(); paintAuth();
  };

  // 언어 전환: 페이지별 렌더 함수도 다시 호출
  document.querySelector('[data-lang]').addEventListener('click', () => {
    setLang(getLang() === 'ko' ? 'vi' : 'ko');
    paint(); document.dispatchEvent(new CustomEvent('langchange'));
  });

  // 모바일 메뉴
  const mnav = document.querySelector('[data-mnav]');
  document.querySelectorAll('[data-nav-toggle]').forEach((b) => b.addEventListener('click', () => { mnav.hidden = !mnav.hidden; }));

  // 장바구니
  const drawer = document.querySelector('[data-drawer]');
  const openCart = () => { renderCart(); drawer.hidden = false; document.body.classList.add('no-scroll'); };
  const closeCart = () => { drawer.hidden = true; document.body.classList.remove('no-scroll'); };
  document.querySelector('[data-cart-open]').addEventListener('click', openCart);
  drawer.addEventListener('click', (e) => {
    if (e.target.closest('[data-cart-close]')) return closeCart();
    const q = e.target.closest('[data-q]');
    if (q) { const it = cart.items().find((i) => i.key === q.dataset.k); if (it) cart.setQty(it.key, it.qty + Number(q.dataset.q)); return; }
    const rm = e.target.closest('[data-rm]'); if (rm) return cart.remove(rm.dataset.rm);
    if (e.target.closest('[data-checkout]')) {
      if (!session.user) { toast(t('cart.loginFirst')); login(); return; }
      window.open(MERCHANT.mallUrl, '_blank', 'noopener');
    }
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !drawer.hidden) closeCart(); });
  cart.onChange(renderCart);
  window.sunvnOpenCart = openCart;

  // 로그인
  document.querySelector('[data-auth]').addEventListener('click', () => (session.user ? logout() : login()));
  paint();
  loadFirebase().then(({ fb }) => fb.onAuth((u) => { session.set(u); paintAuth(); }))
    .catch((e) => console.warn('[auth] Firebase 로드 실패', e));
}

function paintAuth() {
  const label = document.querySelector('[data-auth-label]');
  const btn = document.querySelector('[data-auth]');
  if (!label) return;
  const u = session.user;
  label.textContent = u ? (u.displayName || u.email || '').split(' ')[0] : t('nav.login');
  btn.title = u ? t('nav.logout') : t('nav.login');
}
