import { createSlice } from '@reduxjs/toolkit'

// Cache for the no-query "For You" recommendations (3.3) — separate from
// gptSlice (query-driven search results) so navigating away from /home and
// back doesn't lose either one. fetchedAt + profileSignature let
// useForYouRecommendations decide whether to refetch instead of hitting
// the proxy on every mount.
const forYouSlice = createSlice({
  name: 'forYou',
  initialState: {
    movieNames: null,
    movieResults: null,
    reasons: null,
    fetchedAt: null,
    profileSignature: null,
  },
  reducers: {
    setForYouResult: (state, action) => {
      const { movieNames, movieResults, reasons, fetchedAt, profileSignature } = action.payload
      state.movieNames = movieNames
      state.movieResults = movieResults
      state.reasons = reasons
      state.fetchedAt = fetchedAt
      state.profileSignature = profileSignature
    },
  },
})

export const { setForYouResult } = forYouSlice.actions

export default forYouSlice.reducer
