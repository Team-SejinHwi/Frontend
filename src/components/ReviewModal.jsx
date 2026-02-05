import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Rating, TextField, Typography, Box, Alert
} from '@mui/material';
import { API_BASE_URL, IS_MOCK_MODE, TUNNEL_HEADERS } from '../config';

// onSuccess: 리뷰 등록 성공 시 부모 컴포넌트(SentRequests)의 목록을 새로고침하기 위한 콜백 함수
export default function ReviewModal({ open, onClose, rentalId, onSuccess }) {
  
  // =================================================================
  // 1. 상태 관리 (State Management)
  // =================================================================
  const [rating, setRating] = useState(5); // 별점 (기본값 5점)
  const [content, setContent] = useState(''); // 후기 내용
  const [loading, setLoading] = useState(false); // 전송 중 로딩 상태

  // =================================================================
  // 2. 핸들러 (Handlers)
  // =================================================================
  
  // 리뷰 등록 요청 처리
  const handleSubmit = async () => {
    // 유효성 검사: 내용이 비어있으면 경고
    if (!content.trim()) {
      alert("후기 내용을 입력해주세요!");
      return;
    }

    setLoading(true);

    try {
      // [A] Mock 모드: 가짜 지연 시간 후 성공 처리
      if (IS_MOCK_MODE) {
        setTimeout(() => {
          alert("🎉 [Mock] 후기가 등록되었습니다!");
          onSuccess(); // 성공 콜백 호출
          handleClose(); // 모달 닫기
        }, 500);
        return;
      }

      // [B] Real 모드: 실제 서버 API 호출
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_BASE_URL}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // 인증 토큰 필수
          ...TUNNEL_HEADERS
        },
        body: JSON.stringify({
          rentalId: rentalId, // 어떤 대여 건인지 식별
          rating: rating,
          content: content
        })
      });

      if (response.ok) {
        alert("후기가 성공적으로 등록되었습니다.");
        onSuccess(); // 목록 새로고침
        handleClose();
      } else {
        const errorData = await response.json();
        alert(errorData.message || "리뷰 등록 실패");
      }
    } catch (error) {
      console.error("리뷰 등록 오류:", error);
      alert("서버 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 모달 닫기 및 입력값 초기화
  const handleClose = () => {
    setRating(5);
    setContent('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold' }}>✍️ 거래 후기 작성</DialogTitle>
      
      <DialogContent dividers>
        <Alert severity="info" sx={{ mb: 2 }}>
          거래는 만족스러우셨나요? 솔직한 후기를 남겨주세요.
        </Alert>

        {/* 별점 입력 영역 */}
        <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
          <Typography component="legend" gutterBottom>별점</Typography>
          <Rating
            name="simple-controlled"
            value={rating}
            onChange={(event, newValue) => setRating(newValue)}
            size="large"
          />
        </Box>

        {/* 내용 입력 영역 */}
        <TextField
          autoFocus
          margin="dense"
          label="후기 내용"
          type="text"
          fullWidth
          multiline
          rows={4}
          variant="outlined"
          placeholder="물건 상태나 거래 과정은 어땠나요? (최소 10자 이상)"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} color="inherit">취소</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading} // 전송 중 중복 클릭 방지
        >
          {loading ? "등록 중..." : "등록하기"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}