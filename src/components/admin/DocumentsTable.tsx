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
import { Edit, Eye, Search, Calendar, Trash2, User, BookmarkIcon, Edit2 } from "lucide-react";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface DocumentsTableProps {
  type: "inbound" | "outbound";
}

const DocumentsTable = ({ type }: DocumentsTableProps) => {
  const { documents, isLoading, deleteDocument, getActiveReservations } = useDocuments(type);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<any>({});
  const [reservations, setReservations] = useState<any[]>([]);
  
  // Load reservations on component mount
  useEffect(() => {
    setReservations(getActiveReservations());
  }, [getActiveReservations]);
  
  const filteredDocuments = documents?.filter(doc =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.id.toString().includes(searchTerm) ||
    (doc.uploadedBy && doc.uploadedBy.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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

  const handleDelete = (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذه الوثيقة؟")) {
      deleteDocument(id);
      toast.success("تم حذف الوثيقة بنجاح");
    }
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
          {/* Swapped positions of search box and title */}
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
          <h2 className="text-xl font-bold text-primary font-cairo">
            {type === "inbound" ? "الوثائق الواردة" : "الوثائق الصادرة"}
          </h2>
        </div>

        <div className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center font-cairo text-muted-foreground w-44">الإجراءات</TableHead>
                <TableHead className="text-center font-cairo text-muted-foreground">الجهة المرسل إليها</TableHead>
                <TableHead className="text-center font-cairo text-muted-foreground">الموضوع</TableHead>
                <TableHead className="text-center font-cairo text-muted-foreground">نوع الوثيقة</TableHead>
                <TableHead className="text-center font-cairo text-muted-foreground">التاريخ</TableHead>
                <TableHead className="text-center font-cairo text-muted-foreground">
                  {type === "inbound" ? "رقم الوارد" : "رقم الصادر"}
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
                          onClick={() => handleDelete(doc.id)}
                          className="text-destructive border-destructive hover:bg-destructive/10 transition-colors"
                        >
                          <Trash2 className="h-4 w-4 ml-1" />
                          حذف
                        </Button>
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
                    لا توجد وثائق
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* View Document Dialog */}
      <Dialog open={!!selectedDoc} onOpenChange={(open) => !open && setSelectedDoc(null)}>
        <DialogContent className="bg-card text-foreground border-border sm:max-w-xl" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-primary font-cairo text-xl">تفاصيل الوثيقة</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              عرض تفاصيل الوثيقة الكاملة
            </DialogDescription>
          </DialogHeader>
          
          {selectedDoc && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/30 p-3 rounded-md">
                  <p className="text-sm text-muted-foreground font-cairo mb-1">رقم المرجع</p>
                  <p className="font-medium text-foreground">{selectedDoc.id}</p>
                </div>
                <div className="bg-muted/30 p-3 rounded-md">
                  <p className="text-sm text-muted-foreground font-cairo mb-1">التاريخ</p>
                  <p className="font-medium text-foreground flex items-center">
                    <Calendar className="h-4 w-4 ml-1 text-primary" />
                    {selectedDoc.date ? format(new Date(selectedDoc.date), "MMM dd, yyyy", { locale: enUS }) : "غير محدد"}
                  </p>
                </div>
                <div className="bg-muted/30 p-3 rounded-md">
                  <p className="text-sm text-muted-foreground font-cairo mb-1">الموضوع</p>
                  <p className="font-medium text-foreground">{selectedDoc.title}</p>
                </div>
                <div className="bg-muted/30 p-3 rounded-md">
                  <p className="text-sm text-muted-foreground font-cairo mb-1">الجهة المرسل إليها</p>
                  <p className="font-medium text-foreground">{selectedDoc.subject}</p>
                </div>
              </div>
              
              <div className="bg-muted/30 p-3 rounded-md">
                <p className="text-sm text-muted-foreground font-cairo mb-1">تم الرفع بواسطة</p>
                <p className="font-medium text-foreground">{selectedDoc.uploadedBy || "غير محدد"}</p>
              </div>
              
              {selectedDoc.fileUrl && (
                <div className="pt-4">
                  <Button 
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-cairo"
                    onClick={() => window.open(selectedDoc.fileUrl, "_blank")}
                  >
                    عرض الملف
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Document Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-card text-foreground border-border sm:max-w-xl" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-primary font-cairo text-xl">تعديل الوثيقة</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              قم بتعديل بيانات الوثيقة
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-cairo text-muted-foreground">رقم المرجع</label>
                <Input
                  name="id"
                  value={editFormData.id || ""}
                  onChange={handleEditInputChange}
                  disabled
                  className="bg-muted/50 border-muted cursor-not-allowed"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-cairo text-muted-foreground">التاريخ</label>
                <Input
                  name="date"
                  type="date"
                  value={editFormData.date || ""}
                  onChange={handleEditInputChange}
                  className="bg-background border-input"
                />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-cairo text-muted-foreground">الموضوع</label>
                <Input
                  name="title"
                  value={editFormData.title || ""}
                  onChange={handleEditInputChange}
                  className="bg-background border-input"
                />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-cairo text-muted-foreground">الجهة المرسل إليها</label>
                <Input
                  name="subject"
                  value={editFormData.subject || ""}
                  onChange={handleEditInputChange}
                  className="bg-background border-input"
                />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-cairo text-muted-foreground">تفاصيل إضافية</label>
                <Input
                  name="sender"
                  value={editFormData.sender || ""}
                  onChange={handleEditInputChange}
                  className="bg-background border-input"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                className="border-input"
              >
                إلغاء
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90">
                حفظ التغييرات
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DocumentsTable;
