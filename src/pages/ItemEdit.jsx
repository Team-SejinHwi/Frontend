import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
//  지도 및 주소 검색 라이브러리 
import { Map, MapMarker } from 'react-kakao-maps-sdk';
import DaumPostcode from 'react-daum-postcode';

// UI 컴포넌트 (Material UI) - 
import {
  Box, Container, Typography, TextField, Button, Paper, Stack, IconButton, CircularProgress,
  FormControl, InputLabel, Select, MenuItem, InputAdornment, Dialog, DialogContent, Divider, Grid
} from '@mui/material';

// 아이콘
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import InfoIcon from '@mui/icons-material/Info';
import ClearIcon from '@mui/icons-material/Clear';

// 설정 및 데이터 import
import { CATEGORIES } from '../constants/categories';
import { API_BASE_URL, IS_MOCK_MODE, TUNNEL_HEADERS } from '../config';
import { mockItems } from '../mocks/mockData';

export default function ItemEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  // =================================================================
  // 1. 상태 관리 (State Management)
  // =================================================================
  const [loading, setLoading] = useState(true);

  // [입력값 상태]
  const [values, setValues] = useState({
    title: "",
    category: "",
    price: "",
    location: "", // 화면 표시용 주소 (전송 시 tradeAddress로 매핑)
    content: "",
  });

  // [지도 및 이미지 상태]
  const [coords, setCoords] = useState({ lat: 37.497942, lng: 127.027621 });
  const [imageFile, setImageFile] = useState(null); // 새로 선택한 이미지 파일
  const [imagePreview, setImagePreview] = useState(null); // 기존 혹은 새 미리보기
  const [openPostcode, setOpenPostcode] = useState(false);

  // =================================================================
  // 2. 기존 데이터 불러오기 (Fetch Initial Data)
  // =================================================================
  useEffect(() => {
    const fetchItem = async () => {
      try {
        // [A] Mock 모드 처리
        if (IS_MOCK_MODE) {
          const item = mockItems.find(i => i.itemId === parseInt(id));
          if (item) {
            setValues({
              title: item.title,
              category: item.category,
              price: item.price,
              location: item.tradeAddress || item.location || "",
              content: item.content
            });
            setCoords({ lat: item.tradeLatitude, lng: item.tradeLongitude });
            setImagePreview(item.itemImageUrl);
          }
          setLoading(false);
          return;
        }

        // [B] Real 모드 처리
        const response = await fetch(`${API_BASE_URL}/api/items/${id}`, {
          headers: { ...TUNNEL_HEADERS }
        });
        
        if (response.ok) {
          const result = await response.json();
          const item = result.data || result;

          setValues({
            title: item.title,
            category: item.category,
            price: item.price,
            location: item.tradeAddress || "",
            content: item.content
          });
          setCoords({ lat: item.tradeLatitude, lng: item.tradeLongitude });

          // 이미지 경로 처리
          const fullImgUrl = item.itemImageUrl.startsWith("http")
            ? item.itemImageUrl
            : `${API_BASE_URL}${item.itemImageUrl}`;
          setImagePreview(fullImgUrl);
        }
      } catch (error) {
        console.error("데이터 로드 실패:", error);
        alert("상품 정보를 불러오는데 실패했습니다.");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id, navigate]);

  // =================================================================
  // 3. 핸들러 (Event Handlers)
  // =================================================================

  // 입력값 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues({ ...values, [name]: value });
  };

  // 이미지 변경 핸들러
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // 주소 검색 완료 (Daum Postcode)
  const handleCompletePostcode = (data) => {
    let fullAddress = data.address;
    let extraAddress = '';

    if (data.addressType === 'R') {
      if (data.bname !== '') extraAddress += data.bname;
      if (data.buildingName !== '') extraAddress += (extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName);
      fullAddress += (extraAddress !== '' ? ` (${extraAddress})` : '');
    }

    setValues({ ...values, location: fullAddress });
    setOpenPostcode(false);

    // 주소 -> 좌표 변환
    const geocoder = new window.kakao.maps.services.Geocoder();
    geocoder.addressSearch(fullAddress, (result, status) => {
      if (status === window.kakao.maps.services.Status.OK) {
        setCoords({
          lat: parseFloat(result[0].y),
          lng: parseFloat(result[0].x)
        });
      }
    });
  };

  // 지도 클릭 핸들러
  const handleMapClick = (_t, mouseEvent) => {
    setCoords({
      lat: mouseEvent.latLng.getLat(),
      lng: mouseEvent.latLng.getLng(),
    });
  };

  // 폼 제출 (PATCH /api/items/{id})
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (IS_MOCK_MODE) {
      alert("[Mock] 수정이 완료되었습니다!");
      navigate(`/items/${id}`);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', values.title);
      formData.append('category', values.category);
      formData.append('price', parseInt(values.price));
      formData.append('content', values.content);

      // ★ [UPDATE v.02.05] 명세서 필드명 매칭: tradeAddress
      formData.append('tradeAddress', values.location);
      formData.append('tradeLatitude', coords.lat);
      formData.append('tradeLongitude', coords.lng);

      // ★ [UPDATE v.02.05] 이미지를 새로 변경했을 때만 FormData에 추가 (Optional)
      if (imageFile) {
        formData.append('itemImage', imageFile);
      }

      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_BASE_URL}/api/items/${id}`, {
        method: 'PATCH', // v.02.05 명세 준수: 수정은 PATCH 메서드 사용
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      if (response.ok) {
        alert("물품 정보가 성공적으로 수정되었습니다.");
        navigate(`/items/${id}`);
      } else {
        const errorData = await response.json();
        alert(errorData.message || "수정 실패");
      }
    } catch (error) {
      console.error("수정 에러:", error);
      alert("서버 통신 중 오류가 발생했습니다.");
    }
  };

  // =================================================================
  // 4. UI 렌더링 (기존 354줄의 UI 로직 복구)
  // =================================================================
  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <CircularProgress />
    </Box>
  );

  return (
    <Container maxWidth="sm" sx={{ py: 5 }}>

      {/* 상단 헤더 */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 2, bgcolor: '#fff', boxShadow: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" fontWeight="900" sx={{ letterSpacing: '-0.5px' }}>
          물품 정보 수정
        </Typography>
      </Box>

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Paper
          elevation={0}
          sx={{
            p: 4,
            border: '1px solid #eaeaea',
            borderRadius: 4,
            bgcolor: '#ffffff',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
          }}
        >
          <Stack spacing={4}>

            {/* 📸 이미지 수정 섹션 */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 'bold' }}>물품 사진 변경</Typography>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="edit-image-upload"
                type="file"
                onChange={handleImageChange}
              />
              <label htmlFor="edit-image-upload">
                <Box sx={{
                  width: '100%',
                  height: 240,
                  bgcolor: '#f8f9fa',
                  borderRadius: 3,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: '2px dashed #dee2e6',
                  '&:hover': { borderColor: 'primary.main' }
                }}>
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  ) : (
                    <Stack alignItems="center" color="text.secondary">
                      <PhotoCamera sx={{ fontSize: 40, mb: 1 }} />
                      <Typography variant="body2">사진 변경하기</Typography>
                    </Stack>
                  )}
                </Box>
              </label>
            </Box>

            <Divider />

            {/* 기본 입력 필드들 */}
            <Stack spacing={3}>
              <TextField
                label="물품 제목"
                name="title"
                fullWidth
                required
                value={values.title}
                onChange={handleChange}
              />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>카테고리</InputLabel>
                    <Select name="category" value={values.category} label="카테고리" onChange={handleChange}>
                      {CATEGORIES.map((cat) => (
                        <MenuItem key={cat.value} value={cat.value}>{cat.label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="대여료 (시간당)"
                    name="price"
                    type="number"
                    fullWidth
                    required
                    value={values.price}
                    onChange={handleChange}
                    InputProps={{ endAdornment: <InputAdornment position="end">원</InputAdornment> }}
                  />
                </Grid>
              </Grid>
            </Stack>

            <Divider />

            {/* 📍 거래 위치 수정 섹션 */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>📍 거래 희망 장소 변경</Typography>
              <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  value={values.location}
                  readOnly
                  sx={{ bgcolor: '#f1f3f5' }}
                />
                <Button
                  variant="contained"
                  disableElevation
                  startIcon={<SearchIcon />}
                  onClick={() => setOpenPostcode(true)}
                  sx={{ whiteSpace: 'nowrap', px: 3 }}
                >
                  주소 검색
                </Button>
              </Stack>

              <Box sx={{
                width: '100%',
                height: '220px',
                borderRadius: 3,
                overflow: 'hidden',
                border: '1px solid #dee2e6',
                position: 'relative'
              }}>
                <Map
                  center={coords}
                  style={{ width: "100%", height: "100%" }}
                  level={3}
                  onClick={handleMapClick}
                >
                  <MapMarker position={coords}>
                    <div style={{ padding: "5px", color: "#000", fontSize: '12px' }}>거래 위치📍</div>
                  </MapMarker>
                </Map>
                <Box sx={{
                  position: 'absolute', bottom: 10, left: 10, zIndex: 10,
                  bgcolor: 'rgba(255,255,255,0.9)', p: '4px 8px', borderRadius: 1, border: '1px solid #ddd'
                }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                    <InfoIcon sx={{ fontSize: 12, mr: 0.5 }} /> 지도를 클릭하여 핀을 이동시킬 수 있습니다.
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Divider />

            <TextField
              label="자세한 설명"
              name="content"
              multiline
              rows={6}
              fullWidth
              required
              value={values.content}
              onChange={handleChange}
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              sx={{
                py: 2,
                fontSize: '1.1rem',
                fontWeight: '900',
                borderRadius: 3,
                boxShadow: '0 8px 16px rgba(25, 118, 210, 0.2)'
              }}
            >
              수정 완료하기
            </Button>
          </Stack>
        </Paper>
      </Box>

      {/* 주소 검색 모달 */}
      <Dialog
        open={openPostcode}
        onClose={() => setOpenPostcode(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight="bold">주소 변경</Typography>
          <IconButton onClick={() => setOpenPostcode(false)}><ClearIcon /></IconButton>
        </Box>
        <DialogContent sx={{ p: 0, height: '500px' }}>
          <DaumPostcode onComplete={handleCompletePostcode} style={{ height: '100%' }} />
        </DialogContent>
      </Dialog>
    </Container>
  );
}
