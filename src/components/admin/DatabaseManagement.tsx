
import React, { useState } from "react";
import { useSettings } from "@/hooks/useSettings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Database, Save, CalendarPlus, RefreshCw } from "lucide-react";

const DatabaseManagement = () => {
  const { settings, isLoading, resetDatabase, saveDatabase, startNewYear, toggleAutoSave } = useSettings();
  const [localIsLoading, setLocalIsLoading] = useState(false);
  const [resetOptions, setResetOptions] = useState({
    inbound: true,
    outbound: true,
    users: false,
    settings: false
  });
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return "لا يوجد";
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ar', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }).format(date);
  };
  
  const handleSaveDatabase = async () => {
    setLocalIsLoading(true);
    await saveDatabase();
    setLocalIsLoading(false);
  };
  
  const handleToggleAutoSave = async (checked: boolean) => {
    setLocalIsLoading(true);
    await toggleAutoSave(checked);
    setLocalIsLoading(false);
  };

  const handleResetOptionChange = (option: keyof typeof resetOptions, checked: boolean) => {
    setResetOptions(prev => ({ ...prev, [option]: checked }));
  };

  const handleResetDatabase = async () => {
    setLocalIsLoading(true);
    await resetDatabase(resetOptions);
    setLocalIsLoading(false);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-primary">
            <Database className="h-5 w-5" /> إدارة قاعدة البيانات
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            إدارة حفظ البيانات وإعادة تعيينها
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">الحفظ التلقائي</p>
              <p className="text-sm text-muted-foreground">حفظ البيانات تلقائيًا كل ساعة</p>
            </div>
            <Switch 
              checked={settings?.autoSave} 
              onCheckedChange={handleToggleAutoSave}
              disabled={isLoading || localIsLoading}
            />
          </div>
          
          <div className="flex flex-col">
            <span className="font-medium text-foreground">آخر نسخة احتياطية</span>
            <span className="text-sm text-muted-foreground">
              {settings?.lastBackup ? formatDate(settings.lastBackup) : "لم يتم عمل نسخة احتياطية بعد"}
            </span>
          </div>
          
          <Alert className="bg-muted/50 border-muted text-foreground">
            <AlertTitle className="text-primary">نصائح للحفظ</AlertTitle>
            <AlertDescription className="text-muted-foreground">
              يفضل حفظ قاعدة البيانات بشكل دوري، وعمل نسخ احتياطية قبل أي تغييرات كبيرة.
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter className="flex justify-between gap-2 flex-wrap">
          <Button 
            variant="outline"
            className="flex-1 gap-1"
            onClick={handleSaveDatabase}
            disabled={isLoading || localIsLoading}
          >
            <Save className="h-4 w-4" /> حفظ البيانات
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="default"
                className="flex-1 gap-1"
                disabled={isLoading || localIsLoading}
              >
                <CalendarPlus className="h-4 w-4" /> بدء سنة جديدة
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-card border-border">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-foreground">بدء سنة جديدة</AlertDialogTitle>
                <AlertDialogDescription className="text-muted-foreground">
                  هذا الإجراء سيعيد تعيين جميع أرقام الوثائق لتبدأ من 1. هل أنت متأكد من المتابعة؟
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="sm:justify-start">
                <AlertDialogCancel className="bg-muted text-muted-foreground">إلغاء</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={async () => {
                    setLocalIsLoading(true);
                    await startNewYear();
                    setLocalIsLoading(false);
                  }}
                >
                  تأكيد
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive"
                className="flex-1 gap-1"
                disabled={isLoading || localIsLoading}
              >
                <RefreshCw className="h-4 w-4" /> تصفير قاعدة البيانات
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-card border-border">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-foreground">تصفير قاعدة البيانات</AlertDialogTitle>
                <AlertDialogDescription className="text-muted-foreground mb-4">
                  يرجى تحديد البيانات التي ترغب في تصفيرها:
                </AlertDialogDescription>
                
                <div className="space-y-3 mt-2">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Checkbox 
                      id="reset-inbound" 
                      checked={resetOptions.inbound}
                      onCheckedChange={(checked) => 
                        handleResetOptionChange('inbound', checked === true)
                      }
                    />
                    <Label htmlFor="reset-inbound" className="text-foreground">تصفير الوثائق الواردة</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Checkbox 
                      id="reset-outbound" 
                      checked={resetOptions.outbound}
                      onCheckedChange={(checked) => 
                        handleResetOptionChange('outbound', checked === true)
                      }
                    />
                    <Label htmlFor="reset-outbound" className="text-foreground">تصفير الوثائق الصادرة</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Checkbox 
                      id="reset-users" 
                      checked={resetOptions.users}
                      onCheckedChange={(checked) => 
                        handleResetOptionChange('users', checked === true)
                      }
                    />
                    <Label htmlFor="reset-users" className="text-foreground">تصفير بيانات المستخدمين</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Checkbox 
                      id="reset-settings" 
                      checked={resetOptions.settings}
                      onCheckedChange={(checked) => 
                        handleResetOptionChange('settings', checked === true)
                      }
                    />
                    <Label htmlFor="reset-settings" className="text-foreground">تصفير إعدادات النظام</Label>
                  </div>
                </div>
              </AlertDialogHeader>
              <AlertDialogFooter className="sm:justify-start">
                <AlertDialogCancel className="bg-muted text-muted-foreground">إلغاء</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                  onClick={async () => {
                    await handleResetDatabase();
                  }}
                >
                  تصفير البيانات
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      </Card>
    </div>
  );
};

export default DatabaseManagement;
