import { BrowserRouter, Route, Routes } from "react-router-dom"
import { About } from "./components/About"
import { UserProfile } from "./components/UserProfile"
import { NotFound } from "./components/NotFound"
import { Home } from './components/Home';
import { DashboardLayout } from "./components/DashboardLayout";
import { Dashboard } from "./components/Dashboard";
import { Settings } from "./components/Settings";
import { Profile } from "./components/Profile";

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route path="/about" element={<About />}></Route>
        <Route path="/users/:id" element={<UserProfile />}></Route>
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path='settings' element={<Settings />} />
          <Route path="profile" element={<Profile />} />
        </Route>
        <Route path="*" element={<NotFound />}></Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
