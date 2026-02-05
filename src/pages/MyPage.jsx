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
import ChatIcon from '@mui/icons-material/Chat';

import { API_BASE_URL, IS_MOCK_MODE, TUNNEL_HEADERS } from '../config';
import { mockItems, mockUser } from '../mocks/mockData';
import ItemCard from '../components/ItemCard';
import ReceivedRequests from '../components/ReceivedRequests';
import SentRequests from '../components/SentRequests';
import ChatList from '../components/ChatList';

export default function MyPage() {
    const navigate = useNavigate();

    // =================================================================
    // 1. 상태 관리 (State Management)
    // =================================================================
    const [user, setUser] = useState(null);
    const [myItems, setMyItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tabValue, setTabValue] = useState(0); // 탭 상태 (0: 대여현황, 1: 받은요청, 2: 채팅목록, 3: 내등록물품)

    // 모달 상태 (회원정보 수정, 비밀번호 변경)
    const [openProfileModal, setOpenProfileModal] = useState(false);
    const [openPwModal, setOpenPwModal] = useState(false);

    // 수정용 폼 상태
    const [editForm, setEditForm] = useState({
        name: '',
        phone: '',
        address: ''
    });

    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // =================================================================
    // 2. 데이터 조회 (Data Fetching)
    // =================================================================
    useEffect(() => {
        const fetchMyData = async () => {
            try {
                // [A] Mock 모드 처리
                if (IS_MOCK_MODE) {
                    setUser(mockUser);
                    // 내 이메일과 일치하는 아이템만 필터링
                    setMyItems(mockItems.filter(i => i.owner.email === mockUser.email));
                    setEditForm({
                        name: mockUser.name || '',
                        phone: mockUser.phone || '',
                        address: mockUser.address || ''
                    });
                    setLoading(false);
                    return;
                }

                // [B] Real 모드 처리
                const token = localStorage.getItem('accessToken');
                if (!token) {
                    navigate('/login');
                    return;
                }

                // 내 정보와 내 등록 물품을 병렬로 가져옴
                const [userRes, itemsRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/api/members/me`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            ...TUNNEL_HEADERS
                        }
                    }),
                    fetch(`${API_BASE_URL}/api/items/my`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            ...TUNNEL_HEADERS
                        }
                    })
                ]);

                if (userRes.ok && itemsRes.ok) {
                    const userData = await userRes.json();
                    const itemsData = await itemsRes.json();

                    const finalUser = userData.data || userData;
                    setUser(finalUser);
                    setMyItems(itemsData.data || itemsData);

                    // 수정 폼 초기값 세팅
                    setEditForm({
                        name: finalUser.name || '',
                        phone: finalUser.phone || '',
                        address: finalUser.address || ''
                    });
                }
            } catch (error) {
                console.error("마이페이지 데이터 로드 실패:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMyData();
    }, [navigate]);

    // =================================================================
    // 3. 핸들러 (Event Handlers)
    // =================================================================
    
    // 탭 변경
    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    // 프로필 수정 입력 핸들러
    const handleEditChange = (e) => {
        setEditForm({ ...editForm, [e.target.name]: e.target.value });
    };

    // 비밀번호 입력 핸들러
    const handlePassChange = (e) => {
        setPasswords({ ...passwords, [e.target.name]: e.target.value });
    };

    // 회원 정보 수정 제출
    const handleSubmitProfile = async () => {
        if (IS_MOCK_MODE) {
            setUser({ ...user, ...editForm });
            setOpenProfileModal(false);
            alert("정보가 수정되었습니다. (Mock)");
            return;
        }
        
        // TODO: Real API 연동 (PATCH /api/members/me)
        alert("정보 수정 기능 준비 중입니다.");
        setOpenProfileModal(false);
    };

    // 비밀번호 변경 제출
    const handleSubmitPassword = async () => {
        if (passwords.newPassword !== passwords.confirmPassword) {
            alert("새 비밀번호 확인이 일치하지 않습니다.");
            return;
        }

        if (IS_MOCK_MODE) {
            alert("비밀번호가 변경되었습니다. (Mock)");
            setOpenPwModal(false);
            setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
            return;
        }

        // TODO: Real API 연동
        alert("비밀번호 변경 기능 준비 중입니다.");
        setOpenPwModal(false);
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

    // =================================================================
    // 4. 탭 콘텐츠 렌더링 함수
    // =================================================================
    const renderTabContent = () => {
        switch (tabValue) {
            case 0:
                return <SentRequests />; // 내가 신청한 대여 현황 (SentRequests.jsx)
            case 1:
                return <ReceivedRequests />; // 내 물건에 들어온 요청 관리 (ReceivedRequests.jsx)
            case 2:
                return <ChatList />; // 1:1 채팅 목록 (ChatList.jsx)
            case 3:
                return (
                    <Grid container spacing={2}>
                        {myItems.length === 0 ? (
                            <Grid item xs={12} sx={{ textAlign: 'center', py: 10 }}>
                                <SentimentDissatisfiedIcon sx={{ fontSize: 60, color: '#ccc', mb: 2 }} />
                                <Typography color="text.secondary">등록한 물품이 없습니다.</Typography>
                                <Button 
                                    variant="contained" 
                                    sx={{ mt: 2 }}
                                    onClick={() => navigate('/products/new')}
                                >
                                    첫 물품 등록하기
                                </Button>
                            </Grid>
                        ) : (
                            myItems.map((item) => (
                                <Grid item key={item.itemId} xs={12} sm={6} md={4}>
                                    <Box sx={{ position: 'relative' }}>
                                        <ItemCard item={item} />
                                        
                                        {/* 🏷️ [UPDATE] v.02.05 명세 반영: 내 등록 물품의 상태 표시 레이블 */}
                                        <Box sx={{ position: 'absolute', top: 10, right: 10, zIndex: 2 }}>
                                            {item.itemStatus === 'AVAILABLE' ? (
                                                <Chip label="대여 가능" color="success" size="small" sx={{ fontWeight: 'bold', boxShadow: 1 }} />
                                            ) : item.itemStatus === 'RENTED' ? (
                                                <Chip label="대여 중" color="primary" size="small" sx={{ fontWeight: 'bold', boxShadow: 1 }} /> // [NEW] 대여 중 상태
                                            ) : (
                                                <Chip label="거래 완료" color="default" size="small" sx={{ fontWeight: 'bold', boxShadow: 1, bgcolor: '#999', color: 'white' }} />
                                            )}
                                        </Box>
                                    </Box>
                                </Grid>
                            ))
                        )}
                    </Grid>
                );
            default:
                return null;
        }
    };

    return (
        <Container maxWidth="lg" sx={{ py: 5 }}>
            <Grid container spacing={4}>
                
                {/* ---------------------------------------------------------
                    좌측 영역: 사용자 프로필 정보 카드
                ---------------------------------------------------------- */}
                <Grid item xs={12} md={4}>
                    <Paper elevation={3} sx={{ p: 4, borderRadius: 4, textAlign: 'center', position: 'relative', border: '1px solid #eee' }}>
                        
                        {/* 사용자 아바타 및 기본 정보 */}
                        <Avatar 
                            sx={{ 
                                width: 100, height: 100, mx: 'auto', mb: 2, 
                                bgcolor: 'primary.main', fontSize: '2.5rem',
                                boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                            }}
                        >
                            {user?.name ? user.name[0] : <PersonIcon fontSize="large" />}
                        </Avatar>
                        
                        <Typography variant="h5" fontWeight="900" sx={{ mb: 0.5 }}>
                            {user?.name || '사용자'}님
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {user?.email}
                        </Typography>

                        <Stack direction="row" spacing={1} justifyContent="center" sx={{ mb: 3 }}>
                            <Chip 
                                icon={<VerifiedUserIcon style={{ fontSize: 16 }} />} 
                                label="본인인증 완료" 
                                color="info" 
                                variant="outlined" 
                                size="small" 
                            />
                        </Stack>

                        <Divider sx={{ my: 2 }} />

                        {/* 상세 정보 (연락처, 주소 등) */}
                        <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 3, textAlign: 'left', mb: 3 }}>
                            <Stack spacing={1.5}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" fontWeight="bold">연락처</Typography>
                                    <Typography variant="body2" fontWeight="500">{user?.phone || '번호를 등록해주세요'}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" fontWeight="bold">주 활동 지역</Typography>
                                    <Typography variant="body2" fontWeight="500">{user?.address || '주소를 등록해주세요'}</Typography>
                                </Box>
                            </Stack>
                        </Box>

                        {/* 프로필 관리 버튼군 */}
                        <Stack spacing={1.5}>
                            <Button 
                                variant="contained" 
                                color="primary" 
                                startIcon={<EditIcon />} 
                                onClick={() => setOpenProfileModal(true)}
                                fullWidth
                                sx={{ borderRadius: 2, fontWeight: 'bold' }}
                            >
                                프로필 수정
                            </Button>
                            <Button 
                                variant="outlined" 
                                color="inherit" 
                                startIcon={<LockResetIcon />} 
                                onClick={() => setOpenPwModal(true)}
                                fullWidth
                                sx={{ borderRadius: 2, fontWeight: 'bold' }}
                            >
                                비밀번호 변경
                            </Button>
                        </Stack>
                    </Paper>
                </Grid>

                {/* ---------------------------------------------------------
                    우측 영역: 거래 내역 및 탭 시스템
                ---------------------------------------------------------- */}
                <Grid item xs={12} md={8}>
                    <Paper elevation={0} sx={{ borderRadius: 4, bgcolor: 'transparent' }}>
                        
                        {/* 탭 헤더 영역 */}
                        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                            <Tabs 
                                value={tabValue} 
                                onChange={handleTabChange} 
                                variant="scrollable"
                                scrollButtons="auto"
                                sx={{
                                    '& .MuiTab-root': { fontWeight: 'bold', fontSize: '1rem', minHeight: 60 },
                                    '& .Mui-selected': { color: 'primary.main' }
                                }}
                            >
                                <Tab icon={<OutboxIcon />} label="대여 신청 현황" iconPosition="start" />
                                <Tab icon={<InboxIcon />} label="받은 요청함" iconPosition="start" />
                                <Tab icon={<ChatIcon />} label="채팅 목록" iconPosition="start" />
                                <Tab icon={<InventoryIcon />} label="내 등록 물품" iconPosition="start" />
                            </Tabs>
                        </Box>

                        {/* 탭 콘텐츠 영역 (애니메이션 적용) */}
                        <Box sx={{ minHeight: '500px' }}>
                            <Fade in={true} timeout={600}>
                                <Box>
                                    {renderTabContent()}
                                </Box>
                            </Fade>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            {/* =================================================================
                5. 모달 (Dialogs)
            ================================================================== */}

            {/* [모달 1] 프로필 수정 */}
            <Dialog 
                open={openProfileModal} 
                onClose={() => setOpenProfileModal(false)}
                fullWidth 
                maxWidth="xs"
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                <DialogTitle sx={{ fontWeight: 'bold', pt: 3 }}>👤 내 정보 수정</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <TextField 
                            label="이름" 
                            name="name"
                            fullWidth 
                            variant="outlined" 
                            value={editForm.name}
                            onChange={handleEditChange}
                        />
                        <TextField 
                            label="연락처" 
                            name="phone"
                            fullWidth 
                            variant="outlined" 
                            value={editForm.phone}
                            onChange={handleEditChange}
                            placeholder="010-0000-0000"
                        />
                        <TextField 
                            label="활동 지역" 
                            name="address"
                            fullWidth 
                            variant="outlined" 
                            value={editForm.address}
                            onChange={handleEditChange}
                            placeholder="예: 서울시 강남구"
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpenProfileModal(false)} color="inherit" sx={{ fontWeight: 'bold' }}>취소</Button>
                    <Button onClick={handleSubmitProfile} variant="contained" sx={{ fontWeight: 'bold', px: 3 }}>저장하기</Button>
                </DialogActions>
            </Dialog>

            {/* [모달 2] 비밀번호 변경 */}
            <Dialog 
                open={openPwModal} 
                onClose={() => setOpenPwModal(false)}
                fullWidth 
                maxWidth="xs"
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                <DialogTitle sx={{ fontWeight: 'bold', pt: 3 }}>🔒 비밀번호 변경</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <TextField 
                            type="password" 
                            label="현재 비밀번호" 
                            name="currentPassword"
                            fullWidth 
                            value={passwords.currentPassword}
                            onChange={handlePassChange}
                        />
                        <Divider sx={{ my: 1 }}>새 비밀번호 입력</Divider>
                        <TextField 
                            type="password" 
                            label="새 비밀번호" 
                            name="newPassword"
                            fullWidth 
                            value={passwords.newPassword}
                            onChange={handlePassChange}
                        />
                        <TextField 
                            type="password" 
                            label="새 비밀번호 확인" 
                            name="confirmPassword"
                            fullWidth 
                            value={passwords.confirmPassword}
                            onChange={handlePassChange}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpenPwModal(false)} color="inherit" sx={{ fontWeight: 'bold' }}>취소</Button>
                    <Button onClick={handleSubmitPassword} variant="contained" color="primary" sx={{ fontWeight: 'bold', px: 3 }}>변경 확정</Button>
                </DialogActions>
            </Dialog>

        </Container>
    );
}

// 구분선 컴포넌트 (내부에서 사용)
function Divider({ children, sx }) {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', my: 2, ...sx }}>
            <Box sx={{ flex: 1, height: '1px', bgcolor: '#eee' }} />
            {children && <Typography variant="caption" sx={{ px: 1, color: '#999' }}>{children}</Typography>}
            <Box sx={{ flex: 1, height: '1px', bgcolor: '#eee' }} />
        </Box>
    );
}