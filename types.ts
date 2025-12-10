// Archivo: src/types.ts

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
  clientEmail: string;
  projectUrl: string;
  
  // Tech Stack Details
  repoUrl?: string;
  // --- NUEVO CAMPO ---
  configFileUrl?: string; // Link directo a la edición del archivo config.ts
  // -------------------
  backendTech?: string;
  frontendTech?: string;
  dbTech?: string;
  storageTech?: string;
  
  // Access Credentials
  appAdminEmail?: string;
  appAdminPassword?: string;
  
  licenseKey: string;
  isActive: boolean;
  paymentStatus: PaymentStatus;
  nextPaymentDate: string;
  monthlyFee: number;
}

export interface DashboardMetrics {
  totalClients: number;
  activeClients: number;
  monthlyRevenue: number;
  pendingPayments: number;
}
