import { createContext, useContext } from 'react';

import { useAxiosPrivate } from '../hooks/useAxiosPrivate';

const AxiosContext = createContext(null);

export const AxiosProvider = ({ children }) => {
  const axiosPrivate = useAxiosPrivate();

  return (
    <AxiosContext.Provider value={axiosPrivate}>
      {children}
    </AxiosContext.Provider>
  );
};

export const useAxios = () => useContext(AxiosContext);
