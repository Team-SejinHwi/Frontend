import { useState } from 'react';
import logo from './logo.svg';
import './App.css';
import Button from '@mui/material/Button';  // mui Button 임포트한다.
import ButtonGroup from '@mui/material/ButtonGroup';  // mui Button 그룹 ...  임포트한다.
import Container from '@mui/material/Container'; // 화면을 고정시킴
import Grid from '@mui/material/Grid'; //Grid  수평이나 수직으로 디자인
import Dialog from '@mui/material/Dialog'; //Dialog. 버튼을 누르면 -> 다른컴포넌트 작동하게.
//  버튼을 누르면,  대화상자 뜨게 구현
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';


function Header() {
  return (
    <header>
      <h1>Welcome!</h1>
    </header>
  );
}

function Nav() {
  return (
    <nav>
      <ol>
        <li>html</li>
        <li>css</li>
      </ol>
    </nav>
  );
}
function Article() {
  const [open, setOpen] = useState(false);  //state 생성

  return (
    <>
      <article>
        <h2>Welcome</h2>
        월드 와이드 웹 컨소시엄(영어: World Wide Web Consortium, 축약형은 영어: WWW 또는 W3) 약칭 W3C는 월드 와이드 웹을 위한 표준을 개발하고 장려하는 조직으로 팀 버너스 리를 중심으로 1994년 10월에 설립되었다. W3C는 회원기구, 정직원, 공공기관이 협력하여 웹 표준을 개발하는 국제 컨소시엄이다. W3C의 설립취지는 웹의 지속적인 성장을 도모하는 프로토콜과 가이드라인을 개발하여 월드 와이드 웹의 모든 잠재력을 이끌어 내는 것이다.
        웹 표준과 가이드라인 개발
        W3C는 설립목적인 웹 표준과 가이드라인 개발을 수행하고 있으며, 지금까지의 결과로 지난 10년간 80여개의 W3C 권고안을 발표하였다. W3C는 또한 교육과 소프트웨어 개발에 관여해 왔고, 그리고 웹에 관하여 토론할 수 있는 열린 포럼을 개최해 왔다. 웹의 모든 잠재력을 이끌어내기 위해서 가장 기본적인 웹 기술은 상호 간의 호환성이 있어야 한다는 것, 그리고 어떤 소프트웨어나 하드웨어에서도 웹에 접근할 수 있어야 한다는 것이다. W3C의 이러한 목표를 "웹 상호운용성 (Web Interoperability)" 이라고 한다. W3C는 웹 언어와 프로토콜에 대한 공개(반독점적인) 표준을 제정하여 시장 분열과 웹의 분열을 피하고자 한다.

        <br />
        {/* 버튼선언. ButtonGroup 태그는 버튼을 그룹화 할 수 있음*/}
        <ButtonGroup>
          <Button variant="outlined" onClick={function () {
            setOpen(true);
          }}>Create
          </Button>

          <Button variant="outlined">Update</Button>
        </ButtonGroup>
        <Button variant="outlined">Delete</Button>

        <Dialog open={open}>  {/*디밍효과 */}
          <DialogTitle>Create</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Hello Create!!!
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button variant='"outlined"'>create</Button>
            <Button type="submit" form="subscription-form" onClick={() => {
              setOpen(false);
            }}>
              Subscribe
            </Button>
          </DialogActions>

        </Dialog>
      </article>
    </>
  );
}

function App() {
  return (
    <Container fixed> {/* Container fixed 태그로 화면을 가운데에 고정 시켜줌.  반응형 디자인 구현*/}
      <Header></Header>
      <Grid container>   {/*Gird 태그를 사용해서 수평이나 , 수직으로 디자인 */}
        <Grid item xs="2">
          <Nav></Nav>
        </Grid>
        <Grid item xs="10">
          <Article></Article>
        </Grid>
      </Grid>
    </Container>
  );
}
export default App;
