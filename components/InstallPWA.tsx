import React, { useEffect, useState } from 'react';
import { Download, X, Share, PlusSquare, Smartphone } from 'lucide-react';

export const InstallPWA: React.FC = () => {
  const [supportsPWA, setSupportsPWA] = useState(false);
  const [promptInstall, setPromptInstall] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    setIsStandalone(isStandaloneMode);
    if (isStandaloneMode) return;

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    const handler = (e: any) => {
      e.preventDefault();
      setPromptInstall(e);
      setSupportsPWA(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    if (isIosDevice) setSupportsPWA(true);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isIOS) {
        setShowIOSInstructions(true);
        return;
    }
    if (!promptInstall) return;
    promptInstall.prompt();
  };

  if (!supportsPWA || isStandalone) return null;

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50 animate-bounce-subtle">
        <button
          onClick={handleInstallClick}
          className="group flex items-center gap-3 bg-brand-600/90 hover:bg-brand-500 text-white px-5 py-3 rounded-full shadow-lg shadow-brand-500/30 backdrop-blur-md border border-white/10 transition-all hover:scale-105"
        >
          <Download className="w-5 h-5" />
          <span className="font-bold text-sm">Instalar App</span>
        </button>
      </div>

      {showIOSInstructions && (
        <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/10 w-full max-w-sm rounded-3xl p-6 relative shadow-2xl">
            <button onClick={() => setShowIOSInstructions(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X size={20} />
            </button>
            <div className="text-center mb-6">
                <div className="w-16 h-16 bg-slate-800 rounded-2xl mx-auto mb-4 flex items-center justify-center border border-white/5">
                    <Smartphone className="w-8 h-8 text-brand-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Instalar en iOS</h3>
                <p className="text-slate-400 text-sm">Sigue estos pasos para agregar a inicio:</p>
            </div>
            <div className="space-y-4 bg-slate-950/50 p-4 rounded-xl border border-white/5">
                <div className="flex items-center gap-4">
                    <Share className="text-blue-400 w-6 h-6" />
                    <p className="text-sm text-slate-300">1. Toca <span className="font-bold text-white">Compartir</span> en Safari.</p>
                </div>
                <div className="h-px bg-white/5 w-full"></div>
                <div className="flex items-center gap-4">
                    <PlusSquare className="text-white w-6 h-6" />
                    <p className="text-sm text-slate-300">2. Selecciona <span className="font-bold text-white">"Agregar a Inicio"</span>.</p>
                </div>
            </div>
            <button onClick={() => setShowIOSInstructions(false)} className="mt-6 w-full py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-bold transition-colors">
                Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
};
