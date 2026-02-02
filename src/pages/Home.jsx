import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// UI 구성을 위한 Material UI 컴포넌트들
import {
  AppBar, Toolbar, Button, Typography, Box, Container, Stack, Paper,
  Grid, Fab, TextField, InputAdornment, Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';

// 새로 만든 가짜 데이터와 컴포넌트 & 설정 import
import ItemCard from '../components/ItemCard';
import { mockItems } from '../mocks/mockData';
import { IS_MOCK_MODE, API_BASE_URL } from '../config';

const MAIN_IMAGE_URL = "https://i.postimg.cc/MHNP5WB5/image.jpg";

// ✅ [v.01.30] 카테고리 목록 정의 (명세서 기반 + 확장)
// 백엔드 API가 기대하는 value 값과 화면에 보여줄 label을 매핑해둔 상수 배열.
const CATEGORIES = [
  { label: '전체', value: '' },
  { label: '디지털/가전', value: 'DIGITAL' },
  { label: '가구/인테리어', value: 'FURNITURE' },
  { label: '유아동', value: 'BABY' },
  { label: '생활/가공식품', value: 'LIFE' },
  { label: '스포츠/레저', value: 'SPORTS' },
  { label: '여성잡화', value: 'WOMAN' },
  { label: '남성잡화', value: 'MAN' },
  { label: '게임/취미', value: 'GAME' },
  { label: '뷰티/미용', value: 'BEAUTY' },
  { label: '반려동물용품', value: 'PET' },
  { label: '도서/티켓/음반', value: 'BOOK' },
  { label: '기타', value: 'ETC' },
];

export default function Home({ isLoggedIn, setIsLoggedIn }) {
  // 페이지 이동을 도와주는 Hook (예: 상품 클릭 시 상세페이지로 이동)
  const navigate = useNavigate();

  // =================================================================
  // 1. 상태 관리 (State Management)
  // =================================================================
  // 🚀 상품 리스트를 담을 상태 (화면에 뿌려질 데이터 원본)
  const [items, setItems] = useState([]);

  // 🔍 [검색 필터 상태]
  // keyword: 검색창에 입력한 텍스트
  // category: 현재 선택된 카테고리 값 (예: 'DIGITAL')
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('');

  // 사용자 정보 가져오기
  const myEmail = localStorage.getItem('userEmail') || '';
  const myName = localStorage.getItem('userName') || myEmail.split('@')[0] || '사용자';

  // =================================================================
  // 2. 데이터 로드 함수 (핵심 로직)
  // =================================================================

  // 이 함수는 '현재 상태' 또는 '선택된 카테고리'를 기준으로 API를 호출.
  // 💡 targetCategory 매개변수가 필요한 이유:
  // React의 setCategory는 비동기로 작동하므로, 버튼을 누르자마자 category 상태가 변하지 않을 수 있다.
  // 그래서 클릭한 그 값을 인자로 직접 넘겨받아 검색에 사용.
  const fetchItems = (targetCategory = category) => {

    // [A] Mock 모드 (백엔드 없이 프론트엔드 혼자 테스트할 때)

    if (IS_MOCK_MODE) {
      console.log(`🛠️ [Mock] 검색 - 카테고리: ${targetCategory}, 키워드: ${keyword}`);
      let filtered = mockItems;
      // 카테고리가 선택되어 있다면 필터링
      if (targetCategory) filtered = filtered.filter(i => i.category === targetCategory);
      // 검색어가 있다면 제목에 포함되어 있는지 확인
      if (keyword) filtered = filtered.filter(i => i.title.includes(keyword));
      setItems(filtered);
      return;
    }


    // [B] Real 모드 (실제 백엔드 서버와 통신)
    // URLSearchParams: 쿼리 스트링(?key=value)을 쉽게 만들어주는 JS 내장 객체
    const queryParams = new URLSearchParams();
    if (targetCategory) queryParams.append('category', targetCategory);
    if (keyword) queryParams.append('keyword', keyword);

    // 완성된 URL 예시: http://localhost:8080/api/items?category=DIGITAL&keyword=맥북
    const requestUrl = `${API_BASE_URL}/api/items?${queryParams.toString()}`;
    console.log("📡 상품 조회 요청:", requestUrl);

    fetch(requestUrl, {
      method: 'GET',
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "69420", // ngrok 사용 시 보안 경고 무시 헤더
      },
    })
      .then(res => {
        if (!res.ok) throw new Error(`서버 응답 오류: ${res.status}`);
        return res.json();
      })
      .then(data => {
        console.log("📥 받아온 상품 목록:", data);
        // 서버 응답 형태에 따라 유연하게 데이터 처리 (배열인지 객체인지 확인)
        if (Array.isArray(data)) {
          setItems(data);
        } else if (data.data && Array.isArray(data.data)) {
          setItems(data.data);
        } else {
          setItems([]);
        }
      })
      .catch(err => {
        console.error("🚨 상품 로드 실패:", err);
        setItems([]); // 에러 나면 빈 목록 보여줌
      });
  };

  // 초기 로딩 (Component Mount 시점)
  // 화면이 처음 켜졌을 때 딱 한 번 실행되어 전체 상품 목록을 가져온다.
  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  // =================================================================
  // 3. 핸들러 (Event Handlers)
  // =================================================================
  const handleLogout = () => {
    setIsLoggedIn(false);
    // 보안을 위해 로컬 스토리지에 저장된 인증 정보 싹 지우기
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    alert("로그아웃 되었습니다.");
    navigate('/');
  };

  // [UI 개선] 카테고리 칩 클릭 시 실행
  // 1. setCategory로 화면의 버튼 색을 바꾸고 (UI 업데이트)
  // 2. fetchItems를 바로 호출해서 데이터를 가져옴 (데이터 업데이트)
  const handleCategoryClick = (newCategory) => {
    setCategory(newCategory); 
    fetchItems(newCategory);  
  };

  // 검색창에서 엔터(Enter) 키를 눌렀을 때 검색 실행
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      fetchItems();
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#f9f9f9' }}>

      {/* --- 네비게이션 바 (상단 메뉴) --- */}
      <AppBar position="static" color="default" elevation={1} sx={{ bgcolor: 'white' }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          {/* 로고 클릭 시 홈으로 이동 */}
          <Typography variant="h6" sx={{ fontWeight: 'bold', cursor: 'pointer', color: '#333' }} onClick={() => navigate('/')}>
            Re:Borrow
          </Typography>

          {/* 로그인 상태에 따라 다른 버튼 노출 */}
          {isLoggedIn ? (
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="body2" onClick={() => navigate('/mypage')} sx={{ fontWeight: 'bold', color: 'primary.main', cursor: 'pointer', textDecoration: 'underline' }}>
                {myName}님
              </Typography>
              <Button variant="outlined" color="primary" onClick={handleLogout} sx={{ fontWeight: 'bold' }}>
                로그아웃
              </Button>
            </Stack>
          ) : (
            <Button variant="contained" onClick={() => navigate('/login')} sx={{ bgcolor: '#333', color: 'white', fontWeight: 'bold' }}>
              로그인/회원가입
            </Button>
          )}
        </Toolbar>
      </AppBar>

      {/* --- 메인 배너 이미지 --- */}
      <Box sx={{
        position: 'relative', width: '100%', height: '300px',
        backgroundImage: `url(${MAIN_IMAGE_URL})`, backgroundSize: 'cover', backgroundPosition: 'center',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        // 이미지 위에 검은색 반투명 레이어를 씌워서 글씨가 잘 보이게 함
        '&::before': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)' }
      }}>
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1, textAlign: 'center', color: 'white' }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
            모든 것을 빌려쓰는 세상
          </Typography>
          <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
            필요한 물건, 사지 말고 Re:Borrow 하세요.
          </Typography>
        </Container>
      </Box>

      {/* --- 🔍 검색 및 카테고리 섹션 --- */}
      {/* mt: 4를 주어 배너와 겹치지 않고 아래로 떨어지게 배치 */}
      <Container sx={{ mt: 4, mb: 4, position: 'relative', zIndex: 2 }}>
        <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
          <Stack spacing={2}>

            {/* 1. 검색바 영역 */}
            <Stack direction="row" spacing={1}>
              <TextField
                fullWidth
                placeholder="어떤 물건을 찾으시나요?"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)} // 입력할 때마다 state 업데이트
                onKeyPress={handleKeyPress} // 엔터키 감지
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{ bgcolor: 'white' }}
              />
              <Button
                variant="contained"
                size="large"
                onClick={() => fetchItems()} // 버튼 클릭 시 검색
                sx={{ fontWeight: 'bold', width: '100px' }}
              >
                검색
              </Button>
            </Stack>

            {/* 2. 카테고리 칩 (가로 스크롤 UI) */}
            <Box sx={{
              display: 'flex',
              gap: 1,
              overflowX: 'auto', // 내용이 넘치면 가로 스크롤 생성
              pb: 1, // 스크롤바와 내용 사이 여백
              '::-webkit-scrollbar': { height: '6px' }, // 스크롤바 커스텀 디자인
              '::-webkit-scrollbar-thumb': { backgroundColor: '#ddd', borderRadius: '3px' }
            }}>
              {/* CATEGORIES 배열을 돌면서 Chip(버튼) 생성 */}
              {CATEGORIES.map((cat) => (
                <Chip
                  key={cat.value}
                  label={cat.label}
                  clickable
                  // 현재 선택된 카테고리면 파란색(primary), 아니면 회색(default)
                  color={category === cat.value ? "primary" : "default"}
                  variant={category === cat.value ? "filled" : "outlined"}
                  // 클릭 시 상태 변경 및 즉시 검색 실행
                  onClick={() => handleCategoryClick(cat.value)}
                  sx={{
                    fontWeight: category === cat.value ? 'bold' : 'normal',
                    fontSize: '0.9rem',
                    padding: '18px 5px'
                  }}
                />
              ))}
            </Box>

          </Stack>
        </Paper>
      </Container>

      {/* --- 📦 상품 리스트 표시 영역 --- */}
      <Container sx={{ py: 2, pb: 10 }}>
        {/* 현재 보고 있는 목록의 제목 (카테고리명 or 검색어) */}
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
          {category ? `📂 ${CATEGORIES.find(c => c.value === category)?.label}` : '🔥 전체 상품'}
          {keyword && ` / 검색어: "${keyword}"`}
        </Typography>

        {items.length === 0 ? (
          // 상품이 없을 때 표시할 UI
          <Box sx={{ textAlign: 'center', py: 10 }}>
            <Typography variant="h6" color="text.secondary">등록된 상품이 없습니다.</Typography>
          </Box>
        ) : (
          // 상품이 있을 때 Grid로 나열
          <Grid container spacing={3}>
            {items.map((item) => (
              <Grid
                item
                key={item.itemId || item.id}
                xs={12} sm={6} md={3} // 반응형 그리드 (모바일 1개, 태블릿 2개, PC 4개)
              >
                {/* 개별 상품 카드 컴포넌트 호출 */}
                <ItemCard item={item} />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      {/* --- 푸터 (하단 정보) --- */}
      <Box component="footer" sx={{ py: 3, mt: 'auto', bgcolor: '#f1f1f1', textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">© 2026 Re:Borrow</Typography>
      </Box>

      {/* --- 플로팅 버튼 (글쓰기) --- */}
      {/* 로그인한 사용자에게만 보임 */}
      {isLoggedIn && (
        <Fab
          color="primary"
          aria-label="add"
          sx={{ position: 'fixed', bottom: 30, right: 30, width: 60, height: 60 }}
          onClick={() => navigate('/products/new')} // 글쓰기 페이지로 이동
        >
          <AddIcon />
        </Fab>
      )}
    </Box>
  );
}