// src/mocks/mockData.js

export const mockItems = [
  {
    itemId: 10,
    title: "맥북 프로 M3 빌려드립니다",
    category: "DIGITAL",
    categoryName: "디지털/가전",
    price: 2500,
    location: "서울시 마포구 연남동",
    content: "구매한 지 3개월 된 맥북 프로 M3 모델입니다.\n영상 편집용으로 샀는데 바빠서 잘 안 쓰게 되어 대여해드립니다.\n\n- 사양: M3 Pro / 16GB / 512GB\n- 상태: 기스 하나 없는 S급\n\n연남동 주민센터 직거래 선호합니다.",
    itemStatus: "AVAILABLE",
    itemImageUrl: "https://i.postimg.cc/j2gDyK7c/ab-fhm-Rqh-D-d-Yg-unsplash.jpg",
    createdAt: "2026-01-15T16:00:00",

    // 지도 테스트용 좌표 데이터 (연남동 주민센터 기준)
    tradeLatitude: 37.5645025,
    tradeLongitude: 126.9219972,
    tradeAddress: "서울특별시 마포구 성미산로 153",
    isRequested: false, // 상세 페이지 테스트용 (true로 바꾸면 버튼 잠김)
    owner: { memberId: 1, email: "sejin@naver.com", name: "세지니" }
  },

  {
    itemId: 9,
    title: "캠핑용 텐트 (4인용)",
    category: "CAMPING",
    categoryName: "캠핑/레저",
    price: 1000,
    location: "충주시 대소원면",
    content: "주말에 가족이랑 캠핑 갈 때 딱 좋은 4인용 텐트입니다.\n설치하기 엄청 쉬워요 (원터치 아님, 폴대 2개 끼우면 끝).\n\n방수 처리 잘 되어 있고, 바닥 매트도 같이 빌려드립니다.\n사용 후 깨끗하게만 말려서 반납해주세요~",
    itemStatus: "RENTING",
    itemImageUrl: "https://i.postimg.cc/vH57x287/camping-tent.jpg",
    createdAt: "2026-01-14T10:00:00",

    // 지도 테스트용 좌표 데이터 (교통대)
    tradeLatitude: 36.969836,
    tradeLongitude: 127.8717685,
    tradeAddress: "충청북도 충주시 대소원면 대학로 50",
    isRequested: false, // 상세 페이지 테스트용 (true로 바꾸면 버튼 잠김)
    owner: { memberId: 2, email: "hwi@naver.com", name: "휘님" }
  },

  {
    itemId: 8,
    title: "이케아 의자 빌려드립니다",
    category: "FURNITURE",
    categoryName: "가구/인테리어",
    price: 400,
    location: "인천시 남동구",
    content: "자취방 뺄 때까지만 잠깐 쓰실 분?\n이케아 기본 의자입니다. 튼튼해요.\n\n인천시청역 근처에서 가져가셔야 합니다.\n(배달 불가능, 직접 수령 필수)",
    itemStatus: "RENTED",
    itemImageUrl: "https://i.postimg.cc/k4SRB2d6/chair.png",
    createdAt: "2026-01-10T12:00:00",

    //  지도 테스트용 좌표 데이터 (인천시청)
    tradeLatitude: 37.4562557,
    tradeLongitude: 126.7052062,
    tradeAddress: "인천광역시 남동구 정각로 29",

    owner: { memberId: 3, email: "test@naver.com", name: "게스트" }
  },

  {
    itemId: 7,
    title: "스테이플러 ",
    category: "TOOL",
    categoryName: "산업용품",
    price: 200,
    location: "경기도 부천시 원미구",
    content: " 공구 빌려드려요!",
    itemStatus: "APPROVED",
    itemImageUrl: "https://i.postimg.cc/PrQr5XjN/stapler.jpg",
    createdAt: "2026-01-25T17:00:00",

    // 지도 테스트용 좌표 데이터 (상동역)
    tradeLatitude: 37.505818,
    tradeLongitude: 126.753112,
    tradeAddress: "경기도 부천시 원미구 길주로 지하 104",

    owner: { memberId: 4, email: "test2@naver.com", name: "렌탈이" }
  },
];

export const mockUser = {
  memberId: 1,
  email: "sejin@naver.com",
  name: "김세진(Mock)",
  phone: "010-1234-5678",
  address: "인천시 남동구 구월동",
  profileImage: null
};

// 2. 받은 요청 데이터 (ReceivedRequests용 - 판매자 입장)
// "내 물건을 누군가 빌려가려고 한다!"
export const mockReceivedRentals = [
  {
    rentalId: 101,
    itemId: 10,
    itemTitle: "맥북 프로 M3 빌려드립니다",
    renterName: "개발자지망생",
    status: "WAITING", // [Case 1] 승인/거절 버튼 테스트
    totalPrice: 150000,
    startDate: "2026-02-20T10:00:00",
    endDate: "2026-02-23T18:00:00"
  },
  {
    rentalId: 102,
    itemId: 10,
    itemTitle: "맥북 프로 M3 빌려드립니다",
    renterName: "디자이너킴",
    status: "PAID", // [Case 2] [물품 전달] 버튼 테스트 (결제 완료됨)
    totalPrice: 50000,
    startDate: "2026-02-15T12:00:00",
    endDate: "2026-02-15T16:00:00"
  },
  {
    rentalId: 103,
    itemId: 11,
    itemTitle: "다이슨 에어랩",
    renterName: "멋쟁이",
    status: "RENTING", // [Case 3] [반납 확인] 버튼 테스트 (사용중)
    totalPrice: 4500,
    startDate: "2026-02-12T14:00:00",
    endDate: "2026-02-12T17:00:00"
  }
];

// 3. 보낸 요청 데이터 (SentRequests용 - 구매자 입장)
// "내가 남의 물건을 빌렸다!"
export const mockMyRentals = [
  {
    rentalId: 201,
    itemId: 11,
    itemTitle: "다이슨 에어랩",
    ownerName: "휘님",
    status: "APPROVED", // [Case 1] [결제 하기] 버튼 테스트 (승인됨)
    totalPrice: 15000,
    startDate: "2026-02-18T10:00:00",
    endDate: "2026-02-19T10:00:00"
  },
  {
    rentalId: 202,
    itemId: 11,
    itemTitle: "다이슨 에어랩",
    ownerName: "휘님",
    status: "PAID", // [Case 2] 버튼 없음 ("주인에게 물건 받으세요" 메시지)
    totalPrice: 15000,
    startDate: "2026-02-18T10:00:00",
    endDate: "2026-02-19T10:00:00"
  },
  {
    rentalId: 203,
    itemId: 10,
    itemTitle: "맥북 프로 M3",
    ownerName: "세지니",
    status: "RENTING", // [Case 3] [반납 하기] 버튼 테스트
    totalPrice: 60000,
    startDate: "2026-02-11T10:00:00",
    endDate: "2026-02-14T10:00:00"
  },
  {
    rentalId: 204,
    itemId: 99,
    itemTitle: "옛날 타자기",
    ownerName: "레트로",
    status: "RETURNED", // [Case 4] [후기 작성] 버튼 테스트
    totalPrice: 5000,
    startDate: "2026-01-20T09:00:00",
    endDate: "2026-01-20T18:00:00"
  },
  {
    rentalId: 205,
    itemId: 88,
    itemTitle: "전동 킥보드",
    ownerName: "라이더",
    status: "REJECTED", // [Case 5] 거절 사유 표시 테스트
    totalPrice: 3000,
    rejectReason: "죄송합니다. 배터리가 고장나서 수리 맡겼어요 ㅠㅠ",
    startDate: "2026-02-01T14:00:00",
    endDate: "2026-02-01T15:00:00"
  }
];