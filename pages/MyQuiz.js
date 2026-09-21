import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import { ToastContainer, toast, Slide } from "react-toastify";
import { addQuestion } from "../components/Features/Quiz/QuizSlice";
import moment from "moment-timezone";
import LoadingOverlay from "react-loading-overlay";
import { RiSave3Line } from "react-icons/ri";
import styles from "../styles/save.module.css";
import "react-toastify/dist/ReactToastify.css";

import MoonLoader from "react-spinners/MoonLoader";
import { resetState } from "@/components/Features/Quiz/QuizSlice";
import {
  postCategory,
  capitalizeFirstLetterOFWordFromString,
} from "@/utils/utils";

import DataTable from "react-data-table-component";
import Head from "next/head";

const Save = () => {
  const router = useRouter();
  const [quiz, setQuiz] = useState([]);
  const dispatch = useDispatch();
  const [check, setCheck] = useState(true);
  const [quesdata, setquesdata] = useState([]);
  const [isActive, setisActive] = useState(false);

  const currentTimezone = moment.tz.guess();
  const currentDateFormat = moment().tz(currentTimezone).format("MM-DD-YYYY");

  var token;
  const notify = (data) => {
    toast.success(data);
  };

  const warn = (data) => {
    toast.warning(data);
  };

  useEffect(() => {
    setisActive(true);
    token = sessionStorage.getItem("token");
    const storedName = sessionStorage.getItem("user");
    setTimeout(() => {
      if (!token) {
        sessionStorage.clear();
        router.push("/");
      } else {
        setisActive(true);
        const checkQuiz = checkQuizData();
        if (checkQuiz) {
          fetchQuiz(storedName);
        }
      }
    }, 800);
    dispatch(resetState());
  }, []);
  useEffect(() => {
    setCheck(false);
  }, [quiz]);

  const fetchQuiz = async (storedName) => {
    try {
      const response = await fetch(
        process.env.API_URL + `getAllQuizzes?name=${storedName}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Include the JWT token in the Authorization header
          },
        },
      );
      if (!response.ok) {
        setisActive(false);
        throw new Error("Failed to fetch quiz data");
      }
      const data = await response.json();
      if (data.error == "Auth Failed") {
        setisActive(false);
        sessionStorage.clear();
        router.push("/");
        console.log("unauthorized error in MyQuiz.js");
      }
      if (data.status === 429) {
        setisActive(false);
        warn("You have made too many requests.");
        sessionStorage.clear();
        router.push("/");
      }
      setisActive(false);
      setQuiz(data);
    } catch (error) {
      setisActive(false);
      sessionStorage.clear();
      console.log("catch block MyQuiz.js", error);
    }
  };

  function extractDate(created_at) {
    console.log("created_at", created_at);

    // const date = new Date(timestamp);
    // const year = date.getFullYear();
    // const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-indexed
    // const day = String(date.getDate()).padStart(2, "0");

    const currentTimezone = moment.tz.guess();
    const currentDateFormat = moment
      .utc(created_at)
      .tz(currentTimezone)
      .format("MM-DD-YYYY");

    // return `${month}-${day}-${year}`;
    return currentDateFormat;
  }

  const updateQuestionsToLatestQuestions = async (questionIds, quizId) => {
    const questionIdsData = {
      questionIds: JSON.parse(questionIds),
      id: quizId,
    };
    const token = sessionStorage.getItem("token");
    try {
      const data = await fetch(
        process.env.API_URL + "api/updateQuestionContentToLatest",
        {
          credentials: "include",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(questionIdsData),
        },
      );
      const result = await data.json();
      return result?.latestQuestionIds;
    } catch (err) {
      console.log(err);
    }
  };

  const fetchQuestions = async (
    questionIds,
    quizName,
    quizTitle,
    quizYear,
    quizId,
    quizDate,
  ) => {
    setisActive(true);
    const token = sessionStorage.getItem("token");
    const updateRes = await updateQuestionsToLatestQuestions(
      questionIds,
      quizId,
    );
    let idsArray = updateRes?.length ? updateRes : JSON.parse(questionIds);
    try {
      let idsString = idsArray.join(",");

      fetch(process.env.API_URL + `questions?ids=${idsString}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Include the JWT token in the Authorization header
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to fetch questions");
          }
          return response.json();
        })
        .then((data) => {
          // Handle the fetched questions data here
          setquesdata(data);
          setisActive(false);

          //////////// change panel category according to quiz year ////////////////////
          quizYear ? postCategory(quizYear) : "";

          sessionStorage.setItem("QuizName", quizName);
          sessionStorage.setItem("QuizTitle", quizTitle);
          sessionStorage.setItem("QuizDate", quizDate);
          sessionStorage.setItem("PrevQuesIds", questionIds);
          sessionStorage.setItem("QuizYear", quizYear);
          sessionStorage.setItem("SpecificQuizId", quizId);

          dispatch(addQuestion(data));
          router.push("/question-bank");
        })
        .catch((error) => {
          setisActive(false);
          console.error(error);
        });
    } catch (error) {
      setisActive(false);
      console.error(error);
      return;
    }
  };

  async function delquiz(itemid, name) {
    setisActive(true);
    try {
      token = sessionStorage.getItem("token");
      const userName = sessionStorage.getItem("user");
      const response = await fetch(
        process.env.API_URL + `api/deleteSavedDraft/${itemid}?user=${userName}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Include the JWT token in the Authorization header
          },
        },
      );

      if (!response.ok) {
        setisActive(false);
        warn("Unable to delete");
      } else {
        setQuiz((prevQuiz) =>
          prevQuiz.filter((quizItem) => quizItem.id !== itemid),
        );
        setisActive(false);
        notify("Quiz " + name + " Deleted");
      }
    } catch (error) {
      setisActive(false);
      console.error(error);
    }
  }

  function handleRedirect() {
    router.push("/question-bank");
  }

  async function checkQuizData() {
    const storedName = sessionStorage.getItem("user");
    const token = sessionStorage.getItem("token");
    try {
      const response = await fetch(
        process.env.API_URL + `api/checksavedquiz?name=${storedName}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Include the JWT token in the Authorization header
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch quiz data");
      }
      const data = await response.json();
      if (data.error == "Auth Failed") {
        sessionStorage.clear();
        router.push("/");
        console.log("unauthorized error in MyQuiz.js");
      } else if (data.error == "Failed to retrieve quizzes") {
        console.log("Server Error failed to load data");
      } else if (data.success == true) {
        console.log("check Quiz", data.result);
        if (data.result < 1) {
          router.push("/question-bank");
        } else {
          return true;
        }
      }
    } catch (error) {
      console.log("catch block MyQuiz.js", error);
    }
  }
  let sno = 1;

  const columns = [
    {
      name: "Name",
      cell: (row) => (
        <span
          tabIndex={0}
          aria-label={`Name ${row.quiz_name}`}
        >
          {row.quiz_name}
        </span>
      ),
      center: true,
      width: "25%",
    },
    {
      name: "Description",
      cell: (row) => (
        <span tabIndex={0} aria-label={`Description ${row.title || ""}`}>
          {row.title || ""}
        </span>
      ),
      center: true,
      width: "25%",
    },
    {
      name: "No. of Ques.",
      cell: (row) => (
        <span
          tabIndex={0}
          aria-label={`Number of Questions ${row.number || 0}`}
        >
          {row.number || 0}
        </span>
      ),
      center: true,
      width: "8%",
    },
    {
      name: "NEC Version",
      cell: (row) => (
        <span tabIndex={0} aria-label={`NEC Version ${row.quiz_year || ""}`}>
          {row.quiz_year || ""}
        </span>
      ),
      center: true,
      width: "9%",
    },
    {
      name: "Date",
      cell: (row) => {
        const date =
          row.created_at !== "0000-00-00" ? extractDate(row.created_at) : "";

        return (
          <span tabIndex={0} aria-label={`Date ${date}`}>
            {date}
          </span>
        );
      },
      center: true,
      width: "10%",
    },
    {
      name: "Action",
      cell: (row) => (
        <div style={{ display: "flex", gap: "3px" }}>
          <button
            className="btn buttonsavemodule"
            onClick={() =>
              fetchQuestions(
                row.question_ids,
                row.quiz_name,
                row.title,
                row.quiz_year || "",
                row.id,
                row.created_at !== "0000-00-00"
                  ? extractDate(row.created_at)
                  : "",
              )
            }
          >
            Open
          </button>
          <button
            className="btn buttonsavemodule"
            onClick={() => delquiz(row.id, row.quiz_name)}
          >
            Delete
          </button>
        </div>
      ),
      width: "23%",
      center: true, // Giving the action column more space
    },
  ];

  return (
    <>
      <Head>
        <title>My Quiz | Snapz Quiz Builder</title>
      </Head>
      {check ? (
        <div className="null"></div>
      ) : (
        <div className={styles.main}>
          <div className={styles.overlay}></div>
          <div className={styles.sec22}>
            <h2>
              <RiSave3Line className={styles.saveicon}></RiSave3Line>
              SAVED QUIZZES
              <button
                className="btn btn-sm btn-light textWithIcons goBackHeading"
                onClick={handleRedirect}
              >
                Back
              </button>
            </h2>

            <LoadingOverlay
              active={isActive}
              text={
                <div
                  style={{
                    position: "fixed",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    zIndex: 10000,
                  }}
                  className="loader"
                >
                  <MoonLoader color="#fff" />
                </div>
              }
            >
              <DataTable
                aria-labelledby="saved-quizzes-heading"
                aria-describedby="saved-quizzes-description"
                columns={columns}
                data={[...quiz].sort(
                  (a, b) =>
                    new Date(b.created_at).getTime() -
                    new Date(a.created_at).getTime(),
                )}
                pagination={false}
                fixedHeader
                fixedHeaderScrollHeight="100vh"
                highlightOnHover
                pointerOnHover
                responsive
                noDataComponent={<div>No quizzes available</div>}
                customStyles={{
                  headCells: {
                    style: {
                      fontSize: "15px",
                      color: "#a42a28",
                      textAlign: "center",
                    },
                  },
                  cells: {
                    style: {
                      fontSize: "15px",
                      textAlign: "center",
                    },
                  },
                }}
              />

              <ToastContainer
                position="top-center"
                autoClose={3500}
                hideProgressBar={false}
                newestOnTop={true}
                closeOnClick
                pauseOnHover
                transition={Slide}
              />
            </LoadingOverlay>
          </div>
        </div>
      )}
    </>
  );
};

export default Save;
