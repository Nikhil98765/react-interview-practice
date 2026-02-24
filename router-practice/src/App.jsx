import { BrowserRouter, createBrowserRouter, Route, RouterProvider, Routes } from "react-router-dom"
import { About } from "./components/About"
import { UserProfile } from "./components/UserProfile"
import { NotFound } from "./components/NotFound"
import { Home } from './components/Home';
import { DashboardLayout } from "./components/DashboardLayout";
import { Dashboard } from "./components/Dashboard";
import { Settings } from "./components/Settings";
import { Profile } from "./components/Profile";
import { Error } from "./components/Error";
import { ProductDetails } from "./components/ProductDetails";
import { Products } from "./components/Products";

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
    errorElement: <Error />,
  },
  { path: '/about', element: <About /> },
  {
    path: '/dashboard', element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <Dashboard />
      },
      {
        path: 'settings',
        element: <Settings />
      },
      {
        path: 'profile',
        element: <Profile />
      }
    ]
  },
  {
    path: '/products', element: <Products />
  },
  {
    path: '/products/:productId', element: <ProductDetails />
  },
  {
    path: '*',
    element: <NotFound />
  }
]);

function App() {

  return (
    <RouterProvider router={router}/>
  );
}

export default App
