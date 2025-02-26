// We need a way to track if a user has successfully logged in
// since HTTP-only cookies can't be directly accessed by JavaScript
let hasUserLoggedIn = false;

/**
 * Set the user logged in state
 * This is called after a successful login
 */
export const setUserLoggedIn = (value: boolean) => {
  console.log('Setting user logged in state:', value);
  hasUserLoggedIn = value;
};

/**
 * Reset the auth state
 * This is called during logout
 */
export const resetAuth = () => {
  console.log('Resetting auth state');
  hasUserLoggedIn = false;
};

/**
 * Helper to check if the auth cookie exists
 * Since the cookie is HTTP-only, we can't directly check for it with JavaScript
 * Instead, we'll use a combination of methods to infer its presence
 */
export const hasAuthCookie = (): boolean => {
  // For HTTP-only cookies, we can't directly check if they exist
  // We need to use indirect methods:
  
  // 1. Check if the user has successfully logged in during this session
  if (hasUserLoggedIn) {
    console.log('User has logged in during this session');
    return true;
  }
  
  // 2. Check if there are any visible cookies (though the JWT might be HTTP-only)
  const hasSomeCookies = document.cookie.length > 0;
  console.log('Has some cookies:', hasSomeCookies);
  
  // 3. Check localStorage flag as a last resort
  const isAuthenticatedInStorage = localStorage.getItem('isAuthenticated') === 'true';
  
  // In a real-world scenario with HTTP-only cookies, we'd need to rely on:
  // - Server responses to determine if we're still authenticated
  // - The 401 interceptor to detect when auth fails
  
  console.log('Auth cookie inference:', {
    userLoggedIn: hasUserLoggedIn,
    hasSomeCookies,
    isAuthenticatedInStorage
  });
  
  // For development, we might want to assume the cookie exists if the user is marked as authenticated
  // For production, a more robust approach would be needed
  const inDevelopment = process.env.NODE_ENV === 'development';
  return inDevelopment ? isAuthenticatedInStorage : (hasUserLoggedIn || hasSomeCookies);
}; 