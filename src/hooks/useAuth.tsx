
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useLocalStorage } from "@/hooks/useLocalStorage";

type User = {
  username: string;
  fullName: string;
  role: "admin" | "user";
  email?: string;
  phone?: string;
  department?: string;
};

type UserUpdateData = {
  fullName: string;
  email?: string;
  phone?: string;
  department?: string;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateCurrentUser: (userData: User) => void;
  updateUser: (userData: UserUpdateData) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useLocalStorage<User | null>("currentUser", null);

  // Check for existing login when component mounts
  useEffect(() => {
    // Simulate checking auth status
    const checkAuth = async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Get users from localStorage (simulating a database)
      const users = JSON.parse(localStorage.getItem("app-users") || "[]");
      
      // Find user with matching credentials
      const user = users.find(
        (u: any) => u.username === username && u.passwordHash === `hashed_${password}`
      );
      
      if (user) {
        // Store minimal user info in state
        const loggedInUser = {
          username: user.username,
          fullName: user.fullName,
          role: user.role,
          email: user.email,
          phone: user.phone,
          department: user.department,
        };
        
        setCurrentUser(loggedInUser);
        toast.success(`مرحباً بك، ${user.fullName}`);
        return true;
      } else {
        toast.error("اسم المستخدم أو كلمة المرور غير صحيحة");
        return false;
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("حدث خطأ أثناء تسجيل الدخول");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    toast.info("تم تسجيل الخروج بنجاح");
  };
  
  // Add function to update current user info (for when user details change)
  const updateCurrentUser = (userData: User) => {
    setCurrentUser(userData);
  };

  // Add function to update user profile
  const updateUser = async (userData: UserUpdateData): Promise<boolean> => {
    try {
      if (!currentUser) return false;
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Get users from localStorage
      const users = JSON.parse(localStorage.getItem("app-users") || "[]");
      const userIndex = users.findIndex((u: any) => u.username === currentUser.username);
      
      if (userIndex !== -1) {
        // Update user data
        users[userIndex] = {
          ...users[userIndex],
          fullName: userData.fullName,
          email: userData.email || users[userIndex].email,
          phone: userData.phone || users[userIndex].phone,
          department: userData.department || users[userIndex].department,
        };
        
        localStorage.setItem("app-users", JSON.stringify(users));
        
        // Update current user in state
        setCurrentUser({
          ...currentUser,
          fullName: userData.fullName,
          email: userData.email || currentUser.email,
          phone: userData.phone || currentUser.phone,
          department: userData.department || currentUser.department,
        });
        
        return true;
      }
      return false;
    } catch (error) {
      console.error("Update user error:", error);
      return false;
    }
  };

  // Add function to change password
  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    try {
      if (!currentUser) return false;
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Get users from localStorage
      const users = JSON.parse(localStorage.getItem("app-users") || "[]");
      const userIndex = users.findIndex((u: any) => 
        u.username === currentUser.username && u.passwordHash === `hashed_${currentPassword}`
      );
      
      if (userIndex !== -1) {
        // Update password
        users[userIndex].passwordHash = `hashed_${newPassword}`;
        localStorage.setItem("app-users", JSON.stringify(users));
        
        toast.success("تم تغيير كلمة المرور بنجاح");
        return true;
      } else {
        toast.error("كلمة المرور الحالية غير صحيحة");
        return false;
      }
    } catch (error) {
      console.error("Change password error:", error);
      toast.error("حدث خطأ أثناء تغيير كلمة المرور");
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: currentUser,
        isAuthenticated: !!currentUser,
        isLoading,
        login,
        logout,
        updateCurrentUser,
        updateUser,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
