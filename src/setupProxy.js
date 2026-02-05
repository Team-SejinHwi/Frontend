const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  // 1. API 및 이미지 프록시 (localtunnel 주소로 변경)
  app.use(
    ['/api', '/images'], 
    createProxyMiddleware({
      // target을 새로운 localtunnel 주소로 변경합니다.
      target: 'https://sour-mugs-read.loca.lt', 
      changeOrigin: true,
      onProxyReq: function (proxyReq, req, res) {
        // 🔥 localtunnel의 경고창을 무시하기 위한 헤더입니다.
        // 기존 'ngrok-skip-browser-warning' 대신 'Bypass-Tunnel-Reminder'를 사용합니다.
        proxyReq.setHeader('Bypass-Tunnel-Reminder', 'true');
      }
    })
  );

  // 2. 채팅 웹소켓 프록시
  app.use(
    '/ws-stomp',
    createProxyMiddleware({
      target: 'https://sour-mugs-read.loca.lt',
      changeOrigin: true,
      ws: true, // WebSocket 모드 유지
      onProxyReq: function (proxyReq, req, res) {
        // 소켓 연결 시에도 동일하게 localtunnel 우회 헤더를 붙여줍니다.
        proxyReq.setHeader('Bypass-Tunnel-Reminder', 'true');
      }
    })
  );
};