import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
// UI 컴포넌트
import { 
  Box, TextField, IconButton, AppBar, Toolbar, Avatar, Typography, 
  Paper, Stack, CircularProgress
} from '@mui/material';
// 아이콘
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SmartToyIcon from '@mui/icons-material/SmartToy';

// 날짜 포맷팅 라이브러리
import dayjs from 'dayjs';
import 'dayjs/locale/ko';

import { API_BASE_URL, IS_MOCK_MODE } from '../config';

// 한국어 설정
dayjs.locale('ko');

const ChatRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [myId, setMyId] = useState(null); 
  const [loading, setLoading] = useState(true);
  
  const stompClient = useRef(null);
  const messagesEndRef = useRef(null); // 스크롤 자동 이동용 Ref

  const token = localStorage.getItem('accessToken');

  // =================================================================
  // 1. 초기 데이터 로드 (내 정보 & 이전 대화)
  // =================================================================
  useEffect(() => {
    const initializeChat = async () => {
      try {
        if (IS_MOCK_MODE) {
          setMyId(1); // 내 ID를 1번으로 가정
          setMessages([
            { senderId: 2, message: "안녕하세요! 물건 상태 어떤가요?", sendTime: dayjs().subtract(1, 'hour').toISOString() },
            { senderId: 1, message: "안녕하세요. 기스 없이 깨끗합니다!", sendTime: dayjs().subtract(55, 'minute').toISOString() },
            { senderId: 2, message: "오 좋네요. 직거래 가능하신가요?", sendTime: dayjs().subtract(10, 'minute').toISOString() }
          ]);
          setLoading(false);
          return;
        }

        if (!token) {
          alert("로그인이 필요합니다.");
          navigate('/login');
          return;
        }

        // [A] 내 정보 조회 (ID 확인용)
        const meRes = await fetch(`${API_BASE_URL}/api/members/me`, {
          headers: { 
              'Authorization': `Bearer ${token}`,
              'ngrok-skip-browser-warning': '69420'
          }
        });
        if (meRes.ok) {
            const meData = await meRes.json();
            const userData = meData.data || meData;
            setMyId(userData.memberId || userData.id); // 내 ID 저장
        }

        // [B] 이전 채팅 내역 불러오기
        const historyRes = await fetch(`${API_BASE_URL}/api/chat/room/${roomId}/messages`, {
            headers: { 
                'Authorization': `Bearer ${token}`,
                'ngrok-skip-browser-warning': '69420'
            }
        });
        if (historyRes.ok) {
            const historyData = await historyRes.json();
            setMessages(historyData.data || []);
        }

      } catch (error) {
        console.error("초기 데이터 로드 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeChat();
  }, [roomId, token, navigate]);

  // =================================================================
  // 2. 웹소켓 연결 (Real Mode Only)
  // =================================================================
  useEffect(() => {
    if (IS_MOCK_MODE || !myId) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(`${API_BASE_URL}/ws-stomp`),
      connectHeaders: { Authorization: `Bearer ${token}` },
      onConnect: () => {
        console.log("✅ 소켓 연결 성공!");
        client.subscribe(`/sub/chat/room/${roomId}`, (message) => {
          if (message.body) {
            const receivedMsg = JSON.parse(message.body);
            setMessages((prev) => [...prev, receivedMsg]);
          }
        });
      },
      onStompError: (frame) => {
        console.error('Socket Error:', frame);
      },
    });

    client.activate();
    stompClient.current = client;

    return () => {
      if (client) client.deactivate();
    };
  }, [roomId, myId, token]);

  // 3. 메시지 추가될 때마다 스크롤 맨 아래로 이동
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // =================================================================
  // 4. 메시지 전송 핸들러
  // =================================================================
  const sendMessage = () => {
    if (!input.trim()) return;

    // 현재 시간 구하기 (ISO 포맷)
    const now = new Date().toISOString();

    // [A] Mock 모드
    if (IS_MOCK_MODE) {
      // ✅ [수정됨] 내가 보낸 메시지에도 'sendTime'을 직접 넣어줍니다.
      setMessages([...messages, { senderId: myId, message: input, sendTime: now }]);
      setInput('');
      return;
    }

    // [B] Real 모드
    if (stompClient.current && stompClient.current.connected) {
      const payload = {
        roomId: parseInt(roomId),
        senderId: myId,
        message: input,
        type: 'TALK' 
        // 💡 벡엔드 통신 시: 보통 여기서 sendTime은 안 보냅니다. 
        // 서버가 받아서 DB에 저장하는 순간의 시간을 찍어서 돌려주는 게 정석입니다.
        // 즉, 서버 응답이 오면 그때 시간이 표시될 것입니다.
      };

      stompClient.current.publish({
        destination: '/pub/chat/message',
        body: JSON.stringify(payload),
      });

      setInput('');
    } else {
      alert("연결 중입니다. 잠시만 기다려주세요.");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', height: '100vh', alignItems: 'center' }}><CircularProgress /></Box>;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: '#f2f4f7' }}>
      
      {/* 🔹 상단 헤더 */}
      <AppBar position="static" elevation={0} sx={{ bgcolor: 'white', borderBottom: '1px solid #e0e0e0', color: 'black' }}>
        <Toolbar>
          <IconButton edge="start" onClick={() => navigate(-1)} sx={{ color: 'black' }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ ml: 1, flexGrow: 1, fontWeight: 'bold' }}>
            채팅방
          </Typography>
        </Toolbar>
      </AppBar>

      {/* 🔹 채팅 영역 */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {messages.map((msg, index) => {
          const isMe = String(msg.senderId) === String(myId);
          
          return (
            <Box 
              key={index} 
              sx={{ 
                display: 'flex', 
                justifyContent: isMe ? 'flex-end' : 'flex-start',
                alignItems: 'flex-end',
                mb: 1 
              }}
            >
              {/* 상대방 프로필 (왼쪽에만 표시) */}
              {!isMe && (
                <Avatar sx={{ width: 36, height: 36, mr: 1.5, bgcolor: '#e0e0e0' }}>
                  <SmartToyIcon sx={{ color: '#757575', fontSize: 20 }} />
                </Avatar>
              )}

              {/* 말풍선 + 시간 래퍼 */}
              <Stack direction={isMe ? "row-reverse" : "row"} alignItems="flex-end" spacing={1}>
                {/* 💬 말풍선 디자인 */}
                <Paper
                  elevation={0}
                  sx={{
                    p: '10px 16px',
                    maxWidth: '300px',
                    wordBreak: 'break-word',
                    // 카카오톡 스타일: 내 거는 노란색/파란색, 상대는 흰색/회색
                    bgcolor: isMe ? '#3b82f6' : '#ffffff', 
                    color: isMe ? '#fff' : '#1f2937',
                    borderRadius: isMe ? '20px 20px 0px 20px' : '20px 20px 20px 0px', // 꼬리 모양 만들기
                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                  }}
                >
                  <Typography variant="body1" sx={{ fontSize: '0.95rem', lineHeight: 1.5 }}>
                    {msg.message}
                  </Typography>
                </Paper>

                {/* 🕒 시간 표시 */}
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', mb: 0.5 }}>
                  {msg.sendTime ? dayjs(msg.sendTime).format('A h:mm') : '전송 중...'}
                </Typography>
              </Stack>
            </Box>
          );
        })}
        {/* 스크롤 하단 고정용 */}
        <div ref={messagesEndRef} />
      </Box>

      {/* 🔹 입력창 영역 */}
      <Box sx={{ p: 2, bgcolor: 'white', borderTop: '1px solid #e0e0e0' }}>
        <Paper 
          component="form" 
          elevation={0}
          sx={{ 
            p: '4px 8px', 
            display: 'flex', 
            alignItems: 'center', 
            bgcolor: '#f8f9fa', 
            borderRadius: 3,
            border: '1px solid #e9ecef'
          }}
        >
          <TextField
            fullWidth
            placeholder="메시지를 입력하세요..."
            variant="standard" // 밑줄 제거를 위해 standard + InputProps disableUnderline 조합 사용
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            multiline
            maxRows={3}
            InputProps={{ disableUnderline: true }}
            sx={{ px: 2, py: 1 }}
          />
          <IconButton 
            color="primary" 
            onClick={sendMessage}
            disabled={!input.trim()} // 빈 값일 때 버튼 비활성화
            sx={{ 
              p: 1.5, 
              color: input.trim() ? '#3b82f6' : '#adb5bd',
              transition: '0.3s'
            }}
          >
            <SendIcon />
          </IconButton>
        </Paper>
      </Box>
    </Box>
  );
};

export default ChatRoom;