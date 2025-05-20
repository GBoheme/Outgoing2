import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useAuth } from "@/hooks/useAuth";

// Define types
type Document = {
  id: string;
  title: string;
  subject: string;
  date: string;
  sender: string;
  uploadedBy: string;
  type: "inbound" | "outbound";
  fileUrl?: string;
  isManualReference?: boolean;
};

type DocumentStats = {
  total: number;
  inboundCount: number;
  outboundCount: number;
  lastInboundRef: string;
  lastOutboundRef: string;
};

interface UploadDocumentData {
  type: "inbound" | "outbound";
  title: string;
  subject: string;
  sender: string;
  date: string;
  file: File | null;
  useManualReferenceId?: boolean;
  manualReferenceId?: string;
}

interface ReferenceReservation {
  id: string;
  referenceId: string;
  type: "inbound" | "outbound";
  notes: string;
  reservedBy: string;
  reservedAt: string;
  isUsed: boolean;
  usedAt?: string;
  usedDocumentId?: string;
}

interface ReserveReferenceIdData {
  type: "inbound" | "outbound";
  referenceId: string;
  notes: string;
  reservedBy: string;
}

// بيانات افتراضية للوثائق الواردة
const defaultInboundDocuments: Document[] = [
  {
    id: "IN-001",
    title: "طلب تعاون",
    subject: "طلب تعاون في مشروع تطوير البنية التحتية لتقنية المعلومات",
    date: "2025-05-01",
    sender: "وزارة الاتصالات",
    uploadedBy: "admin", // Changed to match current user's username
    type: "inbound",
  },
  {
    id: "IN-002",
    title: "دعوة لحضور مؤتمر",
    subject: "دعوة لحضور مؤتمر التقنية السنوي",
    date: "2025-05-05",
    sender: "شركة تقنية",
    uploadedBy: "admin", // Changed to match current user's username
    type: "inbound",
  },
  {
    id: "IN-003",
    title: "عرض شراكة",
    subject: "عرض شراكة استراتيجية في مجال تطوير البرمجيات",
    date: "2025-05-10",
    sender: "شركة برمجيات عالمية",
    uploadedBy: "admin", // Changed to match current user's username
    type: "inbound",
  },
];

// بيانات افتراضية للوثائق الصادرة
const defaultOutboundDocuments: Document[] = [
  {
    id: "OUT-001",
    title: "رد على طلب تعاون",
    subject: "الموافقة على طلب التعاون في مشروع تطوير البنية التحتية",
    date: "2025-05-03",
    sender: "وزارة الداخلية",
    uploadedBy: "admin", // Changed to match current user's username
    type: "outbound",
  },
  {
    id: "OUT-002",
    title: "طلب توريد معدات",
    subject: "طلب توريد معدات تقنية للمشروع الجديد",
    date: "2025-05-07",
    sender: "شركة التوريدات التقنية",
    uploadedBy: "admin", // Changed to match current user's username
    type: "outbound",
  },
];

// Default reservations (empty array)
const defaultReservations: ReferenceReservation[] = [];

// إعادة تعيين مجموعة الوثائق - تعديل الوظيفة لاستخدام مباشر للتخزين المحلي
export const resetDocuments = (options: { inbound: boolean, outbound: boolean }) => {
  if (options.inbound) {
    localStorage.setItem("documents-inbound", JSON.stringify([]));
  }
  if (options.outbound) {
    localStorage.setItem("documents-outbound", JSON.stringify([]));
  }
};

// إعادة تعيين عدادات الوثائق للسنة الجديدة
export const resetDocumentCounters = () => {
  localStorage.setItem("inboundCounter", "1");
  localStorage.setItem("outboundCounter", "1");
};

export const useDocuments = (type?: "inbound" | "outbound" | "user", userEmail?: string) => {
  // Get the current authenticated user
  const { user } = useAuth();
  
  // استخدام useLocalStorage لتخزين الوثائق
  const [inboundDocuments, setInboundDocuments] = useLocalStorage<Document[]>("documents-inbound", defaultInboundDocuments);
  const [outboundDocuments, setOutboundDocuments] = useLocalStorage<Document[]>("documents-outbound", defaultOutboundDocuments);
  const [referenceReservations, setReferenceReservations] = useLocalStorage<ReferenceReservation[]>("reference-reservations", defaultReservations);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [documentsStats, setDocumentsStats] = useState<DocumentStats | null>(null);
  
  // إعداد عدادات الوثائق إذا لم تكن موجودة
  useEffect(() => {
    if (!localStorage.getItem("inboundCounter")) {
      localStorage.setItem("inboundCounter", String(inboundDocuments.length + 1));
    }
    if (!localStorage.getItem("outboundCounter")) {
      localStorage.setItem("outboundCounter", String(outboundDocuments.length + 1));
    }
  }, [inboundDocuments.length, outboundDocuments.length]);

  useEffect(() => {
    setIsLoading(true);
    
    setTimeout(() => {
      // Get all documents regardless of type
      const allDocs = [...inboundDocuments, ...outboundDocuments];
      
      // Filter by type if specified
      if (type === "inbound") {
        setDocuments([...inboundDocuments]);
      } else if (type === "outbound") {
        setDocuments([...outboundDocuments]);
      } else {
        // Default: all documents
        setDocuments(allDocs);
      }
      
      // Calculate stats
      const inboundCount = inboundDocuments.length;
      const outboundCount = outboundDocuments.length;
      
      setDocumentsStats({
        total: allDocs.length,
        inboundCount,
        outboundCount,
        lastInboundRef: inboundCount > 0 ? inboundDocuments[inboundCount - 1].id : "",
        lastOutboundRef: outboundCount > 0 ? outboundDocuments[outboundCount - 1].id : "",
      });
      
      setIsLoading(false);
    }, 300);
  }, [type, userEmail, inboundDocuments, outboundDocuments]);

  // Check if a reference ID is available (not used in documents or reserved)
  const isReferenceIdAvailable = async (referenceId: string): Promise<boolean> => {
    // محاكاة تأخير مكالمة API
    await new Promise(resolve => setTimeout(resolve, 300));

    // Validate if the referenceId is a positive integer if it's not from a known prefix
    // This validation might be too strict if other formats are ever allowed without manual input.
    // For now, we assume manual/reserved IDs are also numeric or handled by reservation check.
    if (!referenceId.match(/^\d+$/)) {
        // If not purely numeric, it might be an old prefixed ID or an invalid input.
        // We can be more lenient here or stricter based on how existing data should be handled.
        // For now, let's assume existing prefixed IDs are valid and don't match /\d+/.
        // New manual IDs are expected to be numeric based on UI changes.
    }

    // Check if used in documents
    const inboundExists = inboundDocuments.some(doc => doc.id === referenceId);
    const outboundExists = outboundDocuments.some(doc => doc.id === referenceId);
    
    // Check if reserved
    const reservationExists = referenceReservations.some(
      reservation => reservation.referenceId === referenceId && !reservation.isUsed
    );
    
    return !inboundExists && !outboundExists && !reservationExists;
  };

  // Reserve a reference ID
  const reserveReferenceId = async (data: ReserveReferenceIdData): Promise<ReferenceReservation> => {
    setIsLoading(true);
    
    // محاكاة تأخير مكالمة API
    await new Promise(resolve => setTimeout(resolve, 600));

    // Generate a unique ID for the reservation
    const reservationId = `RES-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    const newReservation: ReferenceReservation = {
      id: reservationId,
      referenceId: data.referenceId,
      type: data.type,
      notes: data.notes,
      reservedBy: data.reservedBy,
      reservedAt: new Date().toISOString(),
      isUsed: false
    };
    
    // Add to reservations
    setReferenceReservations([...referenceReservations, newReservation]);
    
    setIsLoading(false);
    return newReservation;
  };

  // Get all active reservations
  const getActiveReservations = () => {
    return referenceReservations.filter(res => !res.isUsed);
  };

  // Mark a reservation as used
  const markReservationAsUsed = (referenceId: string, documentId: string) => {
    const updatedReservations = referenceReservations.map(res => {
      if (res.referenceId === referenceId && !res.isUsed) {
        return {
          ...res,
          isUsed: true,
          usedAt: new Date().toISOString(),
          usedDocumentId: documentId
        };
      }
      return res;
    });
    
    setReferenceReservations(updatedReservations);
  };

  const uploadDocument = async (data: UploadDocumentData) => {
    setIsLoading(true);
    
    // محاكاة تأخير مكالمة API
    await new Promise(resolve => setTimeout(resolve, 600));

    // الحصول على معرّف جديد
    let newId: string;
    
    if (data.useManualReferenceId && data.manualReferenceId) {
      // Use manually entered reference ID
      newId = data.manualReferenceId;
    } else {
      // Get or create from counter for simple numeric ID
      if (data.type === "inbound") {
        const counterStr = localStorage.getItem("inboundCounter") || "1";
        const counter = parseInt(counterStr);
        newId = String(counter); // Simple numeric ID
        localStorage.setItem("inboundCounter", String(counter + 1));
      } else {
        const counterStr = localStorage.getItem("outboundCounter") || "1";
        const counter = parseInt(counterStr);
        newId = String(counter); // Simple numeric ID
        localStorage.setItem("outboundCounter", String(counter + 1));
      }
    }

    // Use the current authenticated user's username
    const currentUser = user?.username || "guest";
    console.log("Uploading document as user:", currentUser);

    const newDocument: Document = {
      id: newId,
      title: data.title,
      subject: data.subject,
      date: data.date,
      sender: data.sender,
      uploadedBy: currentUser,
      type: data.type,
      fileUrl: data.file ? URL.createObjectURL(data.file) : undefined,
      isManualReference: data.useManualReferenceId
    };
    
    console.log("Created new document:", newDocument);
    
    // Update localStorage state
    if (data.type === "inbound") {
      setInboundDocuments([...inboundDocuments, newDocument]);
    } else {
      setOutboundDocuments([...outboundDocuments, newDocument]);
    }

    // If this was a reserved reference ID, mark it as used
    const reservation = referenceReservations.find(
      res => res.referenceId === newId && !res.isUsed
    );
    
    if (reservation) {
      markReservationAsUsed(newId, newId);
    }
    
    toast.success(`تم رفع الوثيقة بنجاح برقم مرجعي: ${newId}`);
    setIsLoading(false);
    return newDocument;
  };

  const deleteDocument = async (id: string) => {
    setIsLoading(true);
    
    // محاكاة تأخير مكالمة API
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // تحديد نوع الوثيقة من المعرّف
    if (id.startsWith("IN-")) {
      const updatedDocs = inboundDocuments.filter(doc => doc.id !== id);
      setInboundDocuments(updatedDocs);
    } else if (id.startsWith("OUT-")) {
      const updatedDocs = outboundDocuments.filter(doc => doc.id !== id);
      setOutboundDocuments(updatedDocs);
    }
    
    toast.success("تم حذف الوثيقة بنجاح");
    setIsLoading(false);
  };

  return {
    documents,
    documentsStats,
    isLoading,
    uploadDocument,
    deleteDocument,
    isReferenceIdAvailable,
    reserveReferenceId,
    getActiveReservations,
  };
};
