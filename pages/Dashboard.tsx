import React, { useMemo } from 'react';
import { useApp } from '../store/AppContext';
import { PaymentStatus } from '../types';
import { DollarSign, Users, AlertTriangle, Activity } from 'lucide-react';

const DashboardCard: React.FC<{ 
  title: string; 
  value: string | number; 
  icon: React.ElementType;
  color: string;
}> = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-start justify-between">
    <div>
      <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
    </div>
    <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
      <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
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

  if (loadingData) return <div>Cargando métricas...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Resumen General</h1>
        <div className="text-sm text-slate-500">
          Actualizado en tiempo real
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard 
          title="Clientes Totales" 
          value={metrics.total} 
          icon={Users} 
          color="bg-blue-500" 
        />
        <DashboardCard 
          title="Licencias Activas" 
          value={metrics.active} 
          icon={Activity} 
          color="bg-emerald-500" 
        />
        <DashboardCard 
          title="Ingreso Mensual (Est.)" 
          value={`$${metrics.revenue.toLocaleString()}`} 
          icon={DollarSign} 
          color="bg-violet-500" 
        />
        <DashboardCard 
          title="Pagos Atrasados" 
          value={metrics.overdue} 
          icon={AlertTriangle} 
          color="bg-rose-500" 
        />
      </div>

      {/* Recent Activity / At Risk Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-semibold text-slate-800">Clientes con Pagos Pendientes</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {clients.filter(c => c.paymentStatus !== PaymentStatus.UpToDate).length === 0 ? (
            <div className="p-6 text-center text-slate-500">
              Todo en orden. No hay clientes con deudas.
            </div>
          ) : (
            clients
              .filter(c => c.paymentStatus !== PaymentStatus.UpToDate)
              .map(client => (
                <div key={client.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold">
                        {client.businessName.charAt(0)}
                     </div>
                     <div>
                       <p className="font-medium text-slate-900">{client.businessName}</p>
                       <p className="text-sm text-slate-500">Vence: {client.nextPaymentDate}</p>
                     </div>
                  </div>
                  <span className={`text-sm font-medium ${
                    client.paymentStatus === PaymentStatus.Overdue ? 'text-rose-600' : 'text-amber-600'
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