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
  }) => {
    const url = API_CONFIG.endpoints.earnings.update.replace(':id', id);
    return api.put(url, data);
  },
  
  delete: (id: string) => {
    const url = API_CONFIG.endpoints.earnings.delete.replace(':id', id);
    return api.delete(url);
  },
};
