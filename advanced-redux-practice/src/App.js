import { useDispatch, useSelector } from 'react-redux';
import Cart from './components/Cart/Cart';
import Layout from './components/Layout/Layout';
import Products from './components/Shop/Products';
import { useEffect } from 'react';
import { Notification } from './components/UI/Notification';
import { fetchCartData, sendCartData } from './store/cartSlice';

let initialRender = true;

function App() {
  const dispatch = useDispatch();

  const showCart = useSelector(state => state.ui.showCart);
  const cartState = useSelector(state => state.cart);
  const notification = useSelector(state => state.ui.notification);
  const isStateChanged = useSelector(state => state.cart.changed);

  useEffect(() => {
    dispatch(fetchCartData());
  }, []);

  useEffect(() => {
    if (initialRender) {
      initialRender = false;
      return;
    }

    if (isStateChanged) {
      dispatch(sendCartData(cartState)); 
    }

  }, [cartState, dispatch, isStateChanged]);

  return (
    <>
      {notification && <Notification {...notification} />}
      <Layout>
        {showCart && <Cart />}
        <Products />
      </Layout>
    </>
  );
}

export default App;
