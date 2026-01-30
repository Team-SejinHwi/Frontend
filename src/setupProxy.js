const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  // 1. 기존 API 및 이미지 프록시
  app.use(
    ['/api', '/images'], // 👈 /api랑 /images 요청은 다 백엔드로 보내기!
    createProxyMiddleware({
      //target: 'https://ossie-noncollectivistic-enduringly.ngrok-free.dev', // 휘님 서버(ngrok) 주소
      target: 'https://polymerous-debora-contradictively.ngrok-free.dev',
      changeOrigin: true,
      onProxyReq: function (proxyReq, req, res) {
        // 🔥 이미지 불러올 때도 'ngrok 경고 무시' 헤더를 강제로 붙여줌
        proxyReq.setHeader('ngrok-skip-browser-warning', '69420');
      }
    })
  );
  // 2.  채팅 웹소켓 프록시 
  app.use(
    '/ws-stomp',
    createProxyMiddleware({
      //target: 'https://ossie-noncollectivistic-enduringly.ngrok-free.dev',
      target: 'https://polymerous-debora-contradictively.ngrok-free.dev',
      changeOrigin: true,
      ws: true, // WebSocket 모드 활성화 

      // 👇 소켓 연결할 때도 Ngrok 경고창을 무시하도록 헤더를 붙여줍니다!
      onProxyReq: function (proxyReq, req, res) {
        proxyReq.setHeader('ngrok-skip-browser-warning', '69420');
      }
    })
  );
};