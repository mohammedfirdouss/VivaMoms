import { useState, useEffect } from "react";
import DoctorDashboard from "@/components/dashboard/DoctorDashboard";
import LoginForm from "@/components/auth/LoginForm";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Remove all supabase usage and related logic, replace with comments or placeholders as needed

  const handleLogin = (userData: any) => {
    console.log('Login handler called with:', userData);
    // This is now handled by the auth state change listener
    // but we keep this for backward compatibility
    setCurrentUser(userData);
    setIsLoggedIn(true);
  };

  const handleLogout = async () => {
    // Remove all supabase usage and related logic, replace with comments or placeholders as needed
    // ... existing code ...
  };

  useEffect(() => {
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading VivaMoms Portal...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return <DoctorDashboard user={currentUser} onLogout={handleLogout} />;
};

export default Index;
