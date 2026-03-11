import { createContext, useState, type PropsWithChildren } from "react";

interface User {
  id: number;
  name: string;
  email: string;
}


interface AuthContext {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContext | null>(null);

export const AuthContextProvider = (props: PropsWithChildren) => {
  const [user, setUser] = useState<User | null>(null);

  function login(user: User) { }
  
  function logout() {}

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {props.children}
    </AuthContext.Provider>
  )
}