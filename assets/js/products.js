/**
 * 상품: BestERP 상품 마스터(Firestore merchant_products) 실시간 조회.
 * 다른 가맹점 사이트와 같은 조건: merchant_id in [id, Number(id)] && sale_status == 'published'
 * 필드 해석은 베스트클럽_mcp/src/domain/product.ts 의 productFromDoc 과 동일.
 */
import { MERCHANT, isMerchantConfigured } from './config.js';

export const PRODUCT_TYPES = ['physical_product', 'service', 'menu', 'booking'];

function normalize(id, d) {
  const images = Array.isArray(d.images) ? d.images.filter((x) => typeof x === 'string' && x) : [];
  if (!images.length && d.image_url) images.push(d.image_url);
  const options = (Array.isArray(d.options) ? d.options : []).map((o) => ({
    name: String(o?.name || ''),
    addedPrice: Number(o?.added_price ?? o?.addedPrice ?? 0) || 0,
  })).filter((o) => o.name);
  const stock = d.inventory_stock ?? (typeof d.inventory === 'number' ? d.inventory : null);
  const managed = d.inventory_managed === true || stock !== null;
  return {
    id,
    name: String(d.product_name || ''),
    description: String(d.description || ''),
    type: String(d.product_type || ''),
    price: Number(d.price) || 0,
    currency: String(d.currency || 'VND'),
    options,
    images,
    soldOut: managed && Number(stock) <= 0,
    order: Number(d.display_order ?? 999),
    sample: false,
  };
}

/** @returns unsubscribe */
export function subscribeProducts(onData, onError) {
  if (!isMerchantConfigured()) {
    onData(SAMPLE_PRODUCTS);
    return () => {};
  }
  let unsub = () => {};
  let cancelled = false;
  import('./firebase.js').then(({ db, fb }) => {
    if (cancelled) return;
    const id = String(MERCHANT.merchantId);
    const ids = /^\d+$/.test(id) ? [id, Number(id)] : [id];
    const q = fb.query(
      fb.collection(db, 'merchant_products'),
      fb.where('merchant_id', 'in', ids),
      fb.where('sale_status', '==', 'published'),
    );
    unsub = fb.onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => normalize(d.id, d.data()));
      list.sort((a, b) => a.order - b.order);
      onData(list);
    }, (err) => { console.error('[products] merchant_products 조회 실패', err); onError?.(err); });
  }).catch((err) => { console.error('[products] Firebase 로드 실패', err); onError?.(err); });
  return () => { cancelled = true; unsub(); };
}

export function formatPrice(amount, currency = 'VND') {
  const locale = currency === 'KRW' ? 'ko-KR' : currency === 'USD' ? 'en-US' : 'vi-VN';
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: currency === 'USD' ? 2 : 0 }).format(amount);
  } catch { return `${amount.toLocaleString()} ${currency}`; }
}

// merchantId 미설정 시 레이아웃 확인용 샘플 (화면에 '샘플' 배지 표시)
const s = (id, name, type, price, description, order, options = []) =>
  ({ id, name, type, price, currency: 'VND', description, images: [], options, soldOut: false, order, sample: true });
export const SAMPLE_PRODUCTS = [
  s('sample-1', { ko: '성인 CPR 실습 마네킹', vi: 'Mô hình thực hành CPR người lớn' }, 'physical_product', 0,
    { ko: '가슴압박·인공호흡 실습용 교육 마네킹 (예시 항목).', vi: 'Mô hình đào tạo ép tim, thổi ngạt (mục minh hoạ).' }, 1),
  s('sample-2', { ko: '영아 CPR 실습 마네킹', vi: 'Mô hình thực hành CPR trẻ sơ sinh' }, 'physical_product', 0,
    { ko: '영아 심폐소생술 교육용 (예시 항목).', vi: 'Dùng cho đào tạo hồi sức trẻ sơ sinh (mục minh hoạ).' }, 2),
  s('sample-3', { ko: 'AED 교육용 트레이너', vi: 'Máy AED dùng cho đào tạo' }, 'physical_product', 0,
    { ko: '자동심장충격기 사용법 실습용 (예시 항목).', vi: 'Thực hành sử dụng máy sốc tim tự động (mục minh hoạ).' }, 3),
  s('sample-4', { ko: '응급처치 교육 키트', vi: 'Bộ dụng cụ đào tạo sơ cứu' }, 'physical_product', 0,
    { ko: '붕대·부목 등 응급처치 실습 구성 (예시 항목).', vi: 'Băng, nẹp và dụng cụ thực hành sơ cứu (mục minh hoạ).' }, 4),
  s('sample-5', { ko: '분말 소화기', vi: 'Bình chữa cháy bột' }, 'physical_product', 0,
    { ko: '초기 화재 대응용 소화기 (예시 항목).', vi: 'Bình chữa cháy xử lý đám cháy ban đầu (mục minh hoạ).' }, 5),
  s('sample-6', { ko: '소방 안전 교육용 소화기', vi: 'Bình chữa cháy dùng cho đào tạo' }, 'physical_product', 0,
    { ko: '소화기 사용법 반복 실습용 (예시 항목).', vi: 'Dùng để thực hành sử dụng bình chữa cháy (mục minh hoạ).' }, 6),
  s('sample-7', { ko: 'CPR · 응급처치 출장 교육', vi: 'Đào tạo CPR · sơ cứu tại đơn vị' }, 'service', 0,
    { ko: '학교·기업 방문 교육 (예시 항목).', vi: 'Đào tạo tại trường học, doanh nghiệp (mục minh hoạ).' }, 7),
  s('sample-8', { ko: '기관 납품 견적 상담', vi: 'Tư vấn báo giá cho tổ chức' }, 'booking', 0,
    { ko: '수량·용도별 맞춤 견적 (예시 항목).', vi: 'Báo giá theo số lượng và mục đích (mục minh hoạ).' }, 8),
];
