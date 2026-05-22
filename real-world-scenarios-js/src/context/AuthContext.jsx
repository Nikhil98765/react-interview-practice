import { createContext, useContext, useState } from "react";
import axios from "axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);

  const login = async (username, password) => {
    const res = await axios.post("https://dummyjson.com/auth/login", {
      username,
      password,
      expiresInMins: 30
    }, {withCredentials: true});

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
    <AuthContext.Provider value={{user, accessToken, setAccessToken, login, logout}}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
}