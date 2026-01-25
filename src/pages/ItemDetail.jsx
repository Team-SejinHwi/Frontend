import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Button, Paper, CircularProgress, Grid } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { mockItems } from '../mocks/mockData'; // 👈 가짜 데이터 가져오기
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit'; // ✏️ 이거 없으면 에러나요!
import { IS_MOCK_MODE, API_BASE_URL } from '../config';

export default function ItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  //  내 이메일 가져오기 (로그인 시 저장했다고 가정)
  // 만약 로그인 안 했으면 null이 됨
  const myEmail = localStorage.getItem('userEmail');

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        // 🚩 [A] Mock 모드일 때
        if (IS_MOCK_MODE) {
          console.log(`🛠️ [Mock] 상세 데이터 찾는 중... ID: ${id}`);
          // 가짜 데이터 배열에서 ID가 같은 것 찾기
          const found = mockItems.find(i => i.itemId === parseInt(id));

          if (found) {
            // 0.5초 뒤에 데이터 세팅 (로딩 느낌 내기)
            setTimeout(() => {
              setItem(found);
              setLoading(false);
            }, 500);
            return;
          }
          // 못 찾으면 아래 에러 로직으로 넘어감
        }

        // 🚩 [B] Real 모드일 때 (기존 코드)

        const response = await fetch(`/api/items/${id}`, {
          headers: {
            "ngrok-skip-browser-warning": "69420",
          },
        });

        if (!response.ok) throw new Error("상품을 찾을 수 없습니다.");
        const data = await response.json();
        setItem(data.data || data);

      } catch (error) {
        console.error("상세 정보 로드 실패:", error);
        alert("상품 정보를 불러오는데 실패했습니다.");
        navigate('/');
      } finally {
        if (!IS_MOCK_MODE) setLoading(false);
      }
    };

    fetchDetail();
  }, [id, navigate]);


  
  // //디버깅
  // console.log('권한 디버깅', {
  //   myEmail: localStorage.getItem('userEmail'),
  //   onwerEmail: item?.owner?.email,
  //   match: item?.owner?.email === localStorage.getItem('userEmail')
  // });


  //  주인인지 확인하는 변수 생성 (item이 로드된 후에 판단)
  // item.owner.email : 글 쓴 사람 (API 명세서 3번 항목 참조)
  // myEmail : 현재 로그인한 사람
  const isOwner = item && item.owner && (item.owner.email === myEmail);

  // (참고: Mock 모드일 때는 테스트를 위해 무조건 true로 두거나, 가짜 데이터 이메일과 맞추셔도 됩니다)


  // 삭제 핸들러 함수
  const handleDelete = async () => {
    //1. 사용자 확인
    if (!window.confirm("정말로 이 게시물을 삭제하시겠습니까?\n삭제 후에는 복구할 수 없습니다.")) {
      return;
    }
    // [A] Mock 모드 삭제 시뮬레이션
    if (IS_MOCK_MODE) {
      alert("[Mock] 삭제가 완료되었습니다.");
      navigate('/');
      return;
    }

    // [B] Real 모드 API 호출
    try {
      // ⚠️ 중요: 로그인 시(Login.jsx) 저장했던 토큰 키값
      const token = localStorage.getItem('accessToken');

      const response = await fetch(`${API_BASE_URL}/api/items/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`, // 명세서 Auth: 필수 조건 충족
          'ngrok-skip-browser-warning': '69420',
        },
      });

      if (response.ok) {
        alert("상품이 성공적으로 삭제되었습니다.");
        navigate('/'); // 메인으로 이동
      } else {
        // 에러 응답 파싱
        const errorData = await response.text();
        console.error("삭제 실패:", errorData);
        alert("삭제에 실패했습니다. (본인 게시물이 아니거나 서버 오류)");
      }
    } catch (error) {
      console.error("Delete request error:", error);
      alert("네트워크 오류가 발생했습니다.");
    }
  };

  const getImageUrl = (url) => {
    if (!url) return "https://via.placeholder.com/400?text=No+Image";
    if (url.startsWith("http")) return url;
    return `${API_BASE_URL}${url}`;
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
  if (!item) return null;

  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/')} sx={{ mb: 3, fontWeight: 'bold', color: '#555' }}>
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
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>{item.title}</Typography>
            <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold', mb: 3 }}>
              {item.price?.toLocaleString()}원 <span style={{ fontSize: '1rem', color: '#888' }}>/ 일</span>
            </Typography>
            <Box sx={{ p: 2, bgcolor: '#f9f9f9', borderRadius: 2, mb: 3 }}>
              <Typography variant="subtitle2" color="text.secondary">📍 거래 희망 장소</Typography>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{item.location}</Typography>
            </Box>
            <Typography variant="body1" sx={{ flexGrow: 1, whiteSpace: 'pre-line', color: '#333' }}>
              {item.content || "상세 설명이 없습니다."}
            </Typography>

            {/* 버튼 영역: Box에 flex를 줘서 버튼들을 가로로 예쁘게 배치 */}
            <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                size="large"
                // fullWidth 대신 flex: 1을 주면 공간을 나눠 가짐.
                sx={{ py: 1.5, fontWeight: 'bold', flex: 1 }}
              >
                채팅하기
              </Button>

              {/* 주인일 때만 보이는 수정/삭제 버튼 그룹 */}
              {isOwner && (
                <>
                  {/* ✏️ 수정 버튼  */}
                  <Button
                    variant="outlined"
                    color="primary"
                    size="large"
                    startIcon={<EditIcon />}
                    onClick={() => navigate(`/items/edit/${id}`)}
                    sx={{ py: 1.5, fontWeight: 'bold', flex: 1 }}
                  >
                    수정
                  </Button>

                  {/* 🗑️ 삭제 버튼 */}
                  {/*  조건부 렌더링: 주인일 때만 버튼 표시 */}
                  <Button
                    variant="outlined"
                    color="error"
                    size="large"
                    startIcon={<DeleteIcon />}
                    onClick={handleDelete}
                    sx={{ py: 1.5, fontWeight: 'bold', minWidth: '120px' }}
                  >
                    삭제
                  </Button>
                </>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}