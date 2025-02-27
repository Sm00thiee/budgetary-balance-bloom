import { api } from "./api";
import { API_CONFIG } from "@/config/api.config";

export const dashboardService = {
  getSummary: () => api.get(API_CONFIG.endpoints.dashboard.summary),

  getTransactions: () => api.get(API_CONFIG.endpoints.dashboard.transactions),

  getChartData: (params?: {
    startDate?: Date;
    endDate?: Date;
    userId?: number;
  }) => {
    let url = API_CONFIG.endpoints.dashboard.chart;

    const queryParams = [];

    if (params?.startDate) {
      queryParams.push(`startDate=${params.startDate.toISOString()}`);
    }

    if (params?.endDate) {
      queryParams.push(`endDate=${params.endDate.toISOString()}`);
    }

    if (params?.userId) {
      queryParams.push(`userId=${params.userId}`);
    }

    if (queryParams.length > 0) {
      url += `?${queryParams.join("&")}`;
    }

    return api.get(url).then((response) => {
      return response.data.map((item: MonthlyFinancialChart) => ({
        name: item.Month,
        earnings: item.Earnings,
        savings: item.Savings,
        loans: item.Loans,
        spending: item.Spending,
        yearMonth: item.YearMonth,
        year: item.Year,
      }));
    });
  },
};

interface MonthlyFinancialChart {
  YearMonth: string;
  Month: string;
  Year: number;
  Earnings: number;
  Spending: number;
  Savings: number;
  Loans: number;
}
