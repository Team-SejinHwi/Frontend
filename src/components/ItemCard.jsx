import React from 'react';
import { Card, CardMedia, CardContent, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';

export default function ItemCard({ item }) {
  const navigate = useNavigate();

  const getImageUrl = (url) => {
    if (!url) return "https://via.placeholder.com/300?text=No+Image";
    if (url.startsWith("http")) return url;
    return `${API_BASE_URL}${url}`;
  };

  return (
    <Card 
      // 👇 [수정 1] item.id가 아니라 item.itemId 입니다!
      onClick={() => navigate(`/items/${item.itemId}`)}
      sx={{ cursor: 'pointer', maxWidth: 345, borderRadius: 2, boxShadow: 3, transition: '0.3s', '&:hover': { transform: 'scale(1.02)' } }}
    >
      <CardMedia
        component="img"
        height="200"
        // 👇 [수정 2] item.imageUrl이 아니라 item.itemImageUrl 입니다!
        image={getImageUrl(item.itemImageUrl)} 
        alt={item.title}
        sx={{ objectFit: 'cover' }}
      />
      
      <CardContent>
        <Typography gutterBottom variant="h6" component="div" noWrap sx={{ fontWeight: 'bold' }}>
          {item.title}
        </Typography>
        <Typography variant="body1" color="primary" sx={{ fontWeight: 'bold' }}>
          {item.price?.toLocaleString()}원 <span style={{ fontSize: '0.8rem', color: '#888' }}>/ 일</span>
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          📍 {item.location}
        </Typography>
        {/* 👇 [추가] 작성자 이름도 데이터에 있길래 넣어봤습니다 */}
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
          작성자: {item.ownerName}
        </Typography>
      </CardContent>
    </Card>
  );
}