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
  s('sample-1', { ko: '프리미엄 홍삼 스틱 30포', vi: 'Hồng sâm Hàn Quốc dạng gói (30 gói)' }, 'physical_product', 890000,
    { ko: '6년근 홍삼 농축액을 한 포씩 간편하게.', vi: 'Tinh chất hồng sâm 6 năm tuổi, tiện dùng mỗi ngày.' }, 1,
    [{ name: '30포 / 30 gói', addedPrice: 0 }, { name: '60포 / 60 gói', addedPrice: 790000 }]),
  s('sample-2', { ko: '저자극 선크림 SPF50+', vi: 'Kem chống nắng dịu nhẹ SPF50+' }, 'physical_product', 320000,
    { ko: '강한 햇살에도 산뜻한 데일리 자외선 차단.', vi: 'Chống nắng hằng ngày, nhẹ mặt dưới nắng gắt.' }, 2),
  s('sample-3', { ko: '피부·두피 1:1 상담', vi: 'Tư vấn da & da đầu 1:1' }, 'service', 250000,
    { ko: '전문 상담사와 맞춤 상담 1회.', vi: 'Một buổi tư vấn riêng cùng chuyên viên.' }, 3),
  s('sample-4', { ko: '한방 쌍화차 세트', vi: 'Bộ trà thảo mộc Ssanghwa' }, 'menu', 180000,
    { ko: '따뜻하게 즐기는 전통 한방차.', vi: 'Trà thảo mộc truyền thống Hàn Quốc.' }, 4),
  s('sample-5', { ko: '안마의자 체험 예약 (30분)', vi: 'Đặt lịch trải nghiệm ghế massage (30 phút)' }, 'booking', 150000,
    { ko: '매장 방문 체험 예약.', vi: 'Đặt lịch trải nghiệm tại cửa hàng.' }, 5),
  s('sample-6', { ko: '콜라겐 앰플 50ml', vi: 'Tinh chất collagen 50ml' }, 'physical_product', 560000,
    { ko: '탄력 케어 고농축 앰플.', vi: 'Tinh chất cô đặc giúp da săn chắc.' }, 6),
  s('sample-7', { ko: '건강식품 정기배송 (월)', vi: 'Giao thực phẩm chức năng định kỳ (tháng)' }, 'service', 1200000,
    { ko: '매월 집 앞으로 배송되는 맞춤 구성.', vi: 'Gói tuỳ chọn giao tận nhà mỗi tháng.' }, 7),
  s('sample-8', { ko: '아로마 디퓨저 선물세트', vi: 'Bộ quà tặng tinh dầu khuếch tán' }, 'physical_product', 420000,
    { ko: '선물하기 좋은 패키지.', vi: 'Hộp quà sang trọng, dễ tặng.' }, 8),
];
