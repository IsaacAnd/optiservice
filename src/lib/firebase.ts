import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { firebaseConfig, firestoreDatabaseId } from './firebaseConfig';

// Inicialização da instância Firebase para o OptiService
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = firestoreDatabaseId ? getFirestore(app, firestoreDatabaseId) : getFirestore(app);

// Inicialização da Autenticação do Firebase
export const auth = getAuth(app);

// Provedor Google configurado
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Teste de conexão com o Cloud Firestore
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.info('OptiService: Conexão com Cloud Firestore estabelecida com sucesso.');
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('OptiService: Cliente Firestore está offline. Verifique a conexão de rede.');
    } else {
      console.warn('OptiService: Verificação inicial Firestore:', error);
    }
  }
}

testConnection();
