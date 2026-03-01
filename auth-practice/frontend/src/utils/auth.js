import { redirect } from "react-router-dom";

export const getDuration = () => {
  const expiration = localStorage.getItem("expiration");
  const expirationDuration = new Date(expiration);
  const now = new Date();
  const duration = expirationDuration.getTime() - now.getTime();
  return duration;
}

export const getToken = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    return null;
  }

  if (getDuration() < 0) {
    return 'EXPIRED';
  }

  return token;
}

export const checkAuthLoader = () => {
  if (!getToken()) {
    return redirect('/auth');
  }
  return null;
}