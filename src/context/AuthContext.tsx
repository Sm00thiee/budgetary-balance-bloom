import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { api } from '@/services/api';
import { API_CONFIG } from '@/config/api.config';
import { resetAuth } from '@/services/auth-cookie';

interface User {
  id?: string;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (authMethod: string, userData: User) => void;
  logout: (message?: string) => void;
  isTokenExpired: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // On mount, check if user is in localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedIsAuthenticated = localStorage.getItem('isAuthenticated');

    if (storedUser && storedIsAuthenticated === 'true') {
      // With cookies, we trust the browser to handle token expiration
      // So we just restore the user session
      try {
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
        console.log('User session restored from localStorage');
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        performLogout('Authentication error. Please log in again.');
      }
    }
  }, []);

  // Perform the actual logout process
  const performLogout = async (message?: string) => {
    try {
      // Reset the auth state
      resetAuth();
      
      // Call the server to invalidate the session and clear the cookie server-side
      // This is the most reliable way to clear secure HTTP-only cookies
      console.log('Calling server-side logout');
      await api.post(API_CONFIG.endpoints.auth.logout, {})
        .catch(error => {
          // Even if the server logout fails, continue with client-side logout
          console.warn('Server logout failed, continuing with client-side logout:', error);
        });
    } catch (error) {
      console.error('Error during server logout:', error);
    }

    // Clear auth data from localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    
    // Attempt to clear the auth cookie by setting an expired version
    try {
      // Try different cookie clearing approaches to handle various scenarios
      document.cookie = 'jwt.mytoken=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;';
      document.cookie = 'jwt.mytoken=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=' + window.location.hostname + ';';
      
      // For secure cookies, also try with secure and samesite attributes
      document.cookie = 'jwt.mytoken=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; secure; samesite=none;';
      
      console.log('Attempted to clear auth cookies');
    } catch (error) {
      console.error('Error clearing auth cookies:', error);
    }
    
    // Reset state
    setUser(null);
    setIsAuthenticated(false);
    
    // Show toast message if provided
    if (message) {
      toast({
        title: 'Authentication',
        description: message,
      });
    }
    
    // Redirect to login page
    navigate('/login');
  };

  // Check if token is expired - for cookie-based auth, we rely on the server to check
  // This is kept for API compatibility with the rest of the app
  const isTokenExpired = (): boolean => {
    // For cookie-based auth, we can't check directly, so we assume not expired
    // The server will reject requests with expired cookies
    return false;
  };

  // Login function - stores user data
  const login = (authMethod: string, userData: User) => {
    try {
      console.log('Login function called with auth method:', authMethod);
      
      if (!userData) {
        throw new Error('No user data provided');
      }
      
      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('isAuthenticated', 'true');
      
      // Update state
      setUser(userData);
      setIsAuthenticated(true);
      
      console.log('Login successful, auth state updated');
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Login Error',
        description: error instanceof Error ? error.message : 'Failed to login',
      });
      throw error;
    }
  };

  // The context value to be provided
  const contextValue: AuthContextType = {
    user,
    isAuthenticated,
    login,
    logout: performLogout,
    isTokenExpired,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for using the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;