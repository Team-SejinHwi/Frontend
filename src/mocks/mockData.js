// src/mocks/mockData.js

export const mockItems = [
  {
    itemId: 10,
    title: "맥북 프로 M3 빌려드립니다",
    category: "DIGITAL",
    price: 2500,
    location: "서울시 마포구 연남동",
    content: "구매한 지 3개월 된 맥북 프로 M3 모델입니다.\n영상 편집용으로 샀는데 바빠서 잘 안 쓰게 되어 대여해드립니다.\n\n- 사양: M3 Pro / 16GB / 512GB\n- 상태: 기스 하나 없는 S급\n- 구성품: 본체, 충전기, 파우치\n\n연남동 주민센터 직거래 선호합니다. 소중하게 다뤄주실 분 연락 주세요!",
    itemStatus: "AVAILABLE",
    itemImageUrl: "https://i.postimg.cc/j2gDyK7c/ab-fhm-Rqh-D-d-Yg-unsplash.jpg",
    createdAt: "2026-01-15T16:00:00",

    // 지도 테스트용 좌표 데이터 (연남동 주민센터 기준)
    tradeLatitude: 37.5645025,
    tradeLongitude: 126.9219972,
    tradeAddress: "서울특별시 마포구 성미산로 153",

    owner: {
      memberId: 1,
      email: "sejin@naver.com",
      name: "세지니"
    }
  },
  {
    itemId: 9,
    title: "캠핑용 텐트 (4인용)",
    category: "SPORTS",
    price: 1000,
    location: "충주시 대소원면",
    content: "주말에 가족이랑 캠핑 갈 때 딱 좋은 4인용 텐트입니다.\n설치하기 엄청 쉬워요 (원터치 아님, 폴대 2개 끼우면 끝).\n\n방수 처리 잘 되어 있고, 바닥 매트도 같이 빌려드립니다.\n사용 후 깨끗하게만 말려서 반납해주세요~",
    itemStatus: "RENTED",
    itemImageUrl: "https://i.postimg.cc/vH57x287/camping-tent.jpg",
    createdAt: "2026-01-14T10:00:00",

    // 지도 테스트용 좌표 데이터 (교통대)
    tradeLatitude: 36.969836,
    tradeLongitude: 127.8717685,
    tradeAddress: "충청북도 충주시 대소원면 대학로 50",

    owner: {
      memberId: 2,
      email: "hwi@naver.com",
      name: "휘님"
    }
  },
  {
    itemId: 8,
    title: "이케아 의자 빌려드립니다",
    category: "FURNITURE",
    price: 500,
    location: "인천시 남동구",
    content: "자취방 뺄 때까지만 잠깐 쓰실 분?\n이케아 기본 의자입니다. 튼튼해요.\n\n인천시청역 근처에서 가져가셔야 합니다.\n(배달 불가능, 직접 수령 필수)",
    itemStatus: "AVAILABLE",
    itemImageUrl: "https://i.postimg.cc/k4SRB2d6/chair.png",
    createdAt: "2026-01-10T12:00:00",

    //  지도 테스트용 좌표 데이터 (인천시청)
    tradeLatitude: 37.4562557,
    tradeLongitude: 126.7052062,
    tradeAddress: "인천광역시 남동구 정각로 29",

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
  address: "인천시 남동구 구월동",
  profileImage: null
};

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