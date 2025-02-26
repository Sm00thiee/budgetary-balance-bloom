import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  // Use auth context instead of checking localStorage directly
  const { isAuthenticated, isTokenExpired } = useAuth();
  
  // Check if user is authenticated and token is not expired
  if (!isAuthenticated || isTokenExpired()) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
