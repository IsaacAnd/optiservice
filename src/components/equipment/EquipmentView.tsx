import React, { useState, useMemo } from 'react';
import {
  Laptop,
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  User,
  Wrench,
  Hash,
  AlertCircle,
  Download,
} from 'lucide-react';
import { Equipment, Client, ServiceOrder } from '../../types';
import { addEquipment, updateEquipment, deleteEquipment } from '../../services/dataService';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { ServiceStatusBadge } from '../common/StatusBadge';
import { useToast } from '../../context/ToastContext';
import { exportToCsv } from '../../utils/exportCsv';

interface EquipmentViewProps {
  equipment: Equipment[];
  clients: Client[];
  services: ServiceOrder[];
  preselectedClient?: Client | null;
  onClearPreselectedClient?: () => void;
  onCreateServiceForEquipment?: (equipment: Equipment) => void;
}

const EQUIPMENT_TYPES = [
  'Notebook',
  'Desktop / Computador',
  'Smartphone',
  'Tablet',
  'Impressora',
  'Servidor',
  'Monitor',
  'Nobreak / Estabilizador',
  'Outro',
];

export const EquipmentView: React.FC<EquipmentViewProps> = ({
  equipment,
  clients,
  services,
  preselectedClient,
  onClearPreselectedClient,
  onCreateServiceForEquipment,
}) => {
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('Todos');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [viewingEquipment, setViewingEquipment] = useState<Equipment | null>(null);
  const [deletingEquipment, setDeletingEquipment] = useState<Equipment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({
    clientId: '',
    clientName: '',
    type: 'Notebook',
    brand: '',
    model: '',
    serialNumber: '',
    conditionNotes: '',
  });

  // Abre form pré-preenchido se vier da tela de clientes
  React.useEffect(() => {
    if (preselectedClient && preselectedClient.id) {
      setEditingEquipment(null);
      setFormData({
        clientId: preselectedClient.id,
        clientName: preselectedClient.name,
        type: 'Notebook',
        brand: '',
        model: '',
        serialNumber: '',
        conditionNotes: '',
      });
      setIsFormOpen(true);
      onClearPreselectedClient?.();
    }
  }, [preselectedClient, onClearPreselectedClient]);

  const filteredEquipment = useMemo(() => {
    const term = search.toLowerCase().trim();
    return equipment.filter((eq) => {
      const matchesType = typeFilter === 'Todos' || eq.type.toLowerCase().includes(typeFilter.toLowerCase());
      const matchesSearch =
        !term ||
        eq.brand.toLowerCase().includes(term) ||
        eq.model.toLowerCase().includes(term) ||
        eq.serialNumber.toLowerCase().includes(term) ||
        eq.clientName.toLowerCase().includes(term) ||
        eq.type.toLowerCase().includes(term);

      return matchesType && matchesSearch;
    });
  }, [equipment, search, typeFilter]);

  const handleOpenNew = () => {
    setEditingEquipment(null);
    setFormData({
      clientId: clients[0]?.id || '',
      clientName: clients[0]?.name || '',
      type: 'Notebook',
      brand: '',
      model: '',
      serialNumber: '',
      conditionNotes: '',
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (eq: Equipment) => {
    setEditingEquipment(eq);
    setFormData({
      clientId: eq.clientId || '',
      clientName: eq.clientName || '',
      type: eq.type || 'Notebook',
      brand: eq.brand || '',
      model: eq.model || '',
      serialNumber: eq.serialNumber || '',
      conditionNotes: eq.conditionNotes || '',
    });
    setIsFormOpen(true);
  };

  const handleClientChange = (clientId: string) => {
    const found = clients.find((c) => c.id === clientId);
    setFormData({
      ...formData,
      clientId,
      clientName: found?.name || '',
    });
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientId) {
      toast.warning('Selecione o cliente proprietário do equipamento.');
      return;
    }
    if (!formData.brand.trim() || !formData.model.trim()) {
      toast.warning('Preencha a Marca e o Modelo comercial do aparelho.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingEquipment && editingEquipment.id) {
        await updateEquipment(editingEquipment.id, formData);
        toast.success(`Equipamento "${formData.brand} ${formData.model}" atualizado!`);
      } else {
        await addEquipment(formData);
        toast.success(`Equipamento "${formData.brand} ${formData.model}" registrado!`);
      }
      setIsFormOpen(false);
    } catch (err) {
      console.error('Erro ao salvar equipamento:', err);
      toast.error('Falha ao gravar no Cloud Firestore. Verifique a conexão.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingEquipment || !deletingEquipment.id) return;
    try {
      await deleteEquipment(deletingEquipment.id);
      toast.success(`Equipamento "${deletingEquipment.brand} ${deletingEquipment.model}" excluído.`);
      setDeletingEquipment(null);
    } catch (err) {
      console.error('Erro ao excluir equipamento:', err);
      toast.error('Não foi possível excluir o equipamento. Verifique se existem registros vinculados ou falha de conexão.');
    }
  };

  const handleExportCsv = () => {
    if (filteredEquipment.length === 0) {
      toast.info('Nenhum equipamento para exportar no momento.');
      return;
    }

    const headers = ['ID', 'Tipo', 'Marca', 'Modelo', 'Número de Série', 'Cliente Proprietário', 'Condições Físicas', 'Ordens de Serviço'];
    const rows = filteredEquipment.map((eq) => {
      const srvCount = services.filter((s) => s.equipmentId === eq.id).length;
      return [
        eq.id,
        eq.type,
        eq.brand,
        eq.model,
        eq.serialNumber || '',
        eq.clientName,
        eq.conditionNotes || '',
        srvCount,
      ];
    });

    exportToCsv('equipamentos_simplitech', headers, rows);
    toast.success(`${filteredEquipment.length} equipamento(s) exportado(s) em CSV!`);
  };

  // Histórico de O.S. do equipamento visualizado
  const equipmentServices = viewingEquipment
    ? services.filter((srv) => srv.equipmentId === viewingEquipment.id)
    : [];

  const deletingLinkedServicesCount = deletingEquipment
    ? services.filter((srv) => srv.equipmentId === deletingEquipment.id).length
    : 0;

  return (
    <div className="space-y-4">
      {/* Barra de Ações e Filtros */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row gap-2 flex-1 max-w-2xl">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por marca, modelo, serial ou cliente..."
              className="w-full pl-9 pr-4 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-600 focus:border-blue-600 outline-hidden"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs border border-gray-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-blue-600 outline-hidden bg-white text-gray-700"
          >
            <option value="Todos">Todos os Tipos</option>
            {EQUIPMENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 mr-1">
            Total: <strong>{filteredEquipment.length}</strong> de {equipment.length}
          </span>

          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded transition-colors shadow-2xs"
            title="Exportar equipamentos para planilha CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Exportar CSV</span>
          </button>

          <button
            type="button"
            onClick={handleOpenNew}
            disabled={clients.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 rounded transition-colors shadow-2xs disabled:opacity-50"
            title={clients.length === 0 ? 'Cadastre primeiro ao menos um cliente' : 'Cadastrar novo equipamento'}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Equipamento</span>
          </button>
        </div>
      </div>

      {clients.length === 0 && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            Atenção: Nenhum cliente cadastrado no momento. Cadastre primeiro um cliente para vincular equipamentos.
          </span>
        </div>
      )}

      {/* Tabela Convencional Empresarial de Equipamentos */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-2xs overflow-hidden">
        {filteredEquipment.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Laptop className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-700">Nenhum equipamento localizado.</p>
            <p className="text-xs text-gray-500 mt-1">
              {search || typeFilter !== 'Todos'
                ? 'Tente ajustar os filtros de pesquisa.'
                : 'Clique em "Novo Equipamento" para registrar.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-gray-700 font-semibold">
                  <th className="py-3 px-4">Tipo</th>
                  <th className="py-3 px-4">Marca & Modelo</th>
                  <th className="py-3 px-4">Nº de Série</th>
                  <th className="py-3 px-4">Proprietário (Cliente)</th>
                  <th className="py-3 px-4">Condições Físicas</th>
                  <th className="py-3 px-4 text-center">Ordens de Serviço</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredEquipment.map((eq) => {
                  const srvCount = services.filter((s) => s.equipmentId === eq.id).length;
                  return (
                    <tr key={eq.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3 px-4 font-medium text-gray-900">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px] font-medium border border-slate-200">
                          {eq.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-800 font-medium">
                        {eq.brand} {eq.model}
                      </td>
                      <td className="py-3 px-4 font-mono text-gray-600">
                        {eq.serialNumber || '-'}
                      </td>
                      <td className="py-3 px-4 text-gray-700 font-medium max-w-[150px] truncate">
                        {eq.clientName}
                      </td>
                      <td className="py-3 px-4 text-gray-500 max-w-[180px] truncate" title={eq.conditionNotes}>
                        {eq.conditionNotes || 'Sem avarias relatadas'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-[11px] font-medium border border-gray-200">
                          {srvCount}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                        {onCreateServiceForEquipment && (
                          <button
                            type="button"
                            onClick={() => onCreateServiceForEquipment(eq)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded transition-colors mr-1"
                            title="Abrir Ordem de Serviço para este aparelho"
                          >
                            <Wrench className="w-3 h-3 text-blue-600" />
                            <span>Abrir O.S.</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setViewingEquipment(eq)}
                          className="p-1 text-gray-500 hover:text-blue-700 rounded hover:bg-gray-100"
                          title="Consultar Detalhes"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(eq)}
                          className="p-1 text-gray-500 hover:text-amber-700 rounded hover:bg-gray-100"
                          title="Editar Equipamento"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingEquipment(eq)}
                          className="p-1 text-gray-500 hover:text-red-700 rounded hover:bg-gray-100"
                          title="Excluir Equipamento"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL: Cadastrar / Editar Equipamento */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingEquipment ? 'Editar Equipamento' : 'Cadastrar Novo Equipamento'}
        subtitle="Vincule o aparelho a um cliente cadastrado na Simplitech"
      >
        <form onSubmit={handleSubmitForm} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-700">
                Cliente Proprietário <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.clientId}
                onChange={(e) => handleClientChange(e.target.value)}
                className="mt-1 block w-full px-3 py-2 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-600 focus:border-blue-600 outline-hidden bg-white"
                required
              >
                <option value="">Selecione um cliente cadastrado...</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.document ? `(${c.document})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700">
                Tipo de Equipamento <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="mt-1 block w-full px-3 py-2 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-600 focus:border-blue-600 outline-hidden bg-white"
                required
              >
                {EQUIPMENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700">
                Marca do Fabricante <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="mt-1 block w-full px-3 py-2 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-600 focus:border-blue-600 outline-hidden"
                placeholder="Ex: Dell, Lenovo, HP, Apple, Samsung"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700">
                Modelo Comercial <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="mt-1 block w-full px-3 py-2 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-600 focus:border-blue-600 outline-hidden"
                placeholder="Ex: Latitude 3420, Galaxy S22"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700">
                Número de Série / Service Tag / IMEI
              </label>
              <input
                type="text"
                value={formData.serialNumber}
                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                className="mt-1 block w-full px-3 py-2 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-600 focus:border-blue-600 outline-hidden font-mono"
                placeholder="Ex: CN-0123456-7890"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-700">
                Estado Físico / Acessórios Deixados
              </label>
              <textarea
                value={formData.conditionNotes}
                onChange={(e) => setFormData({ ...formData, conditionNotes: e.target.value })}
                rows={3}
                className="mt-1 block w-full px-3 py-2 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-600 focus:border-blue-600 outline-hidden"
                placeholder="Ex: Carcaça com pequenos riscos na tampa; acompanha fonte original e cabo de força."
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
              {isSubmitting
                ? 'Salvando...'
                : editingEquipment
                ? 'Atualizar Equipamento'
                : 'Salvar Equipamento'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Consultar Equipamento */}
      {viewingEquipment && (
        <Modal
          isOpen={true}
          onClose={() => setViewingEquipment(null)}
          title="Ficha Técnica do Equipamento"
          subtitle={`Código do Registro: ${viewingEquipment.id}`}
          maxWidth="xl"
        >
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded border border-gray-200">
              <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">
                Especificações Técnicas
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-gray-500">Tipo:</span>{' '}
                  <strong className="text-gray-900">{viewingEquipment.type}</strong>
                </div>
                <div>
                  <span className="text-gray-500">Marca / Fabricante:</span>{' '}
                  <strong className="text-gray-900">{viewingEquipment.brand}</strong>
                </div>
                <div>
                  <span className="text-gray-500">Modelo:</span>{' '}
                  <span className="text-gray-800">{viewingEquipment.model}</span>
                </div>
                <div>
                  <span className="text-gray-500">Nº de Série:</span>{' '}
                  <span className="font-mono text-gray-900 font-medium">
                    {viewingEquipment.serialNumber || 'Não informado'}
                  </span>
                </div>
                <div className="sm:col-span-2 pt-2 border-t border-gray-200/60">
                  <span className="text-gray-500">Cliente Proprietário:</span>{' '}
                  <span className="text-gray-900 font-semibold">{viewingEquipment.clientName}</span>
                </div>
                {viewingEquipment.conditionNotes && (
                  <div className="sm:col-span-2">
                    <span className="text-gray-500">Condições de Recepção:</span>
                    <p className="text-gray-700 italic mt-0.5">{viewingEquipment.conditionNotes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Histórico de Manutenções deste Equipamento */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Wrench className="w-4 h-4 text-slate-700" />
                  <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Histórico de Ordens de Serviço ({equipmentServices.length})
                  </h4>
                </div>
                {onCreateServiceForEquipment && (
                  <button
                    type="button"
                    onClick={() => {
                      const eq = viewingEquipment;
                      setViewingEquipment(null);
                      onCreateServiceForEquipment(eq);
                    }}
                    className="text-xs text-blue-700 hover:underline font-medium"
                  >
                    + Abrir O.S. para este aparelho
                  </button>
                )}
              </div>

              {equipmentServices.length === 0 ? (
                <p className="text-xs text-gray-400 bg-gray-50 p-3 rounded border border-dashed border-gray-200">
                  Nenhum serviço registrado para este equipamento até o momento.
                </p>
              ) : (
                <div className="border border-gray-200 rounded overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                      <tr>
                        <th className="py-2 px-3">Código O.S.</th>
                        <th className="py-2 px-3">Status</th>
                        <th className="py-2 px-3">Defeito Relatado</th>
                        <th className="py-2 px-3">Técnico</th>
                        <th className="py-2 px-3 text-right">Valor Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {equipmentServices.map((srv) => (
                        <tr key={srv.id}>
                          <td className="py-2 px-3 font-mono font-medium text-gray-900">
                            {srv.serviceCode}
                          </td>
                          <td className="py-2 px-3">
                            <ServiceStatusBadge status={srv.status} />
                          </td>
                          <td className="py-2 px-3 text-gray-600 max-w-[200px] truncate">
                            {srv.reportedIssue}
                          </td>
                          <td className="py-2 px-3 text-gray-700">{srv.technicianName}</td>
                          <td className="py-2 px-3 text-right font-medium text-gray-800">
                            R$ {Number(srv.totalCost || 0).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setViewingEquipment(null)}
                className="px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
              >
                Fechar Consulta
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL: Confirmação de Exclusão */}
      <ConfirmDialog
        isOpen={!!deletingEquipment}
        title="Excluir Equipamento"
        message={
          deletingLinkedServicesCount > 0
            ? `Tem certeza que deseja excluir o equipamento "${deletingEquipment?.brand} ${deletingEquipment?.model}"? ATENÇÃO: Há ${deletingLinkedServicesCount} ordem(ns) de serviço vinculadas a este aparelho.`
            : `Tem certeza que deseja excluir o equipamento "${deletingEquipment?.brand} ${deletingEquipment?.model}" (${deletingEquipment?.clientName})?`
        }
        confirmLabel="Sim, Excluir"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingEquipment(null)}
      />
    </div>
  );
};
