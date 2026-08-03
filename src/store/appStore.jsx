import { configureStore } from '@reduxjs/toolkit'
import configReducer from './configSlice'
import detailsReducer from './detailsSlice'
import gptReducer from "./gptSlice"
import moviesReducer from "./moviesSlice"
import preferencesReducer from './preferencesSlice'
import tvReducer from "./tvSlice"
import userReducer from './userSlice'

const appStore = configureStore({
  reducer: {
    user: userReducer,
    movies: moviesReducer,
    tv: tvReducer,
    details: detailsReducer,
    preferences: preferencesReducer,
    gpt: gptReducer,
    config: configReducer
  },
})

export default appStore
