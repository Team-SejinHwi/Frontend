// 빌린 사람이 내역을 확인하고 [취소] 하는 컴포넌트
import React, { useState, useEffect } from 'react';
import {
    Box, Card, CardContent, Typography, Button, Chip, Stack,
    CircularProgress, Grid
} from '@mui/material';
import dayjs from 'dayjs';

import { API_BASE_URL, IS_MOCK_MODE } from '../config';
import { mockMyRentals } from '../mocks/mockData';

// ✅ 뱃지 스타일 설정 (ReceivedRequests와 동일한 룩앤필 유지)
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

    // 데이터 조회
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
                    "ngrok-skip-browser-warning": "69420"
                }
            });
            if (response.ok) {
                const result = await response.json();
                setRentals(result.data || []);
            }
        } catch (error) {
            console.error("❌ 내 대여 내역 조회 실패:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyRentals();
    }, []);

    // 대여 취소 요청
    const handleCancel = async (rentalId) => {
        if (!window.confirm("정말 대여 신청을 취소하시겠습니까?")) return;

        // [Mock Mode]
        if (IS_MOCK_MODE) {
            alert("[Mock] 취소되었습니다.");
            setRentals(prev => prev.map(r => 
                r.rentalId === rentalId ? { ...r, status: 'CANCELED' } : r
            ));
            return;
        }

        // [Real Mode]
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${API_BASE_URL}/api/rentals/${rentalId}/cancel`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    "ngrok-skip-browser-warning": "69420"
                }
            });

            if (response.ok) {
                alert("취소되었습니다.");
                // 즉시 리스트 상태 업데이트 (네트워크 요청 절약)
                setRentals(prev => prev.map(r => 
                    r.rentalId === rentalId ? { ...r, status: 'CANCELED' } : r
                ));
            } else {
                const msg = await response.text();
                alert(`취소 실패: ${msg}`);
            }
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) return <CircularProgress />;

    if (rentals.length === 0) {
        return (
            <Box sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>
                <Typography>아직 대여 신청한 내역이 없습니다.</Typography>
            </Box>
        );
    }

    return (
        <Stack spacing={2}>
            {rentals.map((rental) => {
                const statusStyle = STATUS_CONFIG[rental.status] || { label: rental.status, color: 'default' };
                
                return (
                    <Card key={rental.rentalId} variant="outlined">
                        <CardContent>
                            <Grid container spacing={2} alignItems="center">
                                <Grid item xs={12} sm={8}>
                                    <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                                        <Chip 
                                            label={statusStyle.label} 
                                            color={statusStyle.color} 
                                            variant={statusStyle.variant} 
                                            size="small" 
                                        />
                                        <Typography variant="h6" component="div">
                                            {rental.itemTitle}
                                        </Typography>
                                    </Stack>
                                    <Typography variant="body2" color="text.secondary">
                                       주인: {rental.ownerName} | 금액: {rental.totalPrice?.toLocaleString()}원
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                       기간: {dayjs(rental.startDate).format('MM.DD HH:mm')} ~ {dayjs(rental.endDate).format('MM.DD HH:mm')}
                                    </Typography>
                                </Grid>
    
                                <Grid item xs={12} sm={4} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
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
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                );
            })}
        </Stack>
    );
}