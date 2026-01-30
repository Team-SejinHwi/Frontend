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

  // =================================================================
  // 1. 상태 관리 (State Management)
  // =================================================================
  // 🚀 상품 리스트를 담을 상태
  const [items, setItems] = useState([]);

  // 로컬 스토리지에서 사용자 정보 가져오기 (없으면 기본값)
  const myEmail = localStorage.getItem('userEmail') || '';
  // 이름이 없으면 이메일 앞자리(@ 앞부분)를 닉네임처럼 사용
  const myName = localStorage.getItem('userName') || myEmail.split('@')[0] || '사용자';

  // =================================================================
  // 2. 데이터 로드 (Data Fetching)
  // =================================================================
  useEffect(() => {
    // [A] Mock 모드 (백엔드 없이 테스트할 때)
    if (IS_MOCK_MODE) {
      console.log("🛠️ Home: Mock Data 로드됨");
      setItems(mockItems);
    } else {
      // [B] Real 모드 (백엔드 연결)
      // ✅ ngrok 보안 경고를 우회하기 위한 헤더 추가
      fetch('/api/items', {
        headers: {
          "ngrok-skip-browser-warning": "69420", // 이 헤더 필수!
        },
      })
        .then(res => {
          if (!res.ok) throw new Error(`서버 응답 오류: ${res.status}`);
          return res.json();
        })
        .then(data => {
          console.log("📥 서버 데이터 수신:", data);

          // 백엔드 응답 형태에 따라 유연하게 처리
          if (Array.isArray(data)) {
            setItems(data); // 배열이 바로 오는 경우
          } else if (data.data && Array.isArray(data.data)) {
            setItems(data.data); // { success: true, data: [...] } 형태인 경우
          } else {
            console.warn("데이터 형식이 다릅니다. 빈 배열 처리.");
            setItems([]);
          }
        })
        .catch(err => {
          console.error("🚨 상품 로드 실패:", err);
          setItems([]); // 에러 나도 화면이 꺼지지 않게 빈 배열 설정
        });
    }
  }, []);

  // =================================================================
  // 3. 핸들러 (Event Handlers)
  // =================================================================
  const handleLogout = () => {
    // 1. React 상태 업데이트
    setIsLoggedIn(false);

    // 2. 로컬 스토리지 클린업 (보안 중요!)
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    alert("로그아웃 되었습니다.");
    navigate('/');
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#f9f9f9' }}>

      {/* --- 1. 네비게이션 바 (Navbar) --- */}
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

          {/* (2) 중앙 메뉴 (PC 화면에서만 보임) */}
          <Stack direction="row" spacing={2} sx={{ display: { xs: 'none', md: 'flex' } }}>
            <Button color="inherit" onClick={() => alert('준비 중인 페이지입니다.')}>소개</Button>
            <Button color="inherit" onClick={() => alert('준비 중인 페이지입니다.')}>QNA</Button>
            <Button color="inherit" onClick={() => alert('준비 중인 페이지입니다.')}>제품 대여</Button>
            <Button color="inherit" onClick={() => alert('준비 중인 페이지입니다.')}>재능 대여</Button>
          </Stack>

          {/* (3) 우측 로그인/로그아웃 버튼 */}
          {isLoggedIn ? (
            <Stack direction="row" spacing={1} alignItems="center">
              {/* 이름 클릭 시 마이페이지로 이동 */}
              <Typography
                variant="body2"
                onClick={() => navigate('/mypage')}
                sx={{
                  fontWeight: 'bold',
                  color: 'primary.main',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                {myName}님
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

      {/* --- 2. 메인 배너 (Hero Section) --- */}
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

      {/* --- 3. 상품 리스트 섹션 (Grid v2 리팩토링 완료) --- */}
      <Container sx={{ py: 6 }}>
        <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', mb: 3 }}>
          🔥 최신 대여 상품
        </Typography>

        <Grid container spacing={3}>
          {items.map((item) => (
            // 🚨 [수정됨] MUI v6/Grid2 문법 적용
            // 1. 'item' prop 삭제 (이제 불필요)
            // 2. xs, sm, md 등의 사이즈 속성을 'size' 객체 안으로 이동
            <Grid
              key={item.itemId || item.id}
              size={{ xs: 12, sm: 6, md: 3 }} // 모바일 1열, 태블릿 2열, PC 4열
            >
              <ItemCard item={item} />
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* --- 4. 푸터 (Footer) --- */}
      <Box component="footer" sx={{ py: 3, mt: 'auto', bgcolor: '#f1f1f1', textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">© 2026 Re:Borrow</Typography>
      </Box>

      {/* 🚀 플로팅 버튼 (로그인 시에만 노출) */}
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