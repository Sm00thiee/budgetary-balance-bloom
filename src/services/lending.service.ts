import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:5193/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true // Enable sending cookies in cross-origin requests
});

// DTOs and Interfaces
export interface LendingDto {
  id: string;
  borrowName: string;
  date: string;
  description: string;
  status: number;
  amount: number;
  interestRate: number;
  dueDate: string;
  amountRepaid: number;
  remainingAmount: number;
  calculatedInterest: number;
  totalDue: number;
  lastRepaymentDate?: string;
  isOverdue: boolean;
}

export interface CreateLendingRequestDto {
  borrowName: string;
  description: string;
  amount: number;
  interestRate: number;
  dueDate: string;
  date: string;
}

export interface UpdateLendingRequestDto {
  borrowName: string;
  description: string;
  amount: number;
  interestRate: number;
  status?: string;
  dueDate: string;
  date: string;
}

export interface GetLendingRequestDto {
  pageNumber: number;
  itemsPerPage: number;
  borrowName?: string;
  status?: number;
  fromDate?: Date;
  toDate?: Date;
  minAmount?: number;
  maxAmount?: number;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface RecordRepaymentRequestDto {
  amount: number;
  note?: string;
}

export interface ChangeLendingStatusDto {
  status: number;
}

export interface BatchRepaymentRequestDto {
  repayments: Record<string, number>;
}

export interface BatchRepaymentResponseDto {
  remainingAmounts: Record<string, number>;
}

export interface LendingSummary {
  totalLent: number;
  totalOutstanding: number;
  totalRepaid: number;
  expectedInterest: number;
  activeCount: number;
  completedCount: number;
  defaultedCount: number;
  disputedCount: number;
  overdueCount: number;
  totalActiveAmount: number;
  totalOverdueAmount: number;
  totalCompletedAmount: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  pageNumber: number;
  totalPages: number;
}

export type Lending = LendingDto;

class LendingService {
  private readonly baseUrl = '/lendings';

  async create(lending: CreateLendingRequestDto): Promise<string> {
    const response = await api.post(this.baseUrl, lending);
    return response.data;
  }

  async getAll(params: GetLendingRequestDto): Promise<PaginatedResponse<Lending>> {
    const response = await api.post(`${this.baseUrl}/find`, params);
    return response.data;
  }

  async getById(id: string): Promise<Lending> {
    const response = await api.get(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async update(id: string, lending: UpdateLendingRequestDto): Promise<void> {
    await api.patch(`${this.baseUrl}/${id}`, lending);
  }

  async delete(id: string): Promise<void> {
    await api.delete(`${this.baseUrl}/${id}`);
  }

  async recordPayment(id: string, payment: RecordRepaymentRequestDto): Promise<number> {
    const response = await api.post(`${this.baseUrl}/${id}/repayments`, payment);
    return response.data;
  }

  async updateStatus(id: string, status: ChangeLendingStatusDto): Promise<Lending> {
    const response = await api.patch(`${this.baseUrl}/${id}/status`, status);
    return response.data;
  }

  async getSummary(): Promise<LendingSummary> {
    const response = await api.get(`${this.baseUrl}/summary`);
    return response.data;
  }

  async getOverdue(): Promise<Lending[]> {
    const response = await api.get(`${this.baseUrl}/overdue`);
    return response.data;
  }

  async processBatchRepayments(repayments: BatchRepaymentRequestDto): Promise<BatchRepaymentResponseDto> {
    const response = await api.post(`${this.baseUrl}/batch-repayments`, repayments);
    return response.data;
  }
}

export const lendingService = new LendingService();
