// src/config.js

// 🚩 [스위치] true: 테스트 모드 / false: 실전 모드
export const IS_MOCK_MODE = true; // 실전 모드로 변경 시

// 🔗 [주소] localtunnel 주소로 업데이트
export const API_BASE_URL = "https://sour-mugs-read.loca.lt"; 

// 🔑 [헤더] 터널링 도구용 경고 우회 헤더 (중앙 관리)
export const TUNNEL_HEADERS = {
  'Bypass-Tunnel-Reminder': 'true'
};