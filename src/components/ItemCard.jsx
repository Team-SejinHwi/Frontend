import React from 'react';
import { Card, CardContent, CardMedia, Typography, Box, Chip } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';

// 이미지가 없을 때 보여줄 기본 이미지 URL
const DEFAULT_IMAGE = "https://via.placeholder.com/300x200?text=No+Image";

export default function ItemCard({ item }) {
  // 명세서에 있는 필드들을 구조 분해 할당으로 꺼냅니다.
  const { title, price, location, itemStatus, itemImageUrl, createdAt } = item;

  // 상태가 'RENTED'면 '대여중' 뱃지를 보여주기 위함
  const isRented = itemStatus === 'RENTED';

  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        position: 'relative', // 뱃지 위치 잡기용
        cursor: 'pointer',
        transition: '0.3s',
        '&:hover': { transform: 'translateY(-5px)', boxShadow: 6 } // 마우스 올리면 살짝 뜸
      }}
      onClick={() => alert(`상세 페이지 이동 예정 (ID: ${item.itemId})`)}
    >
      {/* 1. 이미지 영역 */}
      <CardMedia
        component="img"
        height="200"
        image={itemImageUrl || DEFAULT_IMAGE} // 이미지가 null이면 기본 이미지 사용
        alt={title}
        sx={{ 
          objectFit: 'cover',
          // 대여 중이면 이미지를 흐리게 처리 (UX 디테일)
          filter: isRented ? 'grayscale(100%)' : 'none' 
        }}
      />

      {/* 2. 상태 뱃지 (대여중일 때만 표시) */}
      {isRented && (
        <Chip 
          label="대여중" 
          color="error" 
          size="small"
          sx={{ position: 'absolute', top: 10, right: 10, fontWeight: 'bold' }} 
        />
      )}

      {/* 3. 텍스트 정보 영역 */}
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h6" component="h2" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
          {title}
        </Typography>
        
        <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold', mb: 1 }}>
          {price.toLocaleString()}원 <span style={{fontSize:'0.8rem', color:'#888'}}>/ 일</span>
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', mt: 1 }}>
          <LocationOnIcon sx={{ fontSize: 16, mr: 0.5 }} />
          <Typography variant="body2">{location}</Typography>
        </Box>
        
        <Typography variant="caption" display="block" sx={{ mt: 1, color: '#aaa' }}>
          등록일: {new Date(createdAt).toLocaleDateString()}
        </Typography>
      </CardContent>
    </Card>
  );
}