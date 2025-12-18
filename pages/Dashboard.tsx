import React, { useMemo } from 'react';
import { useApp } from '../store/AppContext';
import { PaymentStatus } from '../types';
import { DollarSign, Users, AlertTriangle, Activity } from 'lucide-react';

const DashboardCard: React.FC<{ 
  title: string; 
  value: string | number; 
  icon: React.ElementType;
  color: string;
  textColor: string;
}> = ({ title, value, icon: Icon, color, textColor }) => (
  <div className="bg-slate-900/60 backdrop-blur-md p-6 rounded-xl shadow-lg border border-white/10 flex items-start justify-between relative overflow-hidden group hover:border-white/20 transition-all">
    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    <div className="relative z-10">
      <p className="text-sm font-medium text-slate-400 mb-1">{title}</p>
      <h3 className="text-3xl font-bold text-white tracking-tight">{value}</h3>
    </div>
    <div className={`p-3 rounded-lg ${color} bg-opacity-20 relative z-10`}>
      <Icon className={`w-6 h-6 ${textColor}`} />
    </div>
  </div>
);

export const Dashboard: React.FC = () => {
  const { clients, loadingData } = useApp();

  const metrics = useMemo(() => {
    return {
      total: clients.length,
      active: clients.filter(c => c.isActive).length,
      revenue: clients.reduce((acc, curr) => acc + (curr.isActive ? curr.monthlyFee : 0), 0),
      overdue: clients.filter(c => c.paymentStatus === PaymentStatus.Overdue).length,
    };
  }, [clients]);

  if (loadingData) return <div className="text-slate-400 animate-pulse">Cargando métricas...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Resumen General</h1>
        <div className="text-sm text-slate-500 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Tiempo real
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard 
          title="Clientes Totales" 
          value={metrics.total} 
          icon={Users} 
          color="bg-blue-500"
          textColor="text-blue-400"
        />
        <DashboardCard 
          title="Licencias Activas" 
          value={metrics.active} 
          icon={Activity} 
          color="bg-emerald-500"
          textColor="text-emerald-400"
        />
        <DashboardCard 
          title="Ingreso Mensual" 
          value={`$${metrics.revenue.toLocaleString()}`} 
          icon={DollarSign} 
          color="bg-violet-500"
          textColor="text-violet-400"
        />
        <DashboardCard 
          title="Pagos Atrasados" 
          value={metrics.overdue} 
          icon={AlertTriangle} 
          color="bg-rose-500"
          textColor="text-rose-400"
        />
      </div>

      <div className="bg-slate-900/60 backdrop-blur-md rounded-xl shadow-lg border border-white/10 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 bg-slate-900/50">
          <h3 className="font-semibold text-slate-200">Alertas de Pago</h3>
        </div>
        <div className="divide-y divide-white/5">
          {clients.filter(c => c.paymentStatus !== PaymentStatus.UpToDate).length === 0 ? (
            <div className="p-8 text-center text-slate-500 flex flex-col items-center">
              <Activity className="w-10 h-10 mb-2 opacity-20" />
              Todo en orden. No hay deudas pendientes.
            </div>
          ) : (
            clients
              .filter(c => c.paymentStatus !== PaymentStatus.UpToDate)
              .map(client => (
                <div key={client.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-slate-300 font-bold">
                        {client.businessName.charAt(0)}
                     </div>
                     <div>
                       <p className="font-medium text-slate-200">{client.businessName}</p>
                       <p className="text-sm text-slate-500">Vence: {client.nextPaymentDate}</p>
                     </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                    client.paymentStatus === PaymentStatus.Overdue 
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}>
                    {client.paymentStatus === PaymentStatus.Overdue ? 'Atrasado' : 'Pendiente'}
                  </span>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
};
