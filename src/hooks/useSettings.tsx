
import { useState } from "react";
import { toast } from "sonner";
import { resetDocuments, resetDocumentCounters } from "./useDocuments";
import { useLocalStorage } from "@/hooks/useLocalStorage";

// Define types
type Settings = {
  spreadsheetId: string;
  folderId: string;
  companyName: string;
  autoSave: boolean;
  lastBackup?: string;
  documentUploadSettings?: DocumentUploadSettings;
};

type DocumentUploadSettings = {
  requireTitle: boolean;
  requireSubject: boolean;
  requireSender: boolean;
  requireDate: boolean;
  requireFile: boolean;
};

type ResetOptions = {
  inbound: boolean;
  outbound: boolean;
  users: boolean;
  settings: boolean;
};

// Default settings
const defaultSettings: Settings = {
  spreadsheetId: "",
  folderId: "",
  companyName: "نظام إدارة الوثائق",
  autoSave: true,
  documentUploadSettings: {
    requireTitle: true,
    requireSubject: true,
    requireSender: true,
    requireDate: true,
    requireFile: true,
  }
};

export const useSettings = () => {
  const [settings, setSettings] = useLocalStorage<Settings>("appSettings", defaultSettings);
  const [isLoading, setIsLoading] = useState(false);

  const saveSettings = async (newSettings: Settings) => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Update settings directly with useLocalStorage
    setSettings(newSettings);
    
    toast.success("تم حفظ الإعدادات بنجاح");
    setIsLoading(false);
    return true;
  };

  const generateIds = async () => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Generate mock IDs
    const mockSpreadsheetId = "1Abc" + Math.random().toString(36).substring(2, 15);
    const mockFolderId = "2Xyz" + Math.random().toString(36).substring(2, 15);
    
    const newSettings = {
      ...settings,
      spreadsheetId: mockSpreadsheetId,
      folderId: mockFolderId,
    };
    
    // Update settings using useLocalStorage setter
    setSettings(newSettings);
    
    toast.success("تم توليد معرفات جديدة بنجاح");
    setIsLoading(false);
    
    return { spreadsheetId: mockSpreadsheetId, folderId: mockFolderId };
  };

  const resetDatabase = async (options: ResetOptions = { inbound: true, outbound: true, users: false, settings: false }) => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Reset documents based on options
    resetDocuments({
      inbound: options.inbound,
      outbound: options.outbound
    });
    
    // Reset counters
    if (options.inbound || options.outbound) {
      if (options.inbound) {
        localStorage.setItem("inboundCounter", "1");
      }
      
      if (options.outbound) {
        localStorage.setItem("outboundCounter", "1");
      }
    }
    
    if (options.users) {
      // Only create admin user
      const adminUser = {
        username: "admin",
        fullName: "مدير النظام",
        role: "admin" as const,
        passwordHash: "hashed_admin123",
        permissions: ["create_user", "edit_user", "delete_user", "view_documents", "edit_documents"] as const
      };
      
      // Save directly to localStorage - this will affect all users
      localStorage.setItem("app-users", JSON.stringify([adminUser]));
      
      // Also clear any user-specific data
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('user-') || key.includes('session'))) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
    }
    
    if (options.settings) {
      // Reset settings but keep company name
      const companyName = settings.companyName;
      const newSettings = {
        ...defaultSettings,
        companyName,
        lastBackup: new Date().toISOString(),
      };
      
      // Update settings using useLocalStorage
      setSettings(newSettings);
    } else {
      // Just update the lastBackup timestamp
      const newSettings = {
        ...settings,
        lastBackup: new Date().toISOString(),
      };
      
      // Update settings using useLocalStorage
      setSettings(newSettings);
    }
    
    let resetMessage = "تم تصفير";
    if (options.inbound) resetMessage += " الوثائق الواردة";
    if (options.outbound) {
      if (options.inbound) resetMessage += " و";
      resetMessage += " الوثائق الصادرة";
    }
    if (options.users) {
      if (options.inbound || options.outbound) resetMessage += " و";
      resetMessage += " بيانات المستخدمين";
    }
    if (options.settings) {
      if (options.inbound || options.outbound || options.users) resetMessage += " و";
      resetMessage += " إعدادات النظام";
    }
    resetMessage += " بنجاح";
    
    toast.success(resetMessage);
    setIsLoading(false);
    return true;
  };

  const saveDatabase = async () => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Create backup timestamp
    const newSettings = {
      ...settings,
      lastBackup: new Date().toISOString(),
    };
    
    // تحديث الإعدادات باستخدام useLocalStorage
    setSettings(newSettings);
    
    toast.success("تم حفظ قاعدة البيانات بنجاح");
    setIsLoading(false);
    return true;
  };

  const startNewYear = async () => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Reset document counters but keep existing documents
    resetDocumentCounters();
    
    // Reset localStorage counters
    localStorage.setItem("inboundCounter", "1");
    localStorage.setItem("outboundCounter", "1");
    
    toast.success("تم بدء سنة جديدة وإعادة تعيين العدادات");
    setIsLoading(false);
    return true;
  };

  const toggleAutoSave = async (autoSaveEnabled: boolean) => {
    setIsLoading(true);
    
    const newSettings = {
      ...settings,
      autoSave: autoSaveEnabled,
    };
    
    // تحديث الإعدادات باستخدام useLocalStorage
    setSettings(newSettings);
    
    if (autoSaveEnabled) {
      toast.success("تم تفعيل الحفظ التلقائي");
    } else {
      toast.info("تم إيقاف الحفظ التلقائي");
    }
    
    setIsLoading(false);
    return true;
  };

  const updateDocumentUploadSettings = async (documentUploadSettings: DocumentUploadSettings) => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const newSettings = {
      ...settings,
      documentUploadSettings
    };
    
    // Update settings using useLocalStorage setter
    setSettings(newSettings);
    
    toast.success("تم تحديث إعدادات رفع الوثائق بنجاح");
    setIsLoading(false);
    return true;
  };

  return {
    settings,
    isLoading,
    saveSettings,
    generateIds,
    resetDatabase,
    saveDatabase,
    startNewYear,
    toggleAutoSave,
    updateDocumentUploadSettings,
  };
};
