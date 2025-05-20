
import { useState, useEffect, createContext, useContext } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

// أنواع السمات المتاحة
export type Theme = "light" | "dark" | "gold" | "blue" | "purple";

// سياق الثيم بأنواعه
type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleDarkMode: () => void;
  isTheme: (checkTheme: Theme) => boolean;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// مزود الثيمات المحسن
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // استخدام التخزين المحلي مع قيمة افتراضية
  const [storedTheme, setStoredTheme] = useLocalStorage<Theme>("app-theme", "dark");
  const [theme, setThemeState] = useState<Theme>(storedTheme);

  // التحقق من أن الثيم هو
  const isTheme = (checkTheme: Theme): boolean => theme === checkTheme;

  // تطبيق الثيم على عنصر الروت مع انتقالات أكثر سلاسة
  useEffect(() => {
    const root = document.documentElement;
    // إزالة جميع الثيمات السابقة
    root.classList.remove("light", "dark", "gold", "blue", "purple");
    // إضافة الثيم الجديد
    root.classList.add(theme);
    // تحديث التخزين المحلي
    setStoredTheme(theme);
    
    // إضافة متغير CSS للتحكم بانتقالات الألوان
    root.style.setProperty('--theme-transition-duration', '0.3s');
  }, [theme, setStoredTheme]);

  // تبديل بين الوضع الليلي والنهاري
  const toggleDarkMode = () => {
    setThemeState(prevTheme => {
      if (prevTheme === "dark") return "light";
      return "dark";
    });
  };

  // تعيين الثيم وتطبيقه
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleDarkMode, isTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// هوك خاص للوصول لحالة الثيم بشكل محسن
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
