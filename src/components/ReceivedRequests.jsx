// src/components/ReceivedRequests.jsx
import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Button, Chip, Stack,
  CircularProgress, Grid, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Divider
} from '@mui/material';

// 아이콘
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HelpIcon from '@mui/icons-material/Help';
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn'; // [NEW] 반납 아이콘
import dayjs from 'dayjs';

import { API_BASE_URL, IS_MOCK_MODE, TUNNEL_HEADERS } from '../config';
import { mockReceivedRentals } from '../mocks/mockData';

// =================================================================
// 0. 상태별 디자인 설정 (v.02.05 명세 반영)
// =================================================================
const STATUS_CONFIG = {
  WAITING: { label: '승인 대기', color: 'warning', icon: <HelpIcon /> },
  APPROVED: { label: '승인됨', color: 'success', icon: <CheckCircleIcon /> },
  REJECTED: { label: '거절됨', color: 'error', icon: <CancelIcon /> },
  RENTING: { label: '대여 중', color: 'primary', icon: null },          // [NEW] 현재 대여 진행 중
  RETURNED: { label: '반납 완료', color: 'info', icon: null },           // [UPDATE] COMPLETED -> RETURNED
  CANCELED: { label: '취소됨', color: 'default', variant: 'outlined', icon: null },
};

export default function ReceivedRequests() {
  // =================================================================
  // 1. 상태 관리 (State Management)
  // =================================================================
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // 거절 사유 모달 상태
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [selectedRentalId, setSelectedRentalId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  // =================================================================
  // 2. 데이터 조회 (Data Fetching)
  // =================================================================
  // 내 물건에 들어온 대여 요청 조회 (GET /api/rentals/requests)
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
          ...TUNNEL_HEADERS
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

  // =================================================================
  // 3. 핸들러 (Event Handlers)
  // =================================================================

  // [A] 승인 처리 (POST /api/rentals/{id}/decision)
  const handleApprove = async (rentalId) => {
    if (!window.confirm("이 대여 요청을 승인하시겠습니까?")) return;

    if (IS_MOCK_MODE) {
        alert("[Mock] 승인되었습니다.");
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
          ...TUNNEL_HEADERS
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

  // [B] 거절 버튼 클릭 (모달 열기)
  const openRejectModal = (rentalId) => {
    setSelectedRentalId(rentalId);
    setRejectReason(""); // 입력창 초기화
    setOpenRejectDialog(true);
  };

  // [C] 거절 확정 (API 호출) - rejectReason 필수 포함
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
          ...TUNNEL_HEADERS
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

  // [NEW] 반납 완료 확인 핸들러 (POST /api/rentals/{id}/return) - v.02.05 추가
  const handleReturnConfirm = async (rentalId) => {
    if (!window.confirm("물건을 돌려받으셨나요?\n반납 완료 처리를 하면 상품이 다시 '대여 가능' 상태로 변경됩니다.")) return;

    if (IS_MOCK_MODE) {
        alert("[Mock] 반납 확인 완료");
        setRequests(prev => prev.map(r => r.rentalId === rentalId ? { ...r, status: 'RETURNED' } : r));
        return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_BASE_URL}/api/rentals/${rentalId}/return`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          ...TUNNEL_HEADERS
        }
      });

      if (response.ok) {
        alert("반납 처리가 완료되었습니다.");
        fetchRequests();
      } else {
        const err = await response.json();
        alert(err.message || "반납 처리 실패");
      }
    } catch (error) {
      console.error("반납 오류:", error);
    }
  };

  // 로딩 처리
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
                    {/* 상품 정보 영역 */}
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

                    {/* 상태 및 액션 버튼 영역 */}
                    <Grid item xs={12} sm={4} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                      <Chip
                        label={statusStyle.label}
                        color={statusStyle.color}
                        icon={statusStyle.icon}
                        variant={req.status === 'WAITING' ? 'filled' : 'outlined'}
                        sx={{ mb: 1 }}
                      />

                      {/* Case 1: 대기 상태일 때 -> [승인/거절] 버튼 */}
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

                      {/* Case 2: 대여 중 상태일 때 -> [반납 확인] 버튼 (NEW) */}
                      {req.status === 'RENTING' && (
                        <Box>
                          <Button 
                            variant="contained" 
                            color="info" 
                            size="small"
                            startIcon={<AssignmentReturnIcon />}
                            onClick={() => handleReturnConfirm(req.rentalId)}
                            sx={{ fontWeight: 'bold' }}
                          >
                            반납 확인
                          </Button>
                        </Box>
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
        <DialogTitle sx={{ fontWeight: 'bold' }}>🚫 대여 거절 사유 입력</DialogTitle>
        <DialogContent dividers>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                신청자에게 거절 사유를 알려주세요. (명세서상 필수 입력 항목입니다)
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
                placeholder="예: 해당 기간에는 이미 다른 오프라인 예약이 있습니다."
            />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenRejectDialog(false)} color="inherit">취소</Button>
            <Button onClick={handleRejectConfirm} variant="contained" color="error">거절 확정</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}