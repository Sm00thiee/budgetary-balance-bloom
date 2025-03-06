import { apiService } from "./api";
import { API_CONFIG } from "@/config/api.config";

export interface Earning {
  id: number;
  createdDate: string;
  lastUpdatedDate: string;
  userId: number;
  amount: number;
  description: string;
  category: string;
  date: string;
}

export const earningsService = {
  getAll: async () => {
    console.log(
      "earningsService.getAll: Fetching earnings from",
      API_CONFIG.endpoints.earnings.list
    );
    try {
      const response = await apiService.get<Earning[]>(
        API_CONFIG.endpoints.earnings.list
      );
      console.log("earningsService.getAll: Response received:", response);

      // Check response type
      console.log(
        "earningsService.getAll: Response type:",
        Array.isArray(response) ? "Array" : typeof response
      );

      // If response is array, log first item
      if (Array.isArray(response) && response.length > 0) {
        console.log("earningsService.getAll: First item:", response[0]);
      }

      return response;
    } catch (error) {
      console.error("earningsService.getAll: Error fetching earnings:", error);
      throw error;
    }
  },

  create: (data: {
    description: string;
    amount: number;
    date: string;
    category: string;
  }) => apiService.post<Earning>(API_CONFIG.endpoints.earnings.create, data),

  update: (
    id: string,
    data: {
      description?: string;
      amount?: number;
      date?: string;
      category?: string;
    }
  ) => {
    // Make sure id is valid
    if (!id) {
      console.error("Invalid ID for update:", id);
      return Promise.reject(new Error("Invalid ID for update"));
    }

    // Format the date properly if needed
    const formattedData = {
      ...data,
    };

    // Ensure date is in a valid format (YYYY-MM-DDT00:00:00)
    if (formattedData.date) {
      if (!formattedData.date.includes("T")) {
        formattedData.date = `${formattedData.date}T00:00:00`;
      }
    }

    // Ensure amount is a number
    if (formattedData.amount !== undefined) {
      if (typeof formattedData.amount === "string") {
        formattedData.amount = parseFloat(formattedData.amount);
      }

      // Verify amount is a valid number
      if (isNaN(formattedData.amount)) {
        console.error("Invalid amount for update:", formattedData.amount);
        return Promise.reject(new Error("Invalid amount for update"));
      }
    }

    console.log("Updating earning with formatted data:", formattedData);
    const url = API_CONFIG.endpoints.earnings.update.replace(":id", id);
    return apiService.put<Earning>(url, formattedData);
  },

  delete: (id: string) => {
    const url = API_CONFIG.endpoints.earnings.delete.replace(":id", id);
    return apiService.delete(url);
  },
};
