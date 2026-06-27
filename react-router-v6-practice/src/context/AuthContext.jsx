import { createContext, useContext, useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router";


const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {

  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoading(false);
  }, []);
  
  async function login(username, password) {
    setIsLoading(true);
    const response = await fetch("https://dummyjson.com/auth/login", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username, password
      }),
      credentials: 'include'
    });

    const { accessToken } = await response.json();
    setIsLoading(false);
    setUser({
      username,
      password,
      accessToken
    });
  }

  function logout() {
    setUser(null);
    navigate('/login', {replace: true})
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
}