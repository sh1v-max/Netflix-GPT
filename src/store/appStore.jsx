import { configureStore } from '@reduxjs/toolkit'
import configReducer from './configSlice'
import gptReducer from "./gptSlice"
import moviesReducer from "./moviesSlice"
import tvReducer from "./tvSlice"
import userReducer from './userSlice'

const appStore = configureStore({
  reducer: {
    user: userReducer,
    movies: moviesReducer,
    tv: tvReducer,
    gpt: gptReducer,
    config: configReducer
  },
})

export default appStore
