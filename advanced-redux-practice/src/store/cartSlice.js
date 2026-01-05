import { createSlice } from '@reduxjs/toolkit';

import { uiActions } from './uiSlice';

const INITIAL_STATE = {
  items: [],
  totalQuantity: 0,
  changed: false
};

export const { reducer: cartReducer, actions: cartActions } = createSlice({
  name: 'cart',
  initialState: INITIAL_STATE,
  reducers: {
    addItem: (state, action) => {
      state.changed = true;
      const fetchedItem = state.items.filter(item => item.title === action.payload.title)[0];
      if (fetchedItem?.quantity > 0) { 
        fetchedItem.quantity++;
        fetchedItem.totalPrice += action.payload.price;
      } else {
        state.items.push({...action.payload, quantity: 1, totalPrice: action.payload.price});
      }
      state.totalQuantity += 1;
    },
    deleteItem: (state, action) => {
      state.changed = true;
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
        fetchedItem.totalPrice -= fetchedItem.price;
      } else {
        state.items.splice(itemIndex, 1);
      }
      state.totalQuantity -= 1;
      state.totalPrice -= action.payload.price;
    },
    replaceCart: (state, action) => {
      const { items, totalQuantity } = action.payload;
      return {
        items: items || [],
        totalQuantity
      };
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
          body: JSON.stringify({items: cartData.items, totalQuantity: cartData.totalQuantity}),
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

export const fetchCartData = () => {
  return async (dispatch) => {
    dispatch(
      uiActions.showNotification({
        status: "pending",
        title: "Fetching...",
        message: "Fetching cart data!",
      }));
    const fetchRequest = async () => {
      const response = await fetch(
        "https://advanced-redux-eefd3-default-rtdb.firebaseio.com/cart.json"
      );
      if (!response.ok) {
        throw new Error("Failed to fetch cart data");
      }
      const data = response.json();
      return data;
    };

    try {
      const data = await fetchRequest();
      dispatch(cartActions.replaceCart(data));
      dispatch(
        uiActions.showNotification({
          status: "success",
          title: "Success !",
          message: "Cart data fetched successfully !",
        })
      );
    } catch (error) {
      dispatch(
        uiActions.showNotification({
          status: "error",
          title: "Error !",
          message: "Failed to fetch cart data",
        })
      );
    }
  };
};
