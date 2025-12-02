import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import { ClientProject, PaymentStatus } from '../types';

// MOCK DATA FOR DEMO MODE
const MOCK_CLIENTS: ClientProject[] = [
  {
    id: '1',
    businessName: 'Panadería La Espiga',
    clientName: 'Juan Pérez',
    contactPhone: '+5491112345678',
    clientEmail: 'juan@laespiga.com',
    projectUrl: 'https://demo-bakery.com',
    repoUrl: 'https://github.com/myagency/bakery-app',
    backendTech: 'Node.js + Express',
    frontendTech: 'React + Tailwind',
    dbTech: 'MongoDB Atlas',
    storageTech: 'AWS S3',
    appAdminEmail: 'admin@laespiga.com',
    appAdminPassword: 'pan_seguro_2024',
    licenseKey: 'a1b2c3d4-mock-key-uuid',
    isActive: true,
    paymentStatus: PaymentStatus.UpToDate,
    nextPaymentDate: '2024-11-01',
    monthlyFee: 50
  },
  {
    id: '2',
    businessName: 'Consultorio Dental Vital',
    clientName: 'Dra. Ana López',
    contactPhone: '+5491187654321',
    clientEmail: 'ana@vital.com',
    projectUrl: 'https://dental-vital.com',
    repoUrl: 'https://github.com/myagency/dental-cms',
    backendTech: 'Firebase Functions',
    frontendTech: 'Next.js 14',
    dbTech: 'Firestore',
    storageTech: 'Firebase Storage',
    appAdminEmail: 'root@vital.com',
    appAdminPassword: 'mules_sanas_123',
    licenseKey: 'e5f6g7h8-mock-key-uuid',
    isActive: false, // Kill switch active
    paymentStatus: PaymentStatus.Overdue,
    nextPaymentDate: '2024-10-15',
    monthlyFee: 120
  }
];

interface AppContextType {
  user: User | null;
  loadingAuth: boolean;
  clients: ClientProject[];
  loadingData: boolean;
  isDemoMode: boolean; // Flag to check if we are in demo
  loginDemo: () => void; // Provisional access
  logout: () => Promise<void>;
  addClient: (client: Omit<ClientProject, 'id'>) => Promise<void>;
  updateClient: (id: string, data: Partial<ClientProject>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  toggleClientStatus: (id: string, currentStatus: boolean) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [clients, setClients] = useState<ClientProject[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Auth Listener (Real Firebase)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!isDemoMode) {
        setUser(currentUser);
        setLoadingAuth(false);
      }
    });
    return () => unsubscribe();
  }, [isDemoMode]);

  // Data Listener (Real vs Demo)
  useEffect(() => {
    // If Demo Mode
    if (isDemoMode) {
      setLoadingData(false);
      if (clients.length === 0) setClients(MOCK_CLIENTS);
      return;
    }

    // If Not Logged In
    if (!user) {
      setClients([]);
      return;
    }

    // Real Firebase Fetch
    setLoadingData(true);
    const q = query(collection(db, 'clients'), orderBy('businessName'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const clientList: ClientProject[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ClientProject));
      setClients(clientList);
      setLoadingData(false);
    }, (error) => {
      console.error("Error fetching clients:", error);
      setLoadingData(false);
    });

    return () => unsubscribe();
  }, [user, isDemoMode]);

  // --- ACTIONS ---

  const loginDemo = () => {
    setIsDemoMode(true);
    // Create a fake user object that satisfies the Firebase User type partially
    const demoUser = { 
      uid: 'demo-admin', 
      email: 'demo@admin.com', 
      displayName: 'Admin Demo' 
    } as User;
    setUser(demoUser);
    setLoadingAuth(false);
  };

  const logout = async () => {
    if (isDemoMode) {
      setIsDemoMode(false);
      setUser(null);
      setClients([]);
    } else {
      await firebaseSignOut(auth);
    }
  };

  const addClient = async (clientData: Omit<ClientProject, 'id'>) => {
    if (isDemoMode) {
      const newClient = { ...clientData, id: crypto.randomUUID() };
      setClients(prev => [...prev, newClient]);
      return;
    }
    await addDoc(collection(db, 'clients'), clientData);
  };

  const updateClient = async (id: string, data: Partial<ClientProject>) => {
    if (isDemoMode) {
      setClients(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
      return;
    }
    const docRef = doc(db, 'clients', id);
    await updateDoc(docRef, data);
  };

  const deleteClient = async (id: string) => {
    if (isDemoMode) {
      setClients(prev => prev.filter(c => c.id !== id));
      return;
    }
    await deleteDoc(doc(db, 'clients', id));
  };

  const toggleClientStatus = async (id: string, currentStatus: boolean) => {
    await updateClient(id, { isActive: !currentStatus });
  };

  return (
    <AppContext.Provider value={{
      user,
      loadingAuth,
      clients,
      loadingData,
      isDemoMode,
      loginDemo,
      logout,
      addClient,
      updateClient,
      deleteClient,
      toggleClientStatus
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};