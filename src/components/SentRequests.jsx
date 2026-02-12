// src/components/SentRequests.jsx
import React, { useState, useEffect } from 'react';
import {
    Box, Card, CardContent, Typography, Button, Chip, Stack,
    CircularProgress, Grid, Alert
} from '@mui/material';
import dayjs from 'dayjs';

// 아이콘
import RateReviewIcon from '@mui/icons-material/RateReview'; // 리뷰 아이콘
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn'; //  반납 아이콘

import { API_BASE_URL, IS_MOCK_MODE, TUNNEL_HEADERS } from '../config';
import { mockMyRentals, mockItems } from '../mocks/mockData';
import ReviewModal from './ReviewModal';

// =================================================================
// 0. 상태별 뱃지 디자인 설정 (v.02.11 명세 반영)
// =================================================================
const STATUS_CONFIG = {
    WAITING: { label: '승인 대기중', color: 'warning', variant: 'outlined' },
    APPROVED: { label: '결제 필요', color: 'success', variant: 'filled' }, //구매자는 승인된 건에 대해 결제를 해야 함.
    PAID: { label: '인수 대기중', color: 'info', variant: 'outlined' },    // [NEW] 주인이 줄 때까지 대기
    RENTING: { label: '대여 중', color: 'primary', variant: 'filled' },      //  현재 대여 중 (반납 필요)
    RETURNED: { label: '반납 완료', color: 'default', variant: 'filled' },   //  반납 완료 (리뷰 작성 가능)
    REJECTED: { label: '거절됨', color: 'error', variant: 'filled' },
    CANCELED: { label: '취소함', color: 'default', variant: 'outlined' }
};

export default function SentRequests() {
    // =================================================================
    // 1. 상태 관리 (State Management)
    // =================================================================
    const [rentals, setRentals] = useState([]);
    const [loading, setLoading] = useState(true);

    // 리뷰 모달 제어용 상태
    const [isReviewModalOpen, setReviewModalOpen] = useState(false);
    const [selectedRentalIdForReview, setSelectedRentalIdForReview] = useState(null);

    // =================================================================
    // 2. 데이터 조회 (Data Fetching)
    // =================================================================
    // 내가 보낸 대여 요청 목록 조회 (GET /api/rentals/my)
    const fetchMyRentals = async () => {
        try {
            // [A] Mock 모드
            if (IS_MOCK_MODE) {
                setRentals(mockMyRentals);
                setLoading(false);
                return;
            }

            // [B] Real 모드
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${API_BASE_URL}/api/rentals/my`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    ...TUNNEL_HEADERS
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

    // 컴포넌트 마운트 시 데이터 로드
    useEffect(() => {
        fetchMyRentals();
    }, []);

    // =================================================================
    // 3. 핸들러 (Event Handlers)
    // =================================================================

    // [A] 요청 취소 핸들러 (POST /api/rentals/{id}/cancel)
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
                    ...TUNNEL_HEADERS
                }
            });

            if (response.ok) {
                alert("요청이 취소되었습니다.");
                fetchMyRentals(); // 목록 갱신
            } else {
                const err = await response.json();
                alert(err.message || "취소 실패");
            }
        } catch (error) {
            console.error("취소 오류:", error);
        }
    };

    // [NEW] [B] 결제 시뮬레이션 핸들러
    const handlePayment = async (rentalId) => {
        // 실제로는 여기서 Toss Payments 창을 띄우겠지만, 지금은 바로 결제 승인 API를 호출합니다.
        if (!window.confirm("150,000원을 결제하시겠습니까? (테스트)")) return;

        if (IS_MOCK_MODE) {
            alert("[Mock] 결제가 완료되었습니다.");
            setRentals(prev => prev.map(r => r.rentalId === rentalId ? { ...r, status: 'PAID' } : r));
            return;
        }

        try {
            const token = localStorage.getItem('accessToken');
            // 결제 승인 API 호출
            const response = await fetch(`${API_BASE_URL}/api/payments/confirm`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    ...TUNNEL_HEADERS
                },
                body: JSON.stringify({
                    rentalId: rentalId,
                    paymentKey: "TEST_PAYMENT_KEY", // 임시 키
                    orderId: `ORDER_${rentalId}`,   // 임시 주문 ID
                    amount: 150000                  // 임시 금액 (원래는 rental.totalPrice 써야 함)
                })
            });

            if (response.ok) {
                alert("결제가 완료되었습니다! 주인이 물품을 전달하면 대여가 시작됩니다.");
                fetchMyRentals();
            } else {
                const err = await response.json();
                alert(err.message || "결제 실패");
            }
        } catch (error) {
            console.error("결제 오류:", error);
        }
    };

    // [C]  물품 반납 핸들러 (POST /api/rentals/{id}/return) - v.02.05 추가
    const handleReturn = async (rentalId) => {
        if (!window.confirm("물건을 반납하시겠습니까?\n반납 후에는 상태를 되돌릴 수 없습니다.")) return;

        if (IS_MOCK_MODE) {
            alert("[Mock] 반납이 완료되었습니다.");
            setRentals(prev => prev.map(r => r.rentalId === rentalId ? { ...r, status: 'RETURNED' } : r));

            // [추가] 해당 상품의 상태도 AVAILABLE로 변경
            const targetRental = rentals.find(r => r.rentalId === rentalId);
            if (targetRental) {
                const item = mockItems.find(i => i.itemId === targetRental.itemId);
                if (item) item.itemStatus = 'AVAILABLE';
            }
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
                fetchMyRentals(); // 목록 갱신 (상태 변경 확인)
            } else {
                const err = await response.json();
                alert(err.message || "반납 처리 실패");
            }
        } catch (error) {
            console.error("반납 오류:", error);
            alert("서버 통신 중 오류가 발생했습니다.");
        }
    };

    // [D] 리뷰 작성 모달 열기 핸들러
    const handleOpenReview = (rentalId) => {
        setSelectedRentalIdForReview(rentalId);
        setReviewModalOpen(true);
    };


    // 로딩 중 표시
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
                        // 정의되지 않은 상태가 올 경우 기본값 처리
                        const statusStyle = STATUS_CONFIG[rental.status] || STATUS_CONFIG.WAITING;

                        return (
                            <Card key={rental.rentalId} elevation={2}>
                                <CardContent>
                                    <Grid container spacing={2} alignItems="center">

                                        {/* 좌측: 대여 정보 요약 */}
                                        <Grid size={{ xs: 12, sm: 8 }}>
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

                                            {/* 거절된 경우 사유 표시 */}
                                            {rental.status === 'REJECTED' && rental.rejectReason && (
                                                <Alert severity="error" sx={{ mt: 1, py: 0 }}>
                                                    거절 사유: {rental.rejectReason}
                                                </Alert>
                                            )}
                                        </Grid>

                                        {/* 우측: 상태 뱃지 및 액션 버튼 */}
                                        <Grid size={{ xs: 12, sm: 4 }} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                                            <Chip
                                                label={statusStyle.label}
                                                color={statusStyle.color}
                                                variant={statusStyle.variant}
                                                sx={{ mb: 1 }}
                                            />
                                            <Box>
                                                {/* Case 1: 대기 상태 (WAITING) -> [요청 취소] */}
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


                                                {/* [NEW] Case 2: 승인됨 (APPROVED) -> [결제 하기] 버튼 노출 */}
                                                {rental.status === 'APPROVED' && (
                                                    <Button
                                                        variant="contained"
                                                        color="primary" // 결제는 중요한 액션이므로 Primary 컬러
                                                        size="small"
                                                        onClick={() => handlePayment(rental.rentalId)}
                                                        sx={{ fontWeight: 'bold' }}
                                                    >
                                                        결제 하기
                                                    </Button>
                                                )}

                                                {/* [NEW] Case 3: 결제 완료 (PAID) -> 대기 안내 메시지 (버튼 없음) */}
                                                {rental.status === 'PAID' && (
                                                    <Typography variant="caption" color="text.secondary">
                                                        주인에게 물건을 받으세요
                                                    </Typography>
                                                )}

                                                {/* Case 4: 대여 중 (RENTING) -> [반납 하기]  */}
                                                {rental.status === 'RENTING' && (
                                                    <Button
                                                        variant="contained"
                                                        color="primary"
                                                        size="small"
                                                        startIcon={<AssignmentReturnIcon />}
                                                        onClick={() => handleReturn(rental.rentalId)}
                                                        sx={{ fontWeight: 'bold' }}
                                                    >
                                                        반납 하기
                                                    </Button>
                                                )}

                                                {/* Case 5: 반납 완료 (RETURNED) -> [후기 작성] */}
                                                {rental.status === 'RETURNED' && (
                                                    <Button
                                                        variant="contained"
                                                        color="success" // 리뷰는 긍정적인 느낌의 success 컬러 추천
                                                        size="small"
                                                        startIcon={<RateReviewIcon />}
                                                        onClick={() => handleOpenReview(rental.rentalId)}
                                                    >
                                                        후기 작성
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

            {/* 리뷰 작성 모달 (부모 상태에 따라 열림) */}
            <ReviewModal
                open={isReviewModalOpen}
                onClose={() => setReviewModalOpen(false)}
                rentalId={selectedRentalIdForReview}
                onSuccess={() => {
                    // 리뷰 작성 완료 시 목록 새로고침 (상태 업데이트 등 필요시)
                    fetchMyRentals();
                }}
            />
        </Box>
    );
}