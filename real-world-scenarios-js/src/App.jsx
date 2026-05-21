import { useEffect, useState } from 'react';
import { Route, Routes } from "react-router-dom";

import './App.css';
import './utils/debouncing-throttling';
import { InfiniteScrolling } from './components/InfiniteScrolling';
import { FileUpload } from './components/FileUpload';
import { MultiFileUpload } from './components/MultiFileUpload';
import { UploadProgress } from './components/UploadProgress';
import { Chat } from './components/Chat';
import { ChatUsingHook } from './components/ChatUsingHook';
import { Login } from './components/Login';
import { UnAuthorizedPage } from './components/UnAuthorizedPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Dashboard } from './components/Dashboard';
import { Profile } from './components/Profile';
import { RoleRoute } from './components/RoleRoute';
import { AdminPanel } from './components/AdminPanel';
import { ModerationPage } from './components/ModerationPage';

function App() {

  const [query, setQuery] = useState('');
  // const [debouncedQuery, setDebouncedQuery] = useState('');

  // TODO: can be delegated to a custom hook
  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     setDebouncedQuery(query);
  //   }, 2000);
  //   return () => clearTimeout(timer);
  // }, [query]);

  // useEffect(() => {
  //   // Fetch the query based on the debounced query
  //   console.log("🚀 ~ App ~ debouncedQuery:", debouncedQuery)
    
  // }, [debouncedQuery]);


  return (
    // <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} />
    // <InfiniteScrolling />
    // <FileUpload />
    // <MultiFileUpload />
    // <UploadProgress />
    // <Chat></Chat>
    // <ChatUsingHook />
    <Routes>
      <Route path="/login" element={<Login />}></Route>
      <Route path="/unauthorized" element={<UnAuthorizedPage />}></Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />}></Route>
        <Route path="/profile" element={<Profile />}></Route>

        <Route element={<RoleRoute allowedRoles={["admin"]} />}>
          <Route path="/admin" element={<AdminPanel />}></Route>
        </Route>

        <Route element={<RoleRoute allowedRoles={["admin", "moderator"]} />}>
          <Route path="/moderator" element={<ModerationPage />}></Route>
        </Route>
      </Route>
    </Routes>
  );
}

export default App
