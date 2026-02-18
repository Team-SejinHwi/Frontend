import React, { useRef } from 'react';
import { Stack, IconButton, Box, Typography } from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

// 아이콘들 Import
import AppsIcon from '@mui/icons-material/Apps';
import LaptopIcon from '@mui/icons-material/Laptop';
import KitchenIcon from '@mui/icons-material/Kitchen';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import ForestIcon from '@mui/icons-material/Forest';
import BuildIcon from '@mui/icons-material/Build';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import CelebrationIcon from '@mui/icons-material/Celebration';
import CheckroomIcon from '@mui/icons-material/Checkroom';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import ChairIcon from '@mui/icons-material/Chair';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import PetsIcon from '@mui/icons-material/Pets';

import { CATEGORIES } from '../../constants/categories';


//아이콘 매핑 객체
const CATEGORY_ICONS = {
    ALL: <AppsIcon />,
    DIGITAL: <LaptopIcon />,
    LIVING: <KitchenIcon />,
    CAMERA: <CameraAltIcon />,
    CAMPING: <ForestIcon />,
    TOOL: <BuildIcon />,
    SPORTS: <SportsSoccerIcon />,
    PARTY: <CelebrationIcon />,
    CLOTHING: <CheckroomIcon />,
    KIDS: <ChildCareIcon />,
    FURNITURE: <ChairIcon />,
    BOOK: <MenuBookIcon />,
    GAME: <SportsEsportsIcon />,
    BEAUTY: <AutoAwesomeIcon />,
    PET: <PetsIcon />,
    ETC: <MoreHorizIcon />,
};


export default function CategoryBar({ category, onCategoryClick }) {
    //카테고리 스크롤 제어를 위한 Ref
    const categoryScrollRef = useRef(null);

    //  카테고리 좌우 스크롤 핸들러
    const handleCategoryScroll = (direction) => {
        if (categoryScrollRef.current) {
            const scrollAmount = 300; // 한 번에 이동할 픽셀 수
            categoryScrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth' // 부드럽게 이동
            });
        }
    };


    return (
        <>
            {/* [NEW] 화살표가 포함된 카테고리 영역 */}
            <Stack direction="row" alignItems="center" spacing={1} sx={{ flex: 1, overflow: 'hidden' }}>

                {/* 왼쪽 이동 버튼 */}
                <IconButton
                    onClick={() => handleCategoryScroll('left')}
                    size="small"
                    sx={{
                        border: '1px solid #eee',
                        bgcolor: 'white',
                        '&:hover': { bgcolor: '#f5f5f5' }
                    }}
                >
                    <ArrowBackIosNewIcon fontSize="inherit" />
                </IconButton>

                {/* 카테고리 스크롤 영역 (기존 Chip을 들어내고 아래 내용으로 교체) 2026.02.09 수정 */}
                <Box
                    ref={categoryScrollRef}
                    sx={{
                        display: 'flex',
                        gap: 3, // 아이콘들 사이의 넓은 간격
                        overflowX: 'auto',
                        whiteSpace: 'nowrap',
                        px: 2,
                        py: 1, // 위아래 여백을 줘서 호버 시 안 잘리게 함
                        scrollBehavior: 'smooth',
                        '&::-webkit-scrollbar': { display: 'none' }, // 스크롤바 숨김
                        scrollbarWidth: 'none',
                    }}
                >
                    {/* [전체] 버튼과 기존 [CATEGORIES] 배열을 하나로 합쳐서 반복문 돌림 */}
                    {[{ label: '전체', value: '' }, ...CATEGORIES].map((cat) => {
                        const isSelected = category === cat.value;
                        const iconKey = cat.value === '' ? 'ALL' : cat.value; // 전체는 ALL, 나머지는 해당 value 매칭

                        return (
                            <Stack
                                key={cat.value}
                                alignItems="center"
                                spacing={1}
                                onClick={() => onCategoryClick(cat.value)}
                                sx={{
                                    cursor: 'pointer',
                                    minWidth: '70px', // 클릭 영역을 충분히 확보
                                }}
                            >
                                {/* 아이콘을 감싸는 원형 배경 */}
                                <Box
                                    sx={{
                                        width: 52,
                                        height: 52,
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        // 선택됐을 때 파란색, 아닐 때 아주 연한 회색
                                        backgroundColor: isSelected ? 'primary.main' : '#f5f5f5',
                                        // 선택됐을 때 아이콘은 흰색, 아닐 때 진한 회색
                                        color: isSelected ? 'white' : '#666',
                                        transition: 'all 0.3s ease',
                                        // 선택 시 그림자 효과로 입체감 부여
                                        boxShadow: isSelected ? '0 4px 12px rgba(25, 118, 210, 0.3)' : 'none',
                                        '&:hover': {
                                            backgroundColor: isSelected ? 'primary.dark' : '#eef2ff',
                                            transform: 'translateY(-4px)', // 위로 톡 튀어오르는 효과
                                        },
                                    }}
                                >
                                    {/* 아이콘 크기 조절하여 삽입 */}
                                    {React.cloneElement(CATEGORY_ICONS[iconKey] || <MoreHorizIcon />, { sx: { fontSize: 26 } })}
                                </Box>

                                {/* 아래에 붙는 텍스트 라벨 */}
                                <Typography
                                    variant="caption"
                                    sx={{
                                        fontWeight: isSelected ? 'bold' : '500',
                                        color: isSelected ? 'primary.main' : '#555',
                                        fontSize: '0.75rem',
                                        transition: 'color 0.2s',
                                    }}
                                >
                                    {cat.label}
                                </Typography>
                            </Stack>
                        );
                    })}
                </Box>

                {/* 오른쪽 이동 버튼 */}
                <IconButton
                    onClick={() => handleCategoryScroll('right')}
                    size="small"
                    sx={{
                        border: '1px solid #eee',
                        bgcolor: 'white',
                        '&:hover': { bgcolor: '#f5f5f5' }
                    }}
                >
                    <ArrowForwardIosIcon fontSize="inherit" />
                </IconButton>
            </Stack>
        </>
    );
}