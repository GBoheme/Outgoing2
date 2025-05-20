
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useLocalStorage } from "@/hooks/useLocalStorage";

// Define types
type Permission = "create_user" | "edit_user" | "delete_user" | "view_documents" | "edit_documents";

type User = {
  username: string;
  fullName: string;
  role: "admin" | "user";
  passwordHash?: string;
  permissions: Permission[];
};

// Mock users for demo
const initialMockUsers: User[] = [
  { 
    username: "admin", 
    fullName: "مدير النظام", 
    role: "admin", 
    passwordHash: "hashed_admin123",
    permissions: ["create_user", "edit_user", "delete_user", "view_documents", "edit_documents"]
  },
  { 
    username: "user", 
    fullName: "مستخدم النظام", 
    role: "user", 
    passwordHash: "hashed_user123",
    permissions: ["view_documents"]
  },
  { 
    username: "ahmed", 
    fullName: "أحمد محمد", 
    role: "user", 
    passwordHash: "hashed_password",
    permissions: ["view_documents", "edit_documents"]
  },
];

export const useUsers = () => {
  const [users, setUsers] = useLocalStorage<User[]>("app-users", initialMockUsers);
  const [usersCount, setUsersCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  // Update users count whenever users array changes
  useEffect(() => {
    setUsersCount(users.length);
  }, [users]);

  const addUser = async (userData: { 
    username: string; 
    fullName: string; 
    password: string; 
    role: string;
    permissions: Permission[];
  }) => {
    setIsLoading(true);
    
    // Check if user already exists
    const existingUser = users.find(user => user.username === userData.username);
    if (existingUser) {
      toast.error("المستخدم موجود بالفعل");
      setIsLoading(false);
      return;
    }
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Create new user
    const newUser: User = {
      username: userData.username,
      fullName: userData.fullName,
      role: userData.role as "admin" | "user",
      passwordHash: `hashed_${userData.password}`, // In a real app, this would be properly hashed
      permissions: userData.permissions,
    };
    
    // Update state directly using the setter from useLocalStorage
    setUsers([...users, newUser]);
    
    toast.success("تم إضافة المستخدم بنجاح");
    setIsLoading(false);
  };

  const updateUser = async (username: string, userData: {
    fullName: string;
    password?: string;
    role: "admin" | "user";
    permissions: Permission[];
  }) => {
    setIsLoading(true);
    
    // Allow updating admin name but not for demo user
    if (username === "user") {
      toast.error("لا يمكن تعديل المستخدم الافتراضي في النسخة التجريبية");
      setIsLoading(false);
      return;
    }
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const userIndex = users.findIndex(user => user.username === username);
    if (userIndex !== -1) {
      // Create a new array with the updated user
      const updatedUsers = [...users];
      updatedUsers[userIndex] = {
        ...updatedUsers[userIndex],
        fullName: userData.fullName,
        role: userData.role,
        permissions: userData.permissions,
      };
      
      // Update password if provided
      if (userData.password) {
        updatedUsers[userIndex].passwordHash = `hashed_${userData.password}`;
      }
      
      // Use the setter function from useLocalStorage
      setUsers(updatedUsers);
      toast.success("تم تعديل المستخدم بنجاح");
    }
    
    setIsLoading(false);
    return true;
  };

  const deleteUser = async (username: string) => {
    setIsLoading(true);
    
    // Prevent deletion of demo users
    if (username === "admin" || username === "user") {
      toast.error("لا يمكن حذف المستخدمين الافتراضيين في النسخة التجريبية");
      setIsLoading(false);
      return;
    }
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Filter out the user to be deleted
    const updatedUsers = users.filter(user => user.username !== username);
    
    if (updatedUsers.length !== users.length) {
      // Use the setter function from useLocalStorage
      setUsers(updatedUsers);
      toast.success("تم حذف المستخدم بنجاح");
    }
    
    setIsLoading(false);
  };

  // تحديث دالة تغيير اسم المستخدم للسماح بتغيير اسم المدير
  const updateUserFullName = async (username: string, newFullName: string) => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const userIndex = users.findIndex(user => user.username === username);
    if (userIndex !== -1) {
      // Create a new array with the updated user
      const updatedUsers = [...users];
      updatedUsers[userIndex] = {
        ...updatedUsers[userIndex],
        fullName: newFullName
      };
      
      // Use the setter function from useLocalStorage
      setUsers(updatedUsers);
      toast.success("تم تعديل اسم المستخدم بنجاح");
      
      // Update the current user in local storage if it's the admin
      if (username === "admin") {
        const currentSession = JSON.parse(localStorage.getItem('currentUser') || '{}');
        if (currentSession && currentSession.username === "admin") {
          localStorage.setItem('currentUser', JSON.stringify({
            ...currentSession,
            fullName: newFullName
          }));
        }
      }
    } else {
      toast.error("المستخدم غير موجود");
    }
    
    setIsLoading(false);
    return true;
  };

  return {
    users,
    usersCount,
    isLoading,
    addUser,
    updateUser,
    deleteUser,
    updateUserFullName,
  };
};
