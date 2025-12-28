import { connect, useDispatch, useSelector } from 'react-redux';
import classes from './Counter.module.css';
import { ACTIONS } from '../store';
import { Component } from 'react';

// const Counter = () => {
//   const counterValue = useSelector(state => state.counter);
//   const dispatch = useDispatch();

//   const toggleCounterHandler = () => { };
//   const incrementCounterHandler = () => {
//     dispatch({type: ACTIONS.INCREMENT})
//   }
//   const decrementCounterHandler = () => {
//     dispatch({ type: ACTIONS.DECREMENT });
//   };

//   return (
//     <main className={classes.counter}>
//       <h1>Redux Counter</h1>
//       <div className={classes.value}>{counterValue}</div>
//       <div className='flex'>
//         <button onClick={incrementCounterHandler}>Increment</button>
//         <button onClick={decrementCounterHandler}>Decrement</button>
//       </div>
//       {/* <button onClick={toggleCounterHandler}>Toggle Counter</button> */}
//     </main>
//   );
// };

class Counter extends Component {

  // incrementCounterHandler() {
  //   this.props.increment();
  // }

  // decrementCounterHandler() {
  //   this.props.decrement();
  // }

  render() {
    return (
      <main className={classes.counter}>
        <h1>Redux Counter</h1>
        <div className={classes.value}>{this.props.counter}</div>
        <div className='flex'>
          <button onClick={this.props.increment}>Increment</button>
          <button onClick={this.props.decrement}>Decrement</button>
        </div>
        {/* <button onClick={toggleCounterHandler}>Toggle Counter</button> */}
      </main>
    );
  }
}

const mapStateToProps = (state, componentProps) => {
  return {
    counter: state.counter
  }
}

const mapDispatchToProps = (dispatch, componentProps) => {
  return {
    increment: () => dispatch({ type: ACTIONS.INCREMENT }),
    decrement: () => dispatch({type: ACTIONS.DECREMENT})
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Counter);
