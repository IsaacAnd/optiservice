import React from 'react';
import { ServiceStatus, ServicePriority, AppointmentStatus } from '../../types';

interface ServiceStatusBadgeProps {
  status: ServiceStatus;
}

export const ServiceStatusBadge: React.FC<ServiceStatusBadgeProps> = ({ status }) => {
  const getBadgeStyle = () => {
    switch (status) {
      case 'Solicitado':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      case 'Agendado':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Em execução':
        return 'bg-amber-50 text-amber-800 border-amber-300';
      case 'Aguardando peça':
        return 'bg-orange-50 text-orange-800 border-orange-300';
      case 'Concluído':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium border ${getBadgeStyle()}`}
    >
      {status}
    </span>
  );
};

export const PriorityBadge: React.FC<{ priority: ServicePriority }> = ({ priority }) => {
  const getPriorityStyle = () => {
    switch (priority) {
      case 'Baixa':
        return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'Média':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Alta':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Urgente':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getPriorityStyle()}`}
    >
      {priority}
    </span>
  );
};

export const AppointmentStatusBadge: React.FC<{ status: AppointmentStatus }> = ({ status }) => {
  const getStyle = () => {
    switch (status) {
      case 'Agendado':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Confirmado':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Realizado':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Cancelado':
        return 'bg-gray-100 text-gray-500 border-gray-300 line-through';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium border ${getStyle()}`}
    >
      {status}
    </span>
  );
};
