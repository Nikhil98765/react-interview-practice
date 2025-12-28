import { createStore } from 'redux';

export const ACTIONS = {
  INCREMENT: "INCREMENT",
  DECREMENT: "DECREMENT",
  INCREASE: "INCREASE",
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
  if (action.type === ACTIONS.INCREASE) {
    return {
      counter: state.counter + action.payload.increaseValue
    }
  }

  return state;
}

export const store = createStore(reducer);