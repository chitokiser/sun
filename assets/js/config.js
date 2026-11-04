/**
 * 썬베트남(SUN VIETNAM) 가맹점 설정 — 이 파일 한 곳만 고치면 사이트 전체에 반영됩니다.
 *
 * merchantId : BestClub Firestore merchants/{merchantId} 정식 문서 ID.
 *              비워두면 사이트는 "샘플 상품"으로 동작하고, 회원 멘토 자동 지정도 하지 않습니다.
 *              ID 발급 후 여기 입력 + 베스트클럽_mcp/config/merchants.json 에 등록하세요 (README 참고).
 * ownerEmail : 가맹점주(CEO) Google 계정. 가입 회원의 mentorEmail 로 기록됩니다.
 */
export const MERCHANT = {
  merchantId: '',
  ownerEmail: 'hexdao722@gmail.com',

  brand: { ko: '썬베트남', vi: 'SUN VIETNAM', en: 'SUN VIETNAM' },
  logoUrl: 'https://sunmedi.net/web/upload/free_design/head_logo_active.png',

  // BestClub 채널 (결제·리워드는 BestClub 기존 시스템에서 처리)
  bestclubUrl: 'https://bestclubvn.netlify.app/',
  mallUrl: 'https://bestclubvn.netlify.app/mall.html',

  // 연락처 — 비어 있는 항목은 화면에 표시되지 않습니다.
  contact: {
    phone: '0988-123-456',
    email: 'contact@bestwinnervn.com',
    zalo: '',        // 예: '0901234567'  → https://zalo.me/0901234567
    kakao: '',       // 카카오톡 오픈채팅 URL
    address: {
      ko: '하노이시 하동구 완푹 서비스 토지 구역 NO 6B-LK46B',
      vi: 'NO 6B-LK46B service land area, Vạn Phúc, Q. Hà Đông, Hà Nội',
    },
    hours: { ko: '평일 09:00 – 18:00', vi: 'Thứ 2 – Thứ 6, 09:00 – 18:00' },
  },

  // 법인 정보 (푸터) — bestwinnervn.com 푸터와 동일
  business: {
    companyName: { ko: '베스트위너 VN 유한회사', vi: 'CÔNG TY TNHH BEST WINNER VN' },
    companyNameEn: 'BEST WINNER VN LIMITED COMPANY',
    taxCode: '0110245813',          // MST · 사업자 등록번호
    representative: { ko: '김성원 (Kim Sung Won)', vi: 'Kim Sung Won' },
    capital: '1,270,000,000 VND',
    established: { ko: '2023년 2월 9일', vi: '09/02/2023' },
  },
};

export const isMerchantConfigured = () => Boolean(String(MERCHANT.merchantId).trim());
