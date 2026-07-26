import {
  collection,
  doc,
  Timestamp,
  type CollectionReference,
  type DocumentData,
  type DocumentSnapshot,
  type QueryDocumentSnapshot
} from 'firebase/firestore';
import { getDb } from './firebase';

export const COLLECTIONS = {
  users: 'users',
  stores: 'stores',
  products: 'products',
  orders: 'orders',
  banners: 'banners',
  categories: 'categories',
  settings: 'settings',
  adminLogs: 'adminLogs'
} as const;

export const SETTINGS_DOC_ID = 'general';

/** Convierte cualquier valor de fecha de Firestore a Date de JavaScript */
export function toDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Timestamp) return value.toDate();
  if (value instanceof Date) return value;

  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  return null;
}

export function toText(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

export function toNumber(value: unknown, fallback = 0): number {
  const parsed = typeof value === 'string' ? Number(value) : value;
  return typeof parsed === 'number' && Number.isFinite(parsed) ? parsed : fallback;
}

export function toBoolean(value: unknown, fallback = false): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

/** Valida que un valor pertenezca a una lista de opciones permitidas */
export function toEnum<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : fallback;
}

export function collectionRef(name: keyof typeof COLLECTIONS): CollectionReference<DocumentData> {
  return collection(getDb(), COLLECTIONS[name]);
}

export function docRef(name: keyof typeof COLLECTIONS, id: string) {
  return doc(getDb(), COLLECTIONS[name], id);
}

export function newDocRef(name: keyof typeof COLLECTIONS) {
  return doc(collectionRef(name));
}

export type AnySnapshot = QueryDocumentSnapshot<DocumentData> | DocumentSnapshot<DocumentData>;

/** Traduce los códigos de error de Firebase a mensajes claros en español */
export function describeFirebaseError(error: unknown): string {
  const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : '';

  const messages: Record<string, string> = {
    'permission-denied': 'No tienes permisos para realizar esta acción.',
    unauthenticated: 'Tu sesión expiró. Inicia sesión nuevamente.',
    unavailable: 'Sin conexión con la base de datos. Revisa tu internet.',
    'not-found': 'El registro que buscas ya no existe.',
    'already-exists': 'Ya existe un registro con esos datos.',
    'failed-precondition': 'Falta un índice en Firestore. Revisa la consola de Firebase.',
    'resource-exhausted': 'Se alcanzó el límite de operaciones de Firebase. Intenta más tarde.',
    'auth/invalid-credential': 'El correo o la contraseña no son correctos.',
    'auth/invalid-email': 'El correo electrónico no tiene un formato válido.',
    'auth/user-not-found': 'No existe una cuenta con ese correo.',
    'auth/wrong-password': 'La contraseña no es correcta.',
    'auth/too-many-requests': 'Demasiados intentos fallidos. Espera unos minutos.',
    'auth/user-disabled': 'Esta cuenta está deshabilitada.',
    'auth/weak-password': 'La contraseña es demasiado débil.',
    'auth/requires-recent-login': 'Por seguridad, inicia sesión de nuevo antes de continuar.',
    'auth/network-request-failed': 'Falló la conexión. Revisa tu internet.'
  };

  if (code && messages[code]) return messages[code];

  if (error instanceof Error && error.message) return error.message;

  return 'Ocurrió un error inesperado. Inténtalo nuevamente.';
}
