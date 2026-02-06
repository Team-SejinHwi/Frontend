const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  // 1. API 및 이미지 프록시 (Cloudflare Tunnel 주소로 변경)
  app.use(
    ['/api', '/images'], 
    createProxyMiddleware({
      // target을 새로운 Cloudflare Tunnel 주소로 변경합니다.
      target: 'https://automobiles-twisted-dance-cabinets.trycloudflare.com', 
      changeOrigin: true,
      onProxyReq: function (proxyReq, req, res) {
        // Cloudflare Tunnel은 보통 이 헤더가 필요 없으나, 
        // 기존 tunnel 우회 로직이 있다면 유지해도 무방합니다.
        proxyReq.setHeader('Bypass-Tunnel-Reminder', 'true');
      }
    })
  );

  // 2. 채팅 웹소켓 프록시
  app.use(
    '/ws-stomp',
    createProxyMiddleware({
      target: 'https://automobiles-twisted-dance-cabinets.trycloudflare.com',
      changeOrigin: true,
      ws: true, // WebSocket 모드 유지
      onProxyReq: function (proxyReq, req, res) {
        proxyReq.setHeader('Bypass-Tunnel-Reminder', 'true');
      }
    })
  );
};