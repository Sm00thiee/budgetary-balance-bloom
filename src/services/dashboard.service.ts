import { api } from './api';
import { API_CONFIG } from '@/config/api.config';

export const dashboardService = {
  getSummary: () => api.get(API_CONFIG.endpoints.dashboard.summary),
  
  getTransactions: () => api.get(API_CONFIG.endpoints.dashboard.transactions),
  
  getChartData: (params?: {
    startDate?: Date,
    endDate?: Date,
    userId?: number
  }) => {
    // Convert dates to ISO string format if provided
    const queryParams: Record<string, string> = {};
    
    if (params?.startDate) {
      queryParams.startDate = params.startDate.toISOString();
    }
    
    if (params?.endDate) {
      queryParams.endDate = params.endDate.toISOString();
    }
    
    if (params?.userId) {
      queryParams.userId = params.userId.toString();
    }
    
    return api.get(API_CONFIG.endpoints.dashboard.chart, { params: queryParams })
      .then(response => {
        // Ensure the data is in the format expected by the FinanceChart component
        return response.data.map((item: MonthlyFinancialChart) => ({
          name: item.Month,
          earnings: item.Earnings,
          savings: item.Savings,
          loans: item.Loans,
          spending: item.Spending,
          // Additional metadata that might be useful
          yearMonth: item.YearMonth,
          year: item.Year
        }));
      });
  }
};

// Type definition to match the API response
interface MonthlyFinancialChart {
  YearMonth: string;
  Month: string;
  Year: number;
  Earnings: number;
  Spending: number;
  Savings: number;
  Loans: number;
}
