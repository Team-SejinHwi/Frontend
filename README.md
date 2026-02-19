# 🎒 Re:Borrow (지역 기반 물건 및 재능 대여 플랫폼)

> **2026년 신입 웹 개발자 취업을 위한 포트폴리오 프로젝트**
> "당신의 물건에 가치를 더하다, Re:Borrow"

<br>

## 1. 📝 프로젝트 개요
* **프로젝트명:** Re:Borrow
* **배포 URL:** [https://frontend-beige-eight-18.vercel.app/](https://frontend-beige-eight-18.vercel.app/)
* **팀 구성:**
  * **Frontend:** 박세진 (React)
  * **Backend:** 남휘 (Spring Boot)
* **개발 기간:** 2025.12 ~ 2026.02 (진행 중)
* **프로젝트 목표 및 달성 현황:**
  * **심화 CRUD:** 이미지(File)와 JSON의 복합 데이터 처리 및 `Blob` 직렬화 구현
  * **실시간 통신:** `WebSocket(Stomp)`을 활용한 1:1 채팅 및 상태 동기화
  * **LBS(위치 기반):** `Kakao Maps API`를 활용한 반경 검색 및 **역지오코딩(Reverse Geocoding)** 구현
  * **UI/UX 고도화:** 최신 트렌드를 반영한 레이아웃 리팩토링 및 마이크로 인터랙션 적용
  * **거래 프로세스:** 대여 신청 → 승인/거절 → 반납 → **상태 자동 복구(State Recovery)** 로직 완성
  * **신뢰도 시스템:** 거래 완료 건에 한정된 **리뷰 및 평점 시스템** 구축
  * **결제 시스템:** Toss Payments SDK를 활용한 결제 모듈 연동 및 Mock Mode 구축

<br>

## 2. 🛠 기술 스택 (Tech Stack)

### Frontend
<img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black"> <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black"> <img src="https://img.shields.io/badge/MUI%20v6-007FFF?style=for-the-badge&logo=mui&logoColor=white">
<img src="https://img.shields.io/badge/React%20Router-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white"> <img src="https://img.shields.io/badge/React%20Hook%20Form-EC5990?style=for-the-badge&logo=reacthookform&logoColor=white"> <img src="https://img.shields.io/badge/Day.js-FB6052?style=for-the-badge&logo=dayjs&logoColor=white">

### Map & Location
<img src="https://img.shields.io/badge/Kakao%20Maps-FFCD00?style=for-the-badge&logo=kakao&logoColor=black"> <img src="https://img.shields.io/badge/React%20Kakao%20Maps%20SDK-FFCD00?style=for-the-badge&logo=kakao&logoColor=black"> <img src="https://img.shields.io/badge/Daum%20Postcode-000000?style=for-the-badge&logo=kakao&logoColor=white">

### Network & Communication
<img src="https://img.shields.io/badge/WebSocket-010101?style=for-the-badge&logo=socket.io&logoColor=white"> <img src="https://img.shields.io/badge/StompJS-000000?style=for-the-badge&logo=stomp&logoColor=white"> <img src="https://img.shields.io/badge/Fetch%20API-5A29E4?style=for-the-badge&logo=html5&logoColor=white">

### Backend (Co-work)
<img src="https://img.shields.io/badge/Spring%20Boot-6DB33F?style=for-the-badge&logo=springboot&logoColor=white"> <img src="https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white"> <img src="https://img.shields.io/badge/Spring%20Security-6DB33F?style=for-the-badge&logo=springsecurity&logoColor=white"> <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white">

### Payment & Deployment
<img src="https://img.shields.io/badge/Toss%20Payments-0064FF?style=for-the-badge&logo=toss&logoColor=white"> <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white">

<br>

## 3. ✨ 주요 기능 (Key Features)

### A. 🔐 인증 및 보안 (Authentication) - [Updated]
- **JWT 기반 인증:** 기존 세션 방식에서 고도화하여, 모든 API 요청 및 소켓 연결 시 `Authorization: Bearer` 헤더에 토큰을 적재하여 보안성을 강화했습니다.
- **사용자 식별:** 로그인 직후 `/api/members/me`를 호출하여 `userId`를 확보하고 로컬 스토리지에 저장, 채팅 및 게시글 권한 관리에 활용합니다.
- **보안 로그아웃:** `localStorage.clear()`와 함께 서버 측 토큰 만료 요청을 병행하여 클라이언트와 서버 양측의 보안 상태를 초기화합니다.

### B. 📦 물품 거래 로직 (Advanced CRUD)
- **복합 데이터 전송:** `FormData`를 활용하여 상품 이미지(File)와 상세 정보(JSON)를 동시에 처리합니다.
- **데이터 직렬화 (Serialization):** Spring Boot의 `@RequestPart` 규격을 준수하기 위해 JSON 데이터를 `Blob` 타입으로 변환하여 전송하는 고도화 로직을 적용했습니다.
- **권한 방어:** `Optional Chaining`을 통한 방어적 로직과 서버의 이중 검증을 통해 인가되지 않은 수정/삭제 요청을 원천 차단했습니다.

### C. 🗺️ 위치 기반 서비스 (Location Service) - [Updated]
- **내 주변 찾기 (LBS):** 브라우저 `Geolocation API`와 `Haversine 공식`을 활용해 사용자 반경 5km 이내의 물품만 필터링하여 보여줍니다.
- **역지오코딩 (Reverse Geocoding):** 지도 클릭 시 `Kakao Geocoder`를 통해 좌표(Lat/Lng)를 주소 텍스트로 실시간 변환하여 입력 편의성을 높였습니다.
- **주소 검색:** `Daum Postcode API`로 도로명 주소를 검색하고, 좌표로 자동 변환하여 DB에 저장합니다.
- **안정성 강화:** 카카오맵 외부 링크 이동 시 상품명에 `encodeURIComponent` 처리를 적용하여 특수문자나 공백으로 인한 URL 오류를 방지했습니다.

### D. 🔄 대여 신청 및 상태 순환 (Rental Lifecycle)
- **중복 요청 방지 및 안정화 (Debounce):** 대여 신청 버튼 클릭 시 Debounce 로직을 적용하고, 상세 페이지 내 중복 신청 차단 로직 적용 및 대여 신청 상태 유지 버그를 수정하여 안정성을 확보했습니다.
- **상태 기반 UI 및 거래 단계 세분화:** 상품 상태(AVAILABLE, RENTING, COMPLETED)에 따라 버튼 텍스트가 동적으로 변경되며, 판매자/구매자 포지션에 따른 단계별 버튼 로직(결제, 인계, 거절 등)을 세분화했습니다.
- **반납 및 복구 로직:**
  - `RENTING`(대여 중) → `RETURNED`(반납 완료) 상태 전환 API 구현.
  - 반납 완료 시 Item 상태가 자동으로 `AVAILABLE`(대여 가능)로 복구되는 **상태 연쇄 업데이트(Chaining)** 로직을 완성했습니다.

### E. 💬 실시간 1:1 채팅 (Real-time Chat)
- **WebSocket 보안 연결:** `SockJS` + `StompJS` 연결 시 핸드쉐이크 헤더에 JWT Access Token을 실어 보내 비인가 접근을 막았습니다.
- **UX 고도화:** 상대방과 본인의 메시지 디자인 구분, Day.js를 활용한 타임스탬프, 과거 대화 내역 불러오기 및 스크롤 자동 이동 기능을 구현했습니다.
- **안정성 강화:** 채팅방 생성 로직 및 API 응답에 대한 방어 코드(Error Handling)를 추가하여 예외 상황에 대비했습니다.

### F. ⭐ 후기 및 평점 시스템 (Reviews & Ratings)
- **신뢰도 강화:** 대여 상태가 `COMPLETED`(반납 완료)인 경우에만 후기 작성 버튼이 활성화되도록 제어하여 허위 리뷰를 방지합니다.
- **실시간 반영:** 상품 상세 페이지 진입 시 `Promise.all`을 이용해 상품 정보와 리뷰 목록을 병렬로 호출하며, 평균 평점을 즉시 계산하여 시각화합니다.
- **리뷰 작성 고도화:** 리뷰 작성 UI 및 로직 구축을 완료했으며, 테스트를 위한 Mock Data 업데이트를 통해 시스템 안정성을 검증했습니다.

### G. 🎨 UI/UX 및 디자인 시스템 고도화 (UI/UX Refactoring) - [Updated 🚀]

**1) 메인 페이지 및 카테고리 (Main Page & Iconography)**
- **홈 화면 리팩토링 (Component Diet):** 비대해진 `Home.jsx`를 `HeroSection`, `CategoryBar`, `HostBanner`, `FeatureSection` 등 기능 단위 하위 컴포넌트로 분리하여 가독성 및 유지보수성을 대폭 향상시켰습니다.
- **히어로 섹션 (Hero Section):** Full-Width 확장 디자인과 그라데이션/그림자 효과를 적용했습니다. 추가로 `fadeInUp` 키프레임 애니메이션 적용 및 카피라이팅 변경("소유의 시대는 끝났다...")으로 몰입감을 증대시켰습니다.
- **신뢰도 및 CTA:** 서비스 신뢰도 안내 섹션 및 호스트 모집 CTA(Call To Action) 배너를 신규 구현하여 사용자 참여를 유도합니다.
- **카테고리 UI 개편:**
  - 기존 텍스트 칩을 최신 트렌드를 반영한 **'아이콘+텍스트' 원형 버튼**으로 전면 개편했습니다.
  - `React.cloneElement`를 활용해 아이콘 스타일을 동적으로 주입하고, Hover 시 `translateY` 및 Shadow 효과를 적용하여 클릭 유도성(Affordance)을 개선했습니다.
- **여백 최적화:** 검색바와 콘텐츠 간의 여백(Spacing)을 재조정하여 전반적인 공간 효율성을 개선했습니다.

**2) 아이템 카드 리팩토링 (Item Card Interaction)**
- **입체감 부여:** 부드러운 `borderRadius(16px)`와 은은한 `box-shadow`를 적용하여 시각적 안정성을 확보했습니다.
- **마이크로 인터랙션:**
  - Hover 시 `scale(1.05)` 확대 및 위치 이동 효과를 결합하여 사용자의 선택에 대한 즉각적인 피드백을 제공합니다.
  - 리스트 로딩 시 순차적 **Fade-in** 애니메이션을 적용하여 부드러운 사용성을 제공합니다.
- **가독성 최적화:** 가격 정보의 Weight를 높이고 긴 위치 정보를 파싱하여 정보의 우선순위를 재정립했습니다.

**3) 상세 페이지 레이아웃 (Detail Page - Airbnb Style)**
- **2컬럼 그리드 시스템:** 기존 수직 나열 방식을 탈피하여 **콘텐츠(8) : 액션(4)** 비율로 분리, 정보 탐색과 결제 동선을 명확히 했습니다.
- **Sticky UI:** 우측 액션(결제/예약) 카드에 `position: sticky`를 적용하여 긴 스크롤 중에도 언제든 접근 가능하도록 사용성을 높였습니다.
- **타이포그래피 및 반응형:**
  - **가격 강조:** 가격 정보의 단위를 시각적으로 차등화(원/시간)하고, 고가 상품 대응을 위해 **반응형 폰트 사이즈(sx)**를 적용했습니다.
  - **레이아웃 대응:** 노트북(`md`) 및 모바일(`xs`) 해상도에 맞춰 자동으로 1컬럼으로 전환되는 반응형 그리드를 구현했습니다.

**4) 고급 웹 UI 기법 및 시각적 완성도 (Advanced Web UI & Visual Polish) - [New ✨]**
- **글로벌 테마 개선:** 웹사이트 전체 배경색을 눈이 편안한 은은한 회색(`#F0F2F5`)으로 변경하고, MUI `Paper`, `Box` 등을 활용해 입체감 및 시각적 깊이감을 개선했습니다(카드 배경색 `#eeeeee` 등).
- **네비게이션 바(Navbar) 분리 및 고도화:**
  - `Home`과 `MyPage`에서 중복되던 상단 헤더 코드를 `Navbar.jsx`로 분리하여 **DRY 원칙**과 **관심사 분리**를 실현했습니다.
  - 단순 텍스트에서 로고 심볼(`AllInclusiveIcon`) 및 그라데이션 타이포그래피를 적용했습니다.
  - 메인 페이지에 적용된 반투명 배경 및 Blur 효과의 **글래스모피즘(Glassmorphism)** 헤더 스타일을 서브 페이지에도 동일하게 유지하여 끊김 없는 시각적 경험을 제공합니다.
- **독창적인 UI 및 사용성 개선:**
  - 기존 클론 코딩 스타일을 탈피한 Re:Borrow만의 그림자(Box-shadow) 및 그라데이션 기반 **프리미엄 Chat UI**를 적용했습니다.
  - 검색창 입력 시에만 노출되는 'X(지우기)' 버튼 추가 및 로그인/회원가입 카드에 'X(닫기)' 버튼을 추가해 직관적인 조작을 돕습니다.
  - 거래 상태와 무관하게 메시지 내 안내 문구를 통일하여 정보 전달력을 강화했습니다.
- **스켈레톤 UI (Skeleton Screen):** 데이터 로딩 시 단순한 CircularProgress 대신 스켈레톤 UI를 적용하여 사용자의 체감 대기 시간을 단축시켰습니다.
- **반응형 최적화:** MUI Breakpoints 시스템을 활용하여 기기 해상도에 따라 폰트 사이즈와 그리드가 유기적으로 변하는 정교한 반응형 웹을 완성했습니다.
- **UI 폴리싱 (Visual Polish):**
  - **Wave Divider:** 각 섹션 경계에 SVG 웨이브 패턴을 도입하여 딱딱한 직선 대신 부드럽고 자연스러운 시선 흐름을 유도했습니다.
  - **타이포그래피 및 톤앤매너:** 주요 헤드라인에 CSS Linear-gradient를 적용해 브랜드를 강조하고, CTA 및 로그인 페이지에 일관된 파스텔톤 그라데이션을 적용했습니다.
  - **인터랙션 강화:** '내 주변 찾기' 필터 등 주요 기능에 Pulsing Badge 애니메이션을 추가하여 직관적인 조작을 유도했습니다.

### H. 💳 결제 시스템 연동 (Payment Integration) - [New ✨]
- **PG사 연동:** Toss Payments (API 개별 연동 방식)를 도입하여 결제 시스템을 구축했습니다.
- **결제 프로세스 로직:**
  1. **Request:** 클라이언트 SDK를 통해 결제창을 호출하고 카드 인증을 진행합니다.
  2. **Redirect:** 결제 성공 시 지정된 `successUrl`로 리다이렉트 처리 및 파라미터를 파싱합니다.
  3. **Confirm:** 백엔드 API (`POST /api/payments/confirm`)를 호출하여 최종 승인 및 위변조 검증을 수행합니다. (이 과정에서 발생한 Toss Payments 관련 500 에러 및 데이터 처리 로직 보완을 완료했습니다.)
- **Mock Mode 구현:** 개발 생산성을 위해 백엔드 서버 연결 없이도 결제 승인 API 호출을 시뮬레이션하여 프론트엔드 단독으로 전체 결제 사이클 테스트가 가능한 Mock Mode를 구현했습니다.

<br>

## 4. ⚙️ 개발 환경 설정 (Environment)
- **배포 환경:** `Vercel`을 통한 프론트엔드 호스팅 및 자동 배포 파이프라인 구축.
- **Proxy 미들웨어:** `http-proxy-middleware`를 도입하여 로컬 개발 시 발생하는 CORS 문제를 해결했습니다.
- **Mock Mode Architecture:** 백엔드 개발 속도와 무관하게 프론트엔드 개발이 가능하도록 독립적인 Mock 테스트 환경을 구축했습니다.
- **External Access:** 로컬 환경을 외부에서 접속할 수 있도록 `Ngrok` 및 `Cloudflare Tunnel` 환경을 구축했습니다.

<br>

## 5. 📂 프로젝트 구조 (Directory Structure) (v1.2.4)
```bash
src
├── components          # 재사용 가능한 UI 컴포넌트
│   ├── home            # 📂 (New) 홈 화면 하위 컴포넌트
│   │   ├── HeroSection.jsx    # 메인 배너 및 애니메이션
│   │   ├── CategoryBar.jsx    # 카테고리 스크롤 영역
│   │   ├── HostBanner.jsx     # 호스트 모집 섹션
│   └── └── FeatureSection.jsx # 서비스 소개 및 특징
│   ├── ChatList.jsx        # 채팅방 목록 아이템
│   ├── ItemCard.jsx        # 상품 카드 (Fade-in 및 마이크로 인터랙션)
│   ├── Navbar.jsx          # 공통 네비게이션 바 (분리 및 고도화)
│   ├── ReceivedRequests.jsx # 받은 요청 관리
│   ├── RentalModal.jsx     # 대여 신청 및 계산 모달
│   ├── ReviewModal.jsx     # 후기 작성 모달
│   └── SentRequests.jsx    # 보낸 요청 관리
├── constants           # 상수 및 공통 데이터 관리
│   └── categories.js       # 카테고리 아이콘 및 매핑 객체 관리
├── mocks               # 프론트엔드 독립 테스트 데이터
│   └── mockData.js         # 가상 데이터 셋
├── pages               # 라우팅 페이지 (Screen)
│   ├── ChatRoom.jsx        # 1:1 실시간 채팅방
│   ├── Home.jsx            # 메인 (Hero 섹션 컴포넌트 분리 완료)
│   ├── ItemDetail.jsx      # 상품 상세 (Airbnb Layout, Sticky UI)
│   ├── ItemEdit.jsx        # 상품 수정
│   ├── ItemRegister.jsx    # 상품 등록
│   ├── Login.jsx           # 로그인 페이지
│   ├── MyPage.jsx          # 마이페이지
│   └── Signup.jsx          # 회원가입 페이지
├── App.css             # 앱 컴포넌트 전역 스타일
├── App.jsx             # 라우터 및 전역 설정
├── config.js           # API 설정
├── index.css           # 초기 스타일 리셋
└── setupProxy.js       # CRA 프록시 설정