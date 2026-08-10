import { createSlice } from '@reduxjs/toolkit'

const moviesSlice = createSlice({
  name: 'movies',
  initialState: {
    popularMovies: null,
  },
  reducers: {
    addPopularMovies: (state, action) => {
      state.popularMovies = action.payload
    },
  },
})

export const { addPopularMovies } = moviesSlice.actions

export default moviesSlice.reducer
