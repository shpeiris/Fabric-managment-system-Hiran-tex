// Order Service
import apiClient from "../api/client.js";

const orderService = {
  /**
   * Get all orders (with optional filters)
   * @param {Object} params - Query parameters
   * @returns {Promise} Array of orders
   */
  getAllOrders: async (params = {}) => {
    try {
      const response = await apiClient.get("/api/orders", { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: "Failed to fetch orders" };
    }
  },

  /**
   * Get order by ID
   * @param {number} orderId
   * @returns {Promise} Order data
   */
  getOrderById: async (orderId) => {
    try {
      const response = await apiClient.get(`/api/orders/${orderId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: "Failed to fetch order" };
    }
  },

  /**
   * Create new order
   * @param {Object} orderData
   * @returns {Promise} Created order
   */
  createOrder: async (orderData) => {
    try {
      const response = await apiClient.post("/api/orders", orderData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: "Failed to create order" };
    }
  },

  /**
   * Update order status
   * @param {number} orderId
   * @param {string} status - PENDING, PROCESSING, DELIVERED, CANCELLED
   * @returns {Promise} Updated order
   */
  updateOrderStatus: async (orderId, status) => {
    try {
      const response = await apiClient.patch(`/api/orders/${orderId}/status`, {
        status,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: "Failed to update order status" };
    }
  },

  /**
   * Cancel order
   * @param {number} orderId
   * @returns {Promise}
   */
  cancelOrder: async (orderId) => {
    try {
      const response = await apiClient.post(`/api/orders/${orderId}/cancel`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: "Failed to cancel order" };
    }
  },

  /**
   * Get customer orders
   * @returns {Promise} Array of current user's orders
   */
  getMyOrders: async () => {
    try {
      const response = await apiClient.get("/api/orders");
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: "Failed to fetch your orders" };
    }
  },
};

export default orderService;
