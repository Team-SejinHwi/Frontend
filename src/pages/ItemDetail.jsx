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

        // ▼ 에러 로그 메시지
        console.group('🚨 데이터 디버깅 (서버 응답 확인)');
        console.log('1. 서버에서 온 원본 데이터:', itemData);

        // itemData 구조가 { data: {...} } 인지 그냥 {...} 인지 확인하고 변수에 담기
        const realItem = itemData.data || itemData;

        console.log('2. 화면에 쓸 최종 item 객체:', realItem);
        console.log('👉 [핵심] isRequested 값:', realItem.isRequested);
        console.log('👉 [핵심] itemStatus 값:', realItem.itemStatus);
        console.groupEnd();
        // 에러 로그 메시지 끝

        setItem(realItem); // (기존 코드: setItem(itemData.data || itemData); 를 이걸로 대체)

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

  // 🌟 [추가] 대여 신청 성공 시 호출될 함수
  const handleRentalSuccess = () => {
    setItem(prev => ({
      ...prev,
      isRequested: true // 즉시 '이미 신청함' 상태로 변경
    }));
  };

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
    //  로그인 체크
    if (!isLoggedIn) {
      if (window.confirm("로그인이 필요한 서비스입니다.\n로그인 페이지로 이동하시겠습니까?")) {
        navigate('/login');
      }
      return;
    }
    // [A] Mock 모드: 상품 ID에 따라 정해진 채팅방으로 이동 (시나리오 연출용)
    if (IS_MOCK_MODE) {
      if (item.itemId === 10) {
        alert("[Mock] 맥북 채팅방으로 이동합니다.");
        navigate(`/chat/15`); // ChatList에 있는 15번 방과 연결
      } else if (item.itemId === 9) {
        alert("[Mock] 텐트 채팅방으로 이동합니다.");
        navigate(`/chat/16`); // ChatList에 있는 16번 방과 연결
      } else {
        alert("[Mock] 새 채팅방 생성 (테스트)");
        navigate(`/chat/999`);
      }
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
        // [방어 코드 추가] HTTP 통신은 성공(200)했지만, 비즈니스 로직이 실패한 경우 체크
        if (result.success === false) {
          alert(result.message || "채팅방 생성에 실패했습니다.");
          return;
        }
        // 데이터에서 방 번호 추출 (API 명세: data.roomId)
        const realRoomId = (result.data && result.data.roomId) || result.roomId;

        if (realRoomId) {
          navigate(`/chat/${realRoomId}`);
        } else {
          alert("채팅방 번호가 없습니다. 관리자에게 문의하세요.");
        }
      } else {
        // HTTP 에러 (400, 500 등)
        alert(result.message || "채팅방 생성 실패 (서버 오류)");
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
  // 5. 하단 버튼 렌더링 (주인 vs 구매자) - [UI 로직 강화 v.2026.02.12]
  // =================================================================
  //  버튼 스타일(borderRadius, boxShadow)
  const renderActionButtons = () => {
    // Case A: 주인(Owner)일 경우 -> 수정/삭제 버튼

    if (isOwner) {
      return (
        <Stack direction="row" spacing={2} sx={{ width: '100%', mt: 2 }}>
          <Button      // 수정 버튼 
            variant="contained"
            color="primary"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/items/edit/${id}`)}
            fullWidth
            sx={{ py: 1.5, fontWeight: 'bold', borderRadius: 2 }}
          >
            수정
          </Button>
          <Button // 삭제 버튼 (Outlined 유지하되 텍스트/테두리 색상 명확히)
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDelete}
            fullWidth
            sx={{ py: 1.5, fontWeight: 'bold', borderRadius: 2 }}
          >
            삭제
          </Button>
        </Stack>
      );
    }

    //  Case B: 구매자(Renter)일 경우
    // 상태 우선순위: 1. 이미 신청했는가? -> 2. 물건이 이용 가능한가? (v.02.05 명세 반영)
    const alreadyRequested = item.isRequested; //  이미 신청한 내역이 있는지 확인
    const isAvailable = item.itemStatus === 'AVAILABLE';

    return (
      //  direction을 'column'으로 변경하여 세로 배치
      <Stack spacing={2} sx={{ width: '100%', mt: 2 }}>

        {/* 1. 문의하기 버튼 (항상 노출) */}
        <Button
          variant="outlined"
          color="primary"
          startIcon={<ChatIcon />}
          onClick={handleChatStart}
          fullWidth
          sx={{
            py: 1.5,
            fontWeight: 'bold',
            borderWidth: 2,
            borderRadius: 2,
            whiteSpace: 'nowrap',
          }}
        >
          문의하기
        </Button>

        {/* 2. 대여 신청 버튼 (상태에 따른 분기) */}
        {alreadyRequested ? (
          // Case B-1: 이미 신청한 경우 (버튼 비활성화)
          <Button
            variant="contained"
            color="inherit"
            disabled
            startIcon={<EventAvailableIcon />}
            fullWidth
            sx={{ py: 1.5, fontWeight: 'bold', bgcolor: '#e0e0e0', color: '#888', borderRadius: 2 }}
          >
            이미 신청한 상품입니다
          </Button>
        ) : isAvailable ? (
          // Case B-2: 신청 가능 (AVAILABLE)
          <Button
            variant="contained"
            color="primary"
            startIcon={<EventAvailableIcon />}
            onClick={handleOpenModal}
            fullWidth
            sx={{ py: 1.5, fontWeight: 'bold', boxShadow: 3, borderRadius: 2 }}
          >
            대여 신청하기
          </Button>
        ) : (
          // Case B-3: 다른 사람이 대여중 (RENTED 등)
          <Button
            variant="contained"
            disabled
            startIcon={<BlockIcon />}
            fullWidth
            sx={{ py: 1.5, fontWeight: 'bold', bgcolor: '#ccc', color: '#666', borderRadius: 2 }}
          >
           지금은 빌릴 수 없어요
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


  // [수정] UI 렌더링 전체 (좌측: 콘텐츠+지도+후기 / 우측: 스티키 결제창) (2026.02.09 리팩토링)

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}> {/* 가독성을 위해 lg로 조정 */}
      {/* 뒤로가기 버튼 */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/')}
        sx={{ mb: 3, fontWeight: 'bold', color: '#666', '&:hover': { bgcolor: 'transparent', color: 'primary.main' } }}
      >
        목록으로 돌아가기
      </Button>

      <Grid container spacing={12} sx={{
        justifyContent: 'center',
        // 화면이 큰 데스크탑(md 이상)에서만 왼쪽 여백을 주어 오른쪽으로 밀기
        ml: { md: 14, xs: 0 },
        // 전체 너비가 넘치지 않도록 조정
        width: 'auto'
      }}>

        {/* ===========================================================
            [LEFT COLUMN] 콘텐츠 영역 (사진, 설명, 지도, 후기) - md={8}
            =========================================================== */}
        <Grid size={{ xs: 12, sm: 7, md: 7 }}>

          {/* A. 상품 이미지 */}
          <Box sx={{
            position: 'relative',
            borderRadius: 4,
            overflow: 'hidden',
            boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
            bgcolor: 'white',
            height: { md: '500px', xs: '300px' },
            mb: 5
          }}>
            {/* ✨ 모던 오버레이 스타일 (블러 효과 적용) */}
            {item.itemStatus !== 'AVAILABLE' && (
              <Box sx={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                bgcolor: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 10, backdropFilter: 'blur(4px)'
              }}>
                <Typography variant="h3" sx={{ color: 'white', fontWeight: '800', textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
                  대여 불가
                </Typography>
              </Box>
            )}
            <Box
              component="img"
              src={getImageUrl(item.itemImageUrl)}
              alt={item.title}
              sx={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
            />
            {/* ✨  카테고리 칩을 사진 위에 오버레이  2026.02.10 */}
            {item.category && (
              <Chip
                label={item.categoryName || item.category}
                size="small"
                sx={{
                  position: 'absolute', // 사진 위에 둥둥 띄우기
                  top: 20,              // 위에서 20px 간격 (왼쪽 상단 배치)
                  left: 20,             // 왼쪽에서 20px 간격
                  zIndex: 20,           // '대여중' 어두운 막보다 더 위에 보이도록 높게 설정
                  bgcolor: 'white',     // 배경을 흰색으로 해서 사진 위에서도 잘 보이게
                  color: 'primary.main',// 글씨는 파란색
                  fontWeight: '800',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.2)' // 그림자 추가해서 입체감 주기
                }}
              />
            )}
          </Box>

          {/* B. 상품 헤더 및 판매자 정보 */}
          <Box sx={{ mb: 5 }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
              <Typography variant="caption" sx={{ color: '#bbb', fontWeight: '500' }}>
                {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ""} 등록
              </Typography>
            </Stack>

            <Typography variant="h4" sx={{ fontWeight: '800', mb: 3, wordBreak: 'keep-all', color: '#1a1a1a', lineHeight: 1.3 }}>
              {item.title}
            </Typography>

            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar sx={{ bgcolor: 'primary.light', width: 50, height: 50, fontSize: '1.2rem', fontWeight: 'bold' }}>
                {item.owner?.name ? item.owner.name[0] : 'U'}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: '800', color: '#333' }}>
                  호스트: {item.owner?.name || '알 수 없는 사용자'}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PlaceIcon sx={{ fontSize: 14, color: '#999', mr: 0.5 }} />
                  <Typography variant="caption" sx={{ color: '#777', fontWeight: '500' }}>
                    {item.tradeAddress || item.location || '위치 정보 없음'}
                  </Typography>
                </Box>
              </Box>
            </Stack>
            <Divider sx={{ mt: 3 }} />
          </Box>

          {/* C. 상세 설명 */}
          <Box sx={{ mb: 6 }}>
            <Typography variant="h6" sx={{ fontWeight: '800', mb: 2, color: '#333' }}>상품 설명</Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line', color: '#444', lineHeight: 1.8, fontSize: '1rem' }}>
              {item.content || "상세 설명이 없습니다."}
            </Typography>
          </Box>

          <Divider sx={{ mb: 6 }} />

          {/* D. 거래 희망 장소 (지도) - 왼쪽으로 이동 */}
          {item.tradeLatitude && item.tradeLongitude && (
            <Box sx={{ mb: 6 }}>
              <Typography variant="h6" sx={{ fontWeight: '800', mb: 2.5, display: 'flex', alignItems: 'center' }}>
                <PlaceIcon color="primary" sx={{ mr: 1 }} />
                거래 희망 장소
              </Typography>

              <Box sx={{
                borderRadius: 4,
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                position: 'relative',
                border: '1px solid #eee',
                height: '400px'
              }}>
                <Map
                  center={{ lat: item.tradeLatitude, lng: item.tradeLongitude }}
                  style={{ width: "100%", height: "100%" }}
                  level={3}
                  draggable={false}
                  zoomable={false}
                >
                  <MapMarker position={{ lat: item.tradeLatitude, lng: item.tradeLongitude }} />
                </Map>
                <Box
                  sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, cursor: 'pointer', zIndex: 10 }}
                  // onClick={() => window.open(`https://map.kakao.com/link/to/${item.title},${item.tradeLatitude},${item.tradeLongitude}`, '_blank')}
                  // 만약 item.title에 특수문자나 공백이 포함되어 있으면 URL이 깨질 위험이 있다.
                  //encodeURIComponent()를 사용하여 상품명을 안전하게 인코딩 (2026.02.09 수정)
                  onClick={() => window.open(`https://map.kakao.com/link/to/${encodeURIComponent(item.title)},${item.tradeLatitude},${item.tradeLongitude}`, '_blank')}
                  title="카카오맵에서 크게 보기"
                />
              </Box>
            </Box>
          )}

          <Divider sx={{ mb: 6 }} />

          {/* E. 이용 후기 섹션 - 왼쪽으로 이동 */}
          <Box>
            <Typography variant="h6" sx={{ fontWeight: '800', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <span>⭐ 이용 후기 ({reviews.length}개)</span>
              {reviews.length > 0 && (
                <Typography component="span" variant="h6" color="text.secondary" sx={{ fontWeight: '500', ml: 1 }}>
                  (평점 {averageRating})
                </Typography>
              )}
            </Typography>

            <List sx={{ p: 0 }}>
              {reviews.length === 0 ? (
                <Typography color="text.secondary" sx={{ py: 4 }}>아직 작성된 후기가 없습니다.</Typography>
              ) : (
                reviews.map((review, index) => (
                  <React.Fragment key={review.reviewId || index}>
                    <ListItem alignItems="flex-start" sx={{ px: 0, py: 3 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'secondary.light', fontWeight: 'bold' }}>{review.reviewerName ? review.reviewerName[0] : '익'}</Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="subtitle1" fontWeight="800">
                              {review.reviewerName || "익명 사용자"}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ""}
                            </Typography>
                          </Box>
                        }
                        //   수정 사항: secondary의 기본 p태그를 div로 변경 (2026.02.10)
                        secondaryTypographyProps={{ component: 'div' }}
                        secondary={
                          <Box mt={1}>
                            <Rating value={review.rating} readOnly size="small" />
                            <Typography variant="body1" sx={{ mt: 1, color: '#333', lineHeight: 1.6 }}>
                              {review.content}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < reviews.length - 1 && <Divider component="li" />}
                  </React.Fragment>
                ))
              )}
            </List>
          </Box>

        </Grid>

        {/* ===========================================================
            [RIGHT COLUMN] 스티키 액션 카드 (가격 + 예약버튼) - md={4}
            =========================================================== */}
        <Grid size={{ xs: 12, sm: 5, md: 4 }}>
          <Box sx={{ position: 'sticky', top: 100 }}> {/* 스크롤 따라오게 설정 */}
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 4,
                border: '1px solid #e0e0e0',
                bgcolor: 'white',
                boxShadow: '0 12px 40px rgba(0,0,0,0.08)',
              }}
            >
              {/* 1. 가격 정보 */}
              <Typography variant="h3" color="primary.main" sx={{
                fontWeight: '900',
                fontSize: { xs: '1.8rem', md: '2.2rem' }, // 길어질 경우를 대비해 크기를 살짝 조절
                display: 'flex',
                alignItems: 'baseline'
              }}>
                {item.price?.toLocaleString()}
                <Typography component="span" variant="h5" sx={{ fontWeight: '800', ml: 0.5 }}>원</Typography>
                <Typography component="span" variant="body1" sx={{ ml: 1, color: '#999', fontWeight: '600' }}>/ 시간</Typography>
              </Typography>

              <Divider sx={{ my: 3 }} />

              {/* 2. 하단 버튼 영역 */}
              <Box>
                {renderActionButtons()}
              </Box>

              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 3, textAlign: 'center' }}>
                거래 시 안전결제가 적용됩니다.
              </Typography>
            </Paper>
          </Box>
        </Grid>

      </Grid>

      {/* 대여 신청 모달 */}
      <RentalModal
        open={isRentalModalOpen}
        onClose={() => setRentalModalOpen(false)}
        onRentalSuccess={handleRentalSuccess}
        item={item}
      />
    </Container>
  );
}