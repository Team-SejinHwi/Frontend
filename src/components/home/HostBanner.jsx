import React from 'react';
import { Box, Container, Typography, Button } from '@mui/material';
import { useNavigate } from "react-router-dom";

export default function HostBanner({ isLoggedIn }) {
    const navigate = useNavigate();

    return (
        <>
            {/* --- ✨ 호스트 모집 배너 (CTA) --- */}
            <Box sx={{
                py: 10,
                //  로그인 페이지의 하늘색 그라데이션 적용
                background: 'linear-gradient(to right, #a1c4fd, #c2e9fb)',
                //  밝은 배경에 맞춰 글자색을 진한 회색으로 변경 (가독성 확보)
                color: '#333',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* 배경 장식용 원 (디자인 디테일) */}
                <Box sx={{ position: 'absolute', top: -50, left: -50, width: 200, height: 200, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.4)' }} />
                <Box sx={{ position: 'absolute', bottom: -30, right: -30, width: 150, height: 150, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.4)' }} />

                <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
                    <Typography variant="h3" sx={{ fontWeight: '900', mb: 2 }}>
                        집에 잠들어 있는 물건이 있나요?
                    </Typography>
                    <Typography variant="h6" sx={{ opacity: 0.9, mb: 5, fontWeight: '400' }}>
                        Re:Borrow에서 근처 사람에게 빌려주고 부수입을 올려보세요.
                    </Typography>
                    <Button
                        variant="contained"
                        size="large"
                        sx={{
                            //  버튼은 배경과 대비되도록 진한 색상으로 변경
                            bgcolor: 'primary.main',
                            color: 'white',
                            fontWeight: 'bold',
                            px: 5, py: 1.5,
                            fontSize: '1.2rem',
                            boxShadow: '0 4px 15px rgba(25, 118, 210, 0.3)',
                            '&:hover': { bgcolor: 'primary.dark' }
                        }}
                        onClick={() => {
                            if (isLoggedIn) navigate('/products/new');
                            else navigate('/login');
                        }}
                    >
                        물건 등록하러 가기 🚀
                    </Button>
                </Container>

                {/* 섹션 경계 허물기: "Wave Divider" */}
                <Box sx={{
                    position: 'absolute', bottom: -1, left: 0, width: '100%',
                    overflow: 'hidden', lineHeight: 0, transform: 'rotate(180deg)', zIndex: 0
                }}>
                    <svg viewBox="0 0 1200 120" preserveAspectRatio="none" style={{ width: '100%', height: '60px', display: 'block' }}>
                        <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
                            fill="#ffffff" />
                    </svg>
                </Box>
            </Box>
        </>
    );
}