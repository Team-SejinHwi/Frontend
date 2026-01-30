import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Box, TextField, Button, Paper, Typography, List, ListItem } from '@mui/material';
import { IS_MOCK_MODE } from '../config';

const ChatRoom = () => {
  const { roomId } = useParams(); // URL에서 방 번호 가져오기
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const stompClient = useRef(null);

  // 로컬 스토리지에서 내 정보 가져오기
  const myToken = localStorage.getItem('accessToken');
  const myId = localStorage.getItem('userId'); // Login.jsx에서 저장한 ID

  useEffect(() => {
    // 🚩 [추가] Mock 모드라면 소켓 연결 로직을 아예 실행하지 않음
    if (IS_MOCK_MODE) {
      console.log("🛠️ [Mock Mode] 소켓 연결을 생략하고 로컬 모드로 동작합니다.");
      return;
    }

    if (!myToken) {
      alert("로그인이 필요합니다.");
      return;
    }

    // 1. 소켓 클라이언트 생성 (JWT 포함)
    const client = new Client({
      // Proxy가 설정된 경로 (/ws-stomp)
      webSocketFactory: () => new SockJS('/ws-stomp'),

      // ⭐️ [핵심] 연결 시 헤더에 토큰을 담아 보냅니다!
      connectHeaders: {
        Authorization: `Bearer ${myToken}`,
      },

      debug: (str) => {
        console.log('STOMP Debug:', str);
      },

      onConnect: () => {
        console.log(`✅ 채팅방 ${roomId} 연결 성공! (JWT 인증 완료)`);

        // 2. 메시지 구독 (Subscribe)
        client.subscribe(`/sub/chat/room/${roomId}`, (message) => {
          console.log("📩 [디버깅] 서버에서 메시지 도착함:", message.body); // 👈 이 로그가 뜨는지 확인!
          try {
            const receivedMsg = JSON.parse(message.body);
            setMessages((prev) => [...prev, receivedMsg]);
          } catch (e) {
            console.error("데이터 파싱 에러:", e);
          }

        });
      },

      onStompError: (frame) => {
        console.error('❌ 소켓 에러:', frame.headers['message']);
        console.error('상세 내용:', frame.body);
      },
    });

    client.activate();
    stompClient.current = client;

    return () => {
      if (client) client.deactivate();
    };
  }, [roomId, myToken]);

  // 3. 메시지 전송
  const sendMessage = () => {
    if (!input.trim()) return;

    // 🚩 [추가] Mock 모드일 때의 동작
    if (IS_MOCK_MODE) {
      const mockMessage = {
        roomId: parseInt(roomId),
        senderId: parseInt(myId) || 999, // ID가 없으면 임시값 사용
        message: input,
        createdAt: new Date().toISOString()
      };

      // 서버를 거치지 않고 내 화면에 바로 표시
      setMessages((prev) => [...prev, mockMessage]);
      setInput('');
      return;
    }

    // 📡 실전 모드 (기존 소켓 전송 로직)
    if (!stompClient.current || !stompClient.current.connected) {
      console.error("소켓이 연결되지 않았습니다.");
      return;
    }

    const payload = {
      roomId: parseInt(roomId),
      senderId: parseInt(myId),
      message: input,
    };

    stompClient.current.publish({
      destination: '/pub/chat/message',
      body: JSON.stringify(payload),
    });

    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  return (
    <Box sx={{ maxWidth: 600, margin: '20px auto', p: 2, border: '1px solid #ddd', borderRadius: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>💬 실시간 문의 (Room {roomId})</Typography>

      {/* 채팅 창 */}
      <Paper sx={{ height: 400, overflowY: 'auto', p: 2, mb: 2, bgcolor: '#f1f2f6' }}>
        <List>
          {messages.map((msg, index) => {
            // 내가 보낸 메시지인지 확인 (String vs Number 주의)
            const isMe = String(msg.senderId) === String(myId);

            return (
              <ListItem key={index} sx={{ justifyContent: isMe ? 'flex-end' : 'flex-start', mb: 1 }}>
                <Paper
                  sx={{
                    p: 1.5,
                    maxWidth: '70%',
                    bgcolor: isMe ? '#1976d2' : '#fff',
                    color: isMe ? '#fff' : '#000',
                    borderRadius: 2
                  }}
                >
                  <Typography variant="body2">{msg.message}</Typography>
                </Paper>
              </ListItem>
            );
          })}
        </List>
      </Paper>

      {/* 입력 창 */}
      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="메시지 입력..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Button variant="contained" onClick={sendMessage}>전송</Button>
      </Box>
    </Box>
  );
};

export default ChatRoom;