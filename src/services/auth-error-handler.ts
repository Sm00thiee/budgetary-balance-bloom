/**
 * This file is no longer needed as the auth error handler is now directly integrated 
 * into the axios-interceptor.ts file for simplicity.
 * 
 * The auth error handler is now set using the setAuthErrorHandler function exported from axios-interceptor.ts.
 */

// Just a placeholder export to avoid import errors in any existing code
export const authErrorHandler = (message?: string) => {
  console.warn('Deprecated authErrorHandler called, this should be replaced with the handler from axios-interceptor');
}; 