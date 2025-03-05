import axios, { AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_CONFIG } from '@/config/api.config';
import { hasAuthCookie } from './auth-cookie';

// Type for the auth error handler function
type AuthErrorHandler = (message?: string) => void;

// Default error handler just logs to console
let authErrorHandler: AuthErrorHandler = (message) => {
  console.error('Authentication error:', message || 'No message provided');
};

// Function to set the auth error handler
export const setAuthErrorHandler = (handler: AuthErrorHandler) => {
  console.log('Setting auth error handler');
  authErrorHandler = handler;
};

// Create Axios instance with base URL
const axiosInstance = axios.create({
  baseURL: API_CONFIG.baseUrl,
  withCredentials: true, // Important: This allows cookies to be sent with requests
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Skip auth check for authentication endpoints
    const isAuthEndpoint = 
      config.url?.includes('/api/sessions/authenticate') || 
      config.url?.includes('/api/user/register');
      
    if (isAuthEndpoint) {
      console.log('Skipping auth check for auth endpoint:', config.url);
      return config;
    }
    
    // Add correlation ID to help trace requests in logs
    const correlationId = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    console.log(`Request [${correlationId}] to ${config.url} - checking auth`);
    
    // Check authentication status - rely on the hasAuthCookie helper
    const isAuthenticated = hasAuthCookie();
    
    console.log(`Auth status [${correlationId}]:`, { 
      authenticated: isAuthenticated,
      url: config.url
    });
    
    // For non-auth endpoints, check if user is authenticated
    if (!isAuthenticated) {
      console.log(`Authentication failed [${correlationId}]:`, {
        url: config.url
      });
      
      // User is not authenticated, handle auth error and reject the request
      authErrorHandler('You are not authenticated. Please log in.');
      return Promise.reject(new Error('Not authenticated'));
    }
    
    console.log(`Request authenticated [${correlationId}], proceeding`);
    
    // Authentication is handled via cookies, no need to set Authorization header
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 Unauthorized responses
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      console.log('Received 401 Unauthorized response - checking cookies');
      
      // Check if the auth cookie is present
      const hasCookie = hasAuthCookie();
      console.log('Auth cookie present:', hasCookie);
      
      // Determine the appropriate error message
      let errorMessage = 'Authentication failed. Please log in again.';
      
      if (!hasCookie) {
        errorMessage = 'Your session has expired. Please log in again.';
      }
      
      // If the error response contains a more specific message, use it
      if (error.response.data && typeof error.response.data === 'object') {
        const data = error.response.data as any;
        if (data.message) {
          errorMessage = data.message;
        }
      }
      
      // Call the auth error handler with the error message
      authErrorHandler(errorMessage);
    }
    
    // For all errors, pass them through
    return Promise.reject(error);
  }
);

export default axiosInstance;