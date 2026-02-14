// Authentication Service
import apiClient from "../api/client.js";

const authService = {
  /**
   * Login user
   * @param {Object} credentials - { email, password }
   * @returns {Promise} User data and redirect path
   */
  login: async (credentials) => {
    try {
      const response = await apiClient.post("/login", credentials);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: "Login failed" };
    }
  },

  /**
   * Register new customer
   * @param {Object} userData - { full_name, email, phone, address, username, password }
   * @returns {Promise} Registration response
   */
  register: async (userData) => {
    try {
      const response = await apiClient.post("/register", userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: "Registration failed" };
    }
  },

  /**
   * Logout current user
   * @returns {Promise}
   */
  logout: async () => {
    try {
      const response = await apiClient.post("/logout");
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: "Logout failed" };
    }
  },

  /**
   * Get current authenticated user
   * @returns {Promise} Current user data
   */
  getCurrentUser: async () => {
    try {
      const response = await apiClient.get("/auth/me");
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: "Failed to get user" };
    }
  },

  /**
   * Request password reset
   * @param {string} email
   * @returns {Promise}
   */
  forgotPassword: async (email) => {
    try {
      const response = await apiClient.post("/forgot-password", { email });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: "Password reset request failed" };
    }
  },

  /**
   * Reset password with token
   * @param {string} token
   * @param {string} newPassword
   * @returns {Promise}
   */
  resetPassword: async (token, newPassword) => {
    try {
      const response = await apiClient.post("/reset-password", {
        token,
        newPassword,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: "Password reset failed" };
    }
  },
};

export default authService;
