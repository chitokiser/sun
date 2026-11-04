/** 장바구니 (브라우저 localStorage, 사이트 전용) */
const KEY = 'sunvn_cart_v1';
const listeners = new Set();

function read() {
  try { const v = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(v) ? v : []; } catch { return []; }
}
function write(items) {
  try { localStorage.setItem(KEY, JSON.stringify(items)); } catch {}
  listeners.forEach((fn) => fn(items));
}

export const cart = {
  items: read,
  onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); },
  count: () => read().reduce((n, i) => n + i.qty, 0),
  total: () => read().reduce((n, i) => n + i.unitPrice * i.qty, 0),
  currency: () => read()[0]?.currency || 'VND',
  add(product, { option = null, qty = 1 } = {}) {
    const key = `${product.id}::${option?.name || ''}`;
    const items = read();
    const found = items.find((i) => i.key === key);
    if (found) found.qty += qty;
    else items.push({
      key, id: product.id, name: product.name, option: option?.name || '',
      unitPrice: product.price + (option?.addedPrice || 0), currency: product.currency,
      image: product.images?.[0] || '', qty,
    });
    write(items);
  },
  setQty(key, qty) {
    const items = read().map((i) => (i.key === key ? { ...i, qty: Math.max(1, qty) } : i));
    write(items);
  },
  remove(key) { write(read().filter((i) => i.key !== key)); },
  clear() { write([]); },
};

window.addEventListener('storage', (e) => { if (e.key === KEY) listeners.forEach((fn) => fn(read())); });
