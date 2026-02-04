import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

// UI 컴포넌트 (MUI)
import { 
  Box, TextField, IconButton, AppBar, Toolbar, Avatar, Typography, 
  Paper, Stack, CircularProgress
} from '@mui/material';

// 아이콘
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SmartToyIcon from '@mui/icons-material/SmartToy'; // 상대방 기본 프사

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
  // 1. 초기 데이터 로드 (내 정보 & 이전 대화) - [기존 로직 유지]
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
  // 2. 웹소켓 연결 (Real Mode Only) - [기존 로직 유지]
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
  // 4. 메시지 전송 핸들러 - [기존 로직 유지]
  // =================================================================
  const sendMessage = () => {
    if (!input.trim()) return;

    // 현재 시간 구하기 (ISO 포맷)
    const now = new Date().toISOString();

    // [A] Mock 모드
    if (IS_MOCK_MODE) {
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

  // =================================================================
  // 🎨 UI 렌더링 (카카오톡 스타일 적용)
  // =================================================================
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: '#b2c7d9' }}> {/* 🌈 배경색: 카카오톡 느낌의 하늘색 */}
      
      {/* 🔹 상단 헤더 (투명도 살짝 적용) */}
      <AppBar 
        position="static" 
        elevation={0} 
        sx={{ 
          bgcolor: 'rgba(255, 255, 255, 0.9)', // 살짝 투명한 흰색 배경
          color: 'black',
          backdropFilter: 'blur(5px)' // 블러 효과로 고급스러움 추가
        }}
      >
        <Toolbar>
          <IconButton edge="start" onClick={() => navigate(-1)} sx={{ color: 'black' }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ ml: 1, flexGrow: 1, fontWeight: 'bold', fontSize: '1.1rem' }}>
            대여 문의 채팅방
          </Typography>
        </Toolbar>
      </AppBar>

      {/* 🔹 채팅 메시지 영역 */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {messages.map((msg, index) => {
          const isMe = String(msg.senderId) === String(myId);
          
          return (
            <Box 
              key={index} 
              sx={{ 
                display: 'flex', 
                justifyContent: isMe ? 'flex-end' : 'flex-start', // 나는 오른쪽, 상대는 왼쪽
                alignItems: 'flex-start',
                mb: 1
              }}
            >
              {/* 👤 상대방 프로필 (왼쪽에만 표시) */}
              {!isMe && (
                <Avatar sx={{ width: 40, height: 40, mr: 1, bgcolor: '#ffffff', border: '1px solid #ddd' }}>
                  <SmartToyIcon sx={{ color: '#555', fontSize: 24 }} />
                </Avatar>
              )}

              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start', maxWidth: '70%' }}>
                
                {/* 🏷️ 상대방 이름 (선택 사항: 필요하면 주석 해제) */}
                {/* {!isMe && <Typography variant="caption" sx={{ ml: 1, mb: 0.5, color: '#555' }}>판매자</Typography>} */}

                {/* 💬 말풍선 + 시간 (가로 배치) */}
                <Box sx={{ display: 'flex', alignItems: 'flex-end', flexDirection: isMe ? 'row' : 'row-reverse' }}>
                  
                  {/* ⏰ 시간 표시 (말풍선 옆에 붙음) */}
                  <Typography variant="caption" sx={{ color: '#555', fontSize: '0.7rem', mx: 0.5, mb: 0.5 }}>
                    {msg.sendTime ? dayjs(msg.sendTime).format('A h:mm') : ''}
                  </Typography>

                  {/* 🗨️ 말풍선 본체 */}
                  <Paper
                    elevation={1}
                    sx={{
                      p: '8px 12px',
                      bgcolor: isMe ? '#fef01b' : '#ffffff', // 🟡 나는 카톡 노란색, ⚪ 상대는 흰색
                      color: 'black',
                      borderRadius: isMe ? '15px 0px 15px 15px' : '0px 15px 15px 15px', // 말풍선 꼬리 모양
                      wordBreak: 'break-word',
                      lineHeight: 1.5,
                      fontSize: '0.95rem'
                    }}
                  >
                    {msg.message}
                  </Paper>

                </Box>
              </Box>
            </Box>
          );
        })}
        {/* 스크롤 하단 고정용 */}
        <div ref={messagesEndRef} />
      </Box>

      {/* 🔹 하단 입력창 영역 */}
      <Box sx={{ p: 1, bgcolor: '#ffffff' }}> {/* 흰색 배경으로 깔끔하게 */}
        <Paper 
          component="form" 
          elevation={0}
          sx={{ 
            p: '4px 8px', 
            display: 'flex', 
            alignItems: 'center', 
            bgcolor: '#f8f8f8', // 입력창은 연한 회색
            borderRadius: 20, // 둥근 입력창
            border: '1px solid #e0e0e0'
          }}
        >
          <TextField
            fullWidth
            placeholder="메시지를 입력하세요"
            variant="standard"
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
            disabled={!input.trim()}
            sx={{ 
              color: input.trim() ? '#3b1e1e' : '#ccc', // 활성화되면 갈색(카톡 테마색) 계열
              bgcolor: input.trim() ? '#fef01b' : 'transparent', // 활성화되면 노란 배경
              '&:hover': { bgcolor: '#f5e61b' },
              transition: '0.2s',
              width: 40, height: 40
            }}
          >
            <SendIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Paper>
      </Box>
    </Box>
  );
};

export default ChatRoom;