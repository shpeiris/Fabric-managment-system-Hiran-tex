import apiClient from "../api/client.js";

const activityService = {
  getRecent: async (limit = 8) => {
    try {
      const response = await apiClient.get(`/admin/activity-logs?limit=${limit}`);
      return response.data.activities || [];
    } catch (error) {
      throw error.response?.data || { error: "Failed to fetch activity logs" };
    }
  },
};

export default activityService;
