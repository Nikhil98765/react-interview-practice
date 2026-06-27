import { Routes, Route } from 'react-router';

import './App.css'
import { HomePage } from './components/HomePage';
import { LoginPage } from './components/LoginPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ProfilePage } from './components/ProfilePage';
import { DashboardPage } from './components/DashboardPage';
import { SettingsPage } from './components/SettingsPage';

function App() {

  return (
    <Routes>
      <Route path='/' element={<HomePage />} />
      <Route path='/login' element={ <LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path='/profile' element={<ProfilePage />} />
        <Route path='/dashboard' element={<DashboardPage />} />
        <Route path='/settings' element={<SettingsPage />} />
      </Route>

    </Routes>
  )
}

export default App
