import React, { useState, useEffect } from 'react';
import { useApp } from '../store/AppContext';
import { ClientProject, PaymentStatus } from '../types';
import { 
  Plus, Search, Globe, Phone, Eye, 
  Server, Database, Code, GitBranch, Key, Copy, CheckCircle, ShieldAlert,
  Pencil, FileText, Send, FileEdit, Power, AlertTriangle, X
} from 'lucide-react';
import { Modal } from '../components/Modal';
import { ClientFormModal } from '../components/ClientFormModal';
import { PaymentStatusBadge, ActiveStatusBadge } from '../components/StatusBadge';

export const Clients: React.FC = () => {
  const { clients, toggleClientStatus } = useApp();
  
  // States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedClient, setSelectedClient] = useState<ClientProject | null>(null);
  const [detailsTab, setDetailsTab] = useState<'info' | 'integration'>('info');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [reportMessage, setReportMessage] = useState('');
  const [showReportPreview, setShowReportPreview] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // ESTADO NUEVO: Para el modal de confirmación
  const [confirmModal, setConfirmModal] = useState<{isOpen: boolean, client: ClientProject | null}>({
    isOpen: false,
    client: null
  });
  
  const initialFormState: Partial<ClientProject> = {
    clientName: '', businessName: '', contactPhone: '', clientEmail: '',
    projectUrl: '', repoUrl: '', configFileUrl: '', backendTech: '',
    frontendTech: '', dbTech: '', storageTech: '', appAdminEmail: '',
    appAdminPassword: '', monthlyFee: 0, paymentStatus: PaymentStatus.UpToDate,
    nextPaymentDate: new Date().toISOString().split('T')[0], isActive: true
  };
  const [formData, setFormData] = useState<Partial<ClientProject>>(initialFormState);

  useEffect(() => {
    setShowReportPreview(false);
    setReportMessage('');
  }, [selectedClient]);

  // Actions
  const handleOpenCreate = () => {
    setFormMode('create'); setEditingId(null); setFormData(initialFormState); setIsFormOpen(true);
  };
  const handleOpenEdit = (client: ClientProject) => {
    setFormMode('edit'); setEditingId(client.id); setFormData({ ...client }); setIsFormOpen(true);
  };

  // 1. ABRIR MODAL DE CONFIRMACIÓN (En lugar de window.confirm)
  const requestToggleStatus = (client: ClientProject) => {
    setConfirmModal({ isOpen: true, client });
  };

  // 2. EJECUTAR LA ACCIÓN REAL
  const executeToggleStatus = async () => {
    if (confirmModal.client) {
      await toggleClientStatus(confirmModal.client.id, confirmModal.client.isActive);
      setConfirmModal({ isOpen: false, client: null });
    }
  };

  const handleGenerateReport = () => {
    if (!selectedClient) return;
    const isOverdue = selectedClient.paymentStatus === PaymentStatus.Overdue;
    const icon = isOverdue ? '🔴' : '🟡';
    const statusText = isOverdue ? 'VENCIDO' : 'Pendiente';
    const message = `Hola *${selectedClient.clientName}*, te contactamos de soporte administrativo.\n\n` +
    `🔔 *Informe de Estado - ${selectedClient.businessName}*\n\n` +
    `Estado: ${icon} *${statusText}*\n` +
    `Vencimiento: ${selectedClient.nextPaymentDate}\n` +
    `💰 *Saldo a cancelar: $${selectedClient.monthlyFee}*\n\n` +
    `Por favor, regulariza tu situación para asegurar la continuidad del servicio.\n\n` +
    `¡Gracias!`;
    setReportMessage(message); setShowReportPreview(true);
  };

  const handleSendWhatsApp = () => {
    if (!selectedClient?.contactPhone) { alert('El cliente no tiene teléfono registrado.'); return; }
    const cleanPhone = selectedClient.contactPhone.replace(/[^0-9]/g, '');
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(reportMessage)}`;
    window.open(url, '_blank');
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text); setCopiedId(id); setTimeout(() => setCopiedId(null), 2000);
  };

  const generateSnippet = (client: ClientProject) => {
    return `// HOOK DE LICENCIA (Kill Switch) - ${client.businessName}\n// ID Cliente: ${client.id}\n// src/hooks/useLicense.ts\nimport { useEffect, useState } from 'react';\nimport { doc, onSnapshot } from 'firebase/firestore';\nimport { licenseDb } from '../services/licenseService';\n\nexport const useLicense = () => {\n  const [isLocked, setIsLocked] = useState(false);\n  const [loading, setLoading] = useState(true);\n  const LICENSE_ID = import.meta.env.VITE_LICENSE_CLIENT_ID || '${client.id}';\n\n  useEffect(() => {\n    const clientRef = doc(licenseDb, 'clients', LICENSE_ID);\n    const unsubscribe = onSnapshot(clientRef, (docSnapshot) => {\n      if (docSnapshot.exists()) {\n        setIsLocked(docSnapshot.data().isActive === false);\n      } else {\n        setIsLocked(true);\n      }\n      setLoading(false);\n    }, (error) => setLoading(false));\n    return () => unsubscribe();\n  }, []);\n  return { isLocked, loading };\n};`;
  };

  const filteredClients = clients.filter(c => 
    c.businessName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.clientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Gestión de Clientes</h1>
        <button onClick={handleOpenCreate} className="bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-lg shadow-brand-500/20">
          <Plus className="w-4 h-4" /> Nuevo Cliente
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
        <input 
          type="text" 
          placeholder="Buscar por empresa o nombre..." 
          className="w-full pl-10 pr-4 py-3 bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-transparent transition-all placeholder:text-slate-600"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {filteredClients.map((client) => (
          <div key={client.id} className={`rounded-xl p-5 border transition-all ${
            !client.isActive 
              ? 'bg-red-950/20 border-red-900/30' 
              : 'bg-slate-900/60 backdrop-blur-md border-white/10 hover:border-brand-500/30 hover:shadow-lg hover:shadow-brand-500/10'
          }`}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-lg text-slate-100 flex items-center gap-2">
                  {client.businessName}
                  {!client.isActive && <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full uppercase font-bold tracking-wider animate-pulse">Suspendido</span>}
                </h3>
                <p className="text-sm text-slate-400">{client.clientName}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                 <PaymentStatusBadge status={client.paymentStatus} />
                 <button onClick={() => copyToClipboard(client.id, `id-${client.id}`)} className="text-[10px] font-mono text-slate-600 hover:text-brand-400 transition-colors" title="Copiar ID Cliente">
                   ID: {client.id.substring(0,8)}... {copiedId === `id-${client.id}` ? '(Copiado)' : ''}
                 </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm text-slate-400 mb-4 bg-slate-950/50 p-3 rounded-lg border border-white/5">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-slate-500" />
                <a href={client.projectUrl} target="_blank" rel="noreferrer" className="hover:text-brand-400 truncate transition-colors">
                  {client.projectUrl || 'No URL'}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-500" />
                <span>{client.contactPhone || '--'}</span>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-2">
               <div className="flex items-center gap-2">
                 <button 
                  onClick={() => requestToggleStatus(client)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-all border ${
                    client.isActive 
                    ? 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20' 
                    : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20'
                  }`}
                  title={client.isActive ? "Suspender Servicio" : "Reactivar Servicio"}
                 >
                   <Power className="w-4 h-4" />
                   {client.isActive ? 'Cortar' : 'Activar'}
                 </button>
               </div>
               
               <div className="flex gap-2">
                 <button onClick={() => handleOpenEdit(client)} className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors" title="Editar">
                   <Pencil className="w-4 h-4" />
                 </button>
                 <button onClick={() => { setSelectedClient(client); setDetailsTab('info'); }} className="flex items-center gap-2 px-3 py-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                   <Eye className="w-4 h-4" />
                 </button>
                 <button onClick={() => {
                    if (client.configFileUrl) window.open(client.configFileUrl, '_blank');
                    else if (client.repoUrl) {
                         const cleanRepo = client.repoUrl.replace(/\/$/, '').replace(/\.git$/, '');
                         const guessUrl = `${cleanRepo}/edit/main/config.ts`;
                         if(window.confirm(`Abrir repositorio: ${guessUrl}?`)) window.open(guessUrl, '_blank');
                    } else alert('Configura la URL en "Editar Cliente".');
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-slate-500 hover:text-slate-300 hover:bg-white/5"
                  title="Gestión Manual (GitHub)"
                 >
                   <FileEdit className="w-4 h-4" />
                 </button>
               </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL DE CONFIRMACIÓN DE ESTADO (NUEVO) */}
      {confirmModal.isOpen && confirmModal.client && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-white/10 p-6 rounded-2xl shadow-2xl max-w-sm w-full relative">
             <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mb-4 border border-white/5">
                {confirmModal.client.isActive ? <AlertTriangle className="text-red-500" /> : <Power className="text-emerald-500" />}
             </div>
             
             <h3 className="text-xl font-bold text-white mb-2">
                {confirmModal.client.isActive ? '¿Suspender Servicio?' : '¿Reactivar Servicio?'}
             </h3>
             <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                {confirmModal.client.isActive 
                  ? `Estás a punto de bloquear el acceso a ${confirmModal.client.businessName}. La aplicación mostrará una pantalla de "Servicio Suspendido" inmediatamente.`
                  : `Se restablecerá el acceso normal a ${confirmModal.client.businessName}.`
                }
             </p>

             <div className="flex gap-3">
                <button 
                  onClick={() => setConfirmModal({isOpen: false, client: null})}
                  className="flex-1 py-3 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button 
                  onClick={executeToggleStatus}
                  className={`flex-1 py-3 rounded-xl font-bold text-white shadow-lg transition-all ${
                    confirmModal.client.isActive 
                    ? 'bg-red-600 hover:bg-red-500 shadow-red-500/20' 
                    : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20'
                  }`}
                >
                  {confirmModal.client.isActive ? 'Sí, Suspender' : 'Sí, Activar'}
                </button>
             </div>
          </div>
        </div>
      )}

      <ClientFormModal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} mode={formMode} editingId={editingId} initialData={formData} />

      {/* MODAL DE DETALLES (Sin cambios mayores, solo mantenido por contexto) */}
      <Modal isOpen={!!selectedClient} onClose={() => setSelectedClient(null)} title="Detalles del Proyecto">
        {selectedClient && (
          <div className="space-y-6">
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div>
                <h2 className="text-xl font-bold text-white">{selectedClient.businessName}</h2>
                <div className="flex items-center gap-2 mt-1 text-slate-400 text-sm">
                  <Globe className="w-3 h-3" /> 
                  <a href={selectedClient.projectUrl} target="_blank" rel="noreferrer" className="hover:text-brand-400 hover:underline">{selectedClient.projectUrl}</a>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-slate-400 mb-1">Estado</div>
                <PaymentStatusBadge status={selectedClient.paymentStatus} />
              </div>
            </div>
             
             {/* ... contenido del modal de detalles igual que antes ... */}
            <div className="flex border-b border-white/10">
              <button onClick={() => setDetailsTab('info')} className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors ${detailsTab === 'info' ? 'border-brand-500 text-brand-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>Técnico</button>
              <button onClick={() => setDetailsTab('integration')} className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors ${detailsTab === 'integration' ? 'border-brand-500 text-brand-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>Integración</button>
            </div>

            {detailsTab === 'info' && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2"><Server className="w-4 h-4" /> Stack</h4>
                  <div className="bg-slate-950/50 rounded-lg p-4 grid grid-cols-2 gap-4 text-sm border border-white/5 text-slate-300">
                      <div><span className="block text-slate-500 text-xs mb-1">Backend</span><div className="flex items-center gap-2"><Code className="w-3 h-3" />{selectedClient.backendTech || '-'}</div></div>
                      <div><span className="block text-slate-500 text-xs mb-1">Frontend</span><div className="flex items-center gap-2"><Code className="w-3 h-3" />{selectedClient.frontendTech || '-'}</div></div>
                      <div><span className="block text-slate-500 text-xs mb-1">DB</span><div className="flex items-center gap-2"><Database className="w-3 h-3" />{selectedClient.dbTech || '-'}</div></div>
                      <div className="col-span-2"><span className="block text-slate-500 text-xs mb-1">Repo</span><div className="flex items-center gap-2 truncate"><GitBranch className="w-3 h-3" /><a href={selectedClient.repoUrl} target="_blank" rel="noreferrer" className="text-brand-400 hover:underline">{selectedClient.repoUrl || '-'}</a></div></div>
                  </div>
                </div>

                {!showReportPreview ? (
                  <button onClick={handleGenerateReport} className="w-full flex items-center justify-center gap-2 bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-600/30 py-2.5 rounded-lg font-medium transition-colors">
                    <FileText className="w-5 h-5" /> Generar Informe Pago
                  </button>
                ) : (
                  <div className="animate-fade-in space-y-3 bg-slate-950/50 p-3 rounded-lg border border-white/5">
                    <label className="text-xs font-bold text-slate-500 block">Mensaje:</label>
                    <textarea value={reportMessage} onChange={(e) => setReportMessage(e.target.value)} className="w-full h-32 p-3 text-xs bg-black/20 border border-white/10 rounded-lg text-slate-300 focus:ring-1 focus:ring-emerald-500 outline-none resize-none font-mono" />
                    <div className="flex gap-2">
                       <button onClick={() => setShowReportPreview(false)} className="flex-1 py-2 text-slate-400 hover:bg-white/5 rounded-lg text-sm border border-white/10">Cancelar</button>
                      <button onClick={handleSendWhatsApp} className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm flex items-center justify-center gap-2"><Send className="w-4 h-4" /> Enviar</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {detailsTab === 'integration' && (
               <div className="space-y-4 animate-fade-in">
                  <div className="relative group">
                    <button onClick={() => copyToClipboard(generateSnippet(selectedClient), 'snippet')} className="absolute top-2 right-2 bg-slate-700 hover:bg-slate-600 text-white text-xs px-2 py-1 rounded flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {copiedId === 'snippet' ? 'Copiado' : 'Copiar'}
                    </button>
                    <pre className="bg-black/50 text-slate-300 p-4 rounded-lg text-xs font-mono overflow-x-auto border border-white/5 shadow-inner">{generateSnippet(selectedClient)}</pre>
                  </div>
               </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
