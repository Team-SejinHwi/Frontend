import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar, Toolbar, Button, Typography, Box, Container, Stack, Paper
} from '@mui/material';

// 스타일링용 이미지 주소 (올려주신 파일에 있는 링크)
const MAIN_IMAGE_URL = "https://i.postimg.cc/MHNP5WB5/image.jpg";

export default function Home() {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#f9f9f9' }}>

      {/* 1. 상단 네비게이션 바 (HTML의 <nav> 역할) */}
      <AppBar position="static" color="default" elevation={1} sx={{ bgcolor: 'white' }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>

          {/* 로고 (Re:Borrow) */}
          <Typography
            variant="h6"
            component="div"
            sx={{ fontWeight: 'bold', cursor: 'pointer', color: '#333' }}
            onClick={() => navigate('/')}
          >
            Re:Borrow
          </Typography>

          {/* 중앙 메뉴 버튼들 (nav-links) */}
          {/* 아직 페이지가 없으므로 클릭 시 alert만 뜨게 해둠 */}
          <Stack direction="row" spacing={2} sx={{ display: { xs: 'none', md: 'flex' } }}>
            <Button color="inherit" onClick={() => alert('준비 중인 페이지입니다.')}>소개</Button>
            <Button color="inherit" onClick={() => alert('준비 중인 페이지입니다.')}>QNA</Button>
            <Button color="inherit" onClick={() => alert('준비 중인 페이지입니다.')}>제품 대여</Button>
            <Button color="inherit" onClick={() => alert('준비 중인 페이지입니다.')}>재능 대여</Button>
          </Stack>

          {/* 로그인/회원가입 버튼 */}
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
        </Toolbar>
      </AppBar>

      {/* 2. 메인 콘텐츠 (HTML의 <main>) */}
      <Box component="main" sx={{ flexGrow: 1 }}>

        {/* 히어로 섹션 (이미지 + 텍스트) */}
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: '600px', // 배너 높이
            backgroundImage: `url(${MAIN_IMAGE_URL})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            // 이미지가 너무 밝으면 글씨가 안 보이니 어두운 필터 추가
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.4)', // 검은색 투명도 40%
            }
          }}
        >
          {/* 텍스트 내용 */}
          <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1, textAlign: 'center', color: 'white' }}>
            <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', mb: 2, textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
              일상의 필요와 즐거움,<br />
              렌탈이가 함께합니다.
            </Typography>

            <Typography variant="h6" sx={{ mb: 4, textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
              우리 동네 주변의 필요한 물건들을 쉽고 빠르게 대여하세요!<br />
              저렴하고 안전한 서비스로, 여러분의 일상에 작은 편리함을 더합니다.
            </Typography>

            {/* 지도 개발 예정 안내 (카드 형태) */}
            <Paper elevation={3} sx={{ p: 2, display: 'inline-block', bgcolor: 'rgba(255,255,255,0.9)' }}>
              <Typography variant="body2" color="text.secondary">
                📍 1월 말, 지도 기반 대여 서비스가 오픈됩니다!
              </Typography>
            </Paper>
          </Container>
        </Box>
      </Box>

      {/* 3. 푸터 (HTML의 <footer>) */}
      <Box component="footer" sx={{ py: 3, px: 2, mt: 'auto', backgroundColor: '#f1f1f1', textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          © 2026 Re:Borrow (Team Project: With 남휘, 박세진). All rights reserved.
        </Typography>
      </Box>

    </Box>
  );
}