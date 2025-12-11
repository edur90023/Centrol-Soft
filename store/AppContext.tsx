// ARCHIVO: src/store/AppContext.tsx
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
import { ClientProject, EmailAccount, RepositoryAccount } from '../types';

interface AppContextType {
  user: User | null;
  loadingAuth: boolean;
  
  // Clientes
  clients: ClientProject[];
  loadingData: boolean;
  addClient: (client: Omit<ClientProject, 'id'>) => Promise<void>;
  updateClient: (id: string, data: Partial<ClientProject>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  toggleClientStatus: (id: string, currentStatus: boolean) => Promise<void>;

  // Correos (NUEVO)
  emails: EmailAccount[];
  addEmail: (data: Omit<EmailAccount, 'id'>) => Promise<void>;
  deleteEmail: (id: string) => Promise<void>;

  // Repositorios (NUEVO)
  repos: RepositoryAccount[];
  addRepo: (data: Omit<RepositoryAccount, 'id'>) => Promise<void>;
  deleteRepo: (id: string) => Promise<void>;
  
  logout: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  
  const [clients, setClients] = useState<ClientProject[]>([]);
  const [emails, setEmails] = useState<EmailAccount[]>([]);
  const [repos, setRepos] = useState<RepositoryAccount[]>([]);
  
  const [loadingData, setLoadingData] = useState(false);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  // Data Listeners
  useEffect(() => {
    if (!user) {
      setClients([]);
      setEmails([]);
      setRepos([]);
      return;
    }

    setLoadingData(true);
    
    // 1. Clientes
    const qClients = query(collection(db, 'clients'), orderBy('businessName'));
    const unsubClients = onSnapshot(qClients, (snapshot) => {
      setClients(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ClientProject)));
      setLoadingData(false); // Asumimos carga inicial completada al recibir clientes
    });

    // 2. Correos
    const qEmails = query(collection(db, 'emails'), orderBy('email'));
    const unsubEmails = onSnapshot(qEmails, (snapshot) => {
      setEmails(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EmailAccount)));
    });

    // 3. Repositorios
    const qRepos = query(collection(db, 'repositories'), orderBy('name'));
    const unsubRepos = onSnapshot(qRepos, (snapshot) => {
      setRepos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RepositoryAccount)));
    });

    return () => {
      unsubClients();
      unsubEmails();
      unsubRepos();
    };
  }, [user]);

  // Actions
  const logout = async () => {
    await firebaseSignOut(auth);
  };

  // --- CLIENTS CRUD ---
  const addClient = async (clientData: Omit<ClientProject, 'id'>) => {
    await addDoc(collection(db, 'clients'), clientData);
  };
  const updateClient = async (id: string, data: Partial<ClientProject>) => {
    await updateDoc(doc(db, 'clients', id), data);
  };
  const deleteClient = async (id: string) => {
    await deleteDoc(doc(db, 'clients', id));
  };
  const toggleClientStatus = async (id: string, currentStatus: boolean) => {
    await updateClient(id, { isActive: !currentStatus });
  };

  // --- EMAILS CRUD (NUEVO) ---
  const addEmail = async (data: Omit<EmailAccount, 'id'>) => {
    await addDoc(collection(db, 'emails'), data);
  };
  const deleteEmail = async (id: string) => {
    await deleteDoc(doc(db, 'emails', id));
  };

  // --- REPOS CRUD (NUEVO) ---
  const addRepo = async (data: Omit<RepositoryAccount, 'id'>) => {
    await addDoc(collection(db, 'repositories'), data);
  };
  const deleteRepo = async (id: string) => {
    await deleteDoc(doc(db, 'repositories', id));
  };

  return (
    <AppContext.Provider value={{
      user,
      loadingAuth,
      clients,
      loadingData,
      logout,
      addClient,
      updateClient,
      deleteClient,
      toggleClientStatus,
      // Nuevos valores expuestos
      emails,
      addEmail,
      deleteEmail,
      repos,
      addRepo,
      deleteRepo
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
