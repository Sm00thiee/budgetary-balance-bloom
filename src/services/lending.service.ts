
import { api } from './api';
import { API_CONFIG } from '@/config/api.config';

export const lendingService = {
  getAll: () => api.get(API_CONFIG.endpoints.lending.list),
  
  create: (data: {
    borrowerName: string;
    description: string;
    amount: number;
    date: string;
    dueDate: string;
    status: 'paid' | 'pending' | 'overdue';
  }) => api.post(API_CONFIG.endpoints.lending.create, data),
  
  update: (id: string, data: {
    borrowerName?: string;
    description?: string;
    amount?: number;
    date?: string;
    dueDate?: string;
    status?: 'paid' | 'pending' | 'overdue';
  }) => api.put(API_CONFIG.endpoints.lending.update, data, { id }),
  
  updateStatus: (id: string, status: 'paid' | 'pending' | 'overdue') => 
    api.put(API_CONFIG.endpoints.lending.updateStatus, { status }, { id }),
  
  delete: (id: string) => api.delete(API_CONFIG.endpoints.lending.delete, { id }),
};
