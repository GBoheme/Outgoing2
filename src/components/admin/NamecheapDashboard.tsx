
import React, { useState } from "react";
import { useNamecheap } from "@/hooks/useNamecheap";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Globe, Server, Lock, Trash2, Edit, Plus } from "lucide-react";

const NamecheapDashboard: React.FC = () => {
  const {
    domains,
    hostingAccounts,
    sslCertificates,
    stats,
    isLoading,
    deleteDomain,
    deleteHostingAccount,
    deleteSSLCertificate,
    reset
  } = useNamecheap();

  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const [deletingItemType, setDeletingItemType] = useState<"domain" | "hosting" | "ssl" | null>(null);

  const handleDelete = () => {
    if (!deletingItemId || !deletingItemType) return;

    let success = false;
    let itemName = "";

    switch (deletingItemType) {
      case "domain":
        const domain = domains.find(d => d.id === deletingItemId);
        itemName = domain ? `${domain.name}.${domain.extension}` : "النطاق";
        success = deleteDomain(deletingItemId);
        break;
      case "hosting":
        const hosting = hostingAccounts.find(h => h.id === deletingItemId);
        itemName = hosting ? hosting.planName : "حساب الاستضافة";
        success = deleteHostingAccount(deletingItemId);
        break;
      case "ssl":
        const ssl = sslCertificates.find(s => s.id === deletingItemId);
        itemName = ssl ? ssl.domain : "شهادة SSL";
        success = deleteSSLCertificate(deletingItemId);
        break;
    }

    if (success) {
      toast.success(`تم حذف ${itemName} بنجاح`);
    } else {
      toast.error(`فشل حذف ${itemName}`);
    }

    // إعادة تعيين حالة الحذف
    setDeletingItemId(null);
    setDeletingItemType(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ar', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-600">نشط</Badge>;
      case "expired":
        return <Badge variant="destructive">منتهي</Badge>;
      case "expiring":
        return <Badge className="bg-amber-500">قريب الانتهاء</Badge>;
      case "pending":
        return <Badge className="bg-blue-600">قيد الانتظار</Badge>;
      case "suspended":
        return <Badge variant="destructive">معلق</Badge>;
      case "canceled":
        return <Badge className="bg-gray-500">ملغي</Badge>;
      case "transferred":
        return <Badge className="bg-purple-600">منقول</Badge>;
      case "revoked":
        return <Badge variant="destructive">ملغي</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* بطاقات الإحصائيات */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-card border-border shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-primary flex items-center gap-2">
                <Globe className="h-5 w-5" /> النطاقات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats.activeDomains} / {stats.totalDomains}</div>
              <p className="text-sm text-muted-foreground">نطاقات نشطة من إجمالي النطاقات</p>
              {stats.expiringDomains > 0 && (
                <p className="text-sm text-amber-500 mt-2">
                  {stats.expiringDomains} نطاقات قريبة الانتهاء
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-primary flex items-center gap-2">
                <Server className="h-5 w-5" /> الاستضافة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats.activeHosting} / {stats.totalHosting}</div>
              <p className="text-sm text-muted-foreground">حسابات نشطة من إجمالي الحسابات</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-primary flex items-center gap-2">
                <Lock className="h-5 w-5" /> شهادات SSL
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats.activeSSL} / {stats.totalSSL}</div>
              <p className="text-sm text-muted-foreground">شهادات نشطة من إجمالي الشهادات</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-primary">إجمالي الإنفاق</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{formatPrice(stats.totalSpent)}</div>
              <p className="text-sm text-muted-foreground">القيمة الإجمالية للمشتريات</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* علامات التبويب للخدمات */}
      <Tabs defaultValue="domains" className="w-full">
        <TabsList className="w-full mb-6 bg-accent">
          <TabsTrigger
            value="domains"
            className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            النطاقات
          </TabsTrigger>
          <TabsTrigger
            value="hosting"
            className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            الاستضافة
          </TabsTrigger>
          <TabsTrigger
            value="ssl"
            className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            شهادات SSL
          </TabsTrigger>
        </TabsList>

        {/* محتوى النطاقات */}
        <TabsContent value="domains">
          <Card className="bg-card border-border shadow-md">
            <CardHeader className="pb-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-primary">إدارة النطاقات</CardTitle>
                <CardDescription className="text-muted-foreground">
                  {domains.length} نطاقات مسجلة
                </CardDescription>
              </div>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" /> إضافة نطاق
              </Button>
            </CardHeader>
            <CardContent>
              {domains.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  لا توجد نطاقات مسجلة
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>النطاق</TableHead>
                        <TableHead>تاريخ التسجيل</TableHead>
                        <TableHead>تاريخ الانتهاء</TableHead>
                        <TableHead>الحالة</TableHead>
                        <TableHead>خصوصية</TableHead>
                        <TableHead>التجديد التلقائي</TableHead>
                        <TableHead>السعر</TableHead>
                        <TableHead>الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {domains.map((domain) => (
                        <TableRow key={domain.id}>
                          <TableCell className="font-medium">{domain.name}.{domain.extension}</TableCell>
                          <TableCell>{formatDate(domain.registrationDate)}</TableCell>
                          <TableCell>{formatDate(domain.expiryDate)}</TableCell>
                          <TableCell>{getStatusBadge(domain.status)}</TableCell>
                          <TableCell>
                            {domain.privacy === "enabled" ? (
                              <Badge className="bg-green-600">مفعلة</Badge>
                            ) : (
                              <Badge variant="outline">غير مفعلة</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {domain.autorenew === "enabled" ? (
                              <Badge className="bg-green-600">مفعل</Badge>
                            ) : (
                              <Badge variant="outline">غير مفعل</Badge>
                            )}
                          </TableCell>
                          <TableCell>{formatPrice(domain.renewPrice)}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2 space-x-reverse">
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                    onClick={() => {
                                      setDeletingItemId(domain.id);
                                      setDeletingItemType("domain");
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="bg-card border-border">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="text-foreground">حذف النطاق</AlertDialogTitle>
                                    <AlertDialogDescription className="text-muted-foreground">
                                      هل أنت متأكد من رغبتك في حذف النطاق {domain.name}.{domain.extension}؟
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter className="sm:justify-start">
                                    <AlertDialogCancel className="bg-muted text-muted-foreground">إلغاء</AlertDialogCancel>
                                    <AlertDialogAction
                                      className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                                      onClick={handleDelete}
                                    >
                                      حذف
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* محتوى الاستضافة */}
        <TabsContent value="hosting">
          <Card className="bg-card border-border shadow-md">
            <CardHeader className="pb-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-primary">إدارة حسابات الاستضافة</CardTitle>
                <CardDescription className="text-muted-foreground">
                  {hostingAccounts.length} حسابات استضافة مسجلة
                </CardDescription>
              </div>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" /> إضافة حساب استضافة
              </Button>
            </CardHeader>
            <CardContent>
              {hostingAccounts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  لا توجد حسابات استضافة مسجلة
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>الخطة</TableHead>
                        <TableHead>النطاقات</TableHead>
                        <TableHead>تاريخ الشراء</TableHead>
                        <TableHead>تاريخ الانتهاء</TableHead>
                        <TableHead>الحالة</TableHead>
                        <TableHead>التجديد التلقائي</TableHead>
                        <TableHead>السعر</TableHead>
                        <TableHead>الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {hostingAccounts.map((account) => (
                        <TableRow key={account.id}>
                          <TableCell className="font-medium">{account.planName}</TableCell>
                          <TableCell>{account.domains.join(', ')}</TableCell>
                          <TableCell>{formatDate(account.purchaseDate)}</TableCell>
                          <TableCell>{formatDate(account.expiryDate)}</TableCell>
                          <TableCell>{getStatusBadge(account.status)}</TableCell>
                          <TableCell>
                            {account.autorenew === "enabled" ? (
                              <Badge className="bg-green-600">مفعل</Badge>
                            ) : (
                              <Badge variant="outline">غير مفعل</Badge>
                            )}
                          </TableCell>
                          <TableCell>{formatPrice(account.renewPrice)}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2 space-x-reverse">
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                    onClick={() => {
                                      setDeletingItemId(account.id);
                                      setDeletingItemType("hosting");
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="bg-card border-border">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="text-foreground">حذف حساب الاستضافة</AlertDialogTitle>
                                    <AlertDialogDescription className="text-muted-foreground">
                                      هل أنت متأكد من رغبتك في حذف حساب الاستضافة {account.planName}؟
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter className="sm:justify-start">
                                    <AlertDialogCancel className="bg-muted text-muted-foreground">إلغاء</AlertDialogCancel>
                                    <AlertDialogAction
                                      className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                                      onClick={handleDelete}
                                    >
                                      حذف
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* محتوى شهادات SSL */}
        <TabsContent value="ssl">
          <Card className="bg-card border-border shadow-md">
            <CardHeader className="pb-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-primary">إدارة شهادات SSL</CardTitle>
                <CardDescription className="text-muted-foreground">
                  {sslCertificates.length} شهادات SSL مسجلة
                </CardDescription>
              </div>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" /> إضافة شهادة SSL
              </Button>
            </CardHeader>
            <CardContent>
              {sslCertificates.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  لا توجد شهادات SSL مسجلة
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>النطاق</TableHead>
                        <TableHead>النوع</TableHead>
                        <TableHead>تاريخ الإصدار</TableHead>
                        <TableHead>تاريخ الانتهاء</TableHead>
                        <TableHead>الحالة</TableHead>
                        <TableHead>التجديد التلقائي</TableHead>
                        <TableHead>السعر</TableHead>
                        <TableHead>الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sslCertificates.map((certificate) => (
                        <TableRow key={certificate.id}>
                          <TableCell className="font-medium">{certificate.domain}</TableCell>
                          <TableCell>
                            {certificate.type === "positive" && "SSL الأساسي"}
                            {certificate.type === "essential" && "SSL المحسن"}
                            {certificate.type === "organization" && "SSL المؤسسة"}
                            {certificate.type === "ev" && "SSL مع التحقق الممتد"}
                          </TableCell>
                          <TableCell>{formatDate(certificate.issueDate)}</TableCell>
                          <TableCell>{formatDate(certificate.expiryDate)}</TableCell>
                          <TableCell>{getStatusBadge(certificate.status)}</TableCell>
                          <TableCell>
                            {certificate.autorenew === "enabled" ? (
                              <Badge className="bg-green-600">مفعل</Badge>
                            ) : (
                              <Badge variant="outline">غير مفعل</Badge>
                            )}
                          </TableCell>
                          <TableCell>{formatPrice(certificate.renewPrice)}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2 space-x-reverse">
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                    onClick={() => {
                                      setDeletingItemId(certificate.id);
                                      setDeletingItemType("ssl");
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="bg-card border-border">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="text-foreground">حذف شهادة SSL</AlertDialogTitle>
                                    <AlertDialogDescription className="text-muted-foreground">
                                      هل أنت متأكد من رغبتك في حذف شهادة SSL لنطاق {certificate.domain}؟
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter className="sm:justify-start">
                                    <AlertDialogCancel className="bg-muted text-muted-foreground">إلغاء</AlertDialogCancel>
                                    <AlertDialogAction
                                      className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                                      onClick={handleDelete}
                                    >
                                      حذف
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* إعادة تعيين قاعدة البيانات */}
      <div className="mt-8">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="border-destructive text-destructive hover:bg-destructive/10">
              إعادة تعيين قاعدة بيانات Namecheap
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-card border-border">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-foreground">إعادة تعيين قاعدة البيانات</AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground">
                هل أنت متأكد من أنك تريد إعادة تعيين قاعدة البيانات؟ سيؤدي هذا إلى حذف جميع البيانات المخصصة واستعادة البيانات الافتراضية.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="sm:justify-start">
              <AlertDialogCancel className="bg-muted text-muted-foreground">إلغاء</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                onClick={reset}
              >
                إعادة تعيين
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default NamecheapDashboard;
