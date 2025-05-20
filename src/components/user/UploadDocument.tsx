import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDocuments } from "@/hooks/useDocuments";
import { useSettings } from "@/hooks/useSettings";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BookmarkIcon, AlertCircle, Info, CalendarIcon, UserIcon, UploadCloudIcon, FileTextIcon, TypeIcon, BriefcaseIcon } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const UploadDocument = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { uploadDocument, reserveReferenceId, isReferenceIdAvailable, getActiveReservations } = useDocuments();
  const { settings } = useSettings();
  const { user } = useAuth(); 
  const [isReservationDialogOpen, setIsReservationDialogOpen] = useState(false);
  const [isManualRefValidating, setIsManualRefValidating] = useState(false);
  const [manualRefStatus, setManualRefStatus] = useState<"valid" | "invalid" | "checking" | null>(null);
  const [activeReservations, setActiveReservations] = useState<any[]>([]);
  const [showReservations, setShowReservations] = useState(false);
  
  useEffect(() => {
    setActiveReservations(getActiveReservations());
  }, [getActiveReservations]);
  
  const documentUploadSettings = settings?.documentUploadSettings || {
    requireTitle: true,
    requireSubject: true,
    requireSender: true,
    requireDate: true,
    requireFile: true,
  };
  
  const [formData, setFormData] = useState({
    type: "inbound" as "inbound" | "outbound",
    title: "",
    subject: "",
    sender: user?.fullName || user?.username || "",
    date: new Date().toISOString().slice(0, 10),
    file: null as File | null,
    useManualReferenceId: true,
    manualReferenceId: "",
  });

  useEffect(() => {
    setFormData(prev => ({...prev, sender: user?.fullName || user?.username || ""}));
  }, [user]);

  const [reservationData, setReservationData] = useState({
    type: "inbound" as "inbound" | "outbound",
    referenceId: "",
    notes: "",
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (name === "manualReferenceId" && formData.useManualReferenceId && value) {
      validateManualReferenceId(value);
    }
  };

  const handleReservationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setReservationData({ ...reservationData, [name]: value });
    
    if (name === "referenceId" && value) {
      validateManualReferenceId(value, true);
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, file: e.target.files[0] });
    }
  };

  const handleManualReferenceToggle = (checked: boolean) => {
    setFormData({ ...formData, useManualReferenceId: checked, manualReferenceId: checked ? formData.manualReferenceId : "" });
    if (!checked) {
      setManualRefStatus(null);
    }
  };

  const handleTypeChange = (value: "inbound" | "outbound") => {
    setFormData({ 
      ...formData, 
      type: value, 
      manualReferenceId: formData.useManualReferenceId ? formData.manualReferenceId : ""
    });
    setReservationData({
      ...reservationData,
      type: value
    });
    if (formData.useManualReferenceId && formData.manualReferenceId) {
      validateManualReferenceId(formData.manualReferenceId);
    }
  };

  const validateManualReferenceId = async (referenceId: string, isReservationContext = false) => {
    if (!referenceId) {
      setManualRefStatus(null);
      return;
    }
    
    setIsManualRefValidating(true);
    setManualRefStatus("checking");
    
    const referenceIdRegex = /^\d+$/;
    if (!referenceIdRegex.test(referenceId)) {
      setManualRefStatus("invalid");
      setIsManualRefValidating(false);
      return;
    }
    
    try {
      const isAvailable = await isReferenceIdAvailable(referenceId);
      setManualRefStatus(isAvailable ? "valid" : "invalid");
    } catch (error) {
      console.error("Error validating reference ID:", error);
      setManualRefStatus("invalid");
    } finally {
      setIsManualRefValidating(false);
    }
  };

  const openReservationDialog = () => {
    setReservationData({
      type: formData.type,
      referenceId: '',
      notes: ""
    });
    setManualRefStatus(null);
    setIsReservationDialogOpen(true);
  };

  const handleReferenceReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reservationData.referenceId) {
      toast.error("الرجاء إدخال الرقم المرجعي المراد حجزه");
      return;
    }

    const referenceIdRegex = /^\d+$/;
    if (!referenceIdRegex.test(reservationData.referenceId)) {
      toast.error("صيغة الرقم المرجعي غير صحيحة. يجب أن يكون رقماً صحيحاً موجباً (مثل 1، 2، 3).");
      return;
    }

    setIsLoading(true);
    try {
      const isAvailable = await isReferenceIdAvailable(reservationData.referenceId);
      if (!isAvailable) {
        toast.error("هذا الرقم المرجعي محجوز بالفعل أو مستخدم، الرجاء اختيار رقم آخر");
        setIsLoading(false);
        return;
      }
      
      await reserveReferenceId({
        type: reservationData.type,
        referenceId: reservationData.referenceId,
        notes: reservationData.notes,
        reservedBy: user?.username || "unknown",
      });
      
      toast.success(`تم حجز الرقم المرجعي ${reservationData.referenceId} بنجاح`);
      setIsReservationDialogOpen(false);
      setActiveReservations(getActiveReservations());
    } catch (error) {
      console.error("Error reserving reference ID:", error);
      toast.error("فشل حجز الرقم المرجعي. الرجاء المحاولة مرة أخرى.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = [];
    if (documentUploadSettings.requireTitle && !formData.title) validationErrors.push("الموضوع");
    if (documentUploadSettings.requireSubject && !formData.subject) validationErrors.push("الجهة المرسل اليها");
    if (documentUploadSettings.requireSender && !formData.sender) validationErrors.push("المرسل/المستلم");
    if (documentUploadSettings.requireFile && !formData.file) validationErrors.push("الملف");
    if (formData.useManualReferenceId && !formData.manualReferenceId) validationErrors.push("الرقم المرجعي اليدوي");

    if (validationErrors.length > 0) {
      toast.error(`الرجاء إكمال الحقول المطلوبة: ${validationErrors.join('، ')}`);
      return;
    }

    if (formData.useManualReferenceId) {
      const referenceIdRegex = /^\d+$/;
      if (!referenceIdRegex.test(formData.manualReferenceId)) {
        toast.error("صيغة الرقم المرجعي اليدوي غير صحيحة. يجب أن يكون رقماً صحيحاً موجباً.");
        return;
      }
      const isAvailable = await isReferenceIdAvailable(formData.manualReferenceId);
      if (!isAvailable) {
        toast.error("هذا الرقم المرجعي اليدوي مستخدم بالفعل أو محجوز، الرجاء اختيار رقم آخر أو إلغاء الحجز.");
        return;
      }
    }
    
    setIsLoading(true);
    try {
      const result = await uploadDocument({
        ...formData,
      });
      toast.success(`تم رفع الوثيقة بنجاح برقم مرجعي: ${result.id}`);
      setFormData({
        type: "inbound",
        title: "",
        subject: "",
        sender: user?.fullName || user?.username || "",
        date: new Date().toISOString().slice(0, 10),
        file: null,
        useManualReferenceId: true,
        manualReferenceId: "",
      });
      const fileInput = document.getElementById("file-upload-input") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
      setActiveReservations(getActiveReservations());
      setManualRefStatus(null);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("فشل رفع الوثيقة، الرجاء المحاولة مرة أخرى");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6 shadow-md">
      <div className="flex flex-wrap justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-primary font-cairo">إضافة وثيقة جديدة</h2>
        <div className="flex gap-2 mt-2 sm:mt-0">
          <Button
            type="button"
            onClick={openReservationDialog}
            variant="outline"
            className="border-amber-400 text-amber-400 hover:bg-amber-400/10 flex items-center gap-1.5 py-2 px-3"
          >
            <BookmarkIcon className="h-4 w-4" />
            <span>حجز رقم مرجعي</span>
          </Button>
          <Button
            type="button"
            onClick={() => setShowReservations(!showReservations)}
            variant="outline"
            className="border-primary text-primary hover:bg-primary/10 flex items-center gap-1.5 py-2 px-3"
          >
            <BookmarkIcon className="h-4 w-4" />
            <span>{showReservations ? "إخفاء الأرقام المحجوزة" : "عرض الأرقام المحجوزة"}</span>
          </Button>
        </div>
      </div>

      {showReservations && (
        <Card className="mb-6 border-amber-500/30 bg-amber-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-amber-400 flex items-center gap-2 font-cairo text-lg">
              <BookmarkIcon className="h-5 w-5" />
              الأرقام المرجعية المحجوزة
            </CardTitle>
            <CardDescription className="text-amber-400/70">
              هذه الأرقام محجوزة للاستخدام. يمكنك استخدامها عند إضافة وثيقة جديدة.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activeReservations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {activeReservations.map((res) => (
                  <div key={res.id} className="flex flex-col justify-between rounded-md border border-amber-500/50 bg-amber-500/10 p-3 text-sm">
                    <div>
                      <p className="font-semibold text-amber-300 text-base">الرقم المحجوز: {res.referenceId}</p>
                      <p className="text-amber-400/80">
                        <span className="font-medium">نوع الوثيقة:</span> {res.type === 'inbound' ? 'وارد' : 'صادر'}
                      </p>
                      <p className="text-amber-400/80 truncate mt-1">
                        <span className="font-medium">ملاحظات:</span> {res.notes || "لا توجد"}
                      </p>
                      <p className="text-xs text-amber-400/60 mt-1.5">
                        <span className="font-medium">حجز بواسطة:</span> {res.reservedBy} في {new Date(res.reservedAt).toLocaleDateString('ar-EG')}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-amber-300 hover:bg-amber-400/20 hover:text-amber-200 mt-2 w-full justify-center"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          useManualReferenceId: true,
                          manualReferenceId: res.referenceId,
                          type: res.type
                        });
                        setShowReservations(false);
                        toast.info(`تم اختيار الرقم المحجوز ${res.referenceId} للإدخال اليدوي.`);
                      }}
                    >
                      استخدام هذا الرقم
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">لا توجد أرقام محجوزة حالياً.</p>
            )}
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="subject" className="text-sm font-medium flex items-center"><BriefcaseIcon className="h-4 w-4 mr-1.5 text-primary" />الجهة المرسل اليها</Label>
          <Textarea
            id="subject"
            name="subject"
            placeholder="أدخل الجهة المرسل اليها"
            value={formData.subject}
            onChange={handleChange}
            className="h-24 bg-background border-input resize-none"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="title" className="text-sm font-medium flex items-center"><FileTextIcon className="h-4 w-4 mr-1.5 text-primary" />الموضوع</Label>
          <Input
            id="title"
            name="title"
            placeholder="أدخل موضوع الوثيقة"
            value={formData.title}
            onChange={handleChange}
            className="bg-background border-input"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="type" className="text-sm font-medium flex items-center"><TypeIcon className="h-4 w-4 mr-1.5 text-primary" />نوع الوثيقة</Label>
          <Select
            value={formData.type}
            onValueChange={(value: "inbound" | "outbound") => handleTypeChange(value)}
          >
            <SelectTrigger id="type" className="w-full bg-background border-input">
              <SelectValue placeholder="حدد نوع الوثيقة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="inbound">وارد</SelectItem>
              <SelectItem value="outbound">صادر</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="date" className="text-sm font-medium flex items-center"><CalendarIcon className="h-4 w-4 mr-1.5 text-primary" />تاريخ الوثيقة</Label>
          <Input
            id="date"
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="bg-background border-input"
          />
        </div>
        
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
            <Label htmlFor="useManualReferenceId" className="text-sm font-medium flex items-center cursor-pointer">
              <Info className="h-4 w-4 mr-2 text-primary" />
              إدخال رقم مرجعي يدوياً (اختياري)
            </Label>
            <Switch 
              id="useManualReferenceId"
              checked={formData.useManualReferenceId} 
              onCheckedChange={handleManualReferenceToggle}
            />
          </div>
          
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-4 space-y-2">
              <div className="flex gap-2 items-start">
                <Input
                  name="manualReferenceId"
                  placeholder="أدخل الرقم المرجعي (مثال: 1، 2، 3)"
                  value={formData.manualReferenceId}
                  onChange={handleChange}
                  className={`bg-background border-input flex-1 text-center font-mono text-lg ${
                    manualRefStatus === "valid" ? "border-green-500 focus:border-green-500" : 
                    manualRefStatus === "invalid" ? "border-red-500 focus:border-red-500" : "border-input"
                  }`}
                  onBlur={() => validateManualReferenceId(formData.manualReferenceId)}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => validateManualReferenceId(formData.manualReferenceId)}
                  disabled={isManualRefValidating || !formData.manualReferenceId}
                  className="aspect-square h-10 w-10 border-input"
                >
                  {isManualRefValidating ? (
                    <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Info className="h-5 w-5" />
                  )}
                </Button>
              </div>
              
              {manualRefStatus && (
                <Alert variant={manualRefStatus === "valid" ? "default" : manualRefStatus === "invalid" ? "destructive" : "default"} className={`${manualRefStatus === "valid" ? "border-green-500/50 bg-green-500/10 text-green-700" : manualRefStatus === "invalid" ? "border-red-500/50 bg-red-500/10 text-red-700" : ""}`}>
                  <div className="flex gap-2 items-center">
                    {manualRefStatus === "valid" ? (
                      <p className="text-xs">هذا الرقم المرجعي متاح للاستخدام.</p>
                    ) : manualRefStatus === "invalid" ? (
                      <p className="text-xs">هذا الرقم المرجعي غير متاح أو صيغته غير صحيحة (يجب أن يكون رقماً فقط).</p>
                    ) : (
                      <p className="text-xs text-muted-foreground">جارٍ التحقق من الرقم المرجعي...</p>
                    )}
                  </div>
                </Alert>
              )}
              
              <Alert className="border-blue-500/20 bg-blue-500/5">
                <AlertCircle className="h-4 w-4 text-blue-500" />
                <AlertTitle className="text-blue-600">تنسيق الرقم المرجعي</AlertTitle>
                <AlertDescription className="text-blue-500/80">
                  الرقم المرجعي يجب أن يكون رقماً صحيحاً موجباً (مثل: 1، 23، 456).
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="sender" className="text-sm font-medium flex items-center"><UserIcon className="h-4 w-4 mr-1.5 text-primary" />المرسل/المُعد (المستخدم الحالي)</Label>
          <Input
            id="sender"
            name="sender"
            placeholder="اسم المُرسل أو مُعد الوثيقة"
            value={formData.sender}
            disabled
            className="bg-muted border-input cursor-not-allowed"
          />
        </div>
        
        <div className="space-y-2 pt-2">
          <Label htmlFor="file-upload-input" className="text-sm font-medium flex items-center"><UploadCloudIcon className="h-4 w-4 mr-1.5 text-primary" />الملف المرفق</Label>
          <Input
            id="file-upload-input"
            type="file"
            onChange={handleFileChange}
            className="bg-background border-input cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
            accept=".pdf,.docx,.doc,.xlsx,.xls,.jpg,.jpeg,.png,.txt"
          />
          <p className="text-xs text-muted-foreground pt-1">
            الملفات المدعومة: PDF, Word, Excel, JPG, PNG, TXT. الحد الأقصى للحجم: (حسب إعدادات النظام).
          </p>
        </div>
        
        <div className="flex justify-end gap-3 pt-4 border-t border-border mt-8">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
                setFormData({
                    type: "inbound", title: "", subject: "",
                    sender: user?.fullName || user?.username || "", date: new Date().toISOString().slice(0, 10),
                    file: null, useManualReferenceId: true, manualReferenceId: "",
                });
                const fileInput = document.getElementById("file-upload-input") as HTMLInputElement;
                if (fileInput) fileInput.value = "";
                setManualRefStatus(null);
                toast.info("تم مسح الحقول.");
            }}
            className="min-w-[100px]"
           >
            مسح الحقول
           </Button>
          <Button
            type="submit"
            disabled={isLoading || (formData.useManualReferenceId && manualRefStatus !== 'valid' && !!formData.manualReferenceId)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-[150px] flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                <span>جارٍ الرفع...</span>
              </>
            ) : (
              <><UploadCloudIcon className="h-4 w-4" /><span>رفع الوثيقة</span></>
            )}
          </Button>
        </div>
      </form>
      
      <Dialog open={isReservationDialogOpen} onOpenChange={setIsReservationDialogOpen}>
        <DialogContent className="sm:max-w-md bg-background text-foreground">
          <DialogHeader>
            <DialogTitle className="text-xl font-cairo font-bold text-amber-400 flex items-center gap-2">
              <BookmarkIcon className="h-5 w-5" />
              حجز رقم مرجعي
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              استخدم هذا النموذج لحجز رقم مرجعي (رقم صحيح موجب) لاستخدامه لاحقاً.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleReferenceReservation} className="space-y-4 pt-2">
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="reservationType" className="text-sm font-medium">نوع الوثيقة للرقم المحجوز</Label>
                <Select
                  value={reservationData.type}
                  onValueChange={(value: "inbound" | "outbound") => 
                    setReservationData({...reservationData, type: value })
                  }
                >
                  <SelectTrigger id="reservationType" className="w-full bg-background border-input">
                    <SelectValue placeholder="حدد نوع الوثيقة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inbound">وارد</SelectItem>
                    <SelectItem value="outbound">صادر</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="reservationRefId" className="text-sm font-medium">الرقم المرجعي للحجز</Label>
                <div className="flex gap-2 items-start">
                  <Input
                    id="reservationRefId"
                    name="referenceId"
                    placeholder="أدخل الرقم (مثال: 1، 2، 3)"
                    value={reservationData.referenceId}
                    onChange={handleReservationChange}
                    className={`bg-background border-input flex-1 text-center font-mono text-lg ${
                      manualRefStatus === "valid" ? "border-green-500 focus:border-green-500" : 
                      manualRefStatus === "invalid" ? "border-red-500 focus:border-red-500" : "border-input"
                    }`}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => validateManualReferenceId(reservationData.referenceId, true)}
                    disabled={isManualRefValidating || !reservationData.referenceId}
                    className="aspect-square h-10 w-10 border-input"
                  >
                    {isManualRefValidating ? (
                      <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Info className="h-5 w-5" />
                    )}
                  </Button>
                </div>
                
                {manualRefStatus && (
                    <Alert variant={manualRefStatus === "valid" ? "default" : manualRefStatus === "invalid" ? "destructive" : "default"} className={`${manualRefStatus === "valid" ? "border-green-500/50 bg-green-500/10 text-green-700" : manualRefStatus === "invalid" ? "border-red-500/50 bg-red-500/10 text-red-700" : ""}`}>
                        <div className="flex gap-2 items-center">
                        {manualRefStatus === "valid" ? (
                            <p className="text-xs">هذا الرقم متاح للحجز.</p>
                        ) : manualRefStatus === "invalid" ? (
                            <p className="text-xs">هذا الرقم غير متاح أو صيغته غير صحيحة.</p>
                        ) : (
                            <p className="text-xs text-muted-foreground">جارٍ التحقق...</p>
                        )}
                        </div>
                    </Alert>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="reservationNotes" className="text-sm font-medium">ملاحظات الحجز (اختياري)</Label>
                <Textarea
                  id="reservationNotes"
                  name="notes"
                  placeholder="أدخل ملاحظات حول سبب الحجز"
                  value={reservationData.notes}
                  onChange={handleReservationChange}
                  className="h-20 bg-background border-input resize-none"
                />
              </div>
            </div>
            
            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsReservationDialogOpen(false)}
                className="border-input min-w-[80px]"
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                disabled={isLoading || manualRefStatus !== 'valid' || !reservationData.referenceId}
                className="bg-amber-400 hover:bg-amber-500 text-black font-medium min-w-[140px] flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    <span>جار الحجز...</span>
                  </>
                ) : (
                  <><BookmarkIcon className="h-4 w-4" /><span>حجز الرقم</span></>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UploadDocument;
