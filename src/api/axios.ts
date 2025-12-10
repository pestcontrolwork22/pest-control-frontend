import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL,
});

// Flag to prevent multiple redirects
let isRedirecting = false;

// Request interceptor - Add token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle authentication errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const currentPath = window.location.pathname;

    // Handle 401 Unauthorized (expired or invalid token)
    if (status === 401 && currentPath !== "/login") {
      // Prevent multiple simultaneous redirects
      if (!isRedirecting) {
        isRedirecting = true;

        // Clear authentication data
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        // Show a brief message (optional)
        console.warn("Session expired. Please login again.");

        // Redirect to login
        window.location.href = "/login";

        // Reset flag after redirect
        setTimeout(() => {
          isRedirecting = false;
        }, 1000);
      }
    }

    // Handle 403 Forbidden (insufficient permissions)
    if (status === 403) {
      console.error("Access denied. Insufficient permissions.");
      // You could show a toast notification here
    }

    return Promise.reject(error);
  }
);

export default api;
