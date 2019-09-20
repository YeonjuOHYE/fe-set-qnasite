const URL = {
  INIT: "http://localhost:3000/api/questions",
  LOGIN: "http://localhost:3000/api/login",
  TOKEN_VALIDATION: "http://localhost:3000/api/token-validation",
  ADD_REPLY: "/api/questions/:questionid/answers"
};

//util
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

function getAnswerTemplate(answers) {
  return answers.reduce((html, { content, name, date }) => {
    return (
      html +
      `
        <li class="answer-list" >
            <p class="answer-content">${content}</p>
            <div class="answer-profile">
                <span class="answer-writer">${name} | </span>
                <span class="answer-date">${date}</span>
            </div>
        </li>`
    );
  }, ``);
}

function getLoadingAnswerTpl() {
  return `<li class="answer-list loading" ">
        Loading.....
     </li>`;
}

function getQnATemplate(data) {
  return data.list.reduce((html, { title, question, questionId, answers }) => {
    return (
      html +
      ` <li class="qna" _questionId=${+questionId}>
        <div class="qna-title">
            <h2>${title}</h2>
        </div>
        <div class="question">
            <p> ${question}</p>
        </div>
        <ul class="answer">${getAnswerTemplate(answers)}</ul>
        <div class="answer-form">
            <form method="POST">
                <textarea name="answer-content" class="answer-content-textarea" cols="30" rows="2" placeholder="새로운답변.."></textarea>
            </form>
            <button  class="comment-submit" _questionId=${+questionId}>등록</button>
        </div>
    </li>`
    );
  }, ``);
}

//fetch 요청후에 renderQnA를 활용해서 화면 렌더링을 할 수 있음
function renderQnA(data) {
  const target = $(".qna-wrap");
  const resultHTML = getQnATemplate(data);
  target.innerHTML = resultHTML;
}

document.addEventListener("DOMContentLoaded", () => {
  //qna 리스트 초기화
  initQna();
  //localStorage에서 로그인 상태 및 유효성 확인
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
});

initQna = () => {
  fetch(URL.INIT)
    .then(res => res.json())
    .then(result => renderQnA(result))
    .then(() => {
      $$(".comment-submit").forEach(elem => {
        const controller = new AbortController();
        const signal = controller.signal;
        let ing = false;

        elem.addEventListener("click", e => {
          let questionId = Array.from(e.target.attributes).find(
            attr => attr.name === "_questionid"
          ).value;

          if (ing) {
            e.target.setAttribute("disabled", true);
            controller.abort();
            return;
          }

          let content = e.target.previousElementSibling.firstElementChild.value;

          (async () => {
            ing = true;
            const response = await fetch(
              URL.ADD_REPLY.replace(":questionid", questionId),
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${Token.getToken()}`
                },
                body: JSON.stringify({ content: content }),
                signal: signal
              }
            );

            if (response.status == "200") {
              await initQna();
            }

            ing = false;
            return;
          })();
        });
      });
    });
};

//로그인 여부 체크
const Token = {
  token: localStorage.getItem("token"),
  getToken: () => Token.token,
  setToken: token => {
    localStorage.setItem("token", token);
    Token.token = token;
  },
  clearToken: () => {
    localStorage.clear("token");
    Token.token = null;
  }
};

//로그인 처리 함수
$("#login-btn").addEventListener("click", e => {
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
});
