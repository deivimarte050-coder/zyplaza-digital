import React, { useMemo, useState } from 'react';
import { Activity, Search } from 'lucide-react';
import { AUDIT_ACTION_LABELS, type AuditLogRecord } from '../../types/admin';
import { subscribeAuditLogs } from '../../services/audit';
import { useFirestoreSubscription } from '../hooks/useAdminData';
import {
  Badge,
  Card,
  EmptyState,
  ErrorState,
  Input,
  LoadingState,
  PageHeader,
  cx,
  type BadgeTone
} from '../components/ui';
import { formatDateTime, formatRelative } from '../utils/format';

const ACTION_TONES: Partial<Record<keyof typeof AUDIT_ACTION_LABELS, BadgeTone>> = {
  'admin.login': 'success',
  'admin.logout': 'neutral',
  'admin.password_changed': 'info',
  'user.updated': 'info',
  'user.suspended': 'danger',
  'user.reactivated': 'success',
  'user.deleted': 'danger',
  'user.role_changed': 'warning',
  'store.approved': 'success',
  'store.rejected': 'danger',
  'store.suspended': 'danger',
  'store.reactivated': 'success',
  'store.updated': 'info',
  'product.approved': 'success',
  'product.rejected': 'danger',
  'product.updated': 'info',
  'product.deleted': 'danger',
  'product.featured': 'warning',
  'product.hidden': 'neutral',
  'order.status_changed': 'info',
  'order.cancelled': 'danger',
  'banner.created': 'success',
  'banner.updated': 'info',
  'banner.deleted': 'danger',
  'category.created': 'success',
  'category.updated': 'info',
  'category.deleted': 'danger',
  'settings.updated': 'info'
};

const ActivityPage: React.FC = () => {
  const logs = useFirestoreSubscription<AuditLogRecord[]>(subscribeAuditLogs, []);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return logs.data;

    return logs.data.filter(
      (log) =>
        log.actorEmail.toLowerCase().includes(term) ||
        log.description.toLowerCase().includes(term) ||
        log.targetType.toLowerCase().includes(term) ||
        (AUDIT_ACTION_LABELS[log.action] ?? log.action).toLowerCase().includes(term)
    );
  }, [logs.data, search]);

  return (
    <>
      <PageHeader
        title="Actividad"
        description="Registro de todas las acciones realizadas por los administradores"
      />

      <Card className="mb-4 p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por administrador, acción o descripción"
            className="pl-9"
            aria-label="Buscar actividad"
          />
        </div>
      </Card>

      <Card>
        {logs.loading ? (
          <LoadingState label="Cargando actividad…" />
        ) : logs.error ? (
          <ErrorState message={logs.error} onRetry={logs.retry} />
        ) : filtered.length === 0 ? (
          <EmptyState
            title={logs.data.length === 0 ? 'No hay actividad registrada' : 'Sin resultados'}
            description={
              logs.data.length === 0
                ? 'Cuando los administradores realicen cambios aparecerán aquí.'
                : 'Prueba con otro término de búsqueda.'
            }
            icon={<Activity className="h-6 w-6" />}
          />
        ) : (
          <>
            <ul className="divide-y divide-slate-200 dark:divide-white/10">
              {filtered.map((log) => (
                <li key={log.id} className="p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {AUDIT_ACTION_LABELS[log.action] ?? log.action}
                        </p>
                        <Badge tone={ACTION_TONES[log.action] ?? 'neutral'}>
                          {log.targetType}
                        </Badge>
                      </div>

                      <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">
                        {log.description}
                      </p>

                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        Por <span className="font-medium text-slate-700 dark:text-slate-300">{log.actorEmail}</span>
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <p
                        className="text-xs text-slate-500 dark:text-slate-400"
                        title={formatDateTime(log.createdAt)}
                      >
                        {formatRelative(log.createdAt)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t border-slate-200 px-4 py-3 text-xs text-slate-500 dark:border-white/10 dark:text-slate-400">
              Mostrando {filtered.length} de {logs.data.length} registros
            </div>
          </>
        )}
      </Card>
    </>
  );
};

export default ActivityPage;
