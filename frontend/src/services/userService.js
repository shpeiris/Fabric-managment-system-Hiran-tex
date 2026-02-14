// User Management Service
import apiClient from "../api/client.js";

const userService = {
  /**
   * Get all users (Admin only)
   * @returns {Promise} Array of users
   */
  getAllUsers: async () => {
    try {
      const response = await apiClient.get("/api/users");
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: "Failed to fetch users" };
    }
  },

  /**
   * Get user by ID
   * @param {number} userId
   * @returns {Promise} User data
   */
  getUserById: async (userId) => {
    try {
      const response = await apiClient.get(`/api/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: "Failed to fetch user" };
    }
  },

  /**
   * Create new user (Admin only)
   * @param {Object} userData
   * @returns {Promise} Created user
   */
  createUser: async (userData) => {
    try {
      const response = await apiClient.post("/api/users", userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: "Failed to create user" };
    }
  },

  /**
   * Update user
   * @param {number} userId
   * @param {Object} userData
   * @returns {Promise} Updated user
   */
  updateUser: async (userId, userData) => {
    try {
      const response = await apiClient.put(`/api/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: "Failed to update user" };
    }
  },

  /**
   * Delete user
   * @param {number} userId
   * @returns {Promise}
   */
  deleteUser: async (userId) => {
    try {
      const response = await apiClient.delete(`/api/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: "Failed to delete user" };
    }
  },

  /**
   * Update user profile
   * @param {Object} profileData
   * @returns {Promise} Updated profile
   */
  updateProfile: async (profileData) => {
    try {
      const response = await apiClient.put("/api/profile", profileData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: "Failed to update profile" };
    }
  },

  /**
   * Change password
   * @param {Object} passwordData - { currentPassword, newPassword }
   * @returns {Promise}
   */
  changePassword: async (passwordData) => {
    try {
      const response = await apiClient.post(
        "/api/change-password",
        passwordData,
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: "Failed to change password" };
    }
  },
};

export default userService;
