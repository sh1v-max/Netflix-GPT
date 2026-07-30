import { createSlice } from "@reduxjs/toolkit";

const gptSlice = createSlice({
  name: 'gpt',
  initialState: {
    // Search-first landing: Cinegraph opens on AI search, not a carousel wall
    showGptSearch: true,
    movieNames: null,
    movieResults: null,
  },
  reducers:{
    toggleGptSearchView: (state) =>{
      state.showGptSearch = !state.showGptSearch
    },
    setShowGptSearch: (state, action) => {
      state.showGptSearch = action.payload
    },
    addGptMovieResult: (state, action) => {
      const {movieNames, movieResults} = action.payload
      state.movieNames = movieNames
      state.movieResults = movieResults
    }
  }
})

export const {toggleGptSearchView, setShowGptSearch, addGptMovieResult} = gptSlice.actions

export default gptSlice.reducer