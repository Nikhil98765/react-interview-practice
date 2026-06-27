import { useRef } from "react"
import { useAuth } from "../context/AuthContext";
import { Navigate, useLocation } from "react-router";


export const LoginPage = () => {
  const usernameRef = useRef(null);
  const passwordRef = useRef(null);
  const { login, user, isLoading } = useAuth();
  const location = useLocation();
  const previousPath = location.state?.from.pathname || '/dashboard';

  function handleSubmit(e) {
    e.preventDefault();
    login(usernameRef.current.value, passwordRef.current.value);
  }

   if (user) {
     return <Navigate to={previousPath} replace />;
   }

  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="username">Username: </label>
        <input id="username" type="text" placeholder="Enter username..." ref={usernameRef}/>
      </div>
      <div>
        <label htmlFor="password">Password: </label>
        <input id="password" type="password" placeholder="Enter Password..." ref={passwordRef} />
      </div>
      <button>Submit</button>
    </form>
  )
}
