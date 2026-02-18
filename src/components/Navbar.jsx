// src/components/Navbar.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Stack } from '@mui/material';
import AllInclusiveIcon from '@mui/icons-material/AllInclusive';

export default function Navbar({ isLoggedIn, setIsLoggedIn }) {
    const navigate = useNavigate();

    // 사용자 이름 가져오기 (로컬 스토리지 기반)
    const myEmail = localStorage.getItem('userEmail') || '';
    const myName = localStorage.getItem('userName') || myEmail.split('@')[0] || '사용자';

    const handleLogout = () => {
        setIsLoggedIn(false);
        localStorage.clear();
        alert("로그아웃 되었습니다.");
        navigate('/');
    };

    return (
        <AppBar
            position="sticky"
            elevation={0}
            sx={{
                top: 0,
                zIndex: 100,
                bgcolor: 'rgba(255, 255, 255, 0.7)', // 글래스모피즘 배경
                backdropFilter: 'blur(12px)',        // 블러 효과
                borderBottom: '1px solid rgba(0,0,0,0.05)'
            }}
        >
            <Toolbar sx={{ justifyContent: 'space-between' }}>
                <Stack
                    direction="row"
                    alignItems="center"
                    spacing={0.5}
                    onClick={() => navigate('/')}
                    sx={{ cursor: 'pointer' }}
                >
                    {/* 1. 심볼 아이콘 (그라데이션 적용) */}
                    <AllInclusiveIcon
                        sx={{
                            fontSize: 32,
                            background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            // 아이콘 자체 색상이 필요하면 아래처럼
                            // color: '#1976d2' 
                        }}
                    />

                    {/* 2. 텍스트 로고 (폰트 굵기 대비 & 그라데이션) */}
                    <Typography
                        variant="h5"
                        noWrap
                        component="div"
                        sx={{
                            fontWeight: 900, // 아주 굵게
                            letterSpacing: '-0.5px', // 자간을 좁혀서 단단한 느낌
                            background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)', // 브랜드 블루 그라데이션
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        Re:
                        <Typography
                            component="span"
                            variant="h5"
                            sx={{
                                fontWeight: 300, // Borrow는 얇게 처리하여 세련미 강조
                                color: '#333' // 뒷부분은 검은색(또는 그레이)으로 차분하게
                                // 만약 전체 그라데이션을 원하면 이 span을 제거하고 Re:Borrow를 통으로 쓰세요.
                            }}
                        >
                            Borrow
                        </Typography>
                    </Typography>
                </Stack>

                {isLoggedIn ? (
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Typography
                            variant="body2"
                            onClick={() => navigate('/mypage')}
                            sx={{ fontWeight: 'bold', color: 'primary.main', cursor: 'pointer', textDecoration: 'underline' }}
                        >
                            {myName}님
                        </Typography>
                        <Button
                            variant="outlined"
                            color="primary"
                            onClick={handleLogout}
                            sx={{ fontWeight: 'bold' }}
                        >
                            로그아웃
                        </Button>
                    </Stack>
                ) : (
                    <Button
                        variant="contained"
                        onClick={() => navigate('/login')}
                        sx={{ bgcolor: '#333', color: 'white', fontWeight: 'bold' }}
                    >
                        로그인/회원가입
                    </Button>
                )}
            </Toolbar>
        </AppBar>
    );
}