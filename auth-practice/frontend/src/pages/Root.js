import { Outlet, useNavigation } from 'react-router-dom';

import MainNavigation from '../components/MainNavigation';
import { getToken } from '../utils/auth';

function RootLayout() {
  // const navigation = useNavigation();

  return (
    <>
      <MainNavigation />
      <main>
        {/* {navigation.state === 'loading' && <p>Loading...</p>} */}
        <Outlet />
      </main>
    </>
  );
}

export const loader = () => {
  return getToken();
}

export default RootLayout;
