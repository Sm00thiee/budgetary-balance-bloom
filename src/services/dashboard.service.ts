
import { api } from './api';
import { API_CONFIG } from '@/config/api.config';

export const dashboardService = {
  getSummary: async () => {
    return api.get(API_CONFIG.endpoints.dashboard.summary);
  },
  
  getTransactions: async () => {
    return api.get(API_CONFIG.endpoints.dashboard.transactions);
  },
  
  getChartData: async () => {
    return api.get(API_CONFIG.endpoints.dashboard.chart);
  },
};
