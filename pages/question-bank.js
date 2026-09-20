import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import moment from "moment-timezone";
import _ from "lodash";
import { CgCloseR } from "react-icons/cg";
import { VscDebugBreakpointLog } from "react-icons/vsc";
import LoadingOverlay from "react-loading-overlay";
import { FaFolderOpen } from "react-icons/fa";
import MoonLoader from "react-spinners/MoonLoader";
import styles from "../styles/quesbank.module.css";
import { motion } from "framer-motion";
import Test from "../components/Test";
import { ToastContainer, toast, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import es from "date-fns/locale/es";
import enUS from "date-fns/locale/en-US";
import { BiSolidWindowAlt } from "react-icons/bi";
import { PiFloppyDiskBold } from "react-icons/pi";
import { AiFillPrinter } from "react-icons/ai";
import Tippy from "@tippyjs/react";
import { HiMiniMagnifyingGlass } from "react-icons/hi2";
import "tippy.js/dist/tippy.css";

import Model from "../components/Model";
import {
  cullquestions,
  toLowerCase,
  removeDuplicatesFromArrayOfObjectByObjKey,
  isValidYYmmddFormat,
} from "@/utils/utils";
import { useSelector, useDispatch } from "react-redux";
import Swal from "sweetalert2";
import {
  getCategory,
  postCategory,
  checkQuizData,
  extractQuestionForAllCategory,
} from "@/utils/utils";
import Modal from "react-bootstrap/Modal";
import { totalQuestions } from "@/components/Features/AddedQuestions/AddedQuestion";
import Head from "next/head";

registerLocale("es", es);
registerLocale("en-US", enUS);

function QuestionBankPage() {
  const storeQuiz = useSelector((state) => state.questions);
  const dispatch = useDispatch();
  const latestQuestion = storeQuiz[storeQuiz.length - 1];

  const allQuestionIdsArr = latestQuestion?.map((item) => item.question_id);
  const uniqueAllQuestionIdsArr = [...new Set(allQuestionIdsArr)];

  const [tip, settip] = useState(true);
  const [sessionerr, setsessionerr] = useState(false);
  const [checker, setchecker] = useState(false);
  const [allQuizName, setAllQuizName] = useState([]);
  const [allQuizNameId, setAllQuizNameId] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [allQuestions, setAllQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [title, settitle] = useState("");
  const [name, setname] = useState("");
  const [filterid, setfilterid] = useState({});
  const [randomlimit, setrandomlimit] = useState("");
  const [SelectedQuestionIds, setSelectedQuestionIds] = useState([]);

  const [randomQues, setRandomQues] = useState(false);
  const [randomQuesIds, setRandomQuesIds] = useState();
  const [solutionSet, setsolutionSet] = useState([]);
  const [isActive, setisActive] = useState(false);
  const [tagData, settagData] = useState([]);
  const [tname, settname] = useState("");
  const [filterCountTrack, setfilterCountTrack] = useState({});
  const [category14, setCategory14] = useState([]);
  const [category17, setCategory17] = useState([]);
  const [category20, setCategory20] = useState([]);
  const [category23, setCategory23] = useState([]);
  const [theory, setTheory] = useState([]);
  const [All, setAll] = useState();
  const [accordianSet, setAccordianSet] = useState(true);
  const [categoryToggle, setcategoryToggle] = useState("-");
  const [defaultList, setDefaultList] = useState([]);
  const [quizStateDate, setQuizStateDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [initial17, setInitial17] = useState([]);
  const [initial20, setInitial20] = useState([]);
  const [initial23, setInitial23] = useState([]);
  const [initialTheory, setInitialTheory] = useState([]);
  const [show, setShow] = useState(false);
  const [buttonAction, setButtonAction] = useState({ open: false, new: false });

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const [previewQues, setPreviewQues] = useState("");
  const [previewCorrectAnswer, setPreviewCorrectAnswer] = useState("");
  const [previewSolution, setPreviewSolution] = useState("");
  const previewContentRef = useRef(null);
  const questionBankPanelRef = useRef(null);
  const quizPanelRef = useRef(null);
  const lastQuestionBankFocusRef = useRef(null);
  const pendingQuestionBankFocusRef = useRef(null);
  const questionBankFocusTimerRef = useRef([]);
  const [singleQuestionCategory, setSingleQuestinCategory] = useState("");
  const [selectableRandomQuestion, setSelectableRandomQuestion] = useState(0);

  const [difficultyMessage, setDifficultyMessage] = useState("");
  const [deleteAnnouncement, setDeleteAnnouncement] = useState("");
  const [expandAnnouncement, setExpandAnnouncement] = useState("");

  const router = useRouter();
  var newquestionIds;
  var token;
  const mathJaxScriptSrc =
    "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js";

  const currentTimezone = moment.tz.guess();
  const currentDateFormat = moment().tz(currentTimezone).format("MM-DD-YYYY");

  const restoreQuestionBankFocusAfterUpdate = (questionId, control) => {
    pendingQuestionBankFocusRef.current = {
      questionId: String(questionId),
      control,
    };
  };

  const focusPendingQuestionBankControl = () => {
    const pendingFocus = pendingQuestionBankFocusRef.current;
    if (!pendingFocus) return;

    const focusTarget = Array.from(
      questionBankPanelRef.current?.querySelectorAll(
        "[data-question-bank-question-id]",
      ) || [],
    ).find(
      (element) =>
        element.dataset.questionBankQuestionId === pendingFocus.questionId &&
        element.dataset.questionBankControl === pendingFocus.control,
    );

    if (focusTarget) {
      focusTarget.focus({ preventScroll: true });
      lastQuestionBankFocusRef.current = focusTarget;
    }
  };

  const clearQuestionBankFocusTimers = () => {
    questionBankFocusTimerRef.current.forEach((timer) => clearTimeout(timer));
    questionBankFocusTimerRef.current = [];
  };

  const scheduleQuestionBankFocusRestore = () => {
    clearQuestionBankFocusTimers();

    [0, 50, 150, 300].forEach((delay, index, delays) => {
      const timer = setTimeout(() => {
        focusPendingQuestionBankControl();

        if (index === delays.length - 1) {
          pendingQuestionBankFocusRef.current = null;
          questionBankFocusTimerRef.current = [];
        }
      }, delay);

      questionBankFocusTimerRef.current.push(timer);
    });
  };

  const handleQuestionBankControlMouseDown = (event, questionId, control) => {
    restoreQuestionBankFocusAfterUpdate(questionId, control);
    event.currentTarget.focus({ preventScroll: true });
    lastQuestionBankFocusRef.current = event.currentTarget;
    scheduleQuestionBankFocusRestore();
  };

  const toggleQuestionSelection = (questionId) => {
    restoreQuestionBankFocusAfterUpdate(questionId, "action");
    scheduleQuestionBankFocusRestore();
    const isSelected = SelectedQuestionIds.includes(questionId);
    if (isSelected) {
      // Remove the question
      setSelectedQuestions((prev) =>
        prev.filter((q) => q.question_id !== questionId),
      );
      setSelectedQuestionIds((prev) => prev.filter((id) => id !== questionId));
    } else {
      // Add the question (max 100)
      if (selectedQuestions.length >= 100) {
        warn("You can only select up to 100 questions.");
        return;
      }
      const question = questions.find((q) => q.question_id === questionId);
      if (question) {
        setSelectedQuestions((prev) => [...prev, question]);
        setSelectedQuestionIds((prev) => [...prev, questionId]);
      }
    }
  };

  useEffect(() => {
    dispatch(totalQuestions(selectedQuestions.length));
  }, [selectedQuestions]);

  useEffect(() => {
    if (!pendingQuestionBankFocusRef.current) return;

    scheduleQuestionBankFocusRestore();
  }, [SelectedQuestionIds]);

  useEffect(() => clearQuestionBankFocusTimers, []);

  useEffect(() => {
    token = sessionStorage.getItem("token");
    const quizUserName = sessionStorage.getItem("user");
    const QuizName = sessionStorage.getItem("QuizName");
    const QuizTitle = sessionStorage.getItem("QuizTitle");
    const QuizDate = sessionStorage.getItem("QuizDate");

    setQuestions([]);
    setSelectedQuestions([]);
    if (!token) {
      sessionStorage.clear();
      router.push("/");
    } else {
      getCategory().then((result) => {
        if (result?.length > 0) {
          setcategoryToggle(result[0]?.category);
        }
      });

      if (storeQuiz.length > 0) {
        setTimeout(() => {
          notify("Quiz loaded");

          setSelectedQuestions(latestQuestion);
          setname(QuizName || "");
          settitle(QuizTitle);
          QuizDate && setQuizStateDate(convertDateFormatToYYYYMMDD(QuizDate));
          newquestionIds = latestQuestion?.map((item) => item.question_id);
          setSelectedQuestionIds(SelectedQuestionIds.concat(newquestionIds));
        }, 1000);
      }

      //////////////////// Get All Quizzes ///////////////
      fetchQuiz(token, quizUserName);
    }
  }, []);

  useEffect(() => {
    if (buttonAction.open) {
      openDialogBoxBeforeSave();
    }

    if (buttonAction.new) {
      openDialogBoxBeforeSave();
    }
  }, [buttonAction]);

  useEffect(() => {
    if (filterid.id && filterid.name) {
      fetchQuestions1();
      setQuestions([]);
    }
  }, [filterid]);

  useEffect(() => {
    // Announce the expanded chapter/article name and the total number of
    // questions now available, once loading has finished. isActive is the
    // existing loading flag set/cleared inside fetchQuestions1.
    if (filterid.id && filterid.name && !isActive) {
      const count = questions?.length ?? 0;
      setExpandAnnouncement(
        `${filterid.name} expanded. ${count} question${count === 1 ? "" : "s"} available.`,
      );
    }
  }, [questions, isActive, filterid]);

  useEffect(() => {
    if (questions) {
      setchecker(true);
    }
  }, [questions]);

  // useEffect for solutionSet printing removed in favor of direct execution in handlePrintSolutionSet

  useEffect(() => {
    if (tagData.length > 0) {
      filterQuestionByTags();
    }
  }, [tagData]);

  useEffect(() => {
    if (!show || !previewContentRef.current) return;

    typesetMathInDocument(document, [previewContentRef.current], true);
    const retryTimer1 = setTimeout(() => {
      typesetMathInDocument(document, [previewContentRef.current], true);
    }, 300);
    const retryTimer2 = setTimeout(() => {
      typesetMathInDocument(document, [previewContentRef.current], true);
    }, 900);

    return () => {
      clearTimeout(retryTimer1);
      clearTimeout(retryTimer2);
    };
  }, [show, previewQues, previewCorrectAnswer, previewSolution]);

  useEffect(() => {
    const getFirstFocusableQuizControl = () => {
      const focusableSelectors = [
        "button:not([disabled])",
        "[href]",
        "input:not([disabled])",
        "select:not([disabled])",
        "textarea:not([disabled])",
        '[tabindex]:not([tabindex="-1"])',
      ].join(",");

      return Array.from(
        quizPanelRef.current?.querySelectorAll(focusableSelectors) || [],
      ).find((element) => {
        const tabIndex = Number(element.getAttribute("tabindex"));
        const isHidden =
          element.offsetParent === null &&
          getComputedStyle(element).position !== "fixed";

        return Number.isNaN(tabIndex) || tabIndex >= 0 ? !isHidden : false;
      });
    };

    const handlePanelNavigation = (event) => {
      if (
        event.key !== "F6" ||
        !event.ctrlKey ||
        event.altKey ||
        event.shiftKey ||
        event.repeat
      ) {
        return;
      }

      const activeElement = document.activeElement;
      const isInQuestionBank =
        questionBankPanelRef.current?.contains(activeElement);
      const isInQuiz = quizPanelRef.current?.contains(activeElement);

      if (isInQuestionBank) {
        event.preventDefault();
        lastQuestionBankFocusRef.current = activeElement;
        getFirstFocusableQuizControl()?.focus();
      } else if (isInQuiz) {
        event.preventDefault();
        const previousQuestionBankFocus = lastQuestionBankFocusRef.current;
        const focusTarget =
          previousQuestionBankFocus?.isConnected &&
            questionBankPanelRef.current?.contains(previousQuestionBankFocus)
            ? previousQuestionBankFocus
            : questionBankPanelRef.current;

        focusTarget?.focus({ preventScroll: true });
      }
    };

    document.addEventListener("keydown", handlePanelNavigation);
    return () => document.removeEventListener("keydown", handlePanelNavigation);
  }, []);

  //function to refresh page
  function refreshPage() {
    sessionStorage.setItem("SpecificQuizId", "");
    setname("");
    settitle("");
    setSelectedQuestions([]);
    setSelectedQuestionIds([]);
    //window.location.reload();
  }

  const updateQuestionsToLatestQuestions = async (token, questionIds) => {
    const SpecificQuizId = sessionStorage.getItem("SpecificQuizId");
    const questionIdsData = { questionIds: questionIds, id: SpecificQuizId };

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
      const { latestQuestionIds } = result;
      if (result?.latestQuestionIds?.length) {
        sessionStorage.setItem("PrevQuesIds", [result?.latestQuestionIds]);
      }
    } catch (err) {
      console.log(err);
    }
  };

  function generateTagName(tagid) {
    if (tagid == 10) {
      return "Easy";
    } else if (tagid == 14) {
      return "Med";
    } else if (tagid == 17) {
      return "Hard";
    } else {
      return "-";
    }
  }

  function generateTagId(tagName) {
    if (tagName == "easy" || tagName == "Easy") {
      return 10;
    } else if (tagName == "medium" || tagName == "Medium") {
      return 14;
    } else if (tagName == "hard" || tagName == "Hard") {
      return 17;
    } else {
      return "-";
    }
  }

  function handleCategoryChange(category) {
    if (category) {
      const scrollDiv = document.querySelector(`.${styles.sec2}`);
      if (scrollDiv) {
        scrollDiv.scrollTop = 0;
      }

      if (selectedQuestions.length > 0) {
        Swal.fire({
          title: "Save your changes before changing the year?",
          text: "Do you want to save your changes before loading new questions!",
          icon: "warning",
          showDenyButton: true,
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Save",
          denyButtonText: `Don't save`,
          cancelButtonText: "Cancel",
        }).then((result) => {
          if (result.isConfirmed) {
            // Custom function for Save button
            openDialogBoxBeforeSave();

            // savequiz();
          } else if (result.isDenied) {
            // Custom function for Don't Save button

            //refreshPage();
            sessionStorage.setItem("QuizName", "");
            sessionStorage.setItem("QuizTitle", "");
            sessionStorage.setItem("QuizDate", "");
            sessionStorage.setItem("PrevQuesIds", "");
            sessionStorage.setItem("QuizYear", "");
            sessionStorage.setItem("SpecificQuizId", "");
            ////////////// remove selected question from selected year ///////////////
            setSelectedQuestions([]);

            /////////////// change year ///////////////
            setSingleQuestinCategory("");
            setname("");
            setcategoryToggle(category);
            settname("All");
            postCategory(category);
            setfilterid({});
            setSelectableRandomQuestion(0);
            setQuestions([]);
            setAllQuestions([]);
            notify("Category changed to " + category);
          } else {
            // Custom function for Cancel button
          }
        });
      } else {
        setSingleQuestinCategory("");
        setname("");
        setcategoryToggle(category);
        settname("All");
        postCategory(category);
        setfilterid({});
        setSelectableRandomQuestion(0);
        setQuestions([]);
        setAllQuestions([]);

        notify("Category changed to " + category);
      }
    }
  }

  //function to fetch data for difficulty filter
  async function handleDifficulty(tagType) {
    if (filterCountTrack.name == tagType && filterCountTrack.count == 1) {
      warn("Already filtered");
    } else {
      settname(tagType);
      if (allQuestions.length > 0) {
        try {
          setisActive(true);
          const tagdataid = generateTagId(tagType);
          const filter_question = allQuestions.filter(
            (item) => item.tagid == tagdataid,
          );
          if (filter_question?.length) {
            setQuestions(filter_question);
            setSelectableRandomQuestion(filter_question?.length);

            setDifficultyMessage(`${tagType} questions filter applied.`);

            notify("Questions Filtered");
          } else {
            setQuestions([]);
            setSelectableRandomQuestion(0);

            setDifficultyMessage(`No ${tagType} questions available.`);

            warn(
              "No " + tagType + " questions in this category",
              "Category Empty",
            );
          }
          setisActive(false);
        } catch (error) {
          console.log("error while fetching");
        }
      }
    }
  }

  async function handleOpenRedirect(name) {
    if (name == "Open") {
      if (selectedQuestions.length > 0) {
        Swal.fire({
          title: "Save before leaving ?",
          text: "Do you want to save your quiz before leaving this page!",
          icon: "warning",
          showDenyButton: true,
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Save",
          denyButtonText: `Don't save`,
          cancelButtonText: "Cancel",
        }).then(async (result) => {
          if (result.isConfirmed) {
            setButtonAction({ ...buttonAction, open: true });
          } else if (result.isDenied) {
            const checkQuiz = await checkQuizData();
            sessionStorage.setItem("QuizName", "");
            sessionStorage.setItem("QuizTitle", "");
            sessionStorage.setItem("QuizDate", "");
            sessionStorage.setItem("PrevQuesIds", "");
            sessionStorage.setItem("QuizYear", "");
            sessionStorage.setItem("SpecificQuizId", "");

            setSelectedQuestions([]);
            if (checkQuiz) {
              router.push("/MyQuiz");
            } else {
              warn("No Saved Quizzes", "");
            }
          } else {
            // Custom function for Cancel button
          }
        });
      } else {
        setisActive(true);

        const checkData = await checkQuizData();

        if (checkData) {
          router.push("/MyQuiz");
        } else {
          setisActive(false);
          warn("No Saved Quizzes", "");
        }
      }
    } else {
      if (selectedQuestions.length > 0) {
        Swal.fire({
          title: "Save your quiz?",
          text: "Do you want to save your quiz before loading new instance!",
          icon: "warning",
          showDenyButton: true,
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Save",
          denyButtonText: `Don't save`,
          cancelButtonText: "Cancel",
        }).then((result) => {
          if (result.isConfirmed) {
            // Custom function for Save button

            setButtonAction({ ...buttonAction, new: true });
            setSelectedQuestions([]);
            // savequiz();
          } else if (result.isDenied) {
            // Custom function for Don't Save button
            sessionStorage.setItem("QuizName", "");
            sessionStorage.setItem("QuizTitle", "");
            sessionStorage.setItem("QuizDate", "");
            sessionStorage.setItem("PrevQuesIds", "");
            sessionStorage.setItem("QuizYear", "");
            sessionStorage.setItem("SpecificQuizId", "");
            refreshPage();
          } else {
            // Custom function for Cancel button
          }
        });
      } else {
        refreshPage();
      }
    }
  }

  //function to filter data by tags by sorting
  function filterQuestionByTags() {
    const arr = [];
    const arr2 = [];
    const newArray = [];
    const matchingObjects = [];

    if (questions.length > 0 && tagData.length > 0) {
      questions?.map((item, index) => {
        arr[index] = item.question_id;
      });
      tagData.map((item, index) => {
        arr2[index] = item.question_id;
      });
      for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < arr2.length; j++) {
          if (arr[i] == arr2[j]) {
            newArray.push(arr[i]);
          }
        }
      }
      // Iterate through the ID array
      for (const id of newArray) {
        // Find the object with a matching questionId
        const matchingObject = questions.find((obj) => obj.question_id === id);

        if (matchingObject) {
          matchingObjects.push(matchingObject);
        }
      }

      if (matchingObjects.length > 0) {
        setfilterCountTrack({ name: tname, count: 1 });
        setQuestions(matchingObjects);
        setSelectableRandomQuestion(matchingObjects.length);
        notify("Questions Filtered");
      } else {
        setQuestions([]);
        setSelectableRandomQuestion(0);
        warn("No " + tname + " questions in this category", "Category Empty");
      }
    } else {
      warn("Cannot filter questions.", "");
    }
  }

  function removeButtonsAndElementsWithId(htmlString) {
    //function to remove extra buttons and id from solutions.
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");

    // Remove buttons
    const buttons = doc.querySelectorAll("button");
    buttons.forEach((button) => button.remove());

    // Remove elements with id containing "QID"
    const idToRemove = "QID";
    const elementsToRemove = doc.querySelectorAll(`[id*="${idToRemove}"]`);
    elementsToRemove.forEach((element) => {
      element.remove();
    });

    const modifiedHTMLString = doc.body.innerHTML;
    return modifiedHTMLString;
  }

  function getMathJaxConfigScript() {
    return `<script>
      window.MathJax = {
        tex: {
          inlineMath: [['\\\\(', '\\\\)'], ['$', '$']],
          displayMath: [['\\\\[', '\\\\]'], ['$$', '$$']],
          processEscapes: true
        },
        options: {
          skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code']
        }
      };
    </script>`;
  }

  function typesetMathInDocument(
    targetDocument,
    elements = null,
    force = false,
  ) {
    if (!targetDocument || !targetDocument.defaultView) {
      return Promise.resolve();
    }

    const runTypeset = () => {
      const availableMathJax = targetDocument.defaultView?.MathJax;
      if (
        availableMathJax &&
        typeof availableMathJax.typesetPromise === "function"
      ) {
        const targets = elements?.length ? elements : undefined;
        if (force && typeof availableMathJax.typesetClear === "function") {
          availableMathJax.typesetClear(targets);
        }
        return availableMathJax
          .typesetPromise(targets)
          .catch((err) => console.log("MathJax typeset error:", err));
      }
      return null;
    };

    const promise = runTypeset();
    if (promise) return promise;

    return new Promise((resolve) => {
      let resolved = false;
      const done = () => {
        if (!resolved) {
          resolved = true;
          resolve();
        }
      };

      const existingScript = targetDocument.getElementById("mathjax-script");
      if (existingScript) {
        existingScript.addEventListener(
          "load",
          () => {
            const p = runTypeset();
            if (p) p.then(done);
            else done();
          },
          { once: true },
        );
        setTimeout(() => {
          const p = runTypeset();
          if (p) p.then(done);
          else done();
        }, 300);
        setTimeout(() => {
          const p = runTypeset();
          if (p) p.then(done);
          else done();
        }, 1200);
        setTimeout(done, 2500);
        return;
      }

      if (!targetDocument.getElementById("mathjax-config-script")) {
        const configScript = targetDocument.createElement("script");
        configScript.id = "mathjax-config-script";
        configScript.text = `
          window.MathJax = {
            tex: {
              inlineMath: [['\\\\(', '\\\\)'], ['$', '$']],
              displayMath: [['\\\\[', '\\\\]'], ['$$', '$$']],
              processEscapes: true
            },
            options: {
              skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code']
            }
          };
        `;
        targetDocument.head.appendChild(configScript);
      }

      const script = targetDocument.createElement("script");
      script.id = "mathjax-script";
      script.async = true;
      script.src = mathJaxScriptSrc;
      script.onload = () => {
        const p = runTypeset();
        if (p) p.then(done);
        else done();
      };
      script.onerror = done;
      targetDocument.head.appendChild(script);

      setTimeout(done, 3000);
    });
  }

  const printViaIframe = async (htmlContent) => {
    let iframe = document.getElementById("snapz-print-iframe");
    if (!iframe) {
      iframe = document.createElement("iframe");
      iframe.id = "snapz-print-iframe";
      iframe.style.position = "fixed";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "0";
      iframe.style.visibility = "hidden";
      document.body.appendChild(iframe);
    }

    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

    iframeDoc.open();
    iframeDoc.write(htmlContent);
    iframeDoc.close();

    const waitForStylesheets = () => {
      const links = Array.from(
        iframeDoc.querySelectorAll('link[rel="stylesheet"]'),
      );
      return Promise.all(
        links.map((link) => {
          if (link.sheet) return Promise.resolve();
          return new Promise((resolve) => {
            link.onload = resolve;
            link.onerror = resolve;
            setTimeout(resolve, 1000);
          });
        }),
      );
    };

    const waitForImages = () => {
      const images = Array.from(iframeDoc.images || []);
      return Promise.all(
        images.map((img) => {
          if (img.complete && img.naturalHeight !== 0) return Promise.resolve();
          return new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
            setTimeout(resolve, 1000);
          });
        }),
      );
    };

    try {
      await waitForStylesheets();
      await typesetMathInDocument(iframeDoc);
      await waitForImages();
      if (iframeDoc.fonts && iframeDoc.fonts.ready) {
        await iframeDoc.fonts.ready;
      }
    } catch (err) {
      console.log("Error preparing iframe print:", err);
    }

    setTimeout(() => {
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      }
    }, 150);
  };

  function escapeHtmlForPrint(text) {
    return String(text ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function normalizeLatexForPreview(htmlContent) {
    if (typeof htmlContent !== "string") return "";
    return htmlContent
      .replace(/\\\\\(/g, "\\(")
      .replace(/\\\\\)/g, "\\)")
      .replace(/\\\\\[/g, "\\[")
      .replace(/\\\\\]/g, "\\]");
  }

  function getQuestionTextForSolutionPrint(questionText) {
    let extractedText = extractQuestionForAllCategory(questionText || "");
    extractedText = extractedText
      .replace(/QID[:\s-]*\d{2}[-–]{1,2}\d{5}/gi, "")
      .replace(/^Question\s*/i, "")
      .replace(/\s+/g, " ")
      .trim();
    return extractedText;
  }

  function cleanSolutionText(htmlString) {
  if (!htmlString) return "";
  try {
    return htmlString.replace(
      /<p class="text-center">The correct answer is:.*?<\/p>/,
      ""
    );
  } catch (error) {
    return htmlString;
  }
}

  function getChoicesForSolutionPrint(question) {
    const uniqueAnswers = removeDuplicatesFromArrayOfObjectByObjKey(
      getQuestionAnswers(question),
    );

    return uniqueAnswers.map((answer, index) => {
      const letter = String.fromCharCode(65 + index);
      const answerHtml = getAnswerHtml(answer);
      const optionText =
        extractOptionText(answerHtml) || extractAnswerText(answerHtml);

      return {
        letter,
        answerId: answer?.answer_id,
        optionText: optionText?.replace(/\s+/g, " ").trim(),
      };
    });
  }

  //function to print the solution set
  const printSolutionSet = (solutionsData = null) => {
    const dataToUse = solutionsData || solutionSet;
    if (!selectedQuestions || selectedQuestions.length === 0) return;

    const printContent = selectedQuestions
      .map((question, index) => {
        const questionText = getQuestionTextForSolutionPrint(
          question.question_text,
        );
        const choices = getChoicesForSolutionPrint(question);
        const correctChoice = choices.find(
          (choice) =>
            String(choice.answerId) === String(question.correct_answer),
        );

        const solutionItem =
          dataToUse?.find(
            (s) =>
              String(s?.question_id || s?.id) === String(question.question_id),
          ) || dataToUse?.[index];

        const rawSolutionHtml = solutionItem?.general_feedback || "";
        const solutionHtml = removeButtonsAndElementsWithId(rawSolutionHtml);

        const choicesHtml = choices
          .map(
            (choice) =>
              `<div><strong>${choice.letter}.</strong> ${escapeHtmlForPrint(
                choice.optionText,
              )}</div>`,
          )
          .join("");

        return `
          <div class="container solution-print-block">
            <div class="question-label"><strong>Question ${index + 1}:</strong></div>
            <div class="question-text">${escapeHtmlForPrint(questionText)}</div>
            <div class="choices-box">${choicesHtml}</div>
            <div class="correct-answer-box"><strong>Correct Answer- ${correctChoice?.letter || "-"}.</strong></div>
            <div class="solution-content">${solutionHtml}</div>
          </div>
          <br/>
        `;
      })
      .join("");

    const titleHtml = name?.trim()
      ? `<h1 class="topHeadingQuizPage">${escapeHtmlForPrint(name)}</h1>`
      : "";

    const htmlContent = `<!DOCTYPE html>
      <html>
        <head>
          <title>${name?.trim() ? escapeHtmlForPrint(name) + " - Solutions" : "Solutions"}</title>
          <style>
            body {
              margin: 0;
              padding: 15px 24px;
              font-family: system-ui, -apple-system, sans-serif;
            }
            .topHeadingQuizPage{
              text-align:center;
              text-transform:none;
              margin-bottom: 20px;
            }
            .solution-print-block {
              margin-bottom: 22px;
            }
            .question-label {
              display: inline-block;
              margin-bottom: 10px;
            }
            .question-text {
              margin-bottom: 10px;
            }
            .choices-box {
              margin-bottom: 10px;
            }
            .choices-box div {
              margin: 2px 0;
            }
            .correct-answer-box {
              display: inline-block;
              margin-bottom: 12px;
            }
            .solution-content {
              margin-top: 8px;
            }
            @media print {
              .container {
                page-break-inside: avoid;
              }
            }
          </style>
          <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-T3c6CoIi6uLrA9TneNEoa7RxnatzjcDSCmG1MXxSR1GAsXEV/Dwwykc2MPK8M2HN" crossorigin="anonymous">
          <link rel="stylesheet" href="https://snapz.com/wp-content/uploads/snapz-print.css">
          ${getMathJaxConfigScript()}
          <script id="mathjax-script" async src="${mathJaxScriptSrc}"></script>
        </head>
        <body>
          ${titleHtml}
          ${printContent}
        </body>
      </html>`;

    printViaIframe(htmlContent);
  };
  //function to fetch solution set for selected questions
  const handlePrintSolutionSet = async () => {
    if (selectedQuestions.length > 0) {
      token = sessionStorage.getItem("token");
      setisActive(true);
      var filteredIds = [];
      selectedQuestions.filter((item) => filteredIds.push(item.question_id));
      try {
        const solution = await fetch(
          process.env.API_URL + `api/generalfeedback?ids=${filteredIds}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`, // Include the JWT token in the Authorization header
            },
          },
        );
        const solutions = await solution.json();

        setsolutionSet(solutions);
        setisActive(false);
        printSolutionSet(solutions);
      } catch (err) {
        setisActive(false);
      }
    } else {
      warn("Select questions first", "");
    }
  };

  function disabletooltips() {
    if (tip == true) {
      settip(false);
      notify("Tooltips Enabled");
    } else {
      settip(true);
      notify("Tooltips Disabled");
    }
  }

  const notify = (data) => {
    toast.success(data, {
      bodyClassName: "custom-toast-body",
      position: toast.POSITION.TOP_CENTER,
    });
  };
  const warn = (data, message = null) => {
    Swal.fire(message ? message : "", data, "warning");
  };

  const showReplacePopUp = (foundQuiz) => {
    token = sessionStorage.getItem("token");
    const username = sessionStorage.getItem("user");

    const num = SelectedQuestionIds.length;

    let quizDate = quizStateDate;
    if (quizDate) {
      let checkDateFormat = isValidYYmmddFormat(quizStateDate);
      if (!checkDateFormat) {
        quizDate = convertDateFormatToYYYYMMDD(quizStateDate);
      }
    }
    Swal.fire({
      title: "Replace your quiz?",
      text: "A quiz by that name already exists. Do you want to replace it?",
      icon: "warning",
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes",
      denyButtonText: `No`,
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        // Custom function for Save button
        let todayDate = moment().tz(currentTimezone).format("YYYY-MM-DD");
        const quizData = {
          quizName: foundQuiz.quiz_name,
          questionIds: SelectedQuestionIds,
          number_ques: num,
          title: title,
          username: username,
          Date: todayDate,
          quiz_year: categoryToggle,
          id: foundQuiz.quiz_id,
        };

        ///////////// Update quiz  //////////////////////
        quizUpdate(quizData);
      } else if (result.isDenied) {
        // Custom function for Don't Save button

        openDialogBoxBeforeSave();
      } else {
        // Custom function for Cancel button
      }
    });
  };

  const updateQuiz = () => {
    updateQuizData();
  };

  const openDialogBoxBeforeSave = () => {
    const PrevQuesIds = sessionStorage.getItem("PrevQuesIds");

    const SpecificQuizId = sessionStorage.getItem("SpecificQuizId");

    //////////////////// Get All Quizzes ///////////////

    if (SpecificQuizId) {
      updateQuizData();
    } else {
      Swal.fire({
        input: "text",
        inputAttributes: {
          autocapitalize: "off",
        },
        inputLabel: "Quiz name :",
        inputValue: name,
        text: "Save your quiz ?",
        showDenyButton: false,
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Save",
        //denyButtonText: `Delete`,
        cancelButtonText: "Cancel",
        preConfirm: (inputValue) => {
          if (!inputValue) {
            Swal.showValidationMessage("Quiz name is required.");
          }
          if (!name) {
            setname(inputValue);
          }
        },
      }).then((result) => {
        if (result.isConfirmed) {
          const foundQuiz = allQuizNameId.find(
            (quiz) => quiz.quiz_name === toLowerCase(result?.value),
          );

          setname((prev) => result?.value);

          if (foundQuiz != undefined && foundQuiz.quiz_id != SpecificQuizId) {
            showReplacePopUp(foundQuiz);
          } else {
            savequiz(result?.value);
          }
        } else {
          // Custom function for Cancel button
        }
      });
    }
  };

  const openDialogBoxOnSaveAs = () => {
    //if (name != "" && title != "" && quizStateDate != "") {
    const PrevQuesIds = sessionStorage.getItem("PrevQuesIds");
    const SpecificQuizId = sessionStorage.getItem("SpecificQuizId");

    //////////////////// Get All Quizzes ///////////////

    Swal.fire({
      input: "text",
      inputAttributes: {
        autocapitalize: "off",
      },
      inputLabel: "Quiz name :",
      inputValue: name,
      text: "Save your quiz ?",
      showDenyButton: false,
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Save",
      //denyButtonText: `Delete`,
      cancelButtonText: "Cancel",
      preConfirm: (inputValue) => {
        if (!inputValue) {
          Swal.showValidationMessage("Quiz name is required.");
        }
        if (!name) {
          setname(inputValue);
        }
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const foundQuiz = allQuizNameId.find(
          (quiz) => quiz.quiz_name === toLowerCase(result?.value),
        );
        console.log("foundQuiz", foundQuiz, SpecificQuizId);

        setname(result?.value);

        if (foundQuiz != undefined && foundQuiz.quiz_id != SpecificQuizId) {
          showReplacePopUp(foundQuiz);
        } else {
          console.log("foundQuiz 1savequiz", result?.value);
          savequiz(result?.value);
        }
      } else {
        // Custom function for Cancel button
      }
    });
  };

  const savequiz = async (quizNameFromPopUp = null) => {
    // console.log("save fucntion hit");

    if (selectedQuestions.length == 0) {
      warn("Quiz is empty.", "");
    } else {
      //////////////// quiz save code start /////////////

      token = sessionStorage.getItem("token");
      const username = sessionStorage.getItem("user");

      const num = SelectedQuestionIds.length;
      // ---------------------
      let currentQuizName =
        quizNameFromPopUp != null ? quizNameFromPopUp : name;
      let currentQuizNameLower = toLowerCase(currentQuizName);
      // ---------------------
      let todayDate = moment().tz(currentTimezone).format("YYYY-MM-DD");
      const quizData = {
        quizName: currentQuizName,
        questionIds: SelectedQuestionIds,
        number_ques: num,
        title: title,
        username: username,
        Date: todayDate,
        quiz_year: categoryToggle,
      };
      console.log("save fucntion hit currentQuizName", currentQuizName);
      ///////////// quiz name is same but questions is updated //////////////////////
      if (currentQuizName == "") {
        Swal.fire({
          input: "text",
          inputAttributes: {
            autocapitalize: "off",
          },
          inputLabel: "Quiz name :",
          inputValue: name,
          text: "You changed some questions of this quiz. Please update Quiz name ?",
          showDenyButton: false,
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Save",
          cancelButtonText: "Cancel",
          preConfirm: (inputValue) => {
            const exists = allQuizName.includes(toLowerCase(inputValue));
            if (!inputValue) {
              Swal.showValidationMessage("You need to enter Quiz name!");
            } else if (exists) {
              Swal.showValidationMessage(
                "You need to change Quiz name. This is already exist",
              );
            }
          },
        }).then((result) => {
          if (result.isConfirmed) {
            const exists = allQuizName.includes(toLowerCase(result?.value));
            setname(result?.value);
            if (exists) {
              Swal.showValidationMessage(
                "You need to change Quiz name. This is already exist",
              );
            } else {
              setAllQuizName([...allQuizName, result?.value]);

              savequiz(result?.value);
            }
          }
        });
      } else {
        console.log("save fucntion hit else case");
        // ---------------------
        const exists = allQuizName.includes(currentQuizNameLower);
        const foundQuiz = allQuizNameId.find(
          (quiz) => quiz.quiz_name?.toLowerCase() === currentQuizNameLower,
        );
        // ---------------------
        console.log("save fucntion hit else case", exists, foundQuiz);
        if (foundQuiz != undefined) {
          Swal.showValidationMessage(
            "You need to change Quiz name. This is already exist",
          );

          showReplacePopUp(foundQuiz);
        } else {
          // -------------------
          setAllQuizName([...allQuizName, currentQuizNameLower]);
          // -------------------
          quizSaveApiHit(quizData);
        }
      }
    }
  };

  const quizSaveApiHit = async (quizData) => {
    token = sessionStorage.getItem("token");
    setisActive(true);

    try {
      const response = await fetch(process.env.API_URL + "api/saveQuiz", {
        credentials: "include",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(quizData),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.error || "Failed to save the quiz.";
        setisActive(false);
        warn(errorMsg, "Error");
        return; 
      }

      sessionStorage.setItem("QuizName", "");
      sessionStorage.setItem("QuizTitle", "");
      sessionStorage.setItem("QuizDate", "");
      sessionStorage.setItem("PrevQuesIds", "");
      sessionStorage.setItem("QuizYear", "");
      sessionStorage.setItem("SpecificQuizId", "");

      setisActive(false);
      setAllQuizName((prev) => [...prev, quizData?.quizName]);

      const quizUserName = sessionStorage.getItem("user");
      await fetchQuiz(token, quizUserName);

      notify("Quiz saved.");

      if (buttonAction.open) {
        setButtonAction({ ...buttonAction, open: false });
        router.push("/MyQuiz");
      }
      if (buttonAction.new) {
        setButtonAction({ ...buttonAction, new: false });
        refreshPage();
      }
    } catch (error) {
      setisActive(false);
      console.error("Error saving the quiz:", error);
      warn("An unexpected error occurred while saving the quiz.", "Error");
    }
  };

  const updateQuizData = async (quizNameFromPopUp = null) => {
    if (selectedQuestions.length == 0) {
      warn("Quiz is empty.", "");
    } else {
      //////////////// quiz save code start //////////////

      token = sessionStorage.getItem("token");
      const username = sessionStorage.getItem("user");
      const SpecificQuizId = sessionStorage.getItem("SpecificQuizId");

      const num = SelectedQuestionIds.length;
      // -------------------
      let currentQuizName =
        quizNameFromPopUp != null ? quizNameFromPopUp : name;
      let currentQuizNameLower = toLowerCase(currentQuizName);
      // -------------------

      let checkDateFormat = isValidYYmmddFormat(quizStateDate);

      let quizDate = quizStateDate;

      if (quizDate && !checkDateFormat) {
        quizDate = convertDateFormatToYYYYMMDD(quizStateDate);
      }
      let todayDate = moment().tz(currentTimezone).format("YYYY-MM-DD");
      const quizData = {
        quizName: currentQuizName,
        questionIds: SelectedQuestionIds,
        number_ques: num,
        title: title,
        username: username,
        Date: todayDate,
        quiz_year: categoryToggle,
        id: SpecificQuizId,
      };

      ///////////// Update quiz  //////////////////////
      quizUpdate(quizData);
    }
  };

 const quizUpdate = async (quizData) => {
  token = sessionStorage.getItem("token");
  setisActive(true);

  try {
    const response = await fetch(process.env.API_URL + "api/updateQuiz", {
      credentials: "include",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(quizData),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data.error || "Failed to update the quiz.";
      setisActive(false);
      warn(errorMsg, "Error");
      return;
    }

    sessionStorage.setItem("QuizName", "");
    sessionStorage.setItem("QuizTitle", "");
    sessionStorage.setItem("QuizDate", "");
    sessionStorage.setItem("PrevQuesIds", "");
    sessionStorage.setItem("QuizYear", "");
    sessionStorage.setItem("SpecificQuizId", "");

    setisActive(false);
    setAllQuizName((prev) => [...prev, name]);

    const quizUserName = sessionStorage.getItem("user");
    await fetchQuiz(token, quizUserName);

    notify("Quiz updated.");

    if (buttonAction.open) {
      setButtonAction({ ...buttonAction, open: false });
      router.push("/MyQuiz");
    }
    if (buttonAction.new) {
      setButtonAction({ ...buttonAction, new: false });
      refreshPage();
    }
  } catch (error) {
    setisActive(false);
    console.error("Error updating the quiz:", error);
    warn("An unexpected error occurred while updating the quiz.", "Error");
  }
};

  const customrandomques2 = () => {
    // This function is triggered from Model component when add to Quiz button is pressed to finally add the questions in Quiz.
    if (randomlimit != "") {
      if (selectedQuestions.length == 100) {
        warn("Limit of 100 questions reached remove some.", "");
      } else {
        setSelectedQuestions(selectedQuestions.concat(randomQues));
        setSelectedQuestionIds(SelectedQuestionIds.concat(randomQuesIds));
        setrandomlimit("");
        setRandomQues(false);
        setRandomQuesIds("");
        notify(randomQues.length + " questions saved to quiz.");
      }
    }
  };

  const customrandomques = () => {
    //function runs when SELECT button is pressed. used to select random questions from questions array.
    if (randomlimit != "") {
      if (selectedQuestions.length == 100) {
        warn(
          " Limit of 100 questions reached, please remove some questions!",
          "",
        );
      } else {
        let space = 100 - selectedQuestions.length;
        if (randomlimit <= space) {
          const filteredArray = questions.filter(
            (item) => !SelectedQuestionIds.includes(item.question_id),
          );

          if (filteredArray.length >= randomlimit) {
            if (filteredArray.length > 0) {
              const randomIndices = generateRandomIndices(
                filteredArray.length,
                randomlimit,
              );
              let newques = randomIndices.map((index) => filteredArray[index]);
              let newquesIds = newques.map((item) => item.question_id);
              setRandomQues(newques);
              setRandomQuesIds(newquesIds);
            } else {
              warn("Category does not have" + randomlimit + "questions", "");
            }
          } else {
            let result = filteredArray.every((item) =>
              selectedQuestions.includes(item),
            );

            if (result) {
              if (questions.length == 0) {
                warn("Category is empty!!", "");
              } else {
                if (selectedQuestions.length > 0) {
                  warn("All category questions are selected.", "");
                  setrandomlimit("");
                } else {
                  warn("Select a category.", "");
                  setrandomlimit("");
                }
              }
            } else {
              warn(
                "Only " + filteredArray.length + " questions in this category",
              );
              setrandomlimit("");
            }
          }
        } else {
          warn(" Only " + space + " questions can be added to quiz!");
        }
      }
    }
  };

  function generateRandomIndices(length, count) {
    const indices = Array.from({ length }, (_, index) => index);
    const randomIndices = [];

    while (randomIndices.length < count) {
      const randomIndex = Math.floor(Math.random() * indices.length);
      randomIndices.push(indices[randomIndex]);
      indices.splice(randomIndex, 1);
    }

    return randomIndices;
  }

  const handleRandom = async () => {
    //this function is used to fetch api for random 100 questions.
    token = sessionStorage.getItem("token");
    try {
      const random = await fetch(process.env.API_URL + "api/questions/random", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Include the JWT token in the Authorization header
        },
      });
      const randomdata = await random.json();
      setSelectedQuestions(randomdata.randomQuestions);
      setSelectedQuestionIds(randomdata.questionIDs);
      notify("100 random questions saved to quiz.");
    } catch (err) {
      console.log(err);
    }
  };

  function liftup(id, name) {
    if (filterid.id == id) {
      //settname("");
      setfilterid({});
      setAllQuestions([]);
      setSelectableRandomQuestion(0);
      setExpandAnnouncement(`${name} collapsed.`);
    } else {
      setSelectableRandomQuestion(questions?.length);
      setfilterid({ id, name });
      // Clear the previous announcement so screen readers don't re-announce
      // stale text while the new chapter's questions are loading.
      setExpandAnnouncement("");
    }
  }

  const fetchQuestions1 = async (tag_type = "") => {
    if (filterid === "all") {
      setisActive(true);
      try {
        const response = await fetch(process.env.API_URL + "api/questions");
        var data = await response.json();
        setQuestions(data);
        setAllQuestions(data);
        setisActive(false);
      } catch (error) {
        setisActive(false);
      }
    } else if (filterid.id != undefined && filterid.name != undefined) {
      setisActive(true);
      try {
        token = sessionStorage.getItem("token");
        const response = await fetch(
          process.env.API_URL +
          `api/article/category/${filterid.id}/${filterid.name}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`, // Include the JWT token in the Authorization header
            },
          },
        );
        var data = await response.json();
        if (data.length == 0) {
          warn("This category is empty.", "Category Empty");
        }

        const duplicateFreeArray = cullquestions(data.reverse());
        setAllQuestions(duplicateFreeArray);
        setQuestions(duplicateFreeArray);
        setSelectableRandomQuestion(duplicateFreeArray?.length);

        if (tag_type == "" && tname != "All" && tname != "") {
          const tagdataid = generateTagId(tname);
          const filter_question = duplicateFreeArray.filter(
            (item) => item.tagid == tagdataid,
          );

          filter_question.length == 0
            ? warn(`No ${tname} question in this category`, "Category Empty")
            : "";
          setQuestions(filter_question);
          setSelectableRandomQuestion(filter_question?.length);
        }

        setisActive(false);
        setfilterCountTrack({});
      } catch (error) {
        setisActive(false);
        setSelectableRandomQuestion(0);
      }
    }
  };

  const fetchQuiz = async (token, storedName) => {
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
        throw new Error("Failed to fetch quiz data");
      }
      const data = await response.json();
      if (data.error == "Auth Failed") {
        sessionStorage.clear();
        router.push("/");
        console.log("unauthorized error in MyQuiz.js");
      }
      if (data.status === 429) {
        //
        warn("Too many requests.");
        sessionStorage.clear();
        router.push("/");
      }

      let quizNameArr = data?.map((item) => item.quiz_name.trim());
      setAllQuizName(quizNameArr);

      let quizNameIdArr = data?.map((item) => ({
        quiz_name: item.quiz_name.trim(),
        quiz_id: item.id,
      }));
      setAllQuizNameId(quizNameIdArr);

      // setQuiz(data);
    } catch (error) {
      sessionStorage.clear();
      console.log("catch block MyQuiz.js", error);
    }
  };

  const handleQuestionCheckboxChange = (event, questionId) => {
    restoreQuestionBankFocusAfterUpdate(questionId, "checkbox");
    scheduleQuestionBankFocusRestore();
    const isChecked = event.target.checked;

    if (isChecked) {
      if (selectedQuestions.length < 100) {
        if (SelectedQuestionIds.includes(questionId)) {
          event.target.checked = false;
          const filteredIdArray = SelectedQuestionIds.filter((item) => {
            return item != questionId;
          });
          const filteredNewQuesArray = selectedQuestions?.filter(
            (item) => item.question_id != questionId,
          );

          setSelectedQuestionIds(filteredIdArray);
          setSelectedQuestions(filteredNewQuesArray);

          ///////////// call for checking questions //////////////
        } else {
          const question = questions?.find((q) => q.question_id === questionId);
          setSelectedQuestions((prevSelectedQuestions) => [
            ...prevSelectedQuestions,
            question,
          ]);

          setSelectedQuestionIds((prevSelectedQuestionIds) => [
            ...prevSelectedQuestionIds,
            questionId,
          ]);
        }
      } else {
        event.target.checked = false;
        warn("You can only select up to 100 questions.");
      }
    } else {
      setSelectedQuestions((prevSelectedQuestions) =>
        prevSelectedQuestions?.filter((q) => q.question_id !== questionId),
      );
      setSelectedQuestionIds((prevSelectedQuestionIds) =>
        prevSelectedQuestionIds.filter((id) => id !== questionId),
      );
    }
  };

  const handlePrintSelectedQuestions = () => {
    if (selectedQuestions.length > 0) {
      const printStyles = `
        <style>
          li {
            list-style-type: upper-alpha !important;
          }
          .topHeadingQuizPage {
            text-align: center;
            text-transform: none;
          }
          body {
            padding: 10px 24px;
          }
          @media print {
            .question-container {
              page-break-inside: avoid;
            }
          }
        </style>
      `;

      const printContent = selectedQuestions
        .map((question, index) => {
          // Shuffle the answers array
          const shuffledAnswers = shuffleArray(
            removeDuplicatesFromArrayOfObjectByObjKey(
              getQuestionAnswers(question),
            ),
          );
          // Extract the first shuffled answer as the correct one
          const correctOption = `<li>${getAnswerHtml(shuffledAnswers[0])}</li>`; // Change here
          const otherOptions = shuffledAnswers
            .slice(1)
            .map((answer) => `<li>${getAnswerHtml(answer)}</li>`)
            .join("");

          let newQuesText = question.question_text.replace(
            /<summary>Question<\/summary>\s*/,
            `<summary>Question  ${index + 1}<\/summary>`,
          );
          return `
            <div className="question-container">
              <div>
                <span>                 
                  ${newQuesText}
                </span>
              </div>
              <ul>
                ${correctOption}${otherOptions}
              </ul>
            </div>
          `;
        })
        .join("");

      const htmlContent = `<!DOCTYPE html>
        <html>
          <head>
            <title>${name ? escapeHtmlForPrint(name) + " - Quiz" : "Quiz"}</title>
            ${printStyles}
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-T3c6CoIi6uLrA9TneNEoa7RxnatzjcDSCmG1MXxSR1GAsXEV/Dwwykc2MPK8M2HN" crossorigin="anonymous">
            <link rel="stylesheet" href="https://snapz.com/wp-content/uploads/snapz-print.css">
            ${getMathJaxConfigScript()}
            <script id="mathjax-script" async src="${mathJaxScriptSrc}"></script>
          </head>
          <body>
            <h1 className="topHeadingQuizPage">${escapeHtmlForPrint(name)}</h1>
            ${printContent}
          </body>
        </html>`;

      printViaIframe(htmlContent);
    } else {
      warn("Please select some questions first.");
    }
  };

  // Function to shuffle an array
  function shuffleArray(array) {
    const shuffledArray = [...array];
    for (let i = shuffledArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledArray[i], shuffledArray[j]] = [
        shuffledArray[j],
        shuffledArray[i],
      ];
    }
    return shuffledArray;
  }

  const handlePrintSelectedAnswers = () => {
    if (selectedQuestions.length > 0) {
      const printContent = selectedQuestions
        ?.map((question, index) => {
          const answerId = question.correct_answer;
          const selectedOption = getQuestionAnswers(question).find(
            (answer) => answer.answer_id === answerId,
          );

          let answerText = "";
          const selectedAnswerText = getAnswerHtml(selectedOption);

          if (selectedAnswerText === "True" || selectedAnswerText === "False") {
            answerText = selectedAnswerText;
          } else {
            answerText = extractAnswerText(selectedAnswerText);
          }

          return `<div className="container"> <strong><summary>Question  ${index + 1
            } : <\/summary><br/>Answer:</strong> ${answerText}</div><br/>`;
        })
        .join("");

      const htmlContent = `<!DOCTYPE html>
        <html>
          <head>
            <title>${name ? escapeHtmlForPrint(name) + " - Answers" : "Answer Key"}</title>
            <style>
              .topHeadingQuizPage{
                text-align:center;
                text-transform:none;
              }
              body {
                padding: 10px 24px;
                font-family: system-ui, -apple-system, sans-serif;
              }
              @media print {
                .container {
                  page-break-inside: avoid;
                }
              }
            </style>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-T3c6CoIi6uLrA9TneNEoa7RxnatzjcDSCmG1MXxSR1GAsXEV/Dwwykc2MPK8M2HN" crossorigin="anonymous">
            <link rel="stylesheet" href="https://snapz.com/wp-content/uploads/snapz-print.css">
            ${getMathJaxConfigScript()}
            <script id="mathjax-script" async src="${mathJaxScriptSrc}"></script>
          </head>
          <body className="m-4">
            <h1 className="topHeadingQuizPage">${escapeHtmlForPrint(name)}</h1>
            <br/>
            ${printContent}
          </body>
        </html>`;

      printViaIframe(htmlContent);
    } else {
      warn("Please select some questions first");
    }
  };

  function extractAnswerText(answer) {
    const regexHtmlTags = /(<([^>]+)>)/gi; // Regex pattern to match HTML tags

    const div = document.createElement("div");
    div.innerHTML = answer;

    return div.textContent || div.innerText || "";
  }

  function deletelement(e) {
    let temp = selectedQuestions?.filter((item) => item.question_id != e);
    let temp2 = SelectedQuestionIds?.filter((item) => item != e);

    setSelectedQuestions(temp);
    setSelectedQuestionIds(temp2);
  }

  function extractQuestionText(question) {
    const regexWithId = /<p id="qst">(.*?)<\/p>/;
    const regexWithoutId =
      /<p(?![^>]*\bid\b)(?![^>]*\bclass\b)[^>]*>(.*?)<\/p>/;
    const regexAlternative = /<p\b[^>]*>(.*?)<\/p>/; // Updated pattern
    const regexHtmlTags = /<[^>]+>/g; // Regex pattern to match HTML tags
    const regexStrongTag = /<\/?strong>/g; // Regex pattern to match <strong> tags
    const regexSpecialSpaces =
      /&#8202;|&#8198;|&#8239;|&#8201;|&#8197;|&#160;|&#8200;|&#8196;|&#8194;|&#8199;|&#8195;/g;

    const matchWithId = question.question_text.match(regexWithId);
    const matchWithoutId = question.question_text.match(regexWithoutId);
    const matchAlternative = question.question_text.match(regexAlternative);

    if (matchWithId) {
      return matchWithId[1]
        .replace(regexHtmlTags, "")
        .replace(regexStrongTag, "")
        .replace(regexSpecialSpaces, "");
    } else if (matchWithoutId) {
      return matchWithoutId[1]
        .replace(regexHtmlTags, "")
        .replace(regexStrongTag, "")
        .replace(regexSpecialSpaces, "");
    } else if (matchAlternative) {
      return matchAlternative[1]
        .replace(regexHtmlTags, "")
        .replace(regexStrongTag, "")
        .replace(regexSpecialSpaces, "");
    } else {
      return "";
    }
  }

  function extractOptionText(option) {
    if (typeof option !== "string") {
      return "";
    }

    const pattern = />(.*?)</;
    const pattern2 = /<p><span className="choice"[^>]*>(.*?)<\/span>/;
    const pattern3 = /<[^>]+>/g; // Remove all HTML tags
    const pattern4 = /Choice format\s*-->\s*(.*)/; // Added pattern to remove "Choice format -->" text
    const pattern5 = /className="choice">/g; // Added pattern to remove "className="choice">"

    const match = pattern.exec(option);
    const match2 = pattern2.exec(option);

    if (match && match[1]) {
      const text = match[1].trim();
      return text.replace(pattern5, "");
    } else if (match2 && match2[1]) {
      const text = match2[1].trim();
      return text.replace(pattern5, "");
    }

    let textWithoutTags = option.replace(pattern3, ""); // Remove all HTML tags
    const match4 = pattern4.exec(textWithoutTags);
    if (match4 && match4[1]) {
      textWithoutTags = match4[1].trim();
    }
    return textWithoutTags.replace(pattern5, "").trim();
  }

  function getQuestionAnswers(question) {
    return Array.isArray(question?.answers)
      ? question.answers.filter(Boolean)
      : [];
  }

  function getAnswerHtml(answer) {
    return typeof answer?.answer === "string" ? answer.answer : "";
  }

  function uncheckAllCheckboxes() {
    setSelectedQuestions([]);
    setSelectedQuestionIds([]);
    var checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(function (checkbox) {
      checkbox.checked = false;
    });
  }

  const closeModal = () => {
    setRandomQues(false);
    setRandomQuesIds(null);
  };

  const scrambleList = () => {
    if (defaultList.length == 0) {
      setDefaultList(selectedQuestions);
    } else {
      setSelectedQuestions(shuffleArray(selectedQuestions));
      notify("Questions Randomized");
    }
  };
  const unscrambleList = () => {
    if (
      defaultList.length != selectedQuestions.length ||
      defaultList.length == 0
    ) {
      //warn("Randomize Questions", "")
    }
    //  else if (defaultList.length == 0) {
    //   notify("Already Unscrambled!")
    // }
    else {
      setSelectedQuestions(defaultList);
      notify("Questions Reset");
    }
  };
  const deleteListItem = (questionId) => {
    // 1. Find the question before it's removed
    const questionToDelete = selectedQuestions.find(
      (q) => q.question_id === questionId
    );

    // 2. Build a specific label (use the Question ID)
    const questionLabel = questionToDelete
      ? `Question ${questionId}`
      : `Question ${questionId}`;

    // 3. Calculate remaining count before deletion
    const remainingCount = selectedQuestions.length - 1;

    // 4. Perform the deletion
    deletelement(questionId);

    // 5. Reset shuffle history if needed
    if (selectedQuestions.length !== defaultList.length) {
      setDefaultList([]);
    }

    // 6. Announce with the specific question identifier
    setDeleteAnnouncement(
      `${questionLabel} removed from quiz. ${remainingCount} questions remaining.`
    );
    setTimeout(() => setDeleteAnnouncement(""), 5000);
  };

  const [totalAvailableQuestions, setTotalAvailableQuestions] = useState();
  const countTotalQuestionAvailableInCategory = (
    questions,
    selectedQuestions,
  ) => {
    const totalRemainingQues = questions.filter(
      (obj) => !selectedQuestions.includes(obj.question_id),
    );

    setTotalAvailableQuestions(totalRemainingQues);
  };

  const filterByCategory = (category) => {
    setSingleQuestinCategory(category == "all category" ? "All" : category);

    if (categoryToggle == "2017") {
      // category17
      const value = initial17;
      if (category == "knowledge") {
        const filteredKnowledge = [];
        value.map((item) => {
          if (item.name.includes("Knowledge")) {
            filteredKnowledge.push(item);
          }
        });
      }

      if (category == "calculations") {
        const filteredCalculations = [];
        value.map((item) => {
          if (item.name.includes("Calculations")) {
            filteredCalculations.push(item);
          }
        });
      }

      if (category == "all category") {
        setCategory17(value);
      }
    }

    if (categoryToggle == "2020") {
      // category20
      const value = initial20;
      if (category == "knowledge") {
        const filteredKnowledge = [];
        value.map((item) => {
          if (item.name.includes("Knowledge")) {
            filteredKnowledge.push(item);
            // setCategory20(filteredKnowledge)
          }
        });
      }
      if (category == "calculations") {
        const filteredCalculations = [];
        value.map((item) => {
          if (item.name.includes("Calculations")) {
            filteredCalculations.push(item);
            //setCategory20(filteredCalculations)
          }
        });
      }
      if (category == "all category") {
        setCategory20(value);
      }
    }
    if (categoryToggle == "2023") {
      // category23
      const value = initial23;
      if (category == "knowledge") {
        const filteredKnowledge = [];
        value.map((item) => {
          if (item.name.includes("Knowledge")) {
            filteredKnowledge.push(item);
            //setCategory23(filteredKnowledge)
          }
        });
      }
      if (category == "calculations") {
        const filteredCalculations = [];
        value.map((item) => {
          if (item.name.includes("Calculations")) {
            filteredCalculations.push(item);
            //setCategory23(filteredCalculations)
          }
        });
      }
      if (category == "all category") {
        setCategory23(value);
      }
    }

    if (categoryToggle == "theory") {
      // theory
      const value = initialTheory;
      if (category == "knowledge") {
        const filteredKnowledge = [];
        value.map((item) => {
          if (item.name.includes("Knowledge")) {
            filteredKnowledge.push(item);
          }
        });
      }
      if (category == "calculations") {
        const filteredCalculations = [];
        value.map((item) => {
          if (item.name.includes("Calculations")) {
            filteredCalculations.push(item);
          }
        });
      }
      console.log("theory value", value);

      if (category == "all category") {
        setTheory(value);
      }
    }
  };
  const previewQuestion = async (question) => {
    setPreviewQues(question);

    token = sessionStorage.getItem("token");
    try {
      const solution = await fetch(
        process.env.API_URL + `api/generalfeedback?ids=${question.question_id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Include the JWT token in the Authorization header
          },
        },
      );
      const solutions = await solution.json();

      setPreviewSolution(
        solutions ? solutions[0].general_feedback : "<p>No data</p>",
      );
    } catch (err) {
      console.log(err);
    }
  };

  const parseAndFormatDate = (dateStr) => {
    const date = new Date(dateStr);
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Month is 0-indexed
    const day = date.getDate().toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  };

  function convertDateFormatToYYYYMMDD(dateString) {
    const regex = /^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])-(20|19)\d\d$/;

    if (!regex.test(dateString)) {
      throw new Error("Invalid date format. Please use MM-DD-YYYY.");
    }

    // Split the date into components
    const parts = dateString.split("-");
    const month = parts[0]; // MM
    const day = parts[1]; // DD
    const year = parts[2]; // YYYY

    // Rearrange to YYYY-MM-DD
    return `${year}-${month}-${day}`;
  }

  return (
    <>
      <Head>
        <title>Question Bank | Snapz Quiz Builder</title>
      </Head>
      {/* preview question modal */}
      <>
        <Modal
          show={show}
          onHide={handleClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="preview-modal-title"
          enforceFocus={true}
          restoreFocus={true}
        >
          <Modal.Header closeButton>
            <Modal.Title>Preview Question</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div ref={previewContentRef}>
              <p>
                <b>Question</b> -{" "}
                <span
                  dangerouslySetInnerHTML={{
                    __html: normalizeLatexForPreview(
                      previewQues
                        ? previewQues.question_text
                        : "<p>No data</p>",
                    ),
                  }}
                ></span>
              </p>

              {(previewQues ? getChoicesForSolutionPrint(previewQues) : []).map(
                (choice) => (
                  <p className="d-flex" key={choice.answerId}>
                    <b>{choice.letter}</b> -{" "}
                    <span
                      dangerouslySetInnerHTML={{
                        __html: normalizeLatexForPreview(
                          choice.optionText || "<p>No data</p>",
                        ),
                      }}
                    ></span>
                  </p>
                ),
              )}

              <p className="d-flex">
                <b>Correct Answer</b> -{" "}
                <span>
                  {previewQues
                    ? getChoicesForSolutionPrint(previewQues).find(
                      (choice) =>
                        String(choice.answerId) ===
                        String(previewQues.correct_answer),
                    )?.letter || "-"
                    : "No data"}
                </span>
              </p>
              <p>
                <span
                  dangerouslySetInnerHTML={{
                    __html: normalizeLatexForPreview(
                       previewSolution ? cleanSolutionText(previewSolution) : "<p>No data</p>",
                    ),
                  }}
                ></span>
              </p>
            </div>
          </Modal.Body>
          <Modal.Footer></Modal.Footer>
        </Modal>
      </>
      {checker ? (
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
          <div className={styles.main1}>
            <Model
              randomQues={randomQues}
              closeModal={closeModal}
              randomQuesIds={randomQuesIds}
              filterid={filterid}
              setRandomQues={setRandomQues}
              setRandomQuesIds={setRandomQuesIds}
              customrandomques2={customrandomques2}
            />
            <section id="top" className={styles.align}>
              <div className="fifty">
                <div
                  ref={questionBankPanelRef}
                  className={styles.sec22}
                  role="region"
                  aria-label="Question Bank"
                  tabIndex={-1}
                >
                  <Tippy
                    content="These are the chapters or categories. Select one to see the questions inside."
                    disabled={tip}
                  >
                    <div className={styles.lablesec}>
                      <h1 className="quesBankTopContainer">
                        <span className={styles.questions}>Question Bank</span>
                        <div className="topbuttons">
                          <div className="dropdown">
                            <button
                              id="nec-version-dropdown"
                              className="btn btn-sm btn-light dropdown-toggle"
                              type="button"
                              data-bs-toggle="dropdown"
                              aria-expanded="false"
                            >
                              NEC Version
                            </button>

                            <ul
                              className="dropdown-menu filterMenu"
                              aria-labelledby="nec-version-dropdown"
                            >
                              {/* <li>
                                <span
                                  className="dropdown-item filterItem"
                                  onClick={() => {
                                    handleCategoryChange("2014");
                                  }}
                                >
                                  Snapz QB NEC 2014
                                </span>
                              </li> */}
                              <li>
                                <button
                                  type="button"
                                  className="dropdown-item filterItem"
                                  onClick={() => {
                                    handleCategoryChange("2017");
                                  }}
                                >
                                  NEC 2017
                                </button>
                              </li>

                              <li>
                                <button
                                  type="button"
                                  className="dropdown-item filterItem"
                                  onClick={() => {
                                    handleCategoryChange("2020");
                                  }}
                                >
                                  NEC 2020
                                </button>
                              </li>

                              <li>
                                <button
                                  type="button"
                                  className="dropdown-item filterItem"
                                  onClick={() => {
                                    handleCategoryChange("2023");
                                  }}
                                >
                                  NEC 2023
                                </button>
                              </li>

                              <li>
                                <button
                                  type="button"
                                  className="dropdown-item filterItem"
                                  onClick={() => {
                                    handleCategoryChange("theory");
                                  }}
                                >
                                  Theory
                                </button>
                              </li>
                            </ul>
                          </div>
                          <div className="dropdown">
                            <button
                              id="difficulty-dropdown"
                              className="btn btn-sm btn-light dropdown-toggle"
                              type="button"
                              data-bs-toggle="dropdown"
                              aria-expanded="false"
                            >
                              Difficulty
                            </button>

                            <ul
                              className="dropdown-menu filterMenu"
                              aria-labelledby="difficulty-dropdown"
                            >
                              <li>
                                <button
                                  type="button"
                                  className="dropdown-item filterItem"
                                  onClick={() => {
                                    handleDifficulty("Easy");
                                  }}
                                >
                                  Easy
                                </button>
                              </li>

                              <li>
                                <button
                                  type="button"
                                  className="dropdown-item filterItem"
                                  onClick={() => {
                                    handleDifficulty("Medium");
                                  }}
                                >
                                  Medium
                                </button>
                              </li>

                              <li>
                                <button
                                  type="button"
                                  className="dropdown-item filterItem"
                                  onClick={() => {
                                    handleDifficulty("Hard");
                                  }}
                                >
                                  Hard
                                </button>
                              </li>

                              <li>
                                <li>
                                  <button
                                    type="button"
                                    className="dropdown-item filterItem"
                                    onClick={() => {
                                      fetchQuestions1("All");
                                      settname("All");
                                      setDifficultyMessage("All questions displayed.");
                                    }}
                                  >
                                    All
                                  </button>
                                </li>
                              </li>
                            </ul>

                          </div>
                          <div
                            role="status"
                            aria-live="polite"
                            style={{
                              position: "absolute",
                              width: "1px",
                              height: "1px",
                              padding: 0,
                              margin: "-1px",
                              overflow: "hidden",
                              clip: "rect(0, 0, 0, 0)",
                              border: 0,
                            }}
                          >
                            {difficultyMessage}
                          </div>
                        </div>
                      </h1>

                      <div className={styles.mainquiz}>
                        <div className={styles.contquiz}>
                          <div className={styles.contOne}>
                            <div className={styles.contts}>
                              <p className={styles.topBarText}>
                                {categoryToggle
                                  ? `SNAPZ QB ${categoryToggle} NEC`
                                  : ""}
                              </p>
                            </div>
                          </div>
                          <div className={styles.contOne}>
                            <div
                              className={`${styles.contt} selected-articles`}
                            >
                              <p className={styles.topBarText}>
                                Selected:{" "}
                                <span>
                                  {filterid?.name ? filterid?.name : ""}
                                </span>
                              </p>
                            </div>
                            <div className={`${styles.contt} selected-diff`}>
                              <p className={styles.topBarText}>
                                Difficulty: <span>{tname ? tname : "All"}</span>
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className={styles.contSub}>
                          <p className={styles.topBarText}>
                            Select Random (
                            {selectableRandomQuestion
                              ? selectableRandomQuestion
                              : 0}
                            )
                          </p>
                          <div className={styles.contBtn}>
                            <input
                              id="randombtn1"
                              className={styles.randomtext}
                              value={randomlimit}
                              type="number"
                              size="20"
                              placeholder="# Qsts"
                              aria-label="Number of Questions"
                              onChange={(e) => {
                                const value =
                                  e.target.value === ""
                                    ? ""
                                    : Math.min(e.target.value, 100);
                                setrandomlimit(value);
                              }}
                            />
                            <button onClick={(e) => customrandomques(e)}>
                              Select
                            </button>
                          </div>
                        </div>
                        <ToastContainer
                          position="top-center"
                          autoClose={3500}
                          hideProgressBar={false}
                          newestOnTop={true}
                          closeOnClick
                          pauseOnHover
                          transition={Slide}
                        />
                      </div>
                    </div>
                  </Tippy>

                  <a
                    href="#quiz-panel"
                    className={styles.skipToQuizLink}
                    onClick={(e) => {
                      e.preventDefault();
                      const target = document.getElementById('quiz-panel');
                      if (target) {
                        target.focus({ preventScroll: true });
                        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }}
                  >
                    Skip to Quiz Question List
                  </a>

                  <div className={styles.sec2}>
                    <Test
                      liftup={liftup}
                      category14={category14}
                      category17={category17}
                      category20={category20}
                      category23={category23}
                      theory={theory}
                      All={All}
                      setCategory14={setCategory14}
                      setCategory17={setCategory17}
                      setCategory20={setCategory20}
                      setCategory23={setCategory23}
                      setTheory={setTheory}
                      setAll={setAll}
                      setInitial17={setInitial17}
                      setInitial20={setInitial20}
                      setInitial23={setInitial23}
                      setInitialTheory={setInitialTheory}
                      style="bordered"
                    />

                    <div
                      role="status"
                      aria-live="polite"
                      style={{
                        position: "absolute",
                        width: "1px",
                        height: "1px",
                        padding: 0,
                        margin: "-1px",
                        overflow: "hidden",
                        clip: "rect(0, 0, 0, 0)",
                        border: 0,
                      }}
                    >
                      {expandAnnouncement}
                    </div>

                    {categoryToggle == "-" ? (
                      <h3 className="sec1text">
                        This Question Bank displays a list of questions for you
                        to use in your quiz.Please start by selecting a NEC
                        version from the <strong>'NEC Version'</strong>{" "}
                        drop-down above.
                      </h3>
                    ) : (
                      <>
                        {categoryToggle == "2017" ? (
                          <>
                            {category17 ? (
                              <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                  duration: 0.7,
                                  delay: 0.5,
                                }}
                              >
                                <ul className={styles.accordList}>
                                  {category17?.map((item, index) => (
                                    <li key={index}>
                                      <div
                                        id={
                                          item.name.includes("Chapter 9") &&
                                            (item.name.includes("Table") ||
                                              item.name.includes("Tables"))
                                            ? "addSpacingChap9"
                                            : ""
                                        }
                                        className={`${filterid?.id == item.id
                                          ? styles.activeList
                                          : ""
                                          } ${item.name.includes("Chapter")
                                            ? styles.chapterStyle
                                            : ""
                                          } ${item.name.includes("Article")
                                            ? styles.articleStyle
                                            : ""
                                          }
                                    ${item.name.includes("Article") &&
                                            item.name.includes("Calculations")
                                            ? styles.calcArt
                                            : item.name.includes("Calculations")
                                              ? styles.calculationStyle
                                              : ""
                                          }
                                    ${item.name.includes("Article") &&
                                            item.name.includes("Knowledge")
                                            ? styles.calcArt
                                            : item.name.includes("Knowledge")
                                              ? styles.calculationStyle
                                              : ""
                                          } `}
                                        aria-expanded={filterid?.id === item.id}
                                        role="button"
                                        tabIndex={0}
                                        onClick={() => {
                                          liftup(item.id, item.name);
                                        }}
                                        onKeyDown={(e) => {
                                          if (
                                            e.key === "Enter" ||
                                            e.key === " "
                                          ) {
                                            e.preventDefault();
                                            liftup(item.id, item.name);
                                          }
                                        }}
                                      >
                                        {" "}
                                        <VscDebugBreakpointLog
                                          className={styles.bullet}
                                        />
                                        <span className="categoryNameText">
                                          {item.name}
                                        </span>
                                      </div>
                                      <div
                                        id={`chapter-panel-${item.id}`}
                                        role="region"
                                        aria-label={`Questions for ${item.name}`}
                                      >
                                        {filterid.id == item.id
                                          ? questions?.map((question) => (
                                            <motion.div
                                              key={question.question_id}
                                              initial={{ opacity: 0, x: 100 }}
                                              animate={{ opacity: 1, x: 0 }}
                                              transition={{
                                                duration: 0.7,
                                                delay: 0.5,
                                              }}
                                            >
                                              <div
                                                id={question.question_id}
                                                aria-selected={SelectedQuestionIds.includes(
                                                  question.question_id,
                                                )}
                                                role="option"
                                                className={`${styles.quescont
                                                  } ${SelectedQuestionIds.includes(
                                                    question.question_id,
                                                  )
                                                    ? styles.checked
                                                    : ""
                                                  }  `}
                                              >
                                                <label>
                                                  <div
                                                    className={styles.ques}
                                                  >
                                                    <input
                                                      className={
                                                        styles.checkbox
                                                      }
                                                      data-question-bank-question-id={
                                                        question.question_id
                                                      }
                                                      data-question-bank-control="checkbox"
                                                      type="checkbox"
                                                      name={
                                                        "question_" +
                                                        question.question_id
                                                      }
                                                      checked={
                                                        SelectedQuestionIds.includes(
                                                          question.question_id,
                                                        )
                                                          ? true
                                                          : false
                                                      }
                                                      onChange={(event) =>
                                                        handleQuestionCheckboxChange(
                                                          event,
                                                          question.question_id,
                                                        )
                                                      }
                                                      onMouseDown={(event) =>
                                                        handleQuestionBankControlMouseDown(
                                                          event,
                                                          question.question_id,
                                                          "checkbox",
                                                        )
                                                      }
                                                    />
                                                    Question-
                                                    {question.question_id}
                                                    &nbsp;
                                                    {question.questionName.slice(
                                                      0,
                                                      11,
                                                    )}
                                                    {extractQuestionForAllCategory(
                                                      question.question_text,
                                                    )}
                                                  </div>
                                                </label>

                                                <div>
                                                  <div>
                                                    <p
                                                      className="m-0 text-center"
                                                      style={{
                                                        fontSize: "10px",
                                                      }}
                                                    >
                                                      <b>{categoryToggle}</b>
                                                    </p>

                                                    <p
                                                      className="m-0 text-center"
                                                      style={{
                                                        fontSize: "10px",
                                                      }}
                                                    >
                                                      <b>
                                                        {item.name.includes(
                                                          "Calculations",
                                                        ) && "Calc"}{" "}
                                                        {item.name.includes(
                                                          "Knowledge",
                                                        ) && "Know"}
                                                      </b>
                                                    </p>
                                                    <p
                                                      className="m-0 text-center"
                                                      style={{
                                                        fontSize: "10px",
                                                      }}
                                                    >
                                                      <b>
                                                        {question?.tagid
                                                          ? generateTagName(
                                                            question?.tagid,
                                                          )
                                                          : "-"}
                                                      </b>
                                                    </p>
                                                  </div>
                                                  <div className="mt-2 text-center">
                                                    <span
                                                      onClick={() =>
                                                        previewQuestion(
                                                          question,
                                                        )
                                                      }
                                                    >
                                                      <HiMiniMagnifyingGlass
                                                        className="previewQusetion"
                                                        onClick={handleShow}
                                                      />
                                                    </span>
                                                  </div>
                                                </div>
                                                <button
                                                  type="button"
                                                  className={styles.addButton}
                                                  data-question-bank-question-id={
                                                    question.question_id
                                                  }
                                                  data-question-bank-control="action"
                                                  onClick={() =>
                                                    toggleQuestionSelection(
                                                      question.question_id,
                                                    )
                                                  }
                                                  onMouseDown={(event) =>
                                                    handleQuestionBankControlMouseDown(
                                                      event,
                                                      question.question_id,
                                                      "action",
                                                    )
                                                  }
                                                  aria-pressed={SelectedQuestionIds.includes(
                                                    question.question_id,
                                                  )}
                                                  aria-label={
                                                    SelectedQuestionIds.includes(
                                                      question.question_id,
                                                    )
                                                      ? `Remove question ${question.question_id} from quiz`
                                                      : `Add question ${question.question_id} to quiz`
                                                  }
                                                >
                                                  {SelectedQuestionIds.includes(
                                                    question.question_id,
                                                  )
                                                    ? "Remove"
                                                    : "Add"}
                                                </button>

                                                {question.question_type ===
                                                  "truefalse" ? (
                                                  <div
                                                    className={styles.answers}
                                                  >
                                                    <label
                                                      className={
                                                        styles.options
                                                      }
                                                    >
                                                      <input
                                                        type="radio"
                                                        name={`question_${question.question_id}`}
                                                        value="true"
                                                        disabled
                                                      />
                                                      True
                                                    </label>
                                                    <label
                                                      className={
                                                        styles.options
                                                      }
                                                    >
                                                      <input
                                                        type="radio"
                                                        name={`question_${question.question_id}`}
                                                        value="false"
                                                        disabled
                                                      />
                                                      False
                                                    </label>
                                                  </div>
                                                ) : (
                                                  <div
                                                    className={styles.answers}
                                                  >
                                                    {getQuestionAnswers(
                                                      question,
                                                    ).map((answer) => (
                                                      <div
                                                        key={
                                                          answer.answer_id
                                                        }
                                                        className={styles.mcq}
                                                      >
                                                        <label
                                                          className={
                                                            styles.options
                                                          }
                                                        >
                                                          <input
                                                            type="radio"
                                                            name={`question_${question.question_id}`}
                                                            value={getAnswerHtml(
                                                              getQuestionAnswers(
                                                                question,
                                                              )[0],
                                                            )}
                                                            disabled
                                                          />
                                                          {extractOptionText(
                                                            getAnswerHtml(
                                                              answer,
                                                            ),
                                                          )}
                                                        </label>
                                                      </div>
                                                    ))}
                                                  </div>
                                                )}
                                              </div>
                                            </motion.div>
                                          ))
                                          : null}
                                      </div>
                                    </li>
                                  ))}
                                </ul>
                              </motion.div>
                            ) : null}
                          </>
                        ) : null}
                        {categoryToggle == "2020" ? (
                          <>
                            {category20 ? (
                              <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                  duration: 0.7,
                                  delay: 0.5,
                                }}
                              >
                                <ul className={styles.accordList}>
                                  {category20.map((item, index) => (
                                    <li key={index}>
                                      <div
                                        id={
                                          item?.name?.includes("Chapter 9") &&
                                            (item?.name?.includes("Table") ||
                                              item?.name?.includes("Tables"))
                                            ? "addSpacingChap9"
                                            : ""
                                        }
                                        className={`${filterid?.id == item.id
                                          ? styles.activeList
                                          : ""
                                          } ${item?.name?.includes("Chapter")
                                            ? styles.chapterStyle
                                            : ""
                                          } ${item?.name?.includes("Article")
                                            ? styles.articleStyle
                                            : ""
                                          }
                                    ${item?.name?.includes("Article") &&
                                            item?.name?.includes("Calculations")
                                            ? styles.calcArt
                                            : item?.name?.includes("Calculations")
                                              ? styles.calculationStyle
                                              : ""
                                          }
                                    ${item?.name?.includes("Article") &&
                                            item?.name?.includes("Knowledge")
                                            ? styles.calcArt
                                            : item?.name?.includes("Knowledge")
                                              ? styles.calculationStyle
                                              : ""
                                          } `}
                                        aria-expanded={filterid?.id === item.id}
                                        role="button"
                                        tabIndex={0}
                                        onClick={() => {
                                          liftup(item.id, item.name);
                                        }}
                                        onKeyDown={(e) => {
                                          if (
                                            e.key === "Enter" ||
                                            e.key === " "
                                          ) {
                                            e.preventDefault();
                                            liftup(item.id, item.name);
                                          }
                                        }}
                                      >
                                        <VscDebugBreakpointLog
                                          className={styles.bullet}
                                        />
                                        <span className="categoryNameText">
                                          {item?.name}
                                        </span>
                                      </div>
                                      <div
                                        id={`chapter-panel-${item.id}`}
                                        role="region"
                                        aria-label={`Questions for ${item.name}`}
                                      >
                                        {filterid.id == item.id
                                          ? questions?.map((question) => (
                                            <motion.div
                                              key={question.question_id}
                                              className="box"
                                              initial={{ opacity: 0, x: 100 }}
                                              animate={{ opacity: 1, x: 0 }}
                                              transition={{
                                                duration: 0.7,
                                                delay: 0.5,
                                              }}
                                            >
                                              <div
                                                id={question.question_id}
                                                aria-selected={SelectedQuestionIds.includes(
                                                  question.question_id,
                                                )}
                                                role="option"
                                                className={`${styles.quescont
                                                  } ${SelectedQuestionIds.includes(
                                                    question.question_id,
                                                  )
                                                    ? styles.checked
                                                    : ""
                                                  } p-1`}
                                              >
                                                <label>
                                                  <div
                                                    className={styles.ques}
                                                  >
                                                    <input
                                                      className={
                                                        styles.checkbox
                                                      }
                                                      data-question-bank-question-id={
                                                        question.question_id
                                                      }
                                                      data-question-bank-control="checkbox"
                                                      type="checkbox"
                                                      name={
                                                        "question_" +
                                                        question.question_id
                                                      }
                                                      checked={
                                                        SelectedQuestionIds.includes(
                                                          question.question_id,
                                                        )
                                                          ? true
                                                          : false
                                                      }
                                                      onChange={(event) =>
                                                        handleQuestionCheckboxChange(
                                                          event,
                                                          question.question_id,
                                                        )
                                                      }
                                                      onMouseDown={(event) =>
                                                        handleQuestionBankControlMouseDown(
                                                          event,
                                                          question.question_id,
                                                          "checkbox",
                                                        )
                                                      }
                                                    />
                                                    Question-
                                                    {question.question_id}
                                                    &nbsp;
                                                    {question.questionName.slice(
                                                      0,
                                                      11,
                                                    )}
                                                    {extractQuestionForAllCategory(
                                                      question.question_text,
                                                    )}
                                                  </div>
                                                </label>

                                                <div>
                                                  <div>
                                                    <p
                                                      className="m-0 text-center"
                                                      style={{
                                                        fontSize: "10px",
                                                      }}
                                                    >
                                                      <b>{categoryToggle}</b>
                                                    </p>

                                                    <p
                                                      className="m-0 text-center"
                                                      style={{
                                                        fontSize: "10px",
                                                      }}
                                                    >
                                                      <b>
                                                        {item.name.includes(
                                                          "Calculations",
                                                        ) && "Calc"}{" "}
                                                        {item.name.includes(
                                                          "Knowledge",
                                                        ) && "Know"}
                                                      </b>
                                                    </p>
                                                    <p
                                                      className="m-0 text-center"
                                                      style={{
                                                        fontSize: "10px",
                                                      }}
                                                    >
                                                      <b>
                                                        {question?.tagid
                                                          ? generateTagName(
                                                            question?.tagid,
                                                          )
                                                          : "-"}
                                                      </b>
                                                    </p>
                                                  </div>
                                                  <div className="mt-2 text-center">
                                                    <span
                                                      onClick={() =>
                                                        previewQuestion(
                                                          question,
                                                        )
                                                      }
                                                    >
                                                      <HiMiniMagnifyingGlass
                                                        className="previewQusetion"
                                                        onClick={handleShow}
                                                      />
                                                    </span>
                                                  </div>
                                                </div>
                                                <button
                                                  type="button"
                                                  className={styles.addButton}
                                                  data-question-bank-question-id={
                                                    question.question_id
                                                  }
                                                  data-question-bank-control="action"
                                                  onClick={() =>
                                                    toggleQuestionSelection(
                                                      question.question_id,
                                                    )
                                                  }
                                                  onMouseDown={(event) =>
                                                    handleQuestionBankControlMouseDown(
                                                      event,
                                                      question.question_id,
                                                      "action",
                                                    )
                                                  }
                                                  aria-pressed={SelectedQuestionIds.includes(
                                                    question.question_id,
                                                  )}
                                                  aria-label={
                                                    SelectedQuestionIds.includes(
                                                      question.question_id,
                                                    )
                                                      ? `Remove question ${question.question_id} from quiz`
                                                      : `Add question ${question.question_id} to quiz`
                                                  }
                                                >
                                                  {SelectedQuestionIds.includes(
                                                    question.question_id,
                                                  )
                                                    ? "Remove"
                                                    : "Add"}
                                                </button>

                                                {question.question_type ===
                                                  "truefalse" ? (
                                                  <div
                                                    className={styles.answers}
                                                  >
                                                    <label
                                                      className={
                                                        styles.options
                                                      }
                                                    >
                                                      <input
                                                        type="radio"
                                                        name={`question_${question.question_id}`}
                                                        value="true"
                                                        disabled
                                                      />
                                                      True
                                                    </label>
                                                    <label
                                                      className={
                                                        styles.options
                                                      }
                                                    >
                                                      <input
                                                        type="radio"
                                                        name={`question_${question.question_id}`}
                                                        value="false"
                                                        disabled
                                                      />
                                                      False
                                                    </label>
                                                  </div>
                                                ) : (
                                                  <div
                                                    className={styles.answers}
                                                  >
                                                    {getQuestionAnswers(
                                                      question,
                                                    ).map((answer) => (
                                                      <div
                                                        key={
                                                          answer.answer_id
                                                        }
                                                        className={styles.mcq}
                                                      >
                                                        <label
                                                          className={
                                                            styles.options
                                                          }
                                                        >
                                                          <input
                                                            type="radio"
                                                            name={`question_${question.question_id}`}
                                                            value={getAnswerHtml(
                                                              getQuestionAnswers(
                                                                question,
                                                              )[0],
                                                            )}
                                                            disabled
                                                          />
                                                          {extractOptionText(
                                                            getAnswerHtml(
                                                              answer,
                                                            ),
                                                          )}
                                                        </label>
                                                      </div>
                                                    ))}
                                                  </div>
                                                )}
                                              </div>
                                            </motion.div>
                                          ))
                                          : null}
                                      </div>
                                    </li>
                                  ))}
                                </ul>
                              </motion.div>
                            ) : null}
                          </>
                        ) : null}
                        {categoryToggle == "2023" ? (
                          <>
                            {category23 ? (
                              <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                  duration: 0.7,
                                  delay: 0.5,
                                }}
                              >
                                <ul className={styles.accordList}>
                                  {category23.map((item, index) => (
                                    <li key={index}>
                                      <div
                                        id={
                                          item.name.includes("Chapter 9") &&
                                            (item.name.includes("Table") ||
                                              item.name.includes("Tables"))
                                            ? "addSpacingChap9"
                                            : ""
                                        }
                                        className={`${filterid?.id == item.id
                                          ? styles.activeList
                                          : ""
                                          } ${item.name.includes("Chapter")
                                            ? styles.chapterStyle
                                            : ""
                                          } ${item.name.includes("Article")
                                            ? styles.articleStyle
                                            : ""
                                          }
                                    ${item.name.includes("Article") &&
                                            item.name.includes("Calculations")
                                            ? styles.calcArt
                                            : item.name.includes("Calculations")
                                              ? styles.calculationStyle
                                              : ""
                                          }
                                    ${item.name.includes("Article") &&
                                            item.name.includes("Knowledge")
                                            ? styles.calcArt
                                            : item.name.includes("Knowledge")
                                              ? styles.calculationStyle
                                              : ""
                                          } `}
                                        aria-expanded={filterid?.id === item.id}
                                        role="button"
                                        tabIndex={0}
                                        onClick={() => {
                                          liftup(item.id, item.name);
                                        }}
                                        onKeyDown={(e) => {
                                          if (
                                            e.key === "Enter" ||
                                            e.key === " "
                                          ) {
                                            e.preventDefault();
                                            liftup(item.id, item.name);
                                          }
                                        }}
                                      >
                                        {" "}
                                        <VscDebugBreakpointLog
                                          className={styles.bullet}
                                        />
                                        <span className="categoryNameText">
                                          {item.name}
                                        </span>
                                      </div>
                                      <div
                                        id={`chapter-panel-${item.id}`}
                                        role="region"
                                        aria-label={`Questions for ${item.name}`}
                                      >
                                        {filterid.id == item.id
                                          ? questions?.map((question) => (
                                            <motion.div
                                              key={question.question_id}
                                              className="box"
                                              initial={{ opacity: 0, x: 100 }}
                                              animate={{ opacity: 1, x: 0 }}
                                              transition={{
                                                duration: 0.7,
                                                delay: 0.5,
                                              }}
                                            >
                                              <div
                                                id={question.question_id}
                                                aria-selected={SelectedQuestionIds.includes(
                                                  question.question_id,
                                                )}
                                                role="option"
                                                className={`${styles.quescont
                                                  } ${SelectedQuestionIds.includes(
                                                    question.question_id,
                                                  )
                                                    ? styles.checked
                                                    : ""
                                                  }`}
                                              >
                                                <label>
                                                  <div
                                                    className={styles.ques}
                                                  >
                                                    <input
                                                      className={
                                                        styles.checkbox
                                                      }
                                                      data-question-bank-question-id={
                                                        question.question_id
                                                      }
                                                      data-question-bank-control="checkbox"
                                                      type="checkbox"
                                                      name={
                                                        "question_" +
                                                        question.question_id
                                                      }
                                                      checked={SelectedQuestionIds.includes(
                                                        question.question_id,
                                                      )}
                                                      onChange={(event) =>
                                                        handleQuestionCheckboxChange(
                                                          event,
                                                          question.question_id,
                                                        )
                                                      }
                                                      onMouseDown={(event) =>
                                                        handleQuestionBankControlMouseDown(
                                                          event,
                                                          question.question_id,
                                                          "checkbox",
                                                        )
                                                      }
                                                    />
                                                    Question-
                                                    {question.question_id}
                                                    &nbsp;
                                                    {question.questionName.slice(
                                                      0,
                                                      11,
                                                    )}
                                                    {extractQuestionForAllCategory(
                                                      question.question_text,
                                                    )}
                                                  </div>
                                                </label>

                                                <div>
                                                  <div>
                                                    <p
                                                      className="m-0 text-center"
                                                      style={{
                                                        fontSize: "10px",
                                                      }}
                                                    >
                                                      <b>{categoryToggle}</b>
                                                    </p>
                                                    <p
                                                      className="m-0 text-center"
                                                      style={{
                                                        fontSize: "10px",
                                                      }}
                                                    >
                                                      <b>
                                                        {item.name.includes(
                                                          "Calculations",
                                                        ) && "Calc"}{" "}
                                                        {item.name.includes(
                                                          "Knowledge",
                                                        ) && "Know"}
                                                      </b>
                                                    </p>
                                                    <p
                                                      className="m-0 text-center"
                                                      style={{
                                                        fontSize: "10px",
                                                      }}
                                                    >
                                                      <b>
                                                        {question?.tagid
                                                          ? generateTagName(
                                                            question?.tagid,
                                                          )
                                                          : "-"}
                                                      </b>
                                                    </p>
                                                  </div>
                                                  <div className="mt-2 text-center">
                                                    <span
                                                      onClick={() =>
                                                        previewQuestion(
                                                          question,
                                                        )
                                                      }
                                                    >
                                                      <HiMiniMagnifyingGlass
                                                        className="previewQusetion"
                                                        onClick={handleShow}
                                                      />
                                                    </span>
                                                  </div>
                                                </div>
                                                <button
                                                  type="button"
                                                  className={styles.addButton}
                                                  data-question-bank-question-id={
                                                    question.question_id
                                                  }
                                                  data-question-bank-control="action"
                                                  onClick={() =>
                                                    toggleQuestionSelection(
                                                      question.question_id,
                                                    )
                                                  }
                                                  onMouseDown={(event) =>
                                                    handleQuestionBankControlMouseDown(
                                                      event,
                                                      question.question_id,
                                                      "action",
                                                    )
                                                  }
                                                  aria-pressed={SelectedQuestionIds.includes(
                                                    question.question_id,
                                                  )}
                                                  aria-label={
                                                    SelectedQuestionIds.includes(
                                                      question.question_id,
                                                    )
                                                      ? `Remove question ${question.question_id} from quiz`
                                                      : `Add question ${question.question_id} to quiz`
                                                  }
                                                >
                                                  {SelectedQuestionIds.includes(
                                                    question.question_id,
                                                  )
                                                    ? "Remove"
                                                    : "Add"}
                                                </button>

                                                {question.question_type ===
                                                  "truefalse" ? (
                                                  <div
                                                    className={styles.answers}
                                                  >
                                                    <label
                                                      className={
                                                        styles.options
                                                      }
                                                    >
                                                      <input
                                                        type="radio"
                                                        name={`question_${question.question_id}`}
                                                        value="true"
                                                        disabled
                                                      />
                                                      True
                                                    </label>
                                                    <label
                                                      className={
                                                        styles.options
                                                      }
                                                    >
                                                      <input
                                                        type="radio"
                                                        name={`question_${question.question_id}`}
                                                        value="false"
                                                        disabled
                                                      />
                                                      False
                                                    </label>
                                                  </div>
                                                ) : (
                                                  <div
                                                    className={styles.answers}
                                                  >
                                                    {getQuestionAnswers(
                                                      question,
                                                    ).map((answer) => (
                                                      <div
                                                        key={
                                                          answer.answer_id
                                                        }
                                                        className={styles.mcq}
                                                      >
                                                        <label
                                                          className={
                                                            styles.options
                                                          }
                                                        >
                                                          <input
                                                            type="radio"
                                                            name={`question_${question.question_id}`}
                                                            value={getAnswerHtml(
                                                              getQuestionAnswers(
                                                                question,
                                                              )[0],
                                                            )}
                                                            disabled
                                                          />
                                                          {extractOptionText(
                                                            getAnswerHtml(
                                                              answer,
                                                            ),
                                                          )}
                                                        </label>
                                                      </div>
                                                    ))}
                                                  </div>
                                                )}
                                              </div>
                                            </motion.div>
                                          ))
                                          : null}
                                      </div>
                                    </li>
                                  ))}
                                </ul>
                              </motion.div>
                            ) : null}
                          </>
                        ) : null}

                        {categoryToggle == "theory" ? (
                          <>
                            {theory ? (
                              <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                  duration: 0.7,
                                  delay: 0.5,
                                }}
                              >
                                <ul className={styles.accordList}>
                                  {theory.map((item, index) => (
                                    <li key={index}>
                                      <div
                                        id={
                                          item.name.includes("Chapter 9") &&
                                            (item.name.includes("Table") ||
                                              item.name.includes("Tables"))
                                            ? "addSpacingChap9"
                                            : ""
                                        }
                                        className={`${filterid?.id == item.id
                                          ? styles.activeList
                                          : ""
                                          } ${item.name.includes("Chapter")
                                            ? styles.chapterStyle
                                            : ""
                                          } ${item.name.includes("Article")
                                            ? styles.articleStyle
                                            : ""
                                          }
                                    ${item.name.includes("Article") &&
                                            item.name.includes("Calculations")
                                            ? styles.calcArt
                                            : item.name.includes("Calculations")
                                              ? styles.calculationStyle
                                              : ""
                                          }
                                    ${item.name.includes("Article") &&
                                            item.name.includes("Knowledge")
                                            ? styles.calcArt
                                            : item.name.includes("Knowledge")
                                              ? styles.calculationStyle
                                              : ""
                                          } `}
                                        aria-expanded={filterid?.id === item.id}
                                        role="button"
                                        tabIndex={0}
                                        onClick={() => {
                                          liftup(item.id, item.name);
                                        }}
                                        onKeyDown={(e) => {
                                          if (
                                            e.key === "Enter" ||
                                            e.key === " "
                                          ) {
                                            e.preventDefault();
                                            liftup(item.id, item.name);
                                          }
                                        }}
                                      >
                                        {" "}
                                        <VscDebugBreakpointLog
                                          className={styles.bullet}
                                        />
                                        <span className="categoryNameText">
                                          {item.name}
                                        </span>
                                      </div>
                                      <div
                                        id={`chapter-panel-${item.id}`}
                                        role="region"
                                        aria-label={`Questions for ${item.name}`}
                                      >
                                        {filterid.id == item.id
                                          ? questions?.map((question) => (
                                            <motion.div
                                              key={question.question_id}
                                              className="box"
                                              initial={{ opacity: 0, x: 100 }}
                                              animate={{ opacity: 1, x: 0 }}
                                              transition={{
                                                duration: 0.7,
                                                delay: 0.5,
                                              }}
                                            >
                                              <div
                                                id={question.question_id}
                                                aria-selected={SelectedQuestionIds.includes(
                                                  question.question_id,
                                                )}
                                                role="option"
                                                className={`${styles.quescont
                                                  } ${SelectedQuestionIds.includes(
                                                    question.question_id,
                                                  )
                                                    ? styles.checked
                                                    : ""
                                                  }`}
                                              >
                                                <label>
                                                  <div
                                                    className={styles.ques}
                                                  >
                                                    <input
                                                      className={
                                                        styles.checkbox
                                                      }
                                                      data-question-bank-question-id={
                                                        question.question_id
                                                      }
                                                      data-question-bank-control="checkbox"
                                                      type="checkbox"
                                                      name={
                                                        "question_" +
                                                        question.question_id
                                                      }
                                                      checked={SelectedQuestionIds.includes(
                                                        question.question_id,
                                                      )}
                                                      onChange={(event) =>
                                                        handleQuestionCheckboxChange(
                                                          event,
                                                          question.question_id,
                                                        )
                                                      }
                                                      onMouseDown={(event) =>
                                                        handleQuestionBankControlMouseDown(
                                                          event,
                                                          question.question_id,
                                                          "checkbox",
                                                        )
                                                      }
                                                    />
                                                    Question-
                                                    {question.question_id}
                                                    &nbsp;
                                                    {question.questionName.slice(
                                                      0,
                                                      11,
                                                    )}
                                                    {extractQuestionForAllCategory(
                                                      question.question_text,
                                                    )}
                                                  </div>
                                                </label>

                                                <div>
                                                  <div>
                                                    <p
                                                      className="m-0 text-center"
                                                      style={{
                                                        fontSize: "10px",
                                                      }}
                                                    >
                                                      <b>{categoryToggle}</b>
                                                    </p>
                                                    <p
                                                      className="m-0 text-center"
                                                      style={{
                                                        fontSize: "10px",
                                                      }}
                                                    >
                                                      <b>
                                                        {item.name.includes(
                                                          "Calculations",
                                                        ) && "Calc"}{" "}
                                                        {item.name.includes(
                                                          "Knowledge",
                                                        ) && "Know"}
                                                      </b>
                                                    </p>
                                                    <p
                                                      className="m-0 text-center"
                                                      style={{
                                                        fontSize: "10px",
                                                      }}
                                                    >
                                                      <b>
                                                        {question?.tagid
                                                          ? generateTagName(
                                                            question?.tagid,
                                                          )
                                                          : "-"}
                                                      </b>
                                                    </p>
                                                  </div>
                                                  <div className="mt-2 text-center">
                                                    <span
                                                      onClick={() =>
                                                        previewQuestion(
                                                          question,
                                                        )
                                                      }
                                                    >
                                                      <HiMiniMagnifyingGlass
                                                        className="previewQusetion"
                                                        onClick={handleShow}
                                                      />
                                                    </span>
                                                  </div>
                                                </div>
                                                <button
                                                  type="button"
                                                  className={styles.addButton}
                                                  data-question-bank-question-id={
                                                    question.question_id
                                                  }
                                                  data-question-bank-control="action"
                                                  onClick={() =>
                                                    toggleQuestionSelection(
                                                      question.question_id,
                                                    )
                                                  }
                                                  onMouseDown={(event) =>
                                                    handleQuestionBankControlMouseDown(
                                                      event,
                                                      question.question_id,
                                                      "action",
                                                    )
                                                  }
                                                  aria-pressed={SelectedQuestionIds.includes(
                                                    question.question_id,
                                                  )}
                                                  aria-label={
                                                    SelectedQuestionIds.includes(
                                                      question.question_id,
                                                    )
                                                      ? `Remove question ${question.question_id} from quiz`
                                                      : `Add question ${question.question_id} to quiz`
                                                  }
                                                >
                                                  {SelectedQuestionIds.includes(
                                                    question.question_id,
                                                  )
                                                    ? "Remove"
                                                    : "Add"}
                                                </button>

                                                {question.question_type ===
                                                  "truefalse" ? (
                                                  <div
                                                    className={styles.answers}
                                                  >
                                                    <label
                                                      className={
                                                        styles.options
                                                      }
                                                    >
                                                      <input
                                                        type="radio"
                                                        name={`question_${question.question_id}`}
                                                        value="true"
                                                        disabled
                                                      />
                                                      True
                                                    </label>
                                                    <label
                                                      className={
                                                        styles.options
                                                      }
                                                    >
                                                      <input
                                                        type="radio"
                                                        name={`question_${question.question_id}`}
                                                        value="false"
                                                        disabled
                                                      />
                                                      False
                                                    </label>
                                                  </div>
                                                ) : (
                                                  <div
                                                    className={styles.answers}
                                                  >
                                                    {getQuestionAnswers(
                                                      question,
                                                    ).map((answer) => (
                                                      <div
                                                        key={
                                                          answer.answer_id
                                                        }
                                                        className={styles.mcq}
                                                      >
                                                        <label
                                                          className={
                                                            styles.options
                                                          }
                                                        >
                                                          <input
                                                            type="radio"
                                                            name={`question_${question.question_id}`}
                                                            value={getAnswerHtml(
                                                              getQuestionAnswers(
                                                                question,
                                                              )[0],
                                                            )}
                                                            disabled
                                                          />
                                                          {extractOptionText(
                                                            getAnswerHtml(
                                                              answer,
                                                            ),
                                                          )}
                                                        </label>
                                                      </div>
                                                    ))}
                                                  </div>
                                                )}
                                              </div>
                                            </motion.div>
                                          ))
                                          : null}
                                      </div>
                                    </li>
                                  ))}
                                </ul>
                              </motion.div>
                            ) : null}
                          </>
                        ) : null}
                      </>
                    )}
                  </div>
                </div>

                <div
                  id="quiz-panel"
                  ref={quizPanelRef}
                  className={styles.halfsec2}
                  role="region"
                  aria-label="Quiz"
                  tabIndex="-1"
                >
                  <div
                    role="status"
                    aria-live="polite"
                    style={{
                      position: "absolute",
                      width: "1px",
                      height: "1px",
                      padding: 0,
                      margin: "-1px",
                      overflow: "hidden",
                      clip: "rect(0, 0, 0, 0)",
                      border: 0,
                    }}
                  >
                    {deleteAnnouncement}
                  </div>
                  <h2 className={styles.sec3head}>
                    <span className="buttonGrpQuesPrev">
                      <div className={styles.scramble_div}>
                        <span className={styles.quesprev}>Quiz</span>
                        <div>
                          <button
                            className="btn btn-sm btn-light mx-2"
                            onClick={scrambleList}
                          >
                            <small>Randomize</small>
                          </button>
                          <button
                            className="btn btn-sm btn-light"
                            onClick={unscrambleList}
                          >
                            <small>Reset</small>
                          </button>
                        </div>
                      </div>
                      <div className="quiz-functional-button">
                        <button
                          type="button"
                          className="btn btn btn-sm btn-light textWithIcons textWithIcons2"
                          onClick={() => handleOpenRedirect("Open")}
                        >
                          <FaFolderOpen className={styles.sec3buttons} />
                          Open
                        </button>

                        <Tippy
                          content="Use this button to save the quiz for future use."
                          disabled={tip}
                        >
                          <button
                            className="btn btn-sm btn-light textWithIcons"
                            onClick={openDialogBoxBeforeSave}
                            disabled={selectedQuestions.length ? false : true}
                          >
                            <PiFloppyDiskBold className={styles.sec3buttons} />
                            Save
                          </button>
                        </Tippy>

                        <Tippy
                          content="Use this button to save the previous quiz with new name for future use."
                          disabled={tip}
                        >
                          <button
                            className="btn btn-sm btn-light textWithIcons"
                            onClick={openDialogBoxOnSaveAs}
                            disabled={selectedQuestions.length ? false : true}
                          >
                            <PiFloppyDiskBold className={styles.sec3buttons} />
                            Save As
                          </button>
                        </Tippy>
                        <button
                          className="btn btn-sm btn-light textWithIcons"
                          onClick={() => handleOpenRedirect("New")}
                          disabled={selectedQuestions.length ? false : true}
                        >
                          <BiSolidWindowAlt className={styles.sec3buttons} />
                          New
                        </button>

                        <div className="dropdown-center">
                          <button
                            id="print-dropdown"
                            className="btn btn-light btn-sm dropdown-toggle textWithIcons"
                            type="button"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                          >
                            <AiFillPrinter className={styles.sec3buttons} />
                            Print
                          </button>

                          <ul
                            className="dropdown-menu filterMenu"
                            aria-labelledby="print-dropdown"
                          >
                            <li className="printDropdownli">
                              <button
                                type="button"
                                id="printBtnDropdown"
                                className="dropdown-item"
                                onClick={handlePrintSelectedQuestions}
                              >
                                Print Quiz
                              </button>
                            </li>

                            <li className="printDropdownli">
                              <button
                                type="button"
                                id="printBtnDropdown"
                                className="dropdown-item"
                                onClick={handlePrintSelectedAnswers}
                              >
                                Print Answers
                              </button>
                            </li>

                            <li className="printDropdownli">
                              <button
                                type="button"
                                id="printBtnDropdown"
                                className="dropdown-item"
                                onClick={handlePrintSolutionSet}
                              >
                                Print Solutions
                              </button>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </span>
                  </h2>
                  <div className={styles.headnewquiz}>
                    <div className={styles.nameAndTitleSection}>
                      <div className={styles.quizcontent}>
                        <Tippy
                          content="Type the name of your quiz."
                          disabled={tip}
                        >
                          <label className={styles.inptextone}>
                            Quiz Name : <span style={{ textTransform: "none" }}>{name}</span>
                          </label>
                        </Tippy>
                      </div>
                      <div className={styles.newquizdisc}>
                        <Tippy
                          content="Type the title of your quiz."
                          disabled={tip}
                        >
                          <label className={styles.inptextthree}>
                            Description
                            <input
                              id={styles.inptext2}
                              value={title}
                              type="text"
                              onChange={(e) => {
                                settitle(e.target.value);
                              }}
                            />
                          </label>
                        </Tippy>
                      </div>
                    </div>
                    <div className={styles.newquiz}>
                      {selectedQuestions.length > 0 ? (
                        <span className={styles.selectedQues}>
                          Number of Questions : {selectedQuestions.length}
                        </span>
                      ) : (
                        <span className={styles.selectedQues}>
                          Number of Questions : 0
                        </span>
                      )}
                    </div>
                  </div>
                  <div className={styles.sec3}>
                    <div className={styles.sec3scroll}>
                      {selectedQuestions.length ? (
                        selectedQuestions?.map((selectedQuestion) => {
                          const question = selectedQuestion;

                          return (
                            <div
                              className={styles.selectedques}
                              key={question.question_id}
                            >
                              <span className={styles.previewques}>
                                Question-
                                {question.question_id}
                                {extractQuestionForAllCategory(
                                  question.question_text,
                                )}
                              </span>
                              <div className="SelectedQuestionIcons">
                                <button
                                  type="button"
                                  className="CrossBtn"
                                  aria-label="Remove question from quiz"
                                  onClick={() => {
                                    deleteListItem(question.question_id);
                                  }}
                                >
                                  <CgCloseR className="crossIcon" />
                                </button>

                                <button
                                  type="button"
                                  className="PreviewBtn"
                                  aria-label="Preview question"
                                  onClick={() => {
                                    previewQuestion(question);
                                    handleShow();
                                  }}
                                >
                                  <HiMiniMagnifyingGlass className="mt-1 h5" />
                                </button>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <h3>Questions used in the Quiz.</h3>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </LoadingOverlay>
      ) : (
        <div className="null"></div>
      )}
    </>
  );
}

export default QuestionBankPage;
