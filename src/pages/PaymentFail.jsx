// src/pages/PaymentFail.jsx
import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Paper } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

export default function PaymentFail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const code = searchParams.get("code");
  const message = searchParams.get("message");

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
      <Paper elevation={3} sx={{ p: 5, borderRadius: 4, textAlign: 'center', maxWidth: 500 }}>
        <ErrorOutlineIcon sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
        <Typography variant="h4" fontWeight="bold" gutterBottom>결제 실패</Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          {message || "알 수 없는 이유로 결제에 실패했습니다."} <br/>
          (에러 코드: {code})
        </Typography>
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => navigate('/mypage')}
        >
          돌아가기
        </Button>
      </Paper>
    </Box>
  );
}