import { createSlice } from '@reduxjs/toolkit'

const emptyEntry = () => ({
  movieNames: null,
  mediaTypes: null,
  movieResults: null,
  reasons: null,
  fetchedAt: null,
  profileSignature: null,
})

// Cache for the no-query "For You" recommendations (3.3), one independent
// entry per category (Movies/TV Shows/Anime) so each row can be
// personalized from its own slice of rating history and refetch on its
// own schedule — separate from gptSlice (query-driven search results) so
// navigating away from /home and back doesn't lose either one.
const forYouSlice = createSlice({
  name: 'forYou',
  initialState: {
    movie: emptyEntry(),
    tv: emptyEntry(),
    anime: emptyEntry(),
  },
  reducers: {
    setForYouResult: (state, action) => {
      const { category, movieNames, mediaTypes, movieResults, reasons, fetchedAt, profileSignature } =
        action.payload
      state[category] = { movieNames, mediaTypes, movieResults, reasons, fetchedAt, profileSignature }
    },
  },
})

export const { setForYouResult } = forYouSlice.actions

export default forYouSlice.reducer
