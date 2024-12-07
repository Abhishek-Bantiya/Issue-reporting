import axios from 'axios';

const apiNotify = axios.create({
  baseURL: 'http://localhost:3001/api/notifications', // Base URL for the Issues Service
});

apiNotify.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiNotify;