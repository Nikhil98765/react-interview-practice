import { createContext, useReducer, useState } from "react";
import { DUMMY_PRODUCTS } from "../dummy-products";

export const CartContext = createContext({
  items: [],
  onAddToCart: () => {},
  onUpdateItemQuantity: () => {},
});

const shoppingCartReducer = (state, action) => {
  const { type, payload } = action;

  switch (type) {
    case 'ADD_ITEM': {
      const id = payload.id;
      const updatedItems = [...state.items];

      const existingCartItemIndex = updatedItems.findIndex(
        cartItem => cartItem.id === id
      );
      const existingCartItem = updatedItems[existingCartItemIndex];

      if (existingCartItem) {
        const updatedItem = {
          ...existingCartItem,
          quantity: existingCartItem.quantity + 1,
        };
        updatedItems[existingCartItemIndex] = updatedItem;
      } else {
        const product = DUMMY_PRODUCTS.find(product => product.id === id);
        updatedItems.push({
          id: id,
          name: product.title,
          price: product.price,
          quantity: 1,
        });
      }
      return {
        ...state,
        items: updatedItems
      }
    }
    case 'UPDATE_ITEM_QUANTITY': {
      const { productId, amount } = payload;
      const updatedItems = [...state.items];
      const updatedItemIndex = updatedItems.findIndex(
        item => item.id === productId
      );

      const updatedItem = {
        ...updatedItems[updatedItemIndex],
      };

      updatedItem.quantity += amount;

      if (updatedItem.quantity <= 0) {
        updatedItems.splice(updatedItemIndex, 1);
      } else {
        updatedItems[updatedItemIndex] = updatedItem;
      }

      return {
        ...state,
        items: updatedItems,
      };
    }
  }

}


export const CartContextProvider = ({ children }) => {
  const [shoppingCart, shoppingCartDispatch] = useReducer(shoppingCartReducer, {
    items: []
  })

  const ctxValue = {
    items: shoppingCart.items,
    onAddToCart: id => shoppingCartDispatch({ type: "ADD_ITEM" , payload: {id}}),
    onUpdateItemQuantity: (productId, amount) => shoppingCartDispatch({ type: "UPDATE_ITEM_QUANTITY", payload: { productId, amount } }),
  };

  return (
    <CartContext.Provider value={ctxValue}>
      {children}
    </CartContext.Provider>
  )
}
