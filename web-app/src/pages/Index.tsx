import { useUser } from "@clerk/clerk-react";
import DoctorDashboard from "@/components/dashboard/DoctorDashboard";
import LoginForm from "@/components/auth/LoginForm";

const Index = () => {
  const { isSignedIn, user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading VivaMoms Portal...</p>
        </div>
      </div>
    );
  }
  if (!isSignedIn) {
    return <LoginForm />;
  }
  return <DoctorDashboard user={user} />;
};

export default Index;
