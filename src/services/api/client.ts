import axios from 'axios';
import { Modal } from 'antd';

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

// Clear auth state and redirect to login
const forceLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('auth-storage');
  window.location.href = '/login';
};

// Ask the user whether to keep the refreshed session or log out.
// Guarded so concurrent 401s don't stack multiple modals.
let sessionPromptInFlight: Promise<boolean> | null = null;
const promptContinueSession = (): Promise<boolean> => {
  if (sessionPromptInFlight) {
    return sessionPromptInFlight;
  }

  sessionPromptInFlight = new Promise<boolean>((resolve) => {
    Modal.confirm({
      title: 'სესიის ვადა ამოიწურა',
      content: 'გსურთ სესიის გაგრძელება თუ სისტემიდან გასვლა?',
      okText: 'სესიის გაგრძელება',
      cancelText: 'გასვლა',
      onOk: () => resolve(true),
      onCancel: () => resolve(false),
    });
  }).finally(() => {
    sessionPromptInFlight = null;
  });

  return sessionPromptInFlight;
};

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

        const response = await axios.post(refreshUrl, { token: refreshToken }, { timeout: 15000 });

        const { token, refreshToken: newRefreshToken } = response.data;

        // Update tokens in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', newRefreshToken);

        // Session was successfully refreshed — let the user decide whether to
        // continue or log out.
        const continueSession = await promptContinueSession();
        if (!continueSession) {
          forceLogout();
          return Promise.reject(error);
        }

        // Update the failed request's authorization header
        originalRequest.headers.Authorization = `Bearer ${token}`;

        // Retry the original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        // If refresh token fails, log the user out automatically
        forceLogout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
