import { api } from './api';
import { API_CONFIG } from '@/config/api.config';

export const financialOverviewService = {
  getOverview: () => api.get(API_CONFIG.financialOverview.overview),
}; 