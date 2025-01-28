// export function stripQues(string) {
//   const strippedString = string.replace(/(<([^>]+)>)/gi, " ");
//   return strippedString;
// }
export function stripQues(string) {
  const strippedString = string.replace(/(<([^>]+)>)/gi, " ");
  const stringWithoutNewlines = strippedString.replace(/[\r\n]+/g, " ");
  console.log("STRIPPED STRING ==>", stringWithoutNewlines);
  return stringWithoutNewlines;
}

export function splitIntoArray(stringWithoutNewlines) {
  const splitString = stringWithoutNewlines.split(/[.?!]+/);
  const cleanArray = splitString.filter((segment) => segment.trim() !== "");
  console.log("SPLIT STRING ==>", cleanArray);

  return cleanArray.filter((element) => element.includes("QID"));
}

export function extractQIDfromString(string) {
  const match = string.match(/QID[:]*\s*[0-9-]*/);
  console.log(
    "SEPERATED ARRAY",
    match ? match[0].replace("QID: ", "").replace("QID", "") : null
  );
}

// function to extract question text original before the modification in regexWithId
// function extractQuestionText(question) {
//   const regexWithId = /<p id="qst">(.*?)<\/p>/;
//   const regexWithoutId = /<p(?![^>]*\bid\b)(?![^>]*\bclass\b)[^>]*>(.*?)<\/p>/;
//   const regexAlternative = /<p\b[^>]*>(.*?)<\/p>/; // Updated pattern
//   const regexHtmlTags = /<[^>]+>/g; // Regex pattern to match HTML tags
//   const regexStrongTag = /<\/?strong>/g; // Regex pattern to match <strong> tags

//   const matchWithId = question.question_text.match(regexWithId);
//   const matchWithoutId = question.question_text.match(regexWithoutId);
//   const matchAlternative = question.question_text.match(regexAlternative);

//   if (matchWithId) {
//     return matchWithId[1]
//       .replace(regexHtmlTags, "")
//       .replace(regexStrongTag, ""); // Remove HTML tags and <strong> tags
//   } else if (matchWithoutId) {
//     return matchWithoutId[1]
//       .replace(regexHtmlTags, "")
//       .replace(regexStrongTag, ""); // Remove HTML tags and <strong> tags
//   } else if (matchAlternative) {
//     return matchAlternative[1]
//       .replace(regexHtmlTags, "")
//       .replace(regexStrongTag, ""); // Remove HTML tags and <strong> tags
//   } else {
//     return "";
//   }
// }

export async function getCategory() {
  const user = localStorage.getItem("user");
  const token = localStorage.getItem("token");

  try {
    const data = await fetch( process.env.API_URL+`api/getCategoryByUsername?user=${user}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const resp = await data.json();

    
    return resp;
  } catch (err) {
    console.log(err);
  }
}
export async function postCategory(category) {
  const user = localStorage.getItem("user");
  const categoryData = { username: user, category: category };
  const token = localStorage.getItem("token");

  try {
    const data = await fetch(
       process.env.API_URL+"api/saveCategory",
      {
        credentials: "include",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(categoryData),
      }
    );
    const result = await data.json();
  } catch (err) {
    console.log(err);
  }
}

//function to check if user have saved quiz or not
export async function checkQuizData() {
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
        return false;
      } else {
        return true;
      }
    }
  } catch (error) {
    console.log("catch block MyQuiz.js", error);
  }
}

//function to extract questions from 2020 category

// export function extractQuestionForAllCategory(question) {
//   const regexHtmlTags = /<[^>]+>/g; // Regex pattern to match HTML tags
//   const regexStrongTag = /<\/?strong>/g; // Regex pattern to match <strong> tags
//   const regexSpecialSpaces =
//     /&#8202;|&#8198;|&#8239;|&#8201;|&#8197;|&#160;|&#8200;|&#8196;|&#8194;|&#8199;|&#8195;/g;
//   const strippedString = question.replace(/(<([^>]+)>)/gi, " ");
//   const stringWithoutNewlines = strippedString.replace(/[\r\n]+/g, " ");

//   let simpleString = stringWithoutNewlines
//     .replace(regexStrongTag, "")
//     .replace(regexSpecialSpaces, "")
//     .replace(/\s+/g, " ")
//     .trim()
//     .replace("Question Use this ID when reporting a problem.", "")
//     .replace(
//       /Question Question ID: (\d+-\d+) Use this ID when reporting a problem Close/,
//       "$1"
//     );
//   if (simpleString.includes("QID")) {
//     return simpleString;
//   } else {
//     simpleString = "QID " + simpleString;
//     return simpleString;
//   }
// }

export function extractQuestionForAllCategory(question) {
  const regexHtmlTags = /<[^>]+>/g; // Regex pattern to match HTML tags
  const regexStrongTag = /<\/?strong>/g; // Regex pattern to match <strong> tags
  const regexSpecialSpaces = /&nbsp;|&#160;/g;

  const strippedString = question.replace(/(<([^>]+)>)/gi, " ");
  const stringWithoutNewlines = strippedString.replace(/[\r\n]+/g, " ");

  let simpleString = stringWithoutNewlines
    .replace(regexStrongTag, "")
    .replace(regexSpecialSpaces, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(
      /Question Use this ID when reporting a problem\. QID: \d+-\d+/g,
      ""
    )
    .replace(
      /Question Question ID: \d+-\d+ Use this ID when reporting a problem Close/g,
      ""
    )
    .replace(/Question Use this ID when reporting a problem\. QID:\d+-\d+/g, "")
    .replace(/QID\d+-\d+/g, "")
    .replace(/Question Use this ID when reporting a problem\./, "")
    .replace(/QID: \d{2}--\d{5}/, "")
    .replace(/QID: \d{2} -\d{5}/, "");
  if (simpleString.includes("Question")) {
    // simpleString.replace("Question", "");
    return simpleString;
  } else {
    return simpleString;
  }

  console.log("simpleString", simpleString);
}

// export function removeDuplicates(questionsArray) {
//   const uniqueQuestions = [];
//   const seenQuestionTexts = new Set();

//   questionsArray.forEach((item) => {
//     // Check if the question_text has been seen before
//     if (!seenQuestionTexts.has(item.question_text)) {
//       // If not, add it to the uniqueQuestions array and the set
//       uniqueQuestions.push(item);
//       seenQuestionTexts.add(item.question_text);
//     }
//   });

//   return uniqueQuestions;
// }

//function to remove duplicates version 2
// export function removeDuplicates(questionsArray) {
//   const uniqueQuestions = [];
//   const seenQuestionTexts = new Set();

//   questionsArray.forEach((item) => {
//     // Remove spaces and other white spaces from the question_text
//     const extractedQues = extractQuestionForAllCategory(item.question_text);
//     const cleanedQuestionText = extractedQues.replace(/\s+/g, "");

//     // Check if the cleaned question_text has been seen before
//     if (!seenQuestionTexts.has(cleanedQuestionText)) {
//       // If not, add it to the uniqueQuestions array and the set
//       uniqueQuestions.push(item);
//       seenQuestionTexts.add(cleanedQuestionText);
//     }
//   });
//   console.log("set", seenQuestionTexts);
//   console.log("quesarr", uniqueQuestions);

//   return uniqueQuestions;
// }

//function to remove duplicates and keep highest primary key item
// export function removeDuplicates(questionsArray) {
//   const uniqueQuestions = [];
//   const seenQuestionTexts = new Set();

//   questionsArray.forEach((item) => {
//     const extractedQues = extractQuestionForAllCategory(item.question_text);
//     const cleanedQuestionText = extractedQues.replace(/\s+/g, "");

//     if (!seenQuestionTexts.has(cleanedQuestionText)) {
//       uniqueQuestions.push(item);
//       seenQuestionTexts.add(cleanedQuestionText);
//     } else {
//       // Check if the current question has a larger question_id than the one in uniqueQuestions
//       const existingQuestion = uniqueQuestions.find(
//         (q) =>
//           extractQuestionForAllCategory(q.question_text).replace(/\s+/g, "") ===
//           cleanedQuestionText
//       );

//       if (existingQuestion && item.question_id > existingQuestion.question_id) {
//         // Replace the existing question with the one having a larger question_id
//         const index = uniqueQuestions.indexOf(existingQuestion);
//         uniqueQuestions.splice(index, 1, item);
//       }
//     }
//   });

//   console.log("set", seenQuestionTexts);
//   console.log("quesarr", uniqueQuestions);

//   return uniqueQuestions;
// }
// export function removeDuplicates(questionsArray) {
//   const uniqueQuestions = [];
//   const seenQuestionTexts = new Set();

//   questionsArray.forEach((item) => {
//     const extractedQues = item.questionName;
//     const cleanedQuestionText = extractedQues.replace(/\s+/g, "");

//     if (!seenQuestionTexts.has(cleanedQuestionText)) {
//       uniqueQuestions.push(item);
//       seenQuestionTexts.add(cleanedQuestionText);
//     } else {
//       // Check if the current question has a larger question_id than the one in uniqueQuestions
//       const existingQuestion = uniqueQuestions.find(
//         (q) =>
//           extractQuestionForAllCategory(q.questionName).replace(/\s+/g, "") ===
//           cleanedQuestionText
//       );

//       if (existingQuestion && item.question_id > existingQuestion.question_id) {
//         // Replace the existing question with the one having a larger question_id
//         const index = uniqueQuestions.indexOf(existingQuestion);
//         uniqueQuestions.splice(index, 1, item);
//       }
//     }
//   });

//   console.log("set", seenQuestionTexts);
//   console.log("quesarr", uniqueQuestions);

//   return uniqueQuestions;
// }

export function randomKey (){
  var maxNumber = 999999999;
  var randomNumber = Math.floor(Math.random() * maxNumber + 1);
 return randomNumber;
}

export function removeDuplicates(questionsArray) {
  const uniqueQuestions = [];
  const seenQuestionTexts = new Set();

  questionsArray.forEach((item) => {
    const extractedQues = item.questionName;
    console.log("quesName", extractedQues);
    const cleanedQuestionText = extractedQues.replace(/\s+/g, "");
    const firstEleven = cleanedQuestionText.slice(0, 11);

    if (!seenQuestionTexts.has(firstEleven)) {
      uniqueQuestions.push(item);
      seenQuestionTexts.add(firstEleven);
    } else {
      // Check if the current question has a larger question_id than the one in uniqueQuestions
      const existingQuestion = uniqueQuestions.find(
        (q) => q.questionName.replace(/\s+/g, "") === cleanedQuestionText
      );

      if (existingQuestion && item.question_id > existingQuestion.question_id) {
        // Replace the existing question with the one having a larger question_id
        const index = uniqueQuestions.indexOf(existingQuestion);
        uniqueQuestions.splice(index, 1, item);
      }
    }
  });

  // Remove duplicates based on question_text
  let seenQuestionTexts2 = new Set();
  let uniqueQuestions2 = uniqueQuestions.filter((obj) => {
    let questionText = extractQuestionForAllCategory(obj.question_text)
      .replace(/\s+/g, "")
      .toLowerCase();

    console.log("quesText", questionText);
    if (!seenQuestionTexts2.has(questionText)) {
      seenQuestionTexts2.add(questionText);
      return true; // Keep the element
    }
    return false; // Discard the element
  });

  // console.log("questionArray2", uniqueQuestions2);

  return uniqueQuestions2;
}

// export function cullquestions(questionsArray) {
//   const uniqueQuestions = [];
//   const seenQuestionTexts = new Set();

//   const newArray = questionsArray.filter((item) => {
//     const extractedQues = item.questionName;
//     const cleanedQuestionText = extractedQues.replace(/\s+/g, "");
//     const firstfourteen = cleanedQuestionText.slice(0, 14);
//     return !firstfourteen.includes("^D^");
//   });

//   newArray.forEach((item) => {
//     const extractedQues = item.questionName;
//     const cleanedQuestionText = extractedQues.replace(/\s+/g, "");
//     const firstEleven = cleanedQuestionText.slice(0, 11);

//     if (!seenQuestionTexts.has(firstEleven)) {
//       uniqueQuestions.push(item);
//       seenQuestionTexts.add(firstEleven);
//     } else {
//       // Check if the current question has a larger question_id than the one in uniqueQuestions
//       const existingQuestion = uniqueQuestions.find(
//         (q) => q.questionName.replace(/\s+/g, "") === cleanedQuestionText
//       );

//       if (existingQuestion && item.question_id > existingQuestion.question_id) {
//         // Replace the existing question with the one having a larger question_id
//         const index = uniqueQuestions.indexOf(existingQuestion);
//         uniqueQuestions.splice(index, 1, item);
//       }
//     }
//   });

//   // Remove duplicates based on question_text
//   let seenQuestionTexts2 = new Set();
//   let uniqueQuestions2 = uniqueQuestions.filter((obj) => {
//     let questionText = extractQuestionForAllCategory(obj.question_text)
//       .replace(/\s+/g, "")
//       .toLowerCase();

//     console.log("quesText", questionText);
//     if (!seenQuestionTexts2.has(questionText)) {
//       seenQuestionTexts2.add(questionText);
//       return true; // Keep the element
//     }
//     return false; // Discard the element
//   });

//   console.log("questionArray2", uniqueQuestions2);

//   return uniqueQuestions2;
// }

// export function cullquestions(questionsArray) {
//   const uniqueQuestions = [];
//   const seenQuestionTexts = new Set();

//   const newArray = questionsArray.filter((item) => {
//     const extractedQues = item.questionName;
//     const cleanedQuestionText = extractedQues.replace(/\s+/g, "");
//     const firstfourteen = cleanedQuestionText.slice(0, 11);
//     return !firstfourteen.includes("XX");
//   });

//   newArray.forEach((item) => {
//     const extractedQues = item.questionName;
//     const cleanedQuestionText = extractedQues.replace(/\s+/g, "");
//     const firstEleven = cleanedQuestionText.slice(0, 11);

//     if (!seenQuestionTexts.has(firstEleven)) {
//       uniqueQuestions.push(item);
//       seenQuestionTexts.add(firstEleven);
//     } else {
//       // Check if the current question has a larger question_id than the one in uniqueQuestions
//       const existingQuestion = uniqueQuestions.find(
//         (q) => q.questionName.replace(/\s+/g, "") === cleanedQuestionText
//       );

//       if (existingQuestion && item.question_id > existingQuestion.question_id) {
//         // Replace the existing question with the one having a larger question_id
//         const index = uniqueQuestions.indexOf(existingQuestion);
//         uniqueQuestions.splice(index, 1, item);
//       }
//     }
//   });

//   // Remove duplicates based on question_text
//   let seenQuestionTexts2 = new Set();
//   let uniqueQuestions2 = uniqueQuestions.filter((obj) => {
//     let questionText = extractQuestionForAllCategory(obj.question_text)
//       .replace(/\s+/g, "")
//       .toLowerCase();

//     // console.log("quesText", questionText);
//     if (!seenQuestionTexts2.has(questionText)) {
//       seenQuestionTexts2.add(questionText);
//       return true; // Keep the element
//     }
//     return false; // Discard the element
//   });

//   const uniqueQuestions3 = uniqueQuestions2.filter((item) => {
//     const extractedQues2 = item.questionName;
//     const cleanedQuestionText2 = extractedQues2.replace(/\s+/g, "");
//     const firstfourteen2 = cleanedQuestionText2.slice(0, 14);
//     return !firstfourteen2.includes("^D^");
//   });

//   const primary = uniqueQuestions3.map((item) => {
//     return {
//       primary_key: item.question_id,
//       QID: item.questionName.slice(0, 11),
//     };
//   });
//   console.log("primary", primary);
//   console.log("filtered array", uniqueQuestions3);

//   return uniqueQuestions3;
// }
export function cullquestions(questionsArray) {
  const uniqueQuestions = [];
  const seenQuestionTexts = new Set();

  const newArray = questionsArray.filter((item) => {
    const extractedQues = item.questionName;
    const cleanedQuestionText = extractedQues.replace(/\s+/g, "");
    const firstfourteen = cleanedQuestionText.slice(0, 11);
    return !firstfourteen.includes("XX");
  });

  newArray.forEach((item) => {
    const extractedQues = item.questionName;
    const cleanedQuestionText = extractedQues.replace(/\s+/g, "");
    const firstEleven = cleanedQuestionText.slice(0, 11);

    if (!seenQuestionTexts.has(firstEleven)) {
      uniqueQuestions.push(item);
      seenQuestionTexts.add(firstEleven);
    } else {
      // Check if the current question has a larger question_id than the one in uniqueQuestions
      const existingQuestion = uniqueQuestions.find(
        (q) => q.questionName.replace(/\s+/g, "") === cleanedQuestionText
      );

      if (existingQuestion && item.question_id > existingQuestion.question_id) {
        // Replace the existing question with the one having a larger question_id
        const index = uniqueQuestions.indexOf(existingQuestion);
        uniqueQuestions.splice(index, 1, item);
      }
    }
  });

  // Remove duplicates based on question_text
  // let seenQuestionTexts2 = new Set();
  // let uniqueQuestions2 = uniqueQuestions.filter((obj) => {
  //   let questionText = extractQuestionForAllCategory(obj.question_text)
  //     .replace(/\s+/g, "")
  //     .toLowerCase();

  //   // console.log("quesText", questionText);
  //   if (!seenQuestionTexts2.has(questionText)) {
  //     seenQuestionTexts2.add(questionText);
  //     return true; // Keep the element
  //   }
  //   return false; // Discard the element
  // });

  const uniqueQuestions3 = uniqueQuestions.filter((item) => {
    const extractedQues2 = item.questionName;
    const cleanedQuestionText2 = extractedQues2.replace(/\s+/g, "");
    const firstfourteen2 = cleanedQuestionText2.slice(0, 14);
    return !firstfourteen2.includes("^D^");
  });

  let seenQuestionTexts2 = new Set();
  let uniqueQuestions2 = uniqueQuestions3.filter((obj) => {
    let questionText = extractQuestionForAllCategory(obj.question_text)
      .replace(/\s+/g, "")
      .toLowerCase();

    // console.log("quesText", questionText);
    if (!seenQuestionTexts2.has(questionText)) {
      seenQuestionTexts2.add(questionText);
      return true; // Keep the element
    }
    return false; // Discard the element
  });

  const primary = uniqueQuestions2.map((item) => {
    return {
      primary_key: item.question_id,
      QID: item.questionName.slice(0, 11),
    };
  });


  return uniqueQuestions2;
}


export function capitalizeFirstLetterOFWordFromString(str) {
  return str?.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

export function toLowerCase(str) {
  return [...str].map(char => char.toLowerCase()).join('');
}

export function removeDuplicatesFromArrayOfObjectByObjKey(array) {
  const uniqueArray = array.reduce((acc, current) => {
    const x = acc.find(item => item.answer_id === current.answer_id);
    if (!x) {
      return acc.concat([current]);
    } else {
      return acc;
    }
  }, []);
  return uniqueArray;
}

export function isValidYYmmddFormat(dateString) {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;

  const date = new Date(dateString);
  return date.toISOString().slice(0, 10) === dateString;
}

