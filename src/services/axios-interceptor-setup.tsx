import { useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import axiosInstance, { setAuthErrorHandler } from './axios-interceptor';

/**
 * Component that sets up Axios interceptors with access to the auth context
 * This needs to be a component so it can access the auth context via the useAuth hook
 */
const AxiosInterceptorSetup = () => {
  const { logout } = useAuth();
  const isSetupComplete = useRef(false);

  useEffect(() => {
    // Only set up the interceptors once
    if (isSetupComplete.current) {
      return;
    }

    console.log('Setting up Axios interceptor auth handler');

    // Set the auth error handler that will be called by the axios interceptor
    setAuthErrorHandler((message) => {
      console.log('Auth error handler called with message:', message || 'No message provided');
      logout(message || 'Your session has expired. Please log in again.');
    });

    isSetupComplete.current = true;
    console.log('Axios interceptor setup complete');

    // No cleanup needed as we want the interceptors to remain active for the app's lifetime
  }, [logout]);

  // This component doesn't render anything
  return null;
};

export default AxiosInterceptorSetup; 