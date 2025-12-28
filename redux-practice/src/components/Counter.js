import { useDispatch, useSelector } from 'react-redux';
import classes from './Counter.module.css';
import { ACTIONS } from '../store';

const Counter = () => {
  const counterValue = useSelector(state => state.counter);
  const dispatch = useDispatch();

  const toggleCounterHandler = () => { };
  const incrementCounterHandler = () => {
    dispatch({type: ACTIONS.INCREMENT})
  }
  const decrementCounterHandler = () => {
    dispatch({ type: ACTIONS.DECREMENT });
  };

  return (
    <main className={classes.counter}>
      <h1>Redux Counter</h1>
      <div className={classes.value}>{counterValue}</div>
      <div className='flex'>
        <button onClick={incrementCounterHandler}>Increment</button>
        <button onClick={decrementCounterHandler}>Decrement</button>
      </div>
      {/* <button onClick={toggleCounterHandler}>Toggle Counter</button> */}
    </main>
  );
};

export default Counter;
