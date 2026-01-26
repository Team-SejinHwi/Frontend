// src/mocks/mockData.js

export const mockItems = [
  {
    itemId: 10,
    title: "맥북 프로 M3 빌려드립니다",
    price: 50000,
    location: "서울 강남구",
    itemStatus: "AVAILABLE",
    itemImageUrl: "https://i.postimg.cc/j2gDyK7c/ab-fhm-Rqh-D-d-Yg-unsplash.jpg", 
    createdAt: "2026-01-15T16:00:00",
    // 👇 주인 정보 (이 이메일이 내 이메일과 같아야 버튼이 보임)
    owner: {
      memberId: 1,
      email: "sejin@naver.com", 
      name: "테스트유저"
    }
  },
  {
    itemId: 9,
    title: "캠핑용 텐트 (4인용)",
    price: 20000,
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

// 👇 [NEW] 여기에 내 정보(가짜)를 추가합니다!
export const mockUser = {
  memberId: 1,
  email: "sejin@naver.com",
  name: "김세진(Mock)",
  phone: "010-1234-5678",
  address: "서울시 강남구 역삼동",
  profileImage: null // 나중에 프사도 넣을 수 있음
};