const redux = require('redux');

const reducer = (state = { counter: 0 }, action) => {
  if (action.type === 'INCREMENT') {
    return {
      counter: state.counter + 1,
    };
  }
  if (action.type === 'DECREMENT') {
    return {
      counter: state.counter - 1,
    };
  }
  return state;
  
}

const store = redux.createStore(reducer);
console.log("🚀 ~ store.getState():", store.getState())

const listener = () => {
  const counterValue = store.getState();
  console.log("🚀 ~ listener ~ counterValue:", counterValue);
}

store.subscribe(listener);
store.dispatch({ type: 'INCREMENT' });
store.dispatch({ type: 'DECREMENT' });
store.dispatch({ type: 'INCREMENT' });