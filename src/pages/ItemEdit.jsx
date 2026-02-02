import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
//  지도 및 주소 검색 라이브러리 
import { Map, MapMarker } from 'react-kakao-maps-sdk';
import DaumPostcode from 'react-daum-postcode';

// UI 컴포넌트
import {
  Box, Container, Typography, TextField, Button, Paper, Stack, IconButton, CircularProgress,
  FormControl, InputLabel, Select, MenuItem, InputAdornment, Dialog, DialogContent
} from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';

// 설정 및 데이터
import { IS_MOCK_MODE, API_BASE_URL } from '../config';
import { mockItems } from '../mocks/mockData';

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
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // 1. 입력값 상태
  const [values, setValues] = useState({
    title: "",
    category: "",
    price: "",
    location: "", // 주소 텍스트
    content: "",
  });

  //  2. 지도 좌표 상태 (초기값: 강남역)
  const [coords, setCoords] = useState({
    lat: 37.497942,
    lng: 127.027621
  });

  //  3. 주소 검색 모달 상태
  const [openPostcode, setOpenPostcode] = useState(false);

  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // =================================================================
  // 4. 기존 데이터 불러오기
  // =================================================================
  useEffect(() => {
    const loadData = async () => {
      try {
        // [A] Mock 모드
        if (IS_MOCK_MODE) {
          const found = mockItems.find(item => item.itemId === parseInt(id));
          if (found) {
            setValues({
              title: found.title,
              category: found.category || "",
              price: found.price,
              location: found.tradeAddress || found.location, // 저장된 주소 우선 사용
              content: found.content || "",
            });
            setPreviewUrl(found.itemImageUrl);
            
            // 저장된 좌표가 있으면 지도 이동
            if (found.tradeLatitude && found.tradeLongitude) {
                setCoords({ lat: found.tradeLatitude, lng: found.tradeLongitude });
            }
          }
          setLoading(false);
          return;
        }

        // [B] Real 모드
        const response = await fetch(`${API_BASE_URL}/api/items/${id}`, {
          headers: { "ngrok-skip-browser-warning": "69420" }
        });

        if (response.ok) {
          const result = await response.json();
          const item = result.data || result;

          setValues({
            title: item.title,
            category: item.category || "",
            price: item.price,
            location: item.tradeAddress || item.location, // 상세 조회 API의 주소 필드
            content: item.content,
          });

          //  서버에서 받아온 좌표로 지도 설정
          if (item.tradeLatitude && item.tradeLongitude) {
            setCoords({
                lat: item.tradeLatitude,
                lng: item.tradeLongitude
            });
          }

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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  //  주소 검색 완료 핸들러
  const handleCompletePostcode = (data) => {
    const fullAddress = data.address;
    setValues({ ...values, location: fullAddress });
    setOpenPostcode(false);

    // 주소 -> 좌표 변환
    if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
        const geocoder = new window.kakao.maps.services.Geocoder();
        geocoder.addressSearch(fullAddress, (result, status) => {
            if (status === window.kakao.maps.services.Status.OK) {
                setCoords({
                    lat: Number(result[0].y),
                    lng: Number(result[0].x),
                });
            }
        });
    }
  };

  //  지도 클릭 핸들러
  const handleMapClick = (_t, mouseEvent) => {
    setCoords({
        lat: mouseEvent.latLng.getLat(),
        lng: mouseEvent.latLng.getLng(),
    });
  };

  // =================================================================
  // 5. 수정 요청 핸들러 (PUT)
  // =================================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!values.title || !values.price || !values.content || !values.category || !values.location) {
      alert("거래 장소를 포함한 모든 정보를 입력해주세요!");
      return;
    }

    if (IS_MOCK_MODE) {
      alert("🎉 [테스트] 수정이 완료되었습니다!");
      navigate(`/items/${id}`);
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const formData = new FormData();

      // JSON 데이터 생성 (수정된 좌표 포함)
      const itemData = {
        title: values.title,
        category: values.category,
        content: values.content,
        price: parseInt(values.price),
        location: values.location,
        address: values.location,
        //  [수정됨] 지도에서 선택한 좌표 전송
        latitude: coords.lat,
        longitude: coords.lng
      };

      const jsonBlob = new Blob([JSON.stringify(itemData)], { type: "application/json" });
      formData.append("itemData", jsonBlob);

      if (imageFile) {
        formData.append("itemImage", imageFile);
      }

      const response = await fetch(`${API_BASE_URL}/api/items/${id}`, {
        method: 'PUT',
        headers: {
          "Authorization": `Bearer ${token}`,
          "ngrok-skip-browser-warning": "69420",
        },
        body: formData,
      });

      if (response.ok) {
        alert("🎉 게시물이 수정되었습니다.");
        navigate(`/items/${id}`);
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
    <Container maxWidth="sm" sx={{ py: 5, pb: 10 }}>
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
          
          {/* 이미지 수정 영역 */}
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <input accept="image/*" style={{ display: 'none' }} id="upload-button" type="file" onChange={handleImageChange} />
            <label htmlFor="upload-button">
              {previewUrl ? (
                <Box sx={{ position: 'relative' }}>
                  <Box component="img" src={previewUrl} sx={{ width: '100%', maxHeight: '300px', objectFit: 'cover', borderRadius: 2, cursor: 'pointer', opacity: imageFile ? 1 : 0.8 }} />
                  {!imageFile && (
                    <Typography variant="caption" sx={{ position: 'absolute', bottom: 10, left: 0, right: 0, color: 'white', bgcolor: 'rgba(0,0,0,0.5)', py: 0.5 }}>
                      이미지를 변경하려면 클릭하세요
                    </Typography>
                  )}
                </Box>
              ) : (
                <Box sx={{ width: '100%', height: '200px', bgcolor: '#f0f0f0', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed #ccc' }}>
                  <PhotoCamera sx={{ fontSize: 50, color: '#aaa' }} />
                </Box>
              )}
            </label>
          </Box>

          <Stack spacing={3}>
            <TextField label="글 제목" name="title" fullWidth required value={values.title} onChange={handleChange} />

            <FormControl fullWidth required>
              <InputLabel>카테고리</InputLabel>
              <Select name="category" value={values.category} label="카테고리" onChange={handleChange}>
                {CATEGORIES.map((cat) => <MenuItem key={cat.value} value={cat.value}>{cat.label}</MenuItem>)}
              </Select>
            </FormControl>

            <Stack direction="row" spacing={2}>
              <TextField label="가격 (1시간 기준)" name="price" type="number" fullWidth required value={values.price} onChange={handleChange} InputProps={{ endAdornment: <InputAdornment position="end">원</InputAdornment> }} />
            </Stack>

            {/*  [지도 섹션] 등록 페이지와 동일한 UI 적용 */}
            <Box>
                <TextField
                    label="거래 희망 장소"
                    name="location"
                    fullWidth
                    required
                    value={values.location}
                    InputProps={{ readOnly: true }}
                    placeholder="주소 검색 버튼을 눌러주세요"
                    onClick={() => setOpenPostcode(true)}
                    sx={{ mb: 1, cursor: 'pointer' }}
                />
                <Button 
                    variant="outlined" 
                    fullWidth 
                    onClick={() => setOpenPostcode(true)}
                    startIcon={<SearchIcon />}
                    sx={{ mb: 2, py: 1.5, fontWeight: 'bold', borderRadius: 2 }}
                >
                    주소 및 위치 수정하기
                </Button>
                
                <Box sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid #ddd' }}>
                    <Map
                        center={coords}
                        style={{ width: "100%", height: "250px" }}
                        level={3}
                        onClick={handleMapClick}
                    >
                        <MapMarker position={coords}>
                            <div style={{ padding: "5px", color: "#000", fontSize:'12px' }}>
                                거래 위치📍
                            </div>
                        </MapMarker>
                    </Map>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    * 지도 클릭 시 위치가 변경됩니다.
                </Typography>
            </Box>

            <TextField label="자세한 설명" name="content" multiline rows={5} fullWidth required value={values.content} onChange={handleChange} />

            <Button type="submit" variant="contained" size="large" sx={{ py: 1.5, fontSize: '1.1rem', fontWeight: 'bold' }}>
              수정 완료
            </Button>
          </Stack>
        </Box>

        {/* 주소 검색 모달 */}
        <Dialog open={openPostcode} onClose={() => setOpenPostcode(false)} fullWidth maxWidth="sm">
            <DialogContent sx={{ p: 0, height: '500px' }}>
                <DaumPostcode onComplete={handleCompletePostcode} style={{ height: '100%' }} />
            </DialogContent>
        </Dialog>
      </Paper>
    </Container>
  );
}