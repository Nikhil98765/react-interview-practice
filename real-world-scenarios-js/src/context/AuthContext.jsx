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

    if (!res.ok) throw new Error("Invalid Credentials!");

    const data = await res.json();
    setAccessToken(data["access_token"]);
    setUser({ username, password, roles: ["admin"] });
    return data;
  };

  const logout = async () => {
    await fetch('', { method: 'POST' });
    setUser(null);
    setAccessToken(null);
  }

  return (
    <AuthContext.Provider value={{user, accessToken, login, logout}}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
}