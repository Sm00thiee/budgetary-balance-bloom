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
    const response = await axios.get(formatUrl(url, params), {
      withCredentials: true,
      headers: {
        'Accept': 'application/json',
      },
    });
    return response.data;
  },

  post: async (url: string, data: any, params: Record<string, string> = {}) => {
    const response = await axios.post(formatUrl(url, params), data, {
      withCredentials: false,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    return response.data;
  },

  put: async (url: string, data: any, params: Record<string, string> = {}) => {
    const response = await axios.put(formatUrl(url, params), data, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    return response.data;
  },

  delete: async (url: string, params: Record<string, string> = {}) => {
    const response = await axios.delete(formatUrl(url, params), {
      withCredentials: true,
      headers: {
        'Accept': 'application/json',
      },
    });
    return response.data;
  },
};
