import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach Authorization Token to every request
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('tasktracker_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor to handle auth errors globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if expired or invalid
      if (localStorage.getItem('tasktracker_token')) {
        localStorage.removeItem('tasktracker_token');
        localStorage.removeItem('tasktracker_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default API;
