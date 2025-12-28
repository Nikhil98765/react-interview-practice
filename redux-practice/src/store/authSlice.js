import { createSlice } from "@reduxjs/toolkit";

const INITIAL_STATE = {
  isAuthenticated: false
}

export const { reducer: authReducer, actions: AuthActions } = createSlice({
  name: 'auth',
  initialState: INITIAL_STATE,
  reducers: {
    login: (state) => {
      return {
        ...state,
        isAuthenticated: true
      }
    },
    logout : (state) => {
      return {
        ...state,
        isAuthenticated: false
      }
    }
  }
})