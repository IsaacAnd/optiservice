import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { LoginView } from './components/auth/LoginView';
import { DashboardView } from './components/dashboard/DashboardView';
import { ClientsView } from './components/clients/ClientsView';
import { EquipmentView } from './components/equipment/EquipmentView';
import { AppointmentsView } from './components/appointments/AppointmentsView';
import { ServicesView } from './components/services/ServicesView';
import {
  Client,
  Equipment,
  ServiceOrder,
  Appointment,
  NavigationPage,
  ServiceStatus,
} from './types';
import {
  subscribeClients,
  subscribeEquipment,
  subscribeServices,
  subscribeAppointments,
} from './services/dataService';
import { RefreshCw, Wrench } from 'lucide-react';

function OptiServiceMain() {
  const { user, loading: authLoading } = useAuth();

  const [currentPage, setCurrentPage] = useState<NavigationPage>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Estados dos dados persistidos em tempo real no Cloud Firestore
  const [clients, setClients] = useState<Client[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [services, setServices] = useState<ServiceOrder[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Estados de navegação cruzada entre telas
  const [serviceToView, setServiceToView] = useState<ServiceOrder | null>(null);
  const [clientForNewEquipment, setClientForNewEquipment] = useState<Client | null>(null);
  const [equipmentForNewService, setEquipmentForNewService] = useState<Equipment | null>(null);
  const [initialServiceFilter, setInitialServiceFilter] = useState<ServiceStatus | 'Todos'>('Todos');

  // Configuração das inscrições em tempo real no Cloud Firestore
  useEffect(() => {
    if (!user) {
      setDataLoading(false);
      return;
    }

    setDataLoading(true);

    const unsubClients = subscribeClients(
      (data) => {
        setClients(data);
        setDataLoading(false);
      },
      (err) => console.error('Erro na subscrição de clientes:', err)
    );

    const unsubEquipment = subscribeEquipment(
      (data) => {
        setEquipment(data);
      },
      (err) => console.error('Erro na subscrição de equipamentos:', err)
    );

    const unsubServices = subscribeServices(
      (data) => {
        setServices(data);
      },
      (err) => console.error('Erro na subscrição de serviços:', err)
    );

    const unsubAppointments = subscribeAppointments(
      (data) => {
        setAppointments(data);
      },
      (err) => console.error('Erro na subscrição de agendamentos:', err)
    );

    return () => {
      unsubClients();
      unsubEquipment();
      unsubServices();
      unsubAppointments();
    };
  }, [user]);

  // Se o Firebase Auth ainda está checando o token
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 rounded bg-blue-700 flex items-center justify-center mb-4 shadow-md">
          <Wrench className="w-6 h-6 text-white" />
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-300 font-medium">
          <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
          <span>Iniciando OptiService Simplitech...</span>
        </div>
      </div>
    );
  }

  // Se o usuário não está autenticado, exibe a tela de login
  if (!user) {
    return <LoginView />;
  }

  // Contadores para o menu lateral
  const activeServices = services.filter(
    (s) => s.status !== 'Concluído'
  ).length;

  const totalRecords = clients.length + equipment.length + services.length + appointments.length;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row text-slate-800">
      {/* Menu Lateral Empresarial */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={(page) => {
          if (page !== 'services') {
            setInitialServiceFilter('Todos');
          }
          setCurrentPage(page);
        }}
        counts={{
          clients: clients.length,
          equipment: equipment.length,
          appointments: appointments.length,
          services: services.length,
          activeServices,
        }}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Conteúdo Principal com Cabeçalho */}
      <div className="flex-1 flex flex-col md:pl-64 min-w-0">
        <Header
          currentPage={currentPage}
          onOpenMobile={() => setIsMobileSidebarOpen(true)}
          totalRecords={totalRecords}
        />

        <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto">
          {dataLoading && totalRecords === 0 ? (
            <div className="flex items-center justify-center py-16 text-gray-500 text-xs gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
              <span>Sincronizando dados com o Cloud Firestore...</span>
            </div>
          ) : (
            <>
              {currentPage === 'dashboard' && (
                <DashboardView
                  clients={clients}
                  equipment={equipment}
                  services={services}
                  appointments={appointments}
                  onNavigate={setCurrentPage}
                  onFilterStatus={(status) => {
                    setInitialServiceFilter(status);
                    setCurrentPage('services');
                  }}
                  onSelectService={(srv) => {
                    setServiceToView(srv);
                    setCurrentPage('services');
                  }}
                />
              )}

              {currentPage === 'clients' && (
                <ClientsView
                  clients={clients}
                  equipment={equipment}
                  services={services}
                  onAddEquipmentForClient={(client) => {
                    setClientForNewEquipment(client);
                    setCurrentPage('equipment');
                  }}
                  onViewService={(srv) => {
                    setServiceToView(srv);
                    setCurrentPage('services');
                  }}
                />
              )}

              {currentPage === 'equipment' && (
                <EquipmentView
                  equipment={equipment}
                  clients={clients}
                  services={services}
                  preselectedClient={clientForNewEquipment}
                  onClearPreselectedClient={() => setClientForNewEquipment(null)}
                  onCreateServiceForEquipment={(eq) => {
                    setEquipmentForNewService(eq);
                    setCurrentPage('services');
                  }}
                />
              )}

              {currentPage === 'appointments' && (
                <AppointmentsView
                  appointments={appointments}
                  clients={clients}
                  equipment={equipment}
                />
              )}

              {currentPage === 'services' && (
                <ServicesView
                  services={services}
                  clients={clients}
                  equipment={equipment}
                  initialStatusFilter={initialServiceFilter}
                  onClearInitialFilter={() => setInitialServiceFilter('Todos')}
                  selectedServiceForView={serviceToView}
                  onClearSelectedService={() => setServiceToView(null)}
                  preselectedEquipment={equipmentForNewService}
                  onClearPreselectedEquipment={() => setEquipmentForNewService(null)}
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <OptiServiceMain />
      </ToastProvider>
    </AuthProvider>
  );
}
