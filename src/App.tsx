
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { ThemeProvider } from "./hooks/useTheme";
import { SidebarProvider } from "./contexts/SidebarContext";

import Index from "./pages/Index";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";
import NotFound from "./pages/NotFound";
import UserProfile from "./pages/UserProfile";
import DocumentsTables from "./pages/DocumentsTables";
import Layout from "./components/Layout";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <SidebarProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/" element={<Layout><Index /></Layout>} />
                  <Route path="/admin" element={<Layout><AdminDashboard /></Layout>} />
                  <Route path="/user" element={<Layout><UserDashboard /></Layout>} />
                  <Route path="/profile" element={<Layout><UserProfile /></Layout>} />
                  <Route path="/documents" element={<Layout><DocumentsTables /></Layout>} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </TooltipProvider>
            </SidebarProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
