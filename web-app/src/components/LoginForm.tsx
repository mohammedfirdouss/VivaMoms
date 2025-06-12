
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { securityService } from "@/utils/security";
import { useLocalization } from "@/utils/localization";
import { measureApiCall } from "@/utils/performance";
import LanguageSelector from "./LanguageSelector";
import PregnantMomIcon from "./PregnantMomIcon";
import OfflineSync from "./OfflineSync";

interface LoginFormProps {
  onLogin: (userData: any) => void;
}

const LoginForm = ({ onLogin }: LoginFormProps) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    securityService.logSecurityEvent('login_attempt', { email, isSignUp });

    try {
      if (isSignUp) {
        await measureApiCall('user_signup', async () => {
          const redirectUrl = `${window.location.origin}/`;
          
          const { data, error } = await supabase.auth.signUp({
            email: securityService.sanitizeInput(email),
            password,
            options: {
              emailRedirectTo: redirectUrl,
              data: {
                role: 'doctor',
                first_name: securityService.sanitizeInput(firstName),
                last_name: securityService.sanitizeInput(lastName),
                license_number: securityService.sanitizeInput(licenseNumber),
                specialization: securityService.sanitizeInput(specialization)
              }
            }
          });

          if (error) {
            throw error;
          } else {
            toast({
              title: "Account Created",
              description: "Please check your email to verify your account before signing in",
            });
            setIsSignUp(false);
            // Clear form
            setEmail("");
            setPassword("");
            setFirstName("");
            setLastName("");
            setLicenseNumber("");
            setSpecialization("");
          }
        });
      } else {
        await measureApiCall('user_login', async () => {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: securityService.sanitizeInput(email),
            password,
          });

          if (error) {
            throw error;
          } else if (data.user) {
            console.log('Login successful, auth state change will handle the rest');
          }
        });
      }
    } catch (error: any) {
      console.error("Login/signup error:", error);
      
      let errorMessage = error.message;
      
      // Provide more user-friendly error messages
      if (error.message?.includes('Invalid login credentials')) {
        errorMessage = "Invalid email or password. Please check your credentials and try again.";
      } else if (error.message?.includes('Email not confirmed')) {
        errorMessage = "Please check your email and click the confirmation link before signing in.";
      } else if (error.message?.includes('User already registered')) {
        errorMessage = "An account with this email already exists. Please sign in instead.";
      }
      
      toast({
        title: isSignUp ? "Sign Up Failed" : "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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

export default LoginForm;
