import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { LogIn } from "lucide-react";
import { API_CONFIG } from "@/config/api.config";
import { api } from "@/services/api";
import { setUserLoggedIn } from '@/services/auth-cookie';
import { useAuth } from "@/context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await api.post(API_CONFIG.endpoints.auth.login, {
        Username: formData.username,
        Password: formData.password,
      });
      
      console.log('Login successful - JWT cookie should be set');
      
      const hasCookie = document.cookie.includes('jwt.mytoken');
      console.log('Cookies present:', document.cookie ? 'Yes' : 'No');
      console.log('JWT cookie found:', hasCookie);
      
      if (!hasCookie) {
        console.warn('Warning: JWT cookie not detected after login');
      }
      
      // Set the user logged in state for our auth check
      setUserLoggedIn(true);
      
      // Since we don't get user data from the response, create a minimal user object
      const userData = {
        username: formData.username,
        // Add any other default fields needed
      };
      
      // Call login with cookie-auth method and basic user data
      login('cookie-auth', userData);
      
      toast({
        title: "Success",
        description: "Successfully logged in",
      });
      
      // Small delay to ensure everything is set before navigating
      setTimeout(() => {
        navigate("/");
      }, 100);
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Error",
        description: "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md animate-fade-in">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl animate-slide-up">Welcome Back</CardTitle>
          <CardDescription className="animate-slide-up delay-100">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2 animate-slide-up delay-200">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="johndoe"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
              />
            </div>
            <div className="space-y-2 animate-slide-up delay-300">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 animate-slide-up delay-400">
            <Button type="submit" className="w-full" disabled={isLoading}>
              <LogIn className="mr-2 h-4 w-4" />
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-primary hover:underline font-medium"
              >
                Sign up
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Login;
