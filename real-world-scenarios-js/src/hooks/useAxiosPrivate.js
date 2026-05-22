import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useRefreshToken } from "./useRefreshToken";
import axiosPrivate from "../api/axios";

export const useAxiosPrivate = () => {
  const { accessToken } = useAuth();
  const refresh = useRefreshToken();

  useEffect(() => {
    const requestInterceptorId = axiosPrivate.interceptors.request.use(config => {
      if (!config.headers['Authorization']) {
        config.headers['Authorization'] = `Bearer ${accessToken}`;
      }
      return config;
    },
      err => Promise.reject(err)
    );

    const responseInterceptorId = axiosPrivate.interceptors.response.use(res => res,
      async (err) => {  
        const previousRequest = err?.config;
        if (err.response.status === 401 && !previousRequest.sent) {
          previousRequest.sent = true;
          try {
            const newToken = await refresh();
            previousRequest.headers['Authorization'] = `Bearer ${newToken}`;
            return axiosPrivate(previousRequest);
          } catch (refreshErr) {
            return Promise.reject(refreshErr);
          }
        }
        return Promise.reject(err);
      }
    );

    return () => {
      axiosPrivate.interceptors.request.eject(requestInterceptorId);
      axiosPrivate.interceptors.response.eject(responseInterceptorId);
    }

  }, [accessToken, refresh]);

  return axiosPrivate;
}