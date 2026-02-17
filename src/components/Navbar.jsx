// src/components/Navbar.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Stack } from '@mui/material';

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
                <Typography
                    variant="h6"
                    sx={{ fontWeight: 'bold', cursor: 'pointer', color: '#333' }}
                    onClick={() => navigate('/')}
                >
                    Re:Borrow
                </Typography>

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