import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/card";
import { Button } from "@/components/shared/button";
import { Input } from "@/components/shared/input";
import { Label } from "@/components/shared/label";
import { Alert, AlertDescription } from "@/components/shared/alert";
import { Shield, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { securityService } from "@/utils/security";
import { useLocalization } from "@/utils/localization";
import LanguageSelector from "@/components/dashboard/LanguageSelector";
import PregnantMomIcon from "@/components/shared/PregnantMomIcon";
import OfflineSync from "@/components/shared/OfflineSync";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { UserButton, useSignIn } from "@clerk/clerk-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/shared/tooltip";
import { Toaster } from "@/components/shared/toaster";
import { Toaster as Sonner } from "@/components/shared/sonner";
import { BrowserRouter, Routes, Route } from "react-router-dom";

const LoginForm = () => {
  const { signIn, setActive } = useSignIn();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const { toast } = useToast();
  const { t } = useLocalization();

  const validateForm = () => {
    if (!securityService.validateEmail(email)) {
      toast({
        title: t('error'),
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return false;
    }

    if (isSignUp) {
      const passwordValidation = securityService.validatePassword(password);
      if (!passwordValidation.isValid) {
        setPasswordErrors(passwordValidation.errors);
        return false;
      }
      
      if (!firstName.trim() || !lastName.trim()) {
        toast({
          title: t('error'),
          description: "First name and last name are required",
          variant: "destructive",
        });
        return false;
      }

      if (!licenseNumber.trim()) {
        toast({
          title: t('error'),
          description: "Medical license number is required",
          variant: "destructive",
        });
        return false;
      }

      if (!specialization.trim()) {
        toast({
          title: t('error'),
          description: "Specialization is required",
          variant: "destructive",
        });
        return false;
      }
    }

    setPasswordErrors([]);
    return true;
  };

  const handleLogin = async (email, password) => {
    const result = await signIn.create({ identifier: email, password });
    if (result.status === "complete") {
      await setActive({ session: result.createdSessionId });
      // User is now signed in, Convex will recognize them
    } else {
      // Handle errors
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    await handleLogin(email, password);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <PregnantMomIcon className="h-12 w-12 text-blue-600 mr-2 animate-pulse" />
              <div className="absolute -top-1 -right-1 h-4 w-4 bg-green-400 rounded-full animate-bounce"></div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              VivaMoms
            </h1>
          </div>
          <p className="text-gray-600 text-lg font-medium">Doctor Portal</p>
          <p className="text-gray-500 text-sm">Maternal & Child Healthcare</p>
          <div className="mt-6 flex justify-center space-x-4">
            <LanguageSelector />
            <OfflineSync />
          </div>
        </div>

        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl text-center font-bold">
              {isSignUp ? "Doctor Registration" : t('login')}
            </CardTitle>
            <div className="flex items-center justify-center text-sm text-gray-500">
              <Shield className="h-4 w-4 mr-1" />
              End-to-end encrypted • Offline capable
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {passwordErrors.length > 0 && (
              <Alert className="border-red-200 bg-red-50" variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <ul className="list-disc list-inside space-y-1">
                    {passwordErrors.map((error, index) => (
                      <li key={index} className="text-sm">{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-sm font-medium">{t('firstName')}</Label>
                      <Input
                        id="firstName"
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-sm font-medium">{t('lastName')}</Label>
                      <Input
                        id="lastName"
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="licenseNumber" className="text-sm font-medium">Medical License Number</Label>
                    <Input
                      id="licenseNumber"
                      type="text"
                      placeholder="MDCN/2019/12345"
                      value={licenseNumber}
                      onChange={(e) => setLicenseNumber(e.target.value)}
                      className="focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="specialization" className="text-sm font-medium">Specialization</Label>
                    <Input
                      id="specialization"
                      type="text"
                      placeholder="Maternal & Child Health"
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                      className="focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </>
              )}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">{t('email')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="doctor@vivamoms.ng"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">{t('password')}</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="focus:ring-2 focus:ring-blue-500"
                  required
                />
                {isSignUp && (
                  <p className="text-xs text-gray-500 bg-gray-50 rounded p-2">
                    Must contain: 8+ characters, uppercase, lowercase, number, special character
                  </p>
                )}
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={isLoading}
                size="lg"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {isSignUp ? "Creating Account..." : "Authenticating..."}
                  </div>
                ) : (
                  isSignUp ? "Create Account" : t('login')
                )}
              </Button>
            </form>
            
            <div className="text-center">
              <Button
                variant="ghost"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setPasswordErrors([]);
                }}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              >
                {isSignUp 
                  ? "Already have an account? Sign In" 
                  : "Need an account? Register"
                }
              </Button>
            </div>

            <div className="text-center text-sm text-gray-500 space-y-2 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-center space-x-2">
                <Shield className="h-4 w-4 text-green-500" />
                <p>NDPR Compliant • Offline Capable</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthLoading>
        <div>Loading authentication...</div>
      </AuthLoading>
      <Unauthenticated>
        <LoginForm />
      </Unauthenticated>
      <Authenticated>
        <div className="absolute top-4 right-4">
          <UserButton />
        </div>
      </Authenticated>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
