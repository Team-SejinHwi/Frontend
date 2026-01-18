// src/mocks/mockData.js

export const mockItems = [
  {
    itemId: 10,
    title: "맥북 프로 M3 빌려드립니다",
    price: 50000,
    location: "서울 강남구",
    itemStatus: "AVAILABLE", // 대여 가능
    itemImageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    createdAt: "2026-01-15T16:00:00"
  },
  {
    itemId: 9,
    title: "캠핑용 텐트 (4인용)",
    price: 20000,
    location: "경기도 성남시",
    itemStatus: "RENTED", // 대여 중 (품절 처리 필요)
    itemImageUrl: "https://images.unsplash.com/photo-1504280390367-361c6d9838f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    createdAt: "2026-01-14T10:00:00"
  },
  {
    itemId: 8,
    title: "다이슨 에어랩 풀세트",
    price: 15000,
    location: "서울 마포구",
    itemStatus: "AVAILABLE",
    itemImageUrl: "https://images.unsplash.com/photo-1556228852-6d35a585d566?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    createdAt: "2026-01-13T12:30:00"
  },
  {
    itemId: 7,
    title: "닌텐도 스위치 + 젤다 칩",
    price: 8000,
    location: "인천 연수구",
    itemStatus: "AVAILABLE",
    itemImageUrl: null, // 이미지가 없는 경우 테스트
    createdAt: "2026-01-12T09:00:00"
  }
];