import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  TextField, Checkbox, Button, FormControlLabel, Link, Stack,
  Typography, Avatar, Box, Container, Paper
} from '@mui/material';
import LockOutlineIcon from '@mui/icons-material/LockOutline';


// ✅ Config에서 API_BASE_URL도 가져와야 통신이 된다.
import { IS_MOCK_MODE, API_BASE_URL } from '../config';

export default function Login({ setIsLoggedIn }) {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();

  // 1️⃣ [테스트용] Mock 모드(프론트 혼자)
  const handleMockLogin = (data) => {
    console.log("🛠️ [Mock Mode] 가짜 로그인 시도:", data);

    //  테스트할 때도 토큰/이메일이 있어야 '삭제 버튼'이 보인다.
    localStorage.setItem('isLoggedIn', '1');
    localStorage.setItem('accessToken', 'mock-access-token-123'); // 가짜 토큰
    localStorage.setItem('refreshToken', 'mock-access-token-123'); // 가짜 토큰
    localStorage.setItem('userEmail', data.email); // 방금 입력한 이메일을 내 거라고 가정
    localStorage.setItem('userId', '999'); // 가짜 ID 저장

    // 강제 성공 처리
    setIsLoggedIn(true);
    alert(`(테스트 모드) ${data.email}님 환영합니다! \n임시 로그인 되었습니다.`);
    navigate('/');
  };


  // 2️⃣ [실전용 함수] 
  const handleRealLogin = async (data) => {
    console.log("📡 [Real Mode] 서버로 로그인 요청:", data);

    try {
      // 1. 로그인 요청
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': '69420'
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("📥 서버 응답(토큰):", result);

        // 토큰 추출
        const accessToken = result.accessToken || (result.data && result.data.accessToken);
        const refreshToken = result.refreshToken || (result.data && result.data.refreshToken);

        if (accessToken && refreshToken) {
          // 2. 토큰 먼저 저장
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
          localStorage.setItem('userEmail', data.email);
          localStorage.setItem('isLoggedIn', '1');

          // 🚨  토큰을 받았으니, 바로 "내 정보(ID)"를 물어본다.
          console.log("🕵️‍♂️ ID를 찾기 위해 내 정보 조회(/api/members/me) 실행...");

          const meResponse = await fetch(`${API_BASE_URL}/api/members/me`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${accessToken}`, // 방금 받은 따끈한 토큰 사용
              'ngrok-skip-browser-warning': '69420'
            }
          });

          if (meResponse.ok) {
            const meResult = await meResponse.json();
            console.log("👤 내 정보 응답:", meResult);

            // 여기서 진짜 ID를 찾아서 저장! (구조에 따라 다를 수 있어 안전하게 다 찾음)
            const realUserId = meResult.id || meResult.userId || (meResult.data && meResult.data.id);

            if (realUserId) {
              console.log("✅ 진짜 ID 발견:", realUserId);
              localStorage.setItem('userId', realUserId);
            } else {
              console.warn("😱 내 정보에도 ID가 없어요! (백엔드 확인 필요)");
            }
          }
          setIsLoggedIn(true);
          alert('로그인 성공!');
          navigate('/');
        } else {
          alert("로그인 실패 (토큰 누락)");
        }
      } else {
        // 401 등의 에러일 때 서버가 보낸 메시지 읽기 (명세서에는 텍스트로 온다고 되어 있음)
        // 명세서: Response (Fail) -> text "이메일 또는 비밀번호 불일치"
        let errorMessage = '로그인 실패. 아이디와 비밀번호를 확인해주세요.';
        try {
          const errorText = await response.text(); // JSON이 아니라 text일 수도 있음
          if (errorText) errorMessage = errorText;
        } catch (e) {
          // text 파싱 실패 시 기본 메시지 유지
        }
        alert(errorMessage);
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