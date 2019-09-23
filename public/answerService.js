import { Token } from "./Token.js";
import { $, $$ } from "./util.js";
import { URL } from "./urlConstant.js";
import { qnaService } from "./qnaService.js";

export const answerService = {
  getAnswerTemplate: answers => {
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
  },
  drawLoadingAnswerTpl: questionId => {
    const loadingList = document.createElement("li");
    loadingList.innerHTML = "Loading.....";
    loadingList.setAttribute("class", "answer-list loading");

    Array.from($$(".qna"))
      .find(
        elem =>
          Array.from(elem.attributes).find(attr => attr.name === "_questionid")
            .value == questionId
      )
      .querySelector(".answer")
      .append(loadingList);
  },

  removeLoadingAnswerTpl: questionId => {
    const loadingList = Array.from($$(".qna"))
      .find(
        elem =>
          Array.from(elem.attributes).find(attr => attr.name === "_questionid")
            .value == questionId
      )
      .querySelector(".loading");

    loadingList && loadingList.remove();
  },

  getAddAnswerCB: () => {
    return new (function() {
      this.abortController = new AbortController();
      this.signal = this.abortController.signal;
      this.requestIng = false;

      this.addAnswer = function(target) {
        let questionId = Array.from(target.attributes).find(
          attr => attr.name === "_questionid"
        ).value;

        if (this.requestIng) {
          target.setAttribute("disabled", true);
          abortController.abort();
          return;
        }

        let content = target.previousElementSibling.firstElementChild.value;

        (async () => {
          this.requestIng = true;
          answerService.drawLoadingAnswerTpl(questionId);

          try {
            const response = await fetch(
              URL.ADD_REPLY.replace(":questionid", questionId),
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${Token.getToken()}`
                },
                body: JSON.stringify({ content: content }),
                signal: this.signal
              }
            );
            if (!response.status == 200 || response.status >= 400) {
              throw { status: res.status, errText: res.statusText };
            }
            await qnaService.initQna();
          } catch (e) {
            alert(`[에러가 발생했습니다.], ${e.status} :  ${e.errText}`);
          } finally {
            this.requestIng = false;
            answerService.removeLoadingAnswerTpl(questionId);
          }
        })();
      };
    })();
  }
};
