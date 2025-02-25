import { api } from './api';
import { API_CONFIG } from '@/config/api.config';

export interface Saving {
  id: number;
  userId: number;
  amount: number; // Current balance
  goal: number;   // Savings goal amount
  name?: string;  // Optional name for the savings account
  description?: string; // Optional description
}

// For create operations - required fields
export interface CreateSavingsRequest {
  goal: number;
  amount: number;
  name?: string;
  description?: string;
}

// For update operations - all fields optional
export interface UpdateSavingsRequest {
  goal?: number;
  amount?: number;
  name?: string;
  description?: string;
}

interface DepositWithdrawRequest {
  savingsId: number;
  amount: number;
}

export const savingsService = {
  getAll: async () => {
    try {
      const response = await api.get(API_CONFIG.endpoints.savings.list);
      console.log('Savings API response:', response);
      return response || [];
    } catch (error) {
      console.error('Error fetching savings accounts:', error);
      throw new Error('Failed to load savings accounts. Please try again.');
    }
  },
  
  create: (data: CreateSavingsRequest) => 
    api.post(API_CONFIG.endpoints.savings.create, data),
  
  update: (id: number, data: UpdateSavingsRequest) => {
    const payload = { ...data, id };
    return api.post(API_CONFIG.endpoints.savings.update, payload);
  },
    
  delete: (id: number) => 
    api.post(API_CONFIG.endpoints.savings.delete, { id }),
    
  deposit: (data: DepositWithdrawRequest) =>
    api.post('/api/savings/deposit', data),
    
  withdraw: (data: DepositWithdrawRequest) =>
    api.post('/api/savings/withdraw', data),
};
