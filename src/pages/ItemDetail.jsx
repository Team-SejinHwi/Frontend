import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// UI 컴포넌트: 화면을 예쁘게 구성하기 위한 MUI 라이브러리들
import {
  Container, Typography, Box, Button, Paper, CircularProgress, Grid,
  Chip, Avatar, Divider, Stack
} from '@mui/material';

// 아이콘: 버튼에 들어갈 시각적 요소들
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import ChatIcon from '@mui/icons-material/Chat';
import BlockIcon from '@mui/icons-material/Block'; // 금지 표시 아이콘 (대여중일 때 사용)

// 가짜 데이터(Mock)와 설정 파일(Config)
import { mockItems } from '../mocks/mockData';
import { IS_MOCK_MODE, API_BASE_URL } from '../config';
import RentalModal from '../components/RentalModal';

export default function ItemDetail() {
  // URL 파라미터에서 상품 ID 추출 (예: /items/10 -> id = 10)
  const { id } = useParams();
  const navigate = useNavigate();

  // =================================================================
  // 1. 상태 관리 (State Management)
  // =================================================================
  const [item, setItem] = useState(null); // 불러온 상품 데이터를 저장
  const [loading, setLoading] = useState(true); // 데이터 로딩 중인지 여부 (로딩바 표시용)
  const [isRentalModalOpen, setRentalModalOpen] = useState(false); // 대여 신청 모달 창 열림/닫힘 상태

  // =================================================================
  // 2. 권한 및 로그인 정보 확인
  // =================================================================
  // 현재 로그인한 사람의 이메일 (나중에 '이 글이 내 글인가?' 확인할 때 씀)
  const myEmail = localStorage.getItem('userEmail');
  // 토큰이 있는지 확인하여 로그인 여부 판단
  const isLoggedIn = !!localStorage.getItem('accessToken');

  // =================================================================
  // 3. 상품 상세 정보 로드 (API 명세 1-3. 상품 상세 조회)
  // =================================================================
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        // [A] Mock 모드 (백엔드 없을 때 테스트용)
        if (IS_MOCK_MODE) {
          const found = mockItems.find(i => i.itemId === parseInt(id));
          if (found) {
            // 로딩 효과를 주기 위해 0.5초 뒤에 데이터 세팅
            setTimeout(() => {
              setItem(found);
              setLoading(false);
            }, 500);
            return;
          }
        }

        // [B] Real 모드 (실제 서버 통신)
        // GET /api/items/{itemId} 호출
        const response = await fetch(`${API_BASE_URL}/api/items/${id}`, {
          headers: { "ngrok-skip-browser-warning": "69420" },
        });

        if (!response.ok) throw new Error("상품 조회 실패");
        const data = await response.json();

        // API 응답이 { data: { ... } } 형태일 수도 있고, 바로 객체일 수도 있어서 방어 코드 작성
        setItem(data.data || data);

      } catch (error) {
        console.error("Error:", error);
        alert("상품 정보를 불러오는데 실패했습니다.");
        navigate('/'); // 에러 나면 메인으로 튕겨냄
      } finally {
        if (!IS_MOCK_MODE) setLoading(false); // 로딩 끝
      }
    };

    fetchDetail();
  }, [id, navigate]);

  // 디버깅용 로그 (개발자 도구 콘솔에서 확인 가능)
  console.log("=============== 주인 확인 디버깅 ===============");
  console.log("1. 내 이메일 (로그인한 사람):", myEmail);
  console.log("2. 상품 주인 정보:", item?.owner);

  // 🔑 본인 확인 로직: (상품 주인의 이메일 === 내 이메일)이면 true
  const isOwner = item?.owner?.email === myEmail;

  // =================================================================
  // 4. 상품 삭제 핸들러 (API 명세 1-5. 상품 삭제)
  // =================================================================
  const handleDelete = async () => {
    if (!window.confirm("정말로 이 게시물을 삭제하시겠습니까?")) return;

    if (IS_MOCK_MODE) {
      alert("[Mock] 삭제 완료");
      navigate('/');
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      // DELETE /api/items/{itemId}
      // 내 글을 지우는 것이므로 Authorization 헤더(토큰) 필수!
      const response = await fetch(`${API_BASE_URL}/api/items/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': '69420',
        },
      });

      const result = await response.json();

      if (response.ok) {
        alert(result.message || "삭제되었습니다.");
        navigate('/'); // 삭제 후 메인으로 이동
      } else {
        alert(result.message || "삭제 실패");
      }
    } catch (error) {
      console.error(error);
      alert("서버 통신 오류");
    }
  };

  // =================================================================
  // 5. 모달 오픈 핸들러 (대여 신청 버튼 클릭 시)
  // =================================================================
  const handleOpenModal = () => {
    // 비로그인 상태면 로그인 페이지로 유도
    if (!isLoggedIn) {
      if (window.confirm("로그인이 필요한 서비스입니다.\n로그인 페이지로 이동하시겠습니까?")) {
        navigate('/login');
      }
      return;
    }
    // 로그인 상태면 모달 열기
    setRentalModalOpen(true);
  };

  // =================================================================
  // 6. 채팅 시작 핸들러 (API 명세 3-1. 채팅방 생성)
  // =================================================================
  const handleChatStart = async () => {
    if (!isLoggedIn) {
      if (window.confirm("로그인이 필요한 서비스입니다.\n로그인 페이지로 이동하시겠습니까?")) {
        navigate('/login');
      }
      return;
    }

    if (IS_MOCK_MODE) {
      alert("[Mock] 채팅방 생성 (테스트)");
      navigate(`/chat/999`);
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      // POST /api/chat/room -> { itemId: 10 } 보냄
      const response = await fetch(`${API_BASE_URL}/api/chat/room`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': '69420'
        },
        body: JSON.stringify({ itemId: item.itemId }),
      });

      const result = await response.json();

      if (response.ok) {
        // 서버가 준 roomId를 찾아서 해당 채팅방으로 이동
        const realRoomId = (result.data && result.data.roomId) || result.roomId;

        if (realRoomId) {
          console.log("채팅방 생성 성공:", realRoomId);
          navigate(`/chat/${realRoomId}`);
        } else {
          alert("채팅방 번호를 찾을 수 없습니다.");
        }
      } else {
        alert(result.message || "채팅방 생성 실패");
      }
    } catch (error) {
      console.error("채팅방 에러:", error);
      alert("서버 연결 실패");
    }
  };

  // 이미지 URL 처리 함수 (http로 시작하면 그대로, 아니면 서버 주소 붙임)
  const getImageUrl = (url) => {
    if (!url) return "https://via.placeholder.com/400?text=No+Image";
    return url.startsWith("http") ? url : `${API_BASE_URL}${url}`;
  };

  // =================================================================
  // 7. 하단 버튼 렌더링 (핵심 로직 - 조건부 렌더링)
  // =================================================================
  const renderActionButtons = () => {
    // CASE A: 내가 주인일 때 -> [수정] [삭제] 버튼 표시
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

    // CASE B: 남의 물건일 때 (구매자 입장)
    // 1. [문의하기] 버튼: 언제나 표시
    // 2. [대여 신청] 버튼: 대여 가능 상태(AVAILABLE)일 때만 활성화
    const isAvailable = item.itemStatus === 'AVAILABLE';

    return (
      <Stack direction="row" spacing={2} sx={{ width: '100%', mt: 2 }}>
        {/* ✅ [추가됨] 문의하기 버튼 */}
        <Button
          variant="outlined"
          color="primary"
          startIcon={<ChatIcon />}
          onClick={handleChatStart}
          sx={{ flex: 1, py: 1.5, fontWeight: 'bold', borderWidth: 2 }}
        >
          문의하기
        </Button>

        {/* 대여 신청 버튼 (상태에 따라 모양이 바뀜) */}
        {isAvailable ? (
          <Button
            variant="contained"
            color="primary"
            startIcon={<EventAvailableIcon />}
            onClick={handleOpenModal} // 모달 띄우기
            sx={{ flex: 2, py: 1.5, fontWeight: 'bold', boxShadow: 3 }}
          >
            대여 신청
          </Button>
        ) : (
          <Button
            variant="contained"
            color="inherit" // 회색 버튼
            disabled // 클릭 금지
            startIcon={<BlockIcon />}
            sx={{ flex: 2, py: 1.5, fontWeight: 'bold', bgcolor: '#ccc', color: '#666' }}
          >
            {item.itemStatus === 'RENTED' ? '대여중 (신청불가)' : '거래 완료'}
          </Button>
        )}
      </Stack>
    );
  };

  // 로딩 중일 때 로딩 스피너 표시
  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
  // 상품 데이터가 없으면 아무것도 안 그림
  if (!item) return null;

  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      {/* 상단: 목록으로 돌아가기 버튼 */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/')}
        sx={{ mb: 2, fontWeight: 'bold', color: '#666' }}
      >
        목록으로 돌아가기
      </Button>

      <Paper elevation={3} sx={{ borderRadius: 4, overflow: 'hidden' }}>
        <Grid container>
          {/* --- 좌측: 상품 이미지 영역 --- */}
          <Grid item xs={12} md={6} sx={{ bgcolor: '#f4f4f4', minHeight: '400px', position: 'relative' }}>
            
            {/* 상태 오버레이 (대여중/완료일 때 이미지 위에 덮어씌움) */}
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

          {/* --- 우측: 상세 정보 텍스트 영역 --- */}
          <Grid item xs={12} md={6} sx={{ p: 4, display: 'flex', flexDirection: 'column' }}>

            {/* 1. 카테고리 칩 & 등록일 */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              {item.category && (
                <Chip
                  label={item.categoryName || item.category} // 예: 'DIGITAL' or '디지털/가전'
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

            {/* 2. 제목 & 가격 정보 */}
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

            {/* 3. 판매자(Owner) 프로필 섹션 */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                {item.owner?.name ? item.owner.name[0] : 'U'}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  {item.owner?.name || '알 수 없는 사용자'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {item.location}
                </Typography>
              </Box>
            </Box>

            {/* 4. 본문 내용 (상세 설명) */}
            <Box sx={{ flexGrow: 1, minHeight: '100px', p: 2, bgcolor: '#fafafa', borderRadius: 2, mb: 2 }}>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-line', color: '#444' }}>
                {item.content || "상세 설명이 없습니다."}
              </Typography>
            </Box>

            {/* 5. 하단 액션 버튼들 (조건부 렌더링 함수 호출) */}
            <Box sx={{ mt: 'auto' }}>
              {renderActionButtons()}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* --- 대여 신청 모달 (숨겨져 있다가 열림) --- */}
      <RentalModal
        open={isRentalModalOpen}
        onClose={() => setRentalModalOpen(false)}
        item={item} // 어떤 상품을 빌리는지 정보 전달
      />
    </Container>
  );
}