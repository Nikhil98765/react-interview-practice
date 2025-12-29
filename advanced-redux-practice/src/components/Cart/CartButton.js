import { useDispatch, useSelector } from 'react-redux';

import classes from './CartButton.module.css';
import { cartActions } from '../../store/cartSlice';

const CartButton = (props) => {
  const totalQuantity = useSelector(state => state.cart.totalQuantity);
  const dispatch = useDispatch();

  return (
    <button className={classes.button} onClick={() => dispatch(cartActions.toggle())}>
      <span>My Cart</span>
      <span className={classes.badge}>{totalQuantity}</span>
    </button>
  );
};

export default CartButton;
