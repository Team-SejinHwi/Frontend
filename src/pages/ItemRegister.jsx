import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// UI 컴포넌트 import
import {
  Box, Container, Typography, TextField, Button, Paper, Stack, IconButton,
  FormControl, InputLabel, Select, MenuItem, InputAdornment
} from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
//설정 파일 import
import { IS_MOCK_MODE, API_BASE_URL } from '../config';

// ✅ 카테고리 목록 (Home.jsx와 동일하게 맞춤)
const CATEGORIES = [
  { label: '디지털/가전', value: 'DIGITAL' },
  { label: '가구/인테리어', value: 'FURNITURE' },
  { label: '유아동', value: 'BABY' },
  { label: '생활/가공식품', value: 'LIFE' },
  { label: '스포츠/레저', value: 'SPORTS' },
  { label: '여성잡화', value: 'WOMAN' },
  { label: '남성잡화', value: 'MAN' },
  { label: '게임/취미', value: 'GAME' },
  { label: '뷰티/미용', value: 'BEAUTY' },
  { label: '반려동물용품', value: 'PET' },
  { label: '도서/티켓/음반', value: 'BOOK' },
  { label: '기타', value: 'ETC' },
];

export default function ItemRegister({ isLoggedIn }) {
  const navigate = useNavigate();

  // 1. 로그인 체크 (테스트 모드일 때는 로그인 안 해도 넘어가게 할 수도 있음)
  useEffect(() => {
    if (!IS_MOCK_MODE && !isLoggedIn) {
      alert("로그인이 필요한 서비스입니다.");
      navigate('/login');
    }
  }, [isLoggedIn, navigate]);

  // 2. 입력 폼 상태 관리
  const [values, setValues] = useState({
    title: "",
    category: "", // [NEW] 카테고리 필수
    price: "",
    location: "서울 강남구 강남대로 396", // 기본 주소
    content: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues({ ...values, [name]: value });
  };

  //이미지 파일 선택 핸들러
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // 🚀 [등록] 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 유효성 검사
    if (!values.title || !values.price || !values.content || !values.category) {
      alert("카테고리를 포함한 모든 정보를 입력해주세요!");
      return;
    }

    if (!imageFile) {
      alert("상품 이미지는 필수입니다!");
      return;
    }

    // 🚩 [A] MOCK 모드
    if (IS_MOCK_MODE) {
      console.log("🧪 [Mock Mode] 전송 데이터 확인:", values);
      setTimeout(() => {
        alert("🎉 [테스트 모드] 상품 등록 성공!");
        navigate('/');
      }, 500);
      return;
    }

    // ⭐⭐🚩 [B] REAL 모드 (서버 전송)
    const token = localStorage.getItem('accessToken');
    if (!token) {
      alert("로그인 정보가 유효하지 않습니다.");
      return;
    }

    try {
      const formData = new FormData();

      // 1. 이미지 파일 추가 (Key: itemImage)
      formData.append("itemImage", imageFile);

      // 2. JSON 데이터 생성 (Key: itemData)
      const itemData = {
        title: values.title,
        category: values.category, // [NEW] 카테고리
        content: values.content,
        price: parseInt(values.price),
        location: values.location,
        address: values.location, // 주소와 위치 동일하게 처리
        // [임시] 지도 좌표 (강남역 부근) - 나중에 지도 API 붙이면 동적으로 변경
        latitude: 37.497942,
        longitude: 127.027621
      };

      // 3. JSON을 Blob으로 변환하여 추가 (Content-Type 지정 필수)
      const jsonBlob = new Blob([JSON.stringify(itemData)], { type: "application/json" });
      formData.append("itemData", jsonBlob);

      console.log("📡 상품 등록 요청 보냄...");

      const response = await fetch(`${API_BASE_URL}/api/items`, {
        method: 'POST',
        headers: {
          // 👇 토큰값
          'Authorization': `Bearer ${token}`,
          "ngrok-skip-browser-warning": "69420",
          // 주의: multipart/form-data는 Content-Type 헤더를 직접 설정하면 안 됨 (브라우저가 자동 설정)
        },
        body: formData,
      });

      if (response.ok) {
        alert("🎉 상품 등록 성공!");
        navigate('/');
      } else {
        const errText = await response.text();
        console.error("서버 에러:", errText);
        alert(`등록 실패.. (서버 메시지: ${errText})`);
      }
    } catch (error) {
      console.error("네트워크 에러:", error);
      alert("서버와 연결할 수 없습니다.");
    }
  };
  return (
    <Container maxWidth="sm" sx={{ py: 4, pb: 10 }}>
      {/* 상단 헤더 */}
      <Stack direction="row" alignItems="center" sx={{ mb: 3 }}>
        <IconButton onClick={() => navigate(-1)}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" sx={{ fontWeight: 'bold', ml: 1 }}>
          내 물건 빌려주기
        </Typography>
      </Stack>

      <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>

          {/* 1. 이미지 업로드 영역 */}
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="upload-button"
              type="file"
              onChange={handleImageChange}
            />
            <label htmlFor="upload-button">
              {previewUrl ? (
                <Box
                  component="img"
                  src={previewUrl}
                  sx={{
                    width: '100%', maxHeight: '300px', objectFit: 'cover',
                    borderRadius: 2, cursor: 'pointer', border: '1px solid #ddd'
                  }}
                />
              ) : (
                <Box sx={{
                  width: '100%', height: '200px', bgcolor: '#f8f9fa', borderRadius: 2,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', border: '2px dashed #ccc', '&:hover': { bgcolor: '#f0f0f0' }
                }}>
                  <PhotoCamera sx={{ fontSize: 50, color: '#aaa' }} />
                  <Typography color="text.secondary" sx={{ mt: 1, fontWeight: 'bold' }}>
                    대표 사진을 등록해주세요
                  </Typography>
                </Box>
              )}
            </label>
          </Box>

          {/* 2. 입력 필드 영역 */}
          <Stack spacing={3}>
            {/* 제목 */}
            <TextField
              label="글 제목"
              name="title"
              fullWidth
              required
              value={values.title}
              onChange={handleChange}
              placeholder="예: 맥북 프로 M3 빌려드려요"
            />

            {/* 카테고리 (필수) */}
            <FormControl fullWidth required>
              <InputLabel>카테고리</InputLabel>
              <Select
                name="category"
                value={values.category}
                label="카테고리"
                onChange={handleChange}
              >
                {CATEGORIES.map((cat) => (
                  <MenuItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* 가격 및 장소 */}
            <Stack direction="row" spacing={2}>
              <TextField
                label="시간당 가격"
                name="price"
                type="number"
                fullWidth
                required
                value={values.price}
                onChange={handleChange}
                InputProps={{
                  endAdornment: <InputAdornment position="end">원</InputAdornment>,
                }}
              />
            </Stack>

            <TextField
              label="거래 희망 장소"
              name="location"
              fullWidth
              required
              value={values.location}
              onChange={handleChange}
              helperText="* 실제 지도 좌표는 강남역으로 고정됩니다 (추후 업데이트 예정)"
            />

            {/* 내용 */}
            <TextField
              label="자세한 설명"
              name="content"
              multiline
              rows={6}
              fullWidth
              required
              value={values.content}
              onChange={handleChange}
              placeholder="물건의 상태, 거래 가능한 시간 등을 자세히 적어주세요."
            />

            {/* 등록 버튼 */}
            <Button
              type="submit"
              variant="contained"
              size="large"
              sx={{ py: 1.5, fontSize: '1.1rem', fontWeight: 'bold', borderRadius: 2 }}
            >
              등록 완료
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
}