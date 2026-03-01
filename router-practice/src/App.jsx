import { BrowserRouter, createBrowserRouter, Route, RouterProvider, Routes } from "react-router-dom"
import { About } from "./components/About"
import { UserProfile } from "./components/UserProfile"
import { NotFound } from "./components/NotFound"
import { Home } from './components/Home';
import { DashboardLayout } from "./components/DashboardLayout";
import { Dashboard, loader as dashboardLoader} from "./components/Dashboard";
import { Settings } from "./components/Settings";
import { Profile } from "./components/Profile";
import { Error } from "./components/Error";
import { ProductDetails, loader as productDetailsLoader } from "./components/ProductDetails";
import { Products } from "./components/Products";
import { UserForm, action as userFormAction } from "./components/UserForm";
import { action as newsLetterAction } from './components/Newsletter';
import Layout from "./components/Layout";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      { path: "/about", element: <About /> },
      {
        path: "/dashboard",
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <Dashboard />,
            id: "dashboardData",
            errorElement: <Error />,
            loader: dashboardLoader,
          },
          {
            path: "settings",
            element: <Settings />,
          },
          {
            path: "profile",
            element: <Profile />,
          },
        ],
      },
      {
        path: "/products",
        id: "productsPage",
        element: <Products />,
      },
      {
        path: "/products/:productId",
        element: <ProductDetails />,
        loader: productDetailsLoader,
      },
      {
        path: "/form",
        element: <UserForm />,
        action: userFormAction,
        errorElement: <Error />,
      },
      {
        path: "/newsletter",
        action: newsLetterAction,
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
]);

function App() {

  return (
    <RouterProvider router={router}/>
  );
}

export default App
