import React, { useState, useMemo } from 'react';
import {
  CalendarDays,
  Plus,
  Search,
  Edit2,
  Trash2,
  Clock,
  User,
  CheckCircle,
  AlertCircle,
  Download,
} from 'lucide-react';
import {
  Appointment,
  Client,
  Equipment,
  AppointmentStatus,
} from '../../types';
import {
  addAppointment,
  updateAppointment,
  deleteAppointment,
} from '../../services/dataService';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { AppointmentStatusBadge } from '../common/StatusBadge';
import { useToast } from '../../context/ToastContext';
import { exportToCsv } from '../../utils/exportCsv';

interface AppointmentsViewProps {
  appointments: Appointment[];
  clients: Client[];
  equipment: Equipment[];
}

const APPOINTMENT_STATUSES: AppointmentStatus[] = [
  'Agendado',
  'Confirmado',
  'Realizado',
  'Cancelado',
];

export const AppointmentsView: React.FC<AppointmentsViewProps> = ({
  appointments,
  clients,
  equipment,
}) => {
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Todos');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [deletingAppointment, setDeletingAppointment] = useState<Appointment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    clientId: '',
    clientName: '',
    equipmentId: '',
    equipmentSummary: '',
    scheduledDate: '',
    scheduledTime: '09:00',
    status: 'Agendado' as AppointmentStatus,
    notes: '',
  });

  const filteredAppointments = useMemo(() => {
    const term = search.toLowerCase().trim();
    return appointments.filter((app) => {
      const matchesStatus =
        statusFilter === 'Todos' || app.status === statusFilter;
      const matchesSearch =
        !term ||
        app.clientName.toLowerCase().includes(term) ||
        (app.equipmentSummary && app.equipmentSummary.toLowerCase().includes(term)) ||
        app.scheduledDate.includes(term) ||
        (app.notes && app.notes.toLowerCase().includes(term));

      return matchesStatus && matchesSearch;
    });
  }, [appointments, search, statusFilter]);

  const availableEquipment = useMemo(() => {
    if (!formData.clientId) return equipment;
    return equipment.filter((eq) => eq.clientId === formData.clientId);
  }, [equipment, formData.clientId]);

  const handleOpenNew = () => {
    const today = new Date().toISOString().split('T')[0];
    const defaultClient = clients[0];
    const defaultEq = defaultClient
      ? equipment.find((eq) => eq.clientId === defaultClient.id)
      : undefined;

    setEditingAppointment(null);
    setFormData({
      clientId: defaultClient?.id || '',
      clientName: defaultClient?.name || '',
      equipmentId: defaultEq?.id || '',
      equipmentSummary: defaultEq ? `${defaultEq.brand} ${defaultEq.model}` : '',
      scheduledDate: today,
      scheduledTime: '09:00',
      status: 'Agendado',
      notes: '',
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (app: Appointment) => {
    setEditingAppointment(app);
    setFormData({
      clientId: app.clientId || '',
      clientName: app.clientName || '',
      equipmentId: app.equipmentId || '',
      equipmentSummary: app.equipmentSummary || '',
      scheduledDate: app.scheduledDate || '',
      scheduledTime: app.scheduledTime || '09:00',
      status: app.status || 'Agendado',
      notes: app.notes || '',
    });
    setIsFormOpen(true);
  };

  const handleClientChange = (cId: string) => {
    const c = clients.find((i) => i.id === cId);
    const clientEquips = equipment.filter((eq) => eq.clientId === cId);
    setFormData((prev) => ({
      ...prev,
      clientId: cId,
      clientName: c?.name || '',
      equipmentId: clientEquips[0]?.id || '',
      equipmentSummary: clientEquips[0]
        ? `${clientEquips[0].brand} ${clientEquips[0].model}`
        : '',
    }));
  };

  const handleEquipmentChange = (eqId: string) => {
    const eq = equipment.find((i) => i.id === eqId);
    setFormData((prev) => ({
      ...prev,
      equipmentId: eqId,
      equipmentSummary: eq ? `${eq.brand} ${eq.model}` : '',
    }));
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientId) {
      toast.warning('Selecione o cliente para o agendamento.');
      return;
    }
    if (!formData.scheduledDate || !formData.scheduledTime) {
      toast.warning('Informe a data e o horário do agendamento.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingAppointment && editingAppointment.id) {
        await updateAppointment(editingAppointment.id, formData);
        toast.success(`Agendamento de "${formData.clientName}" atualizado com sucesso!`);
      } else {
        await addAppointment(formData);
        toast.success(`Agendamento marcado para ${formData.scheduledDate} às ${formData.scheduledTime}!`);
      }
      setIsFormOpen(false);
    } catch (err) {
      console.error('Erro ao salvar agendamento:', err);
      toast.error('Falha ao gravar no Cloud Firestore. Verifique a conexão.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickStatusChange = async (app: Appointment, newStatus: AppointmentStatus) => {
    if (!app.id) return;
    try {
      await updateAppointment(app.id, { status: newStatus });
      toast.success(`Agendamento de "${app.clientName}" atualizado para "${newStatus}".`);
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      toast.error('Falha ao atualizar status do agendamento.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingAppointment || !deletingAppointment.id) return;
    try {
      await deleteAppointment(deletingAppointment.id);
      toast.success(`Agendamento de "${deletingAppointment.clientName}" cancelado e excluído.`);
      setDeletingAppointment(null);
    } catch (err) {
      console.error('Erro ao excluir agendamento:', err);
      toast.error('Falha ao excluir agendamento.');
    }
  };

  const handleExportCsv = () => {
    if (filteredAppointments.length === 0) {
      toast.info('Nenhum agendamento para exportar no momento.');
      return;
    }

    const headers = ['ID', 'Cliente', 'Equipamento/Assunto', 'Data', 'Horário', 'Status', 'Observações'];
    const rows = filteredAppointments.map((a) => [
      a.id,
      a.clientName,
      a.equipmentSummary || 'Atendimento em Balcão',
      a.scheduledDate,
      a.scheduledTime,
      a.status,
      a.notes || '',
    ]);

    exportToCsv('agendamentos_simplitech', headers, rows);
    toast.success(`${filteredAppointments.length} agendamento(s) exportado(s) em CSV!`);
  };

  return (
    <div className="space-y-4">
      {/* Barra de Filtros */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row gap-2 flex-1 max-w-xl">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por cliente, equipamento, data..."
              className="w-full pl-9 pr-4 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-600 focus:border-blue-600 outline-hidden"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs border border-gray-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-blue-600 outline-hidden bg-white text-gray-700"
          >
            <option value="Todos">Status: Todos</option>
            {APPOINTMENT_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 mr-1">
            Total: <strong>{filteredAppointments.length}</strong> de {appointments.length}
          </span>

          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded transition-colors shadow-2xs"
            title="Exportar agendamentos em planilha CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Exportar CSV</span>
          </button>

          <button
            type="button"
            onClick={handleOpenNew}
            disabled={clients.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 rounded transition-colors shadow-2xs disabled:opacity-50"
            title={clients.length === 0 ? 'Cadastre clientes primeiro' : 'Agendar novo atendimento'}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Agendamento</span>
          </button>
        </div>
      </div>

      {/* Tabela Convencional de Agendamentos */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-2xs overflow-hidden">
        {filteredAppointments.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <CalendarDays className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-700">Nenhum agendamento encontrado.</p>
            <p className="text-xs text-gray-500 mt-1">
              {search || statusFilter !== 'Todos'
                ? 'Tente remover os filtros de busca.'
                : 'Clique em "Novo Agendamento" para marcar um atendimento ou entrega.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-gray-700 font-semibold">
                  <th className="py-3 px-4">Data & Horário</th>
                  <th className="py-3 px-4">Cliente</th>
                  <th className="py-3 px-4">Equipamento / Assunto</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Observações</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAppointments.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-gray-900 whitespace-nowrap">
                      {app.scheduledDate} às {app.scheduledTime}
                    </td>
                    <td className="py-3 px-4 text-gray-800 font-medium max-w-[160px] truncate">
                      {app.clientName}
                    </td>
                    <td className="py-3 px-4 text-gray-600 max-w-[180px] truncate">
                      {app.equipmentSummary || 'Atendimento em Balcão'}
                    </td>
                    <td className="py-3 px-4">
                      <AppointmentStatusBadge status={app.status} />
                    </td>
                    <td className="py-3 px-4 text-gray-500 max-w-[200px] truncate" title={app.notes}>
                      {app.notes || '-'}
                    </td>
                    <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                      {app.status === 'Agendado' && (
                        <button
                          type="button"
                          onClick={() => handleQuickStatusChange(app, 'Confirmado')}
                          className="px-2 py-0.5 text-[11px] font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded mr-1"
                          title="Marcar como confirmado"
                        >
                          Confirmar
                        </button>
                      )}
                      {app.status === 'Confirmado' && (
                        <button
                          type="button"
                          onClick={() => handleQuickStatusChange(app, 'Realizado')}
                          className="px-2 py-0.5 text-[11px] font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded mr-1"
                          title="Marcar como realizado"
                        >
                          Realizado
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(app)}
                        className="p-1 text-gray-500 hover:text-amber-700 rounded hover:bg-gray-100"
                        title="Editar Agendamento"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingAppointment(app)}
                        className="p-1 text-gray-500 hover:text-red-700 rounded hover:bg-gray-100"
                        title="Excluir Agendamento"
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

      {/* MODAL: Cadastrar / Editar Agendamento */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingAppointment ? 'Editar Agendamento' : 'Novo Agendamento'}
        subtitle="Agende uma visita técnica ou retirada de aparelho na Simplitech"
      >
        <form onSubmit={handleSubmitForm} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-700">
                Cliente <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.clientId}
                onChange={(e) => handleClientChange(e.target.value)}
                className="mt-1 block w-full px-3 py-2 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-600 focus:border-blue-600 outline-hidden bg-white"
                required
              >
                <option value="">Selecione o cliente...</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.phone ? `(${c.phone})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-700">
                Equipamento Vinculado (Opcional)
              </label>
              <select
                value={formData.equipmentId}
                onChange={(e) => handleEquipmentChange(e.target.value)}
                className="mt-1 block w-full px-3 py-2 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-600 focus:border-blue-600 outline-hidden bg-white"
              >
                <option value="">Nenhum equipamento específico (Atendimento geral)</option>
                {availableEquipment.map((eq) => (
                  <option key={eq.id} value={eq.id}>
                    {eq.type} - {eq.brand} {eq.model} {eq.serialNumber ? `(S/N: ${eq.serialNumber})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700">
                Data do Atendimento <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.scheduledDate}
                onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                className="mt-1 block w-full px-3 py-2 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-600 focus:border-blue-600 outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700">
                Horário Previsto <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={formData.scheduledTime}
                onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                className="mt-1 block w-full px-3 py-2 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-600 focus:border-blue-600 outline-hidden"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-700">
                Status do Agendamento
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as AppointmentStatus })}
                className="mt-1 block w-full px-3 py-2 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-600 focus:border-blue-600 outline-hidden bg-white font-medium"
              >
                {APPOINTMENT_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-700">
                Notas / Motivo do Atendimento
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                placeholder="Ex: Entrega do equipamento reparado ou visita para diagnóstico no local."
                className="mt-1 block w-full px-3 py-2 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-600 focus:border-blue-600 outline-hidden"
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
              {isSubmitting ? 'Salvando...' : editingAppointment ? 'Atualizar Agendamento' : 'Confirmar Agendamento'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Confirmação de Exclusão */}
      <ConfirmDialog
        isOpen={!!deletingAppointment}
        title="Excluir Agendamento"
        message={`Deseja excluir o agendamento de "${deletingAppointment?.clientName}" marcado para ${deletingAppointment?.scheduledDate}?`}
        confirmLabel="Sim, Excluir"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingAppointment(null)}
      />
    </div>
  );
};
