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
  }
]);

function App() {

  return (
    // <BrowserRouter>
    //   <Routes>
    //     <Route path="/" element={<Home />} errorElement={<Error />}></Route>
    //     <Route path="/about" element={<About />}></Route>
    //     <Route path="/users/:id" element={<UserProfile />}></Route>
    //     <Route path="/dashboard" element={<DashboardLayout />}>
    //       <Route index element={<Dashboard />} />
    //       <Route path="settings" element={<Settings />} />
    //       <Route path="profile" element={<Profile />} />
    //     </Route>
    //     {/* <Route path="*" element={<NotFound />}></Route> */}
    //   </Routes>
    //   <Routes>
    //     <Route path="/about1" element={<About />}></Route>
    //   </Routes>
    // </BrowserRouter>

    <RouterProvider router={router}/>
  );
}

export default App
