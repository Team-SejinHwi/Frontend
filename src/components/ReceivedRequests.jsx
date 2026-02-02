// src/components/ReceivedRequests.jsx
import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Button, Chip, Stack,
  CircularProgress, Grid, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Divider
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HelpIcon from '@mui/icons-material/Help';
import dayjs from 'dayjs';

import { API_BASE_URL, IS_MOCK_MODE } from '../config';
import { mockReceivedRentals } from '../mocks/mockData';

// 상태별 디자인 설정
const STATUS_CONFIG = {
  WAITING: { label: '승인 대기', color: 'warning', icon: <HelpIcon /> },
  APPROVED: { label: '승인됨', color: 'success', icon: <CheckCircleIcon /> },
  REJECTED: { label: '거절됨', color: 'error', icon: <CancelIcon /> },
  COMPLETED: { label: '반납 완료', color: 'default', icon: null },
  CANCELED: { label: '취소됨', color: 'default', variant: 'outlined', icon: null },
};

export default function ReceivedRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // 거절 사유 모달 상태
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [selectedRentalId, setSelectedRentalId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  // 1. 데이터 조회 (GET /api/rentals/requests)
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
          'ngrok-skip-browser-warning': '69420'
        }
      });

      if (response.ok) {
        const result = await response.json();
        setRequests(result.data || []);
      }
    } catch (error) {
      console.error("받은 요청 조회 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // 2. 승인 처리 (바로 API 호출)
  const handleApprove = async (rentalId) => {
    if (!window.confirm("이 대여 요청을 승인하시겠습니까?")) return;

    if (IS_MOCK_MODE) {
        alert("[Mock] 승인되었습니다.");
        // UI 업데이트 흉내
        setRequests(prev => prev.map(r => r.rentalId === rentalId ? { ...r, status: 'APPROVED' } : r));
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
        body: JSON.stringify({ approved: true }) // 승인 시엔 rejectReason 불필요
      });

      if (response.ok) {
        alert("승인되었습니다.");
        fetchRequests(); // 목록 새로고침
      } else {
        const err = await response.json();
        alert(err.message || "승인 실패");
      }
    } catch (error) {
      console.error("승인 오류:", error);
    }
  };

  // 3. 거절 버튼 클릭 (모달 열기)
  const openRejectModal = (rentalId) => {
    setSelectedRentalId(rentalId);
    setRejectReason(""); // 입력창 초기화
    setOpenRejectDialog(true);
  };

  // 4. 거절 확정 (API 호출)
  const handleRejectConfirm = async () => {
    if (!rejectReason.trim()) {
      alert("거절 사유를 입력해주세요. (필수)");
      return;
    }

    if (IS_MOCK_MODE) {
        alert(`[Mock] 거절됨 (사유: ${rejectReason})`);
        setRequests(prev => prev.map(r => r.rentalId === selectedRentalId ? { ...r, status: 'REJECTED' } : r));
        setOpenRejectDialog(false);
        return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_BASE_URL}/api/rentals/${selectedRentalId}/decision`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': '69420'
        },
        body: JSON.stringify({
            approved: false,
            rejectReason: rejectReason // ✅ 명세서 필수 조건 충족
        })
      });

      if (response.ok) {
        alert("거절 처리되었습니다.");
        setOpenRejectDialog(false);
        fetchRequests();
      } else {
        const err = await response.json();
        alert(err.message || "거절 실패");
      }
    } catch (error) {
      console.error("거절 오류:", error);
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
        📥 내 물건에 들어온 요청 ({requests.length})
      </Typography>

      {requests.length === 0 ? (
        <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
          아직 받은 요청이 없습니다.
        </Typography>
      ) : (
        <Stack spacing={2}>
          {requests.map((req) => {
            const statusStyle = STATUS_CONFIG[req.status] || STATUS_CONFIG.WAITING;
            
            return (
              <Card key={req.rentalId} elevation={2} sx={{ borderLeft: req.status === 'WAITING' ? '5px solid #ed6c02' : 'none' }}>
                <CardContent>
                  <Grid container spacing={2} alignItems="center">
                    {/* 상품 정보 */}
                    <Grid item xs={12} sm={8}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {req.itemTitle}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        신청자: <strong>{req.renterName}</strong>
                      </Typography>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="body2">
                        📅 {dayjs(req.startDate).format('MM.DD HH:mm')} ~ {dayjs(req.endDate).format('MM.DD HH:mm')}
                      </Typography>
                      <Typography variant="body2" color="primary" fontWeight="bold">
                        💰 예상 수익: {req.totalPrice?.toLocaleString()}원
                      </Typography>
                    </Grid>

                    {/* 상태 및 버튼 */}
                    <Grid item xs={12} sm={4} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                      <Chip
                        label={statusStyle.label}
                        color={statusStyle.color}
                        icon={statusStyle.icon}
                        variant={req.status === 'WAITING' ? 'filled' : 'outlined'}
                        sx={{ mb: 1 }}
                      />

                      {/* 대기 상태일 때만 버튼 표시 */}
                      {req.status === 'WAITING' && (
                        <Stack direction="row" spacing={1} justifyContent={{ xs: 'flex-start', sm: 'flex-end' }}>
                          <Button 
                            variant="contained" 
                            color="primary" 
                            size="small"
                            onClick={() => handleApprove(req.rentalId)}
                          >
                            승인
                          </Button>
                          <Button 
                            variant="outlined" 
                            color="error" 
                            size="small"
                            onClick={() => openRejectModal(req.rentalId)}
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
      )}

      {/* --- 거절 사유 입력 모달 --- */}
      <Dialog open={openRejectDialog} onClose={() => setOpenRejectDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>거절 사유 입력</DialogTitle>
        <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                신청자에게 거절 사유를 알려주세요.
            </Typography>
            <TextField
                autoFocus
                margin="dense"
                label="거절 사유"
                type="text"
                fullWidth
                multiline
                rows={3}
                variant="outlined"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="예: 해당 기간에는 이미 예약이 있습니다."
            />
        </DialogContent>
        <DialogActions>
            <Button onClick={() => setOpenRejectDialog(false)}>취소</Button>
            <Button onClick={handleRejectConfirm} variant="contained" color="error">거절 확정</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}