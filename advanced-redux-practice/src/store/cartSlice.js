import { createSlice } from '@reduxjs/toolkit';

import { uiActions } from './uiSlice';

const INITIAL_STATE = {
  items: [],
  totalPrice: 0,
  totalQuantity: 0
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
    }
  }
});

export const sendCartData = (cartData) => {
  return async (dispatch) => {
    dispatch(
      uiActions.showNotification({
        status: "pending",
        title: "Sending...",
        message: "Sending cart data!",
      }));
    
    const sendRequest = async () => {
      const response = await fetch(
        "https://advanced-redux-eefd3-default-rtdb.firebaseio.com/cart.json",
        {
          method: "PUT",
          body: JSON.stringify(cartData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to send cart data");
      }
    };

    try {
      await sendRequest();
      dispatch(
        uiActions.showNotification({
          status: "success",
          title: "Success !",
          message: "Cart data sent successfully !",
        })
      );
    } catch (error) {
      dispatch(
        uiActions.showNotification({
          status: "error",
          title: "Error !",
          message: "Failed to send cart data",
        })
      );
    } 
  };
};
