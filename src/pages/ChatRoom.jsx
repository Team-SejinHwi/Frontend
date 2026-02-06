import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

// UI 컴포넌트 (MUI)
import {
  Box, TextField, IconButton, AppBar, Toolbar, Avatar, Typography,
  Paper, CircularProgress
} from '@mui/material';

// 아이콘
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SmartToyIcon from '@mui/icons-material/SmartToy'; // 상대방 기본 프사

// 날짜 포맷팅 라이브러리
import dayjs from 'dayjs';
import 'dayjs/locale/ko';

import { API_BASE_URL, IS_MOCK_MODE, TUNNEL_HEADERS } from '../config';

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
            // [UPDATE] v.02.05 명세에 맞게 sendTime -> sendDate(포맷팅 문자열)로 변경
            { messageId: 1, senderId: 2, senderName: "판매자", message: "안녕하세요! 물건 상태 어떤가요?", sendDate: "2026-02-05 14:00:00", type: 'TALK' },
            { messageId: 2, senderId: 1, senderName: "나", message: "안녕하세요. 기스 없이 깨끗합니다!", sendDate: "2026-02-05 14:05:00", type: 'TALK' },
            { messageId: 3, senderId: 2, senderName: "판매자", message: "오 좋네요. 직거래 가능하신가요?", sendDate: "2026-02-05 14:10:00", type: 'TALK' }
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
            ...TUNNEL_HEADERS
          }
        });
        if (meRes.ok) {
          const meData = await meRes.json();
          const userData = meData.data || meData;
          setMyId(userData.memberId || userData.id); // 내 ID 저장
        }

        // [B] 이전 채팅 내역 불러오기 (v.02.05 명세 반영)
        const historyRes = await fetch(`${API_BASE_URL}/api/chat/room/${roomId}/messages`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            ...TUNNEL_HEADERS
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
        // 구독 경로: /sub/chat/room/{roomId}
        client.subscribe(`/sub/chat/room/${roomId}`, (message) => {
          if (message.body) {
            const receivedMsg = JSON.parse(message.body);
            console.log("📨 서버에서 받은 메시지:", receivedMsg);
            // v.02.05에서 추가된 sendDate 필드를 포함하여 상태 업데이트
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
  // 4. 메시지 전송 핸들러 - [v.02.05 명세 규격 준수]
  // =================================================================
  const sendMessage = () => {
    if (!input.trim()) return;

    // [A] Mock 모드
    if (IS_MOCK_MODE) {
      const mockNow = dayjs().format('YYYY-MM-DD HH:mm:ss');
      setMessages([...messages, { 
        senderId: myId, 
        senderName: "나",
        message: input, 
        sendDate: mockNow,
        type: 'TALK'
      }]);
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
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: '#b2c7d9' }}>

      {/* 🔹 상단 헤더 */}
      <AppBar
        position="static"
        elevation={0}
        sx={{
          bgcolor: 'rgba(255, 255, 255, 0.9)',
          color: 'black',
          backdropFilter: 'blur(5px)'
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
              key={msg.messageId || index}
              sx={{
                display: 'flex',
                justifyContent: isMe ? 'flex-end' : 'flex-start',
                alignItems: 'flex-start',
                mb: 1
              }}
            >
              {!isMe && (
                <Avatar sx={{ width: 40, height: 40, mr: 1, bgcolor: '#ffffff', border: '1px solid #ddd' }}>
                  <SmartToyIcon sx={{ color: '#555', fontSize: 24 }} />
                </Avatar>
              )}

              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start', maxWidth: '70%' }}>
                
                {/* 🏷️ 상대방 이름 표시 (v.02.05 명세 기반) */}
                {!isMe && (
                  <Typography variant="caption" sx={{ ml: 1, mb: 0.5, color: '#555', fontWeight: 'bold' }}>
                    {msg.senderName || '상대방'}
                  </Typography>
                )}

                <Box sx={{ display: 'flex', alignItems: 'flex-end', flexDirection: isMe ? 'row' : 'row-reverse' }}>

                  {/* ⏰ 시간 표시 (sendDate 우선 적용) */}
                  <Typography variant="caption" sx={{ color: '#555', fontSize: '0.7rem', mx: 0.5, mb: 0.5 }}>
                    {/* [수정됨] v.02.05 표준 필드인 sendDate를 최우선으로 사용하여 시간 포맷팅 */}
                    {(msg.sendDate || msg.sendTime || msg.createdAt || msg.timestamp)
                      ? dayjs(msg.sendDate || msg.sendTime || msg.createdAt || msg.timestamp).format('A h:mm')
                      : ''}
                  </Typography>

                  <Paper
                    elevation={1}
                    sx={{
                      p: '8px 12px',
                      bgcolor: isMe ? '#fef01b' : '#ffffff',
                      color: 'black',
                      borderRadius: isMe ? '15px 0px 15px 15px' : '0px 15px 15px 15px',
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
        <div ref={messagesEndRef} />
      </Box>

      {/* 🔹 하단 입력창 영역 */}
      <Box sx={{ p: 1, bgcolor: '#ffffff' }}>
        <Paper
          component="form"
          elevation={0}
          sx={{
            p: '4px 8px',
            display: 'flex',
            alignItems: 'center',
            bgcolor: '#f8f8f8',
            borderRadius: 20,
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
              color: input.trim() ? '#3b1e1e' : '#ccc',
              bgcolor: input.trim() ? '#fef01b' : 'transparent',
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