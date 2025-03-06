import axios, { AxiosResponse } from "axios";
import { API_CONFIG } from "@/config/api.config";

const api = axios.create({
  baseURL: API_CONFIG.baseUrl,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

const formatUrl = (url: string, params: Record<string, string> = {}) => {
  let formattedUrl = url;
  Object.keys(params).forEach((key) => {
    formattedUrl = formattedUrl.replace(`:${key}`, params[key]);
  });
  return formattedUrl;
};

export const apiService = {
  get: async <T = any>(url: string): Promise<T> => {
    try {
      console.log(`apiService.get: URL: ${url}`);
      const response = await api.get<T>(url);
      console.log(`apiService.get: Response for ${url}:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`apiService.get: Error for ${url}:`, error);
      throw error;
    }
  },

  post: async <T = any>(url: string, data?: any): Promise<T> => {
    console.log(`apiService.post: URL: ${url}, Data:`, data);
    try {
      const response = await api.post<T>(url, data);
      console.log(`apiService.post: Response for ${url}:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`apiService.post: Error for ${url}:`, error);
      throw error;
    }
  },

  put: async <T = any>(url: string, data: any): Promise<T> => {
    console.log(`apiService.put: URL: ${url}, Data:`, data);
    try {
      const response = await api.put<T>(url, data);
      console.log(`apiService.put: Response for ${url}:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`apiService.put: Error for ${url}:`, error);
      if (axios.isAxiosError(error)) {
        console.error("API Error status:", error.response?.status);
        console.error("API Error data:", error.response?.data);
        console.error("API Error headers:", error.response?.headers);
        console.error("API Error config:", {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers,
          data: error.config?.data,
        });
      }
      throw error;
    }
  },

  delete: async <T = any>(url: string): Promise<T> => {
    console.log(`apiService.delete: URL: ${url}`);
    try {
      const response = await api.delete<T>(url);
      console.log(`apiService.delete: Response for ${url}:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`apiService.delete: Error for ${url}:`, error);
      throw error;
    }
  },
};

export { api, formatUrl };
