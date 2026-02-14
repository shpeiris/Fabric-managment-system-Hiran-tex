import apiClient from "../api/client";

const supplierService = {
  getAll: async () => {
    const response = await apiClient.get("/api/inventory/suppliers");
    return response.data.suppliers;
  },

  create: async (data) => {
    const response = await apiClient.post("/api/inventory/suppliers", data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await apiClient.put(
      `/api/inventory/suppliers/${id}`,
      data,
    );
    return response.data;
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/api/inventory/suppliers/${id}`);
    return response.data;
  },
};

export default supplierService;
