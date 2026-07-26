import React, { useEffect, useMemo, useState } from 'react';
import {
  History,
  Pencil,
  Search,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserX,
  Users as UsersIcon
} from 'lucide-react';
import {
  ACCOUNT_STATUS_LABELS,
  ROLE_LABELS,
  type AccountStatus,
  type AdminUserRecord,
  type AuditLogRecord,
  type UserRole
} from '../../types/admin';
import { subscribeUsers, updateUser } from '../../services/users';
import { subscribeAuditLogs } from '../../services/audit';
import { useAdminAuth } from '../auth/AdminAuthContext';
import { useAsyncAction, useFirestoreSubscription, useToasts } from '../hooks/useAdminData';
import {
  requestRoleChange,
  requestStatusChange,
  requestUserDeletion
} from '../utils/adminApi';
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
  ToastStack,
  cx
} from '../components/ui';
import { formatDate, formatDateTime, formatRelative, initialsOf } from '../utils/format';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type RoleFilter = 'all' | UserRole;
type StatusFilter = 'all' | AccountStatus;

interface EditForm {
  name: string;
  email: string;
  phone: string;
  city: string;
}

const emptyForm: EditForm = { name: '', email: '', phone: '', city: '' };

const UsersPage: React.FC = () => {
  const { profile } = useAdminAuth();
  const { toasts, dismissToast, notifySuccess, notifyError } = useToasts();
  const { isPending, run } = useAsyncAction();

  const { data: users, loading, error, retry } = useFirestoreSubscription<AdminUserRecord[]>(
    subscribeUsers,
    []
  );

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const [editing, setEditing] = useState<AdminUserRecord | null>(null);
  const [form, setForm] = useState<EditForm>(emptyForm);
  const [formErrors, setFormErrors] = useState<Partial<EditForm>>({});
  const [saving, setSaving] = useState(false);

  const [deleting, setDeleting] = useState<AdminUserRecord | null>(null);
  const [historyOf, setHistoryOf] = useState<AdminUserRecord | null>(null);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    return users.filter((user) => {
      if (roleFilter !== 'all' && user.role !== roleFilter) return false;
      if (statusFilter !== 'all' && user.status !== statusFilter) return false;
      if (!term) return true;

      return (
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.phone.includes(term) ||
        user.city.toLowerCase().includes(term)
      );
    });
  }, [users, search, roleFilter, statusFilter]);

  const openEdit = (user: AdminUserRecord) => {
    setEditing(user);
    setForm({ name: user.name, email: user.email, phone: user.phone, city: user.city });
    setFormErrors({});
  };

  const validateForm = (): boolean => {
    const errors: Partial<EditForm> = {};

    if (form.name.trim().length < 3) errors.name = 'El nombre debe tener al menos 3 caracteres.';
    if (form.email.trim() && !EMAIL_PATTERN.test(form.email.trim())) {
      errors.email = 'El correo no tiene un formato válido.';
    }
    if (form.phone.trim() && form.phone.replace(/\D/g, '').length < 10) {
      errors.phone = 'El teléfono debe tener al menos 10 dígitos.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editing || !validateForm()) return;

    setSaving(true);

    try {
      await updateUser(editing.id, {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        city: form.city.trim()
      });

      notifySuccess('Los datos del usuario se guardaron.');
      setEditing(null);
    } catch (saveError) {
      notifyError(saveError);
    } finally {
      setSaving(false);
    }
  };

  const handleStatus = (user: AdminUserRecord, status: AccountStatus) =>
    run(`status-${user.id}`, async () => {
      try {
        await requestStatusChange(user.id, status);
        notifySuccess(
          status === 'suspended'
            ? `${user.name} quedó suspendido y no podrá entrar.`
            : `${user.name} vuelve a tener acceso.`
        );
      } catch (statusError) {
        notifyError(statusError);
      }
    });

  const handleRole = (user: AdminUserRecord, role: UserRole) =>
    run(`role-${user.id}`, async () => {
      try {
        await requestRoleChange(user.id, role);
        notifySuccess(`${user.name} ahora es ${ROLE_LABELS[role].toLowerCase()}.`);
      } catch (roleError) {
        notifyError(roleError);
      }
    });

  const handleDelete = () => {
    if (!deleting) return;

    return run(`delete-${deleting.id}`, async () => {
      try {
        await requestUserDeletion(deleting.id);
        notifySuccess(`La cuenta de ${deleting.name} fue eliminada.`);
        setDeleting(null);
      } catch (deleteError) {
        notifyError(deleteError);
      }
    });
  };

  return (
    <>
      <PageHeader
        title="Usuarios"
        description="Todas las personas registradas en Zyplaza y lo que pueden hacer"
      />

      <Card className="mb-4 p-3">
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nombre, correo, teléfono o ciudad"
              className="pl-9"
              aria-label="Buscar usuarios"
            />
          </div>

          <Select
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value as RoleFilter)}
            aria-label="Filtrar por rol"
            className="sm:w-44"
          >
            <option value="all">Todos los roles</option>
            <option value="user">Compradores</option>
            <option value="seller">Vendedores</option>
            <option value="admin">Administradores</option>
          </Select>

          <Select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
            aria-label="Filtrar por estado"
            className="sm:w-40"
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="suspended">Suspendidos</option>
          </Select>
        </div>
      </Card>

      <Card>
        {loading ? (
          <LoadingState label="Cargando usuarios…" />
        ) : error ? (
          <ErrorState message={error} onRetry={retry} />
        ) : filtered.length === 0 ? (
          <EmptyState
            title={users.length === 0 ? 'Todavía no hay usuarios' : 'Sin resultados'}
            description={
              users.length === 0
                ? 'Cuando alguien se registre en Zyplaza aparecerá en esta lista.'
                : 'Prueba con otro término de búsqueda o cambia los filtros.'
            }
            icon={<UsersIcon className="h-6 w-6" />}
          />
        ) : (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500 dark:border-white/10 dark:text-slate-400">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Usuario</th>
                    <th className="px-4 py-3 font-semibold">Contacto</th>
                    <th className="px-4 py-3 font-semibold">Rol</th>
                    <th className="px-4 py-3 font-semibold">Estado</th>
                    <th className="px-4 py-3 font-semibold">Registro</th>
                    <th className="px-4 py-3 text-right font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                  {filtered.map((user) => {
                    const isSelf = user.id === profile?.uid;

                    return (
                      <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-white/5">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-white dark:bg-white/10">
                              {initialsOf(user.name)}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-slate-800 dark:text-slate-100">
                                {user.name}
                                {isSelf ? (
                                  <span className="ml-1.5 text-xs font-normal text-slate-500">
                                    (tú)
                                  </span>
                                ) : null}
                              </p>
                              <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                                {user.city || 'Sin ciudad'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="truncate text-slate-700 dark:text-slate-200">
                            {user.email || '—'}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {user.phone || 'Sin teléfono'}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <Select
                            value={user.role}
                            disabled={isSelf || isPending(`role-${user.id}`)}
                            onChange={(event) => handleRole(user, event.target.value as UserRole)}
                            aria-label={`Rol de ${user.name}`}
                            className="w-36 py-1.5 text-xs"
                          >
                            <option value="user">Comprador</option>
                            <option value="seller">Vendedor</option>
                            <option value="admin">Administrador</option>
                          </Select>
                        </td>
                        <td className="px-4 py-3">
                          <Badge tone={user.status === 'active' ? 'success' : 'danger'}>
                            {ACCOUNT_STATUS_LABELS[user.status]}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              onClick={() => openEdit(user)}
                              icon={<Pencil className="h-4 w-4" />}
                              className="px-2"
                              aria-label={`Editar ${user.name}`}
                            />
                            <Button
                              variant="ghost"
                              onClick={() => setHistoryOf(user)}
                              icon={<History className="h-4 w-4" />}
                              className="px-2"
                              aria-label={`Historial de ${user.name}`}
                            />
                            {user.status === 'active' ? (
                              <Button
                                variant="ghost"
                                disabled={isSelf}
                                loading={isPending(`status-${user.id}`)}
                                onClick={() => handleStatus(user, 'suspended')}
                                icon={<UserX className="h-4 w-4" />}
                                className="px-2 text-amber-600 dark:text-amber-400"
                                aria-label={`Suspender a ${user.name}`}
                              />
                            ) : (
                              <Button
                                variant="ghost"
                                loading={isPending(`status-${user.id}`)}
                                onClick={() => handleStatus(user, 'active')}
                                icon={<UserCheck className="h-4 w-4" />}
                                className="px-2 text-emerald-600 dark:text-emerald-400"
                                aria-label={`Reactivar a ${user.name}`}
                              />
                            )}
                            <Button
                              variant="ghost"
                              disabled={isSelf}
                              onClick={() => setDeleting(user)}
                              icon={<Trash2 className="h-4 w-4" />}
                              className="px-2 text-red-600 dark:text-red-400"
                              aria-label={`Eliminar a ${user.name}`}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <ul className="divide-y divide-slate-200 lg:hidden dark:divide-white/10">
              {filtered.map((user) => {
                const isSelf = user.id === profile?.uid;

                return (
                  <li key={user.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-white dark:bg-white/10">
                        {initialsOf(user.name)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-slate-800 dark:text-slate-100">
                          {user.name}
                        </p>
                        <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                          {user.email || user.phone || 'Sin contacto'}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                          <Badge tone={user.status === 'active' ? 'success' : 'danger'}>
                            {ACCOUNT_STATUS_LABELS[user.status]}
                          </Badge>
                          <Badge tone="info">{ROLE_LABELS[user.role]}</Badge>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {formatDate(user.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button variant="secondary" onClick={() => openEdit(user)} icon={<Pencil className="h-4 w-4" />}>
                        Editar
                      </Button>
                      <Button variant="secondary" onClick={() => setHistoryOf(user)} icon={<History className="h-4 w-4" />}>
                        Historial
                      </Button>
                      {user.status === 'active' ? (
                        <Button
                          variant="secondary"
                          disabled={isSelf}
                          loading={isPending(`status-${user.id}`)}
                          onClick={() => handleStatus(user, 'suspended')}
                          icon={<UserX className="h-4 w-4" />}
                        >
                          Suspender
                        </Button>
                      ) : (
                        <Button
                          variant="success"
                          loading={isPending(`status-${user.id}`)}
                          onClick={() => handleStatus(user, 'active')}
                          icon={<UserCheck className="h-4 w-4" />}
                        >
                          Reactivar
                        </Button>
                      )}
                      <Button
                        variant="danger"
                        disabled={isSelf}
                        onClick={() => setDeleting(user)}
                        icon={<Trash2 className="h-4 w-4" />}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="border-t border-slate-200 px-4 py-3 text-xs text-slate-500 dark:border-white/10 dark:text-slate-400">
              Mostrando {filtered.length} de {users.length} usuarios
            </div>
          </>
        )}
      </Card>

      <Modal
        open={editing !== null}
        title="Editar usuario"
        description="Los cambios se guardan directamente en la base de datos."
        onClose={() => setEditing(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditing(null)}>
              Cancelar
            </Button>
            <Button form="user-edit-form" type="submit" loading={saving}>
              Guardar cambios
            </Button>
          </>
        }
      >
        <form id="user-edit-form" onSubmit={handleSave} noValidate className="space-y-4">
          <Field label="Nombre completo" error={formErrors.name}>
            <Input
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              autoFocus
            />
          </Field>

          <Field
            label="Correo electrónico"
            error={formErrors.email}
            hint="Cambiarlo aquí no modifica sus credenciales de acceso."
          >
            <Input
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
            />
          </Field>

          <Field
            label="Teléfono"
            error={formErrors.phone}
            hint="Formato local, mínimo 10 dígitos."
          >
            <Input
              value={form.phone}
              onChange={(event) => setForm({ ...form, phone: event.target.value })}
            />
          </Field>

          <Field label="Ciudad">
            <Input
              value={form.city}
              onChange={(event) => setForm({ ...form, city: event.target.value })}
            />
          </Field>
        </form>
      </Modal>

      <Modal
        open={deleting !== null}
        title="Eliminar cuenta"
        onClose={() => setDeleting(null)}
        width="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleting(null)}>
              Cancelar
            </Button>
            <Button
              variant="danger"
              loading={deleting ? isPending(`delete-${deleting.id}`) : false}
              onClick={handleDelete}
            >
              Sí, eliminar
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-700 dark:text-slate-200">
          Vas a eliminar la cuenta de{' '}
          <strong className="font-semibold">{deleting?.name}</strong> y sus credenciales de acceso.
        </p>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Esta acción no se puede deshacer. Si solo quieres impedirle el acceso temporalmente,
          usa <strong className="font-semibold">Suspender</strong> en su lugar.
        </p>
      </Modal>

      <UserHistoryModal user={historyOf} onClose={() => setHistoryOf(null)} />

      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </>
  );
};

/** Historial de acciones administrativas realizadas sobre un usuario */
const UserHistoryModal: React.FC<{ user: AdminUserRecord | null; onClose: () => void }> = ({
  user,
  onClose
}) => {
  const [logs, setLogs] = useState<AuditLogRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      setLogs([]);
      return;
    }

    setLoading(true);
    setError('');

    const unsubscribe = subscribeAuditLogs(
      (allLogs) => {
        setLogs(allLogs.filter((log) => log.targetId === user.id));
        setLoading(false);
      },
      (subscriptionError) => {
        setError(String(subscriptionError));
        setLoading(false);
      },
      300
    );

    return unsubscribe;
  }, [user]);

  return (
    <Modal
      open={user !== null}
      title={`Historial de ${user?.name ?? ''}`}
      description="Acciones administrativas registradas sobre esta cuenta"
      onClose={onClose}
      footer={
        <Button variant="secondary" onClick={onClose}>
          Cerrar
        </Button>
      }
    >
      <div className="mb-4 grid grid-cols-2 gap-3 rounded-lg bg-slate-50 p-3 text-sm dark:bg-white/5">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Fecha de registro</p>
          <p className="font-semibold text-slate-800 dark:text-slate-100">
            {formatDateTime(user?.createdAt ?? null)}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Último acceso</p>
          <p className="font-semibold text-slate-800 dark:text-slate-100">
            {user?.lastLoginAt ? formatRelative(user.lastLoginAt) : 'Nunca ha entrado'}
          </p>
        </div>
      </div>

      {loading ? (
        <LoadingState label="Cargando historial…" />
      ) : error ? (
        <ErrorState message={error} />
      ) : logs.length === 0 ? (
        <EmptyState
          title="Sin movimientos"
          description="Todavía no se ha registrado ninguna acción administrativa sobre esta cuenta."
          icon={<ShieldCheck className="h-6 w-6" />}
        />
      ) : (
        <ol className="space-y-3">
          {logs.map((log) => (
            <li
              key={log.id}
              className={cx(
                'relative border-l-2 border-slate-200 pl-4 dark:border-white/15',
                'before:absolute before:-left-[5px] before:top-1.5 before:h-2 before:w-2',
                'before:rounded-full before:bg-[#FF6A00]'
              )}
            >
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                {log.description}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {log.actorEmail} · {formatDateTime(log.createdAt)}
              </p>
            </li>
          ))}
        </ol>
      )}
    </Modal>
  );
};

export default UsersPage;
