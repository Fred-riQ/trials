import api from './api';

export const inventoryService = {
  // Stock Management
  addStock: async (stockData) => {
    try {
      const response = await api.post('/inventory/add_stock', stockData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to add stock';
    }
  },

  // Supply Requests
  getSupplyRequests: async () => {
    try {
      const response = await api.get('/inventory/supply_requests');
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch supply requests';
    }
  },

  approveRequest: async (requestId) => {
    try {
      const response = await api.put(`/inventory/supply_requests/${requestId}/approve`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to approve request';
    }
  },

  declineRequest: async (requestId) => {
    try {
      const response = await api.put(`/inventory/supply_requests/${requestId}/decline`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to decline request';
    }
  },

  // Additional inventory endpoints can be added here
};