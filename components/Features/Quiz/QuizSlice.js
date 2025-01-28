import { createSlice } from "@reduxjs/toolkit";

const questionsSlice = createSlice({
  name: "questions",
  initialState: [],
  reducers: {
    addQuestion: (state, action) => {
      state.push(action.payload);
    },
    resetState: (state) => {
      return [];
    },
  },
});

export const { addQuestion, resetState } = questionsSlice.actions;
export default questionsSlice.reducer;
