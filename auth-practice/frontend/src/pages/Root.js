import { Outlet, useLoaderData, useNavigation, useSubmit } from 'react-router-dom';

import MainNavigation from '../components/MainNavigation';
import { getDuration, getToken } from '../utils/auth';
import { useEffect } from 'react';

function RootLayout() {
  // const navigation = useNavigation();
  const token = useLoaderData();
  const submit = useSubmit();


  useEffect(() => {
    if (!token) {
      return;
    }

    if (token === "EXPIRED") {
      submit(null, { action: "/logout", method: "POST" });
      return;
    }

    const duration = getDuration();
    console.log("🚀 ~ RootLayout ~ duration:", duration)
    setTimeout(() => {
      submit(null, { action: "/logout", method: "POST" });
    }, duration);
  }, [token, submit]);

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
