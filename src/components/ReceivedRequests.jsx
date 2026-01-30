// 주인이 들어온 요청을 보고 [승인] / [거절] 하는 컴포넌트
import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Button, Chip, Stack,
  CircularProgress, Grid
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import dayjs from 'dayjs';

import { API_BASE_URL, IS_MOCK_MODE } from '../config';
import { mockReceivedRentals } from '../mocks/mockData';

// ✅ 뱃지 스타일 설정 객체 (UI 로직 분리)
const STATUS_CONFIG = {
  WAITING: { label: '승인 대기', color: 'warning', icon: <CircularProgress size={16} /> },
  APPROVED: { label: '승인됨', color: 'success', icon: <CheckCircleIcon /> },
  REJECTED: { label: '거절됨', color: 'error', icon: <CancelIcon /> },
  COMPLETED: { label: '반납 완료', color: 'default', icon: null },
  CANCELED: { label: '취소됨', color: 'default', variant: 'outlined', icon: null },
};

export default function ReceivedRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // 데이터 조회
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        if (IS_MOCK_MODE) {
          setRequests(mockReceivedRentals);
          setLoading(false);
          return;
        }

        const token = localStorage.getItem('accessToken');
        const response = await fetch(`${API_BASE_URL}/api/rentals/requests`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            "ngrok-skip-browser-warning": "69420"
          }
        });

        if (response.ok) {
          const result = await response.json();
          setRequests(result.data || []);
        }
      } catch (error) {
        console.error("❌ 받은 요청 조회 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  // 승인/거절 처리 핸들러
  const handleDecision = async (rentalId, decision) => {
    const isApprove = decision === 'approve';
    let rejectReason = null;

    // 1. 거절일 경우 사유 입력 받기 (명세서 필수 사항)
    if (!isApprove) {
      rejectReason = window.prompt("거절 사유를 입력해주세요:");
      if (!rejectReason) return; // 취소 시 중단
    }

    if (!window.confirm(`정말 이 요청을 ${isApprove ? '승인' : '거절'}하시겠습니까?`)) return;

    if (IS_MOCK_MODE) {
      alert(`[Mock] 처리되었습니다.`);
      setRequests(prev => prev.map(req =>
        req.rentalId === rentalId ? { ...req, status: isApprove ? 'APPROVED' : 'REJECTED' } : req
      ));
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_BASE_URL}/api/rentals/${rentalId}/decision`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': '69420'
        },
        // 🚩 휘님의 최신 명세서 규격 적용
        body: JSON.stringify({
          approved: isApprove,
          rejectReason: isApprove ? null : rejectReason
        })
      });

      if (response.ok) {
        alert(isApprove ? "승인되었습니다." : "거절되었습니다.");
        setRequests(prev => prev.map(req =>
          req.rentalId === rentalId ? { ...req, status: isApprove ? 'APPROVED' : 'REJECTED' } : req
        ));
      } else {
        const errorMsg = await response.text();
        alert(`처리 실패: ${errorMsg}`);
      }
    } catch (error) {
      console.error(error);
      alert("서버 연결 실패");
    }
  };

  if (loading) return <CircularProgress />;

  if (requests.length === 0) {
    return (
      <Box sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>
        <Typography>아직 들어온 대여 요청이 없습니다.</Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={2}>
      {requests.map((req) => {
        // 설정 객체에서 스타일 가져오기 (없으면 기본값)
        const statusStyle = STATUS_CONFIG[req.status] || { label: req.status, color: 'default' };

        return (
          <Card key={req.rentalId} variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent>
              <Grid container alignItems="center" spacing={2}>
                {/* 좌측: 정보 영역 */}
                <Grid item xs={12} sm={8}>
                  <Typography variant="h6" fontWeight="bold">
                    {req.itemTitle}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    신청자: <strong>{req.renterName}</strong> | 예상 수익: <strong>{req.totalPrice?.toLocaleString()}원</strong>
                  </Typography>
                  <Typography variant="caption" display="block" sx={{ bgcolor: '#f5f5f5', p: 1, borderRadius: 1, mt: 1 }}>
                    📅 기간: {dayjs(req.startDate).format('MM/DD HH:mm')} ~ {dayjs(req.endDate).format('MM/DD HH:mm')}
                  </Typography>
                </Grid>

                {/* 우측: 상태 및 버튼 영역 */}
                <Grid item xs={12} sm={4} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                  <Box sx={{ mb: 1 }}>
                    <Chip
                      label={statusStyle.label}
                      color={statusStyle.color}
                      icon={statusStyle.icon}
                      variant={statusStyle.variant || 'filled'}
                    />
                  </Box>

                  {/* 상태가 'WAITING'일 때만 승인/거절 버튼 노출 */}
                  {req.status === 'WAITING' && (
                    <Stack direction="row" spacing={1} justifyContent={{ xs: 'flex-start', sm: 'flex-end' }}>
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => handleDecision(req.rentalId, 'approve')}
                      >
                        승인
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => handleDecision(req.rentalId, 'reject')}
                      >
                        거절
                      </Button>
                    </Stack>
                  )}
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        );
      })}
    </Stack>
  );
}