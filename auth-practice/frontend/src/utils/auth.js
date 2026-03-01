import { redirect } from "react-router-dom";

export const getToken = () => {
  return localStorage.getItem('token');
}

export const checkAuthLoader = () => {
  if (!getToken()) {
    return redirect('/auth');
  }
  return null;
}