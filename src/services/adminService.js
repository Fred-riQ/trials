import api from './api';

export const adminService = {
  // Clerk Management
  getClerks: async (storeId = null) => {
    try {
      const url = storeId ? `/admin/clerk?store_id=${storeId}` : '/admin/clerk';
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch clerks';
    }
  },

  createClerk: async (clerkData) => {
    try {
      const response = await api.post('/admin/clerk', clerkData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to create clerk account';
    }
  },

  updateClerk: async (clerkId, updates) => {
    try {
      const response = await api.patch(`/admin/clerk/${clerkId}`, updates);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to update clerk';
    }
  },

  toggleClerkStatus: async (clerkId, isActive) => {
    try {
      const response = await api.put(`/admin/clerk/${clerkId}/status`, {
        is_active: isActive
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to update clerk status';
    }
  },

  // Supply Request Management
  getSupplyRequests: async (status = null) => {
    try {
      const url = status ? `/admin/supply-requests?status=${status}` : '/admin/supply-requests';
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch supply requests';
    }
  },

  approveSupplyRequest: async (requestId) => {
    try {
      const response = await api.put(`/admin/supply-requests/${requestId}/approve`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to approve request';
    }
  },

  rejectSupplyRequest: async (requestId, reason) => {
    try {
      const response = await api.put(`/admin/supply-requests/${requestId}/reject`, {
        rejection_reason: reason
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to reject request';
    }
  },

  // Payment Status Management
  getPendingPayments: async () => {
    try {
      const response = await api.get('/admin/payments/pending');
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch pending payments';
    }
  },

  updatePaymentStatus: async (paymentId, isPaid) => {
    try {
      const response = await api.put(`/admin/payments/${paymentId}`, {
        is_paid: isPaid
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to update payment status';
    }
  },

  // Store Reports
  getStoreReports: async (storeId, period = 'monthly') => {
    try {
      const response = await api.get(`/admin/reports/store/${storeId}?period=${period}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch store reports';
    }
  }
};