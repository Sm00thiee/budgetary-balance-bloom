
import { api } from './api';
import { API_CONFIG } from '@/config/api.config';

export const dashboardService = {
  getSummary: () => api.get(API_CONFIG.endpoints.dashboard.summary),
  
  getTransactions: () => api.get(API_CONFIG.endpoints.dashboard.transactions),
  
  getChartData: () => api.get(API_CONFIG.endpoints.dashboard.chart),
};
