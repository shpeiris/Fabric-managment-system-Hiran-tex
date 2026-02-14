// Cart Service
import apiClient from "../api/client.js";

const cartService = {
  /**
   * Get current user's cart
   * @returns {Promise} Cart items
   */
  getCart: async () => {
    try {
      const response = await apiClient.get("/api/cart");
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: "Failed to fetch cart" };
    }
  },

  /**
   * Add item to cart
   * @param {Object} item - { fabric_id, quantity }
   * @returns {Promise}
   */
  addToCart: async (item) => {
    try {
      const response = await apiClient.post("/api/cart", item);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: "Failed to add to cart" };
    }
  },

  /**
   * Update cart item quantity
   * @param {number} cartItemId
   * @param {number} quantity
   * @returns {Promise}
   */
  updateCartItem: async (cartItemId, quantity) => {
    try {
      const response = await apiClient.put(`/api/cart/${cartItemId}`, {
        quantity,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: "Failed to update cart item" };
    }
  },

  /**
   * Remove item from cart
   * @param {number} cartItemId
   * @returns {Promise}
   */
  removeFromCart: async (cartItemId) => {
    try {
      const response = await apiClient.delete(`/api/cart/${cartItemId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: "Failed to remove from cart" };
    }
  },

  /**
   * Clear entire cart
   * @returns {Promise}
   */
  clearCart: async () => {
    try {
      const response = await apiClient.delete("/api/cart");
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: "Failed to clear cart" };
    }
  },
};

export default cartService;
