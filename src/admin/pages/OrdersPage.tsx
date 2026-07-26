import React, { useMemo, useState } from 'react';
import { Package, Search, ShoppingCart, X } from 'lucide-react';
import {
  ORDER_STATUS_LABELS,
  type OrderRecord,
  type OrderStatus
} from '../../types/admin';
import { changeOrderStatus, subscribeOrders } from '../../services/orders';
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
import { formatCurrency, formatDateTime, formatRelative } from '../utils/format';

type StatusFilter = 'all' | OrderStatus;

const STATUS_TONES: Record<OrderStatus, BadgeTone> = {
  new: 'warning',
  preparing: 'info',
  shipped: 'info',
  delivered: 'success',
  cancelled: 'danger'
};

const STATUS_OPTIONS: OrderStatus[] = ['new', 'preparing', 'shipped', 'delivered', 'cancelled'];

function nextStatuses(current: OrderStatus): OrderStatus[] {
  switch (current) {
    case 'new':
      return ['preparing', 'shipped', 'delivered', 'cancelled'];
    case 'preparing':
      return ['shipped', 'delivered', 'cancelled'];
    case 'shipped':
      return ['delivered', 'cancelled'];
    case 'delivered':
      return ['cancelled'];
    case 'cancelled':
    default:
      return [];
  }
}

const OrdersPage: React.FC = () => {
  const { toasts, dismissToast, notifySuccess, notifyError } = useToasts();
  const { isPending, run } = useAsyncAction();

  const orders = useFirestoreSubscription<OrderRecord[]>(subscribeOrders, []);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const [viewing, setViewing] = useState<OrderRecord | null>(null);

  const [editing, setEditing] = useState<OrderRecord | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus>('new');
  const [statusNote, setStatusNote] = useState('');

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    return orders.data.filter((order) => {
      if (statusFilter !== 'all' && order.status !== statusFilter) return false;
      if (!term) return true;

      return (
        order.code.toLowerCase().includes(term) ||
        order.buyerName.toLowerCase().includes(term) ||
        order.storeName.toLowerCase().includes(term)
      );
    });
  }, [orders.data, search, statusFilter]);

  const handleStatusChange = async (order: OrderRecord, status: OrderStatus) => {
    if (status === 'cancelled' && order.status === 'cancelled') return;

    await changeOrderStatus(order, status, statusNote.trim());
  };

  const openEdit = (order: OrderRecord) => {
    setEditing(order);
    setNewStatus(nextStatuses(order.status)[0] ?? order.status);
    setStatusNote('');
  };

  const confirmStatusChange = () => {
    if (!editing) return;

    return run(`status-${editing.id}`, async () => {
      try {
        await handleStatusChange(editing, newStatus);
        notifySuccess(
          `Pedido ${editing.code}: ${ORDER_STATUS_LABELS[editing.status]} → ${ORDER_STATUS_LABELS[newStatus]}`
        );
        setEditing(null);
        setStatusNote('');
      } catch (error) {
        notifyError(error);
      }
    });
  };

  const revenue = useMemo(
    () => orders.data.reduce((sum, order) => sum + (order.status !== 'cancelled' ? order.total : 0), 0),
    [orders.data]
  );

  const pendingCount = useMemo(
    () => orders.data.filter((order) => order.status === 'new').length,
    [orders.data]
  );

  return (
    <>
      <PageHeader
        title="Pedidos"
        description="Gestiona el estado de todas las compras hechas en Zyplaza"
      />

      {pendingCount > 0 ? (
        <Card className="mb-4 border-amber-300 bg-amber-50 p-4 dark:border-amber-500/40 dark:bg-amber-500/10">
          <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
            Hay {pendingCount} {pendingCount === 1 ? 'pedido nuevo' : 'pedidos nuevos'} por procesar.
          </p>
          <button
            type="button"
            onClick={() => setStatusFilter('new')}
            className="mt-1 text-xs font-semibold text-amber-800 underline dark:text-amber-300"
          >
            Verlos ahora
          </button>
        </Card>
      ) : null}

      <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total pedidos</p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
            {orders.data.length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Ventas efectivas</p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
            {formatCurrency(revenue)}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Entregados</p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
            {orders.data.filter((o) => o.status === 'delivered').length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Cancelados</p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
            {orders.data.filter((o) => o.status === 'cancelled').length}
          </p>
        </Card>
      </div>

      <Card className="mb-4 p-3">
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por código, comprador o tienda"
              className="pl-9"
              aria-label="Buscar pedidos"
            />
          </div>

          <Select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
            aria-label="Filtrar por estado"
            className="sm:w-52"
          >
            <option value="all">Todos los estados</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {ORDER_STATUS_LABELS[status]}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      <Card>
        {orders.loading ? (
          <LoadingState label="Cargando pedidos…" />
        ) : orders.error ? (
          <ErrorState message={orders.error} onRetry={orders.retry} />
        ) : filtered.length === 0 ? (
          <EmptyState
            title={orders.data.length === 0 ? 'Todavía no hay pedidos' : 'Sin resultados'}
            description={
              orders.data.length === 0
                ? 'Cuando los compradores completen una orden aparecerá aquí para su gestión.'
                : 'Prueba con otro término o cambia los filtros.'
            }
            icon={<ShoppingCart className="h-6 w-6" />}
          />
        ) : (
          <>
            <ul className="divide-y divide-slate-200 dark:divide-white/10">
              {filtered.map((order) => (
                <li key={order.id} className="p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400 dark:bg-white/10">
                      <Package className="h-5 w-5" />
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-slate-900 dark:text-white">{order.code}</p>
                        <Badge tone={STATUS_TONES[order.status]}>
                          {ORDER_STATUS_LABELS[order.status]}
                        </Badge>
                      </div>

                      <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-300">
                        {order.buyerName} · {order.storeName} · {order.paymentMethod}
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {formatCurrency(order.total)}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {order.items.length} {order.items.length === 1 ? 'artículo' : 'artículos'}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {formatDateTime(order.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => setViewing(order)}
                      icon={<Package className="h-4 w-4" />}
                    >
                      Ver detalles
                    </Button>

                    {order.status !== 'cancelled' && order.status !== 'delivered' ? (
                      <Button
                        variant="primary"
                        onClick={() => openEdit(order)}
                        icon={<ShoppingCart className="h-4 w-4" />}
                      >
                        Cambiar estado
                      </Button>
                    ) : null}

                    {order.status !== 'cancelled' ? (
                      <Button
                        variant="danger"
                        loading={isPending(`status-${order.id}`)}
                        onClick={() => {
                          setEditing(order);
                          setNewStatus('cancelled');
                          setStatusNote('');
                        }}
                        icon={<X className="h-4 w-4" />}
                      >
                        Cancelar
                      </Button>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t border-slate-200 px-4 py-3 text-xs text-slate-500 dark:border-white/10 dark:text-slate-400">
              Mostrando {filtered.length} de {orders.data.length} pedidos
            </div>
          </>
        )}
      </Card>

      <Modal
        open={viewing !== null}
        title={`Pedido ${viewing?.code ?? ''}`}
        description="Detalle completo de la compra y su historial de estados"
        onClose={() => setViewing(null)}
        width="lg"
        footer={
          <Button variant="secondary" onClick={() => setViewing(null)}>
            Cerrar
          </Button>
        }
      >
        {viewing ? (
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Comprador</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {viewing.buyerName}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Tienda</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {viewing.storeName}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Método de pago</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {viewing.paymentMethod}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Estado actual</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  <Badge tone={STATUS_TONES[viewing.status]}>
                    {ORDER_STATUS_LABELS[viewing.status]}
                  </Badge>
                </p>
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">Artículos</p>
              <ul className="rounded-lg border border-slate-200 dark:border-white/10">
                {viewing.items.map((item, index) => (
                  <li
                    key={`${item.productId}-${index}`}
                    className="flex items-center justify-between px-3 py-2 text-sm odd:bg-slate-50 dark:odd:bg-white/5"
                  >
                    <span className="text-slate-900 dark:text-white">
                      {item.title} x {item.quantity}
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-2 flex items-center justify-between border-t border-slate-200 pt-2 text-sm dark:border-white/10">
                <span className="text-slate-600 dark:text-slate-300">Subtotal</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {formatCurrency(viewing.subtotal)}
                </span>
              </div>
              {viewing.commission > 0 ? (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-300">Comisión</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {formatCurrency(viewing.commission)}
                  </span>
                </div>
              ) : null}
              <div className="flex items-center justify-between text-base">
                <span className="font-semibold text-slate-900 dark:text-white">Total</span>
                <span className="font-bold text-[#FF6A00]">{formatCurrency(viewing.total)}</span>
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                Historial de estados
              </p>
              {viewing.history.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  No hay cambios registrados todavía.
                </p>
              ) : (
                <ul className="space-y-2">
                  {viewing.history.map((entry, index) => (
                    <li
                      key={index}
                      className="flex flex-col gap-1 rounded-lg border border-slate-200 p-3 text-sm dark:border-white/10"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <Badge tone={STATUS_TONES[entry.status]}>
                          {ORDER_STATUS_LABELS[entry.status]}
                        </Badge>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {formatRelative(entry.changedAt)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Por: {entry.changedBy || 'Sistema'}
                      </p>
                      {entry.note ? (
                        <p className="text-xs text-slate-600 dark:text-slate-300">
                          Nota: {entry.note}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal
        open={editing !== null}
        title={
          editing?.status === 'cancelled'
            ? 'Cancelar pedido'
            : `Cambiar estado de ${editing?.code ?? ''}`
        }
        onClose={() => setEditing(null)}
        width="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditing(null)}>
              Cancelar
            </Button>
            <Button
              variant={newStatus === 'cancelled' ? 'danger' : 'primary'}
              loading={editing ? isPending(`status-${editing.id}`) : false}
              onClick={confirmStatusChange}
            >
              {newStatus === 'cancelled' ? 'Cancelar pedido' : 'Cambiar estado'}
            </Button>
          </>
        }
      >
        {editing ? (
          <div className="space-y-4">
            {newStatus !== 'cancelled' ? (
              <Field label="Nuevo estado">
                <Select
                  value={newStatus}
                  onChange={(event) => setNewStatus(event.target.value as OrderStatus)}
                >
                  {nextStatuses(editing.status).map((status) => (
                    <option key={status} value={status}>
                      {ORDER_STATUS_LABELS[status]}
                    </option>
                  ))}
                </Select>
              </Field>
            ) : (
              <p className="text-sm text-slate-700 dark:text-slate-200">
                Se cancelará el pedido <strong>{editing.code}</strong>. Este cambio no se puede
                deshacer.
              </p>
            )}

            <Field label="Nota interna (opcional)" hint="Aparecerá en el historial del pedido.">
              <Textarea
                value={statusNote}
                onChange={(event) => setStatusNote(event.target.value)}
                placeholder="Ej: Producto preparado para envío."
              />
            </Field>
          </div>
        ) : null}
      </Modal>

      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </>
  );
};

export default OrdersPage;
