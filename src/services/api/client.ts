import axios from 'axios';

// Base API configuration
const DEV_API_URL = 'http://localhost:54321';
const API_URL = import.meta.env.VITE_API_URL || DEV_API_URL;

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

        // Build refresh URL safely (avoid double slashes)
        const baseUrl = API_URL.replace(/\/+$/, '');
        const refreshUrl = `${baseUrl}/authentication/refresh-token`;

        // Call refresh token endpoint with Authorization header (access token)
        const currentAccessToken = localStorage.getItem('token');
        let response;
        try {
          response = await axios.post(
            refreshUrl,
            { token: refreshToken },
            {
              headers: currentAccessToken
                ? { Authorization: `Bearer ${currentAccessToken}` }
                : undefined,
              timeout: 15000,
            },
          );
        } catch (e: unknown) {
          // If CORS/preflight or network issue occurs, try once without Authorization header as fallback
          const err = e as { response?: unknown };
          if (!err.response) {
            response = await axios.post(refreshUrl, { token: refreshToken }, { timeout: 15000 });
          } else {
            throw err;
          }
        }

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
        // localStorage.removeItem('token');
        // localStorage.removeItem('refreshToken');
        // localStorage.removeItem('auth-storage');
        // window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
