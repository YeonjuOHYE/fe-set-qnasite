import { Token } from "./Token.js";
import { $, $$ } from "./util.js";
import { URL } from "./urlConstant.js";

export const loginService = {
  initLogin: () => {
    if (Token.getToken()) {
      fetch(URL.TOKEN_VALIDATION, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${Token.getToken()}`
        }
      })
        .then(res => res.json())
        .then(response => {
          let { authResult } = response;
          if (authResult) {
            $("#login-btn").innerText = "로그아웃";
          }
        });
    }
  },

  loginEventCB: () => {
    if ($("#login-btn").innerText === "로그인") {
      let user = prompt("Please enter your name", "yeonju");
      fetch(URL.LOGIN, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ user: user })
      })
        .then(res => res.json())
        .then(response => {
          let { auth, token } = response;
          if (auth) {
            //1. 로컬스토리지에 저장
            //localStorage.setItem("token", token);
            Token.setToken(token);
            //2. 화면에서 로그인 상태 변경
            $("#login-btn").innerText = "로그아웃";
          } else {
            return;
          }
        });
    } else {
      Token.clearToken();
      $("#login-btn").innerText = "로그인";
    }
  }
};
