import { createSlice } from "@reduxjs/toolkit";

// `turns` (3.5, multi-turn refinement) replaces the old single
// movieNames/movieResults/reasons trio — each search (initial or
// follow-up) appends one turn instead of overwriting the last, so a
// failed or in-flight follow-up never wipes out prior results.
const gptSlice = createSlice({
  name: 'gpt',
  initialState: {
    turns: [], // [{ query, movieNames, movieResults, reasons }]
  },
  reducers:{
    addGptMovieResult: (state, action) => {
      const {query, movieNames, movieResults, reasons} = action.payload
      state.turns.push({ query, movieNames, movieResults, reasons })
    },
    clearGptConversation: (state) => {
      state.turns = []
    }
  }
})

export const {addGptMovieResult, clearGptConversation} = gptSlice.actions

export default gptSlice.reducer
