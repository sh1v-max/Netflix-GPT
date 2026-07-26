import { createSlice } from '@reduxjs/toolkit'

const tvSlice = createSlice({
  name: 'tv',
  initialState: {
    trailerVideo: null,
    onTheAirShows: null,
    popularShows: null,
    topRatedShows: null,
    airingTodayShows: null,
  },
  reducers: {
    addTvTrailerVideo: (state, action) => {
      state.trailerVideo = action.payload
    },
    addOnTheAirShows: (state, action) => {
      state.onTheAirShows = action.payload
    },
    addPopularShows: (state, action) => {
      state.popularShows = action.payload
    },
    addTopRatedShows: (state, action) => {
      state.topRatedShows = action.payload
    },
    addAiringTodayShows: (state, action) => {
      state.airingTodayShows = action.payload
    },
  },
})

export const {
  addTvTrailerVideo,
  addOnTheAirShows,
  addPopularShows,
  addTopRatedShows,
  addAiringTodayShows,
} = tvSlice.actions

export default tvSlice.reducer
