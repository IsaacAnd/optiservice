import {
  collection,
  onSnapshot,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  getDocsFromServer,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrors';
import { Client, Equipment, ServiceOrder, Appointment } from '../types';

export const COLLECTIONS = {
  CLIENTS: 'clients',
  EQUIPMENT: 'equipment',
  SERVICES: 'services',
  APPOINTMENTS: 'appointments',
} as const;

// Verificação no servidor antes de excluir. Não é uma transação relacional.
async function ensureNoLinks(id: string, field: string, collections: string[]) {
  const results = await Promise.all(collections.map(name =>
    getDocsFromServer(query(collection(db, name), where(field, '==', id), limit(1)))
  ));
  if (results.some(result => !result.empty)) {
    throw new Error('Exclusão bloqueada: existem registros vinculados.');
  }
}

// --- CLIENTES ---
export function subscribeClients(
  onSuccess: (clients: Client[]) => void,
  onError?: (error: Error) => void
) {
  const colRef = collection(db, COLLECTIONS.CLIENTS);
  const q = query(colRef, orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const data: Client[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Client, 'id'>),
      }));
      onSuccess(data);
    },
    (error) => {
      onError?.(error);
      handleFirestoreError(error, OperationType.GET, COLLECTIONS.CLIENTS);
    }
  );
}

export async function addClient(clientData: Omit<Client, 'id'>): Promise<string> {
  const path = COLLECTIONS.CLIENTS;
  try {
    const docRef = await addDoc(collection(db, path), {
      ...clientData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      serverTimestamp: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateClient(id: string, clientData: Partial<Client>): Promise<void> {
  const path = `${COLLECTIONS.CLIENTS}/${id}`;
  try {
    await updateDoc(doc(db, COLLECTIONS.CLIENTS, id), {
      ...clientData,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteClient(id: string): Promise<void> {
  const path = `${COLLECTIONS.CLIENTS}/${id}`;
  try {
    await ensureNoLinks(id, 'clientId', [COLLECTIONS.EQUIPMENT, COLLECTIONS.SERVICES, COLLECTIONS.APPOINTMENTS]);
    await deleteDoc(doc(db, COLLECTIONS.CLIENTS, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// --- EQUIPAMENTOS ---
export function subscribeEquipment(
  onSuccess: (equipment: Equipment[]) => void,
  onError?: (error: Error) => void
) {
  const colRef = collection(db, COLLECTIONS.EQUIPMENT);
  const q = query(colRef, orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const data: Equipment[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Equipment, 'id'>),
      }));
      onSuccess(data);
    },
    (error) => {
      onError?.(error);
      handleFirestoreError(error, OperationType.GET, COLLECTIONS.EQUIPMENT);
    }
  );
}

export async function addEquipment(equipmentData: Omit<Equipment, 'id'>): Promise<string> {
  const path = COLLECTIONS.EQUIPMENT;
  try {
    const docRef = await addDoc(collection(db, path), {
      ...equipmentData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      serverTimestamp: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateEquipment(id: string, equipmentData: Partial<Equipment>): Promise<void> {
  const path = `${COLLECTIONS.EQUIPMENT}/${id}`;
  try {
    await updateDoc(doc(db, COLLECTIONS.EQUIPMENT, id), {
      ...equipmentData,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteEquipment(id: string): Promise<void> {
  const path = `${COLLECTIONS.EQUIPMENT}/${id}`;
  try {
    await ensureNoLinks(id, 'equipmentId', [COLLECTIONS.SERVICES, COLLECTIONS.APPOINTMENTS]);
    await deleteDoc(doc(db, COLLECTIONS.EQUIPMENT, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// --- SERVIÇOS (ORDENS DE SERVIÇO) ---
export function subscribeServices(
  onSuccess: (services: ServiceOrder[]) => void,
  onError?: (error: Error) => void
) {
  const colRef = collection(db, COLLECTIONS.SERVICES);
  const q = query(colRef, orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const data: ServiceOrder[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<ServiceOrder, 'id'>),
      }));
      onSuccess(data);
    },
    (error) => {
      onError?.(error);
      handleFirestoreError(error, OperationType.GET, COLLECTIONS.SERVICES);
    }
  );
}

export async function addService(serviceData: Omit<ServiceOrder, 'id'>): Promise<string> {
  const path = COLLECTIONS.SERVICES;
  try {
    const docRef = await addDoc(collection(db, path), {
      ...serviceData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      serverTimestamp: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateService(id: string, serviceData: Partial<ServiceOrder>): Promise<void> {
  const path = `${COLLECTIONS.SERVICES}/${id}`;
  try {
    await updateDoc(doc(db, COLLECTIONS.SERVICES, id), {
      ...serviceData,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteService(id: string): Promise<void> {
  const path = `${COLLECTIONS.SERVICES}/${id}`;
  try {
    await deleteDoc(doc(db, COLLECTIONS.SERVICES, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// --- AGENDAMENTOS ---
export function subscribeAppointments(
  onSuccess: (appointments: Appointment[]) => void,
  onError?: (error: Error) => void
) {
  const colRef = collection(db, COLLECTIONS.APPOINTMENTS);
  const q = query(colRef, orderBy('scheduledDate', 'asc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const data: Appointment[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Appointment, 'id'>),
      }));
      onSuccess(data);
    },
    (error) => {
      onError?.(error);
      handleFirestoreError(error, OperationType.GET, COLLECTIONS.APPOINTMENTS);
    }
  );
}

export async function addAppointment(data: Omit<Appointment, 'id'>): Promise<string> {
  const path = COLLECTIONS.APPOINTMENTS;
  try {
    const docRef = await addDoc(collection(db, path), {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      serverTimestamp: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateAppointment(id: string, data: Partial<Appointment>): Promise<void> {
  const path = `${COLLECTIONS.APPOINTMENTS}/${id}`;
  try {
    await updateDoc(doc(db, COLLECTIONS.APPOINTMENTS, id), {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteAppointment(id: string): Promise<void> {
  const path = `${COLLECTIONS.APPOINTMENTS}/${id}`;
  try {
    await deleteDoc(doc(db, COLLECTIONS.APPOINTMENTS, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Seed para projetos acadêmicos e demonstração funcional inicial
export async function seedAcademicDemoData(): Promise<void> {
  // Cria clientes de teste representativos
  const client1Id = await addClient({
    name: 'Carlos Eduardo Mendes',
    email: 'carlos.mendes@email.com',
    phone: '(11) 98765-4321',
    document: '123.456.789-00',
    address: 'Av. Paulista, 1000 - Bela Vista, São Paulo - SP',
    notes: 'Cliente corporativo recorrente. Priorizar atendimentos.',
  });

  const client2Id = await addClient({
    name: 'Mariana Silva Ribeiro',
    email: 'mariana.ribeiro@empresa.com.br',
    phone: '(11) 97123-9988',
    document: '321.654.987-11',
    address: 'Rua das Flores, 45 - Pinheiros, São Paulo - SP',
    notes: 'Solicitou contato preferencialmente no período da tarde.',
  });

  const client3Id = await addClient({
    name: 'TechLog Soluções Logísticas ME',
    email: 'contato@techlog.com.br',
    phone: '(11) 3456-7890',
    document: '12.345.678/0001-90',
    address: 'Rua Vergueiro, 2500 - Vila Mariana, São Paulo - SP',
    notes: 'Contrato corporativo para manutenção de computadores do escritório.',
  });

  // Equipamentos vinculados
  const eq1Id = await addEquipment({
    clientId: client1Id,
    clientName: 'Carlos Eduardo Mendes',
    type: 'Notebook',
    brand: 'Dell',
    model: 'Latitude 3420',
    serialNumber: 'DL3420-9981-BR',
    conditionNotes: 'Carcaça íntegra, fonte original inclusa. Apresenta travamento súbito.',
  });

  const eq2Id = await addEquipment({
    clientId: client2Id,
    clientName: 'Mariana Silva Ribeiro',
    type: 'Desktop',
    brand: 'Lenovo',
    model: 'ThinkCentre M720s',
    serialNumber: 'TC-720-4412',
    conditionNotes: 'Computador corporativo. Não inicializa o sistema operacional.',
  });

  const eq3Id = await addEquipment({
    clientId: client3Id,
    clientName: 'TechLog Soluções Logísticas ME',
    type: 'Impressora',
    brand: 'HP',
    model: 'LaserJet Pro M404dn',
    serialNumber: 'HPLJ-2024-551',
    conditionNotes: 'Atolamento constante de papel na bandeja 2.',
  });

  const eq4Id = await addEquipment({
    clientId: client1Id,
    clientName: 'Carlos Eduardo Mendes',
    type: 'Smartphone',
    brand: 'Samsung',
    model: 'Galaxy S22',
    serialNumber: 'SM-S901B-776',
    conditionNotes: 'Bateria com autonomia reduzida (desliga com 30%).',
  });

  // Serviços com os 5 status exigidos: Solicitado, Agendado, Em execução, Aguardando peça e Concluído
  await addService({
    serviceCode: 'OS-2026-001',
    clientId: client1Id,
    clientName: 'Carlos Eduardo Mendes',
    equipmentId: eq1Id,
    equipmentSummary: 'Dell Latitude 3420 (DL3420-9981-BR)',
    status: 'Em execução',
    reportedIssue: 'Superaquecimento e lentidão extrema ao abrir planilhas pesadas.',
    technicalDiagnosis: 'Pasta térmica ressecada e obstrução do cooler com poeira. Necessário limpeza interna e troca de pasta.',
    solution: 'Desmontagem, limpeza química dos dissipadores e aplicação de pasta térmica de prata.',
    laborCost: 150.0,
    partsCost: 35.0,
    totalCost: 185.0,
    technicianName: 'Rafael Silva',
    priority: 'Alta',
    scheduledDate: '2026-10-18',
  });

  await addService({
    serviceCode: 'OS-2026-002',
    clientId: client2Id,
    clientName: 'Mariana Silva Ribeiro',
    equipmentId: eq2Id,
    equipmentSummary: 'Lenovo ThinkCentre M720s (TC-720-4412)',
    status: 'Aguardando peça',
    reportedIssue: 'Computador emite 3 bips ao ligar e não gera vídeo.',
    technicalDiagnosis: 'Módulo de memória RAM com defeito e fonte com oscilação de tensão na linha de 12V.',
    solution: 'Troca da fonte ATX 300W 80 Plus e pente de memória DDR4 16GB.',
    laborCost: 180.0,
    partsCost: 320.0,
    totalCost: 500.0,
    technicianName: 'Lucas Oliveira',
    priority: 'Urgente',
    scheduledDate: '2026-10-20',
  });

  await addService({
    serviceCode: 'OS-2026-003',
    clientId: client3Id,
    clientName: 'TechLog Soluções Logísticas ME',
    equipmentId: eq3Id,
    equipmentSummary: 'HP LaserJet Pro M404dn (HPLJ-2024-551)',
    status: 'Solicitado',
    reportedIssue: 'Puxa várias folhas de uma vez e mancha o canto direito da impressão.',
    technicalDiagnosis: 'Aguardando bancada técnica para abertura e avaliação de roletes e fusor.',
    laborCost: 0,
    partsCost: 0,
    totalCost: 0,
    technicianName: 'Equipe de Triagem',
    priority: 'Média',
  });

  await addService({
    serviceCode: 'OS-2026-004',
    clientId: client1Id,
    clientName: 'Carlos Eduardo Mendes',
    equipmentId: eq4Id,
    equipmentSummary: 'Samsung Galaxy S22 (SM-S901B-776)',
    status: 'Concluído',
    reportedIssue: 'Substituição de bateria desgastada.',
    technicalDiagnosis: 'Saúde da bateria em 68% de capacidade original.',
    solution: 'Substituição por bateria original Samsung homologada e vedação IP68 refeita.',
    laborCost: 120.0,
    partsCost: 210.0,
    totalCost: 330.0,
    technicianName: 'Rafael Silva',
    priority: 'Média',
    scheduledDate: '2026-10-14',
  });

  // Agendamentos
  await addAppointment({
    clientId: client1Id,
    clientName: 'Carlos Eduardo Mendes',
    equipmentId: eq1Id,
    equipmentSummary: 'Dell Latitude 3420',
    scheduledDate: '2026-10-18',
    scheduledTime: '10:30',
    status: 'Confirmado',
    notes: 'Retirada do equipamento após manutenção preventiva.',
  });

  await addAppointment({
    clientId: client2Id,
    clientName: 'Mariana Silva Ribeiro',
    equipmentId: eq2Id,
    equipmentSummary: 'Lenovo ThinkCentre M720s',
    scheduledDate: '2026-10-20',
    scheduledTime: '14:00',
    status: 'Agendado',
    notes: 'Visita técnica no escritório para entrega do desktop.',
  });
}
