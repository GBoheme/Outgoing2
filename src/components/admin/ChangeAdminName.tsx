
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { useUsers } from "@/hooks/useUsers";
import { UserCog } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export function ChangeAdminName() {
  const { users, isLoading, updateUserFullName } = useUsers();
  const { user, updateCurrentUser } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newAdminName, setNewAdminName] = useState("");
  
  // Get admin user
  const adminUser = users.find(user => user.username === "admin");
  const currentAdminName = adminUser?.fullName || "مدير النظام";
  
  // Update the input field when the current admin name changes
  useEffect(() => {
    if (currentAdminName) {
      setNewAdminName(currentAdminName);
    }
  }, [currentAdminName]);
  
  const handleOpenDialog = () => {
    setNewAdminName(currentAdminName);
    setIsDialogOpen(true);
  };
  
  const handleChangeName = async () => {
    if (!newAdminName.trim()) {
      toast.error("يرجى إدخال اسم صحيح");
      return;
    }
    
    try {
      await updateUserFullName("admin", newAdminName);
      
      // Update current user in auth context if logged in as admin
      if (user && user.username === "admin") {
        updateCurrentUser({ ...user, fullName: newAdminName });
      }
      
      setIsDialogOpen(false);
    } catch (error) {
      toast.error("حدث خطأ أثناء تغيير اسم المدير");
    }
  };
  
  return (
    <div className="bg-card border border-border rounded-lg p-4 shadow-md transition-colors duration-300">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-primary">تغيير اسم المدير</h3>
        <UserCog className="text-muted-foreground h-5 w-5" />
      </div>
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          الاسم الحالي للمدير: <span className="font-bold text-accent-foreground">{currentAdminName}</span>
        </p>
        <Button 
          variant="outline" 
          className="w-full flex gap-2 hover:text-accent-foreground transition-colors" 
          onClick={handleOpenDialog}
        >
          <span>تغيير الاسم</span>
          <UserCog className="h-4 w-4" />
        </Button>
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-card border-border sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-foreground">تغيير اسم المدير</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              أدخل الاسم الجديد للمدير
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Input
                value={newAdminName}
                onChange={(e) => setNewAdminName(e.target.value)}
                placeholder="أدخل الاسم الجديد"
                className="w-full"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter className="flex-row-reverse sm:justify-start gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="ml-2"
            >
              إلغاء
            </Button>
            <Button 
              onClick={handleChangeName} 
              disabled={isLoading || !newAdminName.trim() || newAdminName === currentAdminName}
              className="relative bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isLoading && (
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="h-4 w-4 border-2 border-t-transparent border-current rounded-full animate-spin"></div>
                </span>
              )}
              <span className={isLoading ? "opacity-0" : ""}>حفظ التغييرات</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
