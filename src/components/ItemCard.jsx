import React from 'react';
import { Card, CardMedia, CardContent, Typography, Box, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';

export default function ItemCard({ item }) {
  const navigate = useNavigate();

  const getImageUrl = (url) => {
    if (!url) return "https://via.placeholder.com/300?text=No+Image";
    if (url.startsWith("http")) return url;
    return `${API_BASE_URL}${url}`;
  };

  // 🌟 [개선] AVAILABLE이 아닌 모든 상태에 대해 적절한 라벨을 표시합니다.
  const getStatusOverlay = (status) => {
    if (status === 'AVAILABLE') return null; // 대여 가능하면 표시 안 함

    // 상세 페이지와 통일된 라벨 결정 (RENTED 또는 SOLD OUT)
    const label = status === 'RENTED' ? 'RENTED' : 'SOLD OUT';

    return (
      <Box sx={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        bgcolor: 'rgba(0, 0, 0, 0.5)', //  반투명 배경
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1
      }}>
        <Typography variant="h5" sx={{
          color: 'white', fontWeight: 'bold', border: '2px solid white', px: 2, py: 1, borderRadius: 2,
          transform: 'rotate(-15deg)', // 상세 페이지의 회전 스타일 적용
          textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
        }}>
          {label}
        </Typography>
      </Box>
    );
  };

  return (
    <Card
      onClick={() => navigate(`/items/${item.itemId}`)}
      sx={{
        cursor: 'pointer', maxWidth: 345, borderRadius: 2, boxShadow: 3,
        transition: '0.3s', position: 'relative', // overlay 위치 잡기 위해 relative 필수
        '&:hover': { transform: 'scale(1.02)', boxShadow: 6 }
      }}
    >
      {/* 1. 상태 오버레이 랜더링 */}
      {getStatusOverlay(item.itemStatus)}

      <CardMedia
        component="img"
        height="200"
        image={getImageUrl(item.itemImageUrl)}
        alt={item.title}
        sx={{ objectFit: 'cover' }}
      />

      <CardContent>
        {/* 카테고리 칩 작게 표시 */}
        {item.category && (
          <Chip label={item.category} size="small" sx={{ mb: 1, fontSize: '0.7rem', height: 20 }} />
        )}

        <Typography gutterBottom variant="h6" component="div" noWrap sx={{ fontWeight: 'bold' }}>
          {item.title}
        </Typography>
        <Typography variant="body1" color="primary" sx={{ fontWeight: 'bold' }}>
          {item.price?.toLocaleString()}원 <span style={{ fontSize: '0.8rem', color: '#888' }}>/ 시간</span>
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          📍 {item.location}
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
          작성자: {item.owner?.name || "알 수 없음"}
        </Typography>
      </CardContent>
    </Card>
  );
}