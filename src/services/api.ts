import axios from "axios";
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
  get: async <T = any>(url: string) => {
    const response = await api.get<T>(url);
    return response.data;
  },

  post: async <T = any>(url: string, data?: any) => {
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

  put: async <T = any>(url: string, data: any) => {
    const response = await api.put<T>(url, data);
    return response.data;
  },

  delete: async <T = any>(url: string) => {
    const response = await api.delete<T>(url);
    return response.data;
  },
};

export { api, formatUrl };
