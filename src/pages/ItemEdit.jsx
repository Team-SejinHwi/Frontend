import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
// UI 컴포넌트: 화면 디자인을 위한 MUI 라이브러리
import {
  Box, Container, Typography, TextField, Button, Paper, Stack, IconButton, CircularProgress,
  FormControl, InputLabel, Select, MenuItem, InputAdornment
} from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// 설정 파일 및 가짜 데이터 (테스트용)
import { IS_MOCK_MODE, API_BASE_URL } from '../config';
import { mockItems } from '../mocks/mockData';

// ✅ 카테고리 목록 (다른 페이지와 통일성을 위해 상수 사용)
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

export default function ItemEdit() {
  // URL에서 수정할 상품의 ID를 가져옵니다. (예: /items/edit/10 -> id = 10)
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true); // 데이터 로딩 상태

  // =================================================================
  // 1. 상태 관리 (입력값 & 이미지)
  // =================================================================
  const [values, setValues] = useState({
    title: "",
    category: "", // [중요] 수정 시에도 카테고리는 필수입니다.
    price: "",
    location: "",
    content: "",
  });

  // 이미지 상태 관리
  // imageFile: 새로 업로드할 파일 객체 (전송용)
  // previewUrl: 화면에 보여줄 이미지 경로 (기존 이미지 URL 또는 새 파일 미리보기)
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // =================================================================
  // 2. 기존 데이터 불러오기 (Read - GET)
  // =================================================================
  useEffect(() => {
    const loadData = async () => {
      try {
        // [A] Mock 모드 (테스트용 데이터 로드)
        if (IS_MOCK_MODE) {
          const found = mockItems.find(item => item.itemId === parseInt(id));
          if (found) {
            setValues({
              title: found.title,
              category: found.category || "",
              price: found.price,
              location: found.location,
              content: found.content || "",
            });
            setPreviewUrl(found.itemImageUrl);
          }
          setLoading(false);
          return;
        }

        // [B] Real 모드 (서버에서 데이터 가져오기)
        // GET /api/items/{id}
        const response = await fetch(`${API_BASE_URL}/api/items/${id}`, {
          headers: { "ngrok-skip-browser-warning": "69420" }
        });

        if (response.ok) {
          const result = await response.json();
          // 백엔드 응답 구조({ data: ... } 또는 바로 객체)에 맞춰 데이터 추출
          const item = result.data || result;

          // 받아온 데이터를 state에 채워넣어 화면에 표시
          setValues({
            title: item.title,
            category: item.category || "", // 기존 카테고리 선택
            price: item.price,
            location: item.location,
            content: item.content,
          });

          // 이미지 URL 처리 (http가 없으면 서버 주소 붙여주기)
          const imgUrl = item.itemImageUrl;
          if (imgUrl) {
            setPreviewUrl(imgUrl.startsWith('http') ? imgUrl : `${API_BASE_URL}${imgUrl}`);
          }
        } else {
          alert("데이터를 불러오지 못했습니다.");
          navigate(-1); // 뒤로 가기
        }
      } catch (error) {
        console.error("Load Error:", error);
      } finally {
        setLoading(false); // 로딩 끝
      }
    };

    loadData();
  }, [id, navigate]);

  // 입력값 변경 핸들러 (텍스트 필드용)
  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues({ ...values, [name]: value });
  };

  // 이미지 변경 핸들러 (파일 업로드)
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file); // 1. 전송할 파일 저장
      setPreviewUrl(URL.createObjectURL(file)); // 2. 미리보기 URL 생성 (즉시 화면 반영)
    }
  };

  // =================================================================
  // 3. 수정 요청 핸들러 (Update - PUT)
  // =================================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 유효성 검사: 빈 값이 있는지 확인
    if (!values.title || !values.price || !values.content || !values.category) {
      alert("카테고리를 포함한 모든 정보를 입력해주세요!");
      return;
    }

    // [A] Mock 모드
    if (IS_MOCK_MODE) {
      alert("🎉 [테스트] 수정이 완료되었습니다!");
      navigate(`/items/${id}`);
      return;
    }

    // [B] Real 모드 (서버로 전송)
    try {
      const token = localStorage.getItem('accessToken');
      const formData = new FormData(); // Multipart 전송을 위한 객체

      // 1. JSON 데이터 포장 (API v.01.30 규격)
      const itemData = {
        title: values.title,
        category: values.category, // 수정된 카테고리
        content: values.content,
        price: parseInt(values.price),
        location: values.location,
        address: values.location, // 주소 정보 동기화
        // [임시 좌표] 실제 서비스에선 지도 API(Kakao Map 등)에서 받아온 값을 넣어야 합니다.
        latitude: 37.497942,
        longitude: 127.027621
      };

      // JSON을 Blob으로 변환하여 formData에 추가 (Content-Type: application/json 명시)
      const jsonBlob = new Blob([JSON.stringify(itemData)], { type: "application/json" });
      formData.append("itemData", jsonBlob);

      // 2. 이미지 파일 처리 (선택 사항)
      // 사용자가 새 이미지를 올렸을 때만 'itemImage' 키로 파일을 보냅니다.
      // 파일을 보내지 않으면 백엔드는 "이미지 변경 없음"으로 처리합니다.
      if (imageFile) {
        formData.append("itemImage", imageFile);
      }

      console.log("📡 상품 수정 요청(PUT) 전송...");

      // PUT /api/items/{id}
      const response = await fetch(`${API_BASE_URL}/api/items/${id}`, {
        method: 'PUT',
        headers: {
          "Authorization": `Bearer ${token}`, // 내 글 수정 권한 확인용 토큰
          "ngrok-skip-browser-warning": "69420",
          // 🚨 주의: Content-Type 헤더는 브라우저가 자동으로 'multipart/form-data'로 설정하므로 직접 적지 않습니다.
        },
        body: formData,
      });

      if (response.ok) {
        alert("🎉 게시물이 수정되었습니다.");
        navigate(`/items/${id}`); // 수정 완료 후 상세 페이지로 이동
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
      {/* 상단 헤더 & 뒤로가기 버튼 */}
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
          
          {/* --- 1. 이미지 수정 영역 --- */}
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
                    sx={{ 
                      width: '100%', maxHeight: '300px', objectFit: 'cover', 
                      borderRadius: 2, cursor: 'pointer', 
                      opacity: imageFile ? 1 : 0.8 // 새 파일 선택 시 불투명도 조정
                    }}
                  />
                  {/* 새 이미지가 아닐 때(기존 이미지일 때) 힌트 텍스트 표시 */}
                  {!imageFile && (
                    <Typography variant="caption" sx={{ 
                      position: 'absolute', bottom: 10, left: 0, right: 0, 
                      color: 'white', bgcolor: 'rgba(0,0,0,0.5)', py: 0.5 
                    }}>
                      이미지를 변경하려면 클릭하세요
                    </Typography>
                  )}
                </Box>
              ) : (
                // 이미지가 없는 경우 (에러 상황 등)
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

          {/* --- 2. 텍스트 정보 수정 영역 --- */}
          <Stack spacing={3}>
            {/* 제목 */}
            <TextField label="글 제목" name="title" fullWidth required value={values.title} onChange={handleChange} />

            {/* 카테고리 선택 (필수) */}
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

            {/* 가격 */}
            <Stack direction="row" spacing={2}>
              <TextField
                label="가격 (1시간 기준)"
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

            {/* 거래 장소 */}
            <TextField
              label="거래 희망 장소"
              name="location"
              fullWidth
              required
              value={values.location}
              onChange={handleChange}
              helperText="* 지도 좌표는 초기값(강남역)으로 저장됩니다."
            />

            {/* 내용 */}
            <TextField label="자세한 설명" name="content" multiline rows={5} fullWidth required value={values.content} onChange={handleChange} />

            {/* 수정 완료 버튼 */}
            <Button type="submit" variant="contained" size="large" sx={{ py: 1.5, fontSize: '1.1rem', fontWeight: 'bold' }}>
              수정 완료
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
}