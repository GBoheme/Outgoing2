
import React from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { User, LogOut, Menu, ChevronRight, ChevronLeft } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useSettings } from "@/hooks/useSettings";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/useIsMobile";

interface NavbarProps {
  userName: string;
  userRole: string;
  sidebarOpen?: boolean;
  toggleSidebar?: () => void;
}

const Navbar = ({
  userName,
  userRole,
  sidebarOpen,
  toggleSidebar
}: NavbarProps) => {
  const { logout } = useAuth();
  const { settings } = useSettings();
  const isMobile = useIsMobile();
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-[#1c1a22] to-[#221F26] dark:bg-card shadow-md py-4 transition-all duration-300">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center">
          {!isMobile && toggleSidebar && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="mr-2 text-[#D4AF37] dark:text-primary"
            >
              {sidebarOpen ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </Button>
          )}
          
          <div className="flex items-center space-x-2">
            <h1 className="text-[#D4AF37] dark:text-primary font-bold text-xl font-cairo">
              {settings?.companyName || "نظام إدارة الوثائق"}
            </h1>
            <div className="hidden md:flex items-center">
              <span className="mx-2 text-gray-400">|</span>
              <p className="text-gray-300 dark:text-muted-foreground text-xs font-thin">
                مرحباً بك، <span className="text-[#D4AF37] dark:text-primary font-semibold">{userName}</span>
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <ThemeSwitcher />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2A2D3A] dark:bg-secondary">
                  <User className="h-5 w-5 text-[#D4AF37] dark:text-primary" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-[#221F26] dark:bg-card border-[#3A3A3C] dark:border-border text-white dark:text-foreground" align="end">
              <div className="p-2 border-b border-[#3A3A3C] dark:border-border" dir="rtl">
                <p className="text-sm font-medium">{userName}</p>
                <p className="text-xs text-gray-400 dark:text-muted-foreground">{userRole}</p>
              </div>
              <Link to="/profile">
                <DropdownMenuItem className="cursor-pointer font-cairo hover:bg-[#2A2D3A] dark:hover:bg-secondary flex items-center gap-2" dir="rtl">
                  <User className="h-4 w-4 text-[#D4AF37] dark:text-primary ml-2" />
                  الملف الشخصي
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator className="bg-[#3A3A3C] dark:bg-border" />
              <DropdownMenuItem className="cursor-pointer font-cairo hover:bg-[#2A2D3A] dark:hover:bg-secondary flex items-center gap-2" onClick={() => logout()} dir="rtl">
                <LogOut className="h-4 w-4 text-[#D4AF37] dark:text-primary ml-2" />
                تسجيل الخروج
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
