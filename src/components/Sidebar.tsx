
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { useIsMobile } from "@/hooks/useIsMobile";
import { LayoutDashboard, FileText, Users, Settings, LogOut, Home, User, X, Menu, ChevronLeft, ChevronRight, Copyright } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { useSidebar } from "@/contexts/SidebarContext";

interface SidebarProps {
  isOpen: boolean;
  userRole: "admin" | "user";
  toggleSidebar: () => void;
}

const Sidebar = ({
  isOpen,
  userRole,
  toggleSidebar
}: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<string>("");
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const isMobile = useIsMobile();

  // Get current tab from URL
  const getTabFromUrl = () => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get('tab') || '';
  };

  // Handle immediate navigation - optimized for direct navigation
  const handleNavigation = (path: string, tab?: string) => {
    // Navigate immediately
    if (tab) {
      navigate(`${path}?tab=${tab}`);
    } else {
      navigate(path);
    }
    
    // Set active tab directly for immediate UI feedback
    if (tab) {
      setActiveTab(tab);
    }
    
    // Only close sidebar on mobile
    if (isMobile) {
      setIsExpanded(false);
    }
  };

  // Handle logout with confirmation
  const handleLogout = () => {
    if (window.confirm('هل أنت متأكد من تسجيل الخروج؟')) {
      logout();
    }
  };

  // Update active tab when location changes
  useEffect(() => {
    setActiveTab(getTabFromUrl());
  }, [location]);

  // Save sidebar state to localStorage and handle route changes
  useEffect(() => {
    localStorage.setItem('sidebarState', isOpen ? 'open' : 'closed');
    const handleRouteChange = () => {
      // Only close the expanded overlay sidebar on mobile
      if (isMobile) {
        setIsExpanded(false);
      }
    };
    window.addEventListener('popstate', handleRouteChange);
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [isOpen, isMobile]);

  // Define menu items based on user role
  const getMenuItems = () => {
    if (userRole === "admin") {
      return [{
        id: "dashboard",
        icon: <Home size={22} />,
        label: "الرئيسية",
        isActive: location.pathname === "/admin" && !activeTab,
        onClick: () => handleNavigation('/admin'),
        color: "#D4AF37"
      }, {
        id: "inbound",
        icon: <FileText size={22} />,
        label: "الوثائق الواردة",
        isActive: location.pathname === "/admin" && activeTab === "inbound",
        onClick: () => handleNavigation('/admin', 'inbound'),
        color: "#3B82F6"
      }, {
        id: "outbound",
        icon: <FileText size={22} />,
        label: "الوثائق الصادرة",
        isActive: location.pathname === "/admin" && activeTab === "outbound",
        onClick: () => handleNavigation('/admin', 'outbound'),
        color: "#10B981"
      }, {
        id: "users",
        icon: <Users size={22} />,
        label: "إدارة المستخدمين",
        isActive: location.pathname === "/admin" && activeTab === "users",
        onClick: () => handleNavigation('/admin', 'users'),
        color: "#F59E0B"
      }, {
        id: "settings",
        icon: <Settings size={22} />,
        label: "الإعدادات",
        isActive: location.pathname === "/admin" && activeTab === "settings",
        onClick: () => handleNavigation('/admin', 'settings'),
        color: "#8B5CF6"
      }];
    } else {
      return [{
        id: "dashboard",
        icon: <Home size={22} />,
        label: "الرئيسية",
        isActive: location.pathname === "/user" && (!activeTab || activeTab === "dashboard"),
        onClick: () => handleNavigation('/user', 'dashboard'),
        color: "#D4AF37"
      }, {
        id: "upload",
        icon: <User size={22} />,
        label: "الملف الشخصي",
        isActive: location.pathname === "/user" && activeTab === "upload",
        onClick: () => handleNavigation('/user', 'upload'),
        color: "#3B82F6"
      }, {
        id: "settings",
        icon: <Settings size={22} />,
        label: "الإعدادات",
        isActive: location.pathname === "/user" && activeTab === "settings",
        onClick: () => handleNavigation('/user', 'settings'),
        color: "#8B5CF6"
      }];
    }
  };
  const menuItems = getMenuItems();
  const mobileMenuItems = menuItems?.slice(0, 5); // Limit items for mobile bottom nav

  return <>
      {/* Mobile overlay sidebar - using drawer component for better UX */}
      <div className="md:hidden">
        <Drawer open={isExpanded} onOpenChange={setIsExpanded}>
          <DrawerTrigger asChild>
            <Button variant="outline" size="icon" className="fixed top-20 right-4 z-50 bg-white dark:bg-[#1c1c1c] shadow-md md:hidden">
              <Menu size={20} />
            </Button>
          </DrawerTrigger>
          <DrawerContent className="h-[85%] max-h-[85%] transition-all duration-300 mt-16">
            <div className="flex flex-col h-full bg-white dark:bg-[#1c1c1c]">
              <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="text-lg font-medium">
                  نظام إدارة الوثائق
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsExpanded(false)}>
                  <X size={20} />
                </Button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {menuItems.map(item => <button key={item.id} onClick={() => {
                item.onClick();
              }} className={cn("flex w-full items-center gap-3 px-3 py-2 rounded-md transition-all", item.isActive ? "bg-[#f1f1f1] dark:bg-[#2a2a2a]" : "hover:bg-gray-100 dark:hover:bg-[#2a2a2a]/50")}>
                    <div className="flex items-center justify-center w-9 h-9 rounded-md" style={{
                  backgroundColor: item.isActive ? item.color + "20" : "transparent",
                  color: item.color
                }}>
                      {item.icon}
                    </div>
                    <span className={cn("text-sm", item.isActive ? "font-medium" : "")}>
                      {item.label}
                    </span>
                  </button>)}
              </div>
              
              <div className="px-3 py-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
                {/* Developer copyright notice */}
                <div className="flex items-center justify-center text-xs text-gray-500 dark:text-gray-400 pb-2">
                  <Copyright className="w-4 h-4 mr-1" />
                  <span>© 2025 Developed by Ghaith Boheme</span>
                </div>
                
                <div className="flex items-center justify-between gap-2">
                  <Button variant="outline" size="icon" className="bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 flex-1" onClick={() => {
                  const newTheme = theme === "dark" ? "light" : "dark";
                  setTheme(newTheme);
                }}>
                    {theme === "dark" ? <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-400">
                        <circle cx="12" cy="12" r="5"></circle>
                        <line x1="12" y1="1" x2="12" y2="3"></line>
                        <line x1="12" y1="21" x2="12" y2="23"></line>
                        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                        <line x1="1" y1="12" x2="3" y2="12"></line>
                        <line x1="21" y1="12" x2="23" y2="12"></line>
                        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                      </svg> : <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-700">
                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                      </svg>}
                  </Button>
                  
                  <Button variant="outline" size="icon" className="bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 flex-1" onClick={handleLogout}>
                    <LogOut size={18} className="text-red-500" />
                  </Button>
                </div>
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      </div>

      {/* Desktop sidebar - always visible and controlled by isOpen state */}
      <aside className={cn(
        "fixed right-0 h-[calc(100vh-64px)] flex flex-col border-l border-gray-200 dark:border-gray-800 shadow-sm bg-gradient-to-b from-[#1A1F2C] to-[#161B25] dark:from-[#1c1c1c] dark:to-[#161618]",
        "transition-all duration-300 ease-in-out z-20",
        isOpen ? "w-64" : "w-[70px]", 
        "hidden md:flex", 
        "top-16" // This positions the sidebar right below the header (64px)
      )}>
        <div className="flex flex-col h-full px-[4px] py-4">
          <div className="flex justify-between items-center p-4 h-16">
            {isOpen && <h2 className="font-medium text-white dark:text-gray-100 truncate">نظام إدارة الوثائق</h2>}
            <Button variant="ghost" size="icon" className="ml-auto text-white/70 hover:text-white dark:text-gray-300 hover:dark:text-white" onClick={toggleSidebar}>
              {isOpen ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto my-2">
            <div className="flex flex-col space-y-1 p-2">
              {menuItems.map(item => <TooltipProvider key={item.id} delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button onClick={item.onClick} className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-md transition-all text-white dark:text-gray-200", 
                        item.isActive 
                          ? "bg-white/10 dark:bg-gray-700/50" 
                          : "hover:bg-white/5 dark:hover:bg-gray-700/30"
                      )}>
                        <div className="flex items-center justify-center w-9 h-9 rounded-md" style={{
                      backgroundColor: item.isActive ? item.color + "20" : "transparent",
                      color: item.color
                    }}>
                          {item.icon}
                        </div>
                        {isOpen && <span className={cn("text-sm truncate", item.isActive ? "font-medium" : "")}>
                            {item.label}
                          </span>}
                      </button>
                    </TooltipTrigger>
                    {!isOpen && <TooltipContent side="left" className="bg-gray-900 text-white border-0">
                        {item.label}
                      </TooltipContent>}
                  </Tooltip>
                </TooltipProvider>)}
            </div>
          </div>

          <div className="p-3 border-t border-gray-700/40 dark:border-gray-700/30">
            {/* Developer copyright notice */}
            {isOpen && <div className="flex items-center justify-center mb-2 text-xs text-gray-400 dark:text-gray-500">
                <Copyright className="w-3.5 h-3.5 ml-1" />
                <span>© 2025 Developed by Ghaith Boheme</span>
              </div>}
            
            <div className="flex items-center justify-center gap-2">
              <Button variant="ghost" size="icon" className="text-white/70 hover:text-white dark:text-gray-400 hover:dark:text-white hover:bg-white/10 dark:hover:bg-gray-700/50" onClick={() => {
              const newTheme = theme === "dark" ? "light" : "dark";
              setTheme(newTheme);
            }}>
                {theme === "dark" ? <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-400">
                    <circle cx="12" cy="12" r="5"></circle>
                    <line x1="12" y1="1" x2="12" y2="3"></line>
                    <line x1="12" y1="21" x2="12" y2="23"></line>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                    <line x1="1" y1="12" x2="3" y2="12"></line>
                    <line x1="21" y1="12" x2="23" y2="12"></line>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                  </svg> : <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                  </svg>}
              </Button>
              
              <Button variant="ghost" size="icon" className="text-white/70 hover:text-white dark:text-gray-400 hover:dark:text-white hover:bg-white/10 dark:hover:bg-gray-700/50" onClick={handleLogout}>
                <LogOut size={18} className="text-red-400 hover:text-red-300" />
              </Button>
            </div>
            
            {/* Show copyright in collapsed mode */}
            {!isOpen && <div className="flex items-center justify-center mt-2">
                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="text-gray-500 dark:text-gray-600 cursor-help">
                        <Copyright className="w-4 h-4" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="bg-gray-900 text-white border-0">
                      © 2025 Developed by Ghaith Boheme
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>}
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar with smooth animation */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-gradient-to-r from-[#1A1F2C] to-[#161B25] dark:bg-[#1c1c1c] border-t border-gray-700/30 dark:border-gray-800 shadow-lg transition-all">
        <div className="grid grid-cols-5 gap-1 p-1">
          {mobileMenuItems.map(item => <button key={item.id} onClick={item.onClick} className="flex flex-col items-center justify-center py-2 px-1 transition-all">
              <div className="flex items-center justify-center w-6 h-6 rounded-md mb-1" style={{
            color: item.isActive ? item.color : "currentColor"
          }}>
                {item.icon}
              </div>
              <span className="text-xs truncate text-gray-300 dark:text-gray-400" style={{
            color: item.isActive ? item.color : "currentColor",
            fontWeight: item.isActive ? "500" : "normal"
          }}>
                {item.label}
              </span>
            </button>)}
        </div>
      </div>
    </>;
};

export default Sidebar;
