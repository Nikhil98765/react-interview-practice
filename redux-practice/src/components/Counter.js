import { useDispatch, useSelector } from 'react-redux';
import classes from './Counter.module.css';
import { counterActions } from '../store';

const Counter = () => {
  const counterValue = useSelector(state => state.counter.value);
  const showCounter = useSelector(state => state.counter.show);
  const dispatch = useDispatch();

  const toggleCounterHandler = () => { 
    dispatch(counterActions.toggle())
   };
  const incrementCounterHandler = () => {
    dispatch(counterActions.increment())
  }
  const decrementCounterHandler = () => {
    dispatch(counterActions.decrement());
  };

  const increaseCounterHandler = (value) => {
    dispatch(counterActions.increase({increaseValue: value}));
  }

  return (
    <main className={classes.counter}>
      <h1>Redux Counter</h1>
      {showCounter && <div className={classes.value}>{counterValue}</div>}
      <div className='flex'>
        <button onClick={incrementCounterHandler}>Increment</button>
        <button onClick={() => increaseCounterHandler(5)}>Increase by 5</button>
        <button onClick={decrementCounterHandler}>Decrement</button>
      </div>
      <button onClick={toggleCounterHandler}>Toggle Counter</button>
    </main>
  );
};

export default Counter;
