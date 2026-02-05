// src/constants/categories.js

export const CATEGORIES = [
  { label: '디지털/가전', value: 'DIGITAL' },
  { label: '카메라/촬영장비', value: 'CAMERA' },
  { label: '캠핑/레저', value: 'CAMPING' },
  { label: '공구/산업용품', value: 'TOOL' },
  { label: '스포츠/헬스', value: 'SPORTS' },
  { label: '파티/이벤트', value: 'PARTY' },
  { label: '의류/잡화', value: 'CLOTHING' },
  { label: '유아동/장난감', value: 'KIDS' },
  { label: '가구/인테리어', value: 'FURNITURE' },
  { label: '도서/음반/티켓', value: 'BOOK' },
  { label: '게임/취미', value: 'GAME' },
  { label: '뷰티/미용', value: 'BEAUTY' },
  { label: '반려동물용품', value: 'PET' },
  { label: '기타', value: 'ETC' },
];

/**
 * (선택 사항) 카테고리 코드를 넣으면 한글 라벨을 반환하는 함수
 * 사용 예: getCategoryLabel('DIGITAL') -> '디지털/가전'
 */
export const getCategoryLabel = (code) => {
  const found = CATEGORIES.find(c => c.value === code);
  return found ? found.label : '기타';
};