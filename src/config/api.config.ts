export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  useMockData: true, // Toggle this to false to use real API data
  mockCredentials: {
    username: 'admin',
    password: '123'
  },
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
    auth: {
      login: '/api/auth/login',
      register: '/api/auth/register',
      profile: '/api/auth/profile',
    }
  },
  mockData: {
    transactions: [
      {
        id: "1",
        date: "2024-03-20",
        description: "Savings deposit",
        amount: 1000,
        category: "Savings",
      },
      {
        id: "2",
        date: "2024-03-19",
        description: "Loan payment",
        amount: -500,
        category: "Lending",
      },
      {
        id: "3",
        date: "2024-03-18",
        description: "Grocery shopping",
        amount: -150,
        category: "Spending",
      },
    ],
    chartData: [
      {
        name: "Jan",
        earnings: 5000,
        savings: 1200,
        loans: 800,
        spending: 2400,
      },
      {
        name: "Feb",
        earnings: 5200,
        savings: 1800,
        loans: 700,
        spending: 2100,
      },
      {
        name: "Mar",
        earnings: 5500,
        savings: 2400,
        loans: 600,
        spending: 1900,
      },
      {
        name: "Apr",
        earnings: 5800,
        savings: 2800,
        loans: 500,
        spending: 1800,
      },
      {
        name: "May",
        earnings: 6000,
        savings: 3200,
        loans: 400,
        spending: 1700,
      },
      {
        name: "Jun",
        earnings: 6200,
        savings: 3800,
        loans: 300,
        spending: 1600,
      },
    ],
    auth: {
      token: 'mock-jwt-token',
      user: {
        id: 1,
        username: 'admin',
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com'
      }
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

const handleMockAuth = (username: string, password: string) => {
  const { mockCredentials, mockData } = API_CONFIG;
  if (username === mockCredentials.username && password === mockCredentials.password) {
    return Promise.resolve(mockData.auth);
  }
  return Promise.reject(new Error('Invalid credentials'));
};

export const checkMockAuth = () => {
  if (API_CONFIG.useMockData) {
    const { username, password } = API_CONFIG.mockCredentials;
    handleMockAuth(username, password)
      .then((response) => {
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('user', JSON.stringify(response.user));
      })
      .catch(() => {
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('user');
      });
  }
};

if (API_CONFIG.useMockData) {
  checkMockAuth();
}
