import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, TextField, Button, Paper, Stack, IconButton
} from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { IS_MOCK_MODE, API_BASE_URL } from '../config';

export default function ItemRegister({ isLoggedIn }) {
  const navigate = useNavigate();

  // 1. 로그인 체크 (테스트 모드일 때는 로그인 안 해도 넘어가게 할 수도 있음)
  useEffect(() => {
    if (!IS_MOCK_MODE && !isLoggedIn) {
      alert("로그인이 필요한 서비스입니다.");
      navigate('/login');
    }
  }, [isLoggedIn, navigate]);

  const [values, setValues] = useState({
    title: "",
    price: "",
    location: "서울 강남구",
    content: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues({ ...values, [name]: value });
  };

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

    if (!values.title || !values.price || !values.content) {
      alert("모든 정보를 입력해주세요!");
      return;
    }

    // 🚩 [A] MOCK 모드 (나 혼자 테스트)
    if (IS_MOCK_MODE) {
      console.log("🧪 [Mock Mode] 전송 데이터 확인:");
      console.log("- 텍스트:", values);
      console.log("- 이미지 파일:", imageFile ? imageFile.name : "없음");

      setTimeout(() => {
        alert("🎉 [테스트 모드] 상품 등록 성공! (실제 저장은 안 됨)");
        navigate('/');
      }, 500);
      return;
    }

    // 🚩 [B] REAL 모드 (휘님 서버랑 통신)
    if (!imageFile) {
      alert("상품 이미지는 필수입니다!");
      return;
    }
    // ⭐  ⭐
    // (로그인할 때 저장한 이름이 'accessToken'인지 'token'인지 확인하세요. 보통 accessToken입니다.)
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');


    if (!token) {
      alert("로그인 정보가 없습니다. 다시 로그인해주세요.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("itemImage", imageFile);

      const itemData = {
        title: values.title,
        content: values.content,
        price: parseInt(values.price),
        location: values.location
      };

      const jsonBlob = new Blob([JSON.stringify(itemData)], { type: "application/json" });
      formData.append("itemData", jsonBlob);


      const response = await fetch('/api/items', {
        method: 'POST',
        headers: {
          // 👇 토큰값
          'Authorization': `Bearer ${token}`,
          "ngrok-skip-browser-warning": "69420",
        },
        body: formData,
      });

      if (response.ok) {
        alert("🎉 상품 등록 성공!");
        navigate('/');
      } else {
        const errText = await response.text();
        console.error("서버 에러:", errText);
        alert(`등록 실패.. (서버: ${errText})`);
      }
    } catch (error) {
      console.error("네트워크 에러:", error);
      alert("서버와 연결할 수 없습니다.");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 5 }}>
      <Stack direction="row" alignItems="center" sx={{ mb: 3 }}>
        <IconButton onClick={() => navigate(-1)}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" sx={{ fontWeight: 'bold', ml: 1 }}>
          내 물건 빌려주기
        </Typography>
      </Stack>

      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
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
                  sx={{ width: '100%', maxHeight: '300px', objectFit: 'cover', borderRadius: 2, cursor: 'pointer' }}
                />
              ) : (
                <Box sx={{
                  width: '100%', height: '200px', bgcolor: '#f0f0f0', borderRadius: 2,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', border: '2px dashed #ccc'
                }}>
                  <PhotoCamera sx={{ fontSize: 50, color: '#aaa' }} />
                  <Typography color="text.secondary" sx={{ mt: 1 }}>
                    사진을 등록해주세요
                  </Typography>
                </Box>
              )}
            </label>
          </Box>

          <Stack spacing={3}>
            <TextField label="글 제목" name="title" fullWidth required value={values.title} onChange={handleChange} />
            <Stack direction="row" spacing={2}>
              <TextField label="가격 (1일 기준)" name="price" type="number" fullWidth required value={values.price} onChange={handleChange} />
              <TextField label="거래 희망 장소" name="location" fullWidth required value={values.location} onChange={handleChange} />
            </Stack>
            <TextField label="자세한 설명" name="content" multiline rows={5} fullWidth required value={values.content} onChange={handleChange} />

            <Button type="submit" variant="contained" size="large" sx={{ py: 1.5, fontSize: '1.1rem', fontWeight: 'bold' }}>
              등록 완료
            </Button>
          </Stack>
        </Box>
      </Paper>

      {/* 상태 표시줄 */}
      <Typography variant="caption" sx={{ display: 'block', mt: 2, textAlign: 'center', color: '#999' }}>
        현재 모드: {IS_MOCK_MODE ? "🧪 테스트 모드 (전송 안함)" : "🚀 실전 모드 (서버 전송)"}
      </Typography>

    </Container>
  );
}