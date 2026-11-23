import React, { useState } from 'react';
import { Menu, LogOut, User as UserIcon, Database, RefreshCw, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { NavigationPage } from '../../types';
import { seedAcademicDemoData } from '../../services/dataService';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { useToast } from '../../context/ToastContext';

interface HeaderProps {
  currentPage: NavigationPage;
  onOpenMobile: () => void;
  onRefreshData?: () => void;
  totalRecords: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  onOpenMobile,
  totalRecords,
}) => {
  const { user, logout } = useAuth();
  const { success, error: toastError } = useToast();
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);
  const [isConfirmSeedOpen, setIsConfirmSeedOpen] = useState(false);

  const getPageTitle = () => {
    switch (currentPage) {
      case 'dashboard':
        return { title: 'Painel Geral', breadcrumb: 'Visão Integrada' };
      case 'clients':
        return { title: 'Gestão de Clientes', breadcrumb: 'Cadastros e Histórico' };
      case 'equipment':
        return { title: 'Gestão de Equipamentos', breadcrumb: 'Aparelhos e Vínculos' };
      case 'appointments':
        return { title: 'Controle de Agendamentos', breadcrumb: 'Visitas e Retiradas' };
      case 'services':
        return { title: 'Ordens de Serviço', breadcrumb: 'Manutenções e Status' };
      default:
        return { title: 'OptiService', breadcrumb: 'Simplitech' };
    }
  };

  const handleExecuteSeed = async () => {
    setIsConfirmSeedOpen(false);
    setIsSeeding(true);
    try {
      await seedAcademicDemoData();
      setSeedSuccess(true);
      success('Dados de demonstração gravados no Cloud Firestore com sucesso!');
      setTimeout(() => setSeedSuccess(false), 4000);
    } catch (err) {
      console.error('Erro ao popular dados acadêmicos:', err);
      toastError('Erro ao gravar dados no Firebase. Verifique as permissões de acesso.');
    } finally {
      setIsSeeding(false);
    }
  };

  const pageInfo = getPageTitle();

  return (
    <>
      <header className="h-16 bg-white border-b border-gray-200 px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenMobile}
            className="p-2 -ml-2 text-gray-600 hover:text-gray-900 rounded-md md:hidden"
            title="Abrir menu lateral"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base font-semibold text-gray-900 leading-none">
              {pageInfo.title}
            </h1>
            <p className="text-xs text-gray-500 mt-1 font-normal">
              Simplitech &bull; {pageInfo.breadcrumb}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">

          {/* Academic Demo Seed Button */}
          {totalRecords === 0 ? (
            <button
              type="button"
              onClick={() => setIsConfirmSeedOpen(true)}
              disabled={isSeeding}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors disabled:opacity-50"
              title="Preencher com exemplos fictícios para avaliação acadêmica"
            >
              {isSeeding ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : seedSuccess ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Database className="w-3.5 h-3.5 text-blue-600" />
              )}
              <span>{isSeeding ? 'Gravando no Firestore...' : seedSuccess ? 'Dados Carregados!' : 'Carregar Dados de Exemplo'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsConfirmSeedOpen(true)}
              disabled={isSeeding}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded hover:bg-gray-100 transition-colors"
              title="Adicionar mais registros para testes"
            >
              <Database className="w-3 h-3 text-gray-500" />
              <span>Inserir Dados Demo</span>
            </button>
          )}

          {/* User Badge */}
          <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
            <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-700 text-xs font-medium">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="Avatar"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <UserIcon className="w-3.5 h-3.5 text-slate-600" />
              )}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-gray-800 leading-tight truncate max-w-[150px]">
                {user?.displayName || user?.email?.split('@')[0] || 'Técnico Autorizado'}
              </p>
              <p className="text-[11px] text-gray-500 truncate max-w-[150px]">
                {user?.email || 'Simplitech Operador'}
              </p>
            </div>

            {/* Logout */}
            <button
              type="button"
              onClick={logout}
              className="p-1.5 text-gray-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors ml-1"
              title="Sair do sistema"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Confirmação de Carga Demo */}
      <ConfirmDialog
        isOpen={isConfirmSeedOpen}
        title="Carregar Dados de Demonstração"
        message="Deseja carregar registros explicitamente fictícios de demonstração (clientes, equipamentos, ordens de serviço e agendamentos) no Cloud Firestore? Use-os apenas para avaliação acadêmica."
        confirmLabel="Sim, Carregar Dados"
        isDestructive={false}
        onConfirm={handleExecuteSeed}
        onCancel={() => setIsConfirmSeedOpen(false)}
      />
    </>
  );
};
