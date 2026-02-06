import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container, Typography, Box, Grid, Paper, Avatar, CircularProgress, Button,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, Stack,
    Chip, Tabs, Tab, Fade, List, ListItem, ListItemAvatar, ListItemText, Divider
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

// =================================================================
// [ADD] 4. 채팅 목록 컴포넌트 (2월 5일 명세서 3-1, 3-2 기반)
// =================================================================
function ChatList() {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchChatRooms = async () => {
            try {
                if (IS_MOCK_MODE) {
                    setRooms([{ roomId: 15, lastMessage: "안녕하세요 대여 가능한가요?", sendDate: "2026-02-05 14:30:00" }]);
                    setLoading(false);
                    return;
                }
                const token = localStorage.getItem('accessToken');
                // 명세서 기반 채팅방 목록 조회 (구현 시 추가 필요했던 API)
                const res = await fetch(`${API_BASE_URL}/api/chat/rooms`, {
                    headers: { ...TUNNEL_HEADERS, 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const result = await res.json();
                    setRooms(result.data || []);
                }
            } catch (e) { console.error("채팅 목록 로드 실패", e); }
            finally { setLoading(false); }
        };
        fetchChatRooms();
    }, []);

    if (loading) return <CircularProgress size={24} sx={{ m: 2 }} />;
    if (rooms.length === 0) return <Typography sx={{ p: 3 }}>참여 중인 채팅방이 없습니다.</Typography>;

    return (
        <List sx={{ bgcolor: 'background.paper', borderRadius: 2 }}>
            {rooms.map((room) => (
                <React.Fragment key={room.roomId}>
                    <ListItem button onClick={() => navigate(`/chat/${room.roomId}`)}>
                        <ListItemAvatar><Avatar><ChatIcon /></Avatar></ListItemAvatar>
                        <ListItemText 
                            primary={`채팅방 #${room.roomId}`} 
                            secondary={room.lastMessage || "대화 내용이 없습니다."} 
                        />
                        <Typography variant="caption" color="text.secondary">
                            {room.sendDate} {/* 명세서 3-2: 포맷팅된 문자열 적용 */}
                        </Typography>
                    </ListItem>
                    <Divider variant="inset" component="li" />
                </React.Fragment>
            ))}
        </List>
    );
}

export default function MyPage() {
    const navigate = useNavigate();

    // =================================================================
    // 1. 상태 관리 (State Management)
    // =================================================================
    const [loading, setLoading] = useState(true);
    const [tabValue, setTabValue] = useState(0); // 0: 내물건, 1: 받은요청, 2: 보낸요청, 3: 채팅목록(추가)

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
    // 2. 데이터 로드 (Data Fetching) - 병렬 처리 로직 유지
    // =================================================================
    useEffect(() => {
        const fetchMyPageData = async () => {
            try {
                if (IS_MOCK_MODE) {
                    console.log("🛠️ MyPage: Mock 모드 실행");
                    setMyItems(mockItems.filter(item => item.owner.email === myEmail));
                    setUserInfo({ ...mockUser });
                    setLoading(false);
                    return;
                }

                const token = localStorage.getItem('accessToken');
                const commonHeaders = {
                    ...TUNNEL_HEADERS,
                    ...(token && { 'Authorization': `Bearer ${token}` })
                };

                const [itemsRes, userRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/api/items`, { headers: commonHeaders }),
                    fetch(`${API_BASE_URL}/api/members/me`, { headers: commonHeaders })
                ]);

                if (itemsRes.ok) {
                    const result = await itemsRes.json();
                    const allItems = result.data || result;
                    setMyItems(allItems.filter(item => item.owner?.email === myEmail));
                }

                if (userRes.ok) {
                    const userData = await userRes.json();
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
    // 3. 핸들러 (Event Handlers) - 기존 로직 유지
    // =================================================================
    const handleTabChange = (_, newValue) => setTabValue(newValue);

    const handleProfileChange = (e) => setUserInfo(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handlePassChange = (e) => setPasswords(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmitProfile = async () => {
        if (IS_MOCK_MODE) {
            alert("🎉 [Mock] 수정 완료");
            setOpenProfileModal(false);
            return;
        }
        try {
            const token = localStorage.getItem('accessToken');
            const updateData = { name: userInfo.name, phone: userInfo.phone, address: userInfo.address };
            const response = await fetch(`${API_BASE_URL}/api/members/me`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...TUNNEL_HEADERS,
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updateData)
            });

            if (response.ok) {
                alert("프로필 정보가 성공적으로 수정되었습니다.");
                setOpenProfileModal(false);
            } else {
                const errorData = await response.json();
                alert(errorData.message || "프로필 수정 실패");
            }
        } catch (error) {
            alert("서버와 통신 중 오류가 발생했습니다.");
        }
    };

    const handleSubmitPassword = async () => {
        const { currentPassword, newPassword, confirmPassword } = passwords;
        if (!currentPassword || !newPassword) { alert("비밀번호를 모두 입력해주세요."); return; }
        if (newPassword.length < 8) { alert("새 비밀번호는 최소 8자 이상이어야 합니다."); return; }
        if (newPassword !== confirmPassword) { alert("새 비밀번호가 일치하지 않습니다."); return; }

        if (IS_MOCK_MODE) {
            alert("🎉 [Mock] 비밀번호 변경 완료. 다시 로그인하세요.");
            localStorage.clear();
            navigate('/login');
            return;
        }

        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${API_BASE_URL}/api/members/password`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ currentPassword, newPassword })
            });

            if (response.ok) {
                alert("비밀번호가 안전하게 변경되었습니다. 다시 로그인해주세요.");
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('userEmail');
                setOpenPwModal(false);
                navigate('/login');
            } else {
                const errorData = await response.json();
                alert(errorData.message || "비밀번호 변경 실패");
            }
        } catch (error) {
            alert("서버 통신 중 오류가 발생했습니다.");
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

    return (
        <Container maxWidth="lg" sx={{ py: 5 }}>
            {/* 섹션 1: 프로필 카드 (기존 스타일 및 Grid v2 문법 유지) */}
            <Paper elevation={6} sx={{ p: 4, mb: 4, borderRadius: 4, background: 'linear-gradient(135deg, #1976d2 30%, #42a5f5 90%)', color: 'white' }}>
                <Grid container alignItems="center" spacing={3}>
                    <Grid>
                        <Avatar sx={{ width: 100, height: 100, bgcolor: 'white', color: '#1976d2' }}>
                            <PersonIcon sx={{ fontSize: 60 }} />
                        </Avatar>
                    </Grid>
                    <Grid size="grow">
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <Typography variant="h4" fontWeight="bold">{userInfo.name || myEmail.split('@')[0]}</Typography>
                            <Chip icon={<VerifiedUserIcon sx={{ fill: 'white !important' }} />} label="인증 회원" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
                        </Stack>
                        <Typography variant="body1" sx={{ opacity: 0.9 }}>{myEmail}</Typography>
                        <Stack direction="row" spacing={3} sx={{ mt: 2, opacity: 0.8 }}>
                            <Typography variant="caption">📞 {userInfo.phone || "전화번호 미등록"}</Typography>
                            <Typography variant="caption">🏠 {userInfo.address || "주소 미등록"}</Typography>
                        </Stack>
                    </Grid>
                    <Grid>
                        <Stack spacing={1}>
                            <Button variant="contained" startIcon={<EditIcon />} onClick={() => setOpenProfileModal(true)} sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>내 정보 수정</Button>
                            <Button variant="contained" startIcon={<LockResetIcon />} onClick={() => setOpenPwModal(true)} sx={{ bgcolor: 'rgba(0,0,0,0.2)' }}>비밀번호 변경</Button>
                        </Stack>
                    </Grid>
                </Grid>
            </Paper>

            {/* 섹션 2: 탭 메뉴 (기존 로직 유지 + 채팅 목록 탭 추가) */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={tabValue} onChange={handleTabChange} textColor="primary" indicatorColor="primary">
                    <Tab icon={<InventoryIcon />} iconPosition="start" label="내 물건 관리" />
                    <Tab icon={<InboxIcon />} iconPosition="start" label="📥 받은 요청 (Owner)" />
                    <Tab icon={<OutboxIcon />} iconPosition="start" label="📤 내 대여 내역 (Renter)" />
                    <Tab icon={<ChatIcon />} iconPosition="start" label="💬 채팅 목록" /> {/* [ADD] 명세서 3. 채팅 대응 */}
                </Tabs>
            </Box>

            {/* 탭 패널 구현 */}
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
                                    <Grid key={item.itemId || item.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                                        <ItemCard item={item} />
                                    </Grid>
                                ))}
                            </Grid>
                        )}
                    </Box>
                </Fade>
            )}

            {tabValue === 1 && <Fade in={true}><Box><ReceivedRequests /></Box></Fade>}
            {tabValue === 2 && <Fade in={true}><Box><SentRequests /></Box></Fade>}
            {tabValue === 3 && <Fade in={true}><Box sx={{ mt: 3 }}><ChatList /></Box></Fade>} {/* [ADD] 명세서 3. 채팅 패널 */}

            {/* 모달 (Dialogs) - 기존 로직 유지 */}
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

            <Dialog open={openPwModal} onClose={() => setOpenPwModal(false)}>
                <DialogTitle>비밀번호 변경</DialogTitle>
                <DialogContent>
                    <TextField margin="dense" type="password" label="현재 비밀번호" name="currentPassword" fullWidth value={passwords.currentPassword} onChange={handlePassChange} />
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