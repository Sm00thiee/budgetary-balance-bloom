import { api } from "./api";
import { API_CONFIG } from "@/config/api.config";

export interface GetPageRequestDto {
  pageNumber?: number;
  itemsPerPage?: number;
  sortField?: string;
  sortDirection?: string;
}

export interface GetLendingRequestDto extends GetPageRequestDto {
  borrowName?: string;
  fromDate?: Date;
  toDate?: Date;
  minAmount?: number;
  maxAmount?: number;
  isOverdueOnly?: boolean;
  status?: number;
}

export interface Lending {
  id: string;
  borrowName: string;
  amount: number;
  interestRate: number;
  dueDate: string;
  description: string;
  date: string;
  status: number;
  remainingAmount?: number;
  payments?: LendingPayment[];
}

export interface LendingPayment {
  id: string;
  lendingId: string;
  amount: number;
  date: string;
  note?: string;
}

export interface LendingSummary {
  totalActiveAmount: number;
  totalOverdueAmount: number;
  totalCompletedAmount: number;
  activeCount: number;
  overdueCount: number;
  completedCount: number;
  amountByStatus: Record<string, number>;
  countByStatus: Record<string, number>;
}

export const lendingService = {
  getAll: (params?: GetLendingRequestDto) =>
    api.post(API_CONFIG.endpoints.lending.find, params),

  create: (data: {
    borrowName: string;
    description: string;
    amount: number;
    date: string;
    dueDate: string;
    interestRate: number;
    status?: number;
  }) => api.post(API_CONFIG.endpoints.lending.create, data),

  update: (
    id: string,
    data: {
      borrowName?: string;
      description?: string;
      amount?: number;
      date?: string;
      dueDate?: string;
      interestRate?: number;
      status?: number;
    }
  ) => api.put(API_CONFIG.endpoints.lending.update.replace(":id", id), data),

  getById: (id: string) =>
    api.get(API_CONFIG.endpoints.lending.getById.replace(":id", id)),

  updateStatus: (id: string, status: number) =>
    api.put(API_CONFIG.endpoints.lending.updateStatus.replace(":id", id), {
      status,
    }),

  delete: (id: string) =>
    api.delete(API_CONFIG.endpoints.lending.delete.replace(":id", id)),

  recordPayment: (id: string, data: { amount: number; note?: string }) =>
    api.post(
      API_CONFIG.endpoints.lending.recordPayment.replace(":id", id),
      data
    ),

  getSummary: () => api.get(API_CONFIG.endpoints.lending.summary),

  getOverdue: () => api.get(API_CONFIG.endpoints.lending.overdue),
};
