import { createSlice } from '@reduxjs/toolkit';

const INITIAL_STATE = {
  items: [],
  totalPrice: 0,
  totalQuantity: 0,
  show: false
};

export const { reducer: cartReducer, actions: cartActions } = createSlice({
  name: 'cart',
  initialState: INITIAL_STATE,
  reducers: {
    addItem: (state, action) => {
      const fetchedItem = state.items.filter(item => item.title === action.payload.title)[0];
      if (fetchedItem?.quantity > 0) { 
        fetchedItem.quantity++;
      } else {
        state.items.push({...action.payload, quantity: 1});
      }
      state.totalQuantity += 1;
      state.totalPrice += action.payload.price;
    },
    deleteItem: (state, action) => {
      let itemIndex;
      const fetchedItem = state.items.filter(
        (item, index) => {
          if (item.title === action.payload.title) {
            itemIndex = index;
            return true;
          } 
          return false;
        }
      )[0];
      if (fetchedItem.quantity > 1) {
        fetchedItem.quantity--;
      } else {
        state.items.splice(itemIndex, 1);
      }
      state.totalQuantity -= 1;
      state.totalPrice -= action.payload.price;
    },
    toggle: (state) => {
      state.show = !state.show;
    }
  }
});
