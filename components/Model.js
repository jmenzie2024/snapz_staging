import React from "react";
import { useEffect } from "react";
import styles from "../styles/modal.module.css";

const Modal = ({
  randomQues,
  closeModal,
  randomQuesIds,
  filterid,
  setRandomQuesIds,
  setRandomQues,
  customrandomques2,
}) => {
  var sno = 1;
  useEffect(() => {
    if (randomQues != false) {
      customrandomques2();
    }
  }, [randomQues]);

  function sortQuestions(quesId) {
    console.log("Ques ID : ", quesId);
    const newQues = randomQues.filter((item) => item.question_id != quesId);
    const newQuesId = randomQuesIds.filter((item) => item != quesId);
    console.log("New Questions = ", newQues);
    // console.log('New Id = ', newQuesId)
    setRandomQues(newQues.length > 0 ? newQues : false);
    setRandomQuesIds(newQuesId);
  }

  function extractQuestionText(question) {
    const regexWithId = /<p id="qst">(.*?)<\/p>/;
    const regexWithoutId =
      /<p(?![^>]*\bid\b)(?![^>]*\bclass\b)[^>]*>(.*?)<\/p>/;
    const regexAlternative = /<p\b[^>]*>(.*?)<\/p>/; // Updated pattern
    const regexHtmlTags = /<[^>]+>/g; // Regex pattern to match HTML tags
    const regexStrongTag = /<\/?strong>/g; // Regex pattern to match <strong> tags

    const matchWithId = question.match(regexWithId);
    const matchWithoutId = question.match(regexWithoutId);
    const matchAlternative = question.match(regexAlternative);

    if (matchWithId) {
      return matchWithId[1]
        .replace(regexHtmlTags, "")
        .replace(regexStrongTag, ""); // Remove HTML tags and <strong> tags
    } else if (matchWithoutId) {
      return matchWithoutId[1]
        .replace(regexHtmlTags, "")
        .replace(regexStrongTag, ""); // Remove HTML tags and <strong> tags
    } else if (matchAlternative) {
      return matchAlternative[1]
        .replace(regexHtmlTags, "")
        .replace(regexStrongTag, ""); // Remove HTML tags and <strong> tags
    } else {
      return "";
    }
  }
  return (
    <>
      {/* {randomQues && (
        <div
          className="modal fade show"
          tabIndex="-1"
          style={{ display: "block" }}
        >
          <div className="modal-dialog modal-dialog-scrollable modal-lg modal-fullscreen-lg-down ">
            <div className="modal-content">
              <div className="modal-header">
                <h1 id={styles.title} className="modal-title fs-5">
                  Random Questions from{" "}
                  {filterid.name ? filterid.name : "Question Bank"}
                </h1>
              </div>
              <div id={styles.popupBody} className="modal-body">
                {randomQues.map((item, index) => (
                  <ul key={index} className={styles.list}>
                    <li>
                      <span>Question - {sno++} </span>
                      <span className={styles.sec2}>
                        {" "}
                        {extractQuestionText(item.question_text)}
                      </span>
                      <div className={styles.sec3}>
                        <span
                          className={styles.removebtn}
                          onClick={() => sortQuestions(item.question_id)}
                        >
                          Remove
                        </span>
                      </div>
                    </li>
                  </ul>
                ))}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={closeModal}
                >
                  Close
                </button>
                <button
                  id={styles.addBtn}
                  type="button"
                  className="btn btn-sm"
                  onClick={customrandomques2}
                >
                  Add to Quiz
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {randomQues && (
        <div className="modal-backdrop fade show" onClick={closeModal}></div>
      )} */}
    </>
  );
};

export default Modal;
