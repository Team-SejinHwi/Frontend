import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  TextField, Checkbox, Button, FormControlLabel, Link, Stack,
  Typography, Avatar, Box, Container, Paper
} from '@mui/material';
import LockOutlineIcon from '@mui/icons-material/LockOutline';

// ✅ Config에서 API_BASE_URL도 가져와야 통신이 됩니다.
import { IS_MOCK_MODE, API_BASE_URL } from '../config';

export default function Login({ setIsLoggedIn }) {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();

  // 1️⃣ [테스트용 함수] 프론트엔드 혼자 개발할 때 실행됨
  const handleMockLogin = (data) => {
    console.log("🛠️ [Mock Mode] 가짜 로그인 시도:", data);

    // ★ [수정됨] 테스트할 때도 토큰/이메일이 있어야 '삭제 버튼'이 보입니다.
    localStorage.setItem('isLoggedIn', '1');
    localStorage.setItem('accessToken', 'mock-access-token-123'); // 가짜 토큰
    localStorage.setItem('userEmail', data.email); // 방금 입력한 이메일을 내 거라고 가정

    // 강제 성공 처리
    setIsLoggedIn(true);
    alert(`(테스트 모드) ${data.email}님 환영합니다! \n임시 로그인 되었습니다.`);
    navigate('/');
  };

  // 2️⃣ [실전용 함수] 백엔드 서버와 실제로 통신할 때 실행됨
  const handleRealLogin = async (data) => {
    console.log("📡 [Real Mode] 서버로 로그인 요청:", data);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': '69420'
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();

        // 🔥 [디버깅] 서버가 진짜 뭐라고 보냈는지 눈으로 확인하자!
        console.log("====================================");
        console.log("📥 서버 응답 전체 데이터:", result);
        console.log("====================================");

        // 🚨 [수정] 토큰을 모든 곳에서 다 찾아보기 (만능 탐색)
        // 1. result.data.accessToken (가장 흔함)
        // 2. result.accessToken (data 없이 바로 주는 경우)
        // 3. result.token (변수명이 token일 경우)


        //잠깐 주석 처리!!!!!!!
        // const token = (result.data && result.data.accessToken) || result.accessToken || result.token;
        const token = (result.data && result.data.accessToken) ||
          result.accessToken ||
          "temp-pass-token-1234";

        // 이메일도 마찬가지로 찾기
        const userEmail = (result.data && result.data.user && result.data.user.email) ||
          (result.user && result.user.email) ||
          data.email;

        if (token) {
          // console.log("✅ 토큰 발견! 저장합니다:", token);

          console.log("✅ (임시) 토큰 저장 완료:", token); // 로그 확인용
          localStorage.setItem('accessToken', token); // 저장!
          localStorage.setItem('userEmail', userEmail);
          localStorage.setItem('isLoggedIn', '1');

          setIsLoggedIn(true);
          alert('로그인 성공!');
          navigate('/');
        } else {
          console.error("😱 로그인 API는 성공했는데, 토큰을 못 찾겠어요!");
          console.log("현재 응답 구조를 보고 Login.jsx를 수정해야 합니다.");
          alert("로그인 처리에 실패했습니다. (토큰 없음)");
        }

      } else {
        alert('로그인 실패. 아이디와 비밀번호를 확인해주세요.');
      }
    } catch (error) {
      console.error("서버 통신 에러:", error);
      alert('서버와 연결할 수 없습니다.');
    }
  };

  // 🚀 [메인 핸들러]
  const onSubmit = (data) => {
    if (IS_MOCK_MODE) {
      handleMockLogin(data);
    } else {
      handleRealLogin(data);
    }
  };

  return (
    <Box
      sx={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(to right, #a1c4fd, #c2e9fb)',
      }}
    >
      <Container component="main" maxWidth="xs">
        <Box
          component={Paper}
          elevation={10}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            padding: 4,
            borderRadius: 3,
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
            <LockOutlineIcon />
          </Avatar>

          <Typography component="h1" variant="h4" sx={{ width: '100%', textAlign: 'center', fontWeight: 'bold', mb: 3 }}>
            Sign in
          </Typography>

          {IS_MOCK_MODE && (
            <Typography variant="caption" sx={{ color: 'red', fontWeight: 'bold', mb: 2 }}>
              ⚠️ 현재 테스트 모드입니다 (백엔드 통신 X)
            </Typography>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ width: '100%' }}>

            <TextField
              margin='normal'
              required
              fullWidth
              label="Email Address"
              autoComplete="email"
              autoFocus
              {...register("email", { required: "이메일을 입력해주세요." })}
              error={!!errors.email}
              helperText={errors.email?.message}
            />

            <TextField
              margin='normal'
              required
              fullWidth
              label="Password"
              type="password"
              autoComplete="current-password"
              {...register("password", { required: "비밀번호를 입력해주세요." })}
              error={!!errors.password}
              helperText={errors.password?.message}
            />

            <FormControlLabel
              control={<Checkbox value="remember" color="primary" />}
              label="Remember me"
              sx={{ width: '100%' }}
            />

            <Button type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ mt: 3, mb: 2, py: 1.5, fontWeight: 'bold', borderRadius: 2 }}
            >
              Sign In
            </Button>

            <Stack direction="row" spacing={2} sx={{ mt: 1, justifyContent: 'center' }}>
              <Link variant="body2" sx={{ cursor: 'pointer' }}>
                Forgot your password?
              </Link>
              <Link component={RouterLink} to="/signup" variant="body2" sx={{ cursor: 'pointer' }}>
                sign up
              </Link>
            </Stack>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}