import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from "react-router-dom";

import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx';
import { AxiosProvider } from './context/AxiosContext.jsx';
import { reportWebVitals } from './reportWebVitals.js';

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider>
      <AxiosProvider>
        <App />
      </AxiosProvider>
    </AuthProvider>
  </BrowserRouter>,
  // <StrictMode>
  //   <App />
  // </StrictMode>,
);

reportWebVitals((metric) => {
  console.log("🚀", metric)
})