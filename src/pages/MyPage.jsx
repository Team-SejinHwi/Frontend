import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container, Typography, Box, Grid, Paper, Avatar, CircularProgress, Button,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, Stack,
    Chip, Tabs, Tab, Fade
} from '@mui/material';

// 아이콘 Import
import PersonIcon from '@mui/icons-material/Person';
import InventoryIcon from '@mui/icons-material/Inventory';
import LockResetIcon from '@mui/icons-material/LockReset';
import EditIcon from '@mui/icons-material/Edit';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import InboxIcon from '@mui/icons-material/Inbox';
import OutboxIcon from '@mui/icons-material/Outbox';

import { IS_MOCK_MODE, API_BASE_URL } from '../config';
import { mockItems, mockUser } from '../mocks/mockData';
import ItemCard from '../components/ItemCard';
import ReceivedRequests from '../components/ReceivedRequests';
import SentRequests from '../components/SentRequests';

export default function MyPage() {
    const navigate = useNavigate();

    // =================================================================
    // 1. 상태 관리 (State Management)
    // =================================================================
    const [loading, setLoading] = useState(true);
    const [tabValue, setTabValue] = useState(0); // 0: 내물건, 1: 받은요청, 2: 보낸요청

    // 데이터 상태
    const [myItems, setMyItems] = useState([]);
    const [userInfo, setUserInfo] = useState({ name: '', phone: '', address: '' });

    // 모달(Dialog) 제어 상태
    const [openPwModal, setOpenPwModal] = useState(false);
    const [openProfileModal, setOpenProfileModal] = useState(false);
    const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

    // 로컬 스토리지 정보 (로그인 시 저장된 이메일)
    const myEmail = localStorage.getItem('userEmail') || '정보 없음';

    // =================================================================
    // 2. 데이터 로드 (Data Fetching) - 병렬 처리로 최적화
    // =================================================================
    useEffect(() => {
        const fetchMyPageData = async () => {
            try {
                // [A] Mock 모드일 경우: 가짜 데이터 즉시 세팅
                if (IS_MOCK_MODE) {
                    console.log("🛠️ MyPage: Mock 모드 실행");
                    setMyItems(mockItems.filter(item => item.owner.email === myEmail));
                    setUserInfo({ ...mockUser });
                    setLoading(false);
                    return;
                }

                // [B] Real 모드: Promise.all을 사용하여 두 API를 동시에 호출 (속도 향상)
                // 임시 주석 const token = localStorage.getItem('accessToken');
                const commonHeaders = {
                    "ngrok-skip-browser-warning": "69420", // Ngrok 경고 무시용 헤더
                    // 임시 주석임.  ...(token && { 'Authorization': `Bearer ${token}` }) 
                };

                const [itemsRes, userRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/api/items`, {
                         headers: commonHeaders,
                        credentials: 'include' // 👈 내 쿠키 가져가! (내 물건 조회용)  //나중에 삭제
                        }),
                    fetch(`${API_BASE_URL}/api/members/me`, {
                         headers: commonHeaders,
                         credentials: 'include' // 👈 내 쿠키 가져가! (내 프로필 조회용)  // 나중에 삭제
                         })
                ]);

                // 1. 내 물건 필터링
                if (itemsRes.ok) {
                    const result = await itemsRes.json();
                    const allItems = result.data || result;
                    // 내가 등록한 물건만 골라내기
                    setMyItems(allItems.filter(item => item.owner?.email === myEmail));
                }

                // 2. 내 프로필 정보
                if (userRes.ok) {
                    const userData = await userRes.json();

                    // 👇  포장지(data)가 있는지 확인하고 가져오기
                    const user = userData.data || userData;
                    setUserInfo({
                        name: user.name || '',
                        phone: user.phone || '',
                        address: user.address || ''
                    });
                }

            } catch (error) {
                console.error("❌ MyPage 데이터 로딩 실패:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMyPageData();
    }, [myEmail]);

    // =================================================================
    // 3. 핸들러 (Event Handlers)
    // =================================================================
    const handleTabChange = (_, newValue) => setTabValue(newValue);

    // 입력값 변경 (Computed Property Name 사용)
    const handleProfileChange = (e) => setUserInfo(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handlePassChange = (e) => setPasswords(prev => ({ ...prev, [e.target.name]: e.target.value }));

    // 프로필 수정 요청
    // 프로필 수정 요청
    const handleSubmitProfile = async () => {
        // [A] Mock 모드
        if (IS_MOCK_MODE) {
            alert("🎉 [Mock] 수정 완료");
            setOpenProfileModal(false);
            return;
        }

        // [B] Real 모드
        try {
            // 1. 보낼 데이터 준비 (이름, 전화번호, 주소)
            const updateData = {
                name: userInfo.name,
                phone: userInfo.phone,
                address: userInfo.address
            };

            // 🚨 중요: 주소(/api/members/me)와 메소드(PUT)는 백엔드 명세에 따라 다를 수 있습니다!
            // (보통 내 정보 수정은 PUT /api/members/me 를 많이 씁니다.)
            const response = await fetch(`${API_BASE_URL}/api/members/me`, {
                method: 'PUT', // 혹시 405 에러가 나면 'PATCH'로 바꿔보세요!
                
                credentials: 'include', // 👈 필수! 내 쿠키(세션)를 같이 보내야 함

                headers: {
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': '69420',
                },
                body: JSON.stringify(updateData)
            });

            if (response.ok) {
                alert("프로필 정보가 성공적으로 수정되었습니다.");
                setOpenProfileModal(false);
                // 필요하다면 여기서 새로고침을 한 번 해주셔도 좋습니다.
                // window.location.reload(); 
            } else {
                const errorData = await response.json();
                alert(errorData.message || "프로필 수정 실패");
            }
        } catch (error) {
            console.error("프로필 수정 오류:", error);
            alert("서버와 통신 중 오류가 발생했습니다.");
        }
    };

    // 비밀번호 변경 요청
    const handleSubmitPassword = async () => {
        const { currentPassword, newPassword, confirmPassword } = passwords;

        // 1. 간단한 유효성 검사
        if (!currentPassword || !newPassword) {
            alert("비밀번호를 모두 입력해주세요.");
            return;
        }

        // 새 비밀번호 길이 검사 (8자 이상만 확인)
        if (newPassword.length < 8) {
            alert("새 비밀번호는 최소 8자 이상이어야 합니다.");
            return;
        }

        if (newPassword !== confirmPassword) {
            alert("새 비밀번호가 일치하지 않습니다.");
            return;
        }

        if (IS_MOCK_MODE) {
            alert("🎉 [Mock] 비밀번호 변경 완료. 다시 로그인하세요.");
            localStorage.clear(); // 세션 클리어
            navigate('/login');
            return;
        }

        try {
            // 임시 주석   const token = localStorage.getItem('accessToken');
            const response = await fetch(`${API_BASE_URL}/api/members/password`, {
                method: 'PATCH',  //리소스의 일부만 수정하므로 PATCH 메소드 사용.
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${token}` // 나중에 주석
                },
                body: JSON.stringify({
                    currentPassword,
                    newPassword
                })
            });

            if (response.ok) {
                alert("비밀번호가 안전하게 변경되었습니다. 다시 로그인해주세요.");

                // ==========================================
                // [보안 강화] Session Cleanup (강제 로그아웃)
                // ==========================================
                localStorage.removeItem('accessToken');
                localStorage.removeItem('userEmail');
                // 필요 시 세션 스토리지나 쿠키도 정리

                setOpenPwModal(false);
                navigate('/login'); // 로그인 페이지로 리다이렉트
            } else {
                const errorData = await response.json();
                alert(errorData.message || "비밀번호 변경에 실패했습니다. 현재 비밀번호를 확인하세요.");
            }
        } catch (error) {
            console.error("비밀번호 변경 오류:", error);
            alert("서버 통신 중 오류가 발생했습니다.");
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

    return (
        <Container maxWidth="lg" sx={{ py: 5 }}>
            {/* --- 섹션 1: 사용자 프로필 카드 (MUI Grid v2 문법 적용 완료) --- */}
            <Paper elevation={6} sx={{ p: 4, mb: 4, borderRadius: 4, background: 'linear-gradient(135deg, #1976d2 30%, #42a5f5 90%)', color: 'white' }}>
                <Grid container alignItems="center" spacing={3}>

                    {/* [FIX] 'item' prop 제거 (v2에서는 불필요) */}
                    <Grid>
                        <Avatar sx={{ width: 100, height: 100, bgcolor: 'white', color: '#1976d2' }}>
                            <PersonIcon sx={{ fontSize: 60 }} />
                        </Avatar>
                    </Grid>

                    {/* [FIX] 'xs' 대신 'size="grow"' 사용 (남은 공간 모두 차지) */}
                    <Grid size="grow">
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <Typography variant="h4" fontWeight="bold">
                                {userInfo.name || myEmail.split('@')[0]}
                            </Typography>
                            <Chip icon={<VerifiedUserIcon sx={{ fill: 'white !important' }} />} label="인증 회원" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
                        </Stack>
                        <Typography variant="body1" sx={{ opacity: 0.9 }}>{myEmail}</Typography>
                        <Stack direction="row" spacing={3} sx={{ mt: 2, opacity: 0.8 }}>
                            <Typography variant="caption">📞 {userInfo.phone || "전화번호 미등록"}</Typography>
                            <Typography variant="caption">🏠 {userInfo.address || "주소 미등록"}</Typography>
                        </Stack>
                    </Grid>

                    {/* [FIX] 'item' prop 제거 */}
                    <Grid>
                        <Stack spacing={1}>
                            <Button variant="contained" startIcon={<EditIcon />} onClick={() => setOpenProfileModal(true)} sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>내 정보 수정</Button>
                            <Button variant="contained" startIcon={<LockResetIcon />} onClick={() => setOpenPwModal(true)} sx={{ bgcolor: 'rgba(0,0,0,0.2)' }}>비밀번호 변경</Button>
                        </Stack>
                    </Grid>
                </Grid>
            </Paper>

            {/* --- 섹션 2: 탭 메뉴 --- */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={tabValue} onChange={handleTabChange} textColor="primary" indicatorColor="primary">
                    <Tab icon={<InventoryIcon />} iconPosition="start" label="내 물건 관리" />
                    <Tab icon={<InboxIcon />} iconPosition="start" label="📥 받은 요청 (Owner)" />
                    <Tab icon={<OutboxIcon />} iconPosition="start" label="📤 내 대여 내역 (Renter)" />
                </Tabs>
            </Box>

            {/* 탭 패널 1: 내 물건 관리 */}
            {tabValue === 0 && (
                <Fade in={true}>
                    <Box>
                        {myItems.length === 0 ? (
                            <Paper sx={{ py: 8, textAlign: 'center', bgcolor: '#f8f9fa' }}>
                                <SentimentDissatisfiedIcon sx={{ fontSize: 60, color: '#ccc', mb: 2 }} />
                                <Typography variant="h6" color="text.secondary">등록한 물건이 없습니다.</Typography>
                                <Button sx={{ mt: 2 }} variant="contained" onClick={() => navigate('/products/new')}>+ 첫 상품 등록</Button>
                            </Paper>
                        ) : (
                            <Grid container spacing={3}>
                                {myItems.map((item) => (
                                    // [FIX] 'xs={12} sm={6}...' 대신 'size={{ xs: 12, sm: 6... }}' 사용
                                    // 이렇게 해야 최신 MUI에서 반응형 그리드가 정상 작동하며 경고가 사라짐
                                    <Grid key={item.itemId || item.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                                        <ItemCard item={item} />
                                    </Grid>
                                ))}
                            </Grid>
                        )}
                    </Box>
                </Fade>
            )}

            {/* 탭 패널 2: 받은 요청 */}
            {tabValue === 1 && <Fade in={true}><Box><ReceivedRequests /></Box></Fade>}

            {/* 탭 패널 3: 보낸 요청 */}
            {tabValue === 2 && <Fade in={true}><Box><SentRequests /></Box></Fade>}

            {/* --- 모달 (Dialogs) --- */}
            {/* 프로필 수정 모달 */}
            <Dialog open={openProfileModal} onClose={() => setOpenProfileModal(false)}>
                <DialogTitle>내 정보 수정</DialogTitle>
                <DialogContent>
                    <TextField margin="dense" label="이름" name="name" fullWidth value={userInfo.name} onChange={handleProfileChange} />
                    <TextField margin="dense" label="전화번호" name="phone" fullWidth value={userInfo.phone} onChange={handleProfileChange} />
                    <TextField margin="dense" label="주소" name="address" fullWidth value={userInfo.address} onChange={handleProfileChange} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenProfileModal(false)}>취소</Button>
                    <Button onClick={handleSubmitProfile} variant="contained">저장</Button>
                </DialogActions>
            </Dialog>

            {/* 비밀번호 변경 모달 */}
            <Dialog open={openPwModal} onClose={() => setOpenPwModal(false)}>
                <DialogTitle>비밀번호 변경</DialogTitle>
                <DialogContent>
                    {/* 현재 비밀번호 필드  */}
                    <TextField
                        margin="dense"
                        type="password"
                        label="현재 비밀번호"
                        name="currentPassword"
                        fullWidth
                        value={passwords.currentPassword}
                        onChange={handlePassChange}
                    />
                    <TextField margin="dense" type="password" label="새 비밀번호" name="newPassword" fullWidth value={passwords.newPassword} onChange={handlePassChange} />
                    <TextField margin="dense" type="password" label="새 비밀번호 확인" name="confirmPassword" fullWidth value={passwords.confirmPassword} onChange={handlePassChange} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenPwModal(false)}>취소</Button>
                    <Button onClick={handleSubmitPassword} variant="contained">변경</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}