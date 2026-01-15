import React from 'react';
// 폼 상태 관리 및 유효성 검사를 쉽게 하기 위한 라이브러리 (React Hook Form)
import { useForm } from 'react-hook-form';
// 페이지 이동(useNavigate)과 링크 컴포넌트(Link)를 사용하기 위한 리액트 라우터
import { useNavigate, Link as RouterLink } from 'react-router-dom';

// UI 디자인을 위한 Material UI(MUI) 컴포넌트들
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LockOutlineIcon from '@mui/icons-material/LockOutline';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';

// [수정] App.jsx에서 내려준 setIsLoggedIn 함수를 props로 받습니다.
// 구조 분해 할당({ setIsLoggedIn })을 사용해 props.setIsLoggedIn 대신 바로 사용합니다.
export default function Login({ setIsLoggedIn }) {
  
  const navigate = useNavigate();

  // useForm 설정
  const { register, handleSubmit, formState: { errors } } = useForm();

  // 🚀 [핸들러] 로그인 폼 제출 시 실행되는 함수
  const onSubmit = async (data) => {
    console.log("입력된 로그인 정보:", data);

    try {
      // -------------------------------------------------------------
      // [임시 조치] 백엔드 연동 전, 프론트엔드 테스트를 위한 가짜 로직
      // -------------------------------------------------------------
      
      // 원래 코드 (백엔드 통신) -> 잠시 주석 처리 해둠
      
      /*
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        alert('로그인 성공!');
        navigate('/');
      } else {
        alert('로그인 실패. 이메일이나 비밀번호를 확인하세요.');
      }
      */

      // [테스트용 코드] 무조건 로그인 성공 처리
      // 1. 부모(App)의 상태를 true로 변경
      setIsLoggedIn(true);
      
      // 2. 알림창 띄우기
      alert(`(테스트) ${data.email}님 환영합니다! \n임시 로그인 되었습니다.`);
      
      // 3. 메인 페이지로 이동
      navigate('/');

    } catch (error) {
      console.error("Login Error:", error);
      alert('에러가 발생했습니다.');
    }
  };

  return (
    // ... (UI 코드는 변경된 것이 없어 그대로 유지하되, 전체 맥락을 위해 Box 부분만 표시)
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