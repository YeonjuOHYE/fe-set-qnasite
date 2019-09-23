import { answerService } from "./answerService.js";

import { $, $$ } from "./util.js";
import { URL } from "./urlConstant.js";

export const qnaService = {
  getQnATemplate: data => {
    return data.list.reduce(
      (html, { title, question, questionId, answers }) => {
        return (
          html +
          ` <li class="qna" _questionId=${+questionId}>
        <div class="qna-title">
            <h2>${title}</h2>
        </div>
        <div class="question">
            <p> ${question}</p>
        </div>
        <ul class="answer">${answerService.getAnswerTemplate(answers)}</ul>
        <div class="answer-form">
            <form method="POST">
                <textarea name="answer-content" class="answer-content-textarea" cols="30" rows="2" placeholder="새로운답변.."></textarea>
            </form>
            <button  class="comment-submit" _questionId=${+questionId}>등록</button>
        </div>
    </li>`
        );
      },
      ``
    );
  },
  //fetch 요청후에 renderQnA를 활용해서 화면 렌더링을 할 수 있음
  renderQnA: data => {
    const target = $(".qna-wrap");
    const resultHTML = qnaService.getQnATemplate(data);
    target.innerHTML = resultHTML;
  },

  initQna: () => {
    fetch(URL.INIT)
      .then(res => res.json())
      .then(result => qnaService.renderQnA(result))
      .then(() => {
        $$(".comment-submit").forEach(elem => {
          const callback = answerService.getAddAnswerCB();
          console.dir(callback);
          elem.addEventListener("click", e => {
            callback.addAnswer(e.target);
          });
        });
      });
  }
};
