import React, { useState, useEffect, useMemo } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, Typography, Box, Chip, Stack, Divider, Paper, IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';

// 🗓️ MUI X Date Picker (날짜/시간 선택기)
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

// ⏰ 날짜 유틸리티
import dayjs from 'dayjs';
import 'dayjs/locale/ko'; 

import { API_BASE_URL, IS_MOCK_MODE } from '../config'; 

// 한국어 로케일 설정 (달력에 '월/화/수' 표시)
dayjs.locale('ko');

const RentalModal = ({ open, onClose, item }) => {
  // ----------------------------------------------------------------
  // 1. 상태 관리 (State Management)
  // ----------------------------------------------------------------
  const [startDateTime, setStartDateTime] = useState(null); // 대여 시작일
  const [endDateTime, setEndDateTime] = useState(null);     // 반납 예정일
  const [loading, setLoading] = useState(false);            // API 통신 중 로딩 상태

  /**
   * 모달이 열릴 때마다 입력값 초기화 (Cleanup)
   * 이유: 이전에 입력했던 날짜가 남아있으면 사용자에게 혼동을 줌
   */
  useEffect(() => {
    if (open) {
      setStartDateTime(null);
      setEndDateTime(null);
    }
  }, [open]);

  // ----------------------------------------------------------------
  // 2. 비즈니스 로직 (Business Logic)
  // ----------------------------------------------------------------

  /**
   * ⚡️ [빠른 시간 추가 핸들러] (쏘카/킥보드 스타일)
   * 사용자가 '+1시간' 버튼을 눌렀을 때 자동으로 시간을 계산해주는 편의 기능
   * * @param {number} amount - 추가할 시간 양 (예: 1, 2, 24)
   * @param {string} unit - 단위 ('hour' 또는 'day')
   */
  const handleQuickDuration = (amount, unit) => {
    // 기준 시간: 이미 선택된 시작 시간이 있으면 그걸 쓰고, 없으면 '현재 시간' 사용
    const baseTime = startDateTime || dayjs();
    
    // ✅ UX 디테일: 분 단위 깔끔하게 맞추기
    // 현재가 12:13분이라면 -> 12:30분으로 시작 시간을 자동 보정 (30분 단위)
    const remainder = baseTime.minute() % 30;
    const roundedBaseTime = remainder === 0 
      ? baseTime 
      : baseTime.add(30 - remainder, 'minute').startOf('minute');

    // 종료 시간 계산: 보정된 시작 시간 + 버튼 누른 시간
    const newEndTime = roundedBaseTime.add(amount, unit);

    // 시작 시간이 비어있었다면 자동으로 채워줌
    if (!startDateTime) {
      setStartDateTime(roundedBaseTime);
    }
    setEndDateTime(newEndTime);
  };

  /**
   * 💰 [가격 계산 로직] (시간제 과금)
   * - 정책: 1분이라도 넘어가면 1시간 요금을 받음 (올림 처리, Math.ceil)
   * - 이유: 렌탈 비즈니스에서는 넉넉하게 시간을 잡도록 유도하기 위함
   */
  const totalPrice = useMemo(() => {
    // 필수 데이터가 없으면 계산 안 함
    if (!startDateTime || !endDateTime || !item) return 0;

    // 두 시간의 차이를 '시간(hour)' 단위 소수점으로 구함 (예: 1시간 30분 -> 1.5)
    const diffHours = endDateTime.diff(startDateTime, 'hour', true);
    
    if (diffHours <= 0) return 0; // 종료 시간이 더 빠르면 0원

    // 올림 처리 (1.1시간 -> 2시간 요금)
    const billedHours = Math.ceil(diffHours);

    return billedHours * item.price;
  }, [startDateTime, endDateTime, item]); // 의존성 배열: 이 값들이 변할 때만 재계산

  /**
   * 🚀 [서버 전송 핸들러]
   */
  const handleSubmit = async () => {
    // 유효성 검사 (Validation)
    if (!startDateTime || !endDateTime) {
      alert("대여 시작 시간과 반납 시간을 모두 선택해주세요.");
      return;
    }
    if (startDateTime >= endDateTime) {
      alert("반납 시간은 시작 시간보다 이후여야 합니다.");
      return;
    }

    // 전송 데이터 구성 (ISO 8601 포맷)
    const requestBody = {
      itemId: item.itemId, 
      startDate: startDateTime.format('YYYY-MM-DDTHH:mm:ss'), 
      endDate: endDateTime.format('YYYY-MM-DDTHH:mm:ss'),     
    };

    setLoading(true);

    try {
      // [A] Mock 모드 (프론트엔드 테스트용)
      if (IS_MOCK_MODE) {
        console.log("📦 [Mock] 서버 전송 데이터:", requestBody);
        setTimeout(() => {
            alert(`[Mock] 신청 완료!\n기간: ${requestBody.startDate} ~ ${requestBody.endDate}`);
            onClose();
            setLoading(false);
        }, 1000);
        return;
      }

      // [B] Real API (실제 서버 통신)
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_BASE_URL}/api/rentals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': '69420', // ngrok 무료 버전 경고 회피용
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        alert("대여 신청이 성공적으로 완료되었습니다.");
        onClose(); 
      } else {
        const errorMsg = await response.text();
        alert(`신청 실패: ${errorMsg}`);
      }
    } catch (error) {
      console.error("API Error:", error);
      alert("서버와 통신 중 오류가 발생했습니다.");
    } finally {
      if (!IS_MOCK_MODE) setLoading(false);
    }
  };

  // item 정보가 로드되지 않았으면 렌더링 방지
  if (!item) return null;

  // ----------------------------------------------------------------
  // 3. UI 렌더링 (Rendering)
  // ----------------------------------------------------------------
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ko">
      <Dialog 
        open={open} 
        onClose={onClose} 
        fullWidth 
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        {/* 모달 헤더 */}
        <DialogTitle sx={{ 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          bgcolor: 'primary.main', color: 'white', py: 2
        }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
            <EventAvailableIcon /> 대여 일정 설정
          </Typography>
          <IconButton onClick={onClose} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ p: 3 }}>
          {/* 상품 요약 정보 카드 */}
          <Paper elevation={0} sx={{ p: 2, mb: 4, bgcolor: '#f5f5f5', borderRadius: 2, border: '1px solid #e0e0e0' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 0.5 }}>{item.title}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', gap: 0.5 }}>
              <MonetizationOnIcon fontSize="small" color="primary" />
              <Typography variant="body2">
                1시간 기준 대여료: <strong style={{ color: '#1976d2' }}>{item.price?.toLocaleString()}원</strong>
              </Typography>
            </Box>
          </Paper>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            
            {/* 시작일 선택기 */}
            <DateTimePicker
              label="언제부터 빌릴까요?"
              value={startDateTime}
              onChange={(newValue) => setStartDateTime(newValue)}
              minDateTime={dayjs()} // 과거 선택 불가
              timeSteps={{ minutes: 30 }} // 30분 단위 선택
              slotProps={{ 
                textField: { fullWidth: true, variant: 'outlined' },
                actionBar: { actions: ['today'] } // '오늘' 버튼 활성화
              }}
            />

            {/* 빠른 시간 추가 버튼 (Chip) */}
            <Box>
                <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, fontWeight: 'bold', color: 'text.primary' }}>
                    <AccessTimeFilledIcon color="primary" fontSize="small" /> 간편 시간 추가
                </Typography>
                <Stack 
                  direction="row" 
                  spacing={1.5} 
                  sx={{ 
                    overflowX: 'auto', 
                    pb: 1,
                    '::-webkit-scrollbar': { height: '6px' }, 
                    '::-webkit-scrollbar-thumb': { backgroundColor: '#ddd', borderRadius: '3px' }
                  }}
                >
                    <Chip label="+1시간" onClick={() => handleQuickDuration(1, 'hour')} color="primary" variant="soft" clickable sx={{ fontWeight: 'bold' }} />
                    <Chip label="+2시간" onClick={() => handleQuickDuration(2, 'hour')} color="primary" variant="soft" clickable sx={{ fontWeight: 'bold' }} />
                    <Chip label="+4시간" onClick={() => handleQuickDuration(4, 'hour')} color="primary" variant="soft" clickable sx={{ fontWeight: 'bold' }} />
                    <Divider orientation="vertical" flexItem />
                    <Chip label="+1일" onClick={() => handleQuickDuration(1, 'day')} color="secondary" variant="soft" clickable sx={{ fontWeight: 'bold' }} />
                    <Chip label="+2일" onClick={() => handleQuickDuration(2, 'day')} color="secondary" variant="soft" clickable sx={{ fontWeight: 'bold' }} />
                </Stack>
            </Box>
            
            {/* 반납일 선택기 */}
            <DateTimePicker
              label="언제 반납할까요?"
              value={endDateTime}
              onChange={(newValue) => setEndDateTime(newValue)}
              minDateTime={startDateTime || dayjs()} 
              timeSteps={{ minutes: 30 }} 
              slotProps={{
                textField: { 
                  fullWidth: true,
                  error: startDateTime && endDateTime && startDateTime >= endDateTime,
                  helperText: startDateTime && endDateTime && startDateTime >= endDateTime ? "종료 시간이 시작 시간보다 빨라요!" : ""
                },
                actionBar: { actions: ['today'] } 
              }}
            />
          </Box>

          {/* 최종 예상 금액 (영수증 스타일) */}
          {totalPrice > 0 && (
            <Paper 
              elevation={3} 
              sx={{ mt: 4, p: 2.5, bgcolor: '#e3f2fd', borderRadius: 2, border: '1px solid #bbdefb' }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', mb: 1 }}>
                <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#0d47a1' }}>
                  총 예상 결제 금액
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: '900', color: '#1565c0' }}>
                   {totalPrice.toLocaleString()}원
                </Typography>
              </Box>
              <Divider sx={{ my: 1.5, borderColor: '#90caf9' }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                 <Typography variant="caption" color="text.secondary">대여 기간</Typography>
                 <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                    {startDateTime?.format('M/D(ddd) HH:mm')} ~ {endDateTime?.format('M/D(ddd) HH:mm')}
                    {startDateTime && endDateTime && (
                         <span style={{ color: '#1976d2', marginLeft: '4px' }}>
                           {/* 실제 몇 시간을 빌리는지 소수점까지 표시 */}
                           ({endDateTime.diff(startDateTime, 'hour', true).toFixed(1)}시간)
                         </span>
                    )}
                 </Typography>
              </Box>
            </Paper>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={onClose} color="inherit" size="large" sx={{ borderRadius: 2, px: 3 }}>
            다음에
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            disabled={loading || totalPrice <= 0}
            size="large"
            sx={{ fontWeight: 'bold', px: 5, borderRadius: 2, py: 1.5, fontSize: '1.1rem' }}
          >
            {loading ? "처리 중..." : "신청하기"}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default RentalModal;