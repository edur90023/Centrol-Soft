// ARCHIVO: src/pages/Emails.tsx
import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { Mail, Plus, Trash2, Eye, EyeOff, Copy, CheckCircle, Search } from 'lucide-react';
import { Modal } from '../components/Modal';
import { encryptData, decryptData } from '../utils/security';

export const Emails: React.FC = () => {
  const { emails, addEmail, deleteEmail } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [visiblePasswords, setVisiblePasswords] = useState<{ [key: string]: boolean }>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    provider: 'Gmail',
    recoveryEmail: '',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) return;
    
    // ENCRIPTAR LA CONTRASEÑA ANTES DE ENVIAR
    await addEmail({
      ...formData,
      password: encryptData(formData.password)
    });

    setIsModalOpen(false);
    setFormData({ email: '', password: '', provider: 'Gmail', recoveryEmail: '', notes: '' });
  };

  const handleDelete = async (id: string) => {
    if(window.confirm('¿Eliminar esta cuenta de correo?')) {
      await deleteEmail(id);
    }
  };

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredEmails = emails.filter(e => 
    e.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.provider.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Cuentas de Correo</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" /> Nueva Cuenta
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input 
          type="text" 
          placeholder="Buscar cuenta..." 
          className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEmails.map((account) => {
          // DESENCRIPTAR PARA VISUALIZAR
          const realPassword = decryptData(account.password);

          return (
            <div key={account.id} className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all relative group">
              <button 
                onClick={() => handleDelete(account.id)}
                className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 truncate max-w-[150px]">{account.provider}</h3>
                  <span className="text-xs text-slate-500">Proveedor</span>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="bg-slate-50 p-2 rounded border border-slate-100 flex justify-between items-center">
                  <span className="font-medium text-slate-700 truncate mr-2">{account.email}</span>
                  <button onClick={() => copyToClipboard(account.email, `e-${account.id}`)} className="text-slate-400 hover:text-brand-600">
                    {copiedId === `e-${account.id}` ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <div className="bg-slate-50 p-2 rounded border border-slate-100 flex justify-between items-center">
                  <span className="font-mono text-slate-700 truncate mr-2">
                    {visiblePasswords[account.id] ? realPassword : '••••••••••••'}
                  </span>
                  <div className="flex gap-2">
                    <button onClick={() => togglePasswordVisibility(account.id)} className="text-slate-400 hover:text-brand-600">
                      {visiblePasswords[account.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button onClick={() => copyToClipboard(realPassword, `p-${account.id}`)} className="text-slate-400 hover:text-brand-600">
                      {copiedId === `p-${account.id}` ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {account.recoveryEmail && (
                  <div className="text-xs text-slate-500">
                    <span className="font-semibold">Recuperación:</span> {account.recoveryEmail}
                  </div>
                )}
                
                {account.notes && (
                  <div className="text-xs text-slate-500 italic border-t border-slate-100 pt-2 mt-2">
                    "{account.notes}"
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Agregar Cuenta de Correo">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Email *</label>
            <input required type="email" className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-brand-500/20 outline-none" 
              value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Contraseña *</label>
            <input required type="text" className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-brand-500/20 outline-none font-mono" 
              value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-3">
             <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Proveedor</label>
              <input type="text" placeholder="Ej: Gmail" className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-brand-500/20 outline-none" 
                value={formData.provider} onChange={e => setFormData({...formData, provider: e.target.value})} />
             </div>
             <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Email Recuperación</label>
              <input type="email" className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-brand-500/20 outline-none" 
                value={formData.recoveryEmail} onChange={e => setFormData({...formData, recoveryEmail: e.target.value})} />
             </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Notas</label>
            <textarea className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-brand-500/20 outline-none" rows={2}
              value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
          </div>
          <button type="submit" className="w-full bg-brand-600 text-white py-3 rounded-lg font-medium hover:bg-brand-700 transition-colors">
            Guardar Cuenta
          </button>
        </form>
      </Modal>
    </div>
  );
};
