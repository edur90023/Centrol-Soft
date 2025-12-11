// ARCHIVO: src/types.ts
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
  configFileUrl?: string;
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

// --- NUEVAS INTERFACES ---

export interface EmailAccount {
  id: string;
  email: string;
  password: string; // Se guardará en texto plano según requerimiento (Ojo con la seguridad)
  provider: string; // Gmail, Outlook, Hostinger, etc.
  recoveryEmail?: string;
  notes?: string;
}

export interface RepositoryAccount {
  id: string;
  name: string; // Nombre del repo o proyecto
  platform: 'github' | 'gitlab' | 'bitbucket' | 'other';
  url: string;
  username: string; // Usuario dueño del repo
  tokenOrPassword: string; // Personal Access Token o Password
  notes?: string;
}
