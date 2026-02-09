import React from 'react';
import { Card, CardMedia, CardContent, Typography, Box, Chip, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';

export default function ItemCard({ item }) {
  const navigate = useNavigate();

  const getImageUrl = (url) => {
    if (!url) return "https://via.placeholder.com/300?text=No+Image";
    if (url.startsWith("http")) return url;
    return `${API_BASE_URL}${url}`;
  };

  // 🌟 [개선] 더 모던한 오버레이 스타일 (도장 효과 제거 -> 텍스트 중심)
  const getStatusOverlay = (status) => {
    if (status === 'AVAILABLE') return null;

    const label = status === 'RENTED' ? '대여 중' : '거래 완료';

    return (
      <Box sx={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        bgcolor: 'rgba(0, 0, 0, 0.45)', // 더 부드러운 암전 효과
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 2, // 칩보다 위에 위치
        backdropFilter: 'blur(2px)', // 미세한 블러 효과로 고급스러움 추가
      }}>
        <Typography variant="h6" sx={{
          color: 'white', fontWeight: '800', 
          letterSpacing: '0.5px',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
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
        cursor: 'pointer',
        maxWidth: 345,
        borderRadius: 4, // 16px로 대폭 상향 (요즘 트렌드)
        border: '1px solid #f0f0f0', // 테두리는 아주 연하게
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)', // 기본 상태는 은은한 그림자
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', // 부드러운 애니메이션
        position: 'relative',
        overflow: 'hidden', // 라운딩된 모서리 밖으로 이미지가 안 나가게 함
        '&:hover': { 
          transform: 'translateY(-8px)', // 위로 쑥 떠오르는 효과
          boxShadow: '0 12px 30px rgba(0,0,0,0.12)', // 호버 시 그림자 깊이감 증가
          '& .card-media': { transform: 'scale(1.05)' } // 이미지 살짝 확대 효과 추가
        }
      }}
    >
      {/* 1. 상태 오버레이 */}
      {getStatusOverlay(item.itemStatus)}

      {/* 2. 이미지 섹션 */}
      <Box sx={{ overflow: 'hidden', position: 'relative' }}>
        <CardMedia
          className="card-media" // 호버 효과를 위한 클래스명
          component="img"
          height="220" // 조금 더 시원하게 키움
          image={getImageUrl(item.itemImageUrl)}
          alt={item.title}
          sx={{ 
            objectFit: 'cover',
            transition: 'transform 0.5s ease' 
          }}
        />
        {/* 카테고리 칩을 이미지 위에 띄우기 (선택 사항) */}
        {item.category && (
          <Chip 
            label={item.category} 
            size="small" 
            sx={{ 
              position: 'absolute', top: 12, left: 12,
              bgcolor: 'rgba(255,255,255,0.9)', 
              fontWeight: 'bold', fontSize: '0.65rem', height: 22,
              backdropFilter: 'blur(4px)',
              zIndex: 1
            }} 
          />
        )}
      </Box>

      {/* 3. 정보 섹션 */}
      <CardContent sx={{ p: 2.5 }}>
        <Typography 
          gutterBottom 
          variant="subtitle1" 
          component="div" 
          noWrap 
          sx={{ fontWeight: '700', mb: 0.5, color: '#333' }}
        >
          {item.title}
        </Typography>
        
        <Typography variant="h6" color="primary" sx={{ fontWeight: '800', display: 'flex', alignItems: 'baseline' }}>
          {item.price?.toLocaleString()}원
          <Typography variant="caption" sx={{ ml: 0.5, color: '#999', fontWeight: '500' }}>/ 시간</Typography>
        </Typography>

        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 2 }}>
          <Typography variant="caption" sx={{ color: '#777', display: 'flex', alignItems: 'center' }}>
            📍 {item.location?.split(' ').slice(0, 2).join(' ') || '위치 정보 없음'} {/* 위치 너무 길면 앞부분만 / 위치가 없을 경우 대비 */}
          </Typography>
          <Typography variant="caption" sx={{ color: '#bbb' }}>
            {item.owner?.name || "익명"}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}