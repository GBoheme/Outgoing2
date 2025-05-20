
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { 
  Domain, 
  HostingPlan, 
  HostingAccount, 
  SSL, 
  NamecheapStats 
} from "@/types/namecheap-types";

import { 
  mockDomains,
  mockHostingPlans,
  mockHostingAccounts,
  mockSSLCertificates,
  mockStats,
  resetNamecheapData
} from "@/data/mockNamecheapData";

export const useNamecheap = () => {
  // استخدام useLocalStorage مع البيانات الوهمية الافتراضية
  const [domains, setDomains] = useLocalStorage<Domain[]>("namecheap-domains", mockDomains);
  const [hostingPlans, setHostingPlans] = useLocalStorage<HostingPlan[]>("namecheap-hosting-plans", mockHostingPlans);
  const [hostingAccounts, setHostingAccounts] = useLocalStorage<HostingAccount[]>("namecheap-hosting-accounts", mockHostingAccounts);
  const [sslCertificates, setSSLCertificates] = useLocalStorage<SSL[]>("namecheap-ssl", mockSSLCertificates);
  const [stats, setStats] = useLocalStorage<NamecheapStats>("namecheap-stats", mockStats);
  const [isLoading, setIsLoading] = useState(false);

  // تحديث الإحصائيات
  const updateStats = () => {
    const activeDomains = domains.filter(domain => domain.status === "active").length;
    const expiringDomains = domains.filter(domain => domain.status === "expiring").length;
    const activeHosting = hostingAccounts.filter(account => account.status === "active").length;
    const activeSSL = sslCertificates.filter(ssl => ssl.status === "active").length;
    
    // حساب إجمالي الإنفاق
    const domainCost = domains.reduce((sum, domain) => sum + domain.purchasePrice, 0);
    const hostingCost = hostingAccounts.reduce((sum, account) => sum + account.purchasePrice, 0);
    const sslCost = sslCertificates.reduce((sum, ssl) => sum + ssl.purchasePrice, 0);
    
    const newStats: NamecheapStats = {
      totalDomains: domains.length,
      activeDomains,
      expiringDomains,
      totalHosting: hostingAccounts.length,
      activeHosting,
      totalSSL: sslCertificates.length,
      activeSSL,
      totalSpent: domainCost + hostingCost + sslCost
    };
    
    setStats(newStats);
    return newStats;
  };
  
  // إضافة نطاق
  const addDomain = (domain: Omit<Domain, "id">) => {
    setIsLoading(true);
    
    const newId = `dom-${String(domains.length + 1).padStart(3, "0")}`;
    const newDomain: Domain = { ...domain, id: newId };
    
    // تحديث مباشر باستخدام الدالة من useLocalStorage
    const updatedDomains = [...domains, newDomain];
    setDomains(updatedDomains);
    
    updateStats();
    setIsLoading(false);
    
    return newDomain;
  };
  
  // تحديث نطاق
  const updateDomain = (id: string, updates: Partial<Domain>) => {
    setIsLoading(true);
    
    const index = domains.findIndex(domain => domain.id === id);
    if (index === -1) {
      setIsLoading(false);
      return false;
    }
    
    const updatedDomains = [...domains];
    updatedDomains[index] = { ...updatedDomains[index], ...updates };
    
    // تحديث مباشر باستخدام الدالة من useLocalStorage
    setDomains(updatedDomains);
    updateStats();
    setIsLoading(false);
    
    return true;
  };
  
  // حذف نطاق
  const deleteDomain = (id: string) => {
    setIsLoading(true);
    
    const updatedDomains = domains.filter(domain => domain.id !== id);
    
    if (updatedDomains.length === domains.length) {
      setIsLoading(false);
      return false;
    }
    
    // تحديث مباشر باستخدام الدالة من useLocalStorage
    setDomains(updatedDomains);
    updateStats();
    setIsLoading(false);
    
    return true;
  };
  
  // إضافة حساب استضافة
  const addHostingAccount = (account: Omit<HostingAccount, "id">) => {
    setIsLoading(true);
    
    const newId = `host-${String(hostingAccounts.length + 1).padStart(3, "0")}`;
    const newAccount: HostingAccount = { ...account, id: newId };
    
    const updatedAccounts = [...hostingAccounts, newAccount];
    // تحديث مباشر باستخدام الدالة من useLocalStorage
    setHostingAccounts(updatedAccounts);
    
    updateStats();
    setIsLoading(false);
    
    return newAccount;
  };
  
  // تحديث حساب استضافة
  const updateHostingAccount = (id: string, updates: Partial<HostingAccount>) => {
    setIsLoading(true);
    
    const index = hostingAccounts.findIndex(account => account.id === id);
    if (index === -1) {
      setIsLoading(false);
      return false;
    }
    
    const updatedAccounts = [...hostingAccounts];
    updatedAccounts[index] = { ...updatedAccounts[index], ...updates };
    
    // تحديث مباشر باستخدام الدالة من useLocalStorage
    setHostingAccounts(updatedAccounts);
    updateStats();
    setIsLoading(false);
    
    return true;
  };
  
  // حذف حساب استضافة
  const deleteHostingAccount = (id: string) => {
    setIsLoading(true);
    
    const updatedAccounts = hostingAccounts.filter(account => account.id !== id);
    
    if (updatedAccounts.length === hostingAccounts.length) {
      setIsLoading(false);
      return false;
    }
    
    // تحديث مباشر باستخدام الدالة من useLocalStorage
    setHostingAccounts(updatedAccounts);
    updateStats();
    setIsLoading(false);
    
    return true;
  };
  
  // إضافة شهادة SSL
  const addSSLCertificate = (certificate: Omit<SSL, "id">) => {
    setIsLoading(true);
    
    const newId = `ssl-${String(sslCertificates.length + 1).padStart(3, "0")}`;
    const newCertificate: SSL = { ...certificate, id: newId };
    
    const updatedCertificates = [...sslCertificates, newCertificate];
    // تحديث مباشر باستخدام الدالة من useLocalStorage
    setSSLCertificates(updatedCertificates);
    
    updateStats();
    setIsLoading(false);
    
    return newCertificate;
  };
  
  // تحديث شهادة SSL
  const updateSSLCertificate = (id: string, updates: Partial<SSL>) => {
    setIsLoading(true);
    
    const index = sslCertificates.findIndex(certificate => certificate.id === id);
    if (index === -1) {
      setIsLoading(false);
      return false;
    }
    
    const updatedCertificates = [...sslCertificates];
    updatedCertificates[index] = { ...updatedCertificates[index], ...updates };
    
    // تحديث مباشر باستخدام الدالة من useLocalStorage
    setSSLCertificates(updatedCertificates);
    updateStats();
    setIsLoading(false);
    
    return true;
  };
  
  // حذف شهادة SSL
  const deleteSSLCertificate = (id: string) => {
    setIsLoading(true);
    
    const updatedCertificates = sslCertificates.filter(certificate => certificate.id !== id);
    
    if (updatedCertificates.length === sslCertificates.length) {
      setIsLoading(false);
      return false;
    }
    
    // تحديث مباشر باستخدام الدالة من useLocalStorage
    setSSLCertificates(updatedCertificates);
    updateStats();
    setIsLoading(false);
    
    return true;
  };
  
  // إعادة تعيين قاعدة البيانات
  const reset = () => {
    setIsLoading(true);
    
    const resetData = resetNamecheapData();
    
    // تحديث مباشر باستخدام الدالات من useLocalStorage
    setDomains(resetData.domains);
    setHostingPlans(resetData.hostingPlans);
    setHostingAccounts(resetData.hostingAccounts);
    setSSLCertificates(resetData.sslCertificates);
    setStats(resetData.stats);
    
    setIsLoading(false);
    toast.success("تم إعادة تعيين قاعدة بيانات Namecheap بنجاح");
    return true;
  };

  return {
    // البيانات
    domains,
    hostingPlans,
    hostingAccounts,
    sslCertificates,
    stats,
    isLoading,
    
    // وظائف إدارة النطاقات
    addDomain,
    updateDomain,
    deleteDomain,
    
    // وظائف إدارة الاستضافة
    addHostingAccount,
    updateHostingAccount,
    deleteHostingAccount,
    
    // وظائف إدارة SSL
    addSSLCertificate,
    updateSSLCertificate,
    deleteSSLCertificate,
    
    // إدارة قاعدة البيانات
    reset,
  };
};
