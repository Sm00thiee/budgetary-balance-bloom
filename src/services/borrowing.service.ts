import { api } from './api';
import { API_CONFIG } from '@/config/api.config';

interface OrderByDto {
  fieldName: string;
  isAscending: boolean;
}

interface GetBorrowingRequestDto {
  lenderName?: string;
  fromDate?: string;
  toDate?: string;
  minAmount?: number;
  maxAmount?: number;
  isOverdueOnly?: boolean;
  status?: number;
  pageNumber?: number;
  itemsPerPage?: number;
  orderBy?: OrderByDto;
}

interface RepaymentDto {
  amount: number;
  note?: string;
}

export const borrowingService = {
  getAll: (params?: GetBorrowingRequestDto) => api.post(API_CONFIG.endpoints.borrowing.find, params),
  
  create: (data: {
    lenderName: string;
    description: string;
    amount: number;
    date?: string;
    dueDate: string;
    interestRate?: number;
  }) => api.post(API_CONFIG.endpoints.borrowing.create, data),
  
  update: (id: string, data: {
    lenderName?: string;
    description?: string;
    amount?: number;
    dueDate?: string;
    interestRate?: number;
  }) => api.patch(`${API_CONFIG.endpoints.borrowing.update.replace(':id', id)}`, data),
  
  updateStatus: (id: string, status: number) => 
    api.patch(`${API_CONFIG.endpoints.borrowing.updateStatus.replace(':id', id)}`, { status }),
  
  delete: (id: string) => api.delete(API_CONFIG.endpoints.borrowing.delete.replace(':id', id)),
  
  recordRepayment: (id: string, data: RepaymentDto) => 
    api.post(`${API_CONFIG.endpoints.borrowing.recordRepayment.replace(':id', id)}`, data),
    
  getSummary: () => api.get(API_CONFIG.endpoints.borrowing.summary),
  
  getOverdue: () => api.get(API_CONFIG.endpoints.borrowing.overdue),
  
  getById: (id: string) => api.get(API_CONFIG.endpoints.borrowing.getById.replace(':id', id))
}; 