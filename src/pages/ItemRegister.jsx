import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

//  카카오맵 & 주소검색 라이브러리 추가
import { Map, MapMarker } from 'react-kakao-maps-sdk';
import DaumPostcode from 'react-daum-postcode';

// UI 컴포넌트 import (MUI) - 
import {
  Box, Container, Typography, TextField, Button, Paper, Stack, IconButton,
  FormControl, InputLabel, Select, MenuItem, InputAdornment, Dialog, DialogContent,
  Divider, Grid
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

export default function ItemRegister({ isLoggedIn }) {
  const navigate = useNavigate();

  // =================================================================
  // 1. 초기 권한 체크
  // =================================================================
  useEffect(() => {
    // 실서비스 모드일 때만 로그인 체크 진행
    if (!IS_MOCK_MODE && !isLoggedIn) {
      alert("로그인이 필요한 서비스입니다.");
      navigate('/login');
    }
  }, [isLoggedIn, navigate]);

  // =================================================================
  // 2. 상태 관리 (State Management)
  // =================================================================

  // [입력 폼 상태]
  const [values, setValues] = useState({
    title: "",
    category: "", // v.02.05 필수 선택
    price: "",
    content: "",
    location: "", // 화면 표시용 주소 (전송 시 tradeAddress로 매핑)

  });

  // [지도 및 좌표 상태]
  // coords: 지도의 중심 및 마커 위치 (기본값: 강남역)
  const [coords, setCoords] = useState({
    lat: 37.497942,
    lng: 127.027621
  });

  // [이미지 관련 상태]
  const [imageFile, setImageFile] = useState(null);    // 서버 전송용 파일
  const [imagePreview, setImagePreview] = useState(null); // 화면 미리보기용 URL

  // [기타 UI 상태]
  const [openPostcode, setOpenPostcode] = useState(false); // 주소 검색 모달 제어

  // =================================================================
  // 3. 핸들러 (Event Handlers)
  // =================================================================

  // 텍스트 입력 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues({ ...values, [name]: value });
  };

  // 이미지 파일 선택 핸들러 (미리보기 생성 포함)
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      // FileReader를 이용해 로컬 이미지 경로 생성
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // 주소 검색 완료 핸들러 (Daum Postcode)
  const handleCompletePostcode = (data) => {
    let fullAddress = data.address;
    let extraAddress = '';

    if (data.addressType === 'R') {
      if (data.bname !== '') extraAddress += data.bname;
      if (data.buildingName !== '') extraAddress += (extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName);
      fullAddress += (extraAddress !== '' ? ` (${extraAddress})` : '');
    }

    // 1. 주소 텍스트 업데이트
    setValues({ ...values, location: fullAddress });
    setOpenPostcode(false);

    // 2. 주소를 좌표로 변환 (Kakao Local API Geocoder 활용)
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

  // 지도 클릭 핸들러 (좌표 미세 조정 및 주소 자동 매핑)
  const handleMapClick = (_t, mouseEvent) => {
    const lat = mouseEvent.latLng.getLat();
    const lng = mouseEvent.latLng.getLng();

    // 1. 클릭한 위치로 좌표 업데이트
    setCoords({ lat, lng });

    // 2. 카카오 Geocoder를 이용해 주소 획득
    const geocoder = new window.kakao.maps.services.Geocoder();
    geocoder.coord2Address(lng, lat, (result, status) => {
      if (status === window.kakao.maps.services.Status.OK) {
        const addr = result[0].road_address
          ? result[0].road_address.address_name
          : result[0].address.address_name;

        // 3. 주소 상태값 업데이트
        setValues(prev => ({ ...prev, location: addr }));
      }
    });
  };

  // 폼 제출 핸들러 (POST /api/items)
  const handleSubmit = async (e) => {
    e.preventDefault();

    // --- [v.02.05] 유효성 검사 강화 ---
    if (!values.category) {
      alert("카테고리를 반드시 선택해주세요.");
      return;
    }
    if (!values.title.trim()) {
      alert("물품 제목을 입력해주세요.");
      return;
    }
    if (!values.price || values.price <= 0) {
      alert("유효한 대여료를 입력해주세요.");
      return;
    }
    if (!imageFile && !IS_MOCK_MODE) {
      alert("물품 사진은 최소 1장 이상 등록해야 합니다.");
      return;
    }

    // [A] Mock 모드 처리
    if (IS_MOCK_MODE) {
      console.log("🚀 [Mock] 등록 데이터:", { ...values, coords });
      alert("물품 등록이 완료되었습니다! (테스트 모드)");
      navigate('/');
      return;
    }

    // [B] Real 모드 (API 통신)
    try {
      const formData = new FormData();

      // 1. API 명세서 규격에 맞는 itemData 객체 생성
      const itemDataObj = {
        title: values.title,
        category: values.category,
        content: values.content,
        price: parseInt(values.price),
        location: values.location, // 화면 표시용 주소
        latitude: coords.lat,      // 명세서 필드명: latitude
        longitude: coords.lng,     // 명세서 필드명: longitude
        address: values.location,   // 명세서 필드명: address
        tradeAddress: values.location  // 👈 실제 백엔드 DTO와 일치할 확률이 높은 필드
      };

      // 2. itemData를 JSON Blob으로 변환하여 추가 (Content-Type 설정 필수)
      formData.append(
        'itemData',
        new Blob([JSON.stringify(itemDataObj)], { type: 'application/json' })
      );

      // 3. 이미지 파일 추가
      if (imageFile) {
        formData.append('itemImage', imageFile);
      }

      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_BASE_URL}/api/items`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          ...TUNNEL_HEADERS
          // multipart/form-data는 브라우저가 자동으로 설정하므로 직접 적지 않습니다.
        },
        body: formData,
      });

      // 403 에러 발생 시 JSON이 아닐 수 있으므로 체크 강화
      if (response.ok) {
        alert("물품이 성공적으로 등록되었습니다!");
        navigate('/');
      } else {
        // 에러 응답이 JSON인지 확인 후 처리 (Unexpected end of JSON input 방지)
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          alert(errorData.message || "등록 중 오류가 발생했습니다.");
        } else {
          const errorText = await response.text();
          alert(`에러 발생(${response.status}): ${errorText || "권한이 없거나 서버 내부 오류입니다."}`);
        }
      }
    } catch (error) {
      console.error("등록 에러:", error);
      alert("서버와 통신 중 문제가 발생했습니다.");
    }
  };

  // =================================================================
  // 4. UI 렌더링 (기존 354줄의 UI 로직 복구)
  // =================================================================
  return (
    <Container maxWidth="sm" sx={{ py: 5 }}>

      {/* 상단 헤더 및 뒤로가기 */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 2, bgcolor: '#fff', boxShadow: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" fontWeight="900" sx={{ letterSpacing: '-0.5px' }}>
          새 물품 등록
        </Typography>
      </Box>

      <Box component="form" onSubmit={handleSubmit} noValidate>

        {/* 메인 폼 카드 */}
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

            {/* 📸 이미지 업로드 섹션 */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                물품 사진 등록 <Typography variant="caption" color="error" sx={{ ml: 0.5 }}>*</Typography>
              </Typography>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="item-image-upload"
                type="file"
                onChange={handleImageChange}
              />
              <label htmlFor="item-image-upload">
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
                  transition: '0.2s',
                  '&:hover': { bgcolor: '#f1f3f5', borderColor: 'primary.main' }
                }}>
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <Stack alignItems="center" spacing={1} color="text.secondary">
                      <PhotoCamera sx={{ fontSize: 48, opacity: 0.5 }} />
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>사진을 추가해주세요 (최대 1장)</Typography>
                    </Stack>
                  )}
                </Box>
              </label>
            </Box>

            <Divider />

            {/* 기본 정보 입력 섹션 */}
            <Stack spacing={3}>
              <TextField
                label="물품 제목"
                name="title"
                fullWidth
                required
                placeholder="어떤 물건인가요?"
                value={values.title}
                onChange={handleChange}
                variant="outlined"
              />

              {/* [수정 전: Grid 사용 시 너비 깨짐 발생] */}
              {/* <Grid container spacing={2}>
                <Grid item xs={12} sm={6}> ... </Grid>
                <Grid item xs={12} sm={6}> ... </Grid>
            </Grid> */}

              {/* [수정 후: Stack으로 변경하여 안정적인 5:5 비율 보장] */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <FormControl fullWidth required sx={{ flex: 1 }}>
                  <InputLabel>카테고리</InputLabel>
                  <Select
                    name="category"
                    value={values.category}
                    label="카테고리"
                    onChange={handleChange}
                  >
                    {CATEGORIES.map((cat) => (
                      <MenuItem key={cat.value} value={cat.value}>{cat.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  label="대여료 (시간당)"
                  name="price"
                  type="number"
                  fullWidth
                  required
                  value={values.price}
                  onChange={handleChange}
                  sx={{ flex: 1 }} // 남은 공간을 똑같이 나눠 갖도록 설정
                  InputProps={{
                    endAdornment: <InputAdornment position="end">원</InputAdornment>
                  }}
                />
              </Stack>
            </Stack>

            <Divider />

            {/* 📍 거래 위치 설정 섹션 */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                거래 희망 장소 <Typography variant="caption" color="error" sx={{ ml: 0.5 }}>*</Typography>
              </Typography>

              <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="주소 검색 버튼을 눌러주세요"
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
                  주소 찾기
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
                    <Box sx={{ p: 1, color: "#000" }}>
                      <Typography variant="caption" fontWeight="bold">거래 지점📍</Typography>
                    </Box>
                  </MapMarker>
                </Map>
                <Box sx={{
                  position: 'absolute', bottom: 10, left: 10, zIndex: 10,
                  bgcolor: 'rgba(255,255,255,0.9)', p: '4px 8px', borderRadius: 1, border: '1px solid #ddd'
                }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                    <InfoIcon sx={{ fontSize: 12, mr: 0.5 }} /> 지도를 클릭해 핀 위치를 조정하세요.
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Divider />

            {/* 상세 설명 섹션 */}
            <TextField
              label="상세 설명"
              name="content"
              multiline
              rows={6}
              fullWidth
              required
              value={values.content}
              onChange={handleChange}
              placeholder="물건의 상태(구입 시기, 오염 여부 등)와 거래 가능 시간, 장소에 대해 자세히 적어주세요."
            />

            {/* 제출 버튼 */}
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
              물품 등록하기
            </Button>
          </Stack>
        </Paper>
      </Box>

      {/* [주소 검색 모달] Daum Postcode Dialog */}
      <Dialog
        open={openPostcode}
        onClose={() => setOpenPostcode(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight="bold">주소 검색</Typography>
          <IconButton onClick={() => setOpenPostcode(false)}><ClearIcon /></IconButton>
        </Box>
        <DialogContent sx={{ p: 0, height: '500px' }}>
          <DaumPostcode
            onComplete={handleCompletePostcode}
            style={{ height: '100%' }}
          />
        </DialogContent>
      </Dialog>
    </Container>
  );
}