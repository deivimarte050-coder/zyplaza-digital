import {
  deleteDoc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc
} from 'firebase/firestore';
import {
  docRef,
  collectionRef,
  toBoolean,
  toDate,
  toEnum,
  toText
} from '../lib/collections';
import type { AccountStatus, AdminUserRecord, UserRole } from '../types/admin';
import { logAdminAction } from './audit';

const ROLES: readonly UserRole[] = ['user', 'seller', 'admin'];
const STATUSES: readonly AccountStatus[] = ['active', 'suspended'];

export function mapUser(id: string, data: Record<string, unknown>): AdminUserRecord {
  return {
    id,
    name: toText(data.name, 'Sin nombre'),
    email: toText(data.email),
    phone: toText(data.phone),
    city: toText(data.city),
    avatar: toText(data.avatar),
    role: toEnum(data.role, ROLES, 'user'),
    status: toEnum(data.status, STATUSES, 'active'),
    mustChangePassword: toBoolean(data.mustChangePassword),
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
    lastLoginAt: toDate(data.lastLoginAt)
  };
}

/** Escucha en tiempo real la colección de usuarios */
export function subscribeUsers(
  onData: (users: AdminUserRecord[]) => void,
  onError: (error: unknown) => void
): () => void {
  const usersQuery = query(collectionRef('users'), orderBy('createdAt', 'desc'));

  return onSnapshot(
    usersQuery,
    (snapshot) => onData(snapshot.docs.map((entry) => mapUser(entry.id, entry.data()))),
    onError
  );
}

export async function fetchUser(id: string): Promise<AdminUserRecord | null> {
  const snapshot = await getDoc(docRef('users', id));
  return snapshot.exists() ? mapUser(snapshot.id, snapshot.data()) : null;
}

/** Crea o actualiza el documento de perfil de un usuario autenticado */
export async function upsertUserProfile(
  id: string,
  data: Partial<Omit<AdminUserRecord, 'id' | 'createdAt' | 'updatedAt'>> & { email: string }
): Promise<void> {
  const reference = docRef('users', id);
  const existing = await getDoc(reference);

  if (existing.exists()) {
    await updateDoc(reference, { ...data, updatedAt: serverTimestamp() });
    return;
  }

  await setDoc(reference, {
    name: data.name ?? 'Sin nombre',
    email: data.email,
    phone: data.phone ?? '',
    city: data.city ?? '',
    avatar: data.avatar ?? '',
    role: data.role ?? 'user',
    status: data.status ?? 'active',
    mustChangePassword: data.mustChangePassword ?? false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastLoginAt: null
  });
}

export async function updateUser(
  id: string,
  changes: Pick<AdminUserRecord, 'name' | 'email' | 'phone' | 'city'>
): Promise<void> {
  await updateDoc(docRef('users', id), { ...changes, updatedAt: serverTimestamp() });

  await logAdminAction({
    action: 'user.updated',
    targetType: 'user',
    targetId: id,
    description: `Editó los datos de ${changes.name}`
  });
}

export async function setUserStatus(
  user: AdminUserRecord,
  status: AccountStatus
): Promise<void> {
  await updateDoc(docRef('users', user.id), { status, updatedAt: serverTimestamp() });

  await logAdminAction({
    action: status === 'suspended' ? 'user.suspended' : 'user.reactivated',
    targetType: 'user',
    targetId: user.id,
    description: `${status === 'suspended' ? 'Suspendió' : 'Reactivó'} la cuenta de ${user.name}`
  });
}

export async function setUserRole(user: AdminUserRecord, role: UserRole): Promise<void> {
  await updateDoc(docRef('users', user.id), { role, updatedAt: serverTimestamp() });

  await logAdminAction({
    action: 'user.role_changed',
    targetType: 'user',
    targetId: user.id,
    description: `Cambió el rol de ${user.name} a ${role}`
  });
}

export async function markLoginTimestamp(id: string): Promise<void> {
  try {
    await updateDoc(docRef('users', id), { lastLoginAt: serverTimestamp() });
  } catch (error) {
    console.error('No se pudo registrar la fecha de acceso:', error);
  }
}

export async function deleteUserDocument(user: AdminUserRecord): Promise<void> {
  await deleteDoc(docRef('users', user.id));

  await logAdminAction({
    action: 'user.deleted',
    targetType: 'user',
    targetId: user.id,
    description: `Eliminó la cuenta de ${user.name}`
  });
}
