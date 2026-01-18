import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  TextField, Checkbox, Button, FormControlLabel, Link, Stack,
  Typography, Avatar, Box, Container, Paper
} from '@mui/material';
import LockOutlineIcon from '@mui/icons-material/LockOutline';

// 🎛️ [모드 스위치] 이 변수만 변경하면 모드가 바뀝니다!
// true  : 프론트엔드 혼자 테스트 (가짜 로그인)
// false : 백엔드(휘님)와 연동 (실제 API 통신)

const IS_MOCK_MODE = true;

export default function Login({ setIsLoggedIn }) {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();

  // 1️⃣ [테스트용 함수] 프론트엔드 혼자 개발할 때 실행됨
  const handleMockLogin = (data) => {
    console.log("🛠️ [Mock Mode] 가짜 로그인 시도:", data);

    // ★ [추가] 브라우저 저장소에 '로그인 했음(1)'이라고 저장
    localStorage.setItem('isLoggedIn', '1');

    // 강제 성공 처리
    setIsLoggedIn(true);
    alert(`(테스트 모드) ${data.email}님 환영합니다! \n임시 로그인 되었습니다.`);
    navigate('/');
  };

  // 2️⃣ [실전용 함수] 백엔드 서버와 실제로 통신할 때 실행됨
  const handleRealLogin = async (data) => {
    console.log("📡 [Real Mode] 서버로 로그인 요청:", data);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        // 성공 시 로직 (토큰 저장 등은 추후 추가)
        const result = await response.json();
        localStorage.setItem('isLoggedIn', '1');
        console.log("응답 데이터:", result);

        setIsLoggedIn(true);
        alert('로그인 성공!');
        navigate('/');
      } else {
        alert('로그인 실패. 아이디와 비밀번호를 확인해주세요.');
      }
    } catch (error) {
      console.error("서버 통신 에러:", error);
      alert('서버와 연결할 수 없습니다. 백엔드 서버 상태를 확인하세요.');
    }
  };

  // 🚀 [메인 핸들러] 폼 제출 시 스위치 값에 따라 경로를 분기함
  const onSubmit = (data) => {
    if (IS_MOCK_MODE) {
      // 스위치가 켜져 있으면 가짜 함수 실행
      handleMockLogin(data);
    } else {
      // 스위치가 꺼져 있으면 진짜 함수 실행
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

          {/* 현재 모드를 화면에 살짝 표시해줌 (개발 편의용, 나중에 삭제 가능) */}
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