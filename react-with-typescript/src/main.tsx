import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(
  document.getElementById('root')!,
  // {
  //   // common hook for whole app to caught errors
  //   onCaughtError: (error, info) => { // errors caught by error boundary
  //     console.log("🚀 ~ onCaughtError ~ info:", info);
  //     console.log("🚀 ~ onCaughtError ~ error:", error);
  //   },
  //   onUncaughtError: (error, info) => { // errors which were not caught by error boundary
  //     console.log("🚀 ~ onUncaughtError ~ info:", info);
  //     console.log("🚀 ~ onUncaughtError ~ error:", error);
  //   }
  // }
).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
