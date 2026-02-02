// src/components/SentRequests.jsx
import React, { useState, useEffect } from 'react';
import {
    Box, Card, CardContent, Typography, Button, Chip, Stack,
    CircularProgress, Grid, Alert
} from '@mui/material';
import dayjs from 'dayjs';

import { API_BASE_URL, IS_MOCK_MODE } from '../config';
import { mockMyRentals } from '../mocks/mockData';

const STATUS_CONFIG = {
    WAITING: { label: '승인 대기중', color: 'warning', variant: 'outlined' },
    APPROVED: { label: '예약 확정', color: 'success', variant: 'filled' },
    REJECTED: { label: '거절됨', color: 'error', variant: 'filled' },
    COMPLETED: { label: '이용 완료', color: 'default', variant: 'filled' },
    CANCELED: { label: '취소함', color: 'default', variant: 'outlined' }
};

export default function SentRequests() {
    const [rentals, setRentals] = useState([]);
    const [loading, setLoading] = useState(true);

    // 1. 데이터 조회 (GET /api/rentals/my)
    const fetchMyRentals = async () => {
        try {
            if (IS_MOCK_MODE) {
                setRentals(mockMyRentals);
                setLoading(false);
                return;
            }

            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${API_BASE_URL}/api/rentals/my`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'ngrok-skip-browser-warning': '69420'
                }
            });

            if (response.ok) {
                const result = await response.json();
                setRentals(result.data || []);
            }
        } catch (error) {
            console.error("내 예약 조회 실패:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyRentals();
    }, []);

    // 2. 요청 취소 (POST /api/rentals/{id}/cancel)
    const handleCancel = async (rentalId) => {
        if (!window.confirm("정말 이 대여 요청을 취소하시겠습니까?")) return;

        if (IS_MOCK_MODE) {
            alert("[Mock] 취소되었습니다.");
            setRentals(prev => prev.map(r => r.rentalId === rentalId ? { ...r, status: 'CANCELED' } : r));
            return;
        }

        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${API_BASE_URL}/api/rentals/${rentalId}/cancel`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'ngrok-skip-browser-warning': '69420'
                }
            });

            if (response.ok) {
                alert("요청이 취소되었습니다.");
                fetchMyRentals();
            } else {
                const err = await response.json();
                alert(err.message || "취소 실패");
            }
        } catch (error) {
            console.error("취소 오류:", error);
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>;

    return (
        <Box>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                📤 내가 보낸 대여 요청 ({rentals.length})
            </Typography>

            {rentals.length === 0 ? (
                <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                    신청한 대여 내역이 없습니다.
                </Typography>
            ) : (
                <Stack spacing={2}>
                    {rentals.map((rental) => {
                        const statusStyle = STATUS_CONFIG[rental.status] || STATUS_CONFIG.WAITING;

                        return (
                            <Card key={rental.rentalId} elevation={2}>
                                <CardContent>
                                    <Grid container spacing={2} alignItems="center">
                                        
                                        {/* 대여 정보 */}
                                        <Grid item xs={12} sm={8}>
                                            <Typography variant="subtitle1" fontWeight="bold">
                                                {rental.itemTitle}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                주인: <strong>{rental.ownerName}</strong>
                                            </Typography>
                                            <Typography variant="body2">
                                                📅 {dayjs(rental.startDate).format('MM.DD HH:mm')} ~ {dayjs(rental.endDate).format('MM.DD HH:mm')}
                                            </Typography>
                                            <Typography variant="body2" fontWeight="bold" sx={{ mt: 0.5 }}>
                                                결제 예정 금액: {rental.totalPrice?.toLocaleString()}원
                                            </Typography>

                                            {/* ✅ 거절 사유 표시 (중요) */}
                                            {rental.status === 'REJECTED' && rental.rejectReason && (
                                                <Alert severity="error" sx={{ mt: 1, py: 0 }}>
                                                    거절 사유: {rental.rejectReason}
                                                </Alert>
                                            )}
                                        </Grid>

                                        {/* 상태 및 버튼 */}
                                        <Grid item xs={12} sm={4} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                                            <Chip
                                                label={statusStyle.label}
                                                color={statusStyle.color}
                                                variant={statusStyle.variant}
                                                sx={{ mb: 1 }}
                                            />
                                            <Box>
                                                {/* 대기 상태일 때만 취소 가능 */}
                                                {rental.status === 'WAITING' && (
                                                    <Button
                                                        variant="outlined"
                                                        color="secondary"
                                                        size="small"
                                                        onClick={() => handleCancel(rental.rentalId)}
                                                    >
                                                        요청 취소
                                                    </Button>
                                                )}
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        );
                    })}
                </Stack>
            )}
        </Box>
    );
}