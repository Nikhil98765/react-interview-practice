import axios from 'axios';

const axiosPrivate = axios.create({
  baseURL: "https://dummyjson.com",
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true
});

export default axiosPrivate;