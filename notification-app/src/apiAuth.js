import axios from 'axios';

const apiAuth = axios.create({
  baseURL: 'http://localhost:3002', // Base URL for the Auth Service
});

apiAuth.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiAuth;