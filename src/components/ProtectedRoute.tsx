import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  // Use auth context to check if user is authenticated
  const { isAuthenticated } = useAuth();
  
  // For cookie-based authentication, we only need to check isAuthenticated
  // The server will handle token expiration
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
