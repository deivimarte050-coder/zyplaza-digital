import {
  deleteDoc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc
} from 'firebase/firestore';
import { collectionRef, docRef, toDate, toEnum, toNumber, toText } from '../lib/collections';
import type { StoreRecord, StoreStatus } from '../types/admin';
import { logAdminAction } from './audit';

const STATUSES: readonly StoreStatus[] = ['pending', 'approved', 'rejected', 'suspended'];

export function mapStore(id: string, data: Record<string, unknown>): StoreRecord {
  return {
    id,
    ownerId: toText(data.ownerId),
    name: toText(data.name, 'Tienda sin nombre'),
    description: toText(data.description),
    city: toText(data.city),
    phone: toText(data.phone),
    logoUrl: toText(data.logoUrl),
    status: toEnum(data.status, STATUSES, 'pending'),
    rejectionReason: toText(data.rejectionReason),
    commissionRate:
      data.commissionRate === null || data.commissionRate === undefined
        ? null
        : toNumber(data.commissionRate),
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt)
  };
}

export function subscribeStores(
  onData: (stores: StoreRecord[]) => void,
  onError: (error: unknown) => void
): () => void {
  const storesQuery = query(collectionRef('stores'), orderBy('createdAt', 'desc'));

  return onSnapshot(
    storesQuery,
    (snapshot) => onData(snapshot.docs.map((entry) => mapStore(entry.id, entry.data()))),
    onError
  );
}

export async function fetchStore(id: string): Promise<StoreRecord | null> {
  const snapshot = await getDoc(docRef('stores', id));
  return snapshot.exists() ? mapStore(snapshot.id, snapshot.data()) : null;
}

export async function approveStore(store: StoreRecord): Promise<void> {
  await updateDoc(docRef('stores', store.id), {
    status: 'approved',
    rejectionReason: '',
    updatedAt: serverTimestamp()
  });

  await logAdminAction({
    action: 'store.approved',
    targetType: 'store',
    targetId: store.id,
    description: `Aprobó la tienda ${store.name}`
  });
}

export async function rejectStore(store: StoreRecord, reason: string): Promise<void> {
  await updateDoc(docRef('stores', store.id), {
    status: 'rejected',
    rejectionReason: reason,
    updatedAt: serverTimestamp()
  });

  await logAdminAction({
    action: 'store.rejected',
    targetType: 'store',
    targetId: store.id,
    description: `Rechazó la tienda ${store.name}: ${reason}`
  });
}

export async function setStoreStatus(store: StoreRecord, status: StoreStatus): Promise<void> {
  await updateDoc(docRef('stores', store.id), { status, updatedAt: serverTimestamp() });

  await logAdminAction({
    action: status === 'suspended' ? 'store.suspended' : 'store.reactivated',
    targetType: 'store',
    targetId: store.id,
    description: `${status === 'suspended' ? 'Suspendió' : 'Reactivó'} la tienda ${store.name}`
  });
}

export async function updateStore(
  store: StoreRecord,
  changes: Pick<StoreRecord, 'name' | 'description' | 'city' | 'phone'> & {
    commissionRate: number | null;
  }
): Promise<void> {
  await updateDoc(docRef('stores', store.id), { ...changes, updatedAt: serverTimestamp() });

  await logAdminAction({
    action: 'store.updated',
    targetType: 'store',
    targetId: store.id,
    description: `Editó la información de ${changes.name}`
  });
}

export async function deleteStore(store: StoreRecord): Promise<void> {
  await deleteDoc(docRef('stores', store.id));

  await logAdminAction({
    action: 'store.updated',
    targetType: 'store',
    targetId: store.id,
    description: `Eliminó la tienda ${store.name}`
  });
}
