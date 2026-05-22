import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const refreshToken = sessionStorage.getItem('refreshToken');
        const res = await axios.post("https://dummyjson.com/auth/refresh", {
          expiresInMins: 30,
          refreshToken
        }, {
          withCredentials: true
        });
        setAccessToken(res.data.accessToken);

        const userRes = await axios.get("https://dummyjson.com/auth/me", {
          headers: { Authorization: `Bearer ${res.data.accessToken}` },
          withCredentials: true,
        });
        setUser({
          id: userRes.data.id,
          username: userRes.data.username,
          email: userRes.data.email,
          image: userRes.data.image,
        });
      } catch (error) {
        setAccessToken(null);
        setUser(null);
        sessionStorage.removeItem('refreshToken');
      } finally {
        setLoading(false);
       }
    }
    restoreSession();
  }, [])

  const login = async (username, password) => {
    const res = await axios.post("https://dummyjson.com/auth/login", {
      username,
      password,
      expiresInMins: 30
    }, {withCredentials: true});

    sessionStorage.setItem('refreshToken', res.data.refreshToken);
    setAccessToken(res.data.accessToken);
    setUser({
      id: res.data.id,
      username: res.data.username,
      email: res.data.email,
      image: res.data.image
    });
    return res.data;
  };

  const logout = async () => {
    setUser(null);
    setAccessToken(null);
  }

  return (
    <AuthContext.Provider value={{user, accessToken, setAccessToken, login, logout, loading}}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
}