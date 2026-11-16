import React, { useState, useMemo } from 'react';
import {
  Users,
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Laptop,
  ClipboardList,
  AlertCircle,
  Download,
} from 'lucide-react';
import { Client, Equipment, ServiceOrder } from '../../types';
import { addClient, updateClient, deleteClient } from '../../services/dataService';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { ServiceStatusBadge } from '../common/StatusBadge';
import { useToast } from '../../context/ToastContext';
import { exportToCsv } from '../../utils/exportCsv';

interface ClientsViewProps {
  clients: Client[];
  equipment: Equipment[];
  services: ServiceOrder[];
  onAddEquipmentForClient?: (client: Client) => void;
  onViewService?: (service: ServiceOrder) => void;
}

export const ClientsView: React.FC<ClientsViewProps> = ({
  clients,
  equipment,
  services,
  onAddEquipmentForClient,
  onViewService,
}) => {
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [viewingClient, setViewingClient] = useState<Client | null>(null);
  const [deletingClient, setDeletingClient] = useState<Client | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    document: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
  });

  const filteredClients = useMemo(() => {
    const term = search.toLowerCase().trim();
    if (!term) return clients;
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.document.toLowerCase().includes(term) ||
        c.phone.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term)
    );
  }, [clients, search]);

  const handleOpenNew = () => {
    setEditingClient(null);
    setFormData({
      name: '',
      document: '',
      phone: '',
      email: '',
      address: '',
      notes: '',
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name || '',
      document: client.document || '',
      phone: client.phone || '',
      email: client.email || '',
      address: client.address || '',
      notes: client.notes || '',
    });
    setIsFormOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      toast.warning('Preencha os campos obrigatórios: Nome Completo e Telefone.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingClient && editingClient.id) {
        await updateClient(editingClient.id, formData);
        toast.success(`Cliente "${formData.name}" atualizado com sucesso!`);
      } else {
        await addClient(formData);
        toast.success(`Cliente "${formData.name}" cadastrado com sucesso!`);
      }
      setIsFormOpen(false);
    } catch (err) {
      console.error('Erro ao salvar cliente:', err);
      toast.error('Falha ao gravar no Cloud Firestore. Verifique as permissões.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingClient || !deletingClient.id) return;
    try {
      await deleteClient(deletingClient.id);
      toast.success(`Cliente "${deletingClient.name}" removido com sucesso.`);
      setDeletingClient(null);
    } catch (err) {
      console.error('Erro ao excluir cliente:', err);
      toast.error('Não foi possível excluir o cliente. Verifique se existem registros vinculados ou falha de conexão.');
    }
  };

  const handleExportCsv = () => {
    if (filteredClients.length === 0) {
      toast.info('Nenhum cliente disponível para exportar no momento.');
      return;
    }

    const headers = ['ID', 'Nome', 'CPF/CNPJ', 'Telefone', 'E-mail', 'Endereço', 'Equipamentos Vinculados', 'Observações'];
    const rows = filteredClients.map((c) => {
      const eqCount = equipment.filter((e) => e.clientId === c.id).length;
      return [
        c.id,
        c.name,
        c.document || '',
        c.phone,
        c.email || '',
        c.address || '',
        eqCount,
        c.notes || '',
      ];
    });

    exportToCsv('clientes_simplitech', headers, rows);
    toast.success(`${filteredClients.length} cliente(s) exportado(s) em CSV!`);
  };

  // Vínculos do cliente para aviso de exclusão
  const deletingLinkedEquipmentCount = deletingClient
    ? equipment.filter((eq) => eq.clientId === deletingClient.id).length
    : 0;

  const deletingLinkedServicesCount = deletingClient
    ? services.filter((srv) => srv.clientId === deletingClient.id).length
    : 0;

  // Vínculos do cliente visualizado
  const clientEquipment = viewingClient
    ? equipment.filter((eq) => eq.clientId === viewingClient.id)
    : [];

  const clientServices = viewingClient
    ? services.filter((srv) => srv.clientId === viewingClient.id)
    : [];

  return (
    <div className="space-y-4">
      {/* Barra de Ações e Filtros */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, documento, telefone ou e-mail..."
            className="w-full pl-9 pr-4 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-600 focus:border-blue-600 outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 mr-1">
            Total: <strong>{filteredClients.length}</strong> de {clients.length}
          </span>

          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded transition-colors shadow-2xs"
            title="Exportar planilha de clientes em CSV compatível com Excel"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Exportar CSV</span>
          </button>

          <button
            type="button"
            onClick={handleOpenNew}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 rounded transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Cliente</span>
          </button>
        </div>
      </div>

      {/* Tabela Convencional Empresarial de Clientes */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-2xs overflow-hidden">
        {filteredClients.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-700">Nenhum cliente localizado.</p>
            <p className="text-xs text-gray-500 mt-1">
              {search ? 'Tente outros termos de busca.' : 'Clique em "Novo Cliente" para iniciar.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-gray-700 font-semibold">
                  <th className="py-3 px-4">Nome do Cliente</th>
                  <th className="py-3 px-4">Documento (CPF/CNPJ)</th>
                  <th className="py-3 px-4">Telefone</th>
                  <th className="py-3 px-4">E-mail</th>
                  <th className="py-3 px-4">Endereço</th>
                  <th className="py-3 px-4 text-center">Equipamentos</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredClients.map((client) => {
                  const eqCount = equipment.filter((e) => e.clientId === client.id).length;
                  return (
                    <tr key={client.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3 px-4 font-medium text-gray-900">
                        {client.name}
                      </td>
                      <td className="py-3 px-4 text-gray-600 font-mono">
                        {client.document || '-'}
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {client.phone}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {client.email || '-'}
                      </td>
                      <td className="py-3 px-4 text-gray-600 max-w-[180px] truncate" title={client.address}>
                        {client.address || '-'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-[11px] font-medium border border-gray-200">
                          {eqCount}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setViewingClient(client)}
                          className="p-1 text-gray-500 hover:text-blue-700 rounded hover:bg-gray-100"
                          title="Consultar Detalhes"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(client)}
                          className="p-1 text-gray-500 hover:text-amber-700 rounded hover:bg-gray-100"
                          title="Editar Cliente"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingClient(client)}
                          className="p-1 text-gray-500 hover:text-red-700 rounded hover:bg-gray-100"
                          title="Excluir Cliente"
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

      {/* MODAL: Cadastrar / Editar Cliente */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingClient ? 'Editar Cliente' : 'Cadastrar Novo Cliente'}
        subtitle="Preencha os dados cadastrais do cliente para a Simplitech"
      >
        <form onSubmit={handleSubmitForm} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-700">
                Nome Completo / Razão Social <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full px-3 py-2 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-600 focus:border-blue-600 outline-hidden"
                placeholder="Ex: João da Silva ou Empresa XYZ Ltda"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700">
                CPF ou CNPJ
              </label>
              <input
                type="text"
                value={formData.document}
                onChange={(e) => setFormData({ ...formData, document: e.target.value })}
                className="mt-1 block w-full px-3 py-2 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-600 focus:border-blue-600 outline-hidden"
                placeholder="000.000.000-00"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700">
                Telefone de Contato <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="mt-1 block w-full px-3 py-2 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-600 focus:border-blue-600 outline-hidden"
                placeholder="(11) 98765-4321"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-700">
                E-mail
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 block w-full px-3 py-2 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-600 focus:border-blue-600 outline-hidden"
                placeholder="cliente@email.com"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-700">
                Endereço Completo
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="mt-1 block w-full px-3 py-2 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-600 focus:border-blue-600 outline-hidden"
                placeholder="Rua, número, complemento, bairro, cidade - UF"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-700">
                Observações Adicionais
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="mt-1 block w-full px-3 py-2 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-600 focus:border-blue-600 outline-hidden"
                placeholder="Horário preferencial, detalhes de faturamento, etc."
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
              {isSubmitting ? 'Salvando...' : editingClient ? 'Atualizar Cliente' : 'Salvar Cliente'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Consultar Cliente (com Equipamentos e Serviços Vinculados) */}
      {viewingClient && (
        <Modal
          isOpen={true}
          onClose={() => setViewingClient(null)}
          title="Ficha Cadastral do Cliente"
          subtitle={`Código do Registro: ${viewingClient.id}`}
          maxWidth="xl"
        >
          <div className="space-y-6">
            {/* Informações Pessoais */}
            <div className="bg-gray-50 p-4 rounded border border-gray-200">
              <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">
                Dados Gerais
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-gray-500">Nome:</span>{' '}
                  <strong className="text-gray-900">{viewingClient.name}</strong>
                </div>
                <div>
                  <span className="text-gray-500">Documento:</span>{' '}
                  <span className="font-mono text-gray-800">{viewingClient.document || 'Não informado'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-gray-500">Telefone:</span>{' '}
                  <span className="text-gray-800">{viewingClient.phone}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-gray-500">E-mail:</span>{' '}
                  <span className="text-gray-800">{viewingClient.email || 'Não informado'}</span>
                </div>
                <div className="sm:col-span-2 flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-gray-500">Endereço:</span>{' '}
                    <span className="text-gray-800">{viewingClient.address || 'Não informado'}</span>
                  </div>
                </div>
                {viewingClient.notes && (
                  <div className="sm:col-span-2 pt-2 border-t border-gray-200/60">
                    <span className="text-gray-500">Observações:</span>
                    <p className="text-gray-700 italic mt-0.5">{viewingClient.notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Equipamentos Vinculados */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Laptop className="w-4 h-4 text-slate-700" />
                  <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Equipamentos Registrados ({clientEquipment.length})
                  </h4>
                </div>
                {onAddEquipmentForClient && (
                  <button
                    type="button"
                    onClick={() => {
                      const c = viewingClient;
                      setViewingClient(null);
                      onAddEquipmentForClient(c);
                    }}
                    className="text-xs text-blue-700 hover:underline font-medium"
                  >
                    + Vincular Novo Equipamento
                  </button>
                )}
              </div>

              {clientEquipment.length === 0 ? (
                <p className="text-xs text-gray-400 bg-gray-50 p-3 rounded border border-dashed border-gray-200">
                  Nenhum equipamento registrado para este cliente.
                </p>
              ) : (
                <div className="border border-gray-200 rounded overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                      <tr>
                        <th className="py-2 px-3">Tipo</th>
                        <th className="py-2 px-3">Marca / Modelo</th>
                        <th className="py-2 px-3">Nº de Série</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {clientEquipment.map((eq) => (
                        <tr key={eq.id}>
                          <td className="py-2 px-3 font-medium text-gray-800">{eq.type}</td>
                          <td className="py-2 px-3 text-gray-700">
                            {eq.brand} - {eq.model}
                          </td>
                          <td className="py-2 px-3 font-mono text-gray-600">
                            {eq.serialNumber || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Histórico de Serviços / O.S. */}
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <ClipboardList className="w-4 h-4 text-slate-700" />
                <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  Histórico de Serviços ({clientServices.length})
                </h4>
              </div>

              {clientServices.length === 0 ? (
                <p className="text-xs text-gray-400 bg-gray-50 p-3 rounded border border-dashed border-gray-200">
                  Nenhum histórico de manutenção ou ordem de serviço vinculada.
                </p>
              ) : (
                <div className="border border-gray-200 rounded overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                      <tr>
                        <th className="py-2 px-3">Código O.S.</th>
                        <th className="py-2 px-3">Equipamento</th>
                        <th className="py-2 px-3">Status</th>
                        <th className="py-2 px-3 text-right">Total</th>
                        <th className="py-2 px-3 text-right">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {clientServices.map((srv) => (
                        <tr key={srv.id}>
                          <td className="py-2 px-3 font-mono font-medium text-gray-900">
                            {srv.serviceCode}
                          </td>
                          <td className="py-2 px-3 text-gray-700 max-w-[140px] truncate">
                            {srv.equipmentSummary}
                          </td>
                          <td className="py-2 px-3">
                            <ServiceStatusBadge status={srv.status} />
                          </td>
                          <td className="py-2 px-3 text-right font-medium text-gray-800">
                            R$ {Number(srv.totalCost || 0).toFixed(2)}
                          </td>
                          <td className="py-2 px-3 text-right">
                            {onViewService && (
                              <button
                                type="button"
                                onClick={() => {
                                  setViewingClient(null);
                                  onViewService(srv);
                                }}
                                className="text-blue-700 hover:underline font-medium"
                              >
                                Consultar
                              </button>
                            )}
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
                onClick={() => setViewingClient(null)}
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
        isOpen={!!deletingClient}
        title="Excluir Cliente"
        message={
          deletingLinkedEquipmentCount > 0 || deletingLinkedServicesCount > 0
            ? `Tem certeza que deseja excluir "${deletingClient?.name}"? ATENÇÃO: Este cliente possui ${deletingLinkedEquipmentCount} equipamento(s) e ${deletingLinkedServicesCount} ordem(ns) de serviço cadastradas.`
            : `Tem certeza que deseja excluir o cliente "${deletingClient?.name}"? Esta ação removerá o registro do Firestore.`
        }
        confirmLabel="Sim, Excluir"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingClient(null)}
      />
    </div>
  );
};
