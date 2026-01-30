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
  * **보안(Security)** 및 **사용자 경험(UX)**을 고려한 최적화

<br>

## 2. 🛠 기술 스택 (Tech Stack)

### Frontend
<img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black"> <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black"> <img src="https://img.shields.io/badge/MUI%20v6-007FFF?style=for-the-badge&logo=mui&logoColor=white">
<img src="https://img.shields.io/badge/React%20Router-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white"> <img src="https://img.shields.io/badge/React%20Hook%20Form-EC5990?style=for-the-badge&logo=reacthookform&logoColor=white"> <img src="https://img.shields.io/badge/Day.js-FB6052?style=for-the-badge&logo=dayjs&logoColor=white">

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

### C. 💬 실시간 1:1 채팅 (Real-time Chat) - [NEW ✨]
- **WebSocket & Stomp:** `SockJS`와 `StompJS`를 도입하여 신뢰성 있는 양방향 통신 채널을 구축했습니다.
- **Pub/Sub 아키텍처:** `/topic/chat/room/{id}` 경로를 구독하여 메시지를 지연 없이 실시간 수신합니다.
- **연결 보안:** 소켓 핸드쉐이크 시 헤더(`connectHeaders`)에 인증 토큰을 실어 보내 비인가 사용자의 접근을 막았습니다.

### D. 👤 사용자 경험 최적화 (UX Optimization)
- **병렬 데이터 로딩:** 마이페이지 진입 시 `Promise.all`을 사용하여 프로필과 상품 목록을 동시에 호출, 로딩 속도를 **50% 이상 단축**했습니다.
- **통합 탭 인터페이스:** [내 물건], [받은 요청], [대여 내역], [채팅 목록]을 하나의 페이지에서 직관적으로 관리할 수 있도록 구현했습니다.

<br>

## 4. ⚙️ 개발 환경 설정 (Environment)
- **Proxy 미들웨어:** `http-proxy-middleware`를 도입하여 로컬 개발 시 발생하는 CORS 문제와 Ngrok 터널링 이슈를 해결했습니다.
- **Global Configuration:** API Base URL 및 환경 변수(Mock Mode 등)를 전역 설정 파일로 관리하여 유지보수성을 높였습니다.

<br>

## 5. 📂 프로젝트 구조 (Directory Structure)
```bash
src
├── components  # 재사용 가능한 UI 컴포넌트 (ItemCard, ChatRoom 등)
├── pages       # 주요 페이지 (Home, Login, ItemDetail, MyPage 등)
├── api         # Axios/Fetch API 모듈 관리
├── hooks       # Custom Hooks
└── utils       # 공통 유틸리티 함수 (날짜 변환 등)
