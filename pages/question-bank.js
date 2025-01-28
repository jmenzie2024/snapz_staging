import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import moment from 'moment-timezone';
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
import { registerLocale } from 'react-datepicker';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import es from 'date-fns/locale/es';
import enUS from 'date-fns/locale/en-US';

import { BiSolidWindowAlt } from "react-icons/bi";
import { PiFloppyDiskBold } from "react-icons/pi";
import { AiFillPrinter } from "react-icons/ai";
import Tippy from "@tippyjs/react";
import { HiMiniMagnifyingGlass } from "react-icons/hi2";
import "tippy.js/dist/tippy.css";

import Model from "../components/Model";
import { cullquestions, randomKey, capitalizeFirstLetterOFWordFromString, toLowerCase, removeDuplicatesFromArrayOfObjectByObjKey, isValidYYmmddFormat } from "@/utils/utils";
import { useSelector } from "react-redux";

import { getCategory, postCategory } from "@/utils/utils";
import { checkQuizData } from "@/utils/utils";
import Swal from "sweetalert2";
import { extractQuestionForAllCategory } from "@/utils/utils";
import Modal from 'react-bootstrap/Modal';

registerLocale('es', es);
registerLocale('en-US', enUS);



function QuestionBankPage() {

  const storeQuiz = useSelector((state) => state.questions);
  const latestQuestion = storeQuiz[storeQuiz.length - 1];

  const allQuestionIdsArr = latestQuestion?.map(item => item.question_id);
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
  const [All, setAll] = useState();
  const [accordianSet, setAccordianSet] = useState(true);
  const [categoryToggle, setcategoryToggle] = useState("-");
  const [defaultList, setDefaultList] = useState([]);
  const [quizStateDate, setQuizStateDate] = useState("");
  const [initial17, setInitial17] = useState([]);
  const [initial20, setInitial20] = useState([]);
  const [initial23, setInitial23] = useState([]);
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const [previewQues, setPreviewQues] = useState('');
  const [previewCorrectAnswer, setPreviewCorrectAnswer] = useState('');
  const [previewSolution, setPreviewSolution] = useState('');
  const [singleQuestionCategory, setSingleQuestinCategory] = useState('');
  const [selectableRandomQuestion, setSelectableRandomQuestion] = useState(0);

  const router = useRouter();
  var newquestionIds;
  var token;

  

  useEffect(() => {

    token = localStorage.getItem("token");
    const quizUserName = localStorage.getItem("user");
    const QuizName = localStorage.getItem("QuizName");
    const QuizTitle = localStorage.getItem("QuizTitle");
    const QuizDate = localStorage.getItem("QuizDate");

    setQuestions([]);
    setSelectedQuestions([]);
    if (!token) {
      localStorage.clear();
      router.push("/");
    } else {
      getCategory().then((result) => {
        if (result.length > 0) {
          setcategoryToggle(result[0]?.category);
        }
      });

      if (storeQuiz.length > 0) {
        setTimeout(() => {
          notify("Quiz loaded for use.");

          setSelectedQuestions(latestQuestion);
          setname(capitalizeFirstLetterOFWordFromString(QuizName));
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

  useEffect(()=>{
    if(uniqueAllQuestionIdsArr?.length > 0){
      console.log('uniqueAllQuestionIdsArr', uniqueAllQuestionIdsArr);
      updateQuestionsToLatestQuestions(token, uniqueAllQuestionIdsArr)
    }
},[])


  
  useEffect(() => {
    if (filterid.id && filterid.name) {
      fetchQuestions1();
      setQuestions([]);
    }
  }, [filterid]);

  // useEffect(() => {
  //   if (sessionerr == true) {
  //     localStorage.clear();
  //     router.push("/");
  //   }
  // }, [sessionerr]);

  useEffect(() => {
    if (questions) {
      setchecker(true);
    }
  }, [questions]);

  useEffect(() => {
    if (solutionSet.length > 0) {
      printSolutionSet();
    }
  }, [solutionSet]);



  useEffect(() => {
    if (tagData.length > 0) {
      filterQuestionByTags();
    }
  }, [tagData]);

  //function to refresh page
  function refreshPage() {
    localStorage.setItem("SpecificQuizId", "");
    window.location.reload();
  }

  const updateQuestionsToLatestQuestions = async (token, questionIds) => {

    

    const questionIdsData = { questionIds: questionIds };

    try {
      const data = await fetch(
         process.env.API_URL+"api/updateQuestionContentToLatest",
        {
          credentials: "include",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(questionIdsData),
        }
      );
      const result = await data.json();
      console.log('result', result);
      
    } catch (err) {
      console.log(err);
    }
  }

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
    console.log('tagName', tagName);
    if (tagName == 'easy' || tagName == 'Easy') {
      return 10;
    } else if (tagName == 'medium' || tagName == 'Medium') {
      return 14;
    } else if (tagName == 'hard' || tagName == 'Hard') {
      return 17;
    } else {
      return "-";
    }
  }

  function handleCategoryChange(category) {

    if (category) {

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
            openDialogBoxBeforeSave()

            // savequiz();
          } else if (result.isDenied) {
            // Custom function for Don't Save button
            //refreshPage();

            localStorage.setItem("QuizName", "");
            localStorage.setItem("QuizTitle", "");
            localStorage.setItem("QuizDate", "");
            localStorage.setItem("PrevQuesIds", "");
            localStorage.setItem("QuizYear", "");
            localStorage.setItem("SpecificQuizId", "");
            ////////////// remove selected question from selected year ///////////////
            setSelectedQuestions([])

            /////////////// change year ///////////////
            setSingleQuestinCategory('')
            setname('')
            setcategoryToggle(category);
            settname('All')
            postCategory(category);
            setfilterid({});
            setSelectableRandomQuestion(0)
            setQuestions([])
            setAllQuestions([])
            notify("Category changed to " + category);
          } else {
            // Custom function for Cancel button
          }
        });

      } else {

        setSingleQuestinCategory('')
        setname('')
        setcategoryToggle(category);
        settname('All')
        postCategory(category);
        setfilterid({});
        setSelectableRandomQuestion(0)
        setQuestions([])
        setAllQuestions([])

        notify("Category changed to " + category);
      }
    }
  }
  // function removeButtonsFromHTML(htmlString) {   //function to remove only buttons from solutions html
  //   const parser = new DOMParser();
  //   const doc = parser.parseFromString(htmlString, "text/html");

  //   const buttons = doc.querySelectorAll("button");
  //   buttons.forEach((button) => button.remove());

  //   const modifiedHTMLString = doc.body.innerHTML;
  //   return modifiedHTMLString;
  // }




  //function to fetch data for difficulty filter
  async function handleDifficulty(tagType) {
    console.log('tagType', tagType);

    if (filterCountTrack.name == tagType && filterCountTrack.count == 1) {
      warn("Already filtered");
    } else {
      settname(tagType);
      console.log('allQuestions', allQuestions);

      if (allQuestions.length > 0) {
        try {
          setisActive(true);
          const tagdataid = generateTagId(tagType)
          console.log('tagdataid', tagdataid);
          const filter_question = allQuestions.filter((item) => item.tagid == tagdataid);
          if (filter_question?.length) {
            setQuestions(filter_question)
            setSelectableRandomQuestion(filter_question?.length)
            notify("Questions Filtered");
          } else {
            setQuestions([])
            setSelectableRandomQuestion(0)
            //notify("No " + tagType + " questions in category");
            warn("No " + tagType + " questions in category", "Category Empty");
          }

          // const tag = await fetch(
          //   process.env.API_URL+`api/tags?tag=${tagType}`
          // );
          // const tags = await tag.json();

          // settagData(tags);
          setisActive(false);

        } catch (error) {
          console.log("error while fetching");
        }
      } else {
        //warn("No questions to filter. Please select any category!!", "Sorry!!");
      }
    }
  }

  async function handleOpenRedirect(name) {
    if (name == "Open") {
      if (selectedQuestions.length > 0) {
        Swal.fire({
          title: "Save your changes to this quiz ?",
          text: "Do you want to save your changes before leaving this page!",
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
            // Custom function for Save button
            // savequiz();
            openDialogBoxBeforeSave()
          } else if (result.isDenied) {
            const checkQuiz = await checkQuizData();
            localStorage.setItem("QuizName", "");
            localStorage.setItem("QuizTitle", "");
            localStorage.setItem("QuizDate", "");
            localStorage.setItem("PrevQuesIds", "");
            localStorage.setItem("QuizYear", "");
            localStorage.setItem("SpecificQuizId", "");
            if (checkQuiz) {
              router.push("/MyQuiz");
            } else {
              warn("You dont have any saved quiz.", "Sorry!!");
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
          warn("You dont have any saved quiz.", "Sorry!!");
        }
      }
    } else {
      if (selectedQuestions.length > 0) {
        Swal.fire({
          title: "Save your changes to this quiz?",
          text: "Do you want to save your changes before loading new instance!",
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
            openDialogBoxBeforeSave()

            // savequiz();
          } else if (result.isDenied) {
            // Custom function for Don't Save button
            localStorage.setItem("QuizName", "");
            localStorage.setItem("QuizTitle", "");
            localStorage.setItem("QuizDate", "");
            localStorage.setItem("PrevQuesIds", "");
            localStorage.setItem("QuizYear", "");
            localStorage.setItem("SpecificQuizId", "");
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
        setSelectableRandomQuestion(matchingObjects.length)
        notify("Questions Filtered");
      } else {
        // settname(filterCountTrack.name);
        setQuestions([]);
        setSelectableRandomQuestion(0)
        //notify("No " + tname + " questions in category");
        warn("No " + tname + " questions in category", "Category Empty");
      }
    } else {
      warn("Cannot Filter the questions.", "Sorry!!");
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
  //function to print the solution set
  const printSolutionSet = () => {
    const printContent = selectedQuestions
      .map((question, index) => {

        let questionText = question.question_text.replace(/<summary>Question<\/summary>\s*/, `<summary>Question  ${index + 1}<\/summary>`);

        const solutions = removeButtonsAndElementsWithId(
          solutionSet[index].general_feedback
        );
        return `<div className="container"><span className="questionText"> ${questionText}</span> <br/><br>${solutions}</div><br/><br/>`;
      })
      .join("");

    const printWindow = window.open("", "Print", "height=720,width=1280");
    if (printWindow) {
      printWindow.document.write(
        `<html><head><title></title><style>
        .topHeadingQuizPage{
          text-align:center;
          text-transform:capitalise;
        }
        @media print {
          .container {
            
            page-break-inside: avoid;
          }
          
        }</style><link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-T3c6CoIi6uLrA9TneNEoa7RxnatzjcDSCmG1MXxSR1GAsXEV/Dwwykc2MPK8M2HN" crossorigin="anonymous"><link rel="stylesheet" href="https://snapz.com/wp-content/uploads/snapz-print.css">
        </head><body><h1 className="topHeadingQuizPage">${name}</h1><br/>${printContent}</body></html>`
      );
      printWindow.document.close();
      printWindow.print();
    } else {
      //warn("Popup blocked in browser");
    }
  };
  //function to fetch solution set for selected questions
  const handlePrintSolutionSet = async () => {
    if (selectedQuestions.length > 0) {
      token = localStorage.getItem("token");
      setisActive(true);
      var filteredIds = [];
      selectedQuestions.filter((item) => filteredIds.push(item.question_id))
      try {
        const solution = await fetch(
          process.env.API_URL + `api/generalfeedback?ids=${filteredIds}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`, // Include the JWT token in the Authorization header
            },
          }
        );
        const solutions = await solution.json();

        setsolutionSet(solutions);

        setisActive(false);
      } catch (err) {

        setisActive(false);
      }
    } else {
      warn("Please select some questions first", "Sorry!!");
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
    toast.success(data, { bodyClassName: "custom-toast-body", position: toast.POSITION.TOP_CENTER, });
  };
  const warn = (data, message = null) => {
    Swal.fire(message ? message : "Error!", data, "warning");
    //toast.warning(data, { bodyClassName: "custom-toast-body", position: toast.POSITION.TOP_CENTER, });
  };

  const showReplacePopUp = (foundQuiz) => {

    token = localStorage.getItem("token");
    const username = localStorage.getItem("user");

    const num = SelectedQuestionIds.length;

    let quizDate = quizStateDate;
    if (quizDate) {
      let checkDateFormat = isValidYYmmddFormat(quizStateDate);
      if (!checkDateFormat) {
        quizDate = convertDateFormatToYYYYMMDD(quizStateDate);
      }
    }
    console.log('foundQuiz showReplacePopUp', foundQuiz);

    Swal.fire({
      title: "Replace Quiz?",
      text: "A quiz by that name already exists. Do you want to replace it?",
      icon: "warning",
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes",
      denyButtonText: `No`,
      cancelButtonText: "No",
    }).then((result) => {
      console.log('result', result);

      if (result.isConfirmed) {
        // Custom function for Save button

        const quizData = {

          quizName: name,
          questionIds: SelectedQuestionIds,
          number_ques: num,
          title: title,
          username: username,
          Date: quizDate,
          quiz_year: categoryToggle,
          id: foundQuiz.quiz_id
        };
        console.log('quizData', quizData);

        ///////////// Update quiz  //////////////////////
        quizUpdate(quizData)

      } else if (result.isDenied) {
        // Custom function for Don't Save button
        //refreshPage();
        console.log("no button hit")
        openDialogBoxBeforeSave()

      } else {
        // Custom function for Cancel button
      }
    });
  }

  const updateQuiz = () => {
    updateQuizData();
  }



  const openDialogBoxBeforeSave = () => {
    //if (name != "" && title != "" && quizStateDate != "") {
    const PrevQuesIds = localStorage.getItem("PrevQuesIds");
    const SpecificQuizId = localStorage.getItem("SpecificQuizId");

    console.log('SpecificQuizId', SpecificQuizId);



    //////////////////// Get All Quizzes ///////////////     

    // if(PrevQuesIds){
    //   //updateQuiz()
    //   showReplacePopUp()
    // } else {
    if (SpecificQuizId) {
      updateQuizData()
    } else {

      console.log('name', name);

      Swal.fire({
        input: 'text',
        inputAttributes: {
          autocapitalize: 'off'
        },
        inputLabel: "Quiz name :",
        inputValue: name,
        text: "Save your changes to this quiz ?",
        showDenyButton: false,
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Save",
        //denyButtonText: `Delete`,
        cancelButtonText: "Cancel",
        preConfirm: (inputValue) => {
          // const exists = allQuizName.includes(toLowerCase(inputValue));          

          if (!inputValue) {
            Swal.showValidationMessage('Quiz name is required.');
          }
          if (!name) {
            setname(inputValue)
          }
          // setname(inputValue)
        },
      }).then((result) => {
        if (result.isConfirmed) {
          console.log('allQuizName result', result);
          // const exists = allQuizName.includes(toLowerCase(result?.value));
          const foundQuiz = allQuizNameId.find(quiz => quiz.quiz_name === toLowerCase(result?.value));
          // console.log('allQuizName open exists', PrevQuesIds, foundQuiz);
          // setname(result?.value)
          setname((prev) => result?.value);

          if (foundQuiz != undefined && foundQuiz.quiz_id != SpecificQuizId) {
            showReplacePopUp(foundQuiz)
          } else {
            // setAllQuizName([...allQuizName, toLowerCase(result?.value)]);
            savequiz(result?.value);
          }

          // } else if (result.isDenied) {
          //   // Custom function for Don't Save button
          //   refreshPage();
        } else {
          // Custom function for Cancel button
        }
      });
      // } 

      // else {
      //   savequiz();
      // }
    }
  }

  const openDialogBoxOnSaveAs = () => {
    //if (name != "" && title != "" && quizStateDate != "") {
    const PrevQuesIds = localStorage.getItem("PrevQuesIds");
    const SpecificQuizId = localStorage.getItem("SpecificQuizId");

    console.log('SpecificQuizId', SpecificQuizId);



    //////////////////// Get All Quizzes ///////////////     

    // if(PrevQuesIds){
    //   //updateQuiz()
    //   showReplacePopUp()
    // } else {

    Swal.fire({
      input: 'text',
      inputAttributes: {
        autocapitalize: 'off'
      },
      inputLabel: "Quiz name :",
      inputValue: name,
      text: "Save your changes to this quiz ?",
      showDenyButton: false,
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Save",
      //denyButtonText: `Delete`,
      cancelButtonText: "Cancel",
      preConfirm: (inputValue) => {
        // const exists = allQuizName.includes(toLowerCase(inputValue));          

        if (!inputValue) {
          Swal.showValidationMessage('Quiz name is required.');
        }
        if (!name) {
          setname(inputValue)
        }
        // setname(inputValue)
      },
    }).then((result) => {
      if (result.isConfirmed) {

        // const exists = allQuizName.includes(toLowerCase(result?.value));
        const foundQuiz = allQuizNameId.find(quiz => quiz.quiz_name === toLowerCase(result?.value));
        console.log('allQuizName open exists', PrevQuesIds, foundQuiz);
        setname(result?.value)

        if (foundQuiz != undefined && foundQuiz.quiz_id != SpecificQuizId) {
          showReplacePopUp(foundQuiz)
        } else {
          // setAllQuizName([...allQuizName, toLowerCase(result?.value)]);
          savequiz(result?.value);
        }

        // } else if (result.isDenied) {
        //   // Custom function for Don't Save button
        //   refreshPage();
      } else {
        // Custom function for Cancel button
      }
    });
    // } 

    // else {
    //   savequiz();
    // }
  }



  const savequiz = async (quizNameFromPopUp = null) => {
    console.log('name', allQuizName);


    if (selectedQuestions.length == 0) {
      warn("Quiz is empty.", "Sorry!!");
    } else {

      //////////////// quiz save code start /////////////

      token = localStorage.getItem("token");
      const username = localStorage.getItem("user");

      const num = SelectedQuestionIds.length;
      let currentQuizName = quizNameFromPopUp != null ? toLowerCase(quizNameFromPopUp) : toLowerCase(name);

      const quizData = {
        quizName: currentQuizName,
        questionIds: SelectedQuestionIds,
        number_ques: num,
        title: title,
        username: username,
        Date: quizStateDate,
        quiz_year: categoryToggle
      }

      ///////////// quiz name is same but questions is updated //////////////////////
      if (currentQuizName == '') {

        Swal.fire({
          input: 'text',
          inputAttributes: {
            autocapitalize: 'off'
          },
          inputLabel: "Quiz name :",
          inputValue: name,
          text: "You changed some questions of this quiz. Please update Quiz name ?",
          showDenyButton: false,
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Save",
          //denyButtonText: `Delete`,
          cancelButtonText: "Cancel",
          preConfirm: (inputValue) => {
            const exists = allQuizName.includes(toLowerCase(inputValue));
            if (!inputValue) {
              Swal.showValidationMessage('You need to enter Quiz name!');
            } else if (exists) {
              Swal.showValidationMessage('You need to change Quiz name. This is already exist');
            }
          },
        }).then((result) => {
          if (result.isConfirmed) {
            const exists = allQuizName.includes(toLowerCase(result?.value));
            setname(result?.value)
            if (exists) {
              Swal.showValidationMessage('You need to change Quiz name. This is already exist');
            } else {
              setAllQuizName([...allQuizName, toLowerCase(result?.value)]);

              savequiz(result?.value);
            }
          }
        });

      } else {
        const exists = allQuizName.includes(toLowerCase(currentQuizName));

        if (exists) {
          Swal.showValidationMessage('You need to change Quiz name. This is already exist');
        } else {
          setAllQuizName([...allQuizName, toLowerCase(currentQuizName)]);
          quizSaveApiHit(quizData)
        }

      }
    }
  }

  const quizSaveApiHit = (quizData) => {
    //////////////// quiz save code start //////////////  

    token = localStorage.getItem("token");
    setisActive(true);

    fetch(process.env.API_URL + "api/saveQuiz", {
      credentials: "include",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(quizData),
    }).then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        console.error("Failed to save the quiz:");
      }
    }).then((data) => {
      setisActive(false);
      //setname('')


      setAllQuizName((prevQuizNames) => {
        const updatedNames = [...prevQuizNames, toLowerCase(quizData?.quizName)];
        return updatedNames; // Return the new count
      });

      ///// Update all quiz data to current state//////////

      const quizUserName = localStorage.getItem("user");
      fetchQuiz(token, quizUserName)

      notify("Quiz saved.");
      //refreshPage();
    }).catch((error) => {
      setisActive(false);
      console.error("Error saving the quiz:", error);
    });

    //////////////// quiz save code end //////////////
  }

  const updateQuizData = async (quizNameFromPopUp = null) => {

    if (selectedQuestions.length == 0) {
      warn("Quiz is empty.", "Sorry!!");
    } else {
      //////////////// quiz save code start //////////////        

      token = localStorage.getItem("token");
      const username = localStorage.getItem("user");
      const SpecificQuizId = localStorage.getItem("SpecificQuizId");

      const num = SelectedQuestionIds.length;
      let currentQuizName = quizNameFromPopUp != null ? toLowerCase(quizNameFromPopUp) : toLowerCase(name);

      let checkDateFormat = isValidYYmmddFormat(quizStateDate);

      console.log('checkDateFormat1', checkDateFormat, quizStateDate);

      let quizDate = quizStateDate;
      console.log('checkDateFormat1 quizDate', quizDate);

      if (quizDate && !checkDateFormat) {
        quizDate = convertDateFormatToYYYYMMDD(quizStateDate);
      }
      const quizData = {

        quizName: currentQuizName,
        questionIds: SelectedQuestionIds,
        number_ques: num,
        title: title,
        username: username,
        Date: quizDate,
        quiz_year: categoryToggle,
        id: SpecificQuizId
      };
      // console.log('quizData', quizData, checkDateFormat);

      ///////////// Update quiz  //////////////////////
      quizUpdate(quizData)

    }
  }

  const quizUpdate = (quizData) => {
    //////////////// quiz update code start //////////////        

    token = localStorage.getItem("token");
    setisActive(true);
    fetch(process.env.API_URL + "api/updateQuiz", {
      credentials: "include",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(quizData),

    }).then((response) => {

      if (response.ok) {
        localStorage.setItem("QuizName", "");
        localStorage.setItem("QuizTitle", "");
        localStorage.setItem("QuizDate", "");
        localStorage.setItem("PrevQuesIds", "");
        localStorage.setItem("QuizYear", "");
        localStorage.setItem("SpecificQuizId", "");

        return response.json();
      } else {
        console.error("Failed to update the quiz:");
      }
    }).then((data) => {
      setisActive(false);
      //setname('')
      setAllQuizName([...allQuizName, name])
      localStorage.setItem("QuizName", "");
      localStorage.setItem("QuizTitle", "");
      localStorage.setItem("QuizDate", "");
      localStorage.setItem("PrevQuesIds", "");
      localStorage.setItem("QuizYear", "");
      localStorage.setItem("SpecificQuizId", "");

      ///// Update all quiz data to current state//////////

      const quizUserName = localStorage.getItem("user");
      fetchQuiz(token, quizUserName)

      notify("Quiz updated.");
      //refreshPage();
    }).catch((error) => {
      setisActive(false);
      console.error("Error updating the quiz:", error);
    });

    //////////////// quiz update code end //////////////
  }

  const customrandomques2 = () => {
    // This function is triggered from Model component when add to Quiz button is pressed to finally add the questions in Quiz.
    if (randomlimit != "") {
      if (selectedQuestions.length == 100) {
        warn(" Limit of 100 questions reached, please remove some questions!", "Sorry!!");
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
        warn(" Limit of 100 questions reached, please remove some questions!", "Sorry!!");
      } else {
        let space = 100 - selectedQuestions.length;
        if (randomlimit <= space) {
          const filteredArray = questions.filter(
            (item) => !SelectedQuestionIds.includes(item.question_id)
          );

          if (filteredArray.length >= randomlimit) {
            if (filteredArray.length > 0) {
              const randomIndices = generateRandomIndices(
                filteredArray.length,
                randomlimit
              );
              let newques = randomIndices.map((index) => filteredArray[index]);
              let newquesIds = newques.map((item) => item.question_id);
              setRandomQues(newques);
              setRandomQuesIds(newquesIds);

              // setSelectedQuestions(selectedQuestions.concat(newques))
              // setSelectedQuestionIds(SelectedQuestionIds.concat(newquesIds))

              // notify(newques.length + ' questions added in quiz succesfully.')
            } else {
              warn("The category does not have" + randomlimit + "questions", "Sorry!!");
            }
          } else {
            let result = filteredArray.every((item) => selectedQuestions.includes(item));

            if (result) {
              if (questions.length == 0) {
                warn("This category is empty!!", "Sorry!!");
              } else {
                if (selectedQuestions.length > 0) {
                  warn("Every question of the category is selected", "Sorry!!");
                  setrandomlimit("");
                } else {
                  warn("Please select a catgory.", "Sorry!!");
                  setrandomlimit("");
                }
              }
            } else {
              warn(
                "The category has only " +
                filteredArray.length +
                " question to select"
              );
              setrandomlimit("");
            }
          }
        } else {
          warn(" Only " + space + " questions can be add in quiz!");
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
    token = localStorage.getItem("token");
    try {
      const random = await fetch(
        process.env.API_URL + "api/questions/random",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Include the JWT token in the Authorization header
          },
        }
      );
      const randomdata = await random.json();
      setSelectedQuestions(randomdata.randomQuestions);
      setSelectedQuestionIds(randomdata.questionIDs);
      notify("100 random questions saved to quiz.");
    } catch (err) {
      console.log(err);
    }
  };

  function liftup(id, name) {
    console.log('category click')
    if (filterid.id == id) {
      //settname("");
      setfilterid({});
      setAllQuestions([]);
      setSelectableRandomQuestion(0);
    } else {
      setSelectableRandomQuestion(questions?.length);
      setfilterid({ id, name });
    }
  }

  const fetchQuestions1 = async (tag_type = '') => {
    console.log('tag_type', tag_type);
    console.log('tag_type filterid', filterid);

    if (filterid === "all") {
      setisActive(true);
      try {
        const response = await fetch(
          process.env.API_URL + "api/questions"
        );
        var data = await response.json();
        setQuestions(data);
        setAllQuestions(data)
        setisActive(false);
      } catch (error) {
        setisActive(false);
      }
    } else if (filterid.id != undefined && filterid.name != undefined) {
      console.log('filterid elseif', filterid.id);

      setisActive(true);
      try {
        token = localStorage.getItem("token");
        const response = await fetch(
          process.env.API_URL + `api/article/category/${filterid.id}/${filterid.name}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`, // Include the JWT token in the Authorization header
            },
          }
        );
        var data = await response.json();
        if (data.length == 0) {
          warn("This category is empty.", "Category Empty");
        }

        const duplicateFreeArray = cullquestions(data.reverse());
        setAllQuestions(duplicateFreeArray)
        setQuestions(duplicateFreeArray);
        setSelectableRandomQuestion(duplicateFreeArray?.length);

        if (tag_type == "" && tname != "All" && tname != "") {
          const tagdataid = generateTagId(tname)
          const filter_question = duplicateFreeArray.filter((item) => item.tagid == tagdataid);

          (filter_question.length == 0) ? warn(`No ${tname} question in this category`, 'Category Empty') : "";
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



  // useEffect(() => {
  //   if ( category14.length > 0 && category17.length > 0 && category20.length > 0 &&  category23.length > 0 ) {
  //     setAccordianSet(true);
  //   }
  // }, [category14, category17, category20, category23]);


  // const handleQuestionCheckboxChange = (event, questionId) => {
  //   const isChecked = event.target.checked;

  //   if (isChecked) {
  //     if (selectedQuestions.length < 100) {
  //       const question = questions.find((q) => q.question_id === questionId);
  //       if (question) {
  //         setSelectedQuestions((prevSelectedQuestions) => [
  //           ...prevSelectedQuestions,
  //           question,
  //         ]);
  //         // Add this line to update the SelectedQuestionIds state
  //         setSelectedQuestionIds((prevSelectedQuestionIds) => [
  //           ...prevSelectedQuestionIds,
  //           questionId,
  //         ]);
  //       }
  //     } else {
  //       event.target.checked = false;
  //       warn("You can only select up to 100 questions.");
  //     }
  //   } else {
  //     setSelectedQuestions((prevSelectedQuestions) =>
  //       prevSelectedQuestions.filter(
  //         (question) => question.question_id !== questionId
  //       )
  //     );
  //     setSelectedQuestionIds((prevSelectedQuestionIds) =>
  //       prevSelectedQuestionIds.filter((id) => id !== questionId)
  //     );
  //   }
  // };

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
      }
      if (data.status === 429) {
        //
        warn("You have made too many requests.");
        localStorage.clear();
        router.push("/");
      }

      let quizNameArr = data?.map(item => item.quiz_name.trim())
      setAllQuizName(quizNameArr)

      let quizNameIdArr = data?.map(item => ({
        'quiz_name': item.quiz_name.trim(),
        'quiz_id': item.id
      }))
      setAllQuizNameId(quizNameIdArr)

      // setQuiz(data);
    } catch (error) {
      localStorage.clear();
      console.log("catch block MyQuiz.js", error);
    }
  };

  const handleQuestionCheckboxChange = (event, questionId) => {
    const isChecked = event.target.checked;

    if (isChecked) {
      if (selectedQuestions.length < 100) {
        if (SelectedQuestionIds.includes(questionId)) {
          event.target.checked = false;
          const filteredIdArray = SelectedQuestionIds.filter((item) => {
            return item != questionId;
          });
          const filteredNewQuesArray = selectedQuestions?.filter(
            (item) => item.question_id != questionId
          );

          // console.log('filteredIdArray', filteredIdArray, filteredNewQuesArray);
          setSelectedQuestionIds(filteredIdArray);
          setSelectedQuestions(filteredNewQuesArray);

          ///////////// call for checking questions //////////////
          // countTotalQuestionAvailableInCategory(questions, filteredIdArray)

        } else {
          console.log('SelectedQuestionIds', SelectedQuestionIds);

          const question = questions?.find((q) => q.question_id === questionId);
          setSelectedQuestions((prevSelectedQuestions) => [
            ...prevSelectedQuestions,
            question,
          ]);


          // setSelectedQuestionIds((prevSelectedQuestionIds) => {
          //  const newCount =  [...prevSelectedQuestionIds, questionId];

          //   /////////// call for checking questions //////////////
          //   countTotalQuestionAvailableInCategory(questions, newCount)
          //   return newCount;
          // });

          setSelectedQuestionIds((prevSelectedQuestionIds) => [...prevSelectedQuestionIds, questionId]);


        }
      } else {
        event.target.checked = false;
        warn("You can only select up to 100 questions.");
      }
    } else {
      setSelectedQuestions((prevSelectedQuestions) =>
        prevSelectedQuestions?.filter((q) => q.question_id !== questionId)
      );
      setSelectedQuestionIds((prevSelectedQuestionIds) =>
        prevSelectedQuestionIds.filter((id) => id !== questionId)
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
            text-transform: capitalize;
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
          const shuffledAnswers = shuffleArray(removeDuplicatesFromArrayOfObjectByObjKey(question.answers));
          // Extract the first shuffled answer as the correct one
          const correctOption = `<li>${shuffledAnswers[0].answer}</li>`; // Change here
          const otherOptions = shuffledAnswers
            .slice(1)
            .map((answer) => `<li>${answer.answer}</li>`)
            .join("");

          let newQuesText = question.question_text.replace(/<summary>Question<\/summary>\s*/, `<summary>Question  ${index + 1}<\/summary>`);
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

      const printWindow = window.open("", "Print", "height=720,width=1280");
      if (printWindow) {
        setTimeout(() => {
          printWindow.document.write(
            `<html>
              <head>
                <title></title>
                ${printStyles}
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-T3c6CoIi6uLrA9TneNEoa7RxnatzjcDSCmG1MXxSR1GAsXEV/Dwwykc2MPK8M2HN" crossorigin="anonymous">
                <link rel="stylesheet" href="https://snapz.com/wp-content/uploads/snapz-print.css">
              </head>
              <body>
                <h1 className="topHeadingQuizPage">${name}</h1>
                ${printContent}
              </body>
            </html> `
           
          )}, 1000)
          printWindow.document.close()
          printWindow.focus();
          setTimeout(() => { 
            printWindow.print() 
          }, 1500);
      } else {
        // warn("Popup blocked in browser");
      }
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
          const selectedOption = question.answers.find(
            (answer) => answer.answer_id === answerId
          );


          let answerText = "";

          if (
            selectedOption.answer === "True" ||
            selectedOption.answer === "False"
          ) {
            answerText = selectedOption.answer;
          } else {
            answerText = extractAnswerText(selectedOption.answer);
          }


          //let questionText = question.question_text.replace(/<summary>Question<\/summary>\s*/, `<summary>Question  ${index + 1}<\/summary>`);
          // return `<div className="container"> ${question_text}<br/><strong><br>Answer: ${answerText}</strong></div><br/><br/>`;
          return `<div className="container"> <strong><summary>Question  ${index + 1} : <\/summary><br/>Answer:</strong> ${answerText}</div><br/><br/>`;
        })
        .join("");

      const printWindow = window.open("", "Print", "height=720,width=1280");
      if (printWindow) {
        printWindow.document.write(
          `<html><head><title></title><style>
          
          .topHeadingQuizPage{
            text-align:center;
            text-transform:capitalise;
          }
          @media print {
          .container {
            
            page-break-inside: avoid;
          }
        }</style><link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-T3c6CoIi6uLrA9TneNEoa7RxnatzjcDSCmG1MXxSR1GAsXEV/Dwwykc2MPK8M2HN" crossorigin="anonymous"><link rel="stylesheet" href="https://snapz.com/wp-content/uploads/snapz-print.css">
        </head></head><body><h1 className="topHeadingQuizPage">${name}</h1><br/>${printContent}</body></html>`
        );
        printWindow.document.close();
        printWindow.print();
      } else {
        // warn("Popup blocked in browser");
      }
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
    console.log('scrambleList defaultList', defaultList);
    console.log('scrambleList selectedQuestions', selectedQuestions);

    if (defaultList.length == 0) {
      setDefaultList(selectedQuestions);
    } else {
      setSelectedQuestions(shuffleArray(selectedQuestions));
      notify("Questions Randomized")
    }

  }
  const unscrambleList = () => {
    if (defaultList.length != selectedQuestions.length || defaultList.length == 0) {
      //warn("Randomize Questions", "Sorry!!")
    }
    //  else if (defaultList.length == 0) {
    //   notify("Already Unscrambled!")
    // }
    else {
      setSelectedQuestions(defaultList);
      notify("Questions Reset")
    }

  }
  const deleteListItem = (data) => {
    deletelement(data);
    if (selectedQuestions.length != defaultList.length) {
      setDefaultList([]);
    }

  }

  const [totalAvailableQuestions, setTotalAvailableQuestions] = useState();
  const countTotalQuestionAvailableInCategory = (questions, selectedQuestions) => {

    // console.log('questions ', questions, selectedQuestions);
    /// let totalRemainingQues = questions.filter(item => item.question_id == selectedQuestions);
    const totalRemainingQues = questions.filter(obj => !selectedQuestions.includes(obj.question_id));

    // console.log('totalRemainingQues', totalRemainingQues);
    setTotalAvailableQuestions(totalRemainingQues)

  }

  /* TO handle category question and heirchy filter by cateogry and hide know/calc by changing filter. 
    we get the specific category array from Test component. So that we can remove duplicate code and reduce lines of code
    */

  const filterByCategory = (category) => {

    setSingleQuestinCategory(category == 'all category' ? "All" : category);

    if (categoryToggle == '2017') {
      // category17
      const value = initial17;
      if (category == "knowledge") {
        const filteredKnowledge = [];
        value.map((item) => {
          if (item.name.includes("Knowledge")) {

            filteredKnowledge.push(item);
            //setCategory17(filteredKnowledge)
          }
        }
        );

      }

      if (category == "calculations") {
        const filteredCalculations = [];
        value.map((item) => {
          if (item.name.includes("Calculations")) {
            filteredCalculations.push(item);
            //setCategory17(filteredCalculations)
          }
        });
      }

      if (category == "all category") {
        setCategory17(value)
      }
    }

    if (categoryToggle == '2020') {
      // category20
      const value = initial20;
      if (category == "knowledge") {
        const filteredKnowledge = [];
        value.map((item) => {
          if (item.name.includes("Knowledge")) {

            filteredKnowledge.push(item);
            // setCategory20(filteredKnowledge)
          }
        }
        );

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
        setCategory20(value)
      }
    }
    if (categoryToggle == '2023') {
      // category23
      const value = initial23;
      if (category == "knowledge") {
        const filteredKnowledge = [];
        value.map((item) => {
          if (item.name.includes("Knowledge")) {

            filteredKnowledge.push(item);
            //setCategory23(filteredKnowledge)
          }
        }
        );

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
        setCategory23(value)
      }
    }

  }
  const previewQuestion = async (question) => {

    setPreviewQues(question);
    question.answers.map((item) => {
      if (item.answer_id == question.correct_answer) {
        setPreviewCorrectAnswer(item.answer)
      }
    })

    token = localStorage.getItem("token");
    try {
      const solution = await fetch(
        process.env.API_URL + `api/generalfeedback?ids=${question.question_id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Include the JWT token in the Authorization header
          },
        }
      );
      const solutions = await solution.json();

      setPreviewSolution(solutions ? solutions[0].general_feedback : "<p>No data</p>")


    } catch (err) {
      console.log(err);
    }

  }

  const parseAndFormatDate = (dateStr) => {
    const date = new Date(dateStr);
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-indexed
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  };

  function convertDateFormatToYYYYMMDD(dateString) {

    const regex = /^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])-(20|19)\d\d$/;

    if (!regex.test(dateString)) {
      throw new Error('Invalid date format. Please use MM-DD-YYYY.');
    }

    // Split the date into components
    const parts = dateString.split('-');
    const month = parts[0]; // MM
    const day = parts[1];   // DD
    const year = parts[2];  // YYYY

    // Rearrange to YYYY-MM-DD
    return `${year}-${month}-${day}`;
  }

  const handleDateChange = (e) => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const nwDate = parseAndFormatDate(e)   

    const utcDate = moment.tz(e, 'YYYY-MM-DD', 'America/Los_Angeles').utc().format('YYYY-MM-DD'); 
    setQuizStateDate(utcDate)

    console.log('nwDate', nwDate, utcDate);
    
  }


  return (
    <>
      {/* preview question modal */}
      <>
        <Modal show={show} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Preview Question</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div>
              <p>
                <b>Question</b> - <span dangerouslySetInnerHTML={{ __html: previewQues ? previewQues.question_text : '<p>No data</p>' }}></span>
              </p>

              <p className="d-flex">
                <b>1</b> - <span dangerouslySetInnerHTML={{ __html: previewQues ? previewQues.answers[0].answer : '<p>No data</p>' }}></span>
              </p>

              <p className="d-flex">
                <b>2</b> - <span dangerouslySetInnerHTML={{ __html: previewQues ? previewQues.answers[1].answer : '<p>No data</p>' }}></span>
              </p>

              <p className="d-flex">
                <b>3</b> - <span dangerouslySetInnerHTML={{ __html: previewQues ? previewQues.answers[2].answer : '<p>No data</p>' }}></span>
              </p>

              <p className="d-flex">
                <b>4</b> - <span dangerouslySetInnerHTML={{ __html: previewQues ? previewQues.answers[3].answer : '<p>No data</p>' }}></span>
              </p>


              <p className="d-flex">
                <b>Correct Answer</b> - <span dangerouslySetInnerHTML={{ __html: previewQues ? previewCorrectAnswer : '<p>No data</p>' }}></span>
              </p>

              <p>
                <span dangerouslySetInnerHTML={{ __html: previewSolution ? previewSolution : '<p>No data</p>' }}></span>
              </p>
            </div>
          </Modal.Body>
          <Modal.Footer>
          </Modal.Footer>
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
                <div className={styles.sec22}>
                  <Tippy
                    content="These are the chapters or categories. Select one to see the questions inside."
                    disabled={tip}
                  >
                    <div className={styles.lablesec}>
                      <h2 className="quesBankTopContainer">
                        <span className={styles.questions}>Question Bank</span>
                        <div className="topbuttons">
                          <div className="dropdown ">
                            <button
                              className={`btn btn-sm btn-light dropdown-toggle `}
                              type="button"
                              data-bs-toggle="dropdown"
                              aria-expanded="false"
                            >
                              NEC Version
                            </button>
                            <ul className="dropdown-menu filterMenu">
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
                                <span
                                  className="dropdown-item filterItem"
                                  onClick={() => {
                                    handleCategoryChange("2017");
                                  }}
                                >
                                  NEC 2017
                                </span>
                              </li>
                              <li>
                                <span
                                  className="dropdown-item filterItem"
                                  onClick={() => {
                                    handleCategoryChange("2020");
                                  }}
                                >
                                  NEC 2020
                                </span>
                              </li>
                              <li>
                                <span
                                  className="dropdown-item filterItem"
                                  onClick={() => {
                                    handleCategoryChange("2023");
                                  }}
                                >
                                  NEC 2023
                                </span>
                              </li>
                              {/* <li>
                                <span
                                  className="dropdown-item filterItem"
                                  onClick={() => {
                                    handleCategoryChange("All");
                                  }}
                                >
                                  All
                                </span>
                              </li> */}
                            </ul>
                          </div>
                          {/* <div className="dropdown ">
                            <button
                              className={`btn btn-sm btn-light dropdown-toggle `}
                              type="button"
                              data-bs-toggle="dropdown"
                              aria-expanded="false"
                            >
                              calc/know
                            </button>
                            <ul className="dropdown-menu filterMenu">
                              <li onClick={() => filterByCategory("knowledge")}>
                                <span
                                  className="dropdown-item filterItem"

                                >
                                  Knowledge
                                </span>
                              </li>
                              <li onClick={() => filterByCategory("calculations")}>
                                <span
                                  className="dropdown-item filterItem"

                                >
                                  Calculations
                                </span>
                              </li>
                              <li onClick={() => filterByCategory("all category")}>
                                <span
                                  className="dropdown-item filterItem"

                                >
                                  All
                                </span>
                              </li>

                            </ul>
                          </div> */}
                          <div className="dropdown ">
                            <button
                              className={`btn btn-sm btn-light dropdown-toggle `}
                              type="button"
                              data-bs-toggle="dropdown"
                              aria-expanded="false"
                            >
                              Difficulty
                            </button>
                            <ul className="dropdown-menu filterMenu">
                              <li>
                                <span
                                  className="dropdown-item filterItem"
                                  onClick={() => {
                                    handleDifficulty("Easy");
                                  }}
                                >
                                  Easy
                                </span>
                              </li>
                              <li>
                                <span
                                  className="dropdown-item filterItem"
                                  onClick={() => {
                                    handleDifficulty("Medium");
                                  }}
                                >
                                  Medium
                                </span>
                              </li>
                              <li>
                                <span
                                  className="dropdown-item filterItem"
                                  onClick={() => {
                                    handleDifficulty("Hard");
                                  }}
                                >
                                  Hard
                                </span>
                              </li>
                              <li>
                                <span
                                  className="dropdown-item filterItem"
                                  onClick={() => {
                                    fetchQuestions1('All');
                                    settname("All");
                                  }}
                                >
                                  All
                                </span>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </h2>

                      <div className={styles.mainquiz}>
                        <div className={styles.contquiz}>
                          <div className={styles.contOne}>
                            <div className={styles.contts}><span> {categoryToggle ? `SNAPZ QB ${categoryToggle} NEC` : ""}</span></div>
                            {/* <div className={styles.contt}>Calc/Know: <span>{ singleQuestionCategory ? singleQuestionCategory : "All"}</span></div> */}
                          </div>
                          <div className={styles.contOne}>
                            <div className={`${styles.contt} selected-articles`}>Selected:
                              <span>{filterid?.name ? filterid?.name : ""}</span>
                            </div>
                            <div className={`${styles.contt} selected-diff`}>Difficulty: <span>{tname ? tname : "All"}</span></div>
                          </div>
                        </div>
                        <div className={styles.contSub}>
                          <span>Select Random ({selectableRandomQuestion ? selectableRandomQuestion : 0})</span>
                          <div className={styles.contBtn}>

                            <input
                              id="randombtn1"
                              className={styles.randomtext}
                              value={randomlimit}
                              type="number"
                              size="20"
                              placeholder="# Qsts"
                              onChange={(e) => {
                                const value =
                                  e.target.value === ""
                                    ? ""
                                    : Math.min(e.target.value, 100);
                                setrandomlimit(value);
                              }}
                            />
                            <button onClick={(e) => customrandomques(e)}>Select</button>
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

                  <div className={styles.sec2}>

                    <Test
                      liftup={liftup}
                      category14={category14}
                      category17={category17}
                      category20={category20}
                      category23={category23}
                      All={All}
                      setCategory14={setCategory14}
                      setCategory17={setCategory17}
                      setCategory20={setCategory20}
                      setCategory23={setCategory23}
                      setAll={setAll}
                      setInitial17={setInitial17}
                      setInitial20={setInitial20}
                      setInitial23={setInitial23}
                      style="bordered"
                    />

                    {/* {categoryToggle == "All" ? (
                      <>
                        {All ? (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                              duration: 0.7,
                              delay: 0.5,
                            }}
                          >
                            <ul className={styles.accordList}>
                              {All.map((item, index) => (
                                <li key={index}>
                                  <div
                                    className={`${
                                      filterid?.name == item.name
                                        ? styles.activeList
                                        : ""
                                    }`}
                                    onClick={() => {
                                      liftup(item.id, item.name);
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
                                  <div className="quesArea">
                                    {filterid.name == item.name
                                      ? questions?.map((question) => (
                                          <motion.div
                                            key={question.question_id}
                                            className="box"
                                            initial={{ opacity: 0, x: 100 }} // Starts with opacity 0 and shifted 100 pixels to the right
                                            animate={{ opacity: 1, x: 0 }} // Animates opacity to 1 and shifts back to 0
                                            transition={{
                                              duration: 0.7,
                                              delay: 0.5,
                                            }}
                                          >
                                            <div
                                              id={question.question_id}
                                              className={`${styles.quescont} ${
                                                SelectedQuestionIds.includes(
                                                  question.question_id
                                                )
                                                  ? styles.checked
                                                  : ""
                                              }`}
                                              key={question.question_id}
                                            >
                                              <label>
                                                <div className={styles.ques}>
                                                  <input
                                                    className={styles.checkbox}
                                                    type="checkbox"
                                                    name={
                                                      "question_" +
                                                      question.question_id
                                                    }
                                                    onChange={(event) =>
                                                      handleQuestionCheckboxChange(
                                                        event,
                                                        question.question_id
                                                      )
                                                    }
                                                  />
                                                  {`Question ${question.question_id}` +
                                                    " - " +
                                                    extractQuestionText(
                                                      question
                                                    )}
                                                </div>
                                              </label>
                                              {question.question_type ===
                                              "truefalse" ? (
                                                <div className={styles.answers}>
                                                  <label
                                                    className={styles.options}
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
                                                    className={styles.options}
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
                                                <div className={styles.answers}>
                                                  {question.answers.map(
                                                    (answer) => (
                                                      <div
                                                        key={answer.answer_id}
                                                        className={styles.mcq}
                                                      >
                                                        <label
                                                          className={
                                                            styles.options
                                                          }
                                                          key={answer.answer_id}
                                                        >
                                                          <input
                                                            type="radio"
                                                            name={`question_${question.question_id}`}
                                                            value={
                                                              question
                                                                .answers[0]
                                                                .answer
                                                            }
                                                            disabled
                                                          />
                                                          {extractOptionText(
                                                            answer.answer.slice(
                                                              3,
                                                              answer.answer
                                                                .length - 4
                                                            )
                                                          )}
                                                        </label>
                                                      </div>
                                                    )
                                                  )}
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
                    ) : null} */}

                    {/* {categoryToggle == "2014" ? (
                      <>
                        {category14 ? (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                              duration: 0.7,
                              delay: 0.5,
                            }}
                          >
                            <ul className={styles.accordList}>
                              {category14.map((item, index) => (
                                <li key={index}>
                                  <div
                                    className={`${
                                      filterid?.name == item.name
                                        ? styles.activeList
                                        : ""
                                    }`}
                                    onClick={() => {
                                      liftup(item.id, item.name);
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
                                  <div className="quesArea">
                                    {filterid.name == item.name
                                      ? questions?.map((question) => (
                                          <motion.div
                                            key={question.question_id}
                                            className="box"
                                            initial={{ opacity: 0, x: 100 }} // Starts with opacity 0 and shifted 100 pixels to the right
                                            animate={{ opacity: 1, x: 0 }} // Animates opacity to 1 and shifts back to 0
                                            transition={{
                                              duration: 0.7,
                                              delay: 0.5,
                                            }}
                                          >
                                            <div
                                              id={question.question_id}
                                              className={`${styles.quescont} ${
                                                SelectedQuestionIds.includes(
                                                  question.question_id
                                                )
                                                  ? styles.checked
                                                  : ""
                                              }`}
                                              key={question.question_id}
                                            >
                                              <label>
                                                <div className={styles.ques}>
                                                  <input
                                                    className={styles.checkbox}
                                                    type="checkbox"
                                                    name={
                                                      "question_" +
                                                      question.question_id
                                                    }
                                                    onChange={(event) =>
                                                      handleQuestionCheckboxChange(
                                                        event,
                                                        question.question_id
                                                      )
                                                    }
                                                  />
                                                  {`Question ${question.question_id}` +
                                                    " - " +
                                                    extractQuestionText(
                                                      question
                                                    )}
                                                </div>
                                              </label>
                                              {question.question_type ===
                                              "truefalse" ? (
                                                <div className={styles.answers}>
                                                  <label
                                                    className={styles.options}
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
                                                    className={styles.options}
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
                                                <div className={styles.answers}>
                                                  {question.answers.map(
                                                    (answer) => (
                                                      <div
                                                        key={answer.answer_id}
                                                        className={styles.mcq}
                                                      >
                                                        <label
                                                          className={
                                                            styles.options
                                                          }
                                                          key={answer.answer_id}
                                                        >
                                                          <input
                                                            type="radio"
                                                            name={`question_${question.question_id}`}
                                                            value={
                                                              question
                                                                .answers[0]
                                                                .answer
                                                            }
                                                            disabled
                                                          />
                                                          {extractOptionText(
                                                            answer.answer.slice(
                                                              3,
                                                              answer.answer
                                                                .length - 4
                                                            )
                                                          )}
                                                        </label>
                                                      </div>
                                                    )
                                                  )}
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
                    ) : null} */}

                    {categoryToggle == "-" ? (
                      <h3 className="sec1text">
                        This Question Bank displays a list of questions for you
                        to use in your quiz.Please start by selecting a category
                        from the <strong>'Categories'</strong> drop-down above.
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

                                    <li key={index} >

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
                                          }
`}
                                        onClick={() => {
                                          liftup(item.id, item.name);
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
                                      <div>
                                        {filterid.id == item.id
                                          ? questions?.map((question) => (
                                            <motion.div
                                              key={randomKey()}
                                              initial={{ opacity: 0, x: 100 }} // Starts with opacity 0 and shifted 100 pixels to the right
                                              animate={{ opacity: 1, x: 0 }} // Animates opacity to 1 and shifts back to 0
                                              transition={{
                                                duration: 0.7,
                                                delay: 0.5,
                                              }}
                                            >
                                              <div
                                                id={question.question_id}
                                                className={`${styles.quescont
                                                  } ${SelectedQuestionIds.includes(
                                                    question.question_id
                                                  )
                                                    ? styles.checked
                                                    : ""
                                                  }  `}
                                                key={randomKey()}
                                              >
                                                <label >
                                                  <div className={styles.ques}>
                                                    <input
                                                      className={
                                                        styles.checkbox
                                                      }
                                                      type="checkbox"
                                                      name={
                                                        "question_" +
                                                        question.question_id
                                                      }
                                                      checked={SelectedQuestionIds.includes(question.question_id) ? true : false}
                                                      onChange={(event) =>
                                                        handleQuestionCheckboxChange(
                                                          event,
                                                          question.question_id
                                                        )
                                                      }
                                                    />

                                                    Question-
                                                    {question.question_id}
                                                    &nbsp;
                                                    {question.questionName.slice(
                                                      0,
                                                      11
                                                    )}
                                                    {extractQuestionForAllCategory(
                                                      question.question_text
                                                    )}


                                                    {/* {extractQuestionText(
                                                        question
                                                      ) === ""
                                                        ? stripQues(
                                                            question.question_text
                                                          )
                                                        : `Question ${question.question_id} ` +
                                                          extractQuestionText(
                                                            question
                                                          )} */}

                                                  </div>

                                                </label>
                                                <div >
                                                  <div>
                                                    <p className="m-0 text-center" style={{ fontSize: '10px' }}><b>{categoryToggle}</b></p>

                                                    <p className="m-0 text-center" style={{ fontSize: '10px' }}><b>{item.name.includes("Calculations") && "Calc"} {item.name.includes("Knowledge") && "Know"}</b></p>

                                                    {/* <p className="m-0 text-center" style={{ fontSize: '10px' }}><b>{singleQuestionCategory ? singleQuestionCategory : 'All'}</b></p> */}
                                                    {/*<p className="m-0 text-center" style={{ fontSize: '10px' }}><b> {tname ? tname : 'All'}</b></p> */}
                                                    <p className="m-0 text-center" style={{ fontSize: '10px' }}><b>{question?.tagid ? generateTagName(question?.tagid) : '-'}</b></p>
                                                  </div>
                                                  <div className="mt-2 text-center">
                                                    <span onClick={() => previewQuestion(question)}>
                                                      <HiMiniMagnifyingGlass className="previewQusetion" onClick={handleShow} />
                                                    </span>
                                                  </div>


                                                </div>

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
                                                    {question.answers.map(
                                                      (answer) => (
                                                        <div
                                                          key={randomKey()}
                                                          className={
                                                            styles.mcq
                                                          }
                                                        >
                                                          <label
                                                            className={
                                                              styles.options
                                                            }
                                                            key={
                                                              answer.answer_id
                                                            }
                                                          >
                                                            <input
                                                              type="radio"
                                                              name={`question_${question.question_id}`}
                                                              value={
                                                                question
                                                                  .answers[0]
                                                                  .answer
                                                              }
                                                              disabled
                                                            />
                                                            {extractOptionText(
                                                              answer.answer.slice(
                                                                3,
                                                                answer.answer
                                                                  .length - 4
                                                              )
                                                            )}
                                                          </label>
                                                        </div>
                                                      )
                                                    )}
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
                                        onClick={() => {
                                          liftup(item.id, item?.name);
                                        }}
                                      >
                                        <VscDebugBreakpointLog
                                          className={styles.bullet}
                                        />
                                        <span className="categoryNameText">
                                          {item?.name}
                                        </span>
                                      </div>
                                      <div>

                                        {filterid.id == item.id
                                          ? questions?.map((question) => (
                                            <motion.div
                                              key={randomKey()}
                                              className="box"
                                              initial={{ opacity: 0, x: 100 }} // Starts with opacity 0 and shifted 100 pixels to the right
                                              animate={{ opacity: 1, x: 0 }} // Animates opacity to 1 and shifts back to 0
                                              transition={{
                                                duration: 0.7,
                                                delay: 0.5,
                                              }}
                                            >

                                              <div
                                                id={question.question_id}
                                                className={`${styles.quescont
                                                  } ${SelectedQuestionIds.includes(
                                                    question.question_id
                                                  )
                                                    ? styles.checked
                                                    : ""
                                                  } p-1`}
                                                key={randomKey()}
                                              >
                                                <label>
                                                  <div
                                                    className={styles.ques}
                                                  >
                                                    <input
                                                      className={
                                                        styles.checkbox
                                                      }
                                                      type="checkbox"
                                                      name={
                                                        "question_" +
                                                        question.question_id
                                                      }
                                                      checked={SelectedQuestionIds.includes(question.question_id) ? true : false}
                                                      onChange={(event) =>
                                                        handleQuestionCheckboxChange(
                                                          event,
                                                          question.question_id
                                                        )
                                                      }
                                                    />
                                                    Question-
                                                    {question.question_id}
                                                    &nbsp;
                                                    {question.questionName.slice(
                                                      0,
                                                      11
                                                    )}
                                                    {extractQuestionForAllCategory(
                                                      question.question_text
                                                    )}
                                                    {/* {extractQuestionText(
                                                        question
                                                      ) === ""
                                                        ? stripQues(
                                                            question.question_text
                                                          )
                                                        : `Question ${question.question_id} ` +
                                                          extractQuestionText(
                                                            question
                                                          )} */}
                                                    {/* <>
                                                  
                                                  </>
                                                  <>
                                                    {extractQuestionText(
                                                      question
                                                    ) === ""
                                                      ? console.log("blank")
                                                      : console.log(
                                                          "not blank"
                                                        )}
                                                  </> */}
                                                  </div>
                                                </label>
                                                <div >
                                                  <div>
                                                    <p className="m-0 text-center" style={{ fontSize: '10px' }}><b>{categoryToggle}</b></p>


                                                    <p className="m-0 text-center" style={{ fontSize: '10px' }}><b>{item.name.includes("Calculations") && "Calc"} {item.name.includes("Knowledge") && "Know"}</b></p>
                                                    {/* <p className="m-0 text-center" style={{ fontSize: '10px' }}><b>{singleQuestionCategory ? singleQuestionCategory : 'All'}</b></p> */}

                                                    {/* <p className="m-0 text-center" style={{ fontSize: '10px' }}><b>prev-{tname ? tname : 'All'}</b></p> */}
                                                    <p className="m-0 text-center" style={{ fontSize: '10px' }}><b>{question?.tagid ? generateTagName(question?.tagid) : '-'}</b></p>

                                                  </div>
                                                  <div className="mt-2 text-center">
                                                    <span onClick={() => previewQuestion(question)}>
                                                      <HiMiniMagnifyingGlass className="previewQusetion" onClick={handleShow} />
                                                    </span>
                                                  </div>


                                                </div>

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
                                                    {question.answers.map(
                                                      (answer) => (
                                                        <div
                                                          key={randomKey()}
                                                          className={
                                                            styles.mcq
                                                          }
                                                        >
                                                          <label
                                                            className={
                                                              styles.options
                                                            }
                                                            key={randomKey()}
                                                          >
                                                            <input
                                                              type="radio"
                                                              name={`question_${question.question_id}`}
                                                              value={
                                                                question
                                                                  .answers[0]
                                                                  .answer
                                                              }
                                                              disabled
                                                            />
                                                            {extractOptionText(
                                                              answer.answer.slice(
                                                                3,
                                                                answer.answer
                                                                  .length - 4
                                                              )
                                                            )}
                                                          </label>
                                                        </div>
                                                      )
                                                    )}
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
                                        onClick={() => {
                                          liftup(item.id, item.name);
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
                                      <div>
                                        {filterid.id == item.id
                                          ? questions?.map((question) => (
                                            <motion.div
                                              key={randomKey()}
                                              className="box"
                                              initial={{ opacity: 0, x: 100 }} // Starts with opacity 0 and shifted 100 pixels to the right
                                              animate={{ opacity: 1, x: 0 }} // Animates opacity to 1 and shifts back to 0
                                              transition={{
                                                duration: 0.7,
                                                delay: 0.5,
                                              }}
                                            >
                                              <div
                                                id={question.question_id}
                                                className={`${styles.quescont
                                                  } ${SelectedQuestionIds.includes(
                                                    question.question_id
                                                  )
                                                    ? styles.checked
                                                    : ""
                                                  }`}
                                                key={randomKey()}
                                              >
                                                <label>
                                                  <div
                                                    className={styles.ques}
                                                  >
                                                    <input
                                                      className={
                                                        styles.checkbox
                                                      }
                                                      type="checkbox"
                                                      name={
                                                        "question_" +
                                                        question.question_id
                                                      }
                                                      onChange={(event) =>
                                                        handleQuestionCheckboxChange(
                                                          event,
                                                          question.question_id
                                                        )
                                                      }
                                                    />
                                                    Question-
                                                    {question.question_id}
                                                    &nbsp;
                                                    {question.questionName.slice(
                                                      0,
                                                      11
                                                    )}
                                                    {extractQuestionForAllCategory(
                                                      question.question_text
                                                    )}
                                                    {/* {extractQuestionText(
                                                        question
                                                      ) === ""
                                                        ? stripQues(
                                                            question.question_text
                                                          )
                                                        : `Question ${question.question_id} ` +
                                                          extractQuestionText(
                                                            question
                                                          )} */}
                                                  </div>
                                                </label>

                                                <div >
                                                  <div>
                                                    <p className="m-0 text-center" style={{ fontSize: '10px' }}><b>{categoryToggle}</b></p>
                                                    <p className="m-0 text-center" style={{ fontSize: '10px' }}><b>{item.name.includes("Calculations") && "Calc"} {item.name.includes("Knowledge") && "Know"}</b></p>

                                                    {/* <p className="m-0 text-center" style={{ fontSize: '10px' }}><b>{singleQuestionCategory ? singleQuestionCategory : 'All'}</b></p> */}
                                                    {/* <p className="m-0 text-center" style={{ fontSize: '10px' }}><b>prev-{question?.tagid}</b></p> */}
                                                    <p className="m-0 text-center" style={{ fontSize: '10px' }}><b>{question?.tagid ? generateTagName(question?.tagid) : '-'}</b></p>
                                                  </div>
                                                  <div className="mt-2 text-center">
                                                    <span onClick={() => previewQuestion(question)}>
                                                      {/* <GrView className="previewQusetion" onClick={handleShow} /> */}
                                                      <HiMiniMagnifyingGlass className="previewQusetion" onClick={handleShow} />
                                                    </span>
                                                  </div>


                                                </div>

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
                                                    {question.answers.map(
                                                      (answer) => (
                                                        <div
                                                          key={randomKey()}
                                                          className={
                                                            styles.mcq
                                                          }
                                                        >
                                                          <label
                                                            className={
                                                              styles.options
                                                            }
                                                            key={
                                                              answer.answer_id
                                                            }
                                                          >
                                                            <input
                                                              type="radio"
                                                              name={`question_${question.question_id}`}
                                                              value={
                                                                question
                                                                  .answers[0]
                                                                  .answer
                                                              }
                                                              disabled
                                                            />
                                                            {extractOptionText(
                                                              answer.answer.slice(
                                                                3,
                                                                answer.answer
                                                                  .length - 4
                                                              )
                                                            )}
                                                          </label>
                                                        </div>
                                                      )
                                                    )}
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
                    {categoryToggle == "theory" ? <>Theory</> : null}
                  </div>
                </div>

                <div className={styles.halfsec2}>
                  <h2 className={styles.sec3head}>
                    {/* <span className={styles.quesprev}>Quiz</span> */}
                    <span className="buttonGrpQuesPrev">
                      <div className={styles.scramble_div} >
                        <span className={styles.quesprev}>Quiz</span>
                        <div>
                          <button className="btn btn-sm btn-light mx-2" onClick={scrambleList}><small>Randomize</small></button>
                          <button className="btn btn-sm btn-light" onClick={unscrambleList}><small>Reset</small></button>
                        </div>
                      </div>
                      <div className="quiz-functional-button">
                        <div
                          className=" btn btn btn-sm btn-light textWithIcons textWithIcons2"
                          onClick={() => handleOpenRedirect("Open")} >
                          <FaFolderOpen className={styles.sec3buttons} />
                          Open
                        </div>

                        <Tippy
                          content="Use this button to save the quiz for future use."
                          disabled={tip}>
                          <button
                            className="btn btn-sm btn-light textWithIcons"
                            onClick={openDialogBoxBeforeSave} >
                            <PiFloppyDiskBold className={styles.sec3buttons} />
                            Save
                          </button>
                        </Tippy>

                        <Tippy
                          content="Use this button to save the previous quiz with new name for future use."
                          disabled={tip}>
                          <button
                            className="btn btn-sm btn-light textWithIcons"
                            // onClick={openDialogBoxBeforeSave} >
                            onClick={openDialogBoxOnSaveAs} >
                            <PiFloppyDiskBold className={styles.sec3buttons} />
                            Save As
                          </button>
                        </Tippy>
                        <button
                          className="btn btn-sm btn-light textWithIcons"
                          // onClick={refreshPage}
                          onClick={() => handleOpenRedirect("New")}>
                          <BiSolidWindowAlt className={styles.sec3buttons} />
                          New
                        </button>

                        <div className="dropdown-center">
                          <button
                            className={`btn btn-light btn-sm  dropdown-toggle textWithIcons`}
                            type="button"
                            data-bs-toggle="dropdown"
                            aria-expanded="false">
                            <AiFillPrinter className={styles.sec3buttons} />
                            Print
                          </button>
                          <ul className="dropdown-menu filterMenu">
                            <li className="printDropdownli">
                              <span
                                id="printBtnDropdown"
                                onClick={handlePrintSelectedQuestions}
                              >
                                Print Quiz
                              </span>
                            </li>
                            <li className="printDropdownli">
                              <span
                                id="printBtnDropdown"
                                onClick={handlePrintSelectedAnswers}
                              >
                                Print Answers
                              </span>
                            </li>
                            <li className="printDropdownli">
                              <span
                                id="printBtnDropdown"
                                onClick={handlePrintSolutionSet}
                              >
                                Print Solutions
                              </span>
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
                          {/*<input
                            value={name}
                            id={styles.inptext1}
                            className={styles.inptext}
                            type="text"
                            placeholder="Quiz name"
                            onChange={(e) => {
                              setname(e.target.value);
                            }}
                          /> */}

                          <label className={styles.inptextone}>
                            Quiz Name : <span>{name}</span>
                            {/* <input 
                                value={name}
                                id={styles.inptext1}
                                type="text"
                                onChange={(e) => {
                                  setname(e.target.value);
                                }}
                                readOnly
                              /> */}
                             
                          </label>
                        </Tippy>

                        {/* <input
                        id={styles.inptext3}
                        className={styles.inptext}
                        type="date"
                        placeholder="Date"
                        onChange={(e) => {
                          setQuizStateDate(e.target.value);
                        }}
                        size="15"
                      /> */}

                        <label className={styles.inptexttwo}>
                          Date

                          <DatePicker
                            selected={quizStateDate}
                            id={styles.inptext3}
                            onChange={(date) => handleDateChange(date)}
                            dateFormat="MM-dd-yyyy"
                            placeholderText="MM-DD-YYYY"
                          />
                          {/* <DatePicker selected={quizStateDate} onChange={(date) => handleDateChange(date)} /> */}
                        </label>

                      </div>
                      <div className={styles.newquizdisc}>
                        <Tippy
                          content="Type the title of your quiz."
                          disabled={tip}
                        >
                          {/* <input
                          id={styles.inptext2}
                          value={title}
                          className={styles.inptext}
                          type="text"
                          placeholder="Description"
                          onChange={(e) => {
                            settitle(e.target.value);
                          }}
                        /> */}
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
                          Total Qsts : {selectedQuestions.length}
                        </span>
                      ) : (
                        <span className={styles.selectedQues}>
                          Total Qsts : 0
                        </span>
                      )}
                    </div>
                  </div>
                  <div className={styles.sec3}>


                    <div className={styles.sec3scroll}>
                      {selectedQuestions.length ? (
                        selectedQuestions?.map((selectedQuestion) => {
                          const question = selectedQuestion;

                          // Render the selected question directly
                          return (
                            <div
                              className={styles.selectedques}
                              key={randomKey()}
                            >
                              <span className={styles.previewques}>
                                Question-
                                {question.question_id}
                                {extractQuestionForAllCategory(
                                  question.question_text
                                )}
                                {/* {extractQuestionText(question) === ""
                                  ? stripQues(question.question_text)
                                  : `Question ${question.question_id} ` +
                                    extractQuestionText(question)} */}
                              </span>
                              {/* Render other details of the selected question */}
                              <div className="SelectedQuestionIcons">
                                <div className="CrossBtn" onClick={() => { deleteListItem(question.question_id) }}>
                                  <CgCloseR className="crossIcon" />
                                </div>
                                <div onClick={() => previewQuestion(question)}>
                                  <HiMiniMagnifyingGlass className=" mt-1 h5" onClick={handleShow} />
                                </div>

                              </div>

                            </div>
                          );
                        })
                      ) : (
                        <h3>
                          This is a preview of the quiz you will be creating.
                          Please type your quiz name ,description and date ,
                          select questions from categories and print them.
                        </h3>
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
