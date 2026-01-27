// src/mocks/mockData.js

export const mockItems = [
  {
    itemId: 10,
    title: "맥북 프로 M3 빌려드립니다",
    // ⚠️ 중요: 이제 '1시간' 기준 가격입니다. (기존 1일 가격 아님)
    price: 2500,
    location: "서울 강남구",
    itemStatus: "AVAILABLE",
    itemImageUrl: "https://i.postimg.cc/j2gDyK7c/ab-fhm-Rqh-D-d-Yg-unsplash.jpg",
    createdAt: "2026-01-15T16:00:00",
    owner: {
      memberId: 1,
      email: "sejin@naver.com",
      name: "테스트유저"
    }
  },
  {
    itemId: 9,
    title: "캠핑용 텐트 (4인용)",
    // 시간당 1,000원
    price: 1000,
    location: "경기도 성남시",
    itemStatus: "RENTED",
    itemImageUrl: "https://i.postimg.cc/vH57x287/camping-tent.jpg",
    createdAt: "2026-01-14T10:00:00",
    owner: {
      memberId: 2,
      email: "hwi@naver.com",
      name: "테스트유저"
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

// ✅ 내가 받은 대여 요청 (Owner View) - API 명세 2-3 대응
export const mockReceivedRentals = [
  {
    rentalId: 101,
    itemId: 10,
    itemTitle: "맥북 프로 M3 빌려드립니다",
    renterName: "개발자지망생",
    status: "WAITING", // 승인 대기중
    totalPrice: 150000,
    startDate: "2026-02-01T10:00:00",
    endDate: "2026-02-03T18:00:00"
  },
  {
    rentalId: 102,
    itemId: 10,
    itemTitle: "맥북 프로 M3 빌려드립니다",
    renterName: "디자이너킴",
    status: "APPROVED", // 이미 승인됨
    totalPrice: 50000,
    startDate: "2026-01-28T12:00:00",
    endDate: "2026-01-28T16:00:00"
  }
];

// ✅ [NEW] 내가 빌린 내역 (Renter View) - API 명세 2-2 대응
export const mockMyRentals = [
  {
    rentalId: 201,
    itemId: 9,
    itemTitle: "캠핑용 텐트 (4인용)",
    ownerName: "캠핑족",
    status: "WAITING", // 아직 주인이 수락 안 함
    totalPrice: 24000,
    startDate: "2026-02-10T10:00:00",
    endDate: "2026-02-11T10:00:00"
  },
  {
    rentalId: 199,
    itemId: 5,
    itemTitle: "DSLR 카메라",
    ownerName: "포토그래퍼",
    status: "COMPLETED", // 반납 완료
    totalPrice: 30000,
    startDate: "2026-01-20T09:00:00",
    endDate: "2026-01-20T18:00:00"
  },
  {
    rentalId: 198,
    itemId: 3,
    itemTitle: "전동 드릴",
    ownerName: "동네형",
    status: "REJECTED", // 거절당함
    totalPrice: 5000,
    startDate: "2026-01-15T14:00:00",
    endDate: "2026-01-15T15:00:00"
  }
];