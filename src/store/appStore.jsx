import { configureStore } from '@reduxjs/toolkit'
import configReducer from './configSlice'
import detailsReducer from './detailsSlice'
import forYouReducer from './forYouSlice'
import gptReducer from "./gptSlice"
import moviesReducer from "./moviesSlice"
import preferencesReducer from './preferencesSlice'
import userReducer from './userSlice'

const appStore = configureStore({
  reducer: {
    user: userReducer,
    movies: moviesReducer,
    details: detailsReducer,
    preferences: preferencesReducer,
    gpt: gptReducer,
    forYou: forYouReducer,
    config: configReducer
  },
})

export default appStore
