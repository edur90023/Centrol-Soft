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
import { ClientProject } from '../types';

interface AppContextType {
  user: User | null;
  loadingAuth: boolean;
  clients: ClientProject[];
  loadingData: boolean;
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

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  // Data Listener
  useEffect(() => {
    if (!user) {
      setClients([]);
      return;
    }

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
  }, [user]);

  // Actions
  const logout = async () => {
    await firebaseSignOut(auth);
  };

  const addClient = async (clientData: Omit<ClientProject, 'id'>) => {
    await addDoc(collection(db, 'clients'), clientData);
  };

  const updateClient = async (id: string, data: Partial<ClientProject>) => {
    const docRef = doc(db, 'clients', id);
    await updateDoc(docRef, data);
  };

  const deleteClient = async (id: string) => {
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
