import React, { useMemo, useState } from 'react';
import { Check, Eye, EyeOff, Package, Pencil, Search, Star, Trash2, X } from 'lucide-react';
import {
  PRODUCT_STATUS_LABELS,
  type CategoryRecord,
  type ProductRecord,
  type ProductStatus
} from '../../types/admin';
import {
  approveProduct,
  deleteProduct,
  rejectProduct,
  setProductFeatured,
  setProductHidden,
  subscribeProducts,
  updateProduct
} from '../../services/products';
import { subscribeCategories } from '../../services/catalog';
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
  cx,
  type BadgeTone
} from '../components/ui';
import { formatCurrency, formatDate, formatNumber } from '../utils/format';

type StatusFilter = 'all' | ProductStatus;
type VisibilityFilter = 'all' | 'visible' | 'hidden' | 'featured';

const STATUS_TONES: Record<ProductStatus, BadgeTone> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'danger'
};

interface EditForm {
  title: string;
  description: string;
  price: string;
  stock: string;
  categoryId: string;
}

const emptyForm: EditForm = {
  title: '',
  description: '',
  price: '',
  stock: '',
  categoryId: ''
};

const ProductsPage: React.FC = () => {
  const { toasts, dismissToast, notifySuccess, notifyError } = useToasts();
  const { isPending, run } = useAsyncAction();

  const products = useFirestoreSubscription<ProductRecord[]>(subscribeProducts, []);
  const categories = useFirestoreSubscription<CategoryRecord[]>(subscribeCategories, []);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [visibilityFilter, setVisibilityFilter] = useState<VisibilityFilter>('all');

  const [editing, setEditing] = useState<ProductRecord | null>(null);
  const [form, setForm] = useState<EditForm>(emptyForm);
  const [formErrors, setFormErrors] = useState<Partial<EditForm>>({});
  const [saving, setSaving] = useState(false);

  const [rejecting, setRejecting] = useState<ProductRecord | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectError, setRejectError] = useState('');

  const [deleting, setDeleting] = useState<ProductRecord | null>(null);

  const categoryNames = useMemo(() => {
    const map = new Map<string, string>();
    categories.data.forEach((category) => map.set(category.id, category.name));
    return map;
  }, [categories.data]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    return products.data.filter((product) => {
      if (statusFilter !== 'all' && product.status !== statusFilter) return false;

      if (visibilityFilter === 'visible' && product.hidden) return false;
      if (visibilityFilter === 'hidden' && !product.hidden) return false;
      if (visibilityFilter === 'featured' && !product.featured) return false;

      if (!term) return true;

      return (
        product.title.toLowerCase().includes(term) ||
        product.storeName.toLowerCase().includes(term)
      );
    });
  }, [products.data, search, statusFilter, visibilityFilter]);

  const pendingCount = useMemo(
    () => products.data.filter((product) => product.status === 'pending').length,
    [products.data]
  );

  const openEdit = (product: ProductRecord) => {
    setEditing(product);
    setForm({
      title: product.title,
      description: product.description,
      price: String(product.price),
      stock: String(product.stock),
      categoryId: product.categoryId
    });
    setFormErrors({});
  };

  const validateForm = (): boolean => {
    const errors: Partial<EditForm> = {};

    if (form.title.trim().length < 3) errors.title = 'El título debe tener al menos 3 caracteres.';

    const price = Number(form.price);
    if (!Number.isFinite(price) || price <= 0) {
      errors.price = 'El precio debe ser un número mayor que cero.';
    }

    const stock = Number(form.stock);
    if (!Number.isInteger(stock) || stock < 0) {
      errors.stock = 'El stock debe ser un número entero de cero o más.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editing || !validateForm()) return;

    setSaving(true);

    try {
      await updateProduct(editing, {
        title: form.title.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        stock: Number(form.stock),
        categoryId: form.categoryId
      });

      notifySuccess('El producto se actualizó.');
      setEditing(null);
    } catch (error) {
      notifyError(error);
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = (product: ProductRecord) =>
    run(`approve-${product.id}`, async () => {
      try {
        await approveProduct(product);
        notifySuccess(`${product.title} ya está publicado.`);
      } catch (error) {
        notifyError(error);
      }
    });

  const handleReject = () => {
    if (!rejecting) return;

    if (rejectReason.trim().length < 5) {
      setRejectError('Explica brevemente el motivo del rechazo.');
      return;
    }

    return run(`reject-${rejecting.id}`, async () => {
      try {
        await rejectProduct(rejecting, rejectReason.trim());
        notifySuccess(`Se rechazó ${rejecting.title}.`);
        setRejecting(null);
        setRejectReason('');
        setRejectError('');
      } catch (error) {
        notifyError(error);
      }
    });
  };

  const handleFeatured = (product: ProductRecord) =>
    run(`feature-${product.id}`, async () => {
      try {
        await setProductFeatured(product, !product.featured);
        notifySuccess(
          product.featured
            ? `${product.title} ya no está destacado.`
            : `${product.title} aparecerá como destacado.`
        );
      } catch (error) {
        notifyError(error);
      }
    });

  const handleHidden = (product: ProductRecord) =>
    run(`hide-${product.id}`, async () => {
      try {
        await setProductHidden(product, !product.hidden);
        notifySuccess(
          product.hidden
            ? `${product.title} vuelve a ser visible.`
            : `${product.title} quedó oculto en la tienda.`
        );
      } catch (error) {
        notifyError(error);
      }
    });

  const handleDelete = () => {
    if (!deleting) return;

    return run(`delete-${deleting.id}`, async () => {
      try {
        await deleteProduct(deleting);
        notifySuccess(`${deleting.title} fue eliminado.`);
        setDeleting(null);
      } catch (error) {
        notifyError(error);
      }
    });
  };

  return (
    <>
      <PageHeader
        title="Productos"
        description="Revisa, publica y controla todo lo que se vende en Zyplaza"
      />

      {pendingCount > 0 ? (
        <Card className="mb-4 border-amber-300 bg-amber-50 p-4 dark:border-amber-500/40 dark:bg-amber-500/10">
          <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
            Hay {pendingCount} {pendingCount === 1 ? 'producto' : 'productos'} esperando revisión.
          </p>
          <button
            type="button"
            onClick={() => setStatusFilter('pending')}
            className="mt-1 text-xs font-semibold text-amber-800 underline dark:text-amber-300"
          >
            Revisarlos ahora
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
              placeholder="Buscar por producto o tienda"
              className="pl-9"
              aria-label="Buscar productos"
            />
          </div>

          <Select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
            aria-label="Filtrar por estado"
            className="sm:w-44"
          >
            <option value="all">Todos los estados</option>
            <option value="pending">Pendientes</option>
            <option value="approved">Aprobados</option>
            <option value="rejected">Rechazados</option>
          </Select>

          <Select
            value={visibilityFilter}
            onChange={(event) => setVisibilityFilter(event.target.value as VisibilityFilter)}
            aria-label="Filtrar por visibilidad"
            className="sm:w-44"
          >
            <option value="all">Toda la visibilidad</option>
            <option value="visible">Visibles</option>
            <option value="hidden">Ocultos</option>
            <option value="featured">Destacados</option>
          </Select>
        </div>
      </Card>

      <Card>
        {products.loading ? (
          <LoadingState label="Cargando productos…" />
        ) : products.error ? (
          <ErrorState message={products.error} onRetry={products.retry} />
        ) : filtered.length === 0 ? (
          <EmptyState
            title={products.data.length === 0 ? 'Todavía no hay productos' : 'Sin resultados'}
            description={
              products.data.length === 0
                ? 'Cuando los vendedores publiquen artículos aparecerán aquí para su revisión.'
                : 'Prueba con otro término o cambia los filtros.'
            }
            icon={<Package className="h-6 w-6" />}
          />
        ) : (
          <>
            <ul className="divide-y divide-slate-200 dark:divide-white/10">
              {filtered.map((product) => (
                <li key={product.id} className="p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.title}
                        className="h-16 w-16 shrink-0 rounded-lg object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400 dark:bg-white/10">
                        <Package className="h-6 w-6" />
                      </span>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {product.title}
                        </p>
                        <Badge tone={STATUS_TONES[product.status]}>
                          {PRODUCT_STATUS_LABELS[product.status]}
                        </Badge>
                        {product.featured ? <Badge tone="info">Destacado</Badge> : null}
                        {product.hidden ? <Badge tone="neutral">Oculto</Badge> : null}
                      </div>

                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        {product.storeName} ·{' '}
                        {categoryNames.get(product.categoryId) ?? 'Sin categoría'} ·{' '}
                        {formatDate(product.createdAt)}
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {formatCurrency(product.price)}
                        </span>
                        <span
                          className={cx(
                            'text-xs font-medium',
                            product.stock === 0
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-slate-600 dark:text-slate-300'
                          )}
                        >
                          {product.stock === 0
                            ? 'Sin stock'
                            : `${formatNumber(product.stock)} en stock`}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {formatNumber(product.soldCount)} vendidos
                        </span>
                      </div>

                      {product.status === 'rejected' && product.rejectionReason ? (
                        <p className="mt-2 rounded-lg bg-red-50 p-2 text-xs text-red-700 dark:bg-red-500/10 dark:text-red-300">
                          Motivo: {product.rejectionReason}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {product.status !== 'approved' ? (
                      <Button
                        variant="success"
                        loading={isPending(`approve-${product.id}`)}
                        onClick={() => handleApprove(product)}
                        icon={<Check className="h-4 w-4" />}
                      >
                        Aprobar
                      </Button>
                    ) : null}

                    {product.status !== 'rejected' ? (
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setRejecting(product);
                          setRejectReason('');
                          setRejectError('');
                        }}
                        icon={<X className="h-4 w-4" />}
                      >
                        Rechazar
                      </Button>
                    ) : null}

                    <Button
                      variant="secondary"
                      onClick={() => openEdit(product)}
                      icon={<Pencil className="h-4 w-4" />}
                    >
                      Editar
                    </Button>

                    <Button
                      variant="secondary"
                      loading={isPending(`feature-${product.id}`)}
                      onClick={() => handleFeatured(product)}
                      icon={
                        <Star
                          className={cx('h-4 w-4', product.featured && 'fill-amber-400 text-amber-500')}
                        />
                      }
                    >
                      {product.featured ? 'Quitar destacado' : 'Destacar'}
                    </Button>

                    <Button
                      variant="secondary"
                      loading={isPending(`hide-${product.id}`)}
                      onClick={() => handleHidden(product)}
                      icon={
                        product.hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />
                      }
                    >
                      {product.hidden ? 'Mostrar' : 'Ocultar'}
                    </Button>

                    <Button
                      variant="danger"
                      onClick={() => setDeleting(product)}
                      icon={<Trash2 className="h-4 w-4" />}
                    >
                      Eliminar
                    </Button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t border-slate-200 px-4 py-3 text-xs text-slate-500 dark:border-white/10 dark:text-slate-400">
              Mostrando {filtered.length} de {products.data.length} productos
            </div>
          </>
        )}
      </Card>

      <Modal
        open={editing !== null}
        title="Editar producto"
        description="Puedes ajustar precio, stock y categoría."
        onClose={() => setEditing(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditing(null)}>
              Cancelar
            </Button>
            <Button form="product-edit-form" type="submit" loading={saving}>
              Guardar cambios
            </Button>
          </>
        }
      >
        <form id="product-edit-form" onSubmit={handleSave} noValidate className="space-y-4">
          <Field label="Título" error={formErrors.title}>
            <Input
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
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
            <Field label="Precio (RD$)" error={formErrors.price}>
              <Input
                type="number"
                min={0}
                step={1}
                value={form.price}
                onChange={(event) => setForm({ ...form, price: event.target.value })}
              />
            </Field>

            <Field label="Stock disponible" error={formErrors.stock}>
              <Input
                type="number"
                min={0}
                step={1}
                value={form.stock}
                onChange={(event) => setForm({ ...form, stock: event.target.value })}
              />
            </Field>
          </div>

          <Field label="Categoría">
            <Select
              value={form.categoryId}
              onChange={(event) => setForm({ ...form, categoryId: event.target.value })}
            >
              <option value="">Sin categoría</option>
              {categories.data.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          </Field>
        </form>
      </Modal>

      <Modal
        open={rejecting !== null}
        title="Rechazar producto"
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
              Rechazar
            </Button>
          </>
        }
      >
        <p className="mb-3 text-sm text-slate-700 dark:text-slate-200">
          El vendedor verá el motivo para poder corregirlo.
        </p>

        <Field label="Motivo del rechazo" error={rejectError}>
          <Textarea
            value={rejectReason}
            onChange={(event) => {
              setRejectReason(event.target.value);
              setRejectError('');
            }}
            placeholder="Ej: Las fotos no corresponden al producto descrito."
            autoFocus
          />
        </Field>
      </Modal>

      <Modal
        open={deleting !== null}
        title="Eliminar producto"
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
          Vas a eliminar <strong className="font-semibold">{deleting?.title}</strong> de forma
          permanente.
        </p>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Si solo quieres retirarlo de la tienda sin borrarlo, usa la opción{' '}
          <strong className="font-semibold">Ocultar</strong>.
        </p>
      </Modal>

      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </>
  );
};

export default ProductsPage;
