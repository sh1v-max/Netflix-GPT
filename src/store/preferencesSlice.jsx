import { createSlice } from '@reduxjs/toolkit'

const preferencesSlice = createSlice({
  name: 'preferences',
  initialState: {
    // { [`${mediaType}_${mediaId}`]: 'like' | 'dislike' } — kept in sync
    // live via onSnapshot in usePreferencesSync, never written to directly
    // from a component.
    ratings: {},
    // { [`${mediaType}_${mediaId}`]: genreIds[] } — mirrors `ratings`,
    // synced from the same snapshot. Lets the detail page compute a taste
    // compatibility read without a separate query.
    ratedGenres: {},
    isLoaded: false,
  },
  reducers: {
    setRatings: (state, action) => {
      const { ratings, ratedGenres } = action.payload
      state.ratings = ratings
      state.ratedGenres = ratedGenres
      state.isLoaded = true
    },
    clearPreferences: (state) => {
      state.ratings = {}
      state.ratedGenres = {}
      state.isLoaded = false
    },
  },
})

export const { setRatings, clearPreferences } = preferencesSlice.actions

export default preferencesSlice.reducer
