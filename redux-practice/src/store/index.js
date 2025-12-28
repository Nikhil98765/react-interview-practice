import { configureStore, createSlice } from '@reduxjs/toolkit';

const INITIAL_STATE = {
  value: 0,
  show: true
}

export const { reducer: counterReducer, actions: counterActions } = createSlice({
  name: 'counter',
  initialState: INITIAL_STATE,
  reducers: {
    increment: (state) => {
      state.value++;
    },
    decrement: (state) => {
      state.value--;
    },
    increase: (state, action) => {
      state.value = state.value + action.payload.increaseValue
    },
    toggle: (state) => {
      state.show = !state.show;
    }
  }
});

export const store = configureStore({
  reducer: {counter: counterReducer}
})