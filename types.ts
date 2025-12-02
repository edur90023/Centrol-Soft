export enum PaymentStatus {
  UpToDate = 'up_to_date',
  Pending = 'pending',
  Overdue = 'overdue'
}

export interface ClientProject {
  id: string;
  clientName: string;
  businessName: string;
  contactPhone: string;
  clientEmail: string; // New
  projectUrl: string;
  
  // Tech Stack Details
  repoUrl?: string;
  backendTech?: string;
  frontendTech?: string;
  dbTech?: string;
  storageTech?: string; // Image DB
  
  // Access Credentials
  appAdminEmail?: string;
  appAdminPassword?: string;
  
  licenseKey: string; // UUID
  isActive: boolean; // THE KILL SWITCH
  paymentStatus: PaymentStatus;
  nextPaymentDate: string; // ISO Date string
  monthlyFee: number;
}

export interface DashboardMetrics {
  totalClients: number;
  activeClients: number;
  monthlyRevenue: number;
  pendingPayments: number;
}