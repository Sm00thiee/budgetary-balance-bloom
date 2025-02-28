export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:5193",
  useMockData: false,
  endpoints: {
    earnings: {
      list: "/api/earnings",
      create: "/api/earnings",
      update: "/api/earnings/:id",
      delete: "/api/earnings/:id",
    },
    savings: {
      list: "/api/savings/getsavings",
      create: "/api/savings/createsavings",
      update: "/api/savings/updatesavings",
      delete: "/api/savings",
    },
    lending: {
      find: "/api/lendings/find",
      create: "/api/lendings",
      update: "/api/lendings/:id",
      delete: "/api/lendings/:id",
      getById: "/api/lendings/:id",
      updateStatus: "/api/lendings/:id/status",
      recordPayment: "/api/lendings/:id/repayments",
      summary: "/api/lendings/summary",
      overdue: "/api/lendings/overdue",
    },
    borrowing: {
      find: "/api/borrowings/find",
      create: "/api/borrowings",
      update: "/api/borrowings/:id",
      delete: "/api/borrowings/:id",
      getById: "/api/borrowings/:id",
      updateStatus: "/api/borrowings/:id/status",
      recordPayment: "/api/borrowings/:id/repayments",
      summary: "/api/borrowings/summary",
      overdue: "/api/borrowings/overdue",
    },
    spending: {
      list: "/api/spendings/getRecords",
      create: "/api/spendings/create",
      update: "/api/spendings/update",
      delete: "/api/spendings/delete",
      categories: "/api/spendings/categories",
    },
    dashboard: {
      summary: "/api/dashboard/summary",
      transactions: "/api/dashboard/transactions",
      chart: "/api/dashboard/chart",
    },
    auth: {
      login: "/api/sessions/authenticate",
      register: "/api/user/register",
      profile: "/api/auth/profile",
      logout: "/api/sessions/logout",
    },
  },
  dtos: {
    savings: {
      create: {
        userId: 0,
        goal: 0,
        amount: 0,
      },
    },
    spending: {
      create: {
        issueDate: new Date().toISOString(),
        amount: 0,
        description: "",
      },
    },
  },
};
