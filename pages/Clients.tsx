import React, { useState, useEffect } from 'react';
import { useApp } from '../store/AppContext';
import { ClientProject, PaymentStatus } from '../types';
import { 
  Plus, Search, Globe, Phone, Power, Eye, 
  Server, Database, Code, GitBranch, Mail, Key, Copy, CheckCircle, ShieldAlert,
  Pencil, CreditCard, FileText, Send, FileEdit
} from 'lucide-react';
import { Modal } from '../components/Modal';
import { PaymentStatusBadge, ActiveStatusBadge } from '../components/StatusBadge';

export const Clients: React.FC = () => {
  const { clients, addClient, updateClient, toggleClientStatus } = useApp();
  
  // Form Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Details Modal State
  const [selectedClient, setSelectedClient] = useState<ClientProject | null>(null);
  const [detailsTab, setDetailsTab] = useState<'info' | 'integration'>('info');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // WhatsApp Report State
  const [reportMessage, setReportMessage] = useState('');
  const [showReportPreview, setShowReportPreview] = useState(false);
  
  // Search State
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form Data State
  const initialFormState: Partial<ClientProject> = {
    clientName: '',
    businessName: '',
    contactPhone: '',
    clientEmail: '',
    projectUrl: '',
    repoUrl: '',
    configFileUrl: '', // <--- NUEVO CAMPO
    backendTech: '',
    frontendTech: '',
    dbTech: '',
    storageTech: '',
    appAdminEmail: '',
    appAdminPassword: '',
    monthlyFee: 0,
    paymentStatus: PaymentStatus.UpToDate,
    nextPaymentDate: new Date().toISOString().split('T')[0],
    isActive: true
  };

  const [formData, setFormData] = useState<Partial<ClientProject>>(initialFormState);

  // --- EFFECTS ---
  useEffect(() => {
    // Reset report state when modal closes or changes
    setShowReportPreview(false);
    setReportMessage('');
  }, [selectedClient]);

  // --- ACTIONS ---

  const handleOpenCreate = () => {
    setFormMode('create');
    setEditingId(null);
    setFormData(initialFormState);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (client: ClientProject) => {
    setFormMode('edit');
    setEditingId(client.id);
    setFormData({ ...client });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.businessName || !formData.clientName) return;

    try {
      if (formMode === 'edit' && editingId) {
        await updateClient(editingId, formData);
      } else {
        await addClient({
          clientName: formData.clientName!,
          businessName: formData.businessName!,
          contactPhone: formData.contactPhone || '',
          clientEmail: formData.clientEmail || '',
          projectUrl: formData.projectUrl || '',
          repoUrl: formData.repoUrl || '',
          configFileUrl: formData.configFileUrl || '', // <--- GUARDAR EL DATO
          backendTech: formData.backendTech || '',
          frontendTech: formData.frontendTech || '',
          dbTech: formData.dbTech || '',
          storageTech: formData.storageTech || '',
          appAdminEmail: formData.appAdminEmail || '',
          appAdminPassword: formData.appAdminPassword || '',
          monthlyFee: Number(formData.monthlyFee) || 0,
          paymentStatus: (formData.paymentStatus as PaymentStatus) || PaymentStatus.UpToDate,
          nextPaymentDate: formData.nextPaymentDate || new Date().toISOString().split('T')[0],
          isActive: formData.isActive ?? true,
          licenseKey: crypto.randomUUID(),
        });
      }
      setIsFormOpen(false);
    } catch (err) {
      console.error(err);
      alert("Error al guardar cliente");
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
    
    setReportMessage(message);
    setShowReportPreview(true);
  };

  const handleSendWhatsApp = () => {
    if (!selectedClient?.contactPhone) {
      alert('El cliente no tiene teléfono registrado.');
      return;
    }
    
    // Clean phone number (remove spaces, symbols)
    const cleanPhone = selectedClient.contactPhone.replace(/[^0-9]/g, '');
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(reportMessage)}`;
    window.open(url, '_blank');
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const generateSnippet = (client: ClientProject) => {
    return `// =========================================================
// HOOK DE LICENCIA (Kill Switch) - ${client.businessName}
// Archivo: src/hooks/useLicenseCheck.ts
// =========================================================

import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase'; // Asegúrate de importar tu instancia de firestore

export const useLicenseCheck = () => {
  const [isLocked, setIsLocked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ID Cliente: ${client.id}
    // NOTA: Configura tus reglas de Firestore para permitir lectura pública o autenticada a este documento
    const clientRef = doc(db, 'clients', '${client.id}');

    const unsubscribe = onSnapshot(clientRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        // Si isActive es false, se activa el bloqueo
        setIsLocked(data.isActive === false);
      } else {
        // Opción: Bloquear si la licencia no existe (Fail Secure)
        console.warn('Licencia no encontrada');
        setIsLocked(true); 
      }
      setLoading(false);
    }, (error) => {
      console.error("Error verificando licencia:", error);
      // En caso de error de red, mantenemos el estado anterior o desbloqueamos (Fail Safe)
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { isLocked, loading };
};`;
  };

  const filteredClients = clients.filter(c => 
    c.businessName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.clientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Gestión de Clientes</h1>
        <button 
          onClick={handleOpenCreate}
          className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-sm hover:shadow-md"
        >
          <Plus className="w-4 h-4" /> Nuevo Cliente
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input 
          type="text" 
          placeholder="Buscar por empresa o nombre..." 
          className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Client Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {filteredClients.map((client) => (
          <div key={client.id} className={`bg-white rounded-xl p-5 border shadow-sm transition-all ${
            !client.isActive ? 'border-slate-200 bg-slate-50 opacity-75' : 'border-slate-200 hover:border-brand-300'
          }`}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-lg text-slate-800">{client.businessName}</h3>
                <p className="text-sm text-slate-500">{client.clientName}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                 <PaymentStatusBadge status={client.paymentStatus} />
                 <ActiveStatusBadge isActive={client.isActive} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm text-slate-600 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-slate-400" />
                <a href={client.projectUrl} target="_blank" rel="noreferrer" className="hover:text-brand-600 truncate">
                  {client.projectUrl || 'No URL'}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400" />
                <span>{client.contactPhone || '--'}</span>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-2">
               <div>
                 <span className="text-xs text-slate-400 uppercase tracking-wide">Cuota Mensual</span>
                 <p className="font-semibold text-slate-800">${client.monthlyFee}</p>
               </div>
               
               <div className="flex gap-2">
                 <button 
                   onClick={() => handleOpenEdit(client)}
                   className="p-2 text-slate-500 hover:text-brand-600 hover:bg-slate-100 rounded-lg transition-colors border border-transparent"
                   title="Editar Cliente"
                 >
                   <Pencil className="w-4 h-4" />
                 </button>

                 <button 
                   onClick={() => {
                     setSelectedClient(client);
                     setDetailsTab('info');
                   }}
                   className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:text-brand-600 hover:bg-slate-100 rounded-lg transition-colors border border-transparent hover:border-slate-200"
                 >
                   <Eye className="w-4 h-4" />
                   <span className="text-sm font-medium">Detalles</span>
                 </button>
                 
                 {/* BOTÓN KILL SWITCH MANUAL (NUEVO) */}
                 <button 
                  onClick={() => {
                    if (client.configFileUrl) {
                      window.open(client.configFileUrl, '_blank');
                    } else {
                      // Fallback: Intentar construir la URL si no existe la específica
                      if (client.repoUrl) {
                         const cleanRepo = client.repoUrl.replace(/\/$/, '').replace(/\.git$/, '');
                         const guessUrl = `${cleanRepo}/edit/main/config.ts`;
                         if(window.confirm(`No hay URL de edición configurada. ¿Intentar abrir ${guessUrl}?`)) {
                            window.open(guessUrl, '_blank');
                         }
                      } else {
                         alert('Por favor configura la URL del archivo en "Editar Cliente".');
                      }
                    }
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors bg-slate-800 text-white hover:bg-slate-700 shadow-sm border border-slate-700"
                  title="Abrir archivo config.ts para editar manualmente"
                 >
                   <FileEdit className="w-4 h-4 text-red-400" />
                   Gestionar Licencia
                 </button>
               </div>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE / EDIT CLIENT MODAL */}
      <Modal 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        title={formMode === 'create' ? "Agregar Nuevo Cliente" : "Editar Cliente"}
      >
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-2">
          
          {/* Status & Payment */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
             <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
               <CreditCard className="w-3 h-3" /> Estado y Facturación
             </h4>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
               <div className="col-span-1 md:col-span-2 flex items-center gap-3 bg-white p-2 rounded border border-slate-200">
                 <input 
                    type="checkbox" 
                    id="isActive"
                    checked={formData.isActive}
                    onChange={e => setFormData({...formData, isActive: e.target.checked})}
                    className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500"
                 />
                 <label htmlFor="isActive" className="text-sm font-medium text-slate-700 select-none cursor-pointer">
                   Servicio Activo (Reflejado en DB)
                 </label>
               </div>

               <div>
                 <label className="block text-xs font-medium text-slate-700 mb-1">Estado de Pago</label>
                 <select 
                   value={formData.paymentStatus} 
                   onChange={e => setFormData({...formData, paymentStatus: e.target.value as PaymentStatus})}
                   className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-brand-500/20 outline-none bg-white"
                 >
                   <option value={PaymentStatus.UpToDate}>Al día</option>
                   <option value={PaymentStatus.Pending}>Pendiente</option>
                   <option value={PaymentStatus.Overdue}>Atrasado</option>
                 </select>
               </div>
               <div>
                 <label className="block text-xs font-medium text-slate-700 mb-1">Próximo Vencimiento</label>
                 <input 
                   type="date" 
                   value={formData.nextPaymentDate} 
                   onChange={e => setFormData({...formData, nextPaymentDate: e.target.value})}
                   className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-brand-500/20 outline-none" 
                 />
               </div>
             </div>
          </div>

          {/* Basic Info */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Información General</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">Nombre del Negocio *</label>
                <input required type="text" className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-brand-500/20 outline-none" 
                  value={formData.businessName} onChange={e => setFormData({...formData, businessName: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Cliente *</label>
                <input required type="text" className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-brand-500/20 outline-none" 
                  value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Cuota ($)</label>
                <input type="number" className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-brand-500/20 outline-none" 
                  value={formData.monthlyFee} onChange={e => setFormData({...formData, monthlyFee: Number(e.target.value)})} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Teléfono</label>
                <input type="text" className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-brand-500/20 outline-none" 
                  value={formData.contactPhone} onChange={e => setFormData({...formData, contactPhone: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Email Cliente</label>
                <input type="email" className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-brand-500/20 outline-none" 
                  value={formData.clientEmail} onChange={e => setFormData({...formData, clientEmail: e.target.value})} />
              </div>
            </div>
          </div>

          {/* Tech Stack */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
             <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Infraestructura & Accesos</h4>
             <div className="grid grid-cols-2 gap-3">
                <input placeholder="Backend (ej: Node)" className="p-2 border rounded text-sm"
                  value={formData.backendTech} onChange={e => setFormData({...formData, backendTech: e.target.value})} />
                <input placeholder="Frontend (ej: React)" className="p-2 border rounded text-sm"
                  value={formData.frontendTech} onChange={e => setFormData({...formData, frontendTech: e.target.value})} />
                <input placeholder="Database (ej: Mongo)" className="p-2 border rounded text-sm"
                  value={formData.dbTech} onChange={e => setFormData({...formData, dbTech: e.target.value})} />
                <input placeholder="Storage (ej: S3)" className="p-2 border rounded text-sm"
                  value={formData.storageTech} onChange={e => setFormData({...formData, storageTech: e.target.value})} />
                
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-700 mb-1">URL Repositorio Principal</label>
                  <input placeholder="https://github.com/usuario/proyecto" className="w-full p-2 border rounded text-sm"
                    value={formData.repoUrl} onChange={e => setFormData({...formData, repoUrl: e.target.value})} />
                </div>

                {/* --- NUEVO CAMPO URL CONFIG --- */}
                <div className="col-span-2 bg-red-50 p-2 rounded border border-red-100">
                  <label className="block text-xs font-bold text-red-700 mb-1 flex items-center gap-1">
                    <FileEdit size={12}/> URL de Edición (Kill Switch)
                  </label>
                  <input 
                    placeholder="https://github.com/usr/repo/edit/main/config.ts" 
                    className="w-full p-2 border border-red-200 rounded text-sm text-red-800 placeholder:text-red-300 focus:ring-2 focus:ring-red-200 outline-none"
                    value={formData.configFileUrl} 
                    onChange={e => setFormData({...formData, configFileUrl: e.target.value})} 
                  />
                  <p className="text-[10px] text-red-400 mt-1">Pega aquí el link directo para editar el archivo de configuración.</p>
                </div>
                
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-700 mb-1">URL Proyecto (Web Pública)</label>
                  <input placeholder="https://mi-proyecto.com" className="w-full p-2 border rounded text-sm"
                    value={formData.projectUrl} onChange={e => setFormData({...formData, projectUrl: e.target.value})} />
                </div>
                
                <div className="col-span-2 border-t border-slate-200 mt-2 pt-2">
                  <label className="block text-xs font-medium text-slate-500 mb-2">Credenciales App Superadmin</label>
                  <div className="grid grid-cols-2 gap-3">
                    <input placeholder="Email Admin" className="p-2 border rounded text-sm"
                      value={formData.appAdminEmail} onChange={e => setFormData({...formData, appAdminEmail: e.target.value})} />
                    <input placeholder="Password Admin" className="p-2 border rounded text-sm"
                      value={formData.appAdminPassword} onChange={e => setFormData({...formData, appAdminPassword: e.target.value})} />
                  </div>
                </div>
             </div>
          </div>

          <button type="submit" className="w-full bg-brand-600 text-white py-3 rounded-lg font-medium hover:bg-brand-700 transition-colors">
            {formMode === 'create' ? 'Crear Cliente' : 'Guardar Cambios'}
          </button>
        </form>
      </Modal>

      {/* DETAILS VIEW MODAL */}
      <Modal isOpen={!!selectedClient} onClose={() => setSelectedClient(null)} title="Detalles del Proyecto">
        {selectedClient && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{selectedClient.businessName}</h2>
                <div className="flex items-center gap-2 mt-1 text-slate-500 text-sm">
                  <Globe className="w-3 h-3" /> 
                  <a href={selectedClient.projectUrl} target="_blank" rel="noreferrer" className="hover:text-brand-600 hover:underline">
                    {selectedClient.projectUrl}
                  </a>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-slate-500 mb-1">Estado de Pago</div>
                <PaymentStatusBadge status={selectedClient.paymentStatus} />
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200">
              <button 
                onClick={() => setDetailsTab('info')}
                className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors ${
                  detailsTab === 'info' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                Información Técnica
              </button>
              <button 
                onClick={() => setDetailsTab('integration')}
                className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors ${
                  detailsTab === 'integration' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                Código de Integración
              </button>
            </div>

            {/* Content Info */}
            {detailsTab === 'info' && (
              <div className="space-y-6 animate-fade-in">
                {/* Tech Stack Grid */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Server className="w-4 h-4" /> Stack Tecnológico
                  </h4>
                  <div className="bg-slate-50 rounded-lg p-4 grid grid-cols-2 gap-4 text-sm border border-slate-100">
                      <div>
                        <span className="block text-slate-400 text-xs mb-1">Backend</span>
                        <div className="font-medium text-slate-700 flex items-center gap-2">
                          <Code className="w-3 h-3 text-slate-400" />
                          {selectedClient.backendTech || 'N/A'}
                        </div>
                      </div>
                      <div>
                        <span className="block text-slate-400 text-xs mb-1">Frontend</span>
                        <div className="font-medium text-slate-700 flex items-center gap-2">
                          <Code className="w-3 h-3 text-slate-400" />
                          {selectedClient.frontendTech || 'N/A'}
                        </div>
                      </div>
                      <div>
                        <span className="block text-slate-400 text-xs mb-1">Base de Datos</span>
                        <div className="font-medium text-slate-700 flex items-center gap-2">
                          <Database className="w-3 h-3 text-slate-400" />
                          {selectedClient.dbTech || 'N/A'}
                        </div>
                      </div>
                      <div>
                        <span className="block text-slate-400 text-xs mb-1">Imágenes/Storage</span>
                        <div className="font-medium text-slate-700 flex items-center gap-2">
                          <Database className="w-3 h-3 text-slate-400" />
                          {selectedClient.storageTech || 'N/A'}
                        </div>
                      </div>
                      <div className="col-span-2">
                        <span className="block text-slate-400 text-xs mb-1">Repositorio</span>
                        <div className="font-medium text-slate-700 flex items-center gap-2 truncate">
                          <GitBranch className="w-3 h-3 text-slate-400" />
                          <a href={selectedClient.repoUrl} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline">
                            {selectedClient.repoUrl || 'No configurado'}
                          </a>
                        </div>
                      </div>
                      {/* URL Config Display */}
                      {selectedClient.configFileUrl && (
                        <div className="col-span-2">
                          <span className="block text-slate-400 text-xs mb-1">URL Configuración (Manual)</span>
                          <div className="font-mono text-xs text-slate-600 bg-white p-1 rounded border border-slate-200 truncate">
                            {selectedClient.configFileUrl}
                          </div>
                        </div>
                      )}
                  </div>
                </div>

                {/* Credentials & Access */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Key className="w-4 h-4" /> Credenciales Admin
                  </h4>
                  <div className="bg-slate-50 rounded-lg p-4 space-y-3 text-sm border border-slate-100">
                      <div className="flex justify-between items-center group">
                        <div>
                          <span className="block text-slate-400 text-xs">Email Superusuario</span>
                          <span className="font-medium text-slate-700">{selectedClient.appAdminEmail || 'No definido'}</span>
                        </div>
                        {selectedClient.appAdminEmail && (
                          <button 
                            onClick={() => copyToClipboard(selectedClient.appAdminEmail!, 'email')} 
                            className={`${copiedId === 'email' ? 'text-emerald-500' : 'text-slate-300 hover:text-brand-600'} transition-colors`}
                          >
                            {copiedId === 'email' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </button>
                        )}
                      </div>
                      <div className="border-t border-slate-200 pt-3 flex justify-between items-center group">
                        <div>
                          <span className="block text-slate-400 text-xs">Contraseña Superusuario</span>
                          <span className="font-mono text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                            {selectedClient.appAdminPassword || '••••••••'}
                          </span>
                        </div>
                        {selectedClient.appAdminPassword && (
                          <button 
                            onClick={() => copyToClipboard(selectedClient.appAdminPassword!, 'password')} 
                            className={`${copiedId === 'password' ? 'text-emerald-500' : 'text-slate-300 hover:text-brand-600'} transition-colors`}
                          >
                            {copiedId === 'password' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </button>
                        )}
                      </div>
                  </div>
                </div>

                {/* Contact & Actions */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Mail className="w-4 h-4" /> Contacto
                  </h4>
                  <div className="bg-white border border-slate-200 rounded-lg p-4">
                    <p className="text-sm mb-1"><span className="font-semibold text-slate-700">{selectedClient.clientName}</span></p>
                    <p className="text-sm text-slate-500 mb-4">{selectedClient.clientEmail || 'Sin email'} • {selectedClient.contactPhone || 'Sin teléfono'}</p>
                    
                    {!showReportPreview ? (
                      <>
                        <button 
                          onClick={handleGenerateReport}
                          className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 rounded-lg font-medium transition-colors shadow-sm hover:shadow"
                        >
                          <FileText className="w-5 h-5" />
                          Generar Informe de Pago
                        </button>
                        <p className="text-xs text-center text-slate-400 mt-2">
                          Crea un mensaje detallado antes de enviar por WhatsApp.
                        </p>
                      </>
                    ) : (
                      <div className="animate-fade-in space-y-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <label className="text-xs font-bold text-slate-500 block">Vista Previa del Mensaje:</label>
                        <textarea 
                          value={reportMessage}
                          onChange={(e) => setReportMessage(e.target.value)}
                          className="w-full h-32 p-3 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none resize-none font-mono text-slate-600"
                        />
                        <div className="flex gap-2">
                           <button 
                            onClick={() => setShowReportPreview(false)}
                            className="flex-1 py-2 text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors"
                          >
                            Cancelar
                          </button>
                          <button 
                            onClick={handleSendWhatsApp}
                            className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                          >
                            <Send className="w-4 h-4" />
                            Enviar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Content Integration */}
            {detailsTab === 'integration' && (
              <div className="space-y-4 animate-fade-in">
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                   <div className="flex items-start gap-3">
                      <div className="mt-0.5 bg-blue-100 p-1.5 rounded-full text-blue-600">
                        <ShieldAlert className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="text-sm font-bold text-blue-800">Modo de Integración (Automático)</h5>
                        <p className="text-sm text-blue-700 mt-1 leading-relaxed">
                          Este modo conecta la App a tu Firebase.
                          <br/>
                          <span className="font-bold">Para modo manual (GitHub):</span> Usa el botón "Gestionar Licencia" en la lista principal.
                        </p>
                      </div>
                   </div>
                </div>

                <div className="relative">
                  <div className="absolute top-2 right-2">
                    <button 
                      onClick={() => copyToClipboard(generateSnippet(selectedClient), 'snippet')}
                      className={`${copiedId === 'snippet' ? 'bg-emerald-600' : 'bg-slate-700 hover:bg-slate-600'} text-white text-xs px-3 py-1.5 rounded-md flex items-center gap-2 transition-colors`}
                    >
                      {copiedId === 'snippet' ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copiedId === 'snippet' ? 'Copiado!' : 'Copiar Código'}
                    </button>
                  </div>
                  <pre className="bg-slate-900 text-slate-300 p-4 rounded-lg text-xs font-mono overflow-x-auto border border-slate-800 shadow-inner">
                    {generateSnippet(selectedClient)}
                  </pre>
                </div>
                
                <div className="text-xs text-slate-500 text-center flex items-center justify-center gap-2">
                  <span className="text-slate-400">ID de Licencia:</span> 
                  <code className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">{selectedClient.licenseKey}</code>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
