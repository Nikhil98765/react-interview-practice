import { useAuth } from "../context/AuthContext";
import axiosPrivate from "../api/axios";

export const useRefreshToken = () => {
  const { setAccessToken } = useAuth();

  const refresh = async () => {
    const res = await axiosPrivate('/auth/refresh', { expiresInMins: 30 });
    setAccessToken(res.data.accessToken);
    return res.data.accessToken;
  }

  return refresh;
}