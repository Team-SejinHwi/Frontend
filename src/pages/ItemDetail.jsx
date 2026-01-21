import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Button, Paper, CircularProgress, Grid } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { mockItems } from '../mocks/mockData'; // 👈 가짜 데이터 가져오기
import { IS_MOCK_MODE, API_BASE_URL } from '../config';

export default function ItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const getImageUrl = (url) => {
    if (!url) return "https://via.placeholder.com/400?text=No+Image";
    if (url.startsWith("http")) return url;
    return `${API_BASE_URL}${url}`;
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
  if (!item) return null;

  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 3, fontWeight: 'bold', color: '#555' }}>
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
            <Box sx={{ mt: 4 }}>
              <Button variant="contained" size="large" fullWidth sx={{ py: 1.5, fontWeight: 'bold' }}>
                채팅하기
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}