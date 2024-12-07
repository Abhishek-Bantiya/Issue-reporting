import axios from 'axios';

const apiIssues = axios.create({
  baseURL: 'http://localhost:3000/api', // Base URL for the Issues Service
});

apiIssues.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiIssues;