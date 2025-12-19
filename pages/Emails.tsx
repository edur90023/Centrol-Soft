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
    setVisiblePasswords(prev => ({ ...prev, [id]: !prev[id] }));
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

  // Estilos reutilizables para inputs oscuros
  const inputClass = "w-full p-3 bg-slate-950/50 border border-slate-700/50 rounded-lg text-sm text-slate-200 focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500/50 outline-none transition-all placeholder:text-slate-600";
  const labelClass = "block text-xs font-medium text-slate-400 mb-1.5 ml-1";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Cuentas de Correo</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-lg shadow-brand-500/20"
        >
          <Plus className="w-4 h-4" /> Nueva Cuenta
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
        <input 
          type="text" 
          placeholder="Buscar cuenta..." 
          className="w-full pl-10 pr-4 py-3 bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-transparent transition-all placeholder:text-slate-600"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEmails.map((account) => {
          // DESENCRIPTAR PARA VISUALIZAR
          const realPassword = decryptData(account.password);

          return (
            <div key={account.id} className="bg-slate-900/60 backdrop-blur-md rounded-xl p-5 border border-white/10 shadow-lg hover:border-brand-500/30 transition-all relative group">
              <button 
                onClick={() => handleDelete(account.id)}
                className="absolute top-4 right-4 text-slate-500 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-blue-900/30 flex items-center justify-center text-blue-400 border border-blue-500/20">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-200 truncate max-w-[150px]">{account.provider}</h3>
                  <span className="text-xs text-slate-500">Proveedor</span>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="bg-slate-950/50 p-2.5 rounded-lg border border-white/5 flex justify-between items-center group/item">
                  <span className="font-medium text-slate-300 truncate mr-2">{account.email}</span>
                  <button onClick={() => copyToClipboard(account.email, `e-${account.id}`)} className="text-slate-500 hover:text-brand-400 transition-colors">
                    {copiedId === `e-${account.id}` ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <div className="bg-slate-950/50 p-2.5 rounded-lg border border-white/5 flex justify-between items-center group/item">
                  <span className="font-mono text-slate-300 truncate mr-2 tracking-wider">
                    {visiblePasswords[account.id] ? realPassword : '••••••••••••'}
                  </span>
                  <div className="flex gap-2">
                    <button onClick={() => togglePasswordVisibility(account.id)} className="text-slate-500 hover:text-brand-400 transition-colors">
                      {visiblePasswords[account.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button onClick={() => copyToClipboard(realPassword, `p-${account.id}`)} className="text-slate-500 hover:text-brand-400 transition-colors">
                      {copiedId === `p-${account.id}` ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {account.recoveryEmail && (
                  <div className="text-xs text-slate-500 px-1">
                    <span className="font-semibold text-slate-400">Recuperación:</span> {account.recoveryEmail}
                  </div>
                )}
                
                {account.notes && (
                  <div className="text-xs text-slate-500 italic border-t border-white/5 pt-2 mt-2 px-1">
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
            <label className={labelClass}>Email *</label>
            <input required type="email" className={inputClass}
              value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>
          <div>
            <label className={labelClass}>Contraseña *</label>
            <input required type="text" className={`${inputClass} font-mono`}
              value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-3">
             <div>
              <label className={labelClass}>Proveedor</label>
              <input type="text" placeholder="Ej: Gmail" className={inputClass}
                value={formData.provider} onChange={e => setFormData({...formData, provider: e.target.value})} />
             </div>
             <div>
              <label className={labelClass}>Email Recuperación</label>
              <input type="email" className={inputClass}
                value={formData.recoveryEmail} onChange={e => setFormData({...formData, recoveryEmail: e.target.value})} />
             </div>
          </div>
          <div>
            <label className={labelClass}>Notas</label>
            <textarea className={inputClass} rows={2}
              value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
          </div>
          <button type="submit" className="w-full bg-slate-100 text-slate-900 py-3 rounded-lg font-bold hover:bg-white transition-colors shadow-lg shadow-white/5 mt-2">
            Guardar Cuenta
          </button>
        </form>
      </Modal>
    </div>
  );
};
