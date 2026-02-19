import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, Box, Chip, Stack, Divider, Paper, IconButton,
  InputAdornment
} from '@mui/material';

// 아이콘 Import
import CloseIcon from '@mui/icons-material/Close';
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import ClearIcon from '@mui/icons-material/Clear';

// 🗓️ MUI X Date Picker 관련
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { MobileDateTimePicker } from '@mui/x-date-pickers/MobileDateTimePicker';
import { koKR } from '@mui/x-date-pickers/locales';

// ⏰ 날짜 유틸리티 (Day.js)
import dayjs from 'dayjs';
import 'dayjs/locale/ko';

import { API_BASE_URL, IS_MOCK_MODE, TUNNEL_HEADERS } from '../config';

// 한국어 로케일 설정
dayjs.locale('ko');

const RentalModal = ({ open, onClose, item, onRentalSuccess }) => {
  // 1. 상태 관리
  const [startDateTime, setStartDateTime] = useState(null);
  const [endDateTime, setEndDateTime] = useState(null);
  const [loading, setLoading] = useState(false);

  // 모달이 열릴 때마다 초기화
  useEffect(() => {
    if (open) {
      setStartDateTime(null);
      setEndDateTime(null);
    }
  }, [open]);

  // 2. 비즈니스 로직
  const handleQuickDuration = (amount, unit) => {
    const currentStart = startDateTime || dayjs().startOf('minute');
    if (!startDateTime) setStartDateTime(currentStart);

    const baseTime = endDateTime || currentStart;
    const newEndTime = baseTime.add(amount, unit);

    setEndDateTime(newEndTime);
  };

  const totalPrice = useMemo(() => {
    if (!startDateTime || !endDateTime || !item) return 0;
    const rawDiffHours = endDateTime.diff(startDateTime, 'hour', true);
    if (rawDiffHours <= 0) return 0;
    const cleanDiffHours = parseFloat(rawDiffHours.toFixed(2));
    const billedHours = Math.ceil(cleanDiffHours);
    return billedHours * item.price;
  }, [startDateTime, endDateTime, item]);

  // 3. UI 헬퍼: 초기화 버튼이 있는 TextField Props 생성기
  // 🚨 [수정됨] params 의존성 제거 -> 순수 객체 반환 방식으로 변경하여 에러 원천 차단
  const getTextFieldProps = (value, setValue) => ({
    fullWidth: true,
    variant: 'outlined',
    sx: {
      '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'white' }
    },
    InputProps: {
      // 값이 있을 때만 'X' 버튼(endAdornment) 표시
      endAdornment: value ? (
        <InputAdornment position="end">
          <IconButton
            onClick={(e) => {
              e.stopPropagation(); // 달력 열림 방지
              setValue(null);      // 값 초기화
            }}
            edge="end"
            size="small"
            sx={{ color: 'text.secondary' }}
          >
            <ClearIcon fontSize="small" />
          </IconButton>
        </InputAdornment>
      ) : undefined
    }
  });

  // 4. 서버 전송
  const handleSubmit = async () => {
    if (!startDateTime || !endDateTime) {
      alert("대여 시작 시간과 반납 시간을 모두 선택해주세요.");
      return;
    }
    if (startDateTime >= endDateTime) {
      alert("반납 시간은 시작 시간보다 이후여야 합니다.");
      return;
    }

    // 🌟  날짜 포맷팅 (YYYY-MM-DDTHH:mm:ss) 
    const requestBody = {
      itemId: item.itemId,
      startDate: startDateTime.format('YYYY-MM-DDTHH:mm:ss'),
      endDate: endDateTime.format('YYYY-MM-DDTHH:mm:ss'),
      totalPrice: totalPrice
    };

    setLoading(true);

    try {
      if (IS_MOCK_MODE) {
        console.log("📦 [Mock] 서버 전송 데이터:", requestBody);
        setTimeout(() => {
          alert(`[Mock] 신청 완료!\n기간: ${startDateTime.format('MM/DD HH:mm')} ~ ${endDateTime.format('MM/DD HH:mm')}`);
          onRentalSuccess(); // 🌟 부모 상태 업데이트 호출
          onClose();
          setLoading(false);
        }, 1000);
        return;
      }

      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_BASE_URL}/api/rentals`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          ...TUNNEL_HEADERS,
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        alert("대여 신청이 성공적으로 완료되었습니다.");
        onRentalSuccess(); // 🌟 2. 성공 시 부모 컴포넌트의 isRequested를 true로 바꿈
        onClose();
      } else {
        const errorMsg = await response.text();
        alert(`신청 실패: ${errorMsg}`);
      }
    } catch (error) {
      console.error("API Error:", error);
      alert("서버 오류 발생");
    } finally {
      if (!IS_MOCK_MODE) setLoading(false);
    }
  };

  if (!item) return null;

  return (
    <LocalizationProvider
      dateAdapter={AdapterDayjs}
      adapterLocale="ko"
      localeText={koKR.components.MuiLocalizationProvider.defaultProps.localeText}
    >
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 4, bgcolor: '#f8f9fa' } }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', bgcolor: 'primary.main', color: 'white', py: 2 }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
            <EventAvailableIcon /> 대여 일정 설정
          </Typography>
          <IconButton onClick={onClose} sx={{ color: 'white' }}><CloseIcon /></IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>

          {/* 상품 정보 요약 */}
          <Paper elevation={0} sx={{ p: 2.5, mb: 4, bgcolor: 'white', borderRadius: 3, border: '1px solid #e0e0e0' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>{item.title}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', gap: 0.5 }}>
              <MonetizationOnIcon fontSize="small" color="primary" />
              <Typography variant="body1">
                시간당 대여료: <strong style={{ color: '#1976d2', fontSize: '1.1rem' }}>{item.price?.toLocaleString()}원</strong>
              </Typography>
            </Box>
          </Paper>

          <Stack spacing={3}>

            {/* 1️⃣ 대여 시작 시간 */}
            <MobileDateTimePicker
              label="대여 시작 시간"
              value={startDateTime}
              onChange={(newValue) => setStartDateTime(newValue)}
              minDateTime={dayjs()}
              minutesStep={1}
              // 🚨 [수정됨] 함수형 호출 대신 객체 직접 전달 방식으로 변경
              slotProps={{
                textField: getTextFieldProps(startDateTime, setStartDateTime),
                actionBar: { actions: ['cancel', 'today', 'accept'] }
              }}
            />

            {/* 2️⃣ 간편 시간 추가 (Chips) */}
            <Box>
              <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, fontWeight: 'bold', color: 'text.primary' }}>
                <AccessTimeFilledIcon color="primary" fontSize="small" /> 간편 시간 추가 (누적)
              </Typography>
              <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 1 }}>
                <Chip label="+1시간" onClick={() => handleQuickDuration(1, 'hour')} color="primary" sx={{ borderRadius: 2, fontWeight: 'bold' }} clickable />
                <Chip label="+4시간" onClick={() => handleQuickDuration(4, 'hour')} color="primary" sx={{ borderRadius: 2, fontWeight: 'bold' }} clickable />
                <Chip label="+1일" onClick={() => handleQuickDuration(1, 'day')} color="secondary" sx={{ borderRadius: 2, fontWeight: 'bold' }} clickable />
                <Chip label="+2일" onClick={() => handleQuickDuration(2, 'day')} color="secondary" sx={{ borderRadius: 2, fontWeight: 'bold' }} clickable />
              </Stack>
            </Box>

            {/* 3️⃣ 반납 예정 시간 */}
            <MobileDateTimePicker
              label="반납 예정 시간"
              value={endDateTime}
              onChange={(newValue) => setEndDateTime(newValue)}
              minDateTime={startDateTime || dayjs()}
              minutesStep={1}
              slotProps={{
                textField: {
                  ...getTextFieldProps(endDateTime, setEndDateTime),
                  error: startDateTime && endDateTime && startDateTime >= endDateTime,
                  helperText: startDateTime && endDateTime && startDateTime >= endDateTime ? "종료 시간이 시작 시간보다 빨라요!" : ""
                },
                actionBar: { actions: ['cancel', 'today', 'accept'] }
              }}
            />
          </Stack>

          {/* 총 예상 금액 */}
          {totalPrice > 0 && (
            <Paper elevation={2} sx={{ mt: 4, p: 3, bgcolor: '#e3f2fd', borderRadius: 3, border: '1px solid #90caf9' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-end">
                <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#0d47a1' }}>총 예상 금액</Typography>
                <Typography variant="h4" sx={{ fontWeight: '900', color: '#1565c0' }}>{totalPrice.toLocaleString()}원</Typography>
              </Stack>
              <Divider sx={{ my: 2, borderColor: 'rgba(144, 202, 249, 0.5)' }} />
              <Typography variant="body2" sx={{ fontWeight: 'bold', display: 'block', textAlign: 'right', color: '#1e88e5' }}>
                ⏱️ 총 이용 시간: {endDateTime.diff(startDateTime, 'hour', true).toFixed(2)}시간
              </Typography>
            </Paper>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 2, bgcolor: '#f8f9fa', borderTop: '1px solid #e0e0e0' }}>
          <Button onClick={onClose} color="inherit" size="large" sx={{ borderRadius: 2, px: 3 }}>취소</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading || totalPrice <= 0}
            size="large"
            sx={{ fontWeight: 'bold', px: 5, borderRadius: 2, boxShadow: 2 }}
          >
            신청하기
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default RentalModal;