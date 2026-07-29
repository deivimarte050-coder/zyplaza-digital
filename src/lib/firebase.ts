import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? ''
};

const REQUIRED_KEYS = ['apiKey', 'authDomain', 'projectId', 'appId'] as const;

/** Claves de configuración que faltan por definir en el archivo .env.local */
export const missingFirebaseKeys: string[] = REQUIRED_KEYS.filter(
  (key) => !firebaseConfig[key]
).map((key) => `VITE_FIREBASE_${key.replace(/[A-Z]/g, (c) => `_${c}`).toUpperCase()}`);

/** Indica si Firebase tiene la configuración mínima para inicializarse */
export const isFirebaseConfigured = missingFirebaseKeys.length === 0;

let cachedApp: FirebaseApp | null = null;

function getFirebaseApp(): FirebaseApp {
  if (!isFirebaseConfigured) {
    throw new Error(
      `Firebase no está configurado. Faltan estas variables: ${missingFirebaseKeys.join(', ')}`
    );
  }

  if (!cachedApp) {
    cachedApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  }

  return cachedApp;
}

let cachedAuth: Auth | null = null;
let cachedDb: Firestore | null = null;

export function getFirebaseAuth(): Auth {
  if (!cachedAuth) {
    cachedAuth = getAuth(getFirebaseApp());
  }
  return cachedAuth;
}

/**
 * Un proyecto de Firebase puede tener varias bases de Firestore. `(default)` es
 * la estándar, pero este proyecto puede usar otra, así que es configurable.
 */
const databaseId = import.meta.env.VITE_FIREBASE_DATABASE_ID || '(default)';

export function getDb(): Firestore {
  if (!cachedDb) {
    cachedDb = getFirestore(getFirebaseApp(), databaseId);
  }
  return cachedDb;
}
