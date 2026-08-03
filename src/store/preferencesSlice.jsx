import { createSlice } from '@reduxjs/toolkit'

const preferencesSlice = createSlice({
  name: 'preferences',
  initialState: {
    // { [`${mediaType}_${mediaId}`]: 'like' | 'dislike' } — kept in sync
    // live via onSnapshot in usePreferencesSync, never written to directly
    // from a component.
    ratings: {},
    isLoaded: false,
  },
  reducers: {
    setRatings: (state, action) => {
      state.ratings = action.payload
      state.isLoaded = true
    },
    clearPreferences: (state) => {
      state.ratings = {}
      state.isLoaded = false
    },
  },
})

export const { setRatings, clearPreferences } = preferencesSlice.actions

export default preferencesSlice.reducer
