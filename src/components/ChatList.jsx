import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  List, ListItem, ListItemText, ListItemAvatar, Avatar, 
  Typography, Paper, CircularProgress, Divider, Box, Badge 
} from '@mui/material';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import PersonIcon from '@mui/icons-material/Person';
import dayjs from 'dayjs';
import { API_BASE_URL, IS_MOCK_MODE } from '../config';

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
                            itemTitle: "맥북 프로 대여", 
                            partnerName: "테스트유저",
                            lastMessage: "안녕하세요! 거래 가능하신가요?", 
                            lastMessageTime: "2026-02-01T14:00:00" 
                        },
                        { 
                            roomId: 16, 
                            itemTitle: "캠핑 텐트", 
                            partnerName: "캠핑족",
                            lastMessage: "네 확인했습니다.", 
                            lastMessageTime: "2026-01-31T10:30:00" 
                        }
                    ]);
                    setLoading(false);
                    return;
                }

                // [B] Real 모드
                const token = localStorage.getItem('accessToken');
                if (!token) return;

                const response = await fetch(`${API_BASE_URL}/api/chat/rooms`, {
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'ngrok-skip-browser-warning': '69420'
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

    return (
        <Paper elevation={0} sx={{ borderRadius: 2 }}>
            <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                {rooms.length === 0 ? (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                        <ChatBubbleIcon sx={{ fontSize: 50, color: '#ccc', mb: 1 }} />
                        <Typography color="text.secondary">진행 중인 채팅이 없습니다.</Typography>
                    </Box>
                ) : (
                    rooms.map((room) => (
                        <React.Fragment key={room.roomId}>
                            <ListItem button alignItems="flex-start" onClick={() => navigate(`/chat/${room.roomId}`)}>
                                <ListItemAvatar>
                                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                                        <PersonIcon />
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={
                                        <Typography variant="subtitle1" fontWeight="bold">
                                            {room.itemTitle || "상품명 없음"}
                                        </Typography>
                                    }
                                    secondary={
                                        <React.Fragment>
                                            <Typography variant="body2" component="span" color="text.primary" sx={{ mr: 1 }}>
                                                {room.partnerName || "상대방"}
                                            </Typography>
                                            {room.lastMessage ? (
                                                room.lastMessage.length > 20 
                                                    ? room.lastMessage.substring(0, 20) + "..." 
                                                    : room.lastMessage
                                            ) : "대화를 시작해보세요."}
                                        </React.Fragment>
                                    }
                                />
                                {/* 시간 표시 */}
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', minWidth: '60px' }}>
                                    <Typography variant="caption" color="text.secondary">
                                        {room.lastMessageTime ? dayjs(room.lastMessageTime).format('MM.DD HH:mm') : ''}
                                    </Typography>
                                </Box>
                            </ListItem>
                            <Divider component="li" />
                        </React.Fragment>
                    ))
                )}
            </List>
        </Paper>
    );
}