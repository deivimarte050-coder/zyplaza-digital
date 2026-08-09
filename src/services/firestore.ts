import {
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  increment,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import { getDb } from '../lib/firebase';
import { ChatMessage, Conversation, Listing, Review, Store, UserProfileData } from '../types';

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const FALLBACK_AVATAR =
  'https://ui-avatars.com/api/?background=FF6A00&color=000&name=U';

export function formatRelativeTime(ms: number): string {
  const diff = Date.now() - ms;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Ahora';
  if (minutes < 60) return `Hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Hace ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `Hace ${days} d`;
  return new Date(ms).toLocaleDateString('es-DO', { day: 'numeric', month: 'short' });
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : [];
}

/* ------------------------------------------------------------------ */
/* Conversores (Firestore -> tipos de la app)                          */
/* ------------------------------------------------------------------ */

function toUserProfile(id: string, data: Record<string, unknown>): UserProfileData {
  return {
    id,
    name: asString(data.name, 'Usuario'),
    email: asString(data.email) || undefined,
    phone: asString(data.phone) || undefined,
    city: asString(data.city, 'San Pedro de Macorís'),
    avatar: asString(data.avatar) || undefined,
    rating: asNumber(data.rating, 5),
    salesCount: asNumber(data.salesCount, 0),
    joinedDate: asString(data.joinedDate) || undefined,
    isVerified: data.isVerified === true,
    role: data.role === 'seller' ? 'seller' : 'buyer',
    storeId: asString(data.storeId) || undefined,
    favorites: asStringArray(data.favorites),
    status: data.status === 'suspended' ? 'suspended' : 'active',
  };
}

function toStore(id: string, data: Record<string, unknown>): Store {
  const socialsRaw = (data.socials ?? {}) as Record<string, unknown>;
  return {
    id,
    name: asString(data.name, 'Tienda'),
    slug: asString(data.slug, id),
    logo: asString(data.logo) || FALLBACK_AVATAR,
    coverImage: asString(data.coverImage),
    category: asString(data.category, 'General'),
    rating: asNumber(data.rating, 5),
    reviewsCount: asNumber(data.reviewsCount, 0),
    city: asString(data.city, 'San Pedro de Macorís'),
    province: asString(data.province) || undefined,
    address: asString(data.address),
    verified: data.verified === true,
    responseTime: asString(data.responseTime, '~30 minutos'),
    openingHours: asString(data.openingHours, 'Todos los días'),
    followersCount: asNumber(data.followersCount, 0),
    totalListings: asNumber(data.totalListings, 0),
    description: asString(data.description),
    ownerId: asString(data.ownerId) || undefined,
    ownerName: asString(data.ownerName) || undefined,
    ownerAvatar: asString(data.ownerAvatar) || undefined,
    whatsapp: asString(data.whatsapp) || undefined,
    phone: asString(data.phone) || undefined,
    email: asString(data.email) || undefined,
    socials: {
      facebook: asString(socialsRaw.facebook) || undefined,
      instagram: asString(socialsRaw.instagram) || undefined,
      twitter: asString(socialsRaw.twitter) || undefined,
    },
    status: (data.status as Store['status']) ?? 'active',
    sellerLevel: asString(data.sellerLevel, 'Nuevo Vendedor'),
    createdAt: asString(data.createdAt) || undefined,
    updatedAt: asString(data.updatedAt) || undefined,
  };
}

function toListing(id: string, data: Record<string, unknown>): Listing {
  return {
    id,
    title: asString(data.title, 'Artículo'),
    price: asNumber(data.price, 0),
    originalPrice: typeof data.originalPrice === 'number' ? data.originalPrice : undefined,
    category: asString(data.category, 'tech'),
    condition: (data.condition as Listing['condition']) ?? 'Nuevo',
    city: asString(data.city, 'San Pedro de Macorís'),
    sector: asString(data.sector) || undefined,
    distanceKm: asNumber(data.distanceKm, 0),
    storeId: asString(data.storeId) || undefined,
    sellerId: asString(data.sellerId) || undefined,
    sellerName: asString(data.sellerName, 'Vendedor'),
    sellerAvatar: asString(data.sellerAvatar) || FALLBACK_AVATAR,
    sellerRating: asNumber(data.sellerRating, 5),
    sellerSalesCount: asNumber(data.sellerSalesCount, 0),
    isVerifiedStore: data.isVerifiedStore === true,
    images: asStringArray(data.images),
    description: asString(data.description),
    tags: asStringArray(data.tags),
    stock: typeof data.stock === 'number' ? data.stock : undefined,
    isFlashOffer: data.isFlashOffer === true,
    flashEndTime: asString(data.flashEndTime) || undefined,
    viewsCount: asNumber(data.viewsCount, 0),
    likesCount: asNumber(data.likesCount, 0),
    createdAt: asString(data.createdAt, new Date().toISOString()),
    deliveryOption: (data.deliveryOption as Listing['deliveryOption']) ?? 'A Convenir',
    status: (data.status as Listing['status']) ?? 'active',
  };
}

function toReview(id: string, data: Record<string, unknown>): Review {
  return {
    id,
    targetId: asString(data.targetId),
    targetType: data.targetType === 'store' ? 'store' : 'listing',
    authorId: asString(data.authorId) || undefined,
    authorName: asString(data.authorName, 'Usuario'),
    authorAvatar: asString(data.authorAvatar) || undefined,
    rating: asNumber(data.rating, 5),
    comment: asString(data.comment),
    createdAt: asString(data.createdAt, 'Hace un momento'),
  };
}

function toConversation(id: string, data: Record<string, unknown>): Conversation {
  const unreadRaw = (data.unreadCounts ?? {}) as Record<string, unknown>;
  const unreadCounts: Record<string, number> = {};
  Object.keys(unreadRaw).forEach((k) => {
    unreadCounts[k] = asNumber(unreadRaw[k], 0);
  });

  const updatedAtMs = asNumber(data.updatedAtMs, Date.now());

  return {
    id,
    listingId: asString(data.listingId),
    listingTitle: asString(data.listingTitle, 'Artículo'),
    listingPrice: asNumber(data.listingPrice, 0),
    listingImage: asString(data.listingImage),
    participants: asStringArray(data.participants),
    buyerId: asString(data.buyerId),
    buyerName: asString(data.buyerName, 'Comprador'),
    buyerAvatar: asString(data.buyerAvatar) || FALLBACK_AVATAR,
    sellerId: asString(data.sellerId),
    sellerName: asString(data.sellerName, 'Vendedor'),
    sellerAvatar: asString(data.sellerAvatar) || FALLBACK_AVATAR,
    storeId: asString(data.storeId) || undefined,
    isVerifiedSeller: data.isVerifiedSeller === true,
    lastMessage: asString(data.lastMessage),
    lastMessageTime: formatRelativeTime(updatedAtMs),
    updatedAtMs,
    unreadCounts,
    meetingPoint: asString(data.meetingPoint) || undefined,
  };
}

function toChatMessage(id: string, conversationId: string, data: Record<string, unknown>): ChatMessage {
  const createdAtMs = asNumber(data.createdAtMs, Date.now());
  return {
    id,
    conversationId,
    senderId: asString(data.senderId),
    text: asString(data.text),
    createdAtMs,
    timestamp: formatRelativeTime(createdAtMs),
    isOffer: data.isOffer === true,
    offerAmount: typeof data.offerAmount === 'number' ? data.offerAmount : undefined,
    offerStatus: data.offerStatus as ChatMessage['offerStatus'],
    meetingPoint: asString(data.meetingPoint) || undefined,
  };
}

/* ------------------------------------------------------------------ */
/* Listeners en tiempo real                                            */
/* ------------------------------------------------------------------ */

/** Todas las tiendas activas (feed público). */
export function subscribeActiveStores(cb: (stores: Store[]) => void): Unsubscribe {
  const q = query(collection(getDb(), 'stores'), where('status', '==', 'active'));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => toStore(d.id, d.data())));
  });
}

/** Una tienda por id (por ejemplo, la del usuario aunque no esté activa). */
export function subscribeStore(storeId: string, cb: (store: Store | null) => void): Unsubscribe {
  return onSnapshot(doc(getDb(), 'stores', storeId), (snap) => {
    cb(snap.exists() ? toStore(snap.id, snap.data()) : null);
  });
}

/** Productos activos (feed público). */
export function subscribeActiveListings(cb: (listings: Listing[]) => void): Unsubscribe {
  const q = query(collection(getDb(), 'products'), where('status', '==', 'active'));
  return onSnapshot(q, (snap) => {
    const items = snap.docs.map((d) => toListing(d.id, d.data()));
    items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    cb(items);
  });
}

/** Todos los productos de un vendedor (panel y perfil), incluidos inactivos. */
export function subscribeSellerListings(sellerId: string, cb: (listings: Listing[]) => void): Unsubscribe {
  const q = query(collection(getDb(), 'products'), where('sellerId', '==', sellerId));
  return onSnapshot(q, (snap) => {
    const items = snap.docs.map((d) => toListing(d.id, d.data()));
    items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    cb(items);
  });
}

export function subscribeReviews(cb: (reviews: Review[]) => void): Unsubscribe {
  return onSnapshot(collection(getDb(), 'reviews'), (snap) => {
    cb(snap.docs.map((d) => toReview(d.id, d.data())));
  });
}

export function subscribeUserProfile(uid: string, cb: (user: UserProfileData | null) => void): Unsubscribe {
  return onSnapshot(doc(getDb(), 'users', uid), (snap) => {
    cb(snap.exists() ? toUserProfile(snap.id, snap.data()) : null);
  });
}

export function subscribeConversations(uid: string, cb: (convs: Conversation[]) => void): Unsubscribe {
  const q = query(collection(getDb(), 'conversations'), where('participants', 'array-contains', uid));
  return onSnapshot(q, (snap) => {
    const convs = snap.docs.map((d) => toConversation(d.id, d.data()));
    convs.sort((a, b) => b.updatedAtMs - a.updatedAtMs);
    cb(convs);
  });
}

export function subscribeMessages(conversationId: string, cb: (msgs: ChatMessage[]) => void): Unsubscribe {
  const q = query(
    collection(getDb(), 'conversations', conversationId, 'messages'),
    orderBy('createdAtMs', 'asc')
  );
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => toChatMessage(d.id, conversationId, d.data())));
  });
}

/** Genera el id de un documento nuevo sin escribirlo todavía. */
export function newDocId(collectionName: string): string {
  return doc(collection(getDb(), collectionName)).id;
}

/* ------------------------------------------------------------------ */
/* Usuarios                                                            */
/* ------------------------------------------------------------------ */

export async function getUserProfile(uid: string): Promise<UserProfileData | null> {
  const snap = await getDoc(doc(getDb(), 'users', uid));
  return snap.exists() ? toUserProfile(snap.id, snap.data()) : null;
}

export async function createUserProfile(user: UserProfileData): Promise<void> {
  await setDoc(doc(getDb(), 'users', user.id), {
    name: user.name,
    email: user.email ?? '',
    phone: user.phone ?? '',
    city: user.city,
    avatar: user.avatar ?? '',
    rating: user.rating ?? 5,
    salesCount: user.salesCount ?? 0,
    joinedDate: user.joinedDate ?? new Date().toLocaleDateString('es-DO', { month: 'long', year: 'numeric' }),
    isVerified: user.isVerified ?? false,
    role: user.role ?? 'buyer',
    storeId: user.storeId ?? '',
    favorites: user.favorites ?? [],
    status: 'active',
    createdAt: new Date().toISOString(),
  });
}

export async function updateUserProfile(uid: string, data: Partial<UserProfileData>): Promise<void> {
  await updateDoc(doc(getDb(), 'users', uid), { ...data, updatedAt: new Date().toISOString() });
}

/** Sigue o deja de seguir una tienda y ajusta su contador de seguidores. */
export async function toggleFollowStore(uid: string, storeId: string, isFollowing: boolean): Promise<void> {
  const db = getDb();
  await updateDoc(doc(db, 'users', uid), {
    followingStores: isFollowing ? arrayRemove(storeId) : arrayUnion(storeId),
  });
  await updateDoc(doc(db, 'stores', storeId), {
    followersCount: increment(isFollowing ? -1 : 1),
  }).catch(() => undefined);
}

/* ------------------------------------------------------------------ */
/* Tiendas                                                             */
/* ------------------------------------------------------------------ */

export async function createStoreDoc(store: Store): Promise<string> {
  const id = store.id && store.id !== 'new' ? store.id : newDocId('stores');
  const { id: _ignored, ...rest } = store;
  void _ignored;
  await setDoc(doc(getDb(), 'stores', id), { ...rest, id });
  return id;
}

export async function updateStoreDoc(storeId: string, data: Partial<Store>): Promise<void> {
  const { id: _ignored, ...rest } = data as Store;
  void _ignored;
  await updateDoc(doc(getDb(), 'stores', storeId), { ...rest, updatedAt: new Date().toISOString() });
}

/* ------------------------------------------------------------------ */
/* Productos                                                           */
/* ------------------------------------------------------------------ */

export async function createListingDoc(listing: Listing): Promise<string> {
  const id = listing.id && listing.id !== 'new' ? listing.id : newDocId('products');
  const { id: _ignored, ...rest } = listing;
  void _ignored;
  await setDoc(doc(getDb(), 'products', id), { ...rest, id });
  if (listing.storeId) {
    await updateDoc(doc(getDb(), 'stores', listing.storeId), { totalListings: increment(1) }).catch(() => undefined);
  }
  return id;
}

export async function updateListingDoc(listingId: string, data: Partial<Listing>): Promise<void> {
  const { id: _ignored, ...rest } = data as Listing;
  void _ignored;
  await updateDoc(doc(getDb(), 'products', listingId), { ...rest, updatedAt: new Date().toISOString() });
}

export async function deleteListingDoc(listing: Listing): Promise<void> {
  await deleteDoc(doc(getDb(), 'products', listing.id));
  if (listing.storeId) {
    await updateDoc(doc(getDb(), 'stores', listing.storeId), { totalListings: increment(-1) }).catch(() => undefined);
  }
}

export async function incrementListingViews(listingId: string): Promise<void> {
  await updateDoc(doc(getDb(), 'products', listingId), { viewsCount: increment(1) }).catch(() => undefined);
}

/* ------------------------------------------------------------------ */
/* Reseñas                                                             */
/* ------------------------------------------------------------------ */

export async function addReviewDoc(review: Omit<Review, 'id' | 'createdAt'>): Promise<void> {
  await addDoc(collection(getDb(), 'reviews'), {
    ...review,
    createdAt: 'Hace un momento',
    createdAtMs: Date.now(),
  });
}

/* ------------------------------------------------------------------ */
/* Chat                                                                */
/* ------------------------------------------------------------------ */

export async function findConversation(buyerId: string, listingId: string): Promise<Conversation | null> {
  const q = query(
    collection(getDb(), 'conversations'),
    where('buyerId', '==', buyerId),
    where('listingId', '==', listingId)
  );
  const snap = await getDocs(q);
  const first = snap.docs[0];
  return first ? toConversation(first.id, first.data()) : null;
}

export async function createConversationDoc(conv: Omit<Conversation, 'id' | 'lastMessageTime'>): Promise<string> {
  const ref = doc(collection(getDb(), 'conversations'));
  await setDoc(ref, { ...conv, id: ref.id, createdAt: serverTimestamp() });
  return ref.id;
}

export async function sendChatMessage(
  conversation: Conversation,
  senderId: string,
  text: string,
  isOffer?: boolean,
  offerAmount?: number
): Promise<void> {
  const now = Date.now();
  const otherId = conversation.participants.find((p) => p !== senderId) ?? '';

  await addDoc(collection(getDb(), 'conversations', conversation.id, 'messages'), {
    senderId,
    text,
    createdAtMs: now,
    isOffer: isOffer ?? false,
    offerAmount: offerAmount ?? null,
    offerStatus: isOffer ? 'pending' : null,
  });

  const updates: Record<string, unknown> = {
    lastMessage: text,
    updatedAtMs: now,
  };
  if (otherId) {
    updates[`unreadCounts.${otherId}`] = increment(1);
  }
  await updateDoc(doc(getDb(), 'conversations', conversation.id), updates);
}

export async function markConversationRead(conversationId: string, uid: string): Promise<void> {
  await updateDoc(doc(getDb(), 'conversations', conversationId), {
    [`unreadCounts.${uid}`]: 0,
  }).catch(() => undefined);
}
