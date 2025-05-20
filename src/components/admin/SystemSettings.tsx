
import React from "react";
import { useSettings } from "@/hooks/useSettings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import DatabaseManagement from "./DatabaseManagement";

const SystemSettings = () => {
  const { settings, saveSettings, generateIds, isLoading, updateDocumentUploadSettings } = useSettings();
  const [companyName, setCompanyName] = React.useState(settings?.companyName || "نظام إدارة الوثائق");
  const [spreadsheetId, setSpreadsheetId] = React.useState(settings?.spreadsheetId || "");
  const [folderId, setFolderId] = React.useState(settings?.folderId || "");
  const [documentUploadSettings, setDocumentUploadSettings] = React.useState(
    settings?.documentUploadSettings || {
      requireTitle: true,
      requireSubject: true,
      requireSender: true,
      requireDate: true,
      requireFile: true,
    }
  );

  const handleSaveSettings = async () => {
    if (!settings) return;
    
    const updatedSettings = {
      ...settings,
      companyName,
      spreadsheetId,
      folderId,
    };
    
    const success = await saveSettings(updatedSettings);
    
    if (success) {
      toast.success("تم حفظ الإعدادات بنجاح");
    } else {
      toast.error("حدث خطأ أثناء حفظ الإعدادات");
    }
  };

  const handleSaveDocumentUploadSettings = async () => {
    const success = await updateDocumentUploadSettings(documentUploadSettings);
    
    if (!success) {
      toast.error("حدث خطأ أثناء حفظ إعدادات رفع الوثائق");
    }
  };

  const handleGenerateIds = async () => {
    try {
      const { spreadsheetId: newSpreadsheetId, folderId: newFolderId } = await generateIds();
      setSpreadsheetId(newSpreadsheetId);
      setFolderId(newFolderId);
      toast.success("تم إنشاء المعرّفات بنجاح");
    } catch (error) {
      toast.error("حدث خطأ أثناء إنشاء المعرّفات");
    }
  };

  const handleDocumentSettingChange = (settingName: string, value: boolean) => {
    setDocumentUploadSettings(prev => ({
      ...prev,
      [settingName]: value
    }));
  };

  React.useEffect(() => {
    if (settings) {
      setCompanyName(settings.companyName || "نظام إدارة الوثائق");
      setSpreadsheetId(settings.spreadsheetId || "");
      setFolderId(settings.folderId || "");
      setDocumentUploadSettings(settings.documentUploadSettings || {
        requireTitle: true,
        requireSubject: true,
        requireSender: true,
        requireDate: true,
        requireFile: true,
      });
    }
  }, [settings]);

  if (!settings) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Tabs defaultValue="general" className="w-full">
      <TabsList className="w-full mb-6 bg-accent">
        <TabsTrigger 
          value="general" 
          className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
        >
          الإعدادات العامة
        </TabsTrigger>
        <TabsTrigger 
          value="document" 
          className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
        >
          إعدادات الوثائق
        </TabsTrigger>
        <TabsTrigger 
          value="database" 
          className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
        >
          إدارة قاعدة البيانات
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="general" className="space-y-4">
        <Card className="bg-card border-border shadow-md">
          <CardHeader>
            <CardTitle className="text-primary">الإعدادات العامة</CardTitle>
            <CardDescription className="text-muted-foreground">
              إعدادات عامة لنظام إدارة الوثائق
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName" className="text-foreground">اسم الشركة أو الجهة</Label>
              <Input
                id="companyName"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="أدخل اسم الشركة أو الجهة"
                className="bg-background text-foreground border-border"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="spreadsheetId" className="text-foreground">معرّف جدول البيانات</Label>
              <div className="flex space-x-2 space-x-reverse">
                <Input
                  id="spreadsheetId"
                  value={spreadsheetId}
                  onChange={(e) => setSpreadsheetId(e.target.value)}
                  placeholder="معرّف جدول البيانات"
                  readOnly
                  className="bg-muted/50 text-muted-foreground border-border"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="folderId" className="text-foreground">معرّف مجلد الملفات</Label>
              <div className="flex space-x-2 space-x-reverse">
                <Input
                  id="folderId"
                  value={folderId}
                  onChange={(e) => setFolderId(e.target.value)}
                  placeholder="معرّف مجلد الملفات"
                  readOnly
                  className="bg-muted/50 text-muted-foreground border-border"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={handleGenerateIds}
              disabled={isLoading}
              className="border-border hover:bg-accent"
            >
              إنشاء معرّفات جديدة
            </Button>
            <Button 
              onClick={handleSaveSettings}
              disabled={isLoading}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              حفظ الإعدادات
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>

      <TabsContent value="document" className="space-y-4">
        <Card className="bg-card border-border shadow-md">
          <CardHeader>
            <CardTitle className="text-primary">إعدادات رفع الوثائق</CardTitle>
            <CardDescription className="text-muted-foreground">
              تحكم في الحقول المطلوبة عند رفع وثيقة جديدة
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center justify-between space-x-4 space-x-reverse">
                <Label htmlFor="requireTitle" className="text-foreground">تطلب حقل العنوان</Label>
                <Switch 
                  id="requireTitle"
                  checked={documentUploadSettings.requireTitle}
                  onCheckedChange={(checked) => handleDocumentSettingChange('requireTitle', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between space-x-4 space-x-reverse">
                <Label htmlFor="requireSubject" className="text-foreground">تطلب حقل الموضوع</Label>
                <Switch 
                  id="requireSubject"
                  checked={documentUploadSettings.requireSubject}
                  onCheckedChange={(checked) => handleDocumentSettingChange('requireSubject', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between space-x-4 space-x-reverse">
                <Label htmlFor="requireSender" className="text-foreground">تطلب حقل المرسل/المستلم</Label>
                <Switch 
                  id="requireSender"
                  checked={documentUploadSettings.requireSender}
                  onCheckedChange={(checked) => handleDocumentSettingChange('requireSender', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between space-x-4 space-x-reverse">
                <Label htmlFor="requireDate" className="text-foreground">تطلب حقل التاريخ</Label>
                <Switch 
                  id="requireDate"
                  checked={documentUploadSettings.requireDate}
                  onCheckedChange={(checked) => handleDocumentSettingChange('requireDate', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between space-x-4 space-x-reverse">
                <Label htmlFor="requireFile" className="text-foreground">تطلب رفع ملف</Label>
                <Switch 
                  id="requireFile"
                  checked={documentUploadSettings.requireFile}
                  onCheckedChange={(checked) => handleDocumentSettingChange('requireFile', checked)}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button 
              onClick={handleSaveDocumentUploadSettings}
              disabled={isLoading}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              حفظ إعدادات رفع الوثائق
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
      
      <TabsContent value="database" className="space-y-4">
        <DatabaseManagement />
      </TabsContent>
    </Tabs>
  );
};

export default SystemSettings;
