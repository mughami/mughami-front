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

// Clear auth state and redirect to login
const forceLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('auth-storage');
  window.location.href = '/login';
};

// --- Single-flight refresh ----------------------------------------------
// Refresh tokens are single-use/rotating: every successful refresh returns a
// new refresh token and invalidates the old one. If several requests 401 at
// once (common on page load) and each fires its own refresh, only the first
// succeeds — the rest send the already-consumed token and get logged out.
// We serialize refreshes: the first 401 performs the refresh, everyone else
// waits for that single result.
let refreshInFlight: Promise<string> | null = null;

const performRefresh = async (): Promise<string> => {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  // Build refresh URL safely (avoid double slashes)
  const baseUrl = API_URL.replace(/\/+$/, '');
  const refreshUrl = `${baseUrl}/authentication/refresh-token`;

  const response = await axios.post(refreshUrl, { token: refreshToken }, { timeout: 15000 });

  const { token, refreshToken: newRefreshToken } = response.data ?? {};
  if (!token || !newRefreshToken) {
    throw new Error('Refresh response missing token(s)');
  }

  // Update tokens in localStorage
  localStorage.setItem('token', token);
  localStorage.setItem('refreshToken', newRefreshToken);

  return token;
};

// Returns the refreshed access token, deduplicating concurrent callers.
const refreshAccessToken = (): Promise<string> => {
  if (!refreshInFlight) {
    refreshInFlight = performRefresh().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
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
        // Deduplicated across concurrent 401s — only one network refresh runs.
        const token = await refreshAccessToken();

        // Refresh succeeded silently — replay the original request with the
        // new access token so the caller never sees the 401.
        originalRequest.headers.Authorization = `Bearer ${token}`;
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
