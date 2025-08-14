import axios from "axios";
import { API_BASE_URL, STORAGE_KEYS } from "../utils/constants.js";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Track if we're currently refreshing token to avoid multiple refresh attempts
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });

  failedQueue = [];
};

// Response interceptor for error handling and token refresh
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const { response } = error;

    if (response) {
      // Handle different HTTP status codes
      switch (response.status) {
        case 401:
          // Unauthorized - try to refresh token
          if (!originalRequest._retry) {
            if (isRefreshing) {
              // If already refreshing, queue this request
              return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
              })
                .then((token) => {
                  originalRequest.headers.Authorization = `Bearer ${token}`;
                  return api(originalRequest);
                })
                .catch((err) => {
                  return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
              // Try to refresh token
              const refreshResponse = await api.post("/api/auth/refresh");
              const { token } =
                refreshResponse.data.data || refreshResponse.data;

              localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
              api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
              originalRequest.headers.Authorization = `Bearer ${token}`;

              processQueue(null, token);

              return api(originalRequest);
            } catch (refreshError) {
              // Refresh failed - clear tokens and redirect to login
              processQueue(refreshError, null);
              localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
              localStorage.removeItem(STORAGE_KEYS.USER_DATA);

              // Only redirect if we're not already on login page
              if (window.location.pathname !== "/login") {
                window.location.href = "/login";
              }

              return Promise.reject(refreshError);
            } finally {
              isRefreshing = false;
            }
          }
          break;
        case 403:
          // Forbidden
          console.error("Access forbidden:", response.data.message);
          break;
        case 404:
          // Not found
          console.error("Resource not found:", response.data.message);
          break;
        case 422:
          // Validation error
          console.error("Validation error:", response.data.errors);
          break;
        case 500:
          // Server error
          console.error("Server error:", response.data.message);
          break;
        default:
          console.error("API error:", response.data.message);
      }

      // Create appropriate error types
      const {
        AppError,
        AuthenticationError,
        AuthorizationError,
        ValidationError,
        NotFoundError,
        ServerError,
      } = await import("../utils/errorHandler.js");

      let error;
      switch (response.status) {
        case 401:
          error = new AuthenticationError(
            response.data.message || "Authentication failed"
          );
          break;
        case 403:
          error = new AuthorizationError(
            response.data.message || "Access denied"
          );
          break;
        case 404:
          error = new NotFoundError(
            response.data.message || "Resource not found"
          );
          break;
        case 422:
          error = new ValidationError(
            response.data.message || "Validation failed",
            response.data.errors
          );
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          error = new ServerError(response.data.message || "Server error");
          break;
        default:
          error = new AppError(
            response.data.message || "An error occurred",
            "API_ERROR",
            response.status
          );
      }

      return Promise.reject(error);
    } else if (error.request) {
      // Network error
      return Promise.reject({
        message: "Network error. Please check your connection.",
        status: 0,
        errors: null,
      });
    } else {
      // Other error
      return Promise.reject({
        message: error.message || "An unexpected error occurred",
        status: 0,
        errors: null,
      });
    }
  }
);

// Generic API methods with enhanced error handling
export const apiService = {
  get: (url, config = {}) => api.get(url, config),
  post: (url, data, config = {}) => api.post(url, data, config),
  put: (url, data, config = {}) => api.put(url, data, config),
  patch: (url, data, config = {}) => api.patch(url, data, config),
  delete: (url, config = {}) => api.delete(url, config),

  // Helper method to check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    return !!token;
  },

  // Helper method to get current user from storage
  getCurrentUser: () => {
    try {
      const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Error parsing user data:", error);
      return null;
    }
  },

  // Helper method to clear authentication data
  clearAuth: () => {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    delete api.defaults.headers.common["Authorization"];
  },

  // Helper method to set authentication token
  setAuthToken: (token) => {
    if (token) {
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      apiService.clearAuth();
    }
  },
};

export default api;
