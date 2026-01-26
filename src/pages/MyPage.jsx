import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import {
    Container, Typography, Box, Grid, Paper, Avatar, Divider, CircularProgress, Button,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, Stack,
    Chip, Tabs, Tab, Fade // 👈 UI 꾸미기용 컴포넌트 추가
} from '@mui/material';

// 아이콘 불러오기
import PersonIcon from '@mui/icons-material/Person';
import InventoryIcon from '@mui/icons-material/Inventory';
import LockResetIcon from '@mui/icons-material/LockReset';
import EditIcon from '@mui/icons-material/Edit';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser'; // 인증 뱃지
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied'; // 빈 화면 아이콘

// 설정 및 데이터
import { IS_MOCK_MODE, API_BASE_URL } from '../config';
import { mockItems, mockUser } from '../mocks/mockData'; //  import
import ItemCard from '../components/ItemCard';

export default function MyPage() {
    const navigate = useNavigate();

    // ===================== 1. 상태 관리 =====================
    const [myItems, setMyItems] = useState([]);
    const [loading, setLoading] = useState(true);

    // 🎨 [NEW] 탭 상태 관리 (0: 내 물건, 1: 대여 내역)
    const [tabValue, setTabValue] = useState(0);

    const [openPwModal, setOpenPwModal] = useState(false);
    const [passwords, setPasswords] = useState({
        currentPassword: '', newPassword: '', confirmPassword: ''
    });

    const [openProfileModal, setOpenProfileModal] = useState(false);
    const [userInfo, setUserInfo] = useState({
        name: '', phone: '', address: ''
    });

    const myEmail = localStorage.getItem('userEmail') || '정보 없음';
    const [displayName, setDisplayName] = useState(myEmail.split('@')[0]);

    // ===================== 2. 데이터 로드 =====================
    useEffect(() => {
        const fetchData = async () => {
            try {
                if (IS_MOCK_MODE) {
                    console.log("🛠️ MyPage: Mock 모드로 동작 중");

                    // 1. 내 물건 필터링
                    const filtered = mockItems.filter(item => item.owner.email === myEmail);
                    setMyItems(filtered);

                    // 2. [수정됨] mockData.js에서 가져온 정보로 세팅!
                    setUserInfo({
                        name: mockUser.name,     // 👈 여기가 깔끔해짐!
                        phone: mockUser.phone,
                        address: mockUser.address
                    });

                    // 화면 표시 이름도 이걸로 초기화
                    if (mockUser.name) setDisplayName(mockUser.name);

                    setLoading(false);
                    return;

                }

                // Real Mode
                const itemRes = await fetch(`${API_BASE_URL}/api/items`, {
                    headers: { "ngrok-skip-browser-warning": "69420" },
                });
                if (itemRes.ok) {
                    const result = await itemRes.json();
                    const allItems = result.data || result;
                    const myList = allItems.filter(item => item.owner && item.owner.email === myEmail);
                    setMyItems(myList);
                }

                try {
                    const token = localStorage.getItem('accessToken');
                    const userRes = await fetch(`${API_BASE_URL}/api/members/me`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            "ngrok-skip-browser-warning": "69420"
                        }
                    });
                    if (userRes.ok) {
                        const userData = await userRes.json();
                        setUserInfo({
                            name: userData.data.name || '',
                            phone: userData.data.phone || '',
                            address: userData.data.address || ''
                        });
                        if (userData.data.name) setDisplayName(userData.data.name);
                    }
                } catch (e) {
                    console.warn("프로필 로드 실패:", e);
                }

            } catch (error) {
                console.error("MyPage Load Error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [myEmail]);

    // ===================== 3. 핸들러 =====================
    const handlePassChange = (e) => setPasswords({ ...passwords, [e.target.name]: e.target.value });
    const handleProfileChange = (e) => setUserInfo({ ...userInfo, [e.target.name]: e.target.value });
    const handleTabChange = (event, newValue) => setTabValue(newValue); // 탭 변경

    const handleSubmitPassword = async () => {
        if (passwords.newPassword !== passwords.confirmPassword) return alert("비밀번호 불일치");
        if (passwords.newPassword.length < 4) return alert("4자 이상 입력해주세요.");

        if (IS_MOCK_MODE) {
            alert("🎉 [Mock] 비밀번호 변경 완료");
            setOpenPwModal(false);
            setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
            return;
        }

        // ... Real Logic (생략 - 기존과 동일)
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${API_BASE_URL}/api/members/password`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    "ngrok-skip-browser-warning": "69420",
                },
                body: JSON.stringify({
                    currentPassword: passwords.currentPassword,
                    newPassword: passwords.newPassword
                })
            });

            if (response.ok) {
                alert("비밀번호 변경 성공! 다시 로그인해주세요.");
                // 🧹 [Security Clean-up] 민감 정보 파기
                localStorage.clear();
                window.location.href = '/login';
            } else {
                const errText = await response.text();
                alert(`변경 실패: ${errText}`);
            }
        } catch (error) {
            console.error(error);
            alert("서버 오류 발생");
        }
    };

    const handleSubmitProfile = async () => {
        if (!userInfo.name) return alert("이름은 필수입니다.");

        if (IS_MOCK_MODE) {
            alert("🎉 [Mock] 수정 완료");
            setDisplayName(userInfo.name);
            setOpenProfileModal(false);
            return;
        }

        // ... Real Logic (생략 - 기존과 동일)
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${API_BASE_URL}/api/members/profile`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    "ngrok-skip-browser-warning": "69420",
                },
                body: JSON.stringify({
                    name: userInfo.name,
                    phone: userInfo.phone,
                    address: userInfo.address
                })
            });

            if (response.ok) {
                alert("회원 정보가 성공적으로 수정되었습니다.");
                setDisplayName(userInfo.name);
                setOpenProfileModal(false);
            } else {
                const errText = await response.text();
                alert(`수정 실패: ${errText}`);
            }
        } catch (error) {
            console.error(error);
            alert("서버 오류 발생");
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

    return (
        <Container maxWidth="lg" sx={{ py: 5 }}>

            {/* ✨ 1. 프로필 섹션 (그라데이션 디자인 적용) */}
            <Paper
                elevation={6}
                sx={{
                    p: 4, mb: 4, borderRadius: 4,
                    background: 'linear-gradient(135deg, #1976d2 30%, #42a5f5 90%)', // 파란색 그라데이션
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                {/* 배경 장식용 원 (디자인 요소) */}
                <Box sx={{ position: 'absolute', top: -20, right: -20, width: 150, height: 150, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: '50%' }} />

                <Grid container alignItems="center" spacing={3} sx={{ position: 'relative', zIndex: 1 }}>
                    <Grid item>
                        <Avatar sx={{ width: 100, height: 100, bgcolor: 'white', color: '#1976d2', border: '4px solid rgba(255,255,255,0.3)' }}>
                            <PersonIcon sx={{ fontSize: 60 }} />
                        </Avatar>
                    </Grid>
                    <Grid item xs>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                            <Typography variant="h4" fontWeight="bold">{displayName}</Typography>
                            <Chip
                                icon={<VerifiedUserIcon sx={{ fill: 'white !important' }} />}
                                label="인증 회원"
                                size="small"
                                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.4)' }}
                            />
                        </Stack>
                        <Typography variant="body1" sx={{ opacity: 0.9 }}>{myEmail}</Typography>

                        <Stack direction="row" spacing={3} sx={{ mt: 2, opacity: 0.8 }}>
                            {/* 정보가 없으면 '미등록'이라고 표시 */}
                            <Typography variant="caption">📞 {userInfo.phone || "전화번호 미등록"}</Typography>
                            <Typography variant="caption">🏠 {userInfo.address || "주소 미등록"}</Typography>
                        </Stack>
                    </Grid>
                    <Grid item>
                        <Stack direction="column" spacing={1}>
                            <Button
                                variant="contained"
                                startIcon={<EditIcon />}
                                onClick={() => setOpenProfileModal(true)}
                                sx={{ bgcolor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }, boxShadow: 'none' }}
                            >
                                내 정보 수정
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={<LockResetIcon />}
                                onClick={() => setOpenPwModal(true)}
                                sx={{ bgcolor: 'rgba(0,0,0,0.2)', '&:hover': { bgcolor: 'rgba(0,0,0,0.3)' }, boxShadow: 'none' }}
                            >
                                비밀번호 변경
                            </Button>
                        </Stack>
                    </Grid>
                </Grid>
            </Paper>

            {/* ✨ 2. 탭 메뉴 (내 물건 / 대여 내역 등 확장성 고려) */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={tabValue} onChange={handleTabChange} textColor="primary" indicatorColor="primary">
                    <Tab icon={<InventoryIcon />} iconPosition="start" label={`내 물건 관리 (${myItems.length})`} />
                    <Tab label="대여 내역 (준비중)" disabled />
                    <Tab label="찜한 목록 (준비중)" disabled />
                </Tabs>
            </Box>

            {/* ✨ 3. 탭 내용 (페이드 효과) */}
            {tabValue === 0 && (
                <Fade in={true}>
                    <Box>
                        {myItems.length === 0 ? (
                            // 텅 비었을 때 예쁜 화면 (Empty State)
                            <Paper sx={{ py: 8, textAlign: 'center', borderRadius: 3, bgcolor: '#f8f9fa', border: '1px dashed #ccc' }}>
                                <SentimentDissatisfiedIcon sx={{ fontSize: 60, color: '#ccc', mb: 2 }} />
                                <Typography variant="h6" color="text.secondary" gutterBottom>
                                    아직 등록한 물건이 없네요.
                                </Typography>
                                <Typography variant="body2" color="text.disabled" sx={{ mb: 3 }}>
                                    안 쓰는 물건을 올려서 수익을 창출해보세요!
                                </Typography>
                                <Button variant="contained" onClick={() => navigate('/products/new')} size="large">
                                    + 첫 상품 등록하기
                                </Button>
                            </Paper>
                        ) : (
                            // 물건이 있을 때
                            <Grid container spacing={3}>
                                {myItems.map((item) => (
                                    <Grid item key={item.itemId || item.id} xs={12} sm={6} md={4} lg={3}>
                                        <ItemCard item={item} />
                                    </Grid>
                                ))}
                            </Grid>
                        )}
                    </Box>
                </Fade>
            )}

            {/* 모달들은 기존과 동일 (아래에 숨겨둠) */}
            <Dialog open={openPwModal} onClose={() => setOpenPwModal(false)}>
                <DialogTitle sx={{ fontWeight: 'bold' }}>🔒 비밀번호 변경</DialogTitle>
                <DialogContent sx={{ minWidth: '400px' }}>
                    <Box component="form" sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField label="현재 비밀번호" type="password" name="currentPassword" fullWidth value={passwords.currentPassword} onChange={handlePassChange} />
                        <TextField label="새 비밀번호" type="password" name="newPassword" fullWidth value={passwords.newPassword} onChange={handlePassChange} />
                        <TextField label="새 비밀번호 확인" type="password" name="confirmPassword" fullWidth value={passwords.confirmPassword} onChange={handlePassChange} error={passwords.newPassword !== passwords.confirmPassword && passwords.confirmPassword.length > 0} helperText={passwords.newPassword !== passwords.confirmPassword && passwords.confirmPassword.length > 0 ? "비밀번호 불일치" : ""} />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpenPwModal(false)} color="inherit">취소</Button>
                    <Button onClick={handleSubmitPassword} variant="contained" disabled={!passwords.currentPassword || !passwords.newPassword}>변경하기</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openProfileModal} onClose={() => setOpenProfileModal(false)}>
                <DialogTitle sx={{ fontWeight: 'bold' }}>📝 내 정보 수정</DialogTitle>
                <DialogContent sx={{ minWidth: '400px' }}>
                    <Box component="form" sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField label="이름 (닉네임)" name="name" fullWidth value={userInfo.name} onChange={handleProfileChange} />
                        <TextField label="전화번호" name="phone" placeholder="010-0000-0000" fullWidth value={userInfo.phone} onChange={handleProfileChange} />
                        <TextField label="주소" name="address" placeholder="거래 희망 지역" fullWidth multiline rows={2} value={userInfo.address} onChange={handleProfileChange} />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpenProfileModal(false)} color="inherit">취소</Button>
                    <Button onClick={handleSubmitProfile} variant="contained" color="primary">저장하기</Button>
                </DialogActions>
            </Dialog>

        </Container>
    );
}