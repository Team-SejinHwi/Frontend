import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Map, MapMarker } from 'react-kakao-maps-sdk'; // 지도 라이브러리

// UI 구성을 위한 Material UI 컴포넌트들
import {
  AppBar, Toolbar, Button, Typography, Box, Container, Stack, Paper,
  Grid, Fab, TextField, InputAdornment, Chip, ToggleButton, ToggleButtonGroup,
  CircularProgress, IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import MyLocationIcon from '@mui/icons-material/MyLocation'; // 내 위치 아이콘
import MapIcon from '@mui/icons-material/Map'; // 지도 아이콘
import ListIcon from '@mui/icons-material/List'; // 리스트 아이콘
// [NEW] 스크롤 화살표 아이콘 추가
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

//02.09 import 추가
import AppsIcon from '@mui/icons-material/Apps';
import LaptopIcon from '@mui/icons-material/Laptop';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import ForestIcon from '@mui/icons-material/Forest';
import BuildIcon from '@mui/icons-material/Build';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import CelebrationIcon from '@mui/icons-material/Celebration';
import CheckroomIcon from '@mui/icons-material/Checkroom';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import ChairIcon from '@mui/icons-material/Chair';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import PetsIcon from '@mui/icons-material/Pets';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

// 설정 및 데이터 import
import { CATEGORIES } from '../constants/categories';
import ItemCard from '../components/ItemCard';
import { mockItems } from '../mocks/mockData';
import { API_BASE_URL, IS_MOCK_MODE, TUNNEL_HEADERS } from '../config';

const MAIN_IMAGE_URL = "https://i.postimg.cc/MHNP5WB5/image.jpg";

// 🧮 두 좌표(위도, 경도) 사이의 직선 거리 계산 함수
// 단위: km (킬로미터)
function getDistanceFromLatLonInKm(lat1, lng1, lat2, lng2) {
  const R = 6371; // 지구의 평균 반지름 (단위: km)

  // 1. 위도와 경도의 차이를 구하고 라디안(radian) 단위로 변환.
  const dLat = deg2rad(lat2 - lat1);
  const dLng = deg2rad(lng2 - lng1);

  // 2. 하버사인 공식의 핵심 계산 부분 (두 지점 사이의 현의 길이를 계산하는 과정)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) + // 위도 차이의 절반에 대한 사인 제곱
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * // 각 위도의 코사인 값 곱하기
    Math.sin(dLng / 2) * Math.sin(dLng / 2); // 경도 차이의 절반에 대한 사인 제곱

  // 3. 중심각(c)을 구합니다. atan2를 사용하여 수치적 안정성을 높인다.
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  // 4. 지구 반지름에 중심각을 곱해 실제 거리(호의 길이)를 산출.
  return R * c;
}

// 📐 각도(Degree)를 라디안(Radian)으로 변환하는 보조 함수
// 수학 함수(sin, cos 등)는 라디안 값을 인자로 받기 때문에 필수적인 변환.
function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

//아이콘 매핑 설정
const CATEGORY_ICONS = {
  ALL: <AppsIcon />,
  DIGITAL: <LaptopIcon />,
  CAMERA: <CameraAltIcon />,
  CAMPING: <ForestIcon />,
  TOOL: <BuildIcon />,
  SPORTS: <SportsSoccerIcon />,
  PARTY: <CelebrationIcon />,
  CLOTHING: <CheckroomIcon />,
  KIDS: <ChildCareIcon />,
  FURNITURE: <ChairIcon />,
  BOOK: <MenuBookIcon />,
  GAME: <SportsEsportsIcon />,
  BEAUTY: <AutoAwesomeIcon />,
  PET: <PetsIcon />,
  ETC: <MoreHorizIcon />,
};

export default function Home({ isLoggedIn, setIsLoggedIn }) {
  const navigate = useNavigate();

  // =================================================================
  // 1. 상태 관리 (State Management)
  // =================================================================
  const [items, setItems] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('');

  // 뷰 모드 (LIST: 리스트 보기, MAP: 지도 보기)
  const [viewMode, setViewMode] = useState('LIST');

  // 내 위치 및 필터 상태
  // active: 내 주변 필터 활성화 여부
  // lat, lng: 내 현재 좌표
  const [locationFilter, setLocationFilter] = useState({
    active: false,
    lat: null, // 초기값 null
    lng: null
  });

  const [loading, setLoading] = useState(false); // 로딩 상태

  // [NEW] 카테고리 스크롤 제어를 위한 Ref
  const categoryScrollRef = useRef(null);

  const myEmail = localStorage.getItem('userEmail') || '';
  const myName = localStorage.getItem('userName') || myEmail.split('@')[0] || '사용자';

  // =================================================================
  // 2. 데이터 로드 함수 (핵심 로직 - 위치 기반 필터링 & API v.02.05 limit 적용)
  // =================================================================
  const fetchItems = (
    targetCategory = category,
    targetKeyword = keyword,
    targetLoc = locationFilter
  ) => {
    setLoading(true);

    // [A] Mock 모드
    if (IS_MOCK_MODE) {
      setTimeout(() => { // 로딩 느낌을 위해 0.3초 지연
        let filtered = mockItems;

        // 1. 카테고리 필터
        if (targetCategory) filtered = filtered.filter(i => i.category === targetCategory);
        // 2. 검색어 필터
        if (targetKeyword) filtered = filtered.filter(i => i.title.includes(targetKeyword));

        // 3. 위치 기반 필터 (내 주변 5km)
        if (targetLoc.active && targetLoc.lat && targetLoc.lng) {
          console.log("📍 [Mock] 내 주변 5km 필터링 시작:", targetLoc);
          filtered = filtered.filter(item => {
            // 좌표가 없는 아이템은 제외
            if (!item.tradeLatitude || !item.tradeLongitude) return false;

            const dist = getDistanceFromLatLonInKm(
              targetLoc.lat, targetLoc.lng,
              item.tradeLatitude, item.tradeLongitude
            );
            return dist <= 5; // 5km 이내만 통과
          });
        }

        setItems(filtered);
        setLoading(false);
      }, 300);
      return;
    }

    // [B] Real 모드 (v.02.05 API 명세 반영)
    const queryParams = new URLSearchParams();

    // ★ [UPDATE v.02.05] limit 파라미터 확정 반영
    // 설명: v.02.05 명세서에서 리스트 조회 시 limit 파라미터가 공식 확정되었습니다.
    // 기본값은 100개이며, 원활한 검색 결과를 위해 100개를 명시적으로 요청합니다.
    queryParams.append('limit', 100);

    if (targetCategory) queryParams.append('category', targetCategory);
    if (targetKeyword) queryParams.append('keyword', targetKeyword);

    // 위치 필터 파라미터 추가
    if (targetLoc.active && targetLoc.lat && targetLoc.lng) {
      queryParams.append('lat', targetLoc.lat);
      queryParams.append('lng', targetLoc.lng);
      queryParams.append('radius', 5); // 5km 고정
    }

    //  
    fetch(`${API_BASE_URL}/api/items?${queryParams.toString()}`, {
      headers: { ...TUNNEL_HEADERS } // config.js에서 정의한 헤더를 그대로 가져옵니다.
    })
      .then(res => res.json())
      .then(data => {
        // 응답 구조가 배열일 수도 있고, { data: [...] } 형태일 수도 있음 (API 명세에 따라 대응)
        if (Array.isArray(data)) setItems(data);
        else if (data.data && Array.isArray(data.data)) setItems(data.data);
        else setItems([]);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setItems([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line
  }, []);

  // =================================================================
  // 3. 핸들러 (Event Handlers)
  // =================================================================

  // 내 주변 찾기 버튼 클릭
  const handleNearMeClick = () => {
    // 이미 활성화 상태라면 -> 필터 해제
    if (locationFilter.active) {
      const resetLoc = { active: false, lat: null, lng: null };
      setLocationFilter(resetLoc);
      fetchItems(category, keyword, resetLoc);
      return;
    }

    // 비활성화 상태라면 -> GPS로 위치 잡고 필터 적용
    if (!navigator.geolocation) {
      alert("브라우저가 위치 정보를 지원하지 않습니다.");
      return;
    }

    setLoading(true); // 위치 잡는 동안 로딩
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newLoc = {
          active: true,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        };

        // 1. 상태 업데이트
        setLocationFilter(newLoc);
        // 2. 지도 뷰로 자동 전환 (사용자 경험 향상)
        setViewMode('MAP');
        // 3. 데이터 다시 가져오기
        fetchItems(category, keyword, newLoc);

        alert("📍 내 주변 5km 상품을 검색합니다.");
      },
      (err) => {
        console.error(err);
        alert("위치 정보를 가져올 수 없습니다. (위치 권한을 허용해주세요)");
        setLoading(false);
      }
    );
  };

  // 카테고리 클릭 핸들러 (수정됨)
  const handleCategoryClick = (selectedCategory) => {
    // 1. 이미 선택된 카테고리를 다시 눌렀다면? -> 해제 (빈 값)
    // 2. 새로운 카테고리라면? -> 해당 카테고리로 설정
    const newCategory = category === selectedCategory ? '' : selectedCategory;

    setCategory(newCategory);
    fetchItems(newCategory, keyword, locationFilter);
  };

  // [NEW] 카테고리 좌우 스크롤 핸들러
  const handleCategoryScroll = (direction) => {
    if (categoryScrollRef.current) {
      const scrollAmount = 300; // 한 번에 이동할 픽셀 수
      categoryScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth' // 부드럽게 이동
      });
    }
  };

  // 검색
  const handleSearch = () => {
    fetchItems(category, keyword, locationFilter);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.clear();
    alert("로그아웃 되었습니다.");
    navigate('/');
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#f9f9f9' }}>

      {/* --- 네비게이션 바 --- */}
      <AppBar position="static" color="default" elevation={1} sx={{ bgcolor: 'white' }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', cursor: 'pointer', color: '#333' }} onClick={() => navigate('/')}>
            Re:Borrow
          </Typography>
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

      {/* --- 메인 배너 --- */}
      <Box sx={{
        position: 'relative', width: '100%', height: '250px',
        backgroundImage: `url(${MAIN_IMAGE_URL})`, backgroundSize: 'cover', backgroundPosition: 'center',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
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

      {/* --- 🔍 컨트롤 타워 (검색, 필터, 뷰 모드) --- */}
      <Container sx={{ mt: -4, mb: 4, position: 'relative', zIndex: 2 }}>
        <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
          <Stack spacing={2}>

            {/* 1. 검색바 & 내주변 버튼 */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <TextField
                fullWidth
                placeholder="어떤 물건을 찾으시나요?"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyPress={handleKeyPress}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment>,
                }}
                sx={{ bgcolor: 'white' }}
              />

              {/* 내 주변 찾기 버튼 */}
              <Button
                variant={locationFilter.active ? "contained" : "outlined"}
                color={locationFilter.active ? "success" : "primary"}
                onClick={handleNearMeClick}
                startIcon={<MyLocationIcon />}
                sx={{ minWidth: '140px', fontWeight: 'bold', whiteSpace: 'nowrap' }}
              >
                {locationFilter.active ? "필터 해제" : "내 주변 찾기"}
              </Button>

              <Button
                variant="contained"
                onClick={handleSearch}
                sx={{ fontWeight: 'bold', minWidth: '80px' }}
              >
                검색
              </Button>
            </Stack>

            {/* 2. 카테고리 & 뷰 모드 토글 (수정됨: 화살표 스크롤 추가) */}
            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>

              {/* [NEW] 화살표가 포함된 카테고리 영역 */}
              <Stack direction="row" alignItems="center" spacing={1} sx={{ flex: 1, overflow: 'hidden' }}>

                {/* 왼쪽 이동 버튼 */}
                <IconButton
                  onClick={() => handleCategoryScroll('left')}
                  size="small"
                  sx={{
                    border: '1px solid #eee',
                    bgcolor: 'white',
                    '&:hover': { bgcolor: '#f5f5f5' }
                  }}
                >
                  <ArrowBackIosNewIcon fontSize="inherit" />
                </IconButton>

                {/* 카테고리 스크롤 영역 (기존 Chip을 들어내고 아래 내용으로 교체) 2026.02.09 수정 */}
                <Box
                  ref={categoryScrollRef}
                  sx={{
                    display: 'flex',
                    gap: 3, // 아이콘들 사이의 넓은 간격
                    overflowX: 'auto',
                    whiteSpace: 'nowrap',
                    px: 2,
                    py: 1, // 위아래 여백을 줘서 호버 시 안 잘리게 함
                    scrollBehavior: 'smooth',
                    '&::-webkit-scrollbar': { display: 'none' }, // 스크롤바 숨김
                    scrollbarWidth: 'none',
                  }}
                >
                  {/* [전체] 버튼과 기존 [CATEGORIES] 배열을 하나로 합쳐서 반복문 돌림 */}
                  {[{ label: '전체', value: '' }, ...CATEGORIES].map((cat) => {
                    const isSelected = category === cat.value;
                    const iconKey = cat.value === '' ? 'ALL' : cat.value; // 전체는 ALL, 나머지는 해당 value 매칭

                    return (
                      <Stack
                        key={cat.value}
                        alignItems="center"
                        spacing={1}
                        onClick={() => handleCategoryClick(cat.value)}
                        sx={{
                          cursor: 'pointer',
                          minWidth: '70px', // 클릭 영역을 충분히 확보
                        }}
                      >
                        {/* 아이콘을 감싸는 원형 배경 */}
                        <Box
                          sx={{
                            width: 52,
                            height: 52,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            // 선택됐을 때 파란색, 아닐 때 아주 연한 회색
                            backgroundColor: isSelected ? 'primary.main' : '#f5f5f5',
                            // 선택됐을 때 아이콘은 흰색, 아닐 때 진한 회색
                            color: isSelected ? 'white' : '#666',
                            transition: 'all 0.3s ease',
                            // 선택 시 그림자 효과로 입체감 부여
                            boxShadow: isSelected ? '0 4px 12px rgba(25, 118, 210, 0.3)' : 'none',
                            '&:hover': {
                              backgroundColor: isSelected ? 'primary.dark' : '#eef2ff',
                              transform: 'translateY(-4px)', // 위로 톡 튀어오르는 효과
                            },
                          }}
                        >
                          {/* 아이콘 크기 조절하여 삽입 */}
                          {React.cloneElement(CATEGORY_ICONS[iconKey] || <MoreHorizIcon />, { sx: { fontSize: 26 } })}
                        </Box>

                        {/* 아래에 붙는 텍스트 라벨 */}
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: isSelected ? 'bold' : '500',
                            color: isSelected ? 'primary.main' : '#555',
                            fontSize: '0.75rem',
                            transition: 'color 0.2s',
                          }}
                        >
                          {cat.label}
                        </Typography>
                      </Stack>
                    );
                  })}
                </Box>

                {/* 오른쪽 이동 버튼 */}
                <IconButton
                  onClick={() => handleCategoryScroll('right')}
                  size="small"
                  sx={{
                    border: '1px solid #eee',
                    bgcolor: 'white',
                    '&:hover': { bgcolor: '#f5f5f5' }
                  }}
                >
                  <ArrowForwardIosIcon fontSize="inherit" />
                </IconButton>
              </Stack>

              {/* 리스트/지도 뷰 토글 버튼 */}
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(e, newMode) => { if (newMode) setViewMode(newMode); }}
                size="small"
                color="primary"
                sx={{ flexShrink: 0 }} // 버튼이 찌그러지지 않게 고정
              >
                <ToggleButton value="LIST" sx={{ fontWeight: 'bold' }}>
                  <ListIcon sx={{ mr: 0.5 }} /> 리스트
                </ToggleButton>
                <ToggleButton value="MAP" sx={{ fontWeight: 'bold' }}>
                  <MapIcon sx={{ mr: 0.5 }} /> 지도
                </ToggleButton>
              </ToggleButtonGroup>
            </Stack>
          </Stack>
        </Paper>
      </Container>

      {/* --- 📦 콘텐츠 영역 (리스트 or 지도) --- */}
      <Container sx={{ py: 2, pb: 10, flex: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
          {category ? `📂 ${CATEGORIES.find(c => c.value === category)?.label}` : '🔥 전체 상품'}
          {keyword && ` / 검색어: "${keyword}"`}
          {locationFilter.active && <Chip label="📍 내 주변 5km" color="success" size="small" sx={{ ml: 1 }} />}
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>
        ) : items.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 10 }}>
            <Typography variant="h6" color="text.secondary">조건에 맞는 상품이 없습니다.</Typography>
            {locationFilter.active && <Typography variant="body2" color="text.secondary">반경을 넓히거나 다른 지역에서 검색해보세요.</Typography>}
          </Box>
        ) : (
          // 뷰 모드에 따라 분기 처리
          viewMode === 'LIST' ? (
            // [A] 리스트 뷰 (기존 Grid)
            <Grid container spacing={3}>
              {items.map((item) => (
                <Grid item key={item.itemId || item.id} xs={12} sm={6} md={3}>
                  <ItemCard item={item} />
                </Grid>
              ))}
            </Grid>
          ) : (
            // [B] 지도 뷰 (카카오맵)
            <Box sx={{ width: '100%', height: '500px', borderRadius: 3, overflow: 'hidden', border: '1px solid #ddd' }}>
              <Map
                // 지도의 중심좌표 (내 위치가 있으면 내 위치, 없으면 첫 번째 아이템 위치, 다 없으면 강남역)
                center={
                  locationFilter.active && locationFilter.lat
                    ? { lat: locationFilter.lat, lng: locationFilter.lng }
                    : (items[0]?.tradeLatitude
                      ? { lat: items[0].tradeLatitude, lng: items[0].tradeLongitude }
                      : { lat: 37.497942, lng: 127.027621 })
                }
                style={{ width: "100%", height: "100%" }}
                level={locationFilter.active ? 6 : 8} // 내 주변이면 좀 더 확대
              >
                {/* 내 위치 마커 (파란색) */}
                {locationFilter.active && locationFilter.lat && (
                  <MapMarker
                    position={{ lat: locationFilter.lat, lng: locationFilter.lng }}
                    image={{
                      src: "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png", // 빨간 마커 (내 위치)
                      size: { width: 64, height: 69 },
                      options: { offset: { x: 27, y: 69 } }
                    }}
                  />
                )}

                {/* 상품 마커들 (노란색) */}
                {items.map((item) => (
                  item.tradeLatitude && item.tradeLongitude && (
                    <MapMarker
                      key={item.itemId}
                      position={{ lat: item.tradeLatitude, lng: item.tradeLongitude }}
                      onClick={() => navigate(`/items/${item.itemId}`)} // 마커 클릭 시 상세 페이지로
                      image={{
                        src: "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png", // 별 마커 (상품)
                        size: { width: 24, height: 35 }
                      }}
                    >
                      {/* 마커 위 툴팁 (상품명) */}
                      <div style={{ padding: "5px", color: "#000", fontSize: '12px', borderRadius: '4px' }}>
                        {item.title} <br />
                        <span style={{ fontWeight: 'bold', color: 'blue' }}>{item.price?.toLocaleString()}원</span>
                      </div>
                    </MapMarker>
                  )
                ))}
              </Map>
            </Box>
          )
        )}
      </Container>

      {/* --- 푸터 --- */}
      <Box component="footer" sx={{ py: 3, mt: 'auto', bgcolor: '#f1f1f1', textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">© 2026 Re:Borrow</Typography>
      </Box>

      {/* --- 글쓰기 버튼 --- */}
      {isLoggedIn && (
        <Fab
          color="primary"
          aria-label="add"
          sx={{ position: 'fixed', bottom: 30, right: 30, width: 60, height: 60 }}
          onClick={() => navigate('/products/new')}
        >
          <AddIcon />
        </Fab>
      )}
    </Box>
  );
}