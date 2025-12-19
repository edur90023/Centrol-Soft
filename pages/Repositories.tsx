// ARCHIVO: src/pages/Repositories.tsx
import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { Github, Plus, Trash2, Eye, EyeOff, Copy, CheckCircle, Search, ExternalLink, GitBranch } from 'lucide-react';
import { Modal } from '../components/Modal';
import { encryptData, decryptData } from '../utils/security';

export const Repositories: React.FC = () => {
  const { repos, addRepo, deleteRepo } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleTokens, setVisibleTokens] = useState<{ [key: string]: boolean }>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    platform: 'github' as const,
    url: '',
    username: '',
    tokenOrPassword: '',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.url) return;
    
    // ENCRIPTAR TOKEN
    await addRepo({
      ...formData,
      tokenOrPassword: encryptData(formData.tokenOrPassword)
    });

    setIsModalOpen(false);
    setFormData({ name: '', platform: 'github', url: '', username: '', tokenOrPassword: '', notes: '' });
  };

  const handleDelete = async (id: string) => {
    if(window.confirm('¿Eliminar este repositorio?')) {
      await deleteRepo(id);
    }
  };

  const toggleVisibility = (id: string) => {
    setVisibleTokens(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredRepos = repos.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Estilos reutilizables
  const inputClass = "w-full p-3 bg-slate-950/50 border border-slate-700/50 rounded-lg text-sm text-slate-200 focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500/50 outline-none transition-all placeholder:text-slate-600";
  const labelClass = "block text-xs font-medium text-slate-400 mb-1.5 ml-1";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Repositorios GIT</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-slate-100 hover:bg-white text-slate-900 px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg shadow-white/5 transition-all font-medium"
        >
          <Plus className="w-4 h-4" /> Nuevo Repo
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
        <input 
          type="text" 
          placeholder="Buscar repositorio..." 
          className="w-full pl-10 pr-4 py-3 bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-transparent transition-all placeholder:text-slate-600"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRepos.map((repo) => {
            const realToken = decryptData(repo.tokenOrPassword);

            return (
              <div key={repo.id} className="bg-slate-900/60 backdrop-blur-md rounded-xl p-5 border border-white/10 shadow-lg hover:border-brand-500/30 transition-all relative group">
                <button 
                  onClick={() => handleDelete(repo.id)}
                  className="absolute top-4 right-4 text-slate-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-200 border border-white/10">
                    <Github className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-200 truncate max-w-[150px]">{repo.name}</h3>
                    <span className="text-xs text-slate-500 uppercase font-bold">{repo.platform}</span>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-slate-400 pl-1">
                    <ExternalLink className="w-3 h-3" />
                    <a href={repo.url} target="_blank" rel="noreferrer" className="truncate hover:text-brand-400 hover:underline transition-colors">
                      {repo.url}
                    </a>
                  </div>

                  <div className="bg-slate-950/50 p-2.5 rounded-lg border border-white/5">
                    <div className="text-[10px] text-slate-500 mb-1 uppercase tracking-wider font-semibold">Usuario / Owner</div>
                    <div className="flex justify-between items-center">
                        <span className="font-medium text-slate-300">{repo.username}</span>
                        <button onClick={() => copyToClipboard(repo.username, `u-${repo.id}`)} className="text-slate-500 hover:text-brand-400 transition-colors">
                            {copiedId === `u-${repo.id}` ? <CheckCircle className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        </button>
                    </div>
                  </div>

                  <div className="bg-slate-950/50 p-2.5 rounded-lg border border-white/5">
                    <div className="text-[10px] text-slate-500 mb-1 uppercase tracking-wider font-semibold">Token / Password</div>
                    <div className="flex justify-between items-center">
                        <span className="font-mono text-slate-300 truncate mr-2 tracking-wider">
                        {visibleTokens[repo.id] ? realToken : '••••••••••••'}
                        </span>
                        <div className="flex gap-2">
                        <button onClick={() => toggleVisibility(repo.id)} className="text-slate-500 hover:text-brand-400 transition-colors">
                            {visibleTokens[repo.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        </button>
                        <button onClick={() => copyToClipboard(realToken, `t-${repo.id}`)} className="text-slate-500 hover:text-brand-400 transition-colors">
                            {copiedId === `t-${repo.id}` ? <CheckCircle className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        </button>
                        </div>
                    </div>
                  </div>

                  {repo.notes && (
                    <div className="text-xs text-slate-500 italic border-t border-white/5 pt-2 mt-2 px-1">
                      <GitBranch className="w-3 h-3 inline mr-1" />
                      "{repo.notes}"
                    </div>
                  )}
                </div>
              </div>
            );
        })}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Agregar Repositorio">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Nombre Proyecto *</label>
            <input required type="text" className={inputClass}
              value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div>
            <label className={labelClass}>URL Repositorio *</label>
            <input required type="url" placeholder="https://github.com/..." className={inputClass}
              value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
             <div>
              <label className={labelClass}>Plataforma</label>
              <select className={inputClass}
                value={formData.platform} onChange={e => setFormData({...formData, platform: e.target.value as any})}>
                  <option value="github">GitHub</option>
                  <option value="gitlab">GitLab</option>
                  <option value="bitbucket">Bitbucket</option>
                  <option value="other">Otro</option>
              </select>
             </div>
             <div>
              <label className={labelClass}>Usuario / Owner</label>
              <input type="text" className={inputClass}
                value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
             </div>
          </div>

          <div>
            <label className={labelClass}>Token de Acceso (PAT) / Contraseña</label>
            <input required type="text" className={`${inputClass} font-mono`}
              value={formData.tokenOrPassword} onChange={e => setFormData({...formData, tokenOrPassword: e.target.value})} />
          </div>

          <div>
            <label className={labelClass}>Notas</label>
            <textarea className={inputClass} rows={2}
              value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
          </div>
          
          <button type="submit" className="w-full bg-slate-100 text-slate-900 py-3 rounded-lg font-bold hover:bg-white transition-colors shadow-lg shadow-white/5 mt-2">
            Guardar Repo
          </button>
        </form>
      </Modal>
    </div>
  );
};
