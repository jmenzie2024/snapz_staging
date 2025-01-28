import { configureStore } from "@reduxjs/toolkit";
import questionsReducer from "./Features/Quiz/QuizSlice";

const store = configureStore({
  reducer: {
    questions: questionsReducer,
  },
});

export default store;
