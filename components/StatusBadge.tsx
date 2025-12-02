import React from 'react';
import { PaymentStatus } from '../types';

export const PaymentStatusBadge: React.FC<{ status: PaymentStatus }> = ({ status }) => {
  const styles = {
    [PaymentStatus.UpToDate]: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    [PaymentStatus.Pending]: 'bg-amber-100 text-amber-800 border-amber-200',
    [PaymentStatus.Overdue]: 'bg-rose-100 text-rose-800 border-rose-200',
  };

  const labels = {
    [PaymentStatus.UpToDate]: 'Al día',
    [PaymentStatus.Pending]: 'Pendiente',
    [PaymentStatus.Overdue]: 'Atrasado',
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}>
      {labels[status]}
    </span>
  );
};

export const ActiveStatusBadge: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border flex items-center gap-1.5 w-fit
      ${isActive ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-blue-500' : 'bg-slate-400'}`}></span>
      {isActive ? 'Servicio Activo' : 'Desactivado'}
    </span>
  );
};