import { createSlice } from "@reduxjs/toolkit";

const configSlice = createSlice({
  name: "config",
  initialState: {
    lang: "en",
  },
  reducers: {
    changeLanguages: (state, actions) => {
      state.lang = actions.payload;
    }
  }
})

export const {changeLanguages} = configSlice.actions
export default configSlice.reducer; 