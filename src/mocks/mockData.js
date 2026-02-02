// src/mocks/mockData.js

export const mockItems = [
  {
    itemId: 10,
    title: "맥북 프로 M3 빌려드립니다",
    // ✅  필터링 테스트를 위해 카테고리 추가
    category: "DIGITAL",
    price: 2500, // 시간당 가격
    location: "서울 강남구",
    content: "구매한 지 3개월 된 맥북 프로 M3 모델입니다.\n영상 편집용으로 샀는데 바빠서 잘 안 쓰게 되어 대여해드립니다.\n\n- 사양: M3 Pro / 16GB / 512GB\n- 상태: 기스 하나 없는 S급\n- 구성품: 본체, 충전기, 파우치\n\n강남역 직거래 선호합니다. 소중하게 다뤄주실 분 연락 주세요!",
    itemStatus: "AVAILABLE",
    itemImageUrl: "https://i.postimg.cc/j2gDyK7c/ab-fhm-Rqh-D-d-Yg-unsplash.jpg",
    createdAt: "2026-01-15T16:00:00",
    owner: {
      memberId: 1,
      email: "sejin@naver.com",
      name: "세지니"
    }
  },
  {
    itemId: 9,
    title: "캠핑용 텐트 (4인용)",
    // ✅  '스포츠/레저' 카테고리로 설정
    category: "SPORTS",
    price: 1000,
    location: "경기도 성남시",
    content: "주말에 가족이랑 캠핑 갈 때 딱 좋은 4인용 텐트입니다.\n설치하기 엄청 쉬워요 (원터치 아님, 폴대 2개 끼우면 끝).\n\n방수 처리 잘 되어 있고, 바닥 매트도 같이 빌려드립니다.\n사용 후 깨끗하게만 말려서 반납해주세요~",
    itemStatus: "RENTED",
    itemImageUrl: "https://i.postimg.cc/vH57x287/camping-tent.jpg",
    createdAt: "2026-01-14T10:00:00",
    owner: {
      memberId: 2,
      email: "hwi@naver.com",
      name: "휘님"
    }
  },
  // 테스트를 위해 데이터 하나 더 추가 (가구)
  {
    itemId: 8,
    title: "이케아 의자 팝니다 아님 빌려줌",
    category: "FURNITURE",
    price: 500,
    location: "서울 마포구",
    content: "자취방 뺄 때까지만 잠깐 쓰실 분?\n이케아 기본 의자입니다. 튼튼해요.\n\n홍대입구역 근처에서 가져가셔야 합니다.\n(배달 불가능, 직접 수령 필수)",
    itemStatus: "AVAILABLE",
    itemImageUrl: "https://via.placeholder.com/150",
    createdAt: "2026-01-10T12:00:00",
    owner: {
      memberId: 3,
      email: "guest@example.com",
      name: "게스트"
    }
  }
];

export const mockUser = {
  memberId: 1,
  email: "sejin@naver.com",
  name: "김세진(Mock)",
  phone: "010-1234-5678",
  address: "서울시 강남구 역삼동",
  profileImage: null
};

// ... (아래 mockReceivedRentals, mockMyRentals는 기존과 동일하게 유지) ...
// (기존 코드의 아래 부분은 그대로 두시면 됩니다)
export const mockReceivedRentals = [
  {
    rentalId: 101,
    itemId: 10,
    itemTitle: "맥북 프로 M3 빌려드립니다",
    renterName: "개발자지망생",
    status: "WAITING",
    totalPrice: 150000,
    startDate: "2026-02-01T10:00:00",
    endDate: "2026-02-03T18:00:00"
  },
  {
    rentalId: 102,
    itemId: 10,
    itemTitle: "맥북 프로 M3 빌려드립니다",
    renterName: "디자이너킴",
    status: "APPROVED",
    totalPrice: 50000,
    startDate: "2026-01-28T12:00:00",
    endDate: "2026-01-28T16:00:00"
  }
];

export const mockMyRentals = [
  {
    rentalId: 201,
    itemId: 9,
    itemTitle: "캠핑용 텐트 (4인용)",
    ownerName: "캠핑족",
    status: "WAITING",
    totalPrice: 24000,
    startDate: "2026-02-10T10:00:00",
    endDate: "2026-02-11T10:00:00"
  },
  {
    rentalId: 199,
    itemId: 5,
    itemTitle: "DSLR 카메라",
    ownerName: "포토그래퍼",
    status: "COMPLETED",
    totalPrice: 30000,
    startDate: "2026-01-20T09:00:00",
    endDate: "2026-01-20T18:00:00"
  },
  {
    rentalId: 198,
    itemId: 3,
    itemTitle: "전동 드릴",
    ownerName: "동네형",
    status: "REJECTED",
    totalPrice: 5000,
    startDate: "2026-01-15T14:00:00",
    endDate: "2026-01-15T15:00:00"
  }
];