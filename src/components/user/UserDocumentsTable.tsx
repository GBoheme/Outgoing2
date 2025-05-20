import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDocuments } from "@/hooks/useDocuments";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Send, Edit, Eye, Search, Calendar, User, BookmarkIcon, Edit2 } from "lucide-react";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const UserDocumentsTable = () => {
  const { user } = useAuth();
  const { documents, isLoading, getActiveReservations } = useDocuments(); // Get all documents and reservations
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [documentType, setDocumentType] = useState<"all" | "inbound" | "outbound">("all");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<any>({});
  const [reservations, setReservations] = useState<any[]>([]);
  
  // Fetch reservations when component mounts
  useEffect(() => {
    setReservations(getActiveReservations());
  }, [getActiveReservations]);

  // Debug logs to help understand what's happening
  useEffect(() => {
    console.log("Current user:", user);
    console.log("All Documents:", documents);
    console.log("Reservations:", reservations);
  }, [user, documents, reservations]);
  
  // Filter based on search term and document type
  const filteredDocuments = documents.filter(doc => {
    // Filter by search term
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.id.toString().includes(searchTerm) ||
      (doc.uploadedBy && doc.uploadedBy.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Filter by document type
    const matchesType = documentType === "all" || doc.type === documentType;
    
    return matchesSearch && matchesType;
  });

  // Find reservation for a document
  const getReservationForDocument = (docId: string) => {
    return reservations.find(res => res.referenceId === docId);
  };

  const handleView = (doc: any) => {
    setSelectedDoc(doc);
  };

  const handleEdit = (doc: any) => {
    console.log("Edit document:", doc);
    setEditFormData({...doc});
    setIsEditDialogOpen(true);
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real application, this would update the document in the database
    // For now, we'll just show a toast message
    console.log("Saving document changes:", editFormData);
    toast.success("تم تحديث الوثيقة بنجاح");
    setIsEditDialogOpen(false);
  };

  return (
    <>
      <div className="bg-card rounded-lg border border-border p-5 shadow-md">
        <div className="mb-5 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className="text-xl font-bold text-primary font-cairo">وثائقي</h2>
          <div className="w-full sm:w-72">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="بحث..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-background border-border text-foreground pl-4 pr-10 placeholder:text-muted-foreground rounded-md"
              />
            </div>
          </div>
        </div>
        
        <div className="mb-5">
          <Tabs 
            defaultValue="all" 
            className="w-full" 
            onValueChange={(value) => setDocumentType(value as "all" | "inbound" | "outbound")}
          >
            <TabsList className="grid grid-cols-3 mb-2 bg-muted">
              <TabsTrigger 
                value="all" 
                className="font-cairo data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                جميع الوثائق
              </TabsTrigger>
              <TabsTrigger 
                value="inbound" 
                className="font-cairo data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <FileText className="ml-2 h-4 w-4" />
                <span>الوارد</span>
              </TabsTrigger>
              <TabsTrigger 
                value="outbound" 
                className="font-cairo data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Send className="ml-2 h-4 w-4" />
                <span>الصادر</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center font-cairo text-muted-foreground w-36">الإجراءات</TableHead>
                <TableHead className="text-center font-cairo text-muted-foreground">الجهة المرسل إليها</TableHead>
                <TableHead className="text-center font-cairo text-muted-foreground">الموضوع</TableHead>
                <TableHead className="text-center font-cairo text-muted-foreground">نوع الوثيقة</TableHead>
                <TableHead className="text-center font-cairo text-muted-foreground">التاريخ</TableHead>
                <TableHead className="text-center font-cairo text-muted-foreground">
                  {documentType === "all" ? "الرقم" : 
                   documentType === "inbound" ? "رقم الوارد" : "رقم الصادر"}
                </TableHead>
                <TableHead className="text-center font-cairo text-muted-foreground">أنشأ بواسطة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    <div className="flex justify-center">
                      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredDocuments && filteredDocuments.length > 0 ? (
                filteredDocuments.map((doc) => {
                  const reservation = getReservationForDocument(doc.id);
                  return (
                    <TableRow key={doc.id}>
                      <TableCell className="flex gap-2 justify-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(doc)}
                          className="text-blue-400 border-blue-400 hover:bg-blue-400/10 transition-colors"
                        >
                          <Edit className="h-4 w-4 ml-1" />
                          تعديل
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleView(doc)}
                          className="text-primary border-primary hover:bg-primary/10 transition-colors"
                        >
                          <Eye className="h-4 w-4 ml-1" />
                          عرض
                        </Button>
                      </TableCell>
                      <TableCell className="text-foreground max-w-[150px] truncate text-center">{doc.subject}</TableCell>
                      <TableCell className="text-foreground max-w-[200px] truncate text-center">{doc.title}</TableCell>
                      <TableCell className="text-center">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          doc.type === "inbound" ? "bg-blue-500/20 text-blue-400" : "bg-green-500/20 text-green-400"
                        }`}>
                          {doc.type === "inbound" ? "وارد" : "صادر"}
                        </span>
                      </TableCell>
                      <TableCell className="text-foreground whitespace-nowrap text-center">
                        <div className="flex items-center justify-center">
                          <Calendar className="h-4 w-4 ml-1 text-muted-foreground" />
                          {doc.date ? format(new Date(doc.date), "MMM dd, yyyy", { locale: enUS }) : "غير محدد"}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-foreground text-center">
                        <div className="flex items-center gap-1 justify-center">
                          {doc.id}
                          {doc.isManualReference && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Edit2 className="h-4 w-4 text-blue-400" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>رقم مدخل يدوياً</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                          {reservation && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <BookmarkIcon className="h-4 w-4 text-amber-400" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>رقم محجوز: {reservation.notes}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-foreground text-center">
                        <div className="flex items-center gap-1 justify-center">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {doc.uploadedBy || "غير معروف"}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    لا توجد وثائق مطابقة
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Document View Dialog */}
      <Dialog open={selectedDoc !== null} onOpenChange={(open) => !open && setSelectedDoc(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto bg-background text-foreground">
          <DialogHeader>
            <DialogTitle className="text-xl font-cairo font-bold text-primary mb-2 flex items-center gap-2">
              {selectedDoc?.type === "inbound" ? (
                <FileText className="text-blue-400" />
              ) : (
                <Send className="text-green-400" />
              )}
              {selectedDoc?.title}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground mb-1">
              {selectedDoc?.type === "inbound" ? "وثيقة واردة" : "وثيقة صادرة"} - الرقم المرجعي: {selectedDoc?.id}
              {selectedDoc?.isManualReference && (
                <span className="mr-2 text-blue-400 text-xs">(رقم مدخل يدوياً)</span>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {selectedDoc && (
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">الموضوع</p>
                  <p className="text-foreground">{selectedDoc.title}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">تاريخ الوثيقة</p>
                  <p className="text-foreground">
                    {selectedDoc.date ? format(new Date(selectedDoc.date), "MMM dd, yyyy", { locale: enUS }) : "غير محدد"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">الجهة المرسل إليها</p>
                  <p className="text-foreground">{selectedDoc.subject}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">أنشأ بواسطة</p>
                  <p className="text-foreground flex items-center gap-1">
                    <User className="h-4 w-4 text-muted-foreground" />
                    {selectedDoc.uploadedBy || "غير معروف"}
                  </p>
                </div>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">الموضوع</p>
                <p className="text-foreground p-3 bg-muted/40 rounded-md min-h-[80px]">{selectedDoc.subject}</p>
              </div>
              
              {/* Show reservation details if this document has a reservation */}
              {getReservationForDocument(selectedDoc.id) && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-md p-3 text-amber-400">
                  <h4 className="text-sm font-medium mb-1 flex items-center gap-1">
                    <BookmarkIcon className="h-4 w-4" />
                    تفاصيل الحجز
                  </h4>
                  <p className="text-sm">
                    تم حجز هذا الرقم بواسطة: <strong>{getReservationForDocument(selectedDoc.id)?.reservedBy || "غير معروف"}</strong>
                  </p>
                  <p className="text-sm mt-1">
                    ملاحظات: {getReservationForDocument(selectedDoc.id)?.notes || "لا توجد ملاحظات"}
                  </p>
                </div>
              )}
              
              {selectedDoc.fileUrl && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">الملف المرفق</p>
                  <a 
                    href={selectedDoc.fileUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 bg-muted/40 rounded-md hover:bg-muted transition-colors"
                  >
                    <FileText className="text-primary" />
                    <span>عرض/تنزيل الملف المرفق</span>
                  </a>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-lg bg-background text-foreground">
          <DialogHeader>
            <DialogTitle className="text-xl font-cairo font-bold text-primary">تعديل الوثيقة</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleEditSubmit}>
            <div className="space-y-4 my-2">
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">موضوع الوثيقة</label>
                <Input 
                  id="title" 
                  name="title" 
                  value={editFormData.title || ""} 
                  onChange={handleEditInputChange} 
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="sender" className="text-sm font-medium">الجهة المرسل إليها</label>
                <Input 
                  id="sender" 
                  name="subject" 
                  value={editFormData.subject || ""} 
                  onChange={handleEditInputChange} 
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="date" className="text-sm font-medium">تاريخ الوثيقة</label>
                <Input 
                  type="date" 
                  id="date" 
                  name="date" 
                  value={editFormData.date || ""} 
                  onChange={handleEditInputChange} 
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-medium">موضوع الوثيقة</label>
                <textarea 
                  id="subject" 
                  name="subject" 
                  value={editFormData.subject || ""} 
                  onChange={handleEditInputChange} 
                  className="w-full min-h-[100px] p-2 rounded-md border border-border bg-background text-foreground"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" type="button" onClick={() => setIsEditDialogOpen(false)}>
                إلغاء
              </Button>
              <Button type="submit">
                حفظ التغييرات
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UserDocumentsTable;
