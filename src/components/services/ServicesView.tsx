import React, { useState, useMemo, useEffect } from 'react';
import {
  ClipboardList,
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  Wrench,
  DollarSign,
  Printer,
  Calendar,
  AlertCircle,
  Download,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import {
  ServiceOrder,
  Client,
  Equipment,
  ServiceStatus,
  ServicePriority,
} from '../../types';
import {
  addService,
  updateService,
  deleteService,
} from '../../services/dataService';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { ServiceStatusBadge, PriorityBadge } from '../common/StatusBadge';
import { useToast } from '../../context/ToastContext';
import { exportToCsv } from '../../utils/exportCsv';

interface ServicesViewProps {
  services: ServiceOrder[];
  clients: Client[];
  equipment: Equipment[];
  initialStatusFilter?: ServiceStatus | 'Todos';
  onClearInitialFilter?: () => void;
  selectedServiceForView?: ServiceOrder | null;
  onClearSelectedService?: () => void;
  preselectedEquipment?: Equipment | null;
  onClearPreselectedEquipment?: () => void;
}

const SERVICE_STATUSES: ServiceStatus[] = [
  'Solicitado',
  'Agendado',
  'Em execução',
  'Aguardando peça',
  'Concluído',
];

const PRIORITIES: ServicePriority[] = ['Baixa', 'Média', 'Alta', 'Urgente'];

export const ServicesView: React.FC<ServicesViewProps> = ({
  services,
  clients,
  equipment,
  initialStatusFilter = 'Todos',
  onClearInitialFilter,
  selectedServiceForView,
  onClearSelectedService,
  preselectedEquipment,
  onClearPreselectedEquipment,
}) => {
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(initialStatusFilter);
  const [priorityFilter, setPriorityFilter] = useState<string>('Todas');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceOrder | null>(null);
  const [viewingService, setViewingService] = useState<ServiceOrder | null>(null);
  const [deletingService, setDeletingService] = useState<ServiceOrder | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sincroniza se o filtro inicial mudar via navegação externa (ex: clicou no card do Dashboard)
  useEffect(() => {
    if (initialStatusFilter) {
      setStatusFilter(initialStatusFilter);
    }
  }, [initialStatusFilter]);

  // Form state
  const [formData, setFormData] = useState({
    serviceCode: '',
    clientId: '',
    clientName: '',
    equipmentId: '',
    equipmentSummary: '',
    status: 'Solicitado' as ServiceStatus,
    priority: 'Média' as ServicePriority,
    reportedIssue: '',
    technicalDiagnosis: '',
    solution: '',
    laborCost: 0,
    partsCost: 0,
    technicianName: '',
    scheduledDate: '',
  });

  // Reage ao selectedServiceForView vindo de outras telas (como Dashboard)
  React.useEffect(() => {
    if (selectedServiceForView) {
      setViewingService(selectedServiceForView);
      onClearSelectedService?.();
    }
  }, [selectedServiceForView, onClearSelectedService]);

  // Reage a equipamento pré-selecionado vindo da tela de equipamentos
  React.useEffect(() => {
    if (preselectedEquipment && preselectedEquipment.id) {
      const nextNumber = services.length + 1;
      const code = `OS-${new Date().getFullYear()}-${String(nextNumber).padStart(3, '0')}`;

      setEditingService(null);
      setFormData({
        serviceCode: code,
        clientId: preselectedEquipment.clientId,
        clientName: preselectedEquipment.clientName,
        equipmentId: preselectedEquipment.id,
        equipmentSummary: `${preselectedEquipment.type} ${preselectedEquipment.brand} ${preselectedEquipment.model}`,
        status: 'Solicitado',
        priority: 'Média',
        reportedIssue: '',
        technicalDiagnosis: '',
        solution: '',
        laborCost: 0,
        partsCost: 0,
        technicianName: '',
        scheduledDate: '',
      });
      setIsFormOpen(true);
      onClearPreselectedEquipment?.();
    }
  }, [preselectedEquipment, services.length, onClearPreselectedEquipment]);

  const filteredServices = useMemo(() => {
    const term = search.toLowerCase().trim();
    return services.filter((srv) => {
      const matchesStatus =
        statusFilter === 'Todos' || srv.status === statusFilter;
      const matchesPriority =
        priorityFilter === 'Todas' || srv.priority === priorityFilter;
      const matchesSearch =
        !term ||
        srv.serviceCode.toLowerCase().includes(term) ||
        srv.clientName.toLowerCase().includes(term) ||
        srv.equipmentSummary.toLowerCase().includes(term) ||
        srv.technicianName.toLowerCase().includes(term) ||
        srv.reportedIssue.toLowerCase().includes(term);

      return matchesStatus && matchesPriority && matchesSearch;
    });
  }, [services, search, statusFilter, priorityFilter]);

  // Lista de equipamentos do cliente selecionado no form
  const availableEquipmentForClient = useMemo(() => {
    if (!formData.clientId) return equipment;
    return equipment.filter((eq) => eq.clientId === formData.clientId);
  }, [equipment, formData.clientId]);

  const handleOpenNew = () => {
    const nextNumber = services.length + 1;
    const code = `OS-${new Date().getFullYear()}-${String(nextNumber).padStart(3, '0')}`;

    const defaultClient = clients[0];
    const defaultEquipment = defaultClient
      ? equipment.find((eq) => eq.clientId === defaultClient.id) || equipment[0]
      : equipment[0];

    setEditingService(null);
    setFormData({
      serviceCode: code,
      clientId: defaultClient?.id || '',
      clientName: defaultClient?.name || '',
      equipmentId: defaultEquipment?.id || '',
      equipmentSummary: defaultEquipment
        ? `${defaultEquipment.type} ${defaultEquipment.brand} ${defaultEquipment.model}`
        : '',
      status: 'Solicitado',
      priority: 'Média',
      reportedIssue: '',
      technicalDiagnosis: '',
      solution: '',
      laborCost: 0,
      partsCost: 0,
      technicianName: '',
      scheduledDate: '',
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (srv: ServiceOrder) => {
    setEditingService(srv);
    setFormData({
      serviceCode: srv.serviceCode || '',
      clientId: srv.clientId || '',
      clientName: srv.clientName || '',
      equipmentId: srv.equipmentId || '',
      equipmentSummary: srv.equipmentSummary || '',
      status: srv.status || 'Solicitado',
      priority: srv.priority || 'Média',
      reportedIssue: srv.reportedIssue || '',
      technicalDiagnosis: srv.technicalDiagnosis || '',
      solution: srv.solution || '',
      laborCost: Number(srv.laborCost || 0),
      partsCost: Number(srv.partsCost || 0),
      technicianName: srv.technicianName || '',
      scheduledDate: srv.scheduledDate || '',
    });
    setIsFormOpen(true);
  };

  const handleClientChange = (cId: string) => {
    const c = clients.find((item) => item.id === cId);
    const clientEquipments = equipment.filter((eq) => eq.clientId === cId);
    const selectedEq = clientEquipments[0];

    setFormData((prev) => ({
      ...prev,
      clientId: cId,
      clientName: c?.name || '',
      equipmentId: selectedEq?.id || '',
      equipmentSummary: selectedEq
        ? `${selectedEq.type} ${selectedEq.brand} ${selectedEq.model}`
        : '',
    }));
  };

  const handleEquipmentChange = (eqId: string) => {
    const eq = equipment.find((item) => item.id === eqId);
    setFormData((prev) => ({
      ...prev,
      equipmentId: eqId,
      equipmentSummary: eq ? `${eq.type} ${eq.brand} ${eq.model}` : '',
      // Se não havia cliente ou era diferente, atualiza
      clientId: eq?.clientId || prev.clientId,
      clientName: eq?.clientName || prev.clientName,
    }));
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientId) {
      toast.warning('Selecione o cliente solicitante.');
      return;
    }
    if (!formData.equipmentId) {
      toast.warning('Selecione o equipamento a ser atendido.');
      return;
    }
    if (!formData.reportedIssue.trim()) {
      toast.warning('Informe o defeito relatado pelo cliente.');
      return;
    }

    const totalCost = Number(formData.laborCost || 0) + Number(formData.partsCost || 0);

    const payload = {
      ...formData,
      laborCost: Number(formData.laborCost || 0),
      partsCost: Number(formData.partsCost || 0),
      totalCost,
    };

    setIsSubmitting(true);
    try {
      if (editingService && editingService.id) {
        await updateService(editingService.id, payload);
        toast.success(`Ordem de Serviço ${formData.serviceCode} atualizada com sucesso!`);
      } else {
        await addService(payload);
        toast.success(`Ordem de Serviço ${formData.serviceCode} criada no Cloud Firestore!`);
      }
      setIsFormOpen(false);
    } catch (err) {
      console.error('Erro ao salvar serviço:', err);
      toast.error('Falha ao gravar no Cloud Firestore. Verifique a conexão.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickStatusChange = async (srv: ServiceOrder, newStatus: ServiceStatus) => {
    if (!srv.id) return;
    try {
      await updateService(srv.id, { status: newStatus });
      toast.success(`Status da O.S. ${srv.serviceCode} alterado para "${newStatus}".`);
    } catch (err) {
      console.error('Erro ao atualizar status do serviço:', err);
      toast.error('Falha ao atualizar status no Firestore.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingService || !deletingService.id) return;
    try {
      await deleteService(deletingService.id);
      toast.success(`Ordem de Serviço ${deletingService.serviceCode} excluída com sucesso.`);
      setDeletingService(null);
    } catch (err) {
      console.error('Erro ao excluir serviço:', err);
      toast.error('Falha ao excluir serviço.');
    }
  };

  const handleExportCsv = () => {
    if (filteredServices.length === 0) {
      toast.info('Nenhuma ordem de serviço para exportar no momento.');
      return;
    }

    const headers = [
      'Código O.S.',
      'Cliente',
      'Equipamento',
      'Status',
      'Prioridade',
      'Técnico',
      'Defeito Relatado',
      'Diagnóstico Técnico',
      'Solução',
      'Mão de Obra (R$)',
      'Peças (R$)',
      'Valor Total (R$)',
      'Data Agendamento',
    ];

    const rows = filteredServices.map((s) => [
      s.serviceCode,
      s.clientName,
      s.equipmentSummary,
      s.status,
      s.priority,
      s.technicianName || '',
      s.reportedIssue,
      s.technicalDiagnosis || '',
      s.solution || '',
      Number(s.laborCost || 0).toFixed(2),
      Number(s.partsCost || 0).toFixed(2),
      Number(s.totalCost || 0).toFixed(2),
      s.scheduledDate || '',
    ]);

    exportToCsv('ordens_servico_simplitech', headers, rows);
    toast.success(`${filteredServices.length} ordem(ns) de serviço exportada(s) em CSV!`);
  };

  const clientOfViewing = viewingService
    ? clients.find((c) => c.id === viewingService.clientId)
    : null;

  const equipmentOfViewing = viewingService
    ? equipment.find((e) => e.id === viewingService.equipmentId)
    : null;

  return (
    <div className="space-y-4">
      {/* Barra de Ações e Filtros */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-2xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row gap-2 flex-1 max-w-3xl">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por código O.S., cliente, equipamento ou técnico..."
              className="w-full pl-9 pr-4 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-600 focus:border-blue-600 outline-hidden"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs border border-gray-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-blue-600 outline-hidden bg-white text-gray-700 font-medium"
            >
              <option value="Todos">Status: Todos</option>
              {SERVICE_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="text-xs border border-gray-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-blue-600 outline-hidden bg-white text-gray-700"
            >
              <option value="Todas">Prioridade: Todas</option>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>

            {statusFilter !== 'Todos' && (
              <button
                type="button"
                onClick={() => {
                  setStatusFilter('Todos');
                  onClearInitialFilter?.();
                }}
                className="text-[11px] text-blue-700 hover:underline whitespace-nowrap"
              >
                Limpar filtro
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 mr-1">
            Total: <strong>{filteredServices.length}</strong> de {services.length}
          </span>

          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded transition-colors shadow-2xs"
            title="Exportar ordens de serviço em CSV compatível com Excel"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Exportar CSV</span>
          </button>

          <button
            type="button"
            onClick={handleOpenNew}
            disabled={clients.length === 0 || equipment.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 rounded transition-colors shadow-2xs disabled:opacity-50"
            title={
              clients.length === 0 || equipment.length === 0
                ? 'Cadastre clientes e equipamentos antes de abrir uma O.S.'
                : 'Cadastrar nova ordem de serviço'
            }
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nova Ordem de Serviço</span>
          </button>
        </div>
      </div>

      {(clients.length === 0 || equipment.length === 0) && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            Para abrir uma Ordem de Serviço, certifique-se de que existem clientes e equipamentos cadastrados no sistema.
          </span>
        </div>
      )}

      {/* Tabela Convencional Empresarial de Serviços */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-2xs overflow-hidden">
        {filteredServices.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <ClipboardList className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-700">Nenhuma ordem de serviço localizada.</p>
            <p className="text-xs text-gray-500 mt-1">
              {search || statusFilter !== 'Todos' || priorityFilter !== 'Todas'
                ? 'Tente ajustar os filtros de busca.'
                : 'Clique em "Nova Ordem de Serviço" para abrir um chamado técnico.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-gray-700 font-semibold">
                  <th className="py-3 px-4">Código O.S.</th>
                  <th className="py-3 px-4">Cliente</th>
                  <th className="py-3 px-4">Equipamento</th>
                  <th className="py-3 px-4">Status Operacional</th>
                  <th className="py-3 px-4">Prioridade</th>
                  <th className="py-3 px-4">Técnico</th>
                  <th className="py-3 px-4 text-right">Valor Total</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredServices.map((srv) => (
                  <tr key={srv.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-gray-900">
                      {srv.serviceCode}
                    </td>
                    <td className="py-3 px-4 text-gray-800 font-medium max-w-[150px] truncate">
                      {srv.clientName}
                    </td>
                    <td className="py-3 px-4 text-gray-600 max-w-[180px] truncate" title={srv.equipmentSummary}>
                      {srv.equipmentSummary}
                    </td>
                    <td className="py-3 px-4">
                      {/* Seletor rápido de status na linha para agilidade na bancada técnica */}
                      <select
                        value={srv.status}
                        onChange={(e) => handleQuickStatusChange(srv, e.target.value as ServiceStatus)}
                        className={`text-[11px] font-medium py-0.5 px-2 rounded border outline-hidden cursor-pointer ${
                          srv.status === 'Concluído'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : srv.status === 'Em execução'
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : srv.status === 'Aguardando peça'
                            ? 'bg-orange-50 text-orange-800 border-orange-300'
                            : srv.status === 'Agendado'
                            ? 'bg-blue-50 text-blue-800 border-blue-300'
                            : 'bg-slate-50 text-slate-700 border-slate-300'
                        }`}
                        title="Alterar status operacional diretamente"
                      >
                        {SERVICE_STATUSES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <PriorityBadge priority={srv.priority} />
                    </td>
                    <td className="py-3 px-4 text-gray-700">
                      {srv.technicianName || 'Não atribuído'}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-gray-900 font-mono tabular-nums">
                      R$ {Number(srv.totalCost || 0).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setViewingService(srv)}
                        className="p-1 text-gray-500 hover:text-blue-700 rounded hover:bg-gray-100"
                        title="Consultar Ficha Técnica da O.S."
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(srv)}
                        className="p-1 text-gray-500 hover:text-amber-700 rounded hover:bg-gray-100"
                        title="Editar Serviço e Status"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingService(srv)}
                        className="p-1 text-gray-500 hover:text-red-700 rounded hover:bg-gray-100"
                        title="Excluir O.S."
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL: Cadastrar / Editar Ordem de Serviço */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingService ? `Editar Ordem de Serviço ${editingService.serviceCode}` : 'Nova Ordem de Serviço'}
        subtitle="Controle de manutenção e assistência técnica Simplitech"
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmitForm} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700">
                Código O.S. <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.serviceCode}
                onChange={(e) => setFormData({ ...formData, serviceCode: e.target.value })}
                className="mt-1 block w-full px-3 py-2 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-600 focus:border-blue-600 outline-hidden font-mono font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700">
                Status Operacional <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as ServiceStatus })}
                className="mt-1 block w-full px-3 py-2 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-600 focus:border-blue-600 outline-hidden bg-white font-medium"
                required
              >
                {SERVICE_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700">
                Prioridade
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as ServicePriority })}
                className="mt-1 block w-full px-3 py-2 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-600 focus:border-blue-600 outline-hidden bg-white"
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {/* Seleção de Cliente e Equipamento Relacionados */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-700">
                Cliente Solicitante <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.clientId}
                onChange={(e) => handleClientChange(e.target.value)}
                className="mt-1 block w-full px-3 py-2 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-600 focus:border-blue-600 outline-hidden bg-white"
                required
              >
                <option value="">Selecione um cliente...</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.phone ? `- ${c.phone}` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700">
                Técnico Responsável
              </label>
              <input
                type="text"
                value={formData.technicianName}
                onChange={(e) => setFormData({ ...formData, technicianName: e.target.value })}
                placeholder="Ex: Rafael Silva"
                className="mt-1 block w-full px-3 py-2 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-600 focus:border-blue-600 outline-hidden"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-700">
                Equipamento do Cliente <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.equipmentId}
                onChange={(e) => handleEquipmentChange(e.target.value)}
                className="mt-1 block w-full px-3 py-2 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-600 focus:border-blue-600 outline-hidden bg-white"
                required
              >
                <option value="">Selecione o equipamento...</option>
                {availableEquipmentForClient.map((eq) => (
                  <option key={eq.id} value={eq.id}>
                    [{eq.type}] {eq.brand} {eq.model} {eq.serialNumber ? `(S/N: ${eq.serialNumber})` : ''}
                  </option>
                ))}
              </select>
              {availableEquipmentForClient.length === 0 && formData.clientId && (
                <p className="text-[11px] text-amber-600 mt-1">
                  Este cliente ainda não possui equipamentos cadastrados. Cadastre um equipamento primeiro na página de Equipamentos.
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700">
                Data Prevista / Agendamento
              </label>
              <input
                type="date"
                value={formData.scheduledDate}
                onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                className="mt-1 block w-full px-3 py-2 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-600 focus:border-blue-600 outline-hidden"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-medium text-gray-700">
                Defeito Relatado pelo Cliente <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.reportedIssue}
                onChange={(e) => setFormData({ ...formData, reportedIssue: e.target.value })}
                rows={2}
                placeholder="Descreva o problema reclamado pelo cliente..."
                className="mt-1 block w-full px-3 py-2 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-600 focus:border-blue-600 outline-hidden"
                required
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-medium text-gray-700">
                Diagnóstico Técnico
              </label>
              <textarea
                value={formData.technicalDiagnosis}
                onChange={(e) => setFormData({ ...formData, technicalDiagnosis: e.target.value })}
                rows={2}
                placeholder="Parecer da bancada técnica após testes..."
                className="mt-1 block w-full px-3 py-2 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-600 focus:border-blue-600 outline-hidden"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-medium text-gray-700">
                Solução Aplicada / Procedimentos
              </label>
              <textarea
                value={formData.solution}
                onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
                rows={2}
                placeholder="Serviços executados, peças substituídas..."
                className="mt-1 block w-full px-3 py-2 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-600 focus:border-blue-600 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700">
                Mão de Obra (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.laborCost}
                onChange={(e) => setFormData({ ...formData, laborCost: parseFloat(e.target.value) || 0 })}
                className="mt-1 block w-full px-3 py-2 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-600 focus:border-blue-600 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700">
                Peças / Componentes (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.partsCost}
                onChange={(e) => setFormData({ ...formData, partsCost: parseFloat(e.target.value) || 0 })}
                className="mt-1 block w-full px-3 py-2 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-600 focus:border-blue-600 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700">
                Valor Total (R$)
              </label>
              <input
                type="text"
                readOnly
                value={`R$ ${(Number(formData.laborCost || 0) + Number(formData.partsCost || 0)).toFixed(2)}`}
                className="mt-1 block w-full px-3 py-2 text-xs border border-gray-200 bg-gray-100 rounded text-gray-900 font-bold"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 rounded disabled:opacity-50"
            >
              {isSubmitting ? 'Gravando...' : editingService ? 'Atualizar O.S.' : 'Abrir Ordem de Serviço'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Consultar Ficha Técnica da Ordem de Serviço */}
      {viewingService && (
        <Modal
          isOpen={true}
          onClose={() => setViewingService(null)}
          title={`Ordem de Serviço ${viewingService.serviceCode}`}
          subtitle="Ficha de atendimento técnico Simplitech"
          maxWidth="2xl"
        >
          <div className="space-y-5 text-xs printable-content">
            {/* Cabeçalho Empresarial Simplitech (visível também na impressão) */}
            <div className="p-4 bg-slate-900 text-white rounded flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center font-bold text-white text-xs">
                    S
                  </div>
                  <h3 className="font-bold text-sm tracking-wide text-white">
                    SIMPLITECH ASSISTÊNCIA TÉCNICA
                  </h3>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Dados cadastrais da empresa: confirmar antes da emissão oficial.
                </p>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-blue-950 text-blue-300 border border-blue-800 rounded">
                  ORDEM DE SERVIÇO Nº
                </span>
                <p className="text-lg font-bold font-mono text-white mt-1">
                  {viewingService.serviceCode}
                </p>
              </div>
            </div>

            {/* Cabeçalho da O.S. */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <div>
                <p className="text-gray-500 font-medium">Situação Operacional:</p>
                <div className="mt-1">
                  <ServiceStatusBadge status={viewingService.status} />
                </div>
              </div>
              <div>
                <p className="text-gray-500 font-medium">Prioridade:</p>
                <div className="mt-1">
                  <PriorityBadge priority={viewingService.priority} />
                </div>
              </div>
              <div className="text-right">
                <p className="text-gray-500 font-medium">Data de Abertura:</p>
                <p className="font-mono text-gray-800 mt-1">
                  {viewingService.createdAt
                    ? new Date(viewingService.createdAt).toLocaleDateString('pt-BR')
                    : 'Hoje'}
                </p>
              </div>
            </div>

            {/* Painéis de Cliente e Equipamento */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Cliente */}
              <div className="p-3 bg-gray-50 border border-gray-200 rounded">
                <h4 className="font-semibold text-gray-900 mb-2 uppercase tracking-wider text-[11px]">
                  Dados do Cliente
                </h4>
                <div className="space-y-1">
                  <p>
                    <span className="text-gray-500">Nome / Razão:</span>{' '}
                    <strong>{viewingService.clientName}</strong>
                  </p>
                  <p>
                    <span className="text-gray-500">Documento:</span>{' '}
                    <span className="font-mono">{clientOfViewing?.document || 'N/A'}</span>
                  </p>
                  <p>
                    <span className="text-gray-500">Telefone:</span>{' '}
                    <span>{clientOfViewing?.phone || 'N/A'}</span>
                  </p>
                  <p>
                    <span className="text-gray-500">Endereço:</span>{' '}
                    <span className="truncate">{clientOfViewing?.address || 'N/A'}</span>
                  </p>
                </div>
              </div>

              {/* Equipamento */}
              <div className="p-3 bg-gray-50 border border-gray-200 rounded">
                <h4 className="font-semibold text-gray-900 mb-2 uppercase tracking-wider text-[11px]">
                  Dados do Equipamento
                </h4>
                <div className="space-y-1">
                  <p>
                    <span className="text-gray-500">Aparelho:</span>{' '}
                    <strong>{viewingService.equipmentSummary}</strong>
                  </p>
                  <p>
                    <span className="text-gray-500">Tipo:</span>{' '}
                    <span>{equipmentOfViewing?.type || 'N/A'}</span>
                  </p>
                  <p>
                    <span className="text-gray-500">Nº de Série:</span>{' '}
                    <span className="font-mono">{equipmentOfViewing?.serialNumber || 'N/A'}</span>
                  </p>
                  <p>
                    <span className="text-gray-500">Avarias/Estado:</span>{' '}
                    <span className="truncate">{equipmentOfViewing?.conditionNotes || 'Sem avarias relatadas'}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Diagnóstico e Relatos */}
            <div className="space-y-3">
              <div className="p-3 border border-gray-200 rounded">
                <span className="font-semibold text-gray-800 block mb-1">
                  Defeito Relatado pelo Cliente:
                </span>
                <p className="text-gray-700 leading-relaxed bg-gray-50 p-2.5 rounded font-normal">
                  {viewingService.reportedIssue}
                </p>
              </div>

              <div className="p-3 border border-gray-200 rounded">
                <span className="font-semibold text-gray-800 block mb-1">
                  Diagnóstico Técnico Realizado:
                </span>
                <p className="text-gray-700 leading-relaxed bg-gray-50 p-2.5 rounded font-normal">
                  {viewingService.technicalDiagnosis || 'Em processo de testes na bancada técnica.'}
                </p>
              </div>

              <div className="p-3 border border-gray-200 rounded">
                <span className="font-semibold text-gray-800 block mb-1">
                  Solução / Procedimentos Executados:
                </span>
                <p className="text-gray-700 leading-relaxed bg-gray-50 p-2.5 rounded font-normal">
                  {viewingService.solution || 'Procedimento técnico em andamento ou aguardando aprovação de orçamento.'}
                </p>
              </div>
            </div>

            {/* Informações Financeiras e Técnico */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <p className="text-gray-500">Técnico Encarregado:</p>
                <p className="font-semibold text-gray-900 mt-0.5">
                  {viewingService.technicianName || 'Técnico Especialista Simplitech'}
                </p>
                {viewingService.scheduledDate && (
                  <p className="text-gray-500 text-[11px] mt-1">
                    Previsão de conclusão: {viewingService.scheduledDate}
                  </p>
                )}
              </div>

              <div className="text-right sm:border-l sm:border-slate-200 sm:pl-6 w-full sm:w-auto">
                <div className="text-[11px] text-gray-500 space-y-0.5">
                  <p>Mão de obra: R$ {Number(viewingService.laborCost || 0).toFixed(2)}</p>
                  <p>Peças e Componentes: R$ {Number(viewingService.partsCost || 0).toFixed(2)}</p>
                </div>
                <div className="pt-1 mt-1 border-t border-slate-200">
                  <span className="text-xs font-medium text-gray-700 mr-2">Valor Total:</span>
                  <span className="text-base font-bold text-gray-900 font-mono">
                    R$ {Number(viewingService.totalCost || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Termos de Garantia (CDC) e Assinaturas */}
            <div className="p-3 bg-gray-50 border border-gray-200 rounded text-[11px] text-gray-600 space-y-2">
              <p className="font-semibold text-gray-800 uppercase tracking-wider text-[10px]">
                Termos de Garantia & Condições de Atendimento
              </p>
              <p className="leading-relaxed">
                Nos termos do Artigo 26 do Código de Defesa do Consumidor (Lei Federal nº 8.078/1990), o prazo legal de garantia para os serviços prestados e peças substituídas é de 90 (noventa) dias para produtos e serviços duráveis, observadas as condições e os marcos de contagem previstos em lei.
              </p>
            </div>

            {/* Linhas de Assinatura */}
            <div className="grid grid-cols-2 gap-8 pt-6 pb-2">
              <div className="text-center">
                <div className="border-b border-gray-400 w-full mb-1"></div>
                <p className="font-semibold text-gray-800 text-[11px]">{viewingService.technicianName || 'Técnico Responsável'}</p>
                <p className="text-[10px] text-gray-500">Simplitech Assistência Técnica</p>
              </div>
              <div className="text-center">
                <div className="border-b border-gray-400 w-full mb-1"></div>
                <p className="font-semibold text-gray-800 text-[11px]">{viewingService.clientName}</p>
                <p className="text-[10px] text-gray-500">Cliente / Responsável Legal</p>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir O.S.</span>
              </button>

              <button
                type="button"
                onClick={() => setViewingService(null)}
                className="px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
              >
                Fechar Ficha
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL: Confirmação de Exclusão */}
      <ConfirmDialog
        isOpen={!!deletingService}
        title="Excluir Ordem de Serviço"
        message={`Tem certeza que deseja excluir a O.S. ${deletingService?.serviceCode}? Esta ação não poderá ser desfeita.`}
        confirmLabel="Sim, Excluir O.S."
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingService(null)}
      />
    </div>
  );
};
