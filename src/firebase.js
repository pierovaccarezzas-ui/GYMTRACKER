import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';

const env = import.meta.env || {};
const config = {
  apiKey:env.VITE_FIREBASE_API_KEY,
  authDomain:env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:env.VITE_FIREBASE_PROJECT_ID,
  appId:env.VITE_FIREBASE_APP_ID,
  ...(env.VITE_FIREBASE_STORAGE_BUCKET ? {storageBucket:env.VITE_FIREBASE_STORAGE_BUCKET} : {}),
  ...(env.VITE_FIREBASE_MESSAGING_SENDER_ID ? {messagingSenderId:env.VITE_FIREBASE_MESSAGING_SENDER_ID} : {}),
};
let auth = null, db = null, firebaseConfigurationError = '';
if (config.apiKey && config.authDomain && config.projectId && config.appId) {
  try {
    const app = initializeApp(config);
    auth = getAuth(app);
    db = initializeFirestore(app,{localCache:persistentLocalCache({tabManager:persistentMultipleTabManager()})});
  } catch(e) {
    auth = null; db = null;
    firebaseConfigurationError = `No fue posible iniciar Firebase: ${e.message}`;
  }
} else {
  firebaseConfigurationError = 'Falta la configuración pública de Firebase. Puedes usar y respaldar los datos de este dispositivo.';
}
const isFirebaseConfigured = Boolean(auth && db);
export {auth,db,isFirebaseConfigured,firebaseConfigurationError};
