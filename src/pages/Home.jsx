import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar, Toolbar, Button, Typography, Box, Container, Stack, Paper, Grid, Fab
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add'; 

// 새로 만든 가짜 데이터와 컴포넌트 import
import { mockItems } from '../mocks/mockData';
import ItemCard from '../components/ItemCard';
import { IS_MOCK_MODE } from '../config';

const MAIN_IMAGE_URL = "https://i.postimg.cc/MHNP5WB5/image.jpg";

export default function Home({ isLoggedIn, setIsLoggedIn }) {
  const navigate = useNavigate();

  // 🚀 상품 리스트를 담을 상태
  const [items, setItems] = useState([]);

  // 🚀 [Effect] 페이지가 켜지면 상품 데이터를 가져옵니다.
  useEffect(() => {
    if (IS_MOCK_MODE) {
      console.log("🛠️ Mock Data 로드됨");
      setItems(mockItems);
    } else {
      // ✅ [수정됨] ngrok 보안 경고를 뚫고 진짜 데이터를 가져오는 코드
      fetch('/api/items', {
        headers: {
          // 👇 이 헤더가 있어야 ngrok 경고창 없이 바로 통과됩니다! (필수)
          "ngrok-skip-browser-warning": "69420", 
        },
      })
        .then(res => {
          // 응답이 성공(200 OK)이 아니면 에러 처리
          if (!res.ok) {
            throw new Error(`서버 응답 오류: ${res.status}`);
          }
          return res.json();
        })
        .then(data => {
          console.log("📥 서버에서 받은 원본 데이터:", data); // 확인용 로그

          // 휘님 백엔드가 데이터를 어떻게 주는지에 따라 처리
          if (Array.isArray(data)) {
            // Case A: 그냥 배열로 줄 때 ( [{}, {}] ) -> 바로 넣기
            setItems(data);
          } else if (data.data && Array.isArray(data.data)) {
            // Case B: 감싸서 줄 때 ( { success: true, data: [] } ) -> 꺼내서 넣기
            setItems(data.data);
          } else {
            console.warn("데이터 형식이 예상과 다릅니다. 빈 배열로 설정합니다.");
            setItems([]);
          }
        })
        .catch(err => {
          console.error("🚨 상품 로드 실패:", err);
          // 에러나면 빈 배열 유지 (화면이 깨지진 않게)
        });
    }
  }, []);

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('isLoggedIn');
    alert("로그아웃 되었습니다.");
    navigate('/');
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#f9f9f9' }}>

      {/* 1. 네비게이션 바 */}
      <AppBar position="static" color="default" elevation={1} sx={{ bgcolor: 'white' }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>

          {/* (1) 좌측 로고 */}
          <Typography
            variant="h6"
            sx={{ fontWeight: 'bold', cursor: 'pointer', color: '#333' }}
            onClick={() => navigate('/')}
          >
            Re:Borrow
          </Typography>

          {/* (2) 중앙 메뉴 버튼들 */}
          <Stack direction="row" spacing={2} sx={{ display: { xs: 'none', md: 'flex' } }}>
            <Button color="inherit" onClick={() => alert('준비 중인 페이지입니다.')}>소개</Button>
            <Button color="inherit" onClick={() => alert('준비 중인 페이지입니다.')}>QNA</Button>
            <Button color="inherit" onClick={() => alert('준비 중인 페이지입니다.')}>제품 대여</Button>
            <Button color="inherit" onClick={() => alert('준비 중인 페이지입니다.')}>재능 대여</Button>
          </Stack>

          {/* (3) 우측 로그인/로그아웃 버튼 */}
          {isLoggedIn ? (
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                박세진님
              </Typography>
              <Button
                variant="outlined"
                color="primary"
                onClick={handleLogout}
                sx={{ fontWeight: 'bold' }}
              >
                로그아웃
              </Button>
            </Stack>
          ) : (
            <Button
              variant="contained"
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

      {/* 2. 메인 배너 */}
      <Box sx={{
        position: 'relative', width: '100%', height: '400px',
        backgroundImage: `url(${MAIN_IMAGE_URL})`, backgroundSize: 'cover', backgroundPosition: 'center',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        '&::before': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)' }
      }}>
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1, textAlign: 'center', color: 'white' }}>
          <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 2 }}>
            일상의 필요와 즐거움,<br /> 렌탈이가 함께합니다.
          </Typography>
          <Paper elevation={3} sx={{ p: 2, display: 'inline-block', bgcolor: 'rgba(255,255,255,0.9)' }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'bold' }}>
              📢 현재 등록된 상품 수: {items.length}개
            </Typography>
          </Paper>
        </Container>
      </Box>

      {/* 🚀 3. 상품 리스트 섹션 */}
      <Container sx={{ py: 6 }}>
        <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', mb: 3 }}>
          🔥 최신 대여 상품
        </Typography>

        <Grid container spacing={3}>
          {items.map((item) => (
            <Grid item key={item.itemId || item.id} xs={12} sm={6} md={3}>
              <ItemCard item={item} />
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* 4. 푸터 */}
      <Box component="footer" sx={{ py: 3, mt: 'auto', bgcolor: '#f1f1f1', textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">© 2026 Re:Borrow</Typography>
      </Box>

      {/* 🚀 글쓰기 플로팅 버튼 (로그인 시에만 보임) */}
      {isLoggedIn && (
        <Fab
          color="primary"
          aria-label="add"
          sx={{ position: 'fixed', bottom: 30, right: 30, width: 70, height: 70 }}
          onClick={() => navigate('/products/new')}
        >
          <AddIcon sx={{ fontSize: 40 }} />
        </Fab>
      )}
    </Box>
  );
}