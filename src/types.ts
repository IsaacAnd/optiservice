export type ServiceStatus =
  | 'Solicitado'
  | 'Agendado'
  | 'Em execução'
  | 'Aguardando peça'
  | 'Concluído';

export type ServicePriority = 'Baixa' | 'Média' | 'Alta' | 'Urgente';

export type AppointmentStatus =
  | 'Agendado'
  | 'Confirmado'
  | 'Realizado'
  | 'Cancelado';

export interface Client {
  id?: string;
  name: string;
  email: string;
  phone: string;
  document: string; // CPF ou CNPJ
  address: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Equipment {
  id?: string;
  clientId: string;
  clientName: string;
  type: string; // Notebook, Desktop, Smartphone, Tablet, Impressora, etc.
  brand: string;
  model: string;
  serialNumber: string;
  conditionNotes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ServiceOrder {
  id?: string;
  serviceCode: string;
  clientId: string;
  clientName: string;
  equipmentId: string;
  equipmentSummary: string;
  status: ServiceStatus;
  reportedIssue: string;
  technicalDiagnosis?: string;
  solution?: string;
  laborCost: number;
  partsCost: number;
  totalCost: number;
  technicianName: string;
  priority: ServicePriority;
  scheduledDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Appointment {
  id?: string;
  clientId: string;
  clientName: string;
  equipmentId?: string;
  equipmentSummary?: string;
  serviceId?: string;
  scheduledDate: string; // YYYY-MM-DD
  scheduledTime: string; // HH:mm
  status: AppointmentStatus;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type NavigationPage =
  | 'dashboard'
  | 'clients'
  | 'equipment'
  | 'appointments'
  | 'services';
