import React from 'react';
import { useForm } from 'react-hook-form';
import { 
  TextField, Button, Typography, Avatar, Box, Container, Paper, Stack, Link 
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

export default function Signup() {
  const navigate = useNavigate(); // 회원가입 성공 후 페이지 이동을 위해 사용
  
  // React Hook Form 설정: mode: 'onChange'는 입력할 때마다 실시간으로 에러를 검사한다는 뜻
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    mode: 'onChange'
  });

  // 비밀번호 확인 필드와 비교하기 위해 비밀번호 값을 실시간으로 관찰
  const password = watch("password");

  // 🚀 폼 제출 시 실행되는 함수 (API 요청 로직)
  const onSubmit = async (data) => {
    // 1. 데이터 정제: 'confirmPassword'는 프론트 검증용이므로 백엔드 전송 데이터에서 제외
    const { confirmPassword, ...submitData } = data;

    console.log("서버로 보낼 데이터(명세서 기준):", submitData);

    try {
      // 2. API 호출: 명세서에 적힌 엔드포인트(/api/auth/signup)로 POST 요청
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData), // 자바스크립트 객체를 JSON 문자열로 변환
      });

      if (response.ok) {
        alert('회원가입 성공! 로그인 페이지로 이동합니다.');
        navigate('/login'); // 성공 시 로그인 화면으로 이동
      } else {
        // 실패 시 처리 (백엔드 에러 메시지가 있다면 여기서 처리 가능)
        alert('회원가입 실패. 입력 정보를 다시 확인해주세요.');
      }
    } catch (error) {
      console.error("에러 발생:", error);
      alert('서버 연결 실패. 백엔드 서버가 켜져 있는지 확인해주세요.');
    }
  };

  return (
    // ✨ 배경 디자인: 로그인 페이지와 통일감을 주는 파란색 그라데이션
    <Box
      sx={{
        width: '100%',
        height: '100vh', // 화면 전체 높이 사용
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(to right, #a1c4fd, #c2e9fb)',
        overflow: 'auto', // 내용이 화면보다 길어지면 스크롤 생성
        py: 4 // 상하 여백(Padding Y-axis) 추가
      }}
    >
      <Container component="main" maxWidth="xs">
        {/* 카드 UI 디자인 (Paper 컴포넌트) */}
        <Box
          component={Paper}
          elevation={10} // 그림자 깊이 (입체감)
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            p: 4,
            borderRadius: 3,
            width: '100%',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
            Sign Up
          </Typography>

          {/* 폼 영역 시작 */}
          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ width: '100%' }}>
            
            {/* 1. 이메일 입력 (정규식 패턴 검사 포함) */}
            <TextField
              margin="normal"
              required
              fullWidth
              label="Email Address"
              {...register("email", { 
                required: "이메일은 필수입니다.",
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                  message: "올바른 이메일 형식이 아닙니다."
                }
              })}
              error={!!errors.email} // 에러 존재 여부에 따라 빨간색 표시
              helperText={errors.email?.message} // 에러 메시지 출력
            />

            {/* 2. 비밀번호 입력 (명세서 기준: 최소 8자) */}
            <TextField
              margin="normal"
              required
              fullWidth
              label="Password"
              type="password"
              {...register("password", { 
                required: "비밀번호를 입력해주세요.",
                minLength: { value: 8, message: "비밀번호는 최소 8자 이상이어야 합니다." }
              })}
              error={!!errors.password}
              helperText={errors.password?.message}
            />

            {/* 비밀번호 확인 (프론트엔드 전용 검증) */}
            <TextField
              margin="normal"
              required
              fullWidth
              label="Confirm Password"
              type="password"
              {...register("confirmPassword", {
                required: "비밀번호 확인을 입력해주세요.",
                validate: (value) => value === password || "비밀번호가 일치하지 않습니다."
              })}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
            />

            {/* 3. 이름 입력 */}
            <TextField
              margin="normal"
              required
              fullWidth
              label="Name"
              {...register("name", { required: "이름을 입력해주세요." })}
              error={!!errors.name}
              helperText={errors.name?.message}
            />

            {/* 4. 휴대폰 번호 입력 */}
            <TextField
              margin="normal"
              required
              fullWidth
              label="Phone Number"
              placeholder="010-0000-0000"
              {...register("phone", { required: "휴대폰 번호를 입력해주세요." })}
              error={!!errors.phone}
              helperText={errors.phone?.message}
            />

            {/* 5. 주소 입력 */}
            <TextField
              margin="normal"
              required
              fullWidth
              label="Address"
              {...register("address", { required: "주소를 입력해주세요." })}
              error={!!errors.address}
              helperText={errors.address?.message}
            />

            {/* 회원가입 버튼 */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ mt: 3, mb: 2, py: 1.5, fontWeight: 'bold', borderRadius: 2 }}
            >
              Sign Up
            </Button>
            
            {/* 하단 링크 영역 */}
            <Stack direction="row" justifyContent="center">
              <Link component={RouterLink} to="/login" variant="body2" sx={{ cursor: 'pointer' }}>
                {"Already have an account? Sign in"}
              </Link>
            </Stack>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}