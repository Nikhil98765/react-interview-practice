import { useDispatch, useSelector } from 'react-redux';

import classes from './CartButton.module.css';
import { cartActions } from '../../store/cartSlice';

const CartButton = (props) => {
  const cartItems = useSelector(state => state.cart.items);
  const dispatch = useDispatch();

  return (
    <button className={classes.button} onClick={() => dispatch(cartActions.toggle())}>
      <span>My Cart</span>
      <span className={classes.badge}>{cartItems.length}</span>
    </button>
  );
};

export default CartButton;
