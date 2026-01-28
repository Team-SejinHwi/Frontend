const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    ['/api', '/images'], // 👈 /api랑 /images 요청은 다 백엔드로 보내기!
    createProxyMiddleware({
      target: 'https://ossie-noncollectivistic-enduringly.ngrok-free.dev', // 휘님 서버(ngrok) 주소
      changeOrigin: true,
      onProxyReq: function(proxyReq, req, res) {
        // 🔥 이미지 불러올 때도 'ngrok 경고 무시' 헤더를 강제로 붙여줌
        proxyReq.setHeader('ngrok-skip-browser-warning', '69420');
      }
    })
  );
};