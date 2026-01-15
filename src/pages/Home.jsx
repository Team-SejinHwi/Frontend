import React from 'react';
// 페이지 이동을 위한 리액트 라우터 훅
import { useNavigate } from 'react-router-dom';
// UI 구성을 위한 Material UI 컴포넌트들
import {
  AppBar, Toolbar, Button, Typography, Box, Container, Stack, Paper
} from '@mui/material';

const MAIN_IMAGE_URL = "https://i.postimg.cc/MHNP5WB5/image.jpg";

// [수정] App.jsx에서 전달받은 props (isLoggedIn, setIsLoggedIn)를 여기서 받습니다.
export default function Home({ isLoggedIn, setIsLoggedIn }) {

  const navigate = useNavigate();

  // 🚀 [핸들러] 로그아웃 버튼 클릭 시 실행
  const handleLogout = () => {
    // 1. 상태를 false로 변경 (로그아웃 처리)
    setIsLoggedIn(false);

    // 2. ★ [추가] 저장소에서 기록 삭제
    localStorage.removeItem('isLoggedIn');
    // 2. 알림
    alert("로그아웃 되었습니다.");

    navigate('/');
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#f9f9f9' }}>

      {/* 1. 상단 네비게이션 바 */}
      <AppBar position="static" color="default" elevation={1} sx={{ bgcolor: 'white' }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>

          {/* 좌측: 로고 */}
          <Typography
            variant="h6"
            component="div"
            sx={{ fontWeight: 'bold', cursor: 'pointer', color: '#333' }}
            onClick={() => navigate('/')}
          >
            Re:Borrow
          </Typography>

          {/* 중앙: 메뉴 버튼들 */}
          <Stack direction="row" spacing={2} sx={{ display: { xs: 'none', md: 'flex' } }}>
            <Button color="inherit" onClick={() => alert('준비 중인 페이지입니다.')}>소개</Button>
            <Button color="inherit" onClick={() => alert('준비 중인 페이지입니다.')}>QNA</Button>
            <Button color="inherit" onClick={() => alert('준비 중인 페이지입니다.')}>제품 대여</Button>
            <Button color="inherit" onClick={() => alert('준비 중인 페이지입니다.')}>재능 대여</Button>
          </Stack>

          {/* 우측: 로그인 상태에 따라 버튼이 바뀜 */}
          {/* [조건부 렌더링] 삼항 연산자 (조건 ? 참일때 : 거짓일때) 활용 */}
          {isLoggedIn ? (
            // [CASE 1] 로그인 상태일 때 -> 로그아웃 버튼 표시
            <Stack direction="row" spacing={1} alignItems="center">
              {/* 닉네임 등을 표시해주면 더 좋음 (나중에 구현) */}
              <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                박세진 님
              </Typography>
              <Button
                variant="outlined"
                color="primary"
                onClick={handleLogout} // 로그아웃 핸들러 연결
                sx={{ fontWeight: 'bold' }}
              >
                로그아웃
              </Button>
            </Stack>
          ) : (
            // [CASE 2] 비로그인 상태일 때 -> 로그인/회원가입 버튼 표시
            <Button
              variant="contained"
              disableElevation
              onClick={() => navigate('/login')}
              sx={{
                bgcolor: '#333',
                color: 'white',
                fontWeight: 'bold',
                '&:hover': { bgcolor: '#555' }
              }}
            >
              로그인/회원가입
            </Button>
          )}

        </Toolbar>
      </AppBar>

      {/* 메인 콘텐츠 (아래 내용은 변경 없음) */}
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: '600px',
            backgroundImage: `url(${MAIN_IMAGE_URL})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.4)',
            }
          }}
        >
          <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1, textAlign: 'center', color: 'white' }}>
            <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', mb: 2, textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
              일상의 필요와 즐거움,<br />
              렌탈이가 함께합니다.
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
              우리 동네 주변의 필요한 물건들을 쉽고 빠르게 대여하세요!<br />
              저렴하고 안전한 서비스로, 여러분의 일상에 작은 편리함을 더합니다.
            </Typography>
            <Paper elevation={3} sx={{ p: 2, display: 'inline-block', bgcolor: 'rgba(255,255,255,0.9)' }}>
              <Typography variant="body2" color="text.secondary">
                📍 1월 말, 지도 기반 대여 서비스가 오픈됩니다!
              </Typography>
            </Paper>
          </Container>
        </Box>
      </Box>

      <Box component="footer" sx={{ py: 3, px: 2, mt: 'auto', backgroundColor: '#f1f1f1', textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          © 2026 Re:Borrow (Team Project: With 남휘, 박세진). All rights reserved.
        </Typography>
      </Box>

    </Box>
  );
}