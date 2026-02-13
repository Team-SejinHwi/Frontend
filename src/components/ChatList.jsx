import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    List, ListItem, ListItemText, ListItemAvatar, Avatar,
    Typography, Paper, CircularProgress, Divider, Box, ListItemButton
} from '@mui/material';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import PersonIcon from '@mui/icons-material/Person';
import dayjs from 'dayjs';
import { API_BASE_URL, IS_MOCK_MODE, TUNNEL_HEADERS } from '../config';

export default function ChatList() {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                // [A] Mock 모드
                if (IS_MOCK_MODE) {
                    setRooms([
                        {
                            roomId: 15,
                            itemTitle: "맥북 프로 M3 빌려드립니다", // mockData.js의 itemId: 10 제목과 일치시킴
                            partnerName: "개발자지망생", // mockReceivedRentals와 비슷하게
                            lastMessage: "안녕하세요! 거래 가능하신가요?",
                            sendDate: "2026-02-12 14:30:00"
                        },
                        {
                            roomId: 16,
                            itemTitle: "캠핑용 텐트 (4인용)", // mockData.js의 itemId: 9 제목과 일치시킴
                            partnerName: "캠핑족",
                            lastMessage: "네 확인했습니다.",
                            sendDate: "2026-02-11 10:30:00"
                        }
                    ]);
                    setLoading(false);
                    return;
                }

                // [B] Real 모드
                const token = localStorage.getItem('accessToken');
                if (!token) {
                    setLoading(false);
                    return;
                }

                // 명세서 3. 요약표에 있는 GET /api / chat / rooms 호출
                const response = await fetch(`${API_BASE_URL}/api/chat/rooms`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        ...TUNNEL_HEADERS
                    }
                });

                if (response.ok) {
                    const result = await response.json();
                    setRooms(result.data || []);
                }
            } catch (error) {
                console.error("채팅 목록 로드 실패:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchRooms();
    }, []);

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>;

    if (rooms.length === 0) {
        return (
            <Box sx={{ p: 4, textAlign: 'center' }}>
                <ChatBubbleIcon sx={{ fontSize: 50, color: '#ccc', mb: 1 }} />
                <Typography color="text.secondary">진행 중인 채팅이 없습니다.</Typography>
            </Box>
        );
    }

    return (
        <Paper elevation={0} sx={{ borderRadius: 2 }}>
            <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                {rooms.map((room) => (
                    <React.Fragment key={room.roomId}>
                        <ListItem disablePadding>
                            <ListItemButton onClick={() => navigate(`/chat/${room.roomId}`)} alignItems="flex-start">
                                <ListItemAvatar>
                                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                                        <PersonIcon />
                                    </Avatar>
                                </ListItemAvatar>

                                <ListItemText
                                    primary={
                                        <Typography variant="subtitle1" fontWeight="bold">
                                            {/* 상품명이 없으면 방 번호라도 보여줌 */}
                                            {room.itemTitle || `채팅방 #${room.roomId}`}
                                        </Typography>
                                    }
                                    secondary={
                                        <React.Fragment>
                                            <Typography variant="body2" component="span" color="text.primary" sx={{ mr: 1, fontWeight: 'bold' }}>
                                                {room.partnerName || "알 수 없음"}
                                            </Typography>
                                            {" — "}
                                            {room.lastMessage
                                                ? (room.lastMessage.length > 25 ? room.lastMessage.substring(0, 25) + "..." : room.lastMessage)
                                                : "대화 내용 없음"}
                                        </React.Fragment>
                                    }
                                />

                                {/* 시간 표시 (오른쪽 끝) */}
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', ml: 2, minWidth: '65px' }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                                        {/* API 명세서의 sendDate를 우선 사용하고, 없으면 dayjs로 현재 시간 처리 방지 */}
                                        {room.sendDate
                                            ? dayjs(room.sendDate).format('MM.DD HH:mm')
                                            : ''}
                                    </Typography>
                                </Box>
                            </ListItemButton>
                        </ListItem>
                        <Divider component="li" />
                    </React.Fragment>
                ))}
            </List>
        </Paper>
    );
}