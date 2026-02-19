// src/config.js

// 🚩 [스위치] true: 테스트 모드 / false: 실전 모드
export const IS_MOCK_MODE = false;

// 🔗 [주소] Cloudflare Tunnel 주소로 업데이트
// 기존 'https://neo-rental-project.loca.lt'에서 변경합니다.
// export const API_BASE_URL = "https://genes-researchers-qualifications-foster.trycloudflare.com" ;

//주소를 "" (빈 문자열)로 변경 (가장 중요! ⭐)
// 이유: 이렇게 하면 요청을 보낼 때 'https://내주소.vercel.app/api/...' 로 알아서 붙습니다.
// 이걸 뒤에서 만들 vercel.json이 낚아채서 휘님 서버로 보내줄 겁니다.
export const API_BASE_URL = "";

// 🔑 [헤더] 터널링 도구용 경고 우회 헤더 (중앙 관리)
// Cloudflare에서는 필수는 아니지만, 기존 구조 유지를 위해 두셔도 무방합니다.
export const TUNNEL_HEADERS = {
  'Content-Type': 'application/json',
  'Bypass-Tunnel-Reminder': 'true'
};