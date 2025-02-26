import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserProfile from "./pages/UserProfile";
import ManageEarnings from "./pages/ManageEarnings";
import ManageSavings from "./pages/ManageSavings";
import ManageSpending from "./pages/ManageSpending";
import ManageLending from "./pages/ManageLending";
import NotFound from "./pages/NotFound";
import AxiosInterceptorSetup from "./services/axios-interceptor-setup";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <AxiosInterceptorSetup />
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            } />
            <Route path="/manage-earnings" element={
              <ProtectedRoute>
                <ManageEarnings />
              </ProtectedRoute>
            } />
            <Route path="/manage-savings" element={
              <ProtectedRoute>
                <ManageSavings />
              </ProtectedRoute>
            } />
            <Route path="/manage-spending" element={
              <ProtectedRoute>
                <ManageSpending />
              </ProtectedRoute>
            } />
            <Route path="/manage-lending" element={
              <ProtectedRoute>
                <ManageLending />
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
