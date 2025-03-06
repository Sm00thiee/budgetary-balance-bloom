import { apiService } from "./api";
import { API_CONFIG } from "@/config/api.config";

export interface DashboardSummary {
  monthlyEarnings: number;
  totalSavings: number;
  activeLoans: number;
  activeBorrowings: number;
  monthlySpending: number;
  borrowingCount: number;
  lendingCount: number;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: string;
  category?: string;
}

export interface SpendingTransactionsResponse {
  transactions: Transaction[];
  summary: {
    totalAmount: number;
    transactionCount: number;
    categories: Array<{
      category: string;
      total: number;
      count: number;
    }>;
  };
}

export interface ChartData {
  yearMonth: string;
  name: string;
  earnings: number;
  savings: number;
  loans: number;
  borrowings: number;
  spending: number;
  year: number;
}

export const dashboardService = {
  getSummary: () =>
    apiService.get<DashboardSummary>(API_CONFIG.endpoints.dashboard.summary),

  getTransactions: async () => {
    console.log("Fetching transactions from API");
    try {
      const data = await apiService.get<Transaction[]>(
        API_CONFIG.endpoints.dashboard.transactions
      );
      console.log("Transactions received:", data);

      // Log transaction types distribution
      if (Array.isArray(data)) {
        const earningsCount = data.filter((t) => t.type === "Earning").length;
        const spendingCount = data.filter((t) => t.type === "Spending").length;
        console.log(
          `Transaction breakdown - Earnings: ${earningsCount}, Spending: ${spendingCount}, Total: ${data.length}`
        );
      }

      return data;
    } catch (error) {
      console.error("Error fetching transactions:", error);
      throw error;
    }
  },

  getSpendingTransactions: async () => {
    console.log("Fetching spending transactions from API");
    try {
      const data = await apiService.get<SpendingTransactionsResponse>(
        API_CONFIG.endpoints.dashboard.spendingTransactions
      );
      console.log("Spending transactions received:", data);
      return data;
    } catch (error) {
      console.error("Error fetching spending transactions:", error);
      throw error;
    }
  },

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

    return apiService.get<ChartData[]>(url);
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
