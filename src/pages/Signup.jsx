import React from 'react';
// 폼 상태 관리 및 유효성 검사를 위한 Hook
import { useForm } from 'react-hook-form';
// Material UI 컴포넌트들을 한 번에 import
import {
  TextField, Button, Typography, Avatar, Box, Container, Paper, Stack, Link
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
// 페이지 이동을 위한 Hook과 RouterLink 컴포넌트
import { useNavigate, Link as RouterLink } from 'react-router-dom';

export default function Signup() {
  // [Hook 1] useNavigate: 회원가입 완료 후 로그인 페이지로 이동시키기 위해 사용합니다.
  const navigate = useNavigate();

  // [Hook 2] useForm 설정
  // mode: 'onChange' -> 사용자가 키보드를 칠 때마다 실시간으로 유효성 검사를 수행합니다.
  // (기본값은 'onSubmit'이라 제출 버튼을 눌러야 검사하지만, 회원가입은 실시간 피드백이 중요하므로 변경)
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    mode: 'onChange'
  });

  // [중요 로직] 비밀번호 일치 확인 기능
  // watch("password"): "password"라는 이름의 입력 필드 값을 실시간으로 감시(관찰)합니다.
  // 이 값은 나중에 '비밀번호 확인' 필드의 유효성 검사 함수(validate)에서 비교값으로 쓰입니다.
  const password = watch("password");

  // 🚀 [핸들러] 폼 제출 시 실행되는 함수 (API 요청 로직)
  // handleSubmit이 유효성 검사를 통과시킨 데이터를 인자(data)로 넘겨줍니다.
  const onSubmit = async (data) => {
    // 1. 데이터 정제 (Spread Operator 사용)
    // data 객체에는 { email, password, confirmPassword, name... } 등이 다 들어있습니다.
    // 하지만 백엔드 API는 보통 '비밀번호 확인(confirmPassword)' 값은 필요로 하지 않습니다.
    // 따라서 confirmPassword는 따로 빼고, 나머지 필요한 정보만 rest 문법(...submitData)으로 모읍니다.
    const { confirmPassword, ...submitData } = data;

    // 실제 전송될 데이터 확인 (개발자 도구 콘솔에서 볼 수 있음)
    console.log("서버로 보낼 데이터(명세서 기준):", submitData);

    try {
      // 2. API 호출: 명세서에 적힌 엔드포인트(/api/auth/signup)로 POST 요청
      const response = await fetch('/api/auth/signup', {
        method: 'POST', // 데이터를 생성(Create)하므로 POST 메서드 사용
        headers: {
          'Content-Type': 'application/json', // JSON 형식으로 보냄을 명시
        },
        body: JSON.stringify(submitData), // 자바스크립트 객체를 JSON 문자열로 변환하여 전송
      });

      // 3. 응답 처리
      if (response.ok) {
        // HTTP 상태 코드가 200번대(성공)일 때
        alert('회원가입 성공! 로그인 페이지로 이동합니다.');
        navigate('/login'); // 성공 시 로그인 화면으로 이동 (사용자 경험 향상)
      } else {
        // 실패 시 처리 (백엔드 에러 메시지가 있다면 여기서 처리 가능)
        alert('회원가입 실패. 입력 정보를 다시 확인해주세요.');
      }
    } catch (error) {
      // 네트워크 오류 등 예외 처리
      console.error("에러 발생:", error);
      alert('서버 연결 실패. 백엔드 서버가 켜져 있는지 확인해주세요.');
    }
  };

  return (
    // ✨ [전체 배경 디자인]
    // Box는 div 태그와 유사하며 sx props로 스타일링합니다.
    <Box
      sx={{
        width: '100%',
        height: '100vh', // 화면 전체 높이 사용
        display: 'flex', // Flexbox 레이아웃
        alignItems: 'center', // 수직 중앙 정렬
        justifyContent: 'center', // 수평 중앙 정렬
        background: 'linear-gradient(to right, #a1c4fd, #c2e9fb)', // 로그인 페이지와 통일된 파란색 그라데이션
        overflow: 'auto', // 내용이 화면보다 길어지면 스크롤 생성 (모바일 대응 등)
        py: 4 // 상하 여백(Padding Y-axis, 4 = 32px) 추가
      }}
    >
      <Container component="main" maxWidth="xs">
        {/* [카드 UI 디자인] Paper 컴포넌트로 종이 같은 질감 표현 */}
        <Box
          component={Paper}
          elevation={10} // 그림자 깊이 (입체감)
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            p: 4, // 내부 패딩
            borderRadius: 3, // 둥근 모서리
            width: '100%',
          }}
        >
          {/* 상단 아이콘 */}
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>

          {/* 제목 텍스트 */}
          <Typography component="h1" variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
            Sign Up
          </Typography>

          {/* [폼 영역 시작] */}
          {/* onSubmit에 handleSubmit(onSubmit)을 연결하여 제출 시 유효성 검사 실행 */}
          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ width: '100%' }}>

            {/* 1. 이메일 입력 (정규식 패턴 검사 포함) */}
            <TextField
              margin="normal"
              required
              fullWidth
              label="Email Address"
              // [유효성 검사 등록]
              {...register("email", {
                required: "이메일은 필수입니다.", // 필수 값 체크
                // pattern: 정규표현식(RegEx)을 사용해 이메일 형식인지 검사
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                  message: "올바른 이메일 형식이 아닙니다." // 형식이 틀렸을 때 보여줄 메시지
                }
              })}
              error={!!errors.email} // 에러 객체에 email 키가 있으면 true -> 빨간 테두리
              helperText={errors.email?.message} // 에러 메시지 출력
            />

            {/* 2. 비밀번호 입력 (명세서 기준: 최소 8자) */}
            <TextField
              margin="normal"
              required
              fullWidth
              label="Password"
              type="password" // 입력값 가림 처리
              {...register("password", {
                required: "비밀번호를 입력해주세요.",
                // minLength: 최소 글자 수 제한
                minLength: { value: 8, message: "비밀번호는 최소 8자 이상이어야 합니다." }
              })}
              error={!!errors.password}
              helperText={errors.password?.message}
            />

            {/* 3. 비밀번호 확인 (프론트엔드 전용 검증) */}
            <TextField
              margin="normal"
              required
              fullWidth
              label="Confirm Password"
              type="password"
              {...register("confirmPassword", {
                required: "비밀번호 확인을 입력해주세요.",
                // validate: 커스텀 검증 함수
                // value는 현재 이 필드(confirmPassword)에 입력된 값
                // password는 위에서 watch("password")로 가져온 원래 비밀번호 값
                validate: (value) => value === password || "비밀번호가 일치하지 않습니다."
              })}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
            />

            {/* 4. 이름 입력 */}
            <TextField
              margin="normal"
              required
              fullWidth
              label="Name"
              {...register("name", { required: "이름을 입력해주세요." })}
              error={!!errors.name}
              helperText={errors.name?.message}
            />

            {/* 5. 휴대폰 번호 입력 */}
            <TextField
              margin="normal"
              required
              fullWidth
              label="Phone Number"
              placeholder="010-0000-0000" // 사용자에게 입력 형식을 힌트로 줌
              {...register("phone", { required: "휴대폰 번호를 입력해주세요." })}
              error={!!errors.phone}
              helperText={errors.phone?.message}
            />

            {/* 6. 주소 입력 */}
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
              variant="contained" // 채워진 버튼 스타일
              size="large"
              sx={{ mt: 3, mb: 2, py: 1.5, fontWeight: 'bold', borderRadius: 2 }}
            >
              Sign Up
            </Button>

            {/* 하단 링크 영역 (로그인 페이지로 이동) */}
            <Stack direction="row" justifyContent="center">
              {/* component={RouterLink}를 사용하여 페이지 전체 새로고침 없이 URL만 변경 */}
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