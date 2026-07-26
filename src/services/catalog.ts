import {
  addDoc,
  deleteDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  writeBatch
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
import { getDb } from '../lib/firebase';
import type { BannerRecord, BannerSlot, CategoryRecord } from '../types/admin';
import { logAdminAction } from './audit';

const SLOTS: readonly BannerSlot[] = ['main', 'secondary'];

/* ---------------------------------- Banners --------------------------------- */

export function mapBanner(id: string, data: Record<string, unknown>): BannerRecord {
  return {
    id,
    title: toText(data.title, 'Banner sin título'),
    imageUrl: toText(data.imageUrl),
    linkUrl: toText(data.linkUrl),
    slot: toEnum(data.slot, SLOTS, 'secondary'),
    active: toBoolean(data.active, true),
    order: toNumber(data.order),
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt)
  };
}

export function subscribeBanners(
  onData: (banners: BannerRecord[]) => void,
  onError: (error: unknown) => void
): () => void {
  const bannersQuery = query(collectionRef('banners'), orderBy('order', 'asc'));

  return onSnapshot(
    bannersQuery,
    (snapshot) => onData(snapshot.docs.map((entry) => mapBanner(entry.id, entry.data()))),
    onError
  );
}

export type BannerInput = Pick<
  BannerRecord,
  'title' | 'imageUrl' | 'linkUrl' | 'slot' | 'active' | 'order'
>;

export async function createBanner(input: BannerInput): Promise<void> {
  const created = await addDoc(collectionRef('banners'), {
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  await logAdminAction({
    action: 'banner.created',
    targetType: 'banner',
    targetId: created.id,
    description: `Creó el banner ${input.title}`
  });
}

export async function updateBanner(id: string, input: BannerInput): Promise<void> {
  await updateDoc(docRef('banners', id), { ...input, updatedAt: serverTimestamp() });

  await logAdminAction({
    action: 'banner.updated',
    targetType: 'banner',
    targetId: id,
    description: `Editó el banner ${input.title}`
  });
}

export async function setBannerActive(banner: BannerRecord, active: boolean): Promise<void> {
  await updateDoc(docRef('banners', banner.id), { active, updatedAt: serverTimestamp() });

  await logAdminAction({
    action: 'banner.updated',
    targetType: 'banner',
    targetId: banner.id,
    description: `${active ? 'Activó' : 'Desactivó'} el banner ${banner.title}`
  });
}

export async function deleteBanner(banner: BannerRecord): Promise<void> {
  await deleteDoc(docRef('banners', banner.id));

  await logAdminAction({
    action: 'banner.deleted',
    targetType: 'banner',
    targetId: banner.id,
    description: `Eliminó el banner ${banner.title}`
  });
}

/* -------------------------------- Categorías -------------------------------- */

export function mapCategory(id: string, data: Record<string, unknown>): CategoryRecord {
  const parentId = toText(data.parentId);

  return {
    id,
    name: toText(data.name, 'Categoría'),
    slug: toText(data.slug),
    parentId: parentId || null,
    icon: toText(data.icon),
    order: toNumber(data.order),
    active: toBoolean(data.active, true),
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt)
  };
}

export function subscribeCategories(
  onData: (categories: CategoryRecord[]) => void,
  onError: (error: unknown) => void
): () => void {
  const categoriesQuery = query(collectionRef('categories'), orderBy('order', 'asc'));

  return onSnapshot(
    categoriesQuery,
    (snapshot) => onData(snapshot.docs.map((entry) => mapCategory(entry.id, entry.data()))),
    onError
  );
}

export function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export type CategoryInput = Pick<
  CategoryRecord,
  'name' | 'slug' | 'parentId' | 'icon' | 'order' | 'active'
>;

export async function createCategory(input: CategoryInput): Promise<void> {
  const created = await addDoc(collectionRef('categories'), {
    ...input,
    parentId: input.parentId ?? '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  await logAdminAction({
    action: 'category.created',
    targetType: 'category',
    targetId: created.id,
    description: `Creó la categoría ${input.name}`
  });
}

export async function updateCategory(id: string, input: CategoryInput): Promise<void> {
  await updateDoc(docRef('categories', id), {
    ...input,
    parentId: input.parentId ?? '',
    updatedAt: serverTimestamp()
  });

  await logAdminAction({
    action: 'category.updated',
    targetType: 'category',
    targetId: id,
    description: `Editó la categoría ${input.name}`
  });
}

export async function deleteCategory(category: CategoryRecord): Promise<void> {
  await deleteDoc(docRef('categories', category.id));

  await logAdminAction({
    action: 'category.deleted',
    targetType: 'category',
    targetId: category.id,
    description: `Eliminó la categoría ${category.name}`
  });
}

/** Reescribe el campo `order` de varios banners en una sola operación atómica */
export async function reorderBanners(ordered: BannerRecord[]): Promise<void> {
  const batch = writeBatch(getDb());

  ordered.forEach((banner, index) => {
    batch.update(docRef('banners', banner.id), { order: index, updatedAt: serverTimestamp() });
  });

  await batch.commit();
}

/** Reescribe el campo `order` de varias categorías en una sola operación atómica */
export async function reorderCategories(ordered: CategoryRecord[]): Promise<void> {
  const batch = writeBatch(getDb());

  ordered.forEach((category, index) => {
    batch.update(docRef('categories', category.id), { order: index, updatedAt: serverTimestamp() });
  });

  await batch.commit();
}
