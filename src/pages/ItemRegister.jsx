import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
//  카카오맵 & 주소검색 라이브러리 추가
import { Map, MapMarker } from 'react-kakao-maps-sdk';
import DaumPostcode from 'react-daum-postcode';

// UI 컴포넌트 import
import {
  Box, Container, Typography, TextField, Button, Paper, Stack, IconButton,
  FormControl, InputLabel, Select, MenuItem, InputAdornment, Dialog, DialogContent
} from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search'; // 검색 아이콘

// 설정 파일 import
import { IS_MOCK_MODE, API_BASE_URL } from '../config';

// 카테고리 목록
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

  // 1. 로그인 체크
  useEffect(() => {
    if (!IS_MOCK_MODE && !isLoggedIn) {
      alert("로그인이 필요한 서비스입니다.");
      navigate('/login');
    }
  }, [isLoggedIn, navigate]);

  // 2. 입력 폼 상태 관리
  const [values, setValues] = useState({
    title: "",
    category: "",
    price: "",
    content: "",
    location: "", // 주소 텍스트
  });

  //  지도 좌표 State (초기값: 강남역)
  const [coords, setCoords] = useState({
    lat: 37.497942,
    lng: 127.027621
  });

  //  주소 검색 모달 상태
  const [openPostcode, setOpenPostcode] = useState(false);

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

  //  주소 검색 완료 핸들러 (Geocoder 사용)
  const handleCompletePostcode = (data) => {
    const fullAddress = data.address; // 선택한 주소

    // 1. 주소 텍스트 업데이트
    setValues({ ...values, location: fullAddress });
    setOpenPostcode(false); // 모달 닫기

    // 2. 주소 -> 좌표 변환 (Geocoder)
    // index.html에 스크립트가 있으므로 window.kakao 사용 가능
    if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
      const geocoder = new window.kakao.maps.services.Geocoder();

      geocoder.addressSearch(fullAddress, (result, status) => {
        if (status === window.kakao.maps.services.Status.OK) {
          const newCoords = {
            lat: Number(result[0].y), // 위도
            lng: Number(result[0].x), // 경도
          };
          setCoords(newCoords); // 지도 이동
        }
      });
    }
  };

  //  지도 클릭 시 마커 이동 (미세 조정)
  const handleMapClick = (_t, mouseEvent) => {
    setCoords({
      lat: mouseEvent.latLng.getLat(),
      lng: mouseEvent.latLng.getLng(),
    });
  };

  // 🚀 [등록] 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!values.title || !values.price || !values.content || !values.category) {
      alert("카테고리를 포함한 모든 정보를 입력해주세요!");
      return;
    }

    if (!imageFile) {
      alert("상품 이미지는 필수입니다!");
      return;
    }

    if (!values.location) {
      alert("거래 장소를 선택해주세요!");
      return;
    }

    // MOCK 모드 처리 (생략 가능하나 유지)
    if (IS_MOCK_MODE) {
      alert("🎉 [테스트 모드] 상품 등록 성공!");
      navigate('/');
      return;
    }

    const token = localStorage.getItem('accessToken');
    if (!token) {
      alert("로그인 정보가 유효하지 않습니다.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("itemImage", imageFile);

      const itemData = {
        title: values.title,
        category: values.category,
        content: values.content,
        price: parseInt(values.price),

        // 실제 데이터 전송
        location: values.location, // 주소 텍스트 (예: 서울 강남구...)
        address: values.location,
        latitude: coords.lat,      // 📍 지도에서 선택한 위도
        longitude: coords.lng      // 📍 지도에서 선택한 경도
      };

      const jsonBlob = new Blob([JSON.stringify(itemData)], { type: "application/json" });
      formData.append("itemData", jsonBlob);

      const response = await fetch(`${API_BASE_URL}/api/items`, {
        method: 'POST',
        headers: {
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
        alert(`등록 실패.. (서버 메시지: ${errText})`);
      }
    } catch (error) {
      console.error("네트워크 에러:", error);
      alert("서버와 연결할 수 없습니다.");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4, pb: 10 }}>
      {/* 헤더 */}
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

          {/* 1. 이미지 업로드 */}
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

          {/* 2. 입력 필드 */}
          <Stack spacing={3}>
            <TextField
              label="글 제목"
              name="title"
              fullWidth
              required
              value={values.title}
              onChange={handleChange}
              placeholder="예: 맥북 프로 M3 빌려드려요"
            />

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

            {/*  [지도 섹션] 주소 검색 및 지도 표시 */}
            <Box>
              {/* 1. 주소 표시 인풋 (클릭해도 검색됨) */}
              <TextField
                label="거래 희망 장소"
                name="location"
                fullWidth
                required
                value={values.location}
                InputProps={{
                  readOnly: true, // 직접 입력 방지
                }}
                placeholder="주소 검색 버튼을 눌러주세요"
                onClick={() => setOpenPostcode(true)} // 인풋 클릭해도 검색창 열림
                sx={{ mb: 1, cursor: 'pointer' }}
              />

              {/* 2. 주소 찾기 버튼 (⭐ 한 줄 꽉 차게 변경!) */}
              <Button
                variant="outlined"
                fullWidth
                onClick={() => setOpenPostcode(true)}
                startIcon={<SearchIcon />}
                sx={{ mb: 2, py: 1.5, fontWeight: 'bold', borderRadius: 2 }}
              >
                주소 검색하기
              </Button>

              {/* 3. 지도 컴포넌트 */}
              <Box sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid #ddd' }}>
                <Map
                  center={coords}
                  style={{ width: "100%", height: "250px" }}
                  level={3}
                  onClick={handleMapClick}
                >
                  <MapMarker position={coords}>
                    <div style={{ padding: "5px", color: "#000", fontSize: '12px' }}>
                      거래 위치📍
                    </div>
                  </MapMarker>
                </Map>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                * 지도상의 위치를 클릭하면 거래 좌표를 미세 조정할 수 있습니다.
              </Typography>
            </Box>

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

        {/*  [주소 검색 모달] DaumPostcode */}
        <Dialog
          open={openPostcode}
          onClose={() => setOpenPostcode(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogContent sx={{ p: 0, height: '500px' }}>
            <DaumPostcode
              onComplete={handleCompletePostcode}
              style={{ height: '100%' }}
            />
          </DialogContent>
        </Dialog>

      </Paper>
    </Container>
  );
}