import { cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

const REQUIRED_ENV = ['FIREBASE_PROJECT_ID', 'FIREBASE_CLIENT_EMAIL', 'FIREBASE_PRIVATE_KEY'] as const;

/** Variables del Admin SDK que faltan por definir */
export function missingAdminEnv(): string[] {
  return REQUIRED_ENV.filter((key) => !process.env[key]);
}

export function isAdminConfigured(): boolean {
  return missingAdminEnv().length === 0;
}

let cachedApp: App | null = null;

function getAdminApp(): App {
  const missing = missingAdminEnv();

  if (missing.length > 0) {
    throw new Error(
      `Faltan credenciales del Admin SDK de Firebase: ${missing.join(', ')}. ` +
        'Descarga la clave de servicio desde la consola de Firebase y define esas variables.'
    );
  }

  if (cachedApp) return cachedApp;

  const existing = getApps();
  if (existing.length > 0) {
    cachedApp = existing[0];
    return cachedApp;
  }

  cachedApp = initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // En las variables de entorno los saltos de línea viajan escapados como \n
      privateKey: (process.env.FIREBASE_PRIVATE_KEY ?? '').replace(/\\n/g, '\n')
    })
  });

  return cachedApp;
}

export function adminAuth(): Auth {
  return getAuth(getAdminApp());
}

/**
 * Identificador de la base de Firestore. Firebase usa `(default)` cuando el
 * proyecto tiene la base estándar, pero un proyecto puede tener bases con
 * nombre propio, así que se deja configurable.
 */
export function firestoreDatabaseId(): string {
  return process.env.FIREBASE_DATABASE_ID || '(default)';
}

export function adminDb(): Firestore {
  return getFirestore(getAdminApp(), firestoreDatabaseId());
}
