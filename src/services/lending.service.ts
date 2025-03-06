import axios from "axios";
import { apiService } from "./api";
import { API_CONFIG } from "@/config/api.config";

// Create axios instance with default config
const api = axios.create({
  baseURL: "http://localhost:5193/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Enable sending cookies in cross-origin requests
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
  sortDirection?: "asc" | "desc";
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
  private readonly baseUrl = API_CONFIG.endpoints.lending.base;

  async create(lending: CreateLendingRequestDto): Promise<string> {
    const response = await apiService.post(
      API_CONFIG.endpoints.lending.create,
      lending
    );
    return response;
  }

  async getAll(
    params: GetLendingRequestDto
  ): Promise<PaginatedResponse<Lending>> {
    console.log("LendingService.getAll: Request params:", params);
    try {
      const response = await apiService.post(
        API_CONFIG.endpoints.lending.find,
        params
      );
      console.log("LendingService.getAll: Raw API response:", response);

      // Transform response to match expected structure
      if (response && Array.isArray(response.items)) {
        // Response is already in expected format
        return response;
      } else if (response && !response.items && Array.isArray(response)) {
        // API might be returning array directly instead of paged structure
        console.log("Transforming array response to paginated structure");
        return {
          items: response.map((item) => this.transformLendingItem(item)),
          total: response.length,
          pageNumber: params.pageNumber || 1,
          totalPages: Math.ceil(response.length / (params.itemsPerPage || 10)),
        };
      } else if (response && typeof response === "object") {
        // Could be a different response structure, try to adapt
        console.log("Adapting unknown response structure");
        const items = response.items || response.data || response.results || [];
        return {
          items: Array.isArray(items)
            ? items.map((item) => this.transformLendingItem(item))
            : [],
          total: response.total || response.totalCount || items.length || 0,
          pageNumber: response.pageNumber || params.pageNumber || 1,
          totalPages:
            response.totalPages ||
            Math.ceil(
              (response.total || items.length) / (params.itemsPerPage || 10)
            ),
        };
      }

      // Fallback - empty result
      console.warn("Could not parse API response, returning empty result");
      return {
        items: [],
        total: 0,
        pageNumber: params.pageNumber || 1,
        totalPages: 0,
      };
    } catch (error) {
      console.error("LendingService.getAll: Error fetching lendings:", error);
      throw error;
    }
  }

  // Helper method to transform DB entity to frontend model
  private transformLendingItem(item: any): Lending {
    console.log("Transforming item:", item);

    // Ensure ID is string type (frontend expects string)
    const id = item.id?.toString() || item.Id?.toString() || "";

    // Convert dates to strings if needed
    const createdDate = item.createdDate || item.CreatedDate;
    const date =
      typeof createdDate === "string"
        ? createdDate
        : new Date(createdDate).toISOString();

    const dueDateValue = item.dueDate || item.DueDate;
    const dueDate =
      typeof dueDateValue === "string"
        ? dueDateValue
        : new Date(dueDateValue).toISOString();

    const lastRepaymentDate = item.lastRepaymentDate || item.LastRepaymentDate;

    // Map the status
    const status = item.status ?? item.Status ?? 1; // Default to active (1)

    return {
      id: id,
      borrowName: item.borrowName || item.BorrowName || "",
      description: item.description || item.Description || "",
      date: date,
      dueDate: dueDate,
      amount:
        typeof item.amount === "number"
          ? item.amount
          : Number(item.Amount) || 0,
      interestRate:
        typeof item.interestRate === "number"
          ? item.interestRate
          : Number(item.InterestRate) || 0,
      status: status,
      amountRepaid:
        typeof item.amountRepaid === "number"
          ? item.amountRepaid
          : Number(item.AmountRepaid) || 0,
      remainingAmount:
        typeof item.remainingAmount === "number"
          ? item.remainingAmount
          : Number(item.amount || item.Amount || 0) -
            Number(item.amountRepaid || item.AmountRepaid || 0),
      calculatedInterest:
        typeof item.calculatedInterest === "number"
          ? item.calculatedInterest
          : 0,
      totalDue:
        typeof item.totalDue === "number"
          ? item.totalDue
          : Number(item.amount || item.Amount || 0) -
            Number(item.amountRepaid || item.AmountRepaid || 0),
      lastRepaymentDate: lastRepaymentDate,
      isOverdue: item.isOverdue ?? false,
    };
  }

  async getById(id: string): Promise<Lending> {
    const response = await apiService.get(
      API_CONFIG.endpoints.lending.getById.replace(":id", id)
    );
    console.log("LendingService.getById: Raw API response:", response);
    return this.transformLendingItem(response);
  }

  async update(id: string, lending: UpdateLendingRequestDto): Promise<void> {
    return apiService.put(
      API_CONFIG.endpoints.lending.update.replace(":id", id),
      lending
    );
  }

  async delete(id: string): Promise<void> {
    return apiService.delete(
      API_CONFIG.endpoints.lending.delete.replace(":id", id)
    );
  }

  async recordPayment(
    id: string,
    payment: RecordRepaymentRequestDto
  ): Promise<number> {
    const response = await apiService.post(
      API_CONFIG.endpoints.lending.recordPayment.replace(":id", id),
      payment
    );
    return response;
  }

  async updateStatus(
    id: string,
    status: ChangeLendingStatusDto
  ): Promise<Lending> {
    const response = await apiService.put(
      API_CONFIG.endpoints.lending.updateStatus.replace(":id", id),
      status
    );
    return response;
  }

  async getSummary(): Promise<LendingSummary> {
    const response = await apiService.get(API_CONFIG.endpoints.lending.summary);
    return response;
  }

  async getOverdue(): Promise<Lending[]> {
    const response = await apiService.get(API_CONFIG.endpoints.lending.overdue);
    return response;
  }

  async processBatchRepayments(
    repayments: BatchRepaymentRequestDto
  ): Promise<BatchRepaymentResponseDto> {
    const response = await apiService.post(
      API_CONFIG.endpoints.lending.batchRepayments,
      repayments
    );
    return response;
  }
}

export const lendingService = new LendingService();
