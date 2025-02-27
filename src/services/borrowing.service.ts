import { api } from "./api";
import { API_CONFIG } from "@/config/api.config";

export interface GetPageRequestDto {
  pageNumber?: number;
  itemsPerPage?: number;
  sortField?: string;
  sortDirection?: string;
}

export interface GetBorrowingRequestDto extends GetPageRequestDto {
  lenderName?: string;
  fromDate?: Date;
  toDate?: Date;
  minAmount?: number;
  maxAmount?: number;
  isOverdueOnly?: boolean;
  status?: number;
}

export interface Borrowing {
  id: string;
  lenderName: string;
  amount: number;
  interestRate: number;
  dueDate: string;
  description: string;
  date: string;
  status: number;
  remainingAmount?: number;
  payments?: BorrowingPayment[];
}

export interface BorrowingPayment {
  id: string;
  borrowingId: string;
  amount: number;
  date: string;
  note?: string;
}

export interface BorrowingSummary {
  totalActiveAmount: number;
  totalOverdueAmount: number;
  totalCompletedAmount: number;
  activeCount: number;
  overdueCount: number;
  completedCount: number;
  amountByStatus: Record<string, number>;
  countByStatus: Record<string, number>;
}

export const borrowingService = {
  getAll: (params?: GetBorrowingRequestDto) =>
    api.post(API_CONFIG.endpoints.borrowing.find, params),

  create: (data: {
    lenderName: string;
    description: string;
    amount: number;
    date: string;
    dueDate: string;
    interestRate: number;
    status?: number;
  }) => api.post(API_CONFIG.endpoints.borrowing.create, data),

  update: (
    id: string,
    data: {
      lenderName?: string;
      description?: string;
      amount?: number;
      date?: string;
      dueDate?: string;
      interestRate?: number;
      status?: number;
    }
  ) => api.put(API_CONFIG.endpoints.borrowing.update.replace(":id", id), data),

  getById: (id: string) =>
    api.get(API_CONFIG.endpoints.borrowing.getById.replace(":id", id)),

  updateStatus: (id: string, status: number) =>
    api.put(API_CONFIG.endpoints.borrowing.updateStatus.replace(":id", id), {
      status,
    }),

  delete: (id: string) =>
    api.delete(API_CONFIG.endpoints.borrowing.delete.replace(":id", id)),

  recordPayment: (id: string, data: { amount: number; note?: string }) =>
    api.post(
      API_CONFIG.endpoints.borrowing.recordPayment.replace(":id", id),
      data
    ),

  getSummary: () => api.get(API_CONFIG.endpoints.borrowing.summary),

  getOverdue: () => api.get(API_CONFIG.endpoints.borrowing.overdue),
};
