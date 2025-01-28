import Head from "next/head";
import Image from "next/image";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import { FaRegSave, FaTasks } from "react-icons/fa";
import { ImExit } from "react-icons/im";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Cookies from "js-cookie";
import { useDispatch } from "react-redux";
import { resetState } from "@/components/Features/Quiz/QuizSlice";

import Link from "next/link.js";

export default function Home() {
  const router = useRouter();
  const [check, setcheck] = useState();
  const [disabled, setdisabled] = useState(true);
  const [cookres, setcookres] = useState({});
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      localStorage.clear();
      router.push("/");
    } else {
      setcheck(true);
    }
    // const getsession = async () => {
    //   try {
    //     const data = await fetch(
    //       "https://backend-c3b8.onrender.com/moodleapp/testuser",
    //       {
    //         credentials: "include",
    //       }
    //     );
    //     const result = await data.json();
    //     setcookres(result);
    //   } catch (err) {
    //     console.error(err);
    //   }
    // };

    // getsession();
    dispatch(resetState());
    checkQuizData();
  }, []);

  useEffect(() => {
    // not in use anymore after implementing proper login
    console.log(cookres);
    if (cookres.success) {
      localStorage.setItem("user", cookres.username);
      localStorage.setItem("token", cookres.token);
      setcheck(true);
    } else {
      // console.log("index.js cookresUseEffect else");
    }
  }, [cookres]);

  const logout = async () => {
    localStorage.clear();
    // router.push("https://snapz.com");
    router.push("/");
  };

  function handleRedirect() {
    router.push("/MyQuiz");
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
        if (data.result >= 1) {
          setdisabled(false);
        }
      }
    } catch (error) {
      console.log("catch block MyQuiz.js", error);
    }
  }

  return (
    <>
      {check == true ? (
        <div className={styles.maincont}>
          <div className={styles.sec1}>
            <h1 className={styles.heading}>
              <span className={styles.bannerText}>snapz</span>
              <span className={styles.bannerText}>quiz</span>
              <img className={styles.bannerText} src="/thunder.png" alt="" />
              <span className={styles.bannerText}>print</span>
            </h1>

            <div className={styles.btns}>
              <button
                className={`${styles.started} ${
                  disabled == true ? "disabledBtn" : ""
                }`}
                onClick={handleRedirect}
                disabled={disabled}
              >
                <FaRegSave />
                Open a Saved Quiz
              </button>
              <Link href="/QuestionBank" className={styles.started}>
                <FaTasks />
                Create a New Quiz
              </Link>
              <button
                href="/MyQuiz"
                className={styles.started}
                onClick={logout}
              >
                <ImExit />
                Exit the Application
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="null"></div>
      )}
    </>
  );
}
