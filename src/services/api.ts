
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
    const response = await fetch(formatUrl(url, params));
    if (!response.ok) throw new Error('Network response was not ok');
    return response.json();
  },

  post: async (url: string, data: any, params: Record<string, string> = {}) => {
    const response = await fetch(formatUrl(url, params), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Network response was not ok');
    return response.json();
  },

  put: async (url: string, data: any, params: Record<string, string> = {}) => {
    const response = await fetch(formatUrl(url, params), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Network response was not ok');
    return response.json();
  },

  delete: async (url: string, params: Record<string, string> = {}) => {
    const response = await fetch(formatUrl(url, params), {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Network response was not ok');
    return response.json();
  },
};
