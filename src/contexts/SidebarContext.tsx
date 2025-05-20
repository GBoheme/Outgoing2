
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the context type
interface SidebarContextType {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  sidebarWidth: string;
}

// Create the context with a default value
const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

// Provider component
export const SidebarProvider = ({ children }: { children: ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const savedState = localStorage.getItem('sidebarState');
    return savedState === 'open' || savedState === null;
  });

  // Define sidebar widths for open and closed states
  const sidebarWidth = sidebarOpen ? "w-64" : "w-[70px]";

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  useEffect(() => {
    localStorage.setItem('sidebarState', sidebarOpen ? 'open' : 'closed');
    
    // Dispatch custom event to notify other components
    const event = new CustomEvent('sidebarStateChanged');
    window.dispatchEvent(event);
  }, [sidebarOpen]);

  return (
    <SidebarContext.Provider value={{ sidebarOpen, toggleSidebar, sidebarWidth }}>
      {children}
    </SidebarContext.Provider>
  );
};

// Custom hook to use the sidebar context
export const useSidebar = (): SidebarContextType => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};
