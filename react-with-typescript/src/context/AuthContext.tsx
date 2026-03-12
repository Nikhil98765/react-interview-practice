import { createContext, useReducer, useState, type PropsWithChildren } from "react";

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

interface State {
  count: number;
  name: string;
}

type Action = { type: 'INCREMENT' } | { type: 'DECREMENT' } | { type: 'RESET', payload: number } | { type: 'SET_NAME', payload: string };


function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'INCREMENT':
      return { ...state, count: state.count + 1 };
    case 'DECREMENT':
      return { ...state, count: state.count - 1 };
    case 'RESET':
      return { ...state, count: action.payload };
    case 'SET_NAME':
      return { ...state, name: action.payload };
  }
}

const AuthContext = createContext<AuthContext | null>(null);

export const AuthContextProvider = (props: PropsWithChildren) => {
  const [user, setUser] = useState<User | null>(null);
  const [state, dispatch] = useReducer(reducer, { count: 0, name: '' });

  function login(user: User) { 
    dispatch({ type: 'RESET', payload: user.name });
  }
  
  function logout() {}

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {props.children}
    </AuthContext.Provider>
  )
}