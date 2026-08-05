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
    // { [`${mediaType}_${mediaId}`]: releaseYear | null } — mirrors
    // `ratings`, powers the taste profile's decade distribution.
    ratedYears: {},
    // { [`${mediaType}_${mediaId}`]: true } — synced live from the
    // watchlist collection, same pattern as ratings.
    watchlist: {},
    isLoaded: false,
  },
  reducers: {
    setRatings: (state, action) => {
      const { ratings, ratedGenres, ratedYears } = action.payload
      state.ratings = ratings
      state.ratedGenres = ratedGenres
      state.ratedYears = ratedYears
      state.isLoaded = true
    },
    setWatchlist: (state, action) => {
      state.watchlist = action.payload
    },
    clearPreferences: (state) => {
      state.ratings = {}
      state.ratedGenres = {}
      state.ratedYears = {}
      state.watchlist = {}
      state.isLoaded = false
    },
  },
})

export const { setRatings, setWatchlist, clearPreferences } = preferencesSlice.actions

export default preferencesSlice.reducer
