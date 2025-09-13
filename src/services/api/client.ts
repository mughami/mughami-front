import axios from 'axios';

// Base API configuration
const DEV_API_URL = 'https://mughamiprod-production.up.railway.app';
const API_URL = DEV_API_URL;

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Don't set Content-Type for FormData requests - let the browser handle it
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor for handling errors and token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Call refresh token endpoint
        const response = await axios.post(`${API_URL}/authentication/refresh-token`, {
          refreshToken,
        });

        const { token, refreshToken: newRefreshToken } = response.data;

        // Update tokens in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', newRefreshToken);

        // Update the failed request's authorization header
        originalRequest.headers.Authorization = `Bearer ${token}`;

        // Retry the original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        // If refresh token fails, logout user
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('auth-storage');
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
