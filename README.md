# SUN VIETNAM (썬베트남) — BestClub 가맹점 홈페이지

베트남 법인 · 하노이 하동(Quận Hà Đông, Hà Nội) 소재.

빌드 없는 정적 사이트(HTML · CSS · ES 모듈)입니다. 폴더를 그대로 Netlify 에 올리면 동작합니다.

## 로컬 실행

```powershell
cd C:\Users\Asus\Desktop\project\sunvietnam
npx serve .        # 또는  python -m http.server 8080
```

ES 모듈을 쓰므로 `index.html` 을 더블클릭(file://)으로 열면 동작하지 않습니다. 반드시 로컬 서버로 여세요.

## 페이지

| 파일 | 내용 |
|---|---|
| `index.html` | 히어로, 카테고리, 추천 상품, 선택 이유, 회원가입 배너 |
| `shop.html` | 전체 상품 (카테고리 필터 · 검색 · 가격 정렬, `?type=service` 등) |
| `about.html` | 브랜드 소개, BestClub 연동 안내 |
| `contact.html` | 문의 양식(메일 앱으로 전송), 연락처 |

## 설정 — `assets/js/config.js` 한 곳만 수정

- `merchantId` : **아직 비어 있음.** 비어 있으면 샘플 상품 8개가 '샘플' 배지와 함께 표시되고, 회원 멘토 자동 지정도 하지 않습니다.
- `ownerEmail` : `hexdao722@gmail.com` (가맹점주 / 가입 회원의 멘토)
- `logoUrl` : `https://sunmedi.net/web/upload/free_design/head_logo_active.png` (불러오지 못하면 텍스트 로고로 대체)
- `contact`, `business` : 전화 · 이메일 · Zalo · 주소 · 사업자 정보. 비어 있는 항목은 화면에 나오지 않습니다. 문의 양식과 '문의로 주문하기'는 `contact.email` 이 있어야 동작합니다.

화면 문구(한국어 / 베트남어)는 `assets/js/i18n.js` 에서 수정합니다. 언어는 브라우저 언어로 자동 선택되고 헤더의 KO/VI 버튼으로 바꿀 수 있습니다.

## BestClub 연동 (베스트클럽_mcp 개발가이드 기준)

- **상품** — Firestore `jumper-b15aa/merchant_products` 를 실시간 조회
  (`merchant_id in [id, Number(id)]` && `sale_status == 'published'`, `display_order` 순).
  대한김치 · BEST WINNER 와 같은 방식이라 MCP `bestclub_product_*` 도구로 등록 · 게시한 상품이 바로 노출됩니다.
- **회원가입 (§21.1)** — Google 로그인 시 `users/{uid}` 에 `registeredMerchantId`, `mentorUid`(`merchants/{id}.ownerUid`), `mentorEmail` 을 기록.
  이미 멘토가 있는 회원은 덮어쓰지 않고, 가맹점주 본인은 멘티로 지정하지 않습니다.
- **결제 · 리워드** — 사이트 안에서 처리하지 않습니다. 장바구니의 '결제하기'는 BestClub 통합몰(`mallUrl`)로 이동합니다.

## merchantId 발급 후 할 일

1. `assets/js/config.js` 의 `merchantId` 입력
2. `베스트클럽_mcp/config/merchants.json` 에 추가:

```json
{
  "merchantId": "<발급된 ID>",
  "name": "SUN VIETNAM",
  "aliases": ["sunvietnam", "sun_vietnam"],
  "ownerEmail": "hexdao722@gmail.com",
  "repoPath": "C:\\Users\\Asus\\Desktop\\project\\sunvietnam",
  "site": {
    "url": "<배포 주소>",
    "mode": "shared_firestore",
    "idMatch": "string_or_number",
    "note": "sunvietnam/assets/js/products.js: where merchant_id in [id, Number(id)] && sale_status == published"
  }
}
```

3. Firestore `merchants/<ID>` 문서의 `ownerEmail` · `ownerUid` 가 가맹점주 계정과 일치하는지 MCP `bestclub_access_audit` 로 확인
4. 배포 도메인을 Firebase Authentication → 승인된 도메인에 추가 (Google 로그인 팝업에 필요)

## 배포 (Netlify)

`netlify.toml` 포함. 저장소 연결 후 빌드 명령 없이 publish 디렉터리 `.` 로 배포됩니다.
