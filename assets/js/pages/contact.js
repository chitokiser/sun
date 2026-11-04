import { initLayout } from '../layout.js';
import { t, tx } from '../i18n.js';
import { MERCHANT } from '../config.js';
import { esc } from '../ui.js';

initLayout('contact');
const c = MERCHANT.contact;

function renderWays() {
  const ways = [
    c.phone && [t('contact.phoneL'), c.phone, `tel:${c.phone.replace(/[^\d+]/g, '')}`],
    c.email && [t('contact.emailL'), c.email, `mailto:${c.email}`],
    c.zalo && ['Zalo', c.zalo, `https://zalo.me/${c.zalo.replace(/[^\d]/g, '')}`],
    c.kakao && ['KakaoTalk', 'Open chat', c.kakao],
    tx(c.address) && [t('contact.addrL'), tx(c.address), ''],
  ].filter(Boolean);
  document.querySelector('[data-ways]').innerHTML = ways.length
    ? ways.map(([k, v, href]) => `<li><span>${esc(k)}</span>${href ? `<a href="${esc(href)}" target="${href.startsWith('http') ? '_blank' : '_self'}" rel="noopener">${esc(v)}</a>` : `<b>${esc(v)}</b>`}</li>`).join('')
    : '<li class="muted">—</li>';
  document.querySelector('[data-hours]').textContent = tx(c.hours);
  document.querySelector('[data-form-note]').hidden = Boolean(c.email);
}

document.querySelector('[data-form]').addEventListener('submit', (e) => {
  e.preventDefault();
  const f = e.target;
  if (!f.reportValidity()) return;
  if (!c.email) { document.querySelector('[data-form-note]').hidden = false; return; }
  const d = Object.fromEntries(new FormData(f));
  const body = `${t('contact.name')}: ${d.name}\n${t('contact.phone')}: ${d.phone}\n\n${d.message}`;
  location.href = `mailto:${encodeURIComponent(c.email)}?subject=${encodeURIComponent(`[${MERCHANT.brand.vi}] ${d.subject}`)}&body=${encodeURIComponent(body)}`;
});

renderWays();
document.addEventListener('langchange', renderWays);
