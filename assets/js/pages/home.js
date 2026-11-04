import { initLayout } from '../layout.js';
import { t } from '../i18n.js';
import { subscribeProducts } from '../products.js';
import { productCard, bindProductGrid, typeIcon, ICONS } from '../ui.js';

initLayout('home');
initHero();

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

function initHero() {
  const root = document.querySelector('[data-hero]');
  if (!root) return;
  const slides = [...root.querySelectorAll('[data-slide]')];
  const dots = [...root.querySelectorAll('[data-dot]')];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let i = 0; let timer;
  const show = (n) => {
    i = (n + slides.length) % slides.length;
    slides.forEach((s, k) => { s.classList.toggle('is-on', k === i); s.setAttribute('aria-hidden', k === i ? 'false' : 'true'); s.inert = k !== i; });
    dots.forEach((d, k) => { d.classList.toggle('is-on', k === i); d.setAttribute('aria-selected', k === i); });
    root.toggleAttribute('data-light', slides[i].classList.contains('slide--light'));
  };
  const play = () => { if (reduce) return; clearInterval(timer); timer = setInterval(() => show(i + 1), 6000); };
  root.querySelector('[data-hero-prev]').onclick = () => { show(i - 1); play(); };
  root.querySelector('[data-hero-next]').onclick = () => { show(i + 1); play(); };
  dots.forEach((d) => d.addEventListener('click', () => { show(Number(d.dataset.dot)); play(); }));
  root.addEventListener('mouseenter', () => clearInterval(timer));
  root.addEventListener('mouseleave', play);
  root.addEventListener('focusin', () => clearInterval(timer));
  let x0 = null;
  root.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
  root.addEventListener('touchend', (e) => { if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) { show(i + (dx < 0 ? 1 : -1)); play(); } x0 = null; });
  document.addEventListener('visibilitychange', () => (document.hidden ? clearInterval(timer) : play()));
  show(0); play();
}
