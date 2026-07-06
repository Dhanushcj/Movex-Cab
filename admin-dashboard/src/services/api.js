import axios from 'axios';

const API = axios.create({
  baseURL: 'https://movex-cab.onrender.com/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add jwt token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default API;
