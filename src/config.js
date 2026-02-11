// src/config.js

// 🚩 [스위치] true: 테스트 모드 / false: 실전 모드
export const IS_MOCK_MODE = true; 

// 🔗 [주소] Cloudflare Tunnel 주소로 업데이트
// 기존 'https://neo-rental-project.loca.lt'에서 변경합니다.
export const API_BASE_URL = "https://pubmed-descriptions-vitamin-cabin.trycloudflare.com";

// 🔑 [헤더] 터널링 도구용 경고 우회 헤더 (중앙 관리)
// Cloudflare에서는 필수는 아니지만, 기존 구조 유지를 위해 두셔도 무방합니다.
export const TUNNEL_HEADERS = {
  'Bypass-Tunnel-Reminder': 'true'
};