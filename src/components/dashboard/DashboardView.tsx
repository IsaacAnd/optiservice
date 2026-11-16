import React from 'react';
import {
  Users,
  Laptop,
  ClipboardList,
  CalendarDays,
  Clock,
  ArrowRight,
  AlertCircle,
  FileCheck2,
  Wrench,
  DollarSign,
  TrendingUp,
  Package,
} from 'lucide-react';
import {
  Client,
  Equipment,
  ServiceOrder,
  Appointment,
  NavigationPage,
  ServiceStatus,
} from '../../types';
import { ServiceStatusBadge, PriorityBadge } from '../common/StatusBadge';

interface DashboardViewProps {
  clients: Client[];
  equipment: Equipment[];
  services: ServiceOrder[];
  appointments: Appointment[];
  onNavigate: (page: NavigationPage) => void;
  onFilterStatus?: (status: ServiceStatus) => void;
  onSelectService: (service: ServiceOrder) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  clients,
  equipment,
  services,
  appointments,
  onNavigate,
  onFilterStatus,
  onSelectService,
}) => {
  // Contadores de status de serviço exigidos
  const statusCounts: Record<ServiceStatus, number> = {
    Solicitado: 0,
    Agendado: 0,
    'Em execução': 0,
    'Aguardando peça': 0,
    Concluído: 0,
  };

  let completedRevenue = 0;
  let completedLabor = 0;
  let completedParts = 0;

  services.forEach((s) => {
    if (statusCounts[s.status] !== undefined) {
      statusCounts[s.status]++;
    }
    if (s.status === 'Concluído') {
      completedRevenue += Number(s.totalCost || 0);
      completedLabor += Number(s.laborCost || 0);
      completedParts += Number(s.partsCost || 0);
    }
  });

  const averageTicket =
    statusCounts['Concluído'] > 0
      ? completedRevenue / statusCounts['Concluído']
      : 0;

  const activeServicesCount =
    statusCounts['Solicitado'] +
    statusCounts['Agendado'] +
    statusCounts['Em execução'] +
    statusCounts['Aguardando peça'];

  const pendingAppointments = appointments.filter(
    (a) => a.status === 'Agendado' || a.status === 'Confirmado'
  ).length;

  const recentServices = [...services].slice(0, 5);
  const upcomingAppointments = [...appointments]
    .filter((a) => a.status !== 'Cancelado')
    .slice(0, 4);

  const formatBRL = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Clientes */}
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Clientes Cadastrados
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{clients.length}</p>
            </div>
            <div className="w-10 h-10 rounded bg-slate-100 flex items-center justify-center text-slate-700">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
            <span className="text-gray-500">Base ativa</span>
            <button
              onClick={() => onNavigate('clients')}
              className="text-blue-700 hover:text-blue-900 font-medium flex items-center gap-1"
            >
              <span>Gerenciar</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Total Equipamentos */}
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Equipamentos Registrados
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{equipment.length}</p>
            </div>
            <div className="w-10 h-10 rounded bg-slate-100 flex items-center justify-center text-slate-700">
              <Laptop className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
            <span className="text-gray-500">Parque sob assistência</span>
            <button
              onClick={() => onNavigate('equipment')}
              className="text-blue-700 hover:text-blue-900 font-medium flex items-center gap-1"
            >
              <span>Ver todos</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Ordens em Andamento */}
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Serviços em Aberto
              </p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{activeServicesCount}</p>
            </div>
            <div className="w-10 h-10 rounded bg-blue-50 flex items-center justify-center text-blue-700">
              <Wrench className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
            <span className="text-gray-500">{statusCounts['Concluído']} concluídos</span>
            <button
              onClick={() => onNavigate('services')}
              className="text-blue-700 hover:text-blue-900 font-medium flex items-center gap-1"
            >
              <span>Ordens de Serviço</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Agendamentos */}
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Agendamentos Pendentes
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{pendingAppointments}</p>
            </div>
            <div className="w-10 h-10 rounded bg-slate-100 flex items-center justify-center text-slate-700">
              <CalendarDays className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
            <span className="text-gray-500">Visitas & entregas</span>
            <button
              onClick={() => onNavigate('appointments')}
              className="text-blue-700 hover:text-blue-900 font-medium flex items-center gap-1"
            >
              <span>Agenda</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Seção de Status dos Serviços (Grid empresarial interativo com filtros diretos) */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-2xs p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">
              Distribuição de Serviços por Status
            </h2>
            <p className="text-xs text-gray-500">
              Clique em um dos 5 status para filtrar a listagem operacional
            </p>
          </div>
          <button
            onClick={() => {
              if (onFilterStatus) onFilterStatus('Todos' as any);
              else onNavigate('services');
            }}
            className="text-xs text-blue-700 hover:underline font-medium"
          >
            Ver todos ({services.length})
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <button
            type="button"
            onClick={() => (onFilterStatus ? onFilterStatus('Solicitado') : onNavigate('services'))}
            className="p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded text-center transition-all cursor-pointer group text-left"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">Solicitado</span>
              <span className="w-2 h-2 rounded-full bg-slate-400 group-hover:scale-125 transition-transform" />
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-2 font-mono tabular-nums">{statusCounts['Solicitado']}</p>
            <span className="inline-block mt-1 text-[11px] text-slate-500">Triagem inicial &bull; Filtrar &rarr;</span>
          </button>

          <button
            type="button"
            onClick={() => (onFilterStatus ? onFilterStatus('Agendado') : onNavigate('services'))}
            className="p-3.5 bg-blue-50/70 hover:bg-blue-100/70 border border-blue-200 hover:border-blue-300 rounded text-center transition-all cursor-pointer group text-left"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-blue-800">Agendado</span>
              <span className="w-2 h-2 rounded-full bg-blue-500 group-hover:scale-125 transition-transform" />
            </div>
            <p className="text-2xl font-bold text-blue-900 mt-2 font-mono tabular-nums">{statusCounts['Agendado']}</p>
            <span className="inline-block mt-1 text-[11px] text-blue-600">Com data marcada &bull; Filtrar &rarr;</span>
          </button>

          <button
            type="button"
            onClick={() => (onFilterStatus ? onFilterStatus('Em execução') : onNavigate('services'))}
            className="p-3.5 bg-amber-50/70 hover:bg-amber-100/70 border border-amber-200 hover:border-amber-300 rounded text-center transition-all cursor-pointer group text-left"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-800">Em execução</span>
              <span className="w-2 h-2 rounded-full bg-amber-500 group-hover:scale-125 transition-transform" />
            </div>
            <p className="text-2xl font-bold text-amber-900 mt-2 font-mono tabular-nums">{statusCounts['Em execução']}</p>
            <span className="inline-block mt-1 text-[11px] text-amber-700">Na bancada técnica &bull; Filtrar &rarr;</span>
          </button>

          <button
            type="button"
            onClick={() => (onFilterStatus ? onFilterStatus('Aguardando peça') : onNavigate('services'))}
            className="p-3.5 bg-orange-50/70 hover:bg-orange-100/70 border border-orange-200 hover:border-orange-300 rounded text-center transition-all cursor-pointer group text-left"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-orange-800">Aguardando peça</span>
              <span className="w-2 h-2 rounded-full bg-orange-500 group-hover:scale-125 transition-transform" />
            </div>
            <p className="text-2xl font-bold text-orange-900 mt-2 font-mono tabular-nums">{statusCounts['Aguardando peça']}</p>
            <span className="inline-block mt-1 text-[11px] text-orange-700">Estoque / Peça &bull; Filtrar &rarr;</span>
          </button>

          <button
            type="button"
            onClick={() => (onFilterStatus ? onFilterStatus('Concluído') : onNavigate('services'))}
            className="p-3.5 bg-emerald-50/70 hover:bg-emerald-100/70 border border-emerald-200 hover:border-emerald-300 rounded text-center transition-all cursor-pointer group text-left"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-800">Concluído</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 group-hover:scale-125 transition-transform" />
            </div>
            <p className="text-2xl font-bold text-emerald-900 mt-2 font-mono tabular-nums">{statusCounts['Concluído']}</p>
            <span className="inline-block mt-1 text-[11px] text-emerald-700">Finalizado &bull; Filtrar &rarr;</span>
          </button>
        </div>
      </div>

      {/* Indicadores Financeiros de Manutenção */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-2xs p-5">
        <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider">
              Painel Financeiro & Rendimento da Oficina
            </h3>
          </div>
          <span className="text-[11px] text-gray-500">
            Base: {statusCounts['Concluído']} ordem(ns) de serviço finalizadas
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded">
            <span className="text-[11px] text-gray-500 block font-medium">Faturamento Total Concluído</span>
            <p className="text-lg font-bold text-emerald-700 mt-0.5 font-mono tabular-nums">
              {formatBRL(completedRevenue)}
            </p>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded">
            <span className="text-[11px] text-gray-500 block font-medium">Ticket Médio por O.S.</span>
            <p className="text-lg font-bold text-slate-800 mt-0.5 font-mono tabular-nums">
              {formatBRL(averageTicket)}
            </p>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded">
            <span className="text-[11px] text-gray-500 block font-medium">Mão de Obra Técnica</span>
            <p className="text-lg font-bold text-blue-800 mt-0.5 font-mono tabular-nums">
              {formatBRL(completedLabor)}
            </p>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded">
            <span className="text-[11px] text-gray-500 block font-medium">Peças & Componentes</span>
            <p className="text-lg font-bold text-slate-800 mt-0.5 font-mono tabular-nums">
              {formatBRL(completedParts)}
            </p>
          </div>
        </div>
      </div>

      {/* Duas colunas: Ordens Recentes e Próximos Agendamentos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tabela de Ordens Recentes (2 colunas no desktop) */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 shadow-2xs overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-gray-500" />
              <h2 className="text-sm font-semibold text-gray-900">
                Últimas Ordens de Serviço
              </h2>
            </div>
            <button
              onClick={() => onNavigate('services')}
              className="text-xs text-blue-700 hover:text-blue-900 font-medium"
            >
              Ver todas ({services.length})
            </button>
          </div>

          {recentServices.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm">
              <FileCheck2 className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p>Nenhuma ordem de serviço cadastrada no momento.</p>
              <p className="text-xs text-gray-400 mt-1">
                Utilize o menu Serviços para iniciar uma ordem de manutenção.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/75 text-gray-600 font-medium">
                    <th className="py-2.5 px-4">Código</th>
                    <th className="py-2.5 px-4">Cliente</th>
                    <th className="py-2.5 px-4">Equipamento</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4">Prioridade</th>
                    <th className="py-2.5 px-4 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentServices.map((service) => (
                    <tr key={service.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-2.5 px-4 font-mono font-medium text-gray-900">
                        {service.serviceCode}
                      </td>
                      <td className="py-2.5 px-4 text-gray-800 font-medium max-w-[140px] truncate">
                        {service.clientName}
                      </td>
                      <td className="py-2.5 px-4 text-gray-600 max-w-[150px] truncate">
                        {service.equipmentSummary}
                      </td>
                      <td className="py-2.5 px-4">
                        <ServiceStatusBadge status={service.status} />
                      </td>
                      <td className="py-2.5 px-4">
                        <PriorityBadge priority={service.priority} />
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => onSelectService(service)}
                          className="text-blue-700 hover:text-blue-900 font-medium hover:underline"
                        >
                          Consultar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Próximos Agendamentos */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-2xs overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <h2 className="text-sm font-semibold text-gray-900">
                Próximos Agendamentos
              </h2>
            </div>
            <button
              onClick={() => onNavigate('appointments')}
              className="text-xs text-blue-700 hover:text-blue-900 font-medium"
            >
              Agenda
            </button>
          </div>

          {upcomingAppointments.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm">
              <CalendarDays className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p>Nenhum agendamento ativo.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {upcomingAppointments.map((app) => (
                <div key={app.id} className="p-3.5 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-semibold text-gray-900">{app.clientName}</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        {app.equipmentSummary || 'Atendimento técnico'}
                      </p>
                    </div>
                    <span className="text-[11px] font-mono px-2 py-0.5 bg-gray-100 text-gray-700 rounded border border-gray-200 whitespace-nowrap">
                      {app.scheduledDate} &bull; {app.scheduledTime}
                    </span>
                  </div>
                  {app.notes && (
                    <p className="text-[11px] text-gray-500 mt-1 italic truncate">
                      &quot;{app.notes}&quot;
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
