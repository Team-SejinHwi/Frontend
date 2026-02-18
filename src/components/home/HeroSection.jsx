import React from 'react';
import { Box, Container, Typography } from '@mui/material';

const MAIN_IMAGE_URL = "https://i.postimg.cc/MHNP5WB5/image.jpg";


// ✨ 애니메이션 키프레임 정의 (스타일 객체로 분리)  - Ver. 2026.02.18 추가
const keyframes = {
    '@keyframes fadeInUp': {
        '0%': { opacity: 0, transform: 'translateY(30px)' },
        '100%': { opacity: 1, transform: 'translateY(0)' },
    },
    '@keyframes fadeIn': {
        '0%': { opacity: 0 },
        '100%': { opacity: 1 },
    }
};

export default function HeroSection() {
    return (
        <>
            {/* --- 메인 배너 --- */}
            <Box sx={{
                position: 'relative',
                width: '100vw', // 100% 대신 100vw를 사용하면 화면 끝까지 참.
                left: '50%',
                right: '50%',
                marginLeft: '-50vw',
                marginRight: '-50vw',
                height: { xs: '400px', md: '520px' }, // 높이를 더 키워서 몰입감을 줌.
                backgroundImage: `url(${MAIN_IMAGE_URL})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                // 그라데이션 오버레이 추가 (글자가 훨씬 잘 보임)
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.6) 100%)',
                    zIndex: 1
                },
                ...keyframes
            }}>
                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, textAlign: 'center', color: 'white' }}>

                    {/* 1. 메인 카피: 애니메이션 + 키워드 강조 */}
                    <Box sx={{ animation: 'fadeInUp 1s ease-out forwards' }}>
                        <Typography variant="h2"
                            sx={{
                                fontWeight: 900,
                                mb: 2,
                                color: '#ffffff',
                                fontSize: { xs: '1.8rem', sm: '2.5rem', md: '3.2rem' }, // 반응형 사이즈 세분화
                                letterSpacing: '-1.5px',
                                lineHeight: 1.2,
                                textShadow: '0 4px 20px rgba(0,0,0,0.5)',
                            }}>
                            소유의 시대는 끝났다,<br />
                            <Box component="span" sx={{
                                color: '#64b5f6', // 브랜드 컬러 (Light Blue)로 강조
                                position: 'relative',
                                display: 'inline-block',
                            }}>
                                빌려쓰는
                            </Box> 즐거움
                        </Typography>
                    </Box>

                    {/* 2. 서브 카피: 시간차 애니메이션 */}
                    <Typography variant="h5" sx={{
                        opacity: 0, // 초기엔 안 보임
                        animation: 'fadeInUp 1s ease-out 0.4s forwards', // 0.4초 뒤에 등장
                        fontWeight: 300,
                        mt: 3,
                        letterSpacing: '0.5px',
                        fontSize: { xs: '0.9rem', md: '1.3rem' },
                        color: '#e3f2fd' // 완전 흰색보다는 살짝 푸른끼 도는 흰색이 고급스러움
                    }}>
                        필요한 순간, 합리적인 가격으로 <strong style={{ fontWeight: 700, color: '#fff' }}>Re:Borrow</strong> 하세요.
                    </Typography>

                </Container>

                {/* 3. 장식 요소 (선택사항): 하단에 살짝 흐르는 웨이브 느낌이나 그라데이션 바 */}
                <Box sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '100%',
                    height: '80px',
                    background: 'linear-gradient(to top, #ffffff 0%, transparent 100%)', // 자연스럽게 흰색 배경(본문)과 연결
                    zIndex: 2,
                    opacity: 0.8
                }} />
            </Box>
        </>
    );
}