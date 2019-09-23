import { loginService } from "./loginService.js";
import { qnaService } from "./qnaService.js";
import { $, $$ } from "./util.js";

document.addEventListener("DOMContentLoaded", () => {
  //qna 리스트 초기화
  qnaService.initQna();
  //localStorage에서 로그인 상태 및 유효성 확인
  loginService.initLogin();
  //로그인 처리 함수
  $("#login-btn").addEventListener("click", () => loginService.loginEventCB());
});
