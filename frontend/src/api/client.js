// API Configuration and Axios Instance
import axios from "axios";

// Base URL for API - can be changed via environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for session cookies
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 seconds timeout
});

// Request interceptor - runs before every request
apiClient.interceptors.request.use(
  (config) => {
    // You can add auth tokens here if needed in the future
    // const token = localStorage.getItem('token');
    // if (token) {
    //     config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor - runs after every response
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common error scenarios
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // Unauthorized - redirect to login
          console.error("Unauthorized access - redirecting to login");
          window.location.href = "/login";
          break;
        case 403:
          console.error("Access forbidden");
          break;
        case 404:
          console.error("Resource not found");
          break;
        case 500:
          console.error("Server error");
          break;
        default:
          console.error("API Error:", data.error || error.message);
      }
    } else if (error.request) {
      // Request made but no response
      console.error("Network error - no response from server");
    } else {
      // Error in request setup
      console.error("Request error:", error.message);
    }

    return Promise.reject(error);
  },
);

export default apiClient;
export { API_BASE_URL };
