import React, { useMemo, useState } from 'react';
import {
  Check,
  Package,
  Pencil,
  Power,
  Search,
  ShoppingCart,
  Store as StoreIcon,
  X
} from 'lucide-react';
import {
  STORE_STATUS_LABELS,
  type OrderRecord,
  type ProductRecord,
  type StoreRecord,
  type StoreStatus
} from '../../types/admin';
import {
  approveStore,
  rejectStore,
  setStoreStatus,
  subscribeStores,
  updateStore
} from '../../services/stores';
import { subscribeProducts } from '../../services/products';
import { subscribeOrders } from '../../services/orders';
import { useAsyncAction, useFirestoreSubscription, useToasts } from '../hooks/useAdminData';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  Field,
  Input,
  LoadingState,
  Modal,
  PageHeader,
  Select,
  Textarea,
  ToastStack,
  type BadgeTone
} from '../components/ui';
import { formatCurrency, formatDate, formatNumber } from '../utils/format';

type StatusFilter = 'all' | StoreStatus;

const STATUS_TONES: Record<StoreStatus, BadgeTone> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
  suspended: 'danger'
};

interface EditForm {
  name: string;
  description: string;
  city: string;
  phone: string;
  commissionRate: string;
}

const emptyForm: EditForm = {
  name: '',
  description: '',
  city: '',
  phone: '',
  commissionRate: ''
};

const SellersPage: React.FC = () => {
  const { toasts, dismissToast, notifySuccess, notifyError } = useToasts();
  const { isPending, run } = useAsyncAction();

  const stores = useFirestoreSubscription<StoreRecord[]>(subscribeStores, []);
  const products = useFirestoreSubscription<ProductRecord[]>(subscribeProducts, []);
  const orders = useFirestoreSubscription<OrderRecord[]>(subscribeOrders, []);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const [editing, setEditing] = useState<StoreRecord | null>(null);
  const [form, setForm] = useState<EditForm>(emptyForm);
  const [formErrors, setFormErrors] = useState<Partial<EditForm>>({});
  const [saving, setSaving] = useState(false);

  const [rejecting, setRejecting] = useState<StoreRecord | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectError, setRejectError] = useState('');

  const [detail, setDetail] = useState<StoreRecord | null>(null);

  /** Resume productos, pedidos y ventas de cada tienda */
  const statsByStore = useMemo(() => {
    const map = new Map<string, { products: number; orders: number; sales: number }>();

    products.data.forEach((product) => {
      const entry = map.get(product.storeId) ?? { products: 0, orders: 0, sales: 0 };
      entry.products += 1;
      map.set(product.storeId, entry);
    });

    orders.data.forEach((order) => {
      const entry = map.get(order.storeId) ?? { products: 0, orders: 0, sales: 0 };
      entry.orders += 1;
      if (order.status !== 'cancelled') entry.sales += order.total;
      map.set(order.storeId, entry);
    });

    return map;
  }, [products.data, orders.data]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    return stores.data.filter((store) => {
      if (statusFilter !== 'all' && store.status !== statusFilter) return false;
      if (!term) return true;

      return (
        store.name.toLowerCase().includes(term) ||
        store.city.toLowerCase().includes(term) ||
        store.phone.includes(term)
      );
    });
  }, [stores.data, search, statusFilter]);

  const pendingCount = useMemo(
    () => stores.data.filter((store) => store.status === 'pending').length,
    [stores.data]
  );

  const openEdit = (store: StoreRecord) => {
    setEditing(store);
    setForm({
      name: store.name,
      description: store.description,
      city: store.city,
      phone: store.phone,
      commissionRate: store.commissionRate === null ? '' : String(store.commissionRate)
    });
    setFormErrors({});
  };

  const validateForm = (): boolean => {
    const errors: Partial<EditForm> = {};

    if (form.name.trim().length < 3) errors.name = 'El nombre debe tener al menos 3 caracteres.';

    if (form.commissionRate.trim()) {
      const value = Number(form.commissionRate);
      if (!Number.isFinite(value) || value < 0 || value > 100) {
        errors.commissionRate = 'La comisión debe ser un número entre 0 y 100.';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editing || !validateForm()) return;

    setSaving(true);

    try {
      await updateStore(editing, {
        name: form.name.trim(),
        description: form.description.trim(),
        city: form.city.trim(),
        phone: form.phone.trim(),
        commissionRate: form.commissionRate.trim() ? Number(form.commissionRate) : null
      });

      notifySuccess('La tienda se actualizó.');
      setEditing(null);
    } catch (saveError) {
      notifyError(saveError);
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = (store: StoreRecord) =>
    run(`approve-${store.id}`, async () => {
      try {
        await approveStore(store);
        notifySuccess(`${store.name} ya puede vender en Zyplaza.`);
      } catch (approveError) {
        notifyError(approveError);
      }
    });

  const handleReject = () => {
    if (!rejecting) return;

    if (rejectReason.trim().length < 5) {
      setRejectError('Explica en pocas palabras por qué la rechazas.');
      return;
    }

    return run(`reject-${rejecting.id}`, async () => {
      try {
        await rejectStore(rejecting, rejectReason.trim());
        notifySuccess(`Se rechazó la solicitud de ${rejecting.name}.`);
        setRejecting(null);
        setRejectReason('');
        setRejectError('');
      } catch (error) {
        notifyError(error);
      }
    });
  };

  const handleToggleStatus = (store: StoreRecord) => {
    const nextStatus: StoreStatus = store.status === 'suspended' ? 'approved' : 'suspended';

    return run(`toggle-${store.id}`, async () => {
      try {
        await setStoreStatus(store, nextStatus);
        notifySuccess(
          nextStatus === 'suspended'
            ? `${store.name} quedó suspendida.`
            : `${store.name} vuelve a estar activa.`
        );
      } catch (error) {
        notifyError(error);
      }
    });
  };

  const loading = stores.loading;

  return (
    <>
      <PageHeader
        title="Vendedores"
        description="Solicitudes de tienda y control de los negocios que venden en Zyplaza"
      />

      {pendingCount > 0 ? (
        <Card className="mb-4 border-amber-300 bg-amber-50 p-4 dark:border-amber-500/40 dark:bg-amber-500/10">
          <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
            Tienes {pendingCount} {pendingCount === 1 ? 'solicitud' : 'solicitudes'} esperando tu
            respuesta.
          </p>
          <button
            type="button"
            onClick={() => setStatusFilter('pending')}
            className="mt-1 text-xs font-semibold text-amber-800 underline dark:text-amber-300"
          >
            Ver solo las pendientes
          </button>
        </Card>
      ) : null}

      <Card className="mb-4 p-3">
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nombre, ciudad o teléfono"
              className="pl-9"
              aria-label="Buscar tiendas"
            />
          </div>

          <Select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
            aria-label="Filtrar por estado"
            className="sm:w-48"
          >
            <option value="all">Todos los estados</option>
            <option value="pending">Pendientes</option>
            <option value="approved">Aprobadas</option>
            <option value="rejected">Rechazadas</option>
            <option value="suspended">Suspendidas</option>
          </Select>
        </div>
      </Card>

      {loading ? (
        <Card>
          <LoadingState label="Cargando tiendas…" />
        </Card>
      ) : stores.error ? (
        <Card>
          <ErrorState message={stores.error} onRetry={stores.retry} />
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            title={stores.data.length === 0 ? 'Aún no hay tiendas' : 'Sin resultados'}
            description={
              stores.data.length === 0
                ? 'Cuando un usuario solicite abrir su tienda, aparecerá aquí para que la revises.'
                : 'Prueba con otro término o cambia el filtro de estado.'
            }
            icon={<StoreIcon className="h-6 w-6" />}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((store) => {
            const stats = statsByStore.get(store.id) ?? { products: 0, orders: 0, sales: 0 };

            return (
              <Card key={store.id} className="flex flex-col p-4">
                <div className="flex items-start gap-3">
                  {store.logoUrl ? (
                    <img
                      src={store.logoUrl}
                      alt={store.name}
                      className="h-11 w-11 shrink-0 rounded-lg object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-300">
                      <StoreIcon className="h-5 w-5" />
                    </span>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-slate-900 dark:text-white">
                      {store.name}
                    </p>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                      {store.city || 'Sin ciudad'} · {store.phone || 'Sin teléfono'}
                    </p>
                    <div className="mt-1.5">
                      <Badge tone={STATUS_TONES[store.status]}>
                        {STORE_STATUS_LABELS[store.status]}
                      </Badge>
                    </div>
                  </div>
                </div>

                {store.status === 'rejected' && store.rejectionReason ? (
                  <p className="mt-3 rounded-lg bg-red-50 p-2 text-xs text-red-700 dark:bg-red-500/10 dark:text-red-300">
                    Motivo: {store.rejectionReason}
                  </p>
                ) : null}

                <dl className="mt-3 grid grid-cols-3 gap-2 rounded-lg bg-slate-50 p-2.5 text-center dark:bg-white/5">
                  <div>
                    <dt className="text-xs text-slate-500 dark:text-slate-400">Productos</dt>
                    <dd className="text-sm font-bold text-slate-900 dark:text-white">
                      {formatNumber(stats.products)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500 dark:text-slate-400">Pedidos</dt>
                    <dd className="text-sm font-bold text-slate-900 dark:text-white">
                      {formatNumber(stats.orders)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500 dark:text-slate-400">Ventas</dt>
                    <dd className="text-sm font-bold text-slate-900 dark:text-white">
                      {formatCurrency(stats.sales)}
                    </dd>
                  </div>
                </dl>

                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  Solicitada el {formatDate(store.createdAt)}
                </p>

                <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-200 pt-3 dark:border-white/10">
                  {store.status === 'pending' ? (
                    <>
                      <Button
                        variant="success"
                        loading={isPending(`approve-${store.id}`)}
                        onClick={() => handleApprove(store)}
                        icon={<Check className="h-4 w-4" />}
                      >
                        Aprobar
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => {
                          setRejecting(store);
                          setRejectReason('');
                          setRejectError('');
                        }}
                        icon={<X className="h-4 w-4" />}
                      >
                        Rechazar
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant={store.status === 'suspended' ? 'success' : 'secondary'}
                      loading={isPending(`toggle-${store.id}`)}
                      onClick={() => handleToggleStatus(store)}
                      icon={<Power className="h-4 w-4" />}
                    >
                      {store.status === 'suspended' ? 'Reactivar' : 'Suspender'}
                    </Button>
                  )}

                  <Button
                    variant="secondary"
                    onClick={() => openEdit(store)}
                    icon={<Pencil className="h-4 w-4" />}
                  >
                    Editar
                  </Button>

                  <Button variant="ghost" onClick={() => setDetail(store)}>
                    Ver detalle
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        open={editing !== null}
        title="Editar tienda"
        description="Actualiza los datos del negocio y su comisión personalizada."
        onClose={() => setEditing(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditing(null)}>
              Cancelar
            </Button>
            <Button form="store-edit-form" type="submit" loading={saving}>
              Guardar cambios
            </Button>
          </>
        }
      >
        <form id="store-edit-form" onSubmit={handleSave} noValidate className="space-y-4">
          <Field label="Nombre de la tienda" error={formErrors.name}>
            <Input
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              autoFocus
            />
          </Field>

          <Field label="Descripción">
            <Textarea
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Ciudad">
              <Input
                value={form.city}
                onChange={(event) => setForm({ ...form, city: event.target.value })}
              />
            </Field>

            <Field label="Teléfono">
              <Input
                value={form.phone}
                onChange={(event) => setForm({ ...form, phone: event.target.value })}
              />
            </Field>
          </div>

          <Field
            label="Comisión personalizada (%)"
            error={formErrors.commissionRate}
            hint="Déjalo vacío para usar la comisión general de Zyplaza."
          >
            <Input
              type="number"
              min={0}
              max={100}
              step={0.5}
              value={form.commissionRate}
              onChange={(event) => setForm({ ...form, commissionRate: event.target.value })}
            />
          </Field>
        </form>
      </Modal>

      <Modal
        open={rejecting !== null}
        title="Rechazar solicitud"
        onClose={() => setRejecting(null)}
        width="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setRejecting(null)}>
              Cancelar
            </Button>
            <Button
              variant="danger"
              loading={rejecting ? isPending(`reject-${rejecting.id}`) : false}
              onClick={handleReject}
            >
              Rechazar tienda
            </Button>
          </>
        }
      >
        <p className="mb-3 text-sm text-slate-700 dark:text-slate-200">
          El vendedor verá este motivo, así sabrá qué corregir para volver a intentarlo.
        </p>

        <Field label="Motivo del rechazo" error={rejectError}>
          <Textarea
            value={rejectReason}
            onChange={(event) => {
              setRejectReason(event.target.value);
              setRejectError('');
            }}
            placeholder="Ej: Falta información de contacto verificable."
            autoFocus
          />
        </Field>
      </Modal>

      <StoreDetailModal
        store={detail}
        products={products.data}
        orders={orders.data}
        onClose={() => setDetail(null)}
      />

      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </>
  );
};

const StoreDetailModal: React.FC<{
  store: StoreRecord | null;
  products: ProductRecord[];
  orders: OrderRecord[];
  onClose: () => void;
}> = ({ store, products, orders, onClose }) => {
  const storeProducts = useMemo(
    () => (store ? products.filter((product) => product.storeId === store.id) : []),
    [store, products]
  );

  const storeOrders = useMemo(
    () => (store ? orders.filter((order) => order.storeId === store.id) : []),
    [store, orders]
  );

  const totalSales = useMemo(
    () =>
      storeOrders
        .filter((order) => order.status !== 'cancelled')
        .reduce((sum, order) => sum + order.total, 0),
    [storeOrders]
  );

  return (
    <Modal
      open={store !== null}
      title={store?.name ?? ''}
      description={store?.description || 'Esta tienda no tiene descripción.'}
      onClose={onClose}
      width="lg"
      footer={
        <Button variant="secondary" onClick={onClose}>
          Cerrar
        </Button>
      }
    >
      <div className="mb-4 grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-slate-50 p-3 text-center dark:bg-white/5">
          <p className="text-xs text-slate-500 dark:text-slate-400">Productos</p>
          <p className="text-lg font-bold text-slate-900 dark:text-white">
            {formatNumber(storeProducts.length)}
          </p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3 text-center dark:bg-white/5">
          <p className="text-xs text-slate-500 dark:text-slate-400">Pedidos</p>
          <p className="text-lg font-bold text-slate-900 dark:text-white">
            {formatNumber(storeOrders.length)}
          </p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3 text-center dark:bg-white/5">
          <p className="text-xs text-slate-500 dark:text-slate-400">Ventas</p>
          <p className="text-lg font-bold text-slate-900 dark:text-white">
            {formatCurrency(totalSales)}
          </p>
        </div>
      </div>

      <section className="mb-5">
        <h3 className="mb-2 flex items-center gap-1.5 text-sm font-bold text-slate-900 dark:text-white">
          <Package className="h-4 w-4" /> Productos de la tienda
        </h3>

        {storeProducts.length === 0 ? (
          <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600 dark:bg-white/5 dark:text-slate-300">
            Esta tienda todavía no ha publicado productos.
          </p>
        ) : (
          <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200 dark:divide-white/10 dark:border-white/10">
            {storeProducts.slice(0, 8).map((product) => (
              <li key={product.id} className="flex items-center justify-between gap-3 p-2.5">
                <span className="min-w-0 truncate text-sm text-slate-700 dark:text-slate-200">
                  {product.title}
                </span>
                <span className="shrink-0 text-sm font-semibold text-slate-900 dark:text-white">
                  {formatCurrency(product.price)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h3 className="mb-2 flex items-center gap-1.5 text-sm font-bold text-slate-900 dark:text-white">
          <ShoppingCart className="h-4 w-4" /> Últimos pedidos
        </h3>

        {storeOrders.length === 0 ? (
          <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600 dark:bg-white/5 dark:text-slate-300">
            Esta tienda todavía no ha recibido pedidos.
          </p>
        ) : (
          <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200 dark:divide-white/10 dark:border-white/10">
            {storeOrders.slice(0, 8).map((order) => (
              <li key={order.id} className="flex items-center justify-between gap-3 p-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm text-slate-700 dark:text-slate-200">
                    #{order.code} · {order.buyerName}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {formatDate(order.createdAt)}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-semibold text-slate-900 dark:text-white">
                  {formatCurrency(order.total)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </Modal>
  );
};

export default SellersPage;
