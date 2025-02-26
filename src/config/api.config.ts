export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5193',
  useMockData: false,
  endpoints: {
    earnings: {
      list: '/api/earnings',
      create: '/api/earnings',
      update: '/api/earnings/:id',
      delete: '/api/earnings/:id',
    },
    savings: {
      list: '/api/savings/getsavings',
      create: '/api/savings/createsavings',
      update: '/api/savings/updatesavings',
      delete: '/api/savings',
    },
    lending: {
      find: '/api/lendings',
      create: '/api/lendings',
      update: '/api/lendings/:id',
      delete: '/api/lendings/:id',
      updateStatus: '/api/lending/:id/status',
    },
    spending: {
      list: '/api/spendings/getRecords',
      create: '/api/spendings/create',
      update: '/api/spendings/update',
      delete: '/api/spendings/delete',
      categories: '/api/spendings/categories',
    },
    dashboard: {
      summary: '/api/dashboard/summary',
      transactions: '/api/dashboard/transactions',
      chart: '/api/dashboard/chart',
    },
    auth: {
      login: '/api/sessions/authenticate',
      register: '/api/user/register',
      profile: '/api/auth/profile',
    }
  },
  dtos: {
    savings: {
      create: {
        userId: 0,
        goal: 0,
        amount: 0,
      }
    },
    spending: {
      create: {
        issueDate: new Date().toISOString(),
        amount: 0,
        description: ''
      }
    }
  }
};

