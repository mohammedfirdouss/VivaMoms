import { useState, useEffect } from "react";
import DoctorDashboard from "@/components/DoctorDashboard";
import LoginForm from "@/components/LoginForm";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  
  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        if (event === 'SIGNED_IN' && session?.user) {
          try {
            const { data: profile, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (error) {
              console.error('Error fetching profile after sign in:', error);
              toast({
                title: "Error",
                description: "Failed to load user profile",
                variant: "destructive",
              });
              await supabase.auth.signOut();
            } else if (profile && profile.role === 'doctor') {
              const userData = {
                id: session.user.id,
                email: session.user.email,
                ...profile
              };
              setCurrentUser(userData);
              setIsLoggedIn(true);
              toast({
                title: "Welcome",
                description: `Welcome back, Dr. ${profile.first_name}!`,
              });
            } else {
              toast({
                title: "Access Denied",
                description: "This portal is only available for doctors",
                variant: "destructive",
              });
              await supabase.auth.signOut();
            }
          } catch (error) {
            console.error('Error processing sign in:', error);
            toast({
              title: "Error",
              description: "An error occurred during sign in",
              variant: "destructive",
            });
            await supabase.auth.signOut();
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out');
          setCurrentUser(null);
          setIsLoggedIn(false);
        }
        
        setIsLoading(false);
      }
    );

    // THEN check for existing session
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          console.log('Session found for user:', session.user.id);
          // This will be handled by the auth state change listener above
        } else {
          console.log('No active session found');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error checking user session:', error);
        setCurrentUser(null);
        setIsLoggedIn(false);
        setIsLoading(false);
      }
    };

    checkUser();

    return () => subscription.unsubscribe();
  }, [toast]);

  const handleLogin = (userData: any) => {
    console.log('Login handler called with:', userData);
    // This is now handled by the auth state change listener
    // but we keep this for backward compatibility
    setCurrentUser(userData);
    setIsLoggedIn(true);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setCurrentUser(null);
      setIsLoggedIn(false);
      toast({
        title: "Logged Out",
        description: "You have been securely logged out",
      });
    } catch (error) {
      console.error('Error during logout:', error);
      toast({
        title: "Error",
        description: "An error occurred during logout",
        variant: "destructive",
      });
    }
  };

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
