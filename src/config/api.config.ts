
export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  endpoints: {
    earnings: {
      list: '/api/earnings',
      create: '/api/earnings',
      update: '/api/earnings/:id',
      delete: '/api/earnings/:id',
    },
    savings: {
      list: '/api/savings',
      create: '/api/savings',
      update: '/api/savings/:id',
      delete: '/api/savings/:id',
    },
    lending: {
      list: '/api/lending',
      create: '/api/lending',
      update: '/api/lending/:id',
      delete: '/api/lending/:id',
      updateStatus: '/api/lending/:id/status',
    },
    spending: {
      list: '/api/spending',
      create: '/api/spending',
      update: '/api/spending/:id',
      delete: '/api/spending/:id',
    },
    dashboard: {
      summary: '/api/dashboard/summary',
      transactions: '/api/dashboard/transactions',
      chart: '/api/dashboard/chart',
    },
  },
};
