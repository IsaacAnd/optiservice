/**
 * Configuração do Firebase para o OptiService Simplitech.
 * Suporta variáveis de ambiente (VITE_FIREBASE_*) para deploys externos (Vercel, Netlify, Docker)
 * com fallback para os parâmetros padrão de desenvolvimento.
 */

export const firebaseConfig = {
  apiKey:
    import.meta.env.VITE_FIREBASE_API_KEY ||
    'AIzaSyCj6LYYL0YyjHM_JzS77kmosb2LpijW9Ys',
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ||
    'studio-3912814680-cbe20.firebaseapp.com',
  projectId:
    import.meta.env.VITE_FIREBASE_PROJECT_ID ||
    'studio-3912814680-cbe20',
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
    'studio-3912814680-cbe20.firebasestorage.app',
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ||
    '287784456782',
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID ||
    '1:287784456782:web:70492b39ad38faf632e91f',
};

export const firestoreDatabaseId =
  import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID ||
  'ai-studio-optiservicesimpl-98df1ba4-e324-46d1-8af5-36c0f7e8c04b';
