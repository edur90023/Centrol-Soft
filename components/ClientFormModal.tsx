import React, { useState, useEffect } from 'react';
import { useApp } from '../store/AppContext';
import { ClientProject, PaymentStatus } from '../types';
import { CreditCard, FileEdit } from 'lucide-react';
import { Modal } from './Modal';

interface ClientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  editingId: string | null;
  initialData: Partial<ClientProject>;
}

export const ClientFormModal: React.FC<ClientFormModalProps> = ({ 
  isOpen, onClose, mode, editingId, initialData 
}) => {
  const { addClient, updateClient } = useApp();
  const [formData, setFormData] = useState<Partial<ClientProject>>(initialData);

  useEffect(() => {
    setFormData(initialData);
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.businessName || !formData.clientName) return;

    try {
      if (mode === 'edit' && editingId) {
        await updateClient(editingId, formData);
      } else {
        await addClient({
          clientName: formData.clientName!,
          businessName: formData.businessName!,
          contactPhone: formData.contactPhone || '',
          clientEmail: formData.clientEmail || '',
          projectUrl: formData.projectUrl || '',
          repoUrl: formData.repoUrl || '',
          configFileUrl: formData.configFileUrl || '',
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
      onClose();
    } catch (err) {
      console.error(err);
      alert("Error al guardar cliente");
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={mode === 'create' ? "Agregar Nuevo Cliente" : "Editar Cliente"}
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

              {/* --- URL CONFIG --- */}
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
          {mode === 'create' ? 'Crear Cliente' : 'Guardar Cambios'}
        </button>
      </form>
    </Modal>
  );
};
