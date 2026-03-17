import apiClient from "../api/client.js";

const customerService = {
  /**
   * Get dashboard statistics for the logged in customer
   * @returns {Promise} Dashboard stats object
   */
  getDashboardStats: async () => {
    try {
      const response = await apiClient.get("/api/customer/dashboard-stats");
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: "Failed to fetch dashboard statistics" };
    }
  }
};

export default customerService;
