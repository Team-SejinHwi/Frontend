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
        // [A] Mock 모드 수정: 방 번호(roomId)에 따라 다른 대화 보여주기
        if (IS_MOCK_MODE) {
          setMyId(1); // 내 ID를 1번으로 가정

          // 방 번호를 문자열로 변환하여 비교 (URL params는 문자열임)
          if (String(roomId) === '15') {
            setMessages([
              { messageId: 1, senderId: 2, senderName: "판매자", message: "안녕하세요! 맥북 상태 어떤가요?", sendDate: "2026-02-12 14:00:00", type: 'TALK' },
              { messageId: 2, senderId: 1, senderName: "나", message: "기스 없이 깨끗합니다! 사진 보셨나요?", sendDate: "2026-02-12 14:05:00", type: 'TALK' },
              { messageId: 3, senderId: 2, senderName: "판매자", message: "네 봤습니다. 직거래 가능하신가요?", sendDate: "2026-02-12 14:30:00", type: 'TALK' }
            ]);
          } else if (String(roomId) === '16') {
            setMessages([
              { messageId: 10, senderId: 1, senderName: "나", message: "저기요, 텐트 구성품 빠진 거 없나요?", sendDate: "2026-02-11 09:00:00", type: 'TALK' },
              { messageId: 11, senderId: 3, senderName: "캠핑족", message: "네 전부 확인해서 넣었습니다. 걱정 마세요.", sendDate: "2026-02-11 10:30:00", type: 'TALK' },
            ]);
          } else {
            // 그 외의 방
            setMessages([
              { messageId: 99, senderId: 99, senderName: "알림", message: "새로운 대화방입니다.", sendDate: dayjs().format("YYYY-MM-DD HH:mm:ss"), type: 'TALK' }
            ]);
          }

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
        messageId: Date.now(),
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
  // 🎨 UI 렌더링
  // =================================================================
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'linear-gradient(180deg, #D6E4FF 0%, #F1F5F9 100%)' }}>

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
                    elevation={0}
                    sx={{
                      p: '10px 16px',
                      // 나: 브랜드 블루 그라데이션 적용
                      background: isMe
                        ? 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)'
                        : '#ffffff',
                      color: isMe ? 'white' : '#334155',
                      // 말풍선 모양을 더 둥글게 (Pill Style)
                      borderRadius: isMe
                        ? '20px 20px 4px 20px'
                        : '20px 20px 20px 4px',
                      boxShadow: isMe
                        ? '0 4px 12px rgba(25, 118, 210, 0.2)'
                        : '0 2px 8px rgba(0,0,0,0.05)',
                      fontSize: '0.95rem',
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
      <Box sx={{
        p: 2,
        bgcolor: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(10px)', // 글래스모피즘 효과
        borderTop: '1px solid rgba(0,0,0,0.05)'
      }}>
        <Paper
          elevation={0}
          sx={{
            p: '2px 8px',
            display: 'flex',
            alignItems: 'center',
            bgcolor: '#f1f5f9',
            borderRadius: '24px', // 더 둥글게
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
            onClick={sendMessage}
            sx={{
              bgcolor: '#1976d2', // 전송 버튼색 변경
              color: 'white',
              '&:hover': { bgcolor: '#1565c0' },
              width: 36, height: 36, ml: 1
            }}
          >
            <SendIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Paper>
      </Box>
    </Box>
  );
};

export default ChatRoom;