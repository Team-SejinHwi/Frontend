# 🎒 Re:Borrow (지역 기반 물건 및 재능 대여 플랫폼)

> **2026년 신입 웹 개발자 취업을 위한 포트폴리오 프로젝트**
> "당신의 물건에 가치를 더하다, Re:Borrow"

<br>

## 1. 📝 프로젝트 개요
* **프로젝트명:** Re:Borrow
* **팀 구성:**
  * **Frontend:** 박세진 (React)
  * **Backend:** 남휘 (Spring Boot)
* **개발 기간:** 2025.12 ~ 2026.02 (진행 중)
* **프로젝트 목표:**
  * 단순 CRUD를 넘어선 **복합 데이터 처리(File/JSON)** 로직 구현
  * **WebSocket**을 활용한 실시간 양방향 통신 시스템 구축
  * **Kakao Maps API**를 활용한 위치 기반 서비스(LBS) 구현
  * **신뢰도 시스템(Review)** 및 보안(Security)을 고려한 사용자 경험 최적화

<br>

## 2. 🛠 기술 스택 (Tech Stack)

### Frontend
<img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black"> <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black"> <img src="https://img.shields.io/badge/MUI%20v6-007FFF?style=for-the-badge&logo=mui&logoColor=white">
<img src="https://img.shields.io/badge/React%20Router-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white"> <img src="https://img.shields.io/badge/React%20Hook%20Form-EC5990?style=for-the-badge&logo=reacthookform&logoColor=white"> <img src="https://img.shields.io/badge/Day.js-FB6052?style=for-the-badge&logo=dayjs&logoColor=white">

### Map & Location (New)
<img src="https://img.shields.io/badge/Kakao%20Maps-FFCD00?style=for-the-badge&logo=kakao&logoColor=black"> <img src="https://img.shields.io/badge/Daum%20Postcode-000000?style=for-the-badge&logo=kakao&logoColor=white"> <img src="https://img.shields.io/badge/Geolocation%20API-4285F4?style=for-the-badge&logo=googlemaps&logoColor=white">

### Network & Communication
<img src="https://img.shields.io/badge/WebSocket-010101?style=for-the-badge&logo=socket.io&logoColor=white"> <img src="https://img.shields.io/badge/StompJS-000000?style=for-the-badge&logo=stomp&logoColor=white"> <img src="https://img.shields.io/badge/Axios/Fetch-5A29E4?style=for-the-badge&logo=axios&logoColor=white">

### Backend (Co-work)
<img src="https://img.shields.io/badge/Spring%20Boot-6DB33F?style=for-the-badge&logo=springboot&logoColor=white"> <img src="https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white"> <img src="https://img.shields.io/badge/Spring%20Security-6DB33F?style=for-the-badge&logo=springsecurity&logoColor=white">

<br>

## 3. ✨ 주요 기능 (Key Features)

### A. 🔐 인증 및 보안 (Authentication)
- **세션 & 쿠키 연동:** 백엔드 Session 기반 인증에 맞춰 API 요청 시 `credentials: 'include'` 옵션을 적용, JSESSIONID를 안전하게 관리합니다.
- **사용자 식별 강화:** 로그인 직후 `/api/members/me`를 호출하여 `userId`를 확보, 채팅 및 거래 로직의 핵심 식별자로 활용합니다.
- **보안 로그아웃:** 클라이언트 스토리지 정리(`clear`)와 서버 세션 만료 요청을 병행하여 보안성을 높였습니다.

### B. 📦 물품 거래 로직 (Advanced CRUD)
- **복합 데이터 전송:** `FormData`를 활용하여 상품 이미지(File)와 상세 정보(JSON)를 동시에 처리하는 로직을 구현했습니다.
- **데이터 직렬화 (Serialization):** Spring Boot의 `@RequestPart` 규격을 준수하기 위해 JSON 데이터를 `Blob` 타입으로 변환하여 전송합니다.
- **권한 방어:** 클라이언트(Owner Check)와 서버(Session Check)의 이중 검증을 통해 인가되지 않은 수정/삭제 요청을 원천 차단했습니다.

### C. 🗺️ 위치 기반 서비스 (Location Service) - [NEW 🚀]
- **내 주변 찾기 (LBS):** 브라우저의 `Geolocation API`를 활용해 사용자 위치를 파악하고, 반경 5km 이내의 물품만 필터링(Haversine 공식 활용)하여 보여줍니다.
- **지도 시각화:** `Kakao Maps SDK`를 연동하여 리스트 뷰와 지도 뷰(Map View)를 토글할 수 있으며, 마커를 통해 직관적으로 매물 위치를 확인합니다.
- **주소 검색 시스템:** 물품 등록 시 `Daum Postcode API`로 정확한 주소를 검색하고, Geocoder를 통해 좌표(위도/경도)로 자동 변환하여 DB에 저장합니다.
- **길찾기 연동:** 상세 페이지의 미니맵 마커 클릭 시 카카오맵(Web) 길찾기 페이지로 리다이렉트되어 사용자 편의성을 높였습니다.

### D. 💬 실시간 1:1 채팅 (Real-time Chat)
- **WebSocket & Stomp:** `SockJS`와 `StompJS`를 도입하여 신뢰성 있는 양방향 통신 채널을 구축했습니다.
- **Pub/Sub 아키텍처:** `/topic/chat/room/{id}` 경로를 구독하여 메시지를 지연 없이 실시간 수신합니다.
- **연결 보안:** 소켓 핸드쉐이크 시 헤더(`connectHeaders`)에 인증 토큰을 실어 보내 비인가 사용자의 접근을 막았습니다.

### E. ⭐ 후기 및 평점 시스템 (Reviews & Ratings) - [NEW ✨]
- **거래 신뢰도 강화:** 대여 상태가 `반납 완료(COMPLETED)`인 경우에만 후기 작성 버튼이 활성화되도록 로직을 제어하여 허위 리뷰를 방지합니다.
- **UX 친화적 모달:** MUI `Dialog`와 `Rating` 컴포넌트를 활용한 직관적인 리뷰 작성 모달(`ReviewModal`)을 구현했습니다.
- **실시간 반영:** 상품 상세 페이지 진입 시 `Promise.all`을 이용해 상품 정보와 리뷰 목록을 병렬로 호출하며, 평균 평점을 즉시 계산하여 시각화합니다.

### F. 👤 사용자 경험 최적화 (UX Optimization)
- **병렬 데이터 로딩:** 마이페이지 진입 시 `Promise.all`을 사용하여 프로필과 상품 목록을 동시에 호출, 로딩 속도를 **50% 이상 단축**했습니다.
- **통합 탭 인터페이스:** [내 물건], [받은 요청], [대여 내역], [채팅 목록]을 하나의 페이지에서 직관적으로 관리할 수 있도록 구현했습니다.

<br>

## 4. ⚙️ 개발 환경 설정 (Environment)
- **Proxy 미들웨어:** `http-proxy-middleware`를 도입하여 로컬 개발 시 발생하는 CORS 문제와 Ngrok 터널링 이슈를 해결했습니다.
- **Global Configuration:** API Base URL 및 환경 변수(Mock Mode 등)를 전역 설정 파일로 관리하여 유지보수성을 높였습니다.

<br>

## 5. 📂 프로젝트 구조 (Directory Structure) (v1.2)
```bash
src
├── components          # 재사용 가능한 UI 컴포넌트
│   ├── ChatList.jsx        # 채팅방 목록 아이템
│   ├── ItemCard.jsx        # 상품 카드 (메인/검색)
│   ├── ReceivedRequests.jsx # 받은 요청 관리 (수락/거절)
│   ├── RentalModal.jsx     # 대여 신청 및 계산 모달
│   ├── ReviewModal.jsx     # ✨ [NEW] 후기 작성 모달 (별점 & 텍스트)
│   └── SentRequests.jsx    # 보낸 요청 관리 (상태 확인 & ✨ 후기 작성 진입)
├── mocks               # 프론트엔드 독립 테스트 데이터
│   └── mockData.js         # 가상 상품/유저/거래/✨리뷰 데이터
├── pages               # 라우팅 페이지 (Screen)
│   ├── ChatRoom.jsx        # 1:1 실시간 채팅방
│   ├── Home.jsx            # 메인 (위치 기반 필터링 & 지도)
│   ├── ItemDetail.jsx      # 상품 상세 (대여신청/수정/삭제 & ✨ 후기 목록 조회)
│   ├── ItemEdit.jsx        # 상품 수정
│   ├── ItemRegister.jsx    # 상품 등록 (주소 검색 & 마커 설정)
│   ├── Login.jsx           # 로그인 페이지
│   ├── MyPage.jsx          # 마이페이지 (탭 관리)
│   └── Signup.jsx          # 회원가입 페이지
├── App.css             # 앱 컴포넌트 전역 스타일
├── App.jsx             # 라우터(Router) 및 전역 레이아웃 설정
├── config.js           # API Base URL 및 모드 설정 (Mock/Real)
├── index.css           # 초기 스타일 리셋 및 폰트 설정
├── index.js            # React 앱 진입점 (Entry Point)
├── reportWebVitals.js  # 성능 측정 도구 (React 기본 파일)
└── setupProxy.js       # CRA 프록시 설정 (CORS 해결 및 백엔드 통신)