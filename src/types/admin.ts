export type UserRole = 'user' | 'seller' | 'admin';
export type AccountStatus = 'active' | 'suspended';
export type StoreStatus = 'pending' | 'approved' | 'rejected' | 'suspended';
export type ProductStatus = 'pending' | 'approved' | 'rejected';
export type OrderStatus = 'new' | 'preparing' | 'shipped' | 'delivered' | 'cancelled';
export type BannerSlot = 'main' | 'secondary';

/** Documento de la colección `users` */
export interface AdminUserRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  avatar: string;
  role: UserRole;
  status: AccountStatus;
  mustChangePassword: boolean;
  createdAt: Date | null;
  updatedAt: Date | null;
  lastLoginAt: Date | null;
}

/** Documento de la colección `stores` (vendedores) */
export interface StoreRecord {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  city: string;
  phone: string;
  logoUrl: string;
  status: StoreStatus;
  rejectionReason: string;
  commissionRate: number | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

/** Documento de la colección `products` */
export interface ProductRecord {
  id: string;
  storeId: string;
  storeName: string;
  ownerId: string;
  title: string;
  description: string;
  price: number;
  stock: number;
  categoryId: string;
  imageUrl: string;
  status: ProductStatus;
  rejectionReason: string;
  featured: boolean;
  hidden: boolean;
  soldCount: number;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface OrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
}

export interface OrderStatusChange {
  status: OrderStatus;
  changedAt: Date | null;
  changedBy: string;
  note: string;
}

/** Documento de la colección `orders` */
export interface OrderRecord {
  id: string;
  code: string;
  buyerId: string;
  buyerName: string;
  storeId: string;
  storeName: string;
  items: OrderItem[];
  subtotal: number;
  commission: number;
  total: number;
  status: OrderStatus;
  paymentMethod: string;
  history: OrderStatusChange[];
  createdAt: Date | null;
  updatedAt: Date | null;
}

/** Documento de la colección `banners` */
export interface BannerRecord {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl: string;
  slot: BannerSlot;
  active: boolean;
  order: number;
  createdAt: Date | null;
  updatedAt: Date | null;
}

/** Documento de la colección `categories` */
export interface CategoryRecord {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  icon: string;
  order: number;
  active: boolean;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface PaymentMethodSetting {
  id: string;
  label: string;
  enabled: boolean;
}

/** Documento único `settings/general` */
export interface SettingsRecord {
  siteName: string;
  logoUrl: string;
  commissionRate: number;
  whatsapp: string;
  supportEmail: string;
  facebook: string;
  instagram: string;
  tiktok: string;
  paymentMethods: PaymentMethodSetting[];
  maintenanceMode: boolean;
  maintenanceMessage: string;
  updatedAt: Date | null;
}

export type AuditAction =
  | 'admin.login'
  | 'admin.logout'
  | 'admin.password_changed'
  | 'user.updated'
  | 'user.suspended'
  | 'user.reactivated'
  | 'user.deleted'
  | 'user.role_changed'
  | 'store.approved'
  | 'store.rejected'
  | 'store.suspended'
  | 'store.reactivated'
  | 'store.updated'
  | 'product.approved'
  | 'product.rejected'
  | 'product.updated'
  | 'product.deleted'
  | 'product.featured'
  | 'product.hidden'
  | 'order.status_changed'
  | 'order.cancelled'
  | 'banner.created'
  | 'banner.updated'
  | 'banner.deleted'
  | 'category.created'
  | 'category.updated'
  | 'category.deleted'
  | 'settings.updated';

/** Documento de la colección `adminLogs` */
export interface AuditLogRecord {
  id: string;
  actorId: string;
  actorEmail: string;
  action: AuditAction;
  targetType: string;
  targetId: string;
  description: string;
  createdAt: Date | null;
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  new: 'Nuevo',
  preparing: 'Preparando',
  shipped: 'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado'
};

export const STORE_STATUS_LABELS: Record<StoreStatus, string> = {
  pending: 'Pendiente',
  approved: 'Aprobada',
  rejected: 'Rechazada',
  suspended: 'Suspendida'
};

export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  pending: 'Pendiente',
  approved: 'Aprobado',
  rejected: 'Rechazado'
};

export const ROLE_LABELS: Record<UserRole, string> = {
  user: 'Comprador',
  seller: 'Vendedor',
  admin: 'Administrador'
};

export const ACCOUNT_STATUS_LABELS: Record<AccountStatus, string> = {
  active: 'Activo',
  suspended: 'Suspendido'
};

export const AUDIT_ACTION_LABELS: Record<AuditAction, string> = {
  'admin.login': 'Inició sesión',
  'admin.logout': 'Cerró sesión',
  'admin.password_changed': 'Cambió su contraseña',
  'user.updated': 'Editó un usuario',
  'user.suspended': 'Suspendió un usuario',
  'user.reactivated': 'Reactivó un usuario',
  'user.deleted': 'Eliminó un usuario',
  'user.role_changed': 'Cambió el rol de un usuario',
  'store.approved': 'Aprobó una tienda',
  'store.rejected': 'Rechazó una tienda',
  'store.suspended': 'Suspendió una tienda',
  'store.reactivated': 'Reactivó una tienda',
  'store.updated': 'Editó una tienda',
  'product.approved': 'Aprobó un producto',
  'product.rejected': 'Rechazó un producto',
  'product.updated': 'Editó un producto',
  'product.deleted': 'Eliminó un producto',
  'product.featured': 'Destacó un producto',
  'product.hidden': 'Ocultó un producto',
  'order.status_changed': 'Cambió el estado de un pedido',
  'order.cancelled': 'Canceló un pedido',
  'banner.created': 'Creó un banner',
  'banner.updated': 'Editó un banner',
  'banner.deleted': 'Eliminó un banner',
  'category.created': 'Creó una categoría',
  'category.updated': 'Editó una categoría',
  'category.deleted': 'Eliminó una categoría',
  'settings.updated': 'Actualizó la configuración'
};
