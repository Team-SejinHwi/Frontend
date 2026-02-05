import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// 지도 라이브러리 
import { Map, MapMarker } from 'react-kakao-maps-sdk';

// UI 컴포넌트: 화면을 예쁘게 구성하기 위한 MUI 라이브러리들
import {
  Container, Typography, Box, Button, Paper, CircularProgress, Grid,
  Chip, Avatar, Divider, Stack, Rating, List, ListItem, ListItemAvatar, ListItemText
} from '@mui/material';

// 아이콘: 버튼에 들어갈 시각적 요소들
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import ChatIcon from '@mui/icons-material/Chat';
import BlockIcon from '@mui/icons-material/Block';
import PlaceIcon from '@mui/icons-material/Place';

// 가짜 데이터(Mock)와 설정 파일(Config)
import { mockItems } from '../mocks/mockData';
import { API_BASE_URL, IS_MOCK_MODE, TUNNEL_HEADERS } from '../config';
import RentalModal from '../components/RentalModal';

export default function ItemDetail() {
  // URL 파라미터에서 상품 ID 추출
  const { id } = useParams();
  const navigate = useNavigate();

  // =================================================================
  // 1. 상태 관리 (State Management)
  // =================================================================
  const [item, setItem] = useState(null); // 상품 데이터
  const [reviews, setReviews] = useState([]); // 🌟 리뷰 목록 데이터
  const [loading, setLoading] = useState(true); // 로딩 상태
  const [isRentalModalOpen, setRentalModalOpen] = useState(false); // 대여 신청 모달

  // =================================================================
  // 2. 권한 및 로그인 정보 확인
  // =================================================================
  const myEmail = localStorage.getItem('userEmail');
  const isLoggedIn = !!localStorage.getItem('accessToken');

  // =================================================================
  // 3. 데이터 조회 (상품 상세 + 리뷰 목록)
  // =================================================================
  useEffect(() => {
    const fetchDetailAndReviews = async () => {
      try {
        // [A] Mock 모드
        if (IS_MOCK_MODE) {
          const found = mockItems.find(i => i.itemId === parseInt(id));

          if (found) {
            setTimeout(() => {
              setItem(found);
              // Mock 리뷰 데이터 (테스트용 하드코딩)
              setReviews([
                { reviewId: 1, reviewerName: "김철수", rating: 5, content: "상태 완전 좋습니다! 잘 썼어요.", createdAt: "2026-01-20" },
                { reviewId: 2, reviewerName: "이영희", rating: 4, content: "겉에는 조금 더러웠지만, 사용에는 문제없어요", createdAt: "2026-01-22" }
              ]);
              setLoading(false);
            }, 500);
          } else {
            // 🚨 [Mock 예외처리] 데이터에 없는 ID일 경우 무한 로딩 방지 후 메인으로 이동
            alert("해당 상품을 찾을 수 없습니다. (Mock Data ID 확인 필요)");
            setLoading(false);
            navigate('/');
          }
          return;
        }

        // [B] Real 모드 (실제 서버 통신)
        const token = localStorage.getItem('accessToken');

        const reqHeaders = {
          ...TUNNEL_HEADERS, // 👈 config.js에서 가져온 localtunnel 헤더를 합쳐줍니다
          "Content-Type": "application/json",
        };

        if (token) {
          reqHeaders["Authorization"] = `Bearer ${token}`;
        }

        // 병렬 호출(Promise.all): 상품 정보와 리뷰 정보를 동시에 가져와 속도 향상
        const [itemRes, reviewRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/items/${id}`, { headers: reqHeaders }),
          fetch(`${API_BASE_URL}/api/reviews/item/${id}`, { headers: reqHeaders })
        ]);

        // 상품 조회 실패 시 에러 처리
        if (!itemRes.ok) throw new Error("상품 조회 실패");
        const itemData = await itemRes.json();
        setItem(itemData.data || itemData);

        // 리뷰 데이터 처리
        if (reviewRes.ok) {
          const reviewData = await reviewRes.json();
          setReviews(reviewData.data || []);
        }

      } catch (error) {
        console.error("Error:", error);
        alert("상품 정보를 불러오는데 실패했습니다.");
        navigate('/');
      } finally {
        if (!IS_MOCK_MODE) setLoading(false);
      }
    };

    fetchDetailAndReviews();
  }, [id, navigate]);

  // 🔑 본인 확인 로직: (상품 주인 이메일 === 내 이메일)
  const isOwner = item?.owner?.email === myEmail;

  // =================================================================
  // 4. 핸들러 (Handlers)
  // =================================================================

  // 상품 삭제
  const handleDelete = async () => {
    if (!window.confirm("정말로 이 게시물을 삭제하시겠습니까?")) return;

    if (IS_MOCK_MODE) {
      alert("[Mock] 삭제 완료");
      navigate('/');
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_BASE_URL}/api/items/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          ...TUNNEL_HEADERS,
        },
      });

      const result = await response.json();
      if (response.ok) {
        alert(result.message || "삭제되었습니다.");
        navigate('/');
      } else {
        alert(result.message || "삭제 실패");
      }
    } catch (error) {
      console.error(error);
      alert("서버 통신 오류");
    }
  };

  // 대여 신청 모달 열기
  const handleOpenModal = () => {
    if (!isLoggedIn) {
      if (window.confirm("로그인이 필요한 서비스입니다.\n로그인 페이지로 이동하시겠습니까?")) {
        navigate('/login');
      }
      return;
    }
    setRentalModalOpen(true);
  };

  // 채팅방 생성 및 이동
  const handleChatStart = async () => {
    if (!isLoggedIn) {
      if (window.confirm("로그인이 필요한 서비스입니다.\n로그인 페이지로 이동하시겠습니까?")) {
        navigate('/login');
      }
      return;
    }

    if (IS_MOCK_MODE) {
      alert("[Mock] 채팅방 생성");
      navigate(`/chat/999`);
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_BASE_URL}/api/chat/room`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...TUNNEL_HEADERS
        },
        body: JSON.stringify({ itemId: item.itemId }),
      });

      const result = await response.json();
      if (response.ok) {
        const realRoomId = (result.data && result.data.roomId) || result.roomId;
        if (realRoomId) {
          navigate(`/chat/${realRoomId}`);
        } else {
          alert("채팅방 번호 없음");
        }
      } else {
        alert(result.message || "채팅방 생성 실패");
      }
    } catch (error) {
      console.error("채팅방 에러:", error);
    }
  };

  const getImageUrl = (url) => {
    if (!url) return "https://via.placeholder.com/400?text=No+Image";
    return url.startsWith("http") ? url : `${API_BASE_URL}${url}`;
  };

  // =================================================================
  // 5. 하단 버튼 렌더링 (주인 vs 구매자)
  // =================================================================
  const renderActionButtons = () => {
    // 주인일 경우: 수정/삭제 버튼
    if (isOwner) {
      return (
        <Stack direction="row" spacing={2} sx={{ width: '100%', mt: 2 }}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/items/edit/${id}`)}
            fullWidth
            sx={{ py: 1.5, fontWeight: 'bold' }}
          >
            수정
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDelete}
            fullWidth
            sx={{ py: 1.5, fontWeight: 'bold' }}
          >
            삭제
          </Button>
        </Stack>
      );
    }

    // 구매자일 경우 (v.02.05 명세 반영)
    const isAvailable = item.itemStatus === 'AVAILABLE';
    const alreadyRequested = item.isRequested; // [NEW] 이미 신청한 내역이 있는지 확인

    return (
      <Stack direction="row" spacing={2} sx={{ width: '100%', mt: 2 }}>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<ChatIcon />}
          onClick={handleChatStart}
          sx={{ flex: 1, py: 1.5, fontWeight: 'bold', borderWidth: 2 }}
        >
          문의하기
        </Button>

        {/* [수정됨] 대여 가능하면서, 아직 신청하지 않은 경우에만 버튼 활성화 */}
        {isAvailable && !alreadyRequested ? (
          <Button
            variant="contained"
            color="primary"
            startIcon={<EventAvailableIcon />}
            onClick={handleOpenModal}
            sx={{ flex: 2, py: 1.5, fontWeight: 'bold', boxShadow: 3 }}
          >
            대여 신청
          </Button>
        ) : (
          <Button
            variant="contained"
            color="inherit"
            disabled
            startIcon={<BlockIcon />}
            sx={{ flex: 2, py: 1.5, fontWeight: 'bold', bgcolor: '#ccc', color: '#666' }}
          >
            {/* 상태 메시지 분기 처리 */}
            {alreadyRequested ? '이미 신청함' : (item.itemStatus === 'RENTED' ? '대여중 (신청불가)' : '거래 완료')}
          </Button>
        )}
      </Stack>
    );
  };

  // 로딩 및 데이터 없음 처리
  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
  if (!item) return null;

  // 평균 별점 계산 (소수점 첫째자리)
  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      {/* 뒤로가기 버튼 */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/')}
        sx={{ mb: 2, fontWeight: 'bold', color: '#666' }}
      >
        목록으로 돌아가기
      </Button>

      <Paper elevation={3} sx={{ borderRadius: 4, overflow: 'hidden' }}>
        <Grid container>
          {/* 상품 이미지 영역 */}
          <Grid item xs={12} md={6} sx={{ bgcolor: '#f4f4f4', minHeight: '400px', position: 'relative' }}>
            {/* 품절/대여중 오버레이 표시 */}
            {item.itemStatus !== 'AVAILABLE' && (
              <Box sx={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                bgcolor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1
              }}>
                <Typography variant="h3" sx={{ color: 'white', fontWeight: 'bold', border: '4px solid white', p: 2, borderRadius: 2, transform: 'rotate(-15deg)' }}>
                  {item.itemStatus === 'RENTED' ? 'RENTED' : 'SOLD OUT'}
                </Typography>
              </Box>
            )}
            <Box
              component="img"
              src={getImageUrl(item.itemImageUrl)}
              alt={item.title}
              sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </Grid>

          {/* 상품 상세 텍스트 영역 */}
          <Grid item xs={12} md={6} sx={{ p: 4, display: 'flex', flexDirection: 'column' }}>

            {/* 카테고리 및 날짜 */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              {item.category && (
                <Chip
                  label={item.categoryName || item.category}
                  color="primary"
                  variant="outlined"
                  size="small"
                  sx={{ fontWeight: 'bold' }}
                />
              )}
              <Typography variant="caption" color="text.secondary">
                {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ""}
              </Typography>
            </Box>

            {/* 제목 및 가격 */}
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, wordBreak: 'keep-all' }}>
              {item.title}
            </Typography>
            <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold', mb: 3 }}>
              {item.price?.toLocaleString()}원
              <Typography component="span" variant="body1" color="text.secondary" sx={{ ml: 0.5 }}>
                / 시간
              </Typography>
            </Typography>

            <Divider sx={{ mb: 3 }} />

            {/* 판매자 정보 및 위치 */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                {item.owner?.name ? item.owner.name[0] : 'U'}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  {item.owner?.name || '알 수 없는 사용자'}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PlaceIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
                  <Typography variant="caption" color="text.secondary">
                    {item.tradeAddress || item.location || '위치 정보 없음'}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* 상세 설명 */}
            <Box sx={{ flexGrow: 1, minHeight: '100px', p: 2, bgcolor: '#fafafa', borderRadius: 2, mb: 3 }}>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-line', color: '#444' }}>
                {item.content || "상세 설명이 없습니다."}
              </Typography>
            </Box>

            {/* 거래 위치 지도 (카카오맵) */}
            {item.tradeLatitude && item.tradeLongitude && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, display: 'flex', alignItems: 'center' }}>
                  <PlaceIcon color="primary" sx={{ mr: 0.5 }} />
                  거래 희망 장소
                </Typography>
                <Box sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid #ddd', position: 'relative' }}>
                  <Map
                    center={{ lat: item.tradeLatitude, lng: item.tradeLongitude }}
                    style={{ width: "100%", height: "200px" }}
                    level={4}
                    draggable={false}
                    zoomable={false}
                  >
                    <MapMarker
                      position={{ lat: item.tradeLatitude, lng: item.tradeLongitude }}
                      onClick={() => window.open(`https://map.kakao.com/link/to/${item.title},${item.tradeLatitude},${item.tradeLongitude}`, '_blank')}
                    />
                  </Map>
                  {/* 클릭 시 길찾기 이동을 위한 투명 레이어 */}
                  <Box
                    sx={{
                      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                      cursor: 'pointer', zIndex: 10
                    }}
                    onClick={() => window.open(`https://map.kakao.com/link/to/${item.title},${item.tradeLatitude},${item.tradeLongitude}`, '_blank')}
                    title="클릭하면 길찾기로 연결됩니다"
                  />
                </Box>
              </Box>
            )}

            {/* 하단 버튼 영역 */}
            <Box sx={{ mt: 'auto' }}>
              {renderActionButtons()}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* 🌟 [NEW] 이용 후기 섹션 */}
      <Box sx={{ mt: 5 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center' }}>
          ⭐ 이용 후기 ({reviews.length})
          {reviews.length > 0 && (
            <Typography component="span" variant="h6" color="primary" sx={{ ml: 1, fontWeight: 'bold' }}>
              {averageRating} / 5.0
            </Typography>
          )}
        </Typography>

        <Paper elevation={1} sx={{ borderRadius: 3, p: 2 }}>
          {reviews.length === 0 ? (
            <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
              아직 작성된 후기가 없습니다. 첫 번째 후기를 남겨보세요!
            </Typography>
          ) : (
            <List>
              {reviews.map((review, index) => (
                <React.Fragment key={review.reviewId || index}>
                  <ListItem alignItems="flex-start">
                    <ListItemAvatar>
                      <Avatar>{review.reviewerName ? review.reviewerName[0] : '익'}</Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="subtitle1" fontWeight="bold">
                            {review.reviewerName || "익명 사용자"}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ""}
                          </Typography>
                        </Box>
                      }
                      secondaryTypographyProps={{ component: 'div' }}
                      secondary={
                        <Box mt={0.5}>
                          <Rating value={review.rating} readOnly size="small" />
                          <Typography variant="body2" color="text.primary" sx={{ mt: 1 }}>
                            {review.content}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < reviews.length - 1 && <Divider variant="inset" component="li" />}
                </React.Fragment>
              ))}
            </List>
          )}
        </Paper>
      </Box>

      {/* 대여 신청 모달 */}
      <RentalModal
        open={isRentalModalOpen}
        onClose={() => setRentalModalOpen(false)}
        item={item}
      />
    </Container>
  );
}