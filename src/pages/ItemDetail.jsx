import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Typography, Box, Button, Paper, CircularProgress, Grid
} from '@mui/material';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';

import { mockItems } from '../mocks/mockData';
import { IS_MOCK_MODE, API_BASE_URL } from '../config';
import RentalModal from '../components/RentalModal';

export default function ItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // 상태 관리
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRentalModalOpen, setRentalModalOpen] = useState(false);

  // 현재 로그인한 사용자 정보 (권한 체크용)
  const myEmail = localStorage.getItem('userEmail');
  // 🔑 로그인 여부 확인을 위한 토큰 가져오기
  const isLoggedIn = !!localStorage.getItem('accessToken');

  /**
   * 1. 상품 상세 정보 로드
   */
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        if (IS_MOCK_MODE) {
          const found = mockItems.find(i => i.itemId === parseInt(id));
          if (found) {
            setTimeout(() => {
              setItem(found);
              setLoading(false);
            }, 500);
            return;
          }
        }

        const response = await fetch(`${API_BASE_URL}/api/items/${id}`, {
          headers: { "ngrok-skip-browser-warning": "69420" },
        });

        if (!response.ok) throw new Error("상품 조회 실패");
        const data = await response.json();
        setItem(data.data || data);

      } catch (error) {
        console.error("Error:", error);
        alert("상품 정보를 불러오는데 실패했습니다.");
        navigate('/');
      } finally {
        if (!IS_MOCK_MODE) setLoading(false);
      }
    };

    fetchDetail();
  }, [id, navigate]);

  // 👇 [디버깅 코드] 이 부분을 추가해서 콘솔을 확인해주세요!
  console.log("=============== 주인 확인 디버깅 ===============");
  console.log("1. 내 이메일 (내 주머니):", myEmail);
  console.log("2. 상품 데이터 전체 (서버가 준 거):", item);

  // 혹시 owner가 null인지, 구조가 다른지 확인
  if (item) {
    console.log("3. 서버가 말하는 주인 정보:", item.owner);
    console.log("4. 서버가 말하는 주인의 이메일:", item.owner?.email);
   
  }
  console.log("===============================================");

  const isOwner = item?.owner?.email === myEmail;

  /**
   * 2. 삭제 핸들러
   */
  const handleDelete = async () => {
    if (!window.confirm("정말로 이 게시물을 삭제하시겠습니까?")) return;

    if (IS_MOCK_MODE) {
      alert("[Mock] 삭제 완료");
      navigate('/');
      return;
    }

    try {

      // const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_BASE_URL}/api/items/${id}`, {
        method: 'DELETE',

        // 🔥 [핵심 추가] 쿠키를 실어 보내야 삭제 권한이 인정됨!, 나중에 지우기
        credentials: 'include',

        headers: {
          // 'Authorization': `Bearer ${token}`, // 나중에 활성화
          'ngrok-skip-browser-warning': '69420',
        },
      });

      const result = await response.json();

      if (response.ok) {
        // 백엔드 메시지: "상품 삭제 완료" 등
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

  /**
   * 🚨 3. [NEW] 모달 열기 전 로그인 체크 핸들러
   */
  const handleOpenModal = () => {
    // 1. 로그인이 안 되어 있다면?
    if (!isLoggedIn) {
      // confirm 창을 띄워 의사를 물어봅니다.
      if (window.confirm("로그인이 필요한 서비스입니다.\n로그인 페이지로 이동하시겠습니까?")) {
        navigate('/login'); // 👈 로그인 페이지 이동.
      }
      return; // 모달을 열지 않고 함수 종료
    }

    // 2. 로그인이 되어 있다면 모달 열기
    setRentalModalOpen(true);
  };

  const getImageUrl = (url) => {
    if (!url) return "https://via.placeholder.com/400?text=No+Image";
    return url.startsWith("http") ? url : `${API_BASE_URL}${url}`;
  };

  /**
   * 4. 버튼 렌더링
   */
  const renderActionButtons = () => {
    if (isOwner) {
      return (
        <>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/items/edit/${id}`)}
            sx={{ flex: 1, py: 1.5, fontWeight: 'bold' }}
          >
            수정
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDelete}
            sx={{ minWidth: '100px', py: 1.5, fontWeight: 'bold' }}
          >
            삭제
          </Button>
        </>
      );
    }

    return (
      <>
        <Button
          variant="contained"
          color="inherit"
          sx={{ flex: 1, py: 1.5, fontWeight: 'bold', bgcolor: '#eee', color: '#333' }}
          // 채팅 버튼도 로그인이 필요하다면 여기에 handleOpenModal을 연결할 수도 있음
          onClick={() => alert("채팅 기능은 준비 중입니다.")}
        >
          채팅하기
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={<EventAvailableIcon />}
          // 👇 기존: onClick={() => setRentalModalOpen(true)}
          // 👇 변경: 로그인 체크 함수 연결
          onClick={handleOpenModal}
          sx={{ flex: 2, py: 1.5, fontWeight: 'bold' }}
        >
          대여 신청하기
        </Button>
      </>
    );
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
  if (!item) return null;

  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/')}
        sx={{ mb: 3, fontWeight: 'bold', color: '#555' }}
      >
        목록으로
      </Button>

      <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Grid container>
          <Grid item xs={12} md={6}>
            <Box
              component="img"
              src={getImageUrl(item.itemImageUrl)}
              alt={item.title}
              sx={{ width: '100%', height: '100%', minHeight: '400px', objectFit: 'cover', bgcolor: '#f0f0f0' }}
            />
          </Grid>

          <Grid item xs={12} md={6} sx={{ p: 4, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
              등록일: {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "최근"}
            </Typography>

            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>
              {item.title}
            </Typography>

            {/* 가격 표시 (시간 기준) */}
            <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold', mb: 3 }}>
              {item.price?.toLocaleString()}원
              <span style={{ fontSize: '1rem', color: '#888', marginLeft: '4px' }}>/ 시간</span>
            </Typography>

            <Box sx={{ p: 2, bgcolor: '#f9f9f9', borderRadius: 2, mb: 3 }}>
              <Typography variant="subtitle2" color="text.secondary">📍 거래 희망 장소</Typography>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                {item.location}
              </Typography>
            </Box>

            <Typography variant="body1" sx={{ flexGrow: 1, whiteSpace: 'pre-line', color: '#333' }}>
              {item.content || "상세 설명이 없습니다."}
            </Typography>

            <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
              {renderActionButtons()}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <RentalModal
        open={isRentalModalOpen}
        onClose={() => setRentalModalOpen(false)}
        item={item}
      />
    </Container>
  );
}