import { Toaster } from "@/components/shared/toaster";
import { Toaster as Sonner } from "@/components/shared/sonner";
import { TooltipProvider } from "@/components/shared/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { SignInButton, UserButton } from "@clerk/clerk-react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthLoading>
        <div className="flex items-center justify-center h-screen">
          <p>Loading authentication...</p>
        </div>
      </AuthLoading>
      <Unauthenticated>
        <div className="flex flex-col items-center justify-center h-screen">
          <SignInButton />
        </div>
      </Unauthenticated>
      <Authenticated>
        <div className="absolute top-4 right-4">
          <UserButton />
        </div>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </Authenticated>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
