// src/pages/PaymentSuccess.jsx

import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, CircularProgress, Paper } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import { API_BASE_URL, TUNNEL_HEADERS, IS_MOCK_MODE } from '../config';

export default function PaymentSuccess() {


    const [searchParams] = useSearchParams(); //Hook은 컴포넌트 최상단에서 호출
    const navigate = useNavigate();
    const [isConfirming, setIsConfirming] = useState(true);

    // 🌟 [핵심] 중복 요청 방지용 깃발 (ref는 리렌더링 되어도 값이 유지됨)
    const isProcessing = useRef(false);

    useEffect(() => {
        // 🌟 [핵심] 이미 처리 중이라면(깃발이 true라면) 함수 종료!
        if (isProcessing.current) {
            return;
        }

        // 깃발을 꽂음 (이제부터 중복 진입 불가)
        isProcessing.current = true;

        // 1. URL 쿼리 파라미터에서 데이터 추출
        const paymentKey = searchParams.get("paymentKey");
        const orderId = searchParams.get("orderId");
        const amount = Number(searchParams.get("amount"));

        // 🌟 [추가] 아까 저장해둔 rentalId 꺼내기 (26.02.15)
        const storedRentalId = localStorage.getItem('tempRentalId');

        if (!paymentKey || !orderId || !amount) {
            alert("결제 정보가 올바르지 않습니다.");
            navigate('/');
            return;
        }

        // 2. 백엔드로 승인 요청 (API 명세 v.02.11)
        const confirmPayment = async () => {

            try {
                // 🌟  Mock Mode일 때 백엔드 통신 없이 성공 처리
                if (IS_MOCK_MODE) {
                    console.log("🚀 [Mock] 결제 승인 시뮬레이션");
                    console.log(`- paymentKey: ${paymentKey}`);
                    console.log(`- orderId: ${orderId}`);
                    console.log(`- amount: ${amount}`);

                    // 1초 정도 로딩 흉내를 내고 성공 화면으로 전환
                    setTimeout(() => {
                        setIsConfirming(false);
                    }, 1000);
                    return;
                }

                // 🌟 Real Mode (휘님 백엔드 통신)API 명세 v.02.11

                const token = localStorage.getItem('accessToken');
                const response = await fetch(`${API_BASE_URL}/api/payments/confirm`, {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        ...TUNNEL_HEADERS
                    },
                    body: JSON.stringify({
                        rentalId: Number(storedRentalId),
                        paymentKey,
                        orderId,
                        amount
                    }),
                });

                if (response.ok) {
                    // 성공 시 UI 표시를 위해 로딩만 끔 (자동 이동은 사용자 선택)
                    setIsConfirming(false);
                } else {
                    // 실패 시
                    const err = await response.json();
                    alert(`승인 실패: ${err.message}`);
                    navigate('/mypage');
                }
            } catch (error) {
                console.error("결제 승인 에러:", error);
                alert("결제 처리 중 오류가 발생했습니다.");
                navigate('/mypage');
            }
        };

        confirmPayment();
    }, [searchParams, navigate]);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
            <Paper elevation={3} sx={{ p: 5, borderRadius: 4, textAlign: 'center', maxWidth: 500 }}>
                {isConfirming ? (
                    <>
                        <CircularProgress size={60} sx={{ mb: 3 }} />
                        <Typography variant="h6">결제를 확인하고 있습니다...</Typography>
                        <Typography variant="body2" color="text.secondary">잠시만 기다려주세요.</Typography>
                    </>
                ) : (
                    <>
                        <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
                        <Typography variant="h4" fontWeight="bold" gutterBottom>결제 성공!</Typography>
                        <Typography variant="body1" sx={{ mb: 4 }}>
                            정상적으로 대여 예약이 확정되었습니다.<br />
                            이제 주인에게 물건을 받으세요.
                        </Typography>
                        <Button
                            variant="contained"
                            size="large"
                            fullWidth
                            onClick={() => navigate('/mypage')}
                            sx={{ py: 1.5, fontWeight: 'bold' }}
                        >
                            내 대여 내역 확인하기
                        </Button>
                    </>
                )}
            </Paper>
        </Box>
    );
}