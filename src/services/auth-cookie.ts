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
  
  // When user logs in, also update localStorage
  if (value) {
    localStorage.setItem('isAuthenticated', 'true');
  }
};

/**
 * Reset the auth state
 * This is called during logout
 */
export const resetAuth = () => {
  console.log('Resetting auth state');
  hasUserLoggedIn = false;
  localStorage.removeItem('isAuthenticated');
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
  
  // 2. Check localStorage flag
  const isAuthenticatedInStorage = localStorage.getItem('isAuthenticated') === 'true';
  if (isAuthenticatedInStorage) {
    console.log('User is authenticated according to localStorage');
    return true;
  }
  
  // In a real-world scenario with HTTP-only cookies, we'd need to rely on:
  // - Server responses to determine if we're still authenticated
  // - The 401 interceptor to detect when auth fails
  
  console.log('Auth cookie inference:', {
    userLoggedIn: hasUserLoggedIn,
    isAuthenticatedInStorage
  });
  
  return false;
}; 