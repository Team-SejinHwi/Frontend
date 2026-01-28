import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Box, Container, Typography, TextField, Button, Paper, Stack, IconButton, CircularProgress 
} from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { IS_MOCK_MODE, API_BASE_URL } from '../config';
import { mockItems } from '../mocks/mockData'; // Mock 테스트용

export default function ItemEdit() {
  const { id } = useParams(); // URL에서 수정할 상품 ID 가져오기
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // 입력값 상태
  const [values, setValues] = useState({
    title: "",
    price: "",
    location: "", 
    content: "",
  });

  // 이미지 상태 (기존 이미지 URL vs 새로 올린 파일)
  const [imageFile, setImageFile] = useState(null); // 새로 올린 파일
  const [previewUrl, setPreviewUrl] = useState(null); // 화면에 보여줄 이미지 (기존 or 새거)

  // 1️⃣ [초기화] 기존 데이터 불러오기 (Read)
  useEffect(() => {
    const loadData = async () => {
      try {
        // [A] Mock 모드
        if (IS_MOCK_MODE) {
          const found = mockItems.find(item => item.itemId === parseInt(id));
          if (found) {
            setValues({
              title: found.title,
              price: found.price,
              location: found.location,
              content: found.content || "", // mock에 content가 없을 수도 있어서 방어코드
            });
            setPreviewUrl(found.itemImageUrl);
          }
          setLoading(false);
          return;
        }

        // [B] Real 모드 (서버 통신)
        const response = await fetch(`${API_BASE_URL}/api/items/${id}`, {
          headers: { "ngrok-skip-browser-warning": "69420" }
        });

        if (response.ok) {
          const result = await response.json();
          const item = result.data || result; // 응답 구조에 따라 조정
          
          setValues({
            title: item.title,
            price: item.price,
            location: item.location,
            content: item.content,
          });

          // 기존 이미지 URL 처리 (http 없으면 붙여주기)
          const imgUrl = item.itemImageUrl;
          if (imgUrl) {
            setPreviewUrl(imgUrl.startsWith('http') ? imgUrl : `${API_BASE_URL}${imgUrl}`);
          }
        } else {
          alert("데이터를 불러오지 못했습니다.");
          navigate(-1);
        }
      } catch (error) {
        console.error("Load Error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues({ ...values, [name]: value });
  };

  // 이미지 변경 시 (미리보기 즉시 교체)
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file); // 파일 객체 저장 (전송용)
      setPreviewUrl(URL.createObjectURL(file)); // 미리보기 URL 생성
    }
  };

  // 🚀 [수정] 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!values.title || !values.price || !values.content) {
      alert("모든 정보를 입력해주세요!");
      return;
    }

    // [A] MOCK 모드
    if (IS_MOCK_MODE) {
      alert("🎉 [테스트] 수정이 완료되었습니다!");
      navigate(`/items/${id}`);
      return;
    }

    // [B] REAL 모드 (PUT 요청)
    try {


      // const token = localStorage.getItem('accessToken');
      const formData = new FormData();

      // 1. JSON 데이터 (필수)
      const itemData = {
        title: values.title,
        content: values.content,
        price: parseInt(values.price),
        location: values.location
      };
      const jsonBlob = new Blob([JSON.stringify(itemData)], { type: "application/json" });
      formData.append("itemData", jsonBlob);

      // 2. 이미지 파일 (선택)
      // ⚠️ 중요: 새로 올린 파일이 있을 때만 append 합니다.
      // (append 안 하면 백엔드에서 null로 인식하여 기존 이미지 유지)
      if (imageFile) {
        formData.append("itemImage", imageFile);
      }

      const response = await fetch(`${API_BASE_URL}/api/items/${id}`, { 
        method: 'PUT', // 👈 POST에서 PUT으로 변경

        // 🔥 [핵심 추가] 쿠키(JSESSIONID)를 백엔드로 보내는 옵션, 나중에 제거
        credentials: 'include',

        headers: {
            // "Authorization": `Bearer ${token}`, // 👈 토큰 필수, 나중에 활성화
            "ngrok-skip-browser-warning": "69420",
        },
        body: formData, 
      });

      if (response.ok) {
        alert("🎉 게시물이 수정되었습니다.");
        navigate(`/items/${id}`); // 상세 페이지로 이동
      } else {
        const errText = await response.text();
        alert(`수정 실패: ${errText}`);
      }
    } catch (error) {
      console.error("Update Error:", error);
      alert("서버 오류가 발생했습니다.");
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

  return (
    <Container maxWidth="sm" sx={{ py: 5 }}>
      <Stack direction="row" alignItems="center" sx={{ mb: 3 }}>
        <IconButton onClick={() => navigate(-1)}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" sx={{ fontWeight: 'bold', ml: 1 }}>
          게시물 수정하기
        </Typography>
      </Stack>

      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
          {/* 이미지 업로드 영역 */}
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
                <Box sx={{ position: 'relative' }}>
                    <Box 
                      component="img" 
                      src={previewUrl} 
                      sx={{ width: '100%', maxHeight: '300px', objectFit: 'cover', borderRadius: 2, cursor: 'pointer', opacity: imageFile ? 1 : 0.8 }}
                    />
                    {!imageFile && (
                        <Typography variant="caption" sx={{ position: 'absolute', bottom: 10, left: 0, right: 0, color: 'white', bgcolor: 'rgba(0,0,0,0.5)', py: 0.5 }}>
                            이미지를 변경하려면 클릭하세요
                        </Typography>
                    )}
                </Box>
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
              <TextField label="가격 (1시간 기준)" name="price" type="number" fullWidth required value={values.price} onChange={handleChange} />
              <TextField label="거래 희망 장소" name="location" fullWidth required value={values.location} onChange={handleChange} />
            </Stack>
            <TextField label="자세한 설명" name="content" multiline rows={5} fullWidth required value={values.content} onChange={handleChange} />
            
            <Button type="submit" variant="contained" size="large" sx={{ py: 1.5, fontSize: '1.1rem', fontWeight: 'bold' }}>
              수정 완료
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
}