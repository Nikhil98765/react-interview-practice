import { useEffect, useState } from 'react';
import { Route, Routes } from "react-router-dom";
import { ErrorBoundary } from 'react-error-boundary';

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
import { Dashboard } from './components/Dashboard/Dashboard';
import { Profile } from './components/Profile';
import { RoleRoute } from './components/RoleRoute';
import { AdminPanel } from './components/AdminPanel';
import { ModerationPage } from './components/ModerationPage';
import { ErrorFallback } from './components/ErrorFallback';
import { PortalsPage } from './components/PortalsPage';
// import { ErrorBoundary } from './components/ErrorBoundary';

function App() {

  const [query, setQuery] = useState('');
  const apiUrl = import.meta.env.VITE_API_URL
  console.log("🚀 ~ App ~ apiUrl:", apiUrl);
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
      <Route path='/portal-page' element={<PortalsPage />}></Route>

      <Route element={<ProtectedRoute />}>
        <Route
          path="/dashboard"
          element={
            <ErrorBoundary
              // fallback={
              //   <p>Boom! You just triggered a error from dashboard component</p>
              // }
              FallbackComponent={ErrorFallback}
              onError={(error, info) => {
                console.error(`❌ Error: ${error}`);
                console.error(`❌ Info:`, info.componentStack);
              }}
              onReset={(details) => {
                console.log("🚀 ~ App ~ details:", details)
                // Reset app state
              }}
            >
              <Dashboard />
            </ErrorBoundary>
          }
        ></Route>
        <Route
          path="/profile"
          element={
            <ErrorBoundary
              fallback={
                <p>Boom! You just triggered a error from profile component</p>
              }
            >
              <Profile />
            </ErrorBoundary>
          }
        ></Route>

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
