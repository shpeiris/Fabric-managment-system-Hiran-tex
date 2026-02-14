// Product/Fabric Service
import apiClient from "../api/client.js";

const productService = {
  /**
   * Get all fabrics/products
   * @param {Object} params - Query parameters (page, limit, search, etc.)
   * @returns {Promise} Array of products
   */
  getAllProducts: async (params = {}) => {
    try {
      const response = await apiClient.get("/api/products", { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: "Failed to fetch products" };
    }
  },

  /**
   * Get product by ID
   * @param {number} productId
   * @returns {Promise} Product data
   */
  getProductById: async (productId) => {
    try {
      const response = await apiClient.get(`/api/products/${productId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: "Failed to fetch product" };
    }
  },

  /**
   * Create new product (Inventory Manager/Admin)
   * @param {Object} productData
   * @returns {Promise} Created product
   */
  createProduct: async (productData) => {
    try {
      const response = await apiClient.post("/api/products", productData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: "Failed to create product" };
    }
  },

  /**
   * Update product
   * @param {number} productId
   * @param {Object} productData
   * @returns {Promise} Updated product
   */
  updateProduct: async (productId, productData) => {
    try {
      const response = await apiClient.put(
        `/api/products/${productId}`,
        productData,
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: "Failed to update product" };
    }
  },

  /**
   * Delete product
   * @param {number} productId
   * @returns {Promise}
   */
  deleteProduct: async (productId) => {
    try {
      const response = await apiClient.delete(`/api/products/${productId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: "Failed to delete product" };
    }
  },

  /**
   * Update product stock
   * @param {number} productId
   * @param {number} quantity
   * @returns {Promise}
   */
  updateStock: async (productId, quantity) => {
    try {
      const response = await apiClient.patch(
        `/api/products/${productId}/stock`,
        { quantity },
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: "Failed to update stock" };
    }
  },

  /**
   * Get low stock products
   * @returns {Promise} Array of low stock products
   */
  getLowStockProducts: async () => {
    try {
      const response = await apiClient.get("/api/products/low-stock");
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || { error: "Failed to fetch low stock products" }
      );
    }
  },
};

export default productService;
