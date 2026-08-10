import { createSlice } from '@reduxjs/toolkit'

const detailsSlice = createSlice({
  name: 'details',
  initialState: {
    mediaDetails: {},   // key `${mediaType}_${id}` -> details object
    credits: {},        // key -> credits object
    similar: {},        // key -> results array
    watchProviders: {}, // key -> providers object
    genres: {},          // mediaType -> genres array
    trailerVideo: {},   // key -> trailer video object
  },
  reducers: {
    addMediaDetails: (state, action) => {
      const { key, data } = action.payload
      state.mediaDetails[key] = data
    },
    addTrailerVideo: (state, action) => {
      const { key, data } = action.payload
      state.trailerVideo[key] = data
    },
    addCredits: (state, action) => {
      const { key, data } = action.payload
      state.credits[key] = data
    },
    addSimilar: (state, action) => {
      const { key, data } = action.payload
      state.similar[key] = data
    },
    addWatchProviders: (state, action) => {
      const { key, data } = action.payload
      state.watchProviders[key] = data
    },
    addGenres: (state, action) => {
      const { mediaType, data } = action.payload
      state.genres[mediaType] = data
    },
  },
})

export const {
  addMediaDetails,
  addTrailerVideo,
  addCredits,
  addSimilar,
  addWatchProviders,
  addGenres,
} = detailsSlice.actions

export default detailsSlice.reducer
