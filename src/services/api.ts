import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API = axios.create({
  // baseURL: 'https://movex-cab.onrender.com/api', // Render Production Server
  // baseURL: 'http://192.168.1.28:5000/api', // Local Dev Server (Wi-Fi only)
  baseURL: 'https://forty-beans-show.loca.lt/api', // Public Tunnel for Mobile Internet testing
  headers: {
    'Content-Type': 'application/json',
    'Bypass-Tunnel-Reminder': 'true' // Required to bypass localtunnel warning page
  }
});

// Request interceptor to attach JWT token
API.interceptors.request.use(async (config) => {
  try {
    const token = await SecureStore.getItemAsync('userToken');
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

    // Only attempt refresh if 401 and we haven't already retried
    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/login' && originalRequest.url !== '/auth/refresh') {
      originalRequest._retry = true;

      try {
        const refreshToken = await SecureStore.getItemAsync('refreshToken');
        
        if (refreshToken) {
          // Request a new access token
          const refreshResponse = await axios.post(`${API.defaults.baseURL}/auth/refresh`, {
            refreshToken
          });

          if (refreshResponse.data.success) {
            const { accessToken, refreshToken: newRefreshToken } = refreshResponse.data;

            // Save new tokens
            await SecureStore.setItemAsync('userToken', accessToken);
            await SecureStore.setItemAsync('refreshToken', newRefreshToken);

            // Update authorization header and retry original request
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return API(originalRequest);
          }
        } else {
          // No refresh token available, force logout
          await SecureStore.deleteItemAsync('userToken');
        }
      } catch (refreshError) {
        console.error('Session expired. Please login again.', refreshError);
        // Clear secure store to force logout
        await SecureStore.deleteItemAsync('userToken');
        await SecureStore.deleteItemAsync('refreshToken');
      }
    }

    return Promise.reject(error);
  }
);

export const getDriverAchievements = async () => {
  try {
    const response = await API.get('/drivers/achievements');
    return response.data;
  } catch (error) {
    console.error('Error fetching driver achievements:', error);
    throw error;
  }
};

export const uploadFile = async (uri: string): Promise<string | null> => {
  if (!uri || !uri.startsWith('file://')) return uri; // Already a remote URL or null

  try {
    const formData = new FormData();
    const filename = uri.split('/').pop() || 'upload.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    formData.append('document', { uri, name: filename, type } as any);

    const response = await API.post('/upload/document', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.data.success) {
      return response.data.fileUrl;
    }
    return null;
  } catch (error) {
    console.error('File upload failed:', error);
    return null;
  }
};

export default API;
