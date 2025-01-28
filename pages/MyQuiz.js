import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { addQuestion } from "../components/Features/Quiz/QuizSlice";
import { useRouter } from "next/router";
import { RiSave3Line } from "react-icons/ri";
import styles from "../styles/save.module.css";
import { ToastContainer, toast, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoadingOverlay from "react-loading-overlay";
import MoonLoader from "react-spinners/MoonLoader";
import { resetState } from "@/components/Features/Quiz/QuizSlice";
import { postCategory, capitalizeFirstLetterOFWordFromString } from "@/utils/utils";
import DataTable from "react-data-table-component";

const Save = () => {
  const router = useRouter();
  const [quiz, setQuiz] = useState([]);
  const dispatch = useDispatch();
  const [check, setCheck] = useState(true);
  const [quesdata, setquesdata] = useState([]);
  const [isActive, setisActive] = useState(false);

  var token;
  const notify = (data) => {
    toast.success(data);
  };

  const warn = (data) => {
    toast.warning(data);
  };

  useEffect(() => {
    setisActive(true);
    token = localStorage.getItem("token");
    const storedName = localStorage.getItem("user");
    setTimeout(() => {
      if (!token) {
        localStorage.clear();
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
         process.env.API_URL+`getAllQuizzes?name=${storedName}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Include the JWT token in the Authorization header
          },
        }
      );
      if (!response.ok) {
        setisActive(false);
        throw new Error("Failed to fetch quiz data");
      }
      const data = await response.json();
      if (data.error == "Auth Failed") {
        setisActive(false);
        localStorage.clear();
        router.push("/");
        console.log("unauthorized error in MyQuiz.js");
      }
      if (data.status === 429) {
        setisActive(false);
        warn("You have made too many requests.");
        localStorage.clear();
        router.push("/");
      }
      setisActive(false);
      setQuiz(data);
      
    } catch (error) {
      setisActive(false);
      localStorage.clear();
      console.log("catch block MyQuiz.js", error);
    }
  }

  function extractDate(timestamp) {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-indexed
    const day = String(date.getDate()).padStart(2, "0");

    return `${month}-${day}-${year}`;
  }

  function fetchQuestions(questionIds, quizName, quizTitle, quizYear, quizId, quizDate) {
    setisActive(true);
    let idsArray;
    const token = localStorage.getItem("token");
    
    
    try {
      idsArray = JSON.parse(questionIds);
     
      let idsString = idsArray.join(",");

      fetch( process.env.API_URL+`questions?ids=${idsString}`, {
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
          
          localStorage.setItem("QuizName", quizName);
          localStorage.setItem("QuizTitle", quizTitle);
          localStorage.setItem("QuizDate", quizDate);
          localStorage.setItem("PrevQuesIds", questionIds);
          localStorage.setItem("QuizYear", quizYear);
          localStorage.setItem("SpecificQuizId", quizId);


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
  }

  async function delquiz(itemid, name) {
    setisActive(true);
    try {
      token = localStorage.getItem("token");
      const userName = localStorage.getItem("user");
      const response = await fetch(
         process.env.API_URL+`api/deleteSavedDraft/${itemid}?user=${userName}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Include the JWT token in the Authorization header
          },
        }
      );

      if (!response.ok) {
        setisActive(false);
        warn("Unable to delete");
      } else {
        setQuiz((prevQuiz) =>
          prevQuiz.filter((quizItem) => quizItem.id !== itemid)
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
    const storedName = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
         process.env.API_URL+`api/checksavedquiz?name=${storedName}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Include the JWT token in the Authorization header
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch quiz data");
      }
      const data = await response.json();
      if (data.error == "Auth Failed") {
        localStorage.clear();
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
      selector: (row) => capitalizeFirstLetterOFWordFromString (row.quiz_name),
      center: true,
      width:"20%",
    },
    {
      name: "Description",
      selector: (row) => row.title,
      center: true,
      width:"20%",
    },
    {
      name: "No. of Ques.",
      selector: (row) => row.number,
      center: true,
      width:"10%",
    },
    {
      name: "Quiz Year",
      selector: (row) => row.quiz_year,
      center: true,
      width:"10%",
    },
    {
      name: "Date",
      selector: (row) => (row.timestamp !== "0000-00-00" ? extractDate(row.timestamp) : ""),
      center: true,
      width:"15%", // Setting a smaller width for the date column
    },
    {
      name: "Action",
      cell: (row) => (
        <div style={{ display: 'flex', gap: '3px'}}>
          <button
            className="btn buttonsavemodule"
            onClick={() => fetchQuestions(
              row.question_ids,
              row.quiz_name,
              row.title,
              row.quiz_year || "",
              row.id,
              row.timestamp !== "0000-00-00" ? extractDate(row.timestamp) : ""
            )}
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
      width: "25%",
      center: true,  // Giving the action column more space
    },
  ];

  return (
    <>
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
                  onClick={handleRedirect} >                  
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
                  columns={columns}
                  data={quiz}
                  pagination={false}
                  fixedHeader
                  fixedHeaderScrollHeight="500px"
                  highlightOnHover
                  pointerOnHover
                  responsive
                  noDataComponent={<div>No quizzes available</div>}
                  customStyles={{
                    headCells: {
                      style: {
                        fontSize: '15px',
                        color: '#a42a28',
                        textAlign: 'center',
                      },
                    },
                    cells: {
                      style: {
                        fontSize: '15px',
                        textAlign: 'center',
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
