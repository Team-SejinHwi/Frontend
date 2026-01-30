// src/components/ChatList.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { List, ListItem, ListItemText, Typography, Paper, CircularProgress, Divider } from '@mui/material';
import { API_BASE_URL, IS_MOCK_MODE } from '../config';

export default function ChatList() {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                if (IS_MOCK_MODE) {
                    // 테스트용 가짜 목록
                    setRooms([{ roomId: 15, itemTitle: "맥북 프로 대여", lastMessage: "안녕하세요!" }]);
                    setLoading(false);
                    return;
                }

                const token = localStorage.getItem('accessToken');
                const response = await fetch(`${API_BASE_URL}/api/chat/rooms`, {
                    headers: { 'Authorization': `Bearer ${token}` }
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

    if (loading) return <CircularProgress />;

    return (
        <Paper elevation={0} sx={{ borderRadius: 2 }}>
            <List>
                {rooms.length === 0 ? (
                    <Typography sx={{ p: 2, textAlign: 'center' }}>진행 중인 채팅이 없습니다.</Typography>
                ) : (
                    rooms.map((room) => (
                        <React.Fragment key={room.roomId}>
                            <ListItem button onClick={() => navigate(`/chat/${room.roomId}`)}>
                                <ListItemText 
                                    primary={room.itemTitle} 
                                    secondary={room.lastMessage || "메시지가 없습니다."} 
                                />
                            </ListItem>
                            <Divider />
                        </React.Fragment>
                    ))
                )}
            </List>
        </Paper>
    );
}