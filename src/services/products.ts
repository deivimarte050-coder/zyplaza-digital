import {
  deleteDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc
} from 'firebase/firestore';
import {
  collectionRef,
  docRef,
  toBoolean,
  toDate,
  toEnum,
  toNumber,
  toText
} from '../lib/collections';
import type { ProductRecord, ProductStatus } from '../types/admin';
import { logAdminAction } from './audit';

const STATUSES: readonly ProductStatus[] = ['pending', 'approved', 'rejected'];

export function mapProduct(id: string, data: Record<string, unknown>): ProductRecord {
  return {
    id,
    storeId: toText(data.storeId),
    storeName: toText(data.storeName, 'Tienda desconocida'),
    ownerId: toText(data.ownerId),
    title: toText(data.title, 'Producto sin título'),
    description: toText(data.description),
    price: toNumber(data.price),
    stock: toNumber(data.stock),
    categoryId: toText(data.categoryId),
    imageUrl: toText(data.imageUrl),
    status: toEnum(data.status, STATUSES, 'pending'),
    rejectionReason: toText(data.rejectionReason),
    featured: toBoolean(data.featured),
    hidden: toBoolean(data.hidden),
    soldCount: toNumber(data.soldCount),
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt)
  };
}

export function subscribeProducts(
  onData: (products: ProductRecord[]) => void,
  onError: (error: unknown) => void
): () => void {
  const productsQuery = query(collectionRef('products'), orderBy('createdAt', 'desc'));

  return onSnapshot(
    productsQuery,
    (snapshot) => onData(snapshot.docs.map((entry) => mapProduct(entry.id, entry.data()))),
    onError
  );
}

export async function approveProduct(product: ProductRecord): Promise<void> {
  await updateDoc(docRef('products', product.id), {
    status: 'approved',
    rejectionReason: '',
    updatedAt: serverTimestamp()
  });

  await logAdminAction({
    action: 'product.approved',
    targetType: 'product',
    targetId: product.id,
    description: `Aprobó el producto ${product.title}`
  });
}

export async function rejectProduct(product: ProductRecord, reason: string): Promise<void> {
  await updateDoc(docRef('products', product.id), {
    status: 'rejected',
    rejectionReason: reason,
    updatedAt: serverTimestamp()
  });

  await logAdminAction({
    action: 'product.rejected',
    targetType: 'product',
    targetId: product.id,
    description: `Rechazó el producto ${product.title}: ${reason}`
  });
}

export async function updateProduct(
  product: ProductRecord,
  changes: Pick<ProductRecord, 'title' | 'description' | 'price' | 'stock' | 'categoryId'>
): Promise<void> {
  await updateDoc(docRef('products', product.id), { ...changes, updatedAt: serverTimestamp() });

  await logAdminAction({
    action: 'product.updated',
    targetType: 'product',
    targetId: product.id,
    description: `Editó el producto ${changes.title}`
  });
}

export async function setProductFeatured(product: ProductRecord, featured: boolean): Promise<void> {
  await updateDoc(docRef('products', product.id), { featured, updatedAt: serverTimestamp() });

  await logAdminAction({
    action: 'product.featured',
    targetType: 'product',
    targetId: product.id,
    description: `${featured ? 'Destacó' : 'Quitó de destacados'} el producto ${product.title}`
  });
}

export async function setProductHidden(product: ProductRecord, hidden: boolean): Promise<void> {
  await updateDoc(docRef('products', product.id), { hidden, updatedAt: serverTimestamp() });

  await logAdminAction({
    action: 'product.hidden',
    targetType: 'product',
    targetId: product.id,
    description: `${hidden ? 'Ocultó' : 'Mostró'} el producto ${product.title}`
  });
}

export async function deleteProduct(product: ProductRecord): Promise<void> {
  await deleteDoc(docRef('products', product.id));

  await logAdminAction({
    action: 'product.deleted',
    targetType: 'product',
    targetId: product.id,
    description: `Eliminó el producto ${product.title}`
  });
}
