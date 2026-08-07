import { createSlice } from '@reduxjs/toolkit'

const tvSlice = createSlice({
  name: 'tv',
  initialState: {
    trailerVideo: null,
  },
  reducers: {
    addTvTrailerVideo: (state, action) => {
      state.trailerVideo = action.payload
    },
  },
})

export const { addTvTrailerVideo } = tvSlice.actions

export default tvSlice.reducer
