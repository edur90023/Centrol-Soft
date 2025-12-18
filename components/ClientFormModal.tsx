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

  const inputClass = "w-full p-2.5 bg-slate-950/50 border border-slate-700/50 rounded-lg text-sm text-slate-200 focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500/50 outline-none transition-all placeholder:text-slate-600";
  const labelClass = "block text-xs font-medium text-slate-400 mb-1.5 ml-1";

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={mode === 'create' ? "Agregar Nuevo Cliente" : "Editar Cliente"}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Status & Payment */}
        <div className="bg-slate-800/30 p-4 rounded-xl border border-white/5">
           <h4 className="text-xs font-bold text-brand-400 uppercase mb-3 flex items-center gap-2">
             <CreditCard className="w-3 h-3" /> Estado y Facturación
           </h4>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="col-span-1 md:col-span-2 flex items-center gap-3 bg-slate-900/50 p-3 rounded-lg border border-white/5">
               <input 
                  type="checkbox" 
                  id="isActive"
                  checked={formData.isActive}
                  onChange={e => setFormData({...formData, isActive: e.target.checked})}
                  className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500 bg-slate-800 border-slate-600"
               />
               <label htmlFor="isActive" className="text-sm font-medium text-slate-200 select-none cursor-pointer">
                 Servicio Activo (Reflejado en DB)
               </label>
             </div>

             <div>
               <label className={labelClass}>Estado de Pago</label>
               <select 
                 value={formData.paymentStatus} 
                 onChange={e => setFormData({...formData, paymentStatus: e.target.value as PaymentStatus})}
                 className={inputClass}
               >
                 <option value={PaymentStatus.UpToDate}>Al día</option>
                 <option value={PaymentStatus.Pending}>Pendiente</option>
                 <option value={PaymentStatus.Overdue}>Atrasado</option>
               </select>
             </div>
             <div>
               <label className={labelClass}>Próximo Vencimiento</label>
               <input 
                 type="date" 
                 value={formData.nextPaymentDate} 
                 onChange={e => setFormData({...formData, nextPaymentDate: e.target.value})}
                 className={inputClass} 
               />
             </div>
           </div>
        </div>

        {/* Basic Info */}
        <div className="bg-slate-800/30 p-4 rounded-xl border border-white/5">
          <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Información General</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className={labelClass}>Nombre del Negocio *</label>
              <input required type="text" className={inputClass}
                value={formData.businessName} onChange={e => setFormData({...formData, businessName: e.target.value})} />
            </div>
            <div>
              <label className={labelClass}>Cliente *</label>
              <input required type="text" className={inputClass}
                value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} />
            </div>
            <div>
              <label className={labelClass}>Cuota ($)</label>
              <input type="number" className={inputClass}
                value={formData.monthlyFee} onChange={e => setFormData({...formData, monthlyFee: Number(e.target.value)})} />
            </div>
            <div>
              <label className={labelClass}>Teléfono</label>
              <input type="text" className={inputClass}
                value={formData.contactPhone} onChange={e => setFormData({...formData, contactPhone: e.target.value})} />
            </div>
            <div>
              <label className={labelClass}>Email Cliente</label>
              <input type="email" className={inputClass}
                value={formData.clientEmail} onChange={e => setFormData({...formData, clientEmail: e.target.value})} />
            </div>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="bg-slate-800/30 p-4 rounded-xl border border-white/5">
           <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Infraestructura & Accesos</h4>
           <div className="grid grid-cols-2 gap-4">
              <input placeholder="Backend (ej: Node)" className={inputClass}
                value={formData.backendTech} onChange={e => setFormData({...formData, backendTech: e.target.value})} />
              <input placeholder="Frontend (ej: React)" className={inputClass}
                value={formData.frontendTech} onChange={e => setFormData({...formData, frontendTech: e.target.value})} />
              <input placeholder="Database (ej: Mongo)" className={inputClass}
                value={formData.dbTech} onChange={e => setFormData({...formData, dbTech: e.target.value})} />
              <input placeholder="Storage (ej: S3)" className={inputClass}
                value={formData.storageTech} onChange={e => setFormData({...formData, storageTech: e.target.value})} />
              
              <div className="col-span-2">
                <label className={labelClass}>URL Repositorio Principal</label>
                <input placeholder="https://github.com/usuario/proyecto" className={inputClass}
                  value={formData.repoUrl} onChange={e => setFormData({...formData, repoUrl: e.target.value})} />
              </div>

              {/* URL CONFIG - RED STYLE */}
              <div className="col-span-2 bg-red-900/10 p-3 rounded-lg border border-red-500/20">
                <label className="block text-xs font-bold text-red-400 mb-1.5 flex items-center gap-1">
                  <FileEdit size={12}/> URL de Edición (Kill Switch)
                </label>
                <input 
                  placeholder="https://github.com/usr/repo/edit/main/config.ts" 
                  className="w-full p-2.5 bg-red-950/30 border border-red-500/20 rounded-lg text-sm text-red-200 placeholder:text-red-800/50 focus:ring-2 focus:ring-red-500/30 outline-none"
                  value={formData.configFileUrl} 
                  onChange={e => setFormData({...formData, configFileUrl: e.target.value})} 
                />
                <p className="text-[10px] text-red-400/60 mt-1.5">Link directo para editar config.ts</p>
              </div>
              
              <div className="col-span-2">
                <label className={labelClass}>URL Proyecto (Web Pública)</label>
                <input placeholder="https://mi-proyecto.com" className={inputClass}
                  value={formData.projectUrl} onChange={e => setFormData({...formData, projectUrl: e.target.value})} />
              </div>
              
              <div className="col-span-2 border-t border-white/5 mt-2 pt-4">
                <label className="block text-xs font-medium text-slate-500 mb-2">Credenciales App Superadmin</label>
                <div className="grid grid-cols-2 gap-4">
                  <input placeholder="Email Admin" className={inputClass}
                    value={formData.appAdminEmail} onChange={e => setFormData({...formData, appAdminEmail: e.target.value})} />
                  <input placeholder="Password Admin" className={inputClass}
                    value={formData.appAdminPassword} onChange={e => setFormData({...formData, appAdminPassword: e.target.value})} />
                </div>
              </div>
           </div>
        </div>

        <button type="submit" className="w-full bg-slate-100 text-slate-900 py-3 rounded-lg font-bold hover:bg-white transition-colors shadow-lg shadow-white/5">
          {mode === 'create' ? 'Crear Cliente' : 'Guardar Cambios'}
        </button>
      </form>
    </Modal>
  );
};
