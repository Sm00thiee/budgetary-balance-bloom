
import { api } from './api';
import { API_CONFIG } from '@/config/api.config';

export const savingsService = {
  getAll: () => api.get(API_CONFIG.endpoints.savings.list),
  
  create: (data: {
    description: string;
    amount: number;
    date: string;
    goal: string;
    type: 'deposit' | 'withdrawal';
  }) => api.post(API_CONFIG.endpoints.savings.create, data),
  
  update: (id: string, data: {
    description?: string;
    amount?: number;
    date?: string;
    goal?: string;
    type?: 'deposit' | 'withdrawal';
  }) => api.put(API_CONFIG.endpoints.savings.update, data, { id }),
  
  delete: (id: string) => api.delete(API_CONFIG.endpoints.savings.delete, { id }),
};
