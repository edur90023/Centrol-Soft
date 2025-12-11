// ARCHIVO: src/components/Layout.tsx
import React from 'react';
import { useApp } from '../store/AppContext';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  LogOut, 
  ShieldCheck, 
  Menu,
  X,
  Mail, // Nuevo Icono
  Github // Nuevo Icono
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, loadingAuth, logout } = useApp();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  if (loadingAuth) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = async () => {
    await logout();
  };

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Clientes', path: '/clients', icon: Users },
    // Nuevas Rutas
    { label: 'Cuentas Correo', path: '/emails', icon: Mail },
    { label: 'Repositorios', path: '/repos', icon: Github },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      {/* Mobile Sidebar Backdrop */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center h-16 border-b border-slate-700 bg-slate-950 relative">
            <ShieldCheck className="w-8 h-8 text-brand-500 mr-2" />
            <span className="text-xl font-bold tracking-wider">ADMIN<span className="text-brand-500">SaaS</span></span>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  location.pathname === item.path 
                    ? 'bg-brand-600 text-white' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-slate-700">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Cerrar Sesión
            </button>
            <div className="mt-4 text-xs text-slate-500 text-center">
              v1.1.0 Beta
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="flex items-center justify-between px-6 py-4 bg-white shadow-sm md:hidden">
            <div className="text-lg font-bold text-slate-800">Panel de Control</div>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-slate-600">
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
