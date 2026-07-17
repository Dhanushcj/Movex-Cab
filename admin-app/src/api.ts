import axios from 'axios';

// Replace with your local machine's IP address if testing on a physical device
const BASE_URL = 'https://movex-cab.onrender.com/api';

const API = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
API.interceptors.request.use(async (config) => {
  try {
    // Assuming you're using expo-secure-store here too, based on the codebase pattern
    const { getItemAsync } = require('expo-secure-store');
    const token = await getItemAsync('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error('Failed to read secure token:', error);
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor to handle token refresh
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/login' && originalRequest.url !== '/auth/refresh') {
      originalRequest._retry = true;

      try {
        const { getItemAsync, setItemAsync, deleteItemAsync } = require('expo-secure-store');
        const refreshToken = await getItemAsync('refreshToken');
        
        if (refreshToken) {
          const refreshResponse = await axios.post(`${API.defaults.baseURL}/auth/refresh`, {
            refreshToken
          });

          if (refreshResponse.data.success) {
            const { accessToken, refreshToken: newRefreshToken } = refreshResponse.data;

            await setItemAsync('adminToken', accessToken);
            await setItemAsync('refreshToken', newRefreshToken);

            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return API(originalRequest);
          }
        }
      } catch (refreshError) {
        console.error('Session expired. Please login again.', refreshError);
        const { deleteItemAsync } = require('expo-secure-store');
        await deleteItemAsync('adminToken');
        await deleteItemAsync('refreshToken');
        await deleteItemAsync('adminData');
      }
    }

    return Promise.reject(error);
  }
);

export const setAuthToken = (token: string | null) => {
  if (token) {
    API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete API.defaults.headers.common['Authorization'];
  }
};

export default API;
