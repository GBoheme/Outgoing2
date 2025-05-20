
import { 
  Domain, 
  HostingPlan, 
  HostingAccount, 
  SSL, 
  NamecheapStats 
} from "@/types/namecheap-types";

// بيانات النطاقات النموذجية
export const mockDomains: Domain[] = [
  {
    id: "dom-001",
    name: "example",
    extension: "com",
    registrationDate: "2024-01-15",
    expiryDate: "2025-01-15",
    status: "active",
    privacy: "enabled",
    autorenew: "enabled",
    nameservers: ["dns1.namecheaphosting.com", "dns2.namecheaphosting.com"],
    purchasePrice: 8.99,
    renewPrice: 12.99,
    owner: "user@example.com"
  },
  {
    id: "dom-002",
    name: "mywebsite",
    extension: "org",
    registrationDate: "2023-05-20",
    expiryDate: "2025-05-20",
    status: "active",
    privacy: "disabled",
    autorenew: "enabled",
    nameservers: ["ns1.site.com", "ns2.site.com"],
    purchasePrice: 7.99,
    renewPrice: 10.99,
    owner: "user@example.com"
  },
  {
    id: "dom-003",
    name: "businesssite",
    extension: "net",
    registrationDate: "2023-11-10",
    expiryDate: "2024-11-10",
    status: "expiring",
    privacy: "enabled",
    autorenew: "disabled",
    nameservers: ["dns1.namecheaphosting.com", "dns2.namecheaphosting.com"],
    purchasePrice: 9.99,
    renewPrice: 13.99,
    owner: "admin@example.com"
  }
];

// بيانات خطط الاستضافة
export const mockHostingPlans: HostingPlan[] = [
  {
    id: "plan-001",
    name: "Stellar",
    type: "shared",
    domains: 3,
    storage: 20,
    bandwidth: 100,
    monthlyPrice: 2.88,
    yearlyPrice: 28.88,
    features: ["cPanel", "Free SSL", "50 Email Addresses", "Unmetered Bandwidth"]
  },
  {
    id: "plan-002",
    name: "Stellar Plus",
    type: "shared",
    domains: 50,
    storage: 50,
    bandwidth: 500,
    monthlyPrice: 4.88,
    yearlyPrice: 48.88,
    features: ["cPanel", "Free SSL", "Unlimited Email Addresses", "Unmetered Bandwidth", "Auto Backups"]
  },
  {
    id: "plan-003",
    name: "Stellar Business",
    type: "shared",
    domains: 100,
    storage: 100,
    bandwidth: 1000,
    monthlyPrice: 8.88,
    yearlyPrice: 88.88,
    features: ["cPanel", "Free SSL", "Unlimited Email Addresses", "Unmetered Bandwidth", "Auto Backups", "Dedicated IP"]
  },
  {
    id: "plan-004",
    name: "Quasar",
    type: "vps",
    domains: 500,
    storage: 50,
    bandwidth: 1000,
    cpuCores: 2,
    ram: 4,
    ssdDrive: true,
    monthlyPrice: 14.88,
    yearlyPrice: 148.88,
    features: ["Full Root Access", "cPanel", "Free SSL", "Dedicated IP", "SSD Storage"]
  }
];

// بيانات حسابات الاستضافة
export const mockHostingAccounts: HostingAccount[] = [
  {
    id: "host-001",
    planId: "plan-001",
    planName: "Stellar",
    domains: ["example.com", "example.org"],
    purchaseDate: "2023-11-15",
    expiryDate: "2024-11-15",
    status: "active",
    autorenew: "enabled",
    username: "user123",
    serverIp: "198.54.117.215",
    controlPanel: "cPanel",
    purchasePrice: 28.88,
    renewPrice: 48.88,
    owner: "user@example.com"
  },
  {
    id: "host-002",
    planId: "plan-004",
    planName: "Quasar",
    domains: ["businesssite.net"],
    purchaseDate: "2024-01-10",
    expiryDate: "2025-01-10",
    status: "active",
    autorenew: "enabled",
    username: "admin456",
    serverIp: "198.54.118.140",
    controlPanel: "cPanel",
    purchasePrice: 148.88,
    renewPrice: 148.88,
    owner: "admin@example.com"
  }
];

// بيانات شهادات SSL
export const mockSSLCertificates: SSL[] = [
  {
    id: "ssl-001",
    domain: "example.com",
    type: "positive",
    issueDate: "2024-01-20",
    expiryDate: "2025-01-20",
    status: "active",
    autorenew: "enabled",
    purchasePrice: 9.99,
    renewPrice: 12.99,
    owner: "user@example.com"
  },
  {
    id: "ssl-002",
    domain: "businesssite.net",
    type: "organization",
    issueDate: "2024-01-15",
    expiryDate: "2025-01-15",
    status: "active",
    autorenew: "enabled",
    purchasePrice: 49.99,
    renewPrice: 69.99,
    owner: "admin@example.com"
  }
];

// الإحصائيات
export const mockStats: NamecheapStats = {
  totalDomains: 3,
  activeDomains: 2,
  expiringDomains: 1,
  totalHosting: 2,
  activeHosting: 2,
  totalSSL: 2,
  activeSSL: 2,
  totalSpent: 263.71
};

// وظيفة لإعادة تعيين قاعدة بيانات Namecheap
export const resetNamecheapData = () => {
  return {
    domains: mockDomains,
    hostingPlans: mockHostingPlans,
    hostingAccounts: mockHostingAccounts,
    sslCertificates: mockSSLCertificates,
    stats: mockStats
  };
};
