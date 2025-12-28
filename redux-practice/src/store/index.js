import { createStore } from 'redux';

export const ACTIONS = {
  INCREMENT: "INCREMENT",
  DECREMENT: "DECREMENT",
};

const reducer = (state = {counter: 0}, action) => {
  if (action.type === ACTIONS.INCREMENT) {
    return {
      counter: state.counter + 1,
    };
  }
  if (action.type === ACTIONS.DECREMENT) {
    return {
      counter: state.counter - 1,
    };
  }

  return state;
}

export const store = createStore(reducer);