
import { api } from './api';
import { API_CONFIG } from '@/config/api.config';

export const earningsService = {
  getAll: () => api.get(API_CONFIG.endpoints.earnings.list),
  
  create: (data: {
    description: string;
    amount: number;
    date: string;
    category: string;
  }) => api.post(API_CONFIG.endpoints.earnings.create, data),
  
  update: (id: string, data: {
    description?: string;
    amount?: number;
    date?: string;
    category?: string;
  }) => api.put(API_CONFIG.endpoints.earnings.update, data, { id }),
  
  delete: (id: string) => api.delete(API_CONFIG.endpoints.earnings.delete, { id }),
};
