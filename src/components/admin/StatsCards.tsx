import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ArchiveIcon, UsersIcon, ArrowDownCircleIcon, ArrowUpCircleIcon } from "lucide-react";
import { useDocuments } from "@/hooks/useDocuments";
import { useUsers } from "@/hooks/useUsers";

const StatsCards = () => {
  const { documentsStats } = useDocuments();
  const { usersCount } = useUsers();
  
  const cardBaseClasses = "bg-gradient-to-br border shadow-lg overflow-hidden relative transition-all duration-300 hover:shadow-xl hover:scale-[1.02] flex flex-col items-center text-center p-6 rounded-xl";
  const iconWrapperBaseClasses = "w-16 h-16 rounded-full flex items-center justify-center mb-3 transition-all duration-300 group-hover:scale-110";
  const iconClasses = "h-8 w-8";
  const titleBarBaseClasses = "absolute top-0 left-0 w-full h-1.5";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <Card className={`${cardBaseClasses} from-blue-500/10 to-blue-500/20 border-blue-400/30 group`}>
        <div className={`${titleBarBaseClasses} bg-gradient-to-r from-blue-400 to-blue-600`}></div>
        <div className={`${iconWrapperBaseClasses} bg-blue-500/20`}>
          <ArchiveIcon className={`${iconClasses} text-blue-500`} />
        </div>
        <p className="text-sm font-medium text-muted-foreground font-cairo mb-0.5">إجمالي المستندات</p>
        <h3 className="text-3xl font-bold text-foreground">
          {documentsStats?.total || 0}
        </h3>
      </Card>
      
      <Card className={`${cardBaseClasses} from-emerald-500/10 to-emerald-500/20 border-emerald-400/30 group`}>
        <div className={`${titleBarBaseClasses} bg-gradient-to-r from-emerald-400 to-emerald-600`}></div>
        <div className={`${iconWrapperBaseClasses} bg-emerald-500/20`}>
          <ArrowDownCircleIcon className={`${iconClasses} text-emerald-500`} />
        </div>
        <p className="text-sm font-medium text-muted-foreground font-cairo mb-0.5">اخر رقم وارد</p>
        <h3 className="text-2xl font-bold text-foreground font-cairo">
          {documentsStats?.inboundCount > 0 ? documentsStats?.lastInboundRef : "لا يوجد"}
        </h3>
      </Card>
      
      <Card className={`${cardBaseClasses} from-amber-500/10 to-amber-500/20 border-amber-400/30 group`}>
        <div className={`${titleBarBaseClasses} bg-gradient-to-r from-amber-400 to-amber-600`}></div>
        <div className={`${iconWrapperBaseClasses} bg-amber-500/20`}>
          <ArrowUpCircleIcon className={`${iconClasses} text-amber-500`} />
        </div>
        <p className="text-sm font-medium text-muted-foreground font-cairo mb-0.5">اخر رقم صادر</p>
        <h3 className="text-2xl font-bold text-foreground font-cairo">
          {documentsStats?.outboundCount > 0 ? documentsStats?.lastOutboundRef : "لا يوجد"}
        </h3>
      </Card>
      
      <Card className={`${cardBaseClasses} from-purple-500/10 to-purple-500/20 border-purple-400/30 group`}>
        <div className={`${titleBarBaseClasses} bg-gradient-to-r from-purple-400 to-purple-600`}></div>
        <div className={`${iconWrapperBaseClasses} bg-purple-500/20`}>
          <UsersIcon className={`${iconClasses} text-purple-500`} />
        </div>
        <p className="text-sm font-medium text-muted-foreground font-cairo mb-0.5">إجمالي المستخدمين</p>
        <h3 className="text-3xl font-bold text-foreground">
          {usersCount || 0}
        </h3>
      </Card>
    </div>
  );
};

export default StatsCards;
