import {
  arrayUnion,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc
} from 'firebase/firestore';
import { collectionRef, docRef, toDate, toEnum, toNumber, toText } from '../lib/collections';
import { getFirebaseAuth } from '../lib/firebase';
import type { OrderItem, OrderRecord, OrderStatus, OrderStatusChange } from '../types/admin';
import { ORDER_STATUS_LABELS } from '../types/admin';
import { logAdminAction } from './audit';

const STATUSES: readonly OrderStatus[] = [
  'new',
  'preparing',
  'shipped',
  'delivered',
  'cancelled'
];

function mapItems(value: unknown): OrderItem[] {
  if (!Array.isArray(value)) return [];

  return value.map((raw) => {
    const item = (raw ?? {}) as Record<string, unknown>;
    return {
      productId: toText(item.productId),
      title: toText(item.title, 'Producto'),
      price: toNumber(item.price),
      quantity: toNumber(item.quantity, 1)
    };
  });
}

function mapHistory(value: unknown): OrderStatusChange[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((raw) => {
      const entry = (raw ?? {}) as Record<string, unknown>;
      return {
        status: toEnum(entry.status, STATUSES, 'new'),
        changedAt: toDate(entry.changedAt),
        changedBy: toText(entry.changedBy),
        note: toText(entry.note)
      };
    })
    .sort((a, b) => (a.changedAt?.getTime() ?? 0) - (b.changedAt?.getTime() ?? 0));
}

export function mapOrder(id: string, data: Record<string, unknown>): OrderRecord {
  const items = mapItems(data.items);
  const subtotal = toNumber(
    data.subtotal,
    items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  );
  const commission = toNumber(data.commission);

  return {
    id,
    code: toText(data.code, id.slice(0, 6).toUpperCase()),
    buyerId: toText(data.buyerId),
    buyerName: toText(data.buyerName, 'Comprador'),
    storeId: toText(data.storeId),
    storeName: toText(data.storeName, 'Tienda'),
    items,
    subtotal,
    commission,
    total: toNumber(data.total, subtotal),
    status: toEnum(data.status, STATUSES, 'new'),
    paymentMethod: toText(data.paymentMethod, 'No especificado'),
    history: mapHistory(data.history),
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt)
  };
}

export function subscribeOrders(
  onData: (orders: OrderRecord[]) => void,
  onError: (error: unknown) => void
): () => void {
  const ordersQuery = query(collectionRef('orders'), orderBy('createdAt', 'desc'));

  return onSnapshot(
    ordersQuery,
    (snapshot) => onData(snapshot.docs.map((entry) => mapOrder(entry.id, entry.data()))),
    onError
  );
}

export async function fetchOrder(id: string): Promise<OrderRecord | null> {
  const snapshot = await getDoc(docRef('orders', id));
  return snapshot.exists() ? mapOrder(snapshot.id, snapshot.data()) : null;
}

/**
 * Cambia el estado de un pedido y deja constancia en su historial.
 * `arrayUnion` no admite serverTimestamp, por eso el historial usa Timestamp.now().
 */
export async function changeOrderStatus(
  order: OrderRecord,
  status: OrderStatus,
  note = ''
): Promise<void> {
  const actor = getFirebaseAuth().currentUser?.email ?? 'administrador';

  await updateDoc(docRef('orders', order.id), {
    status,
    updatedAt: serverTimestamp(),
    history: arrayUnion({
      status,
      changedAt: Timestamp.now(),
      changedBy: actor,
      note
    })
  });

  await logAdminAction({
    action: status === 'cancelled' ? 'order.cancelled' : 'order.status_changed',
    targetType: 'order',
    targetId: order.id,
    description: `Pedido ${order.code}: ${ORDER_STATUS_LABELS[order.status]} → ${ORDER_STATUS_LABELS[status]}`
  });
}
