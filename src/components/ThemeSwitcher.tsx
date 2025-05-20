
import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Palette } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // تجنب مشاكل عدم تطابق الترميز على الخادم والعميل
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) return <div className="w-9 h-9" />;
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative h-9 w-9 rounded-full transition-all hover:bg-accent/50 button-glow"
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">تبديل السمة</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-card border-border text-foreground animate-fade-in card-shadow">
        <DropdownMenuItem 
          onClick={() => setTheme("light")}
          className="cursor-pointer flex items-center gap-2 hover:bg-accent focus:bg-accent transition-colors"
        >
          <Sun className="h-4 w-4" />
          <span>فاتح</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("dark")}
          className="cursor-pointer flex items-center gap-2 hover:bg-accent focus:bg-accent transition-colors"
        >
          <Moon className="h-4 w-4" />
          <span>داكن</span>
          <span className="mr-auto text-xs text-muted-foreground">(افتراضي)</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("gold")}
          className="cursor-pointer flex items-center gap-2 hover:bg-accent focus:bg-accent transition-colors"
        >
          <span className="w-4 h-4 bg-[#D4AF37] rounded-full pulse-on-hover"></span>
          <span>ذهبي</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("blue")}
          className="cursor-pointer flex items-center gap-2 hover:bg-accent focus:bg-accent transition-colors"
        >
          <span className="w-4 h-4 bg-[#3b82f6] rounded-full pulse-on-hover"></span>
          <span>أزرق</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("purple")}
          className="cursor-pointer flex items-center gap-2 hover:bg-accent focus:bg-accent transition-colors"
        >
          <span className="w-4 h-4 bg-[#9b87f5] rounded-full pulse-on-hover"></span>
          <span>أرجواني</span>
          <Palette className="ml-auto h-3.5 w-3.5 text-muted-foreground" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
