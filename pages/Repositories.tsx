// ARCHIVO: src/pages/Repositories.tsx
import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { Github, Plus, Trash2, Eye, EyeOff, Copy, CheckCircle, Search, ExternalLink, GitBranch } from 'lucide-react';
import { Modal } from '../components/Modal';

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
    
    await addRepo(formData);
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Repositorios GIT</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" /> Nuevo Repo
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input 
          type="text" 
          placeholder="Buscar repositorio..." 
          className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRepos.map((repo) => (
          <div key={repo.id} className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all relative group">
            <button 
              onClick={() => handleDelete(repo.id)}
              className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700">
                <Github className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 truncate max-w-[150px]">{repo.name}</h3>
                <span className="text-xs text-slate-500 uppercase">{repo.platform}</span>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-slate-600">
                 <ExternalLink className="w-3 h-3" />
                 <a href={repo.url} target="_blank" rel="noreferrer" className="truncate hover:text-blue-600 hover:underline">
                   {repo.url}
                 </a>
              </div>

              <div className="bg-slate-50 p-2 rounded border border-slate-100">
                <div className="text-xs text-slate-400 mb-1">Usuario / Owner</div>
                <div className="flex justify-between items-center">
                    <span className="font-medium text-slate-700">{repo.username}</span>
                    <button onClick={() => copyToClipboard(repo.username, `u-${repo.id}`)} className="text-slate-400 hover:text-slate-600">
                        {copiedId === `u-${repo.id}` ? <CheckCircle className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    </button>
                </div>
              </div>

              <div className="bg-slate-50 p-2 rounded border border-slate-100">
                <div className="text-xs text-slate-400 mb-1">Token / Password</div>
                <div className="flex justify-between items-center">
                    <span className="font-mono text-slate-700 truncate mr-2">
                    {visibleTokens[repo.id] ? repo.tokenOrPassword : '••••••••••••'}
                    </span>
                    <div className="flex gap-2">
                    <button onClick={() => toggleVisibility(repo.id)} className="text-slate-400 hover:text-slate-600">
                        {visibleTokens[repo.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    </button>
                    <button onClick={() => copyToClipboard(repo.tokenOrPassword, `t-${repo.id}`)} className="text-slate-400 hover:text-slate-600">
                        {copiedId === `t-${repo.id}` ? <CheckCircle className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    </button>
                    </div>
                </div>
              </div>

              {repo.notes && (
                <div className="text-xs text-slate-500 italic border-t border-slate-100 pt-2 mt-2">
                  <GitBranch className="w-3 h-3 inline mr-1" />
                  "{repo.notes}"
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Agregar Repositorio">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Nombre Proyecto *</label>
            <input required type="text" className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-slate-500/20 outline-none" 
              value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">URL Repositorio *</label>
            <input required type="url" placeholder="https://github.com/..." className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-slate-500/20 outline-none" 
              value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
             <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Plataforma</label>
              <select className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-slate-500/20 outline-none bg-white" 
                value={formData.platform} onChange={e => setFormData({...formData, platform: e.target.value as any})}>
                  <option value="github">GitHub</option>
                  <option value="gitlab">GitLab</option>
                  <option value="bitbucket">Bitbucket</option>
                  <option value="other">Otro</option>
              </select>
             </div>
             <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Usuario / Owner</label>
              <input type="text" className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-slate-500/20 outline-none" 
                value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
             </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Token de Acceso (PAT) / Contraseña</label>
            <input required type="text" className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-slate-500/20 outline-none font-mono" 
              value={formData.tokenOrPassword} onChange={e => setFormData({...formData, tokenOrPassword: e.target.value})} />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Notas</label>
            <textarea className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-slate-500/20 outline-none" rows={2}
              value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
          </div>
          
          <button type="submit" className="w-full bg-slate-900 text-white py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors">
            Guardar Repo
          </button>
        </form>
      </Modal>
    </div>
  );
};
