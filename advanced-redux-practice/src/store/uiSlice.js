import { createSlice } from "@reduxjs/toolkit";

export const { reducer: uiReducer, actions: uiActions } = createSlice({
  name: 'ui',
  initialState: {
    notification: null,
    showCart: false
  },
  reducers: {
    showNotification: (state, action) => {
      state.notification = {
        ...action.payload
      };
    },
    showCart: (state) => {
      state.showCart = !state.showCart;
    }
  }
});