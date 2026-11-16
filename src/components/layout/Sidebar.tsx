import React from 'react';
import {
  LayoutDashboard,
  Users,
  Laptop,
  CalendarDays,
  ClipboardList,
  Wrench,
  Database,
  CheckCircle2,
  Github,
} from 'lucide-react';
import { NavigationPage } from '../../types';

interface SidebarProps {
  currentPage: NavigationPage;
  onNavigate: (page: NavigationPage) => void;
  counts: {
    clients: number;
    equipment: number;
    appointments: number;
    services: number;
    activeServices: number;
  };
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  counts,
  isMobileOpen,
  onCloseMobile,
}) => {
  const navItems = [
    {
      id: 'dashboard' as NavigationPage,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'clients' as NavigationPage,
      label: 'Clientes',
      icon: Users,
      badge: counts.clients > 0 ? counts.clients : null,
    },
    {
      id: 'equipment' as NavigationPage,
      label: 'Equipamentos',
      icon: Laptop,
      badge: counts.equipment > 0 ? counts.equipment : null,
    },
    {
      id: 'agendamentos' as NavigationPage,
      idReal: 'appointments' as NavigationPage,
      label: 'Agendamentos',
      icon: CalendarDays,
      badge: counts.appointments > 0 ? counts.appointments : null,
    },
    {
      id: 'services' as NavigationPage,
      label: 'Serviços (O.S.)',
      icon: ClipboardList,
      badge: counts.activeServices > 0 ? `${counts.activeServices} ativos` : null,
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 md:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-slate-800 bg-slate-950">
          <div className="w-9 h-9 rounded bg-blue-700 flex items-center justify-center text-white shrink-0 shadow-xs">
            <Wrench className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold tracking-tight text-white">OptiService</span>
            </div>
            <p className="text-xs text-slate-400 font-medium">Simplitech Assistência Técnica</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
            Menu Administrativo
          </div>
          {navItems.map((item) => {
            const pageTarget = item.idReal || item.id;
            const isActive = currentPage === pageTarget;
            const Icon = item.icon;

            return (
              <button
                key={pageTarget}
                type="button"
                onClick={() => {
                  onNavigate(pageTarget);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-800 text-white shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== null && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-blue-900 text-blue-100'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Database & System Info */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/70 text-xs text-slate-400 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span className="font-medium text-[11px]">Cloud Firestore Ativo</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
            <Database className="w-3 h-3 text-slate-500" />
            <span>Base: Simplitech Assistência</span>
          </div>
          <div className="pt-1 text-[10px] text-slate-400 border-t border-slate-800/60 flex justify-between">
            <span>Protótipo Acadêmico</span>
            <span>v1.0.0</span>
          </div>
          <a
            href="https://github.com/IsaacAnd/optiservice"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-[11px] pt-1"
            title="Acessar repositório no GitHub"
          >
            <Github className="w-3 h-3 text-slate-400" />
            <span className="truncate">IsaacAnd/optiservice</span>
          </a>
        </div>
      </aside>
    </>
  );
};
