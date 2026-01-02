import { useDispatch, useSelector } from 'react-redux';
import Cart from './components/Cart/Cart';
import Layout from './components/Layout/Layout';
import Products from './components/Shop/Products';
import { useEffect } from 'react';
import { Notification } from './components/UI/Notification';
import { uiActions } from './store/uiSlice';

let initialRender = true;

function App() {
  const dispatch = useDispatch();

  const showCart = useSelector(state => state.cart.show);
  const cartState = useSelector(state => state.cart);
  const notification = useSelector(state => state.ui.notification);

  useEffect(() => {
    const sendCartData = async () => {
      dispatch(
        uiActions.showNotification({
          status: "pending",
          title: "Sending...",
          message: "Sending cart data!",
        })
      );
      const response = await fetch("https://advanced-redux-eefd3-default-rtdb.firebaseio.com/cart.json", {
        method: "PUT",
        body: JSON.stringify(cartState),
      });

      if (!response.ok) {
        throw new Error('Failed to send cart data');
      }

      dispatch(uiActions.showNotification({
        status: 'success',
        title: 'Success !',
        message: 'Cart data sent successfully !'
      }));

    };

    if (initialRender) {
      initialRender = false;
      return;
    }

    sendCartData().catch(() => {
      dispatch(
        uiActions.showNotification({
          status: "error",
          title: "Error !",
          message: "Failed to send cart data",
        })
      );
    });

  }, [cartState, dispatch]);

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
