import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
});

// Automatically add JWT token from localStorage
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('expense_tracker_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
