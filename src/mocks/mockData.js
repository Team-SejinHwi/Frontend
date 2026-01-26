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