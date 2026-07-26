import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import {
  ArrowUpRight,
  Clock,
  DollarSign,
  Package,
  ShoppingCart,
  Store,
  TrendingUp,
  Users
} from 'lucide-react';
import { subscribeUsers } from '../../services/users';
import { subscribeStores } from '../../services/stores';
import { subscribeProducts } from '../../services/products';
import { subscribeOrders } from '../../services/orders';
import { subscribeAuditLogs } from '../../services/audit';
import type {
  AdminUserRecord,
  AuditLogRecord,
  OrderRecord,
  ProductRecord,
  StoreRecord
} from '../../types/admin';
import { AUDIT_ACTION_LABELS, ORDER_STATUS_LABELS } from '../../types/admin';
import { useFirestoreSubscription } from '../hooks/useAdminData';
import { Badge, Card, EmptyState, ErrorState, LoadingState, PageHeader, cx } from '../components/ui';
import { formatCurrency, formatDate, formatNumber, formatRelative, initialsOf } from '../utils/format';
import { useTheme } from '../theme/ThemeContext';

const CHART_DAYS = 14;

interface MetricCardProps {
  label: string;
  value: string;
  hint: string;
  icon: React.ReactNode;
  to?: string;
  tone?: 'default' | 'warning';
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, hint, icon, to, tone = 'default' }) => {
  const content = (
    <Card
      className={cx(
        'h-full p-4 transition-shadow',
        to && 'hover:shadow-md',
        tone === 'warning' && 'border-amber-300 dark:border-amber-500/40'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{label}</p>
          <p className="mt-1.5 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {value}
          </p>
          <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">{hint}</p>
        </div>
        <span
          className={cx(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
            tone === 'warning'
              ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400'
              : 'bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-300'
          )}
        >
          {icon}
        </span>
      </div>
    </Card>
  );

  return to ? (
    <Link to={to} className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#FF6A00]">
      {content}
    </Link>
  ) : (
    content
  );
};

function buildSalesSeries(orders: OrderRecord[]): Array<{ label: string; ventas: number }> {
  const today = new Date();
  const days: Array<{ key: string; label: string; ventas: number }> = [];

  for (let index = CHART_DAYS - 1; index >= 0; index -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - index);
    date.setHours(0, 0, 0, 0);

    days.push({
      key: date.toDateString(),
      label: date.toLocaleDateString('es-DO', { day: '2-digit', month: 'short' }),
      ventas: 0
    });
  }

  const index = new Map(days.map((day) => [day.key, day]));

  orders.forEach((order) => {
    if (!order.createdAt || order.status === 'cancelled') return;

    const day = new Date(order.createdAt);
    day.setHours(0, 0, 0, 0);

    const entry = index.get(day.toDateString());
    if (entry) entry.ventas += order.total;
  });

  return days.map(({ label, ventas }) => ({ label, ventas }));
}

const STATUS_COLORS: Record<string, string> = {
  new: '#3b82f6',
  preparing: '#f59e0b',
  shipped: '#8b5cf6',
  delivered: '#10b981',
  cancelled: '#ef4444'
};

const DashboardPage: React.FC = () => {
  const { theme } = useTheme();

  const users = useFirestoreSubscription<AdminUserRecord[]>(subscribeUsers, []);
  const stores = useFirestoreSubscription<StoreRecord[]>(subscribeStores, []);
  const products = useFirestoreSubscription<ProductRecord[]>(subscribeProducts, []);
  const orders = useFirestoreSubscription<OrderRecord[]>(subscribeOrders, []);
  const logs = useFirestoreSubscription<AuditLogRecord[]>(
    (onData, onError) => subscribeAuditLogs(onData, onError, 8),
    []
  );

  const loading =
    users.loading || stores.loading || products.loading || orders.loading;

  const firstError = users.error || stores.error || products.error || orders.error;

  const metrics = useMemo(() => {
    const validOrders = orders.data.filter((order) => order.status !== 'cancelled');
    const sales = validOrders.reduce((sum, order) => sum + order.total, 0);
    const earnings = validOrders.reduce((sum, order) => sum + order.commission, 0);

    return {
      totalUsers: users.data.length,
      totalSellers: users.data.filter((user) => user.role === 'seller').length,
      approvedStores: stores.data.filter((store) => store.status === 'approved').length,
      pendingStores: stores.data.filter((store) => store.status === 'pending').length,
      publishedProducts: products.data.filter(
        (product) => product.status === 'approved' && !product.hidden
      ).length,
      pendingProducts: products.data.filter((product) => product.status === 'pending').length,
      totalOrders: orders.data.length,
      pendingOrders: orders.data.filter((order) => order.status === 'new').length,
      sales,
      earnings
    };
  }, [users.data, stores.data, products.data, orders.data]);

  const salesSeries = useMemo(() => buildSalesSeries(orders.data), [orders.data]);

  const statusSeries = useMemo(() => {
    const counts = new Map<string, number>();
    orders.data.forEach((order) => counts.set(order.status, (counts.get(order.status) ?? 0) + 1));

    return Object.entries(ORDER_STATUS_LABELS).map(([status, label]) => ({
      status,
      label,
      total: counts.get(status) ?? 0
    }));
  }, [orders.data]);

  const bestSellers = useMemo(
    () => [...products.data].sort((a, b) => b.soldCount - a.soldCount).slice(0, 5),
    [products.data]
  );

  const latestUsers = useMemo(() => users.data.slice(0, 5), [users.data]);

  const axisColor = theme === 'dark' ? '#64748b' : '#94a3b8';
  const gridColor = theme === 'dark' ? 'rgba(255,255,255,0.08)' : '#e2e8f0';
  const tooltipStyle = {
    backgroundColor: theme === 'dark' ? '#15161a' : '#ffffff',
    border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`,
    borderRadius: '0.5rem',
    fontSize: '0.8rem',
    color: theme === 'dark' ? '#ffffff' : '#0f172a'
  };

  if (loading) {
    return (
      <>
        <PageHeader title="Resumen" description="Cómo va Zyplaza hoy" />
        <Card>
          <LoadingState label="Cargando los datos de tu marketplace…" />
        </Card>
      </>
    );
  }

  if (firstError) {
    return (
      <>
        <PageHeader title="Resumen" description="Cómo va Zyplaza hoy" />
        <Card>
          <ErrorState
            message={firstError}
            onRetry={() => {
              users.retry();
              stores.retry();
              products.retry();
              orders.retry();
            }}
          />
        </Card>
      </>
    );
  }

  const hasNoData = metrics.totalUsers === 0 && metrics.totalOrders === 0;

  return (
    <>
      <PageHeader title="Resumen" description="Cómo va Zyplaza hoy" />

      {hasNoData ? (
        <Card className="mb-5">
          <EmptyState
            title="Tu marketplace todavía no tiene datos"
            description="En cuanto se registren usuarios, tiendas o pedidos, verás aquí las cifras reales en tiempo real."
            icon={<TrendingUp className="h-6 w-6" />}
          />
        </Card>
      ) : null}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Usuarios registrados"
          value={formatNumber(metrics.totalUsers)}
          hint={`${formatNumber(metrics.totalSellers)} con rol de vendedor`}
          icon={<Users className="h-4.5 w-4.5" />}
          to="/usuarios"
        />
        <MetricCard
          label="Tiendas activas"
          value={formatNumber(metrics.approvedStores)}
          hint={
            metrics.pendingStores > 0
              ? `${formatNumber(metrics.pendingStores)} esperan aprobación`
              : 'Sin solicitudes pendientes'
          }
          icon={<Store className="h-4.5 w-4.5" />}
          to="/vendedores"
          tone={metrics.pendingStores > 0 ? 'warning' : 'default'}
        />
        <MetricCard
          label="Productos publicados"
          value={formatNumber(metrics.publishedProducts)}
          hint={
            metrics.pendingProducts > 0
              ? `${formatNumber(metrics.pendingProducts)} por revisar`
              : 'Todo revisado'
          }
          icon={<Package className="h-4.5 w-4.5" />}
          to="/productos"
          tone={metrics.pendingProducts > 0 ? 'warning' : 'default'}
        />
        <MetricCard
          label="Pedidos"
          value={formatNumber(metrics.totalOrders)}
          hint={
            metrics.pendingOrders > 0
              ? `${formatNumber(metrics.pendingOrders)} sin atender`
              : 'Ninguno sin atender'
          }
          icon={<ShoppingCart className="h-4.5 w-4.5" />}
          to="/pedidos"
          tone={metrics.pendingOrders > 0 ? 'warning' : 'default'}
        />
        <MetricCard
          label="Ventas acumuladas"
          value={formatCurrency(metrics.sales)}
          hint="Suma de pedidos no cancelados"
          icon={<TrendingUp className="h-4.5 w-4.5" />}
        />
        <MetricCard
          label="Ganancias por comisión"
          value={formatCurrency(metrics.earnings)}
          hint="Lo que gana Zyplaza"
          icon={<DollarSign className="h-4.5 w-4.5" />}
        />
        <MetricCard
          label="Productos pendientes"
          value={formatNumber(metrics.pendingProducts)}
          hint="Esperan tu aprobación"
          icon={<Clock className="h-4.5 w-4.5" />}
          to="/productos"
          tone={metrics.pendingProducts > 0 ? 'warning' : 'default'}
        />
        <MetricCard
          label="Solicitudes de tienda"
          value={formatNumber(metrics.pendingStores)}
          hint="Vendedores por aprobar"
          icon={<Store className="h-4.5 w-4.5" />}
          to="/vendedores"
          tone={metrics.pendingStores > 0 ? 'warning' : 'default'}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="p-4 xl:col-span-2">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Ventas de los últimos {CHART_DAYS} días
          </h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesSeries} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
                <defs>
                  <linearGradient id="ventasColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF6A00" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#FF6A00" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: axisColor }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 11, fill: axisColor }}
                  axisLine={false}
                  tickLine={false}
                  width={70}
                  tickFormatter={(value: number) => formatCurrency(value)}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value: number) => [formatCurrency(value), 'Ventas']}
                />
                <Area
                  type="monotone"
                  dataKey="ventas"
                  stroke="#FF6A00"
                  strokeWidth={2}
                  fill="url(#ventasColor)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Pedidos por estado</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusSeries} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: axisColor }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: axisColor }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [value, 'Pedidos']} />
                <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                  {statusSeries.map((entry) => (
                    <Cell key={entry.status} fill={STATUS_COLORS[entry.status] ?? '#94a3b8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-1">
          <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-white/10">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Más vendidos</h2>
            <Link
              to="/productos"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#FF6A00] hover:underline"
            >
              Ver todos <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {bestSellers.length === 0 ? (
            <EmptyState
              title="Aún no hay ventas"
              description="Cuando se vendan productos aparecerán aquí ordenados por unidades."
              icon={<Package className="h-6 w-6" />}
            />
          ) : (
            <ul className="divide-y divide-slate-200 dark:divide-white/10">
              {bestSellers.map((product, position) => (
                <li key={product.id} className="flex items-center gap-3 p-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-100 text-xs font-bold text-slate-600 dark:bg-white/10 dark:text-slate-300">
                    {position + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {product.title}
                    </p>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                      {product.storeName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {formatNumber(product.soldCount)}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">vendidos</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="xl:col-span-1">
          <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-white/10">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Últimos registros</h2>
            <Link
              to="/usuarios"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#FF6A00] hover:underline"
            >
              Ver todos <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {latestUsers.length === 0 ? (
            <EmptyState
              title="Sin usuarios todavía"
              description="Los nuevos registros del marketplace aparecerán aquí."
              icon={<Users className="h-6 w-6" />}
            />
          ) : (
            <ul className="divide-y divide-slate-200 dark:divide-white/10">
              {latestUsers.map((user) => (
                <li key={user.id} className="flex items-center gap-3 p-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-white dark:bg-white/10">
                    {initialsOf(user.name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {user.name}
                    </p>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                      {user.email || user.phone || 'Sin contacto'}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-slate-500 dark:text-slate-400">
                    {formatDate(user.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="xl:col-span-1">
          <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-white/10">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Actividad reciente</h2>
            <Link
              to="/actividad"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#FF6A00] hover:underline"
            >
              Ver todo <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {logs.data.length === 0 ? (
            <EmptyState
              title="Sin actividad registrada"
              description="Cada acción que hagas en el panel quedará anotada aquí."
              icon={<Clock className="h-6 w-6" />}
            />
          ) : (
            <ul className="divide-y divide-slate-200 dark:divide-white/10">
              {logs.data.map((log) => (
                <li key={log.id} className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                      {log.description || AUDIT_ACTION_LABELS[log.action] || log.action}
                    </p>
                    <Badge tone="neutral">{formatRelative(log.createdAt)}</Badge>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                    {log.actorEmail}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
};

export default DashboardPage;
