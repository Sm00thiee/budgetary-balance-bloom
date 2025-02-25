import axios from 'axios';
import { API_CONFIG } from "@/config/api.config";

const formatUrl = (url: string, params: Record<string, string> = {}) => {
  let formattedUrl = url;
  Object.keys(params).forEach(key => {
    formattedUrl = formattedUrl.replace(`:${key}`, params[key]);
  });
  return `${API_CONFIG.baseUrl}${formattedUrl}`;
};

export const api = {
  get: async (url: string, params: Record<string, string> = {}) => {
    try {
      console.log(`API GET request to: ${formatUrl(url, params)}`);
      const response = await axios.get(formatUrl(url, params), {
        withCredentials: true,
        headers: {
          'Accept': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error(`GET request to ${url} failed:`, error);
      if (axios.isAxiosError(error)) {
        // More detailed error information for debugging
        const statusCode = error.response?.status;
        const responseData = error.response?.data;
        console.error(`Status: ${statusCode}, Response:`, responseData);
        throw new Error(responseData?.message || error.message || 'API request failed');
      }
      throw error;
    }
  },

  post: async (url: string, data: any, params: Record<string, string> = {}) => {
    try {
      const response = await axios.post(formatUrl(url, params), data, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error(`POST request to ${url} failed:`, error);
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || error.message || 'API request failed');
      }
      throw error;
    }
  },

  put: async (url: string, data: any, params: Record<string, string> = {}) => {
    try {
      const response = await axios.put(formatUrl(url, params), data, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error(`PUT request to ${url} failed:`, error);
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || error.message || 'API request failed');
      }
      throw error;
    }
  },

  delete: async (url: string, params: Record<string, string> = {}) => {
    try {
      const response = await axios.delete(formatUrl(url, params), {
        withCredentials: true,
        headers: {
          'Accept': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error(`DELETE request to ${url} failed:`, error);
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || error.message || 'API request failed');
      }
      throw error;
    }
  },
};
