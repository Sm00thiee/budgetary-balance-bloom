
import { api } from './api';
import { API_CONFIG } from '@/config/api.config';

export const dashboardService = {
  getSummary: async () => {
    if (API_CONFIG.useMockData) {
      const lastChartData = API_CONFIG.mockData.chartData[API_CONFIG.mockData.chartData.length - 1];
      return {
        monthlyEarnings: lastChartData.earnings,
        totalSavings: lastChartData.savings,
        activeLoans: 12000,
        monthlySpending: lastChartData.spending,
      };
    }
    return api.get(API_CONFIG.endpoints.dashboard.summary);
  },
  
  getTransactions: async () => {
    if (API_CONFIG.useMockData) {
      return API_CONFIG.mockData.transactions;
    }
    return api.get(API_CONFIG.endpoints.dashboard.transactions);
  },
  
  getChartData: async () => {
    if (API_CONFIG.useMockData) {
      return API_CONFIG.mockData.chartData;
    }
    return api.get(API_CONFIG.endpoints.dashboard.chart);
  },
};
