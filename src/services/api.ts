
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
    const response = await fetch(formatUrl(url, params), {
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Network response was not ok');
    return response.json();
  },

  post: async (url: string, data: any, params: Record<string, string> = {}) => {
    const response = await fetch(formatUrl(url, params), {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Network response was not ok');
    return response.json();
  },

  put: async (url: string, data: any, params: Record<string, string> = {}) => {
    const response = await fetch(formatUrl(url, params), {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Network response was not ok');
    return response.json();
  },

  delete: async (url: string, params: Record<string, string> = {}) => {
    const response = await fetch(formatUrl(url, params), {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Network response was not ok');
    return response.json();
  },
};
