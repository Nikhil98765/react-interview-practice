import { createStore } from 'redux';

export const ACTIONS = {
  INCREMENT: "INCREMENT",
  DECREMENT: "DECREMENT",
  INCREASE: "INCREASE",
  TOGGLE: "TOGGLE",
};

const INITIAL_STATE = {
  counter: 0,
  showCounter: true
}

const reducer = (state = INITIAL_STATE, action) => {
  if (action.type === ACTIONS.INCREMENT) {
    return {
      ...state,
      counter: state.counter + 1,
    };
  }
  if (action.type === ACTIONS.DECREMENT) {
    return {
      ...state,
      counter: state.counter - 1,
    };
  }
  if (action.type === ACTIONS.INCREASE) {
    return {
      ...state,
      counter: state.counter + action.payload.increaseValue,
    };
  }
  if (action.type === ACTIONS.TOGGLE) {
    return {
      ...state,
      showCounter: !state.showCounter 
    }
  }

  return state;
};

export const store = createStore(reducer);