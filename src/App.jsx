import React, { useState } from 'react'; // [수정] useState 훅을 불러옵니다.
import { BrowserRouter, Routes, Route, } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ItemDetail from './pages/ItemDetail';
import ItemRegister from './pages/ItemRegister';
import ItemEdit from './pages/ItemEdit';
import MyPage from './pages/MyPage';
import ChatRoom from './pages/ChatRoom';


// [NEW] 결제 관련 페이지 추가 (ver. 2026.02.13)
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFail from './pages/PaymentFail';


function App() {
  // 🚀 [상태 관리 핵심] 로그인 상태를 여기서 관리.
  // isLoggedIn: 현재 로그인 여부 (true/false)
  // setIsLoggedIn: 로그인 상태를 변경하는 함수
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('isLoggedIn') === '1'; // '1'이면 true, 아니면 false
  });

  return (
    <BrowserRouter>
      {/* 개발 편의를 위한 상단 링크 (나중에 삭제 가능) */}
      {/* [디버깅용] 현재 상태를 눈으로 확인하기 위함 */}
      {/* <li>현재상태: {isLoggedIn ? "로그인 됨(ON)" : "로그인 안됨(OFF)"}</li> */}


      <Routes>
        {/* [Props 전달]
          자식 컴포넌트에게 부모의 상태(isLoggedIn)와 
          상태를 바꿀 수 있는 함수(setIsLoggedIn)를 물려줍니다.
        */}

        {/* Home에는 로그인 여부(isLoggedIn)와 로그아웃 기능(setIsLoggedIn)이 필요함 */}
        <Route
          path="/"
          element={<Home isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />}
        />

        {/* Login에는 '성공 시 상태를 true로 바꿀' 함수(setIsLoggedIn)가 필요함 */}
        <Route
          path="/login"
          element={<Login setIsLoggedIn={setIsLoggedIn} />}
        />

        {/* Signup은 회원가입 후 로그인 페이지로 보내기만 하면 되므로 당장 props 불필요 */}
        <Route
          path="/signup"
          element={<Signup />} />

        {/*   상세 페이지 라우트 설정 */}
        {/* /items/10, /items/9 처럼 뒤에 숫자가 오면 ItemDetail을 보여줌 */}
        <Route
          path="/items/:id"
          element={<ItemDetail />} />

        {/* 상품 등록 페이지 라우트 */}
        <Route
          path="/products/new"
          element={<ItemRegister isLoggedIn={isLoggedIn} />}
        />

        {/* 상품 수정 페이지 라우트 */}
        <Route
          path="/items/edit/:id"
          element={<ItemEdit />} />

        {/* 마이페이지 라우트 */}
        <Route
          path="/mypage"
          element={<MyPage />} />


        {/*  채팅방 라우트  */}

        <Route
          path="/chat/:roomId"
          element={<ChatRoom />} />

        {/* 🚀 [NEW] 결제 결과 처리 라우트 */}

        <Route
          path="/payment/success"
          element={<PaymentSuccess />} />

        <Route
          path="/payment/fail"
          element={<PaymentFail />}
        />
      </Routes>
    </BrowserRouter >
  );
}

export default App;