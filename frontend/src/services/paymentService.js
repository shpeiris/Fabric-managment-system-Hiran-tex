// Payment Service
import apiClient from "../api/client.js";

const paymentService = {
  /**
   * Get all payments
   * @param {Object} params
   * @returns {Promise} Array of payments
   */
  getAllPayments: async (params = {}) => {
    try {
      const response = await apiClient.get("/api/payments", { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: "Failed to fetch payments" };
    }
  },

  /**
   * Get payment by ID
   * @param {number} paymentId
   * @returns {Promise} Payment data
   */
  getPaymentById: async (paymentId) => {
    try {
      const response = await apiClient.get(`/api/payments/${paymentId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: "Failed to fetch payment" };
    }
  },

  /**
   * Create payment
   * @param {Object} paymentData
   * @returns {Promise} Created payment
   */
  createPayment: async (paymentData) => {
    try {
      const response = await apiClient.post("/api/payments", paymentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: "Failed to create payment" };
    }
  },

  /**
   * Verify payment (Admin/Staff)
   * @param {number} paymentId
   * @returns {Promise}
   */
  verifyPayment: async (paymentId) => {
    try {
      const response = await apiClient.post(
        `/api/payments/${paymentId}/verify`,
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: "Failed to verify payment" };
    }
  },

  /**
   * Get customer payments
   * @returns {Promise} Array of current user's payments
   */
  getMyPayments: async () => {
    try {
      const response = await apiClient.get("/api/payments/my-payments");
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: "Failed to fetch your payments" };
    }
  },

  /**
   * Upload payment proof (bank slip)
   * @param {number} paymentId
   * @param {FormData} formData - File upload
   * @returns {Promise}
   */
  uploadPaymentProof: async (paymentId, formData) => {
    try {
      const response = await apiClient.post(
        `/api/payments/${paymentId}/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: "Failed to upload payment proof" };
    }
  },
};

export default paymentService;
