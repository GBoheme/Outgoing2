
import React from "react";
import Sidebar from "./Sidebar";
import { useAuth } from "@/hooks/useAuth";
import { useSidebar } from "@/contexts/SidebarContext";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { user } = useAuth();
  const { sidebarOpen, toggleSidebar } = useSidebar();
  
  return (
    <div className="flex flex-col min-h-screen w-full bg-background">
      <div className="flex flex-1 pt-16">
        {/* Main content - transitions smoothly when sidebar changes */}
        <main className={cn(
          "flex-1 transition-all duration-300 ease-in-out animate-fade-in",
          // Adjust margin based on sidebar state (desktop only)
          sidebarOpen ? "md:mr-64" : "md:mr-[70px]"
        )}>
          <div className="container px-4 py-6 mx-auto">
            {children}
          </div>
        </main>
        
        {/* Sidebar fixed on the right side */}
        <Sidebar 
          isOpen={sidebarOpen}
          userRole={user?.role || "user"}
          toggleSidebar={toggleSidebar}
        />
      </div>
    </div>
  );
};

export default Layout;
