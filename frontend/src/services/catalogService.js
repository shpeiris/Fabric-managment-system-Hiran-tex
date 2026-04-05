import { apiCall } from "../utils/auth.js";

const BASE_URL = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/inventory/catalog`;

export const catalogService = {
  addToCatalog: async (fabricId) => {
    const response = await apiCall(`${BASE_URL}/add`, {
      method: "POST",
      body: JSON.stringify({ fabricId }),
    });
    return response.json();
  },

  removeFromCatalog: async (fabricId) => {
    const response = await apiCall(`${BASE_URL}/remove`, {
      method: "POST",
      body: JSON.stringify({ fabricId }),
    });
    return response.json();
  },

  getCatalogStatus: async () => {
    const response = await apiCall(`${BASE_URL}/status`);
    return response.json();
  },
};
