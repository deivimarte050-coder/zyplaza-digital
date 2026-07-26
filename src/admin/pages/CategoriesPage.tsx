import React, { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Folder, Pencil, Plus, Tag, Trash2 } from 'lucide-react';
import type { CategoryRecord } from '../../types/admin';
import {
  createCategory,
  deleteCategory,
  reorderCategories,
  slugify,
  subscribeCategories,
  updateCategory
} from '../../services/catalog';
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
  ToastStack,
  Toggle
} from '../components/ui';

type CategoryForm = {
  name: string;
  slug: string;
  parentId: string;
  icon: string;
  active: boolean;
};

const emptyForm: CategoryForm = {
  name: '',
  slug: '',
  parentId: '',
  icon: '',
  active: true
};

const CategoriesPage: React.FC = () => {
  const { toasts, dismissToast, notifySuccess, notifyError } = useToasts();
  const { isPending, run } = useAsyncAction();

  const categories = useFirestoreSubscription<CategoryRecord[]>(subscribeCategories, []);

  const [editing, setEditing] = useState<CategoryRecord | null>(null);
  const [form, setForm] = useState<CategoryForm>(emptyForm);
  const [formErrors, setFormErrors] = useState<Partial<CategoryForm>>({});
  const [saving, setSaving] = useState(false);

  const [deleting, setDeleting] = useState<CategoryRecord | null>(null);

  const sortedCategories = useMemo(
    () => [...categories.data].sort((a, b) => a.order - b.order),
    [categories.data]
  );

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm });
    setFormErrors({});
  };

  const openEdit = (category: CategoryRecord) => {
    setEditing(category);
    setForm({
      name: category.name,
      slug: category.slug,
      parentId: category.parentId ?? '',
      icon: category.icon,
      active: category.active
    });
    setFormErrors({});
  };

  const onNameChange = (name: string) => {
    setForm((current) => ({
      ...current,
      name,
      slug: editing && current.slug === editing.slug ? current.slug : slugify(name)
    }));
  };

  const validate = (): boolean => {
    const errors: Partial<CategoryForm> = {};

    if (form.name.trim().length < 2) {
      errors.name = 'El nombre debe tener al menos 2 caracteres.';
    }

    if (form.slug.trim().length === 0) {
      errors.slug = 'El slug es obligatorio.';
    } else if (!/^[a-z0-9-]+$/.test(form.slug)) {
      errors.slug = 'Solo letras minúsculas, números y guiones.';
    }

    if (editing && form.parentId === editing.id) {
      errors.parentId = 'Una categoría no puede ser hija de sí misma.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    setSaving(true);

    try {
      const input = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        parentId: form.parentId || null,
        icon: form.icon.trim(),
        active: form.active,
        order: editing ? editing.order : sortedCategories.length
      };

      if (editing) {
        await updateCategory(editing.id, input);
        notifySuccess('La categoría se actualizó.');
      } else {
        await createCategory(input);
        notifySuccess('La categoría se creó.');
      }

      setEditing(null);
      setForm(emptyForm);
    } catch (error) {
      notifyError(error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!deleting) return;

    return run(`delete-${deleting.id}`, async () => {
      try {
        await deleteCategory(deleting);
        notifySuccess(`${deleting.name} fue eliminada.`);
        setDeleting(null);
      } catch (error) {
        notifyError(error);
      }
    });
  };

  const move = async (index: number, direction: 'up' | 'down') => {
    const target = index + (direction === 'up' ? -1 : 1);
    if (target < 0 || target >= sortedCategories.length) return;

    const reordered = [...sortedCategories];
    const temp = reordered[index];
    reordered[index] = reordered[target];
    reordered[target] = temp;

    return run(`reorder-${index}`, async () => {
      try {
        await reorderCategories(reordered);
        notifySuccess('Orden actualizado.');
      } catch (error) {
        notifyError(error);
      }
    });
  };

  const parentOptions = sortedCategories.filter((c) => !editing || c.id !== editing.id);

  return (
    <>
      <PageHeader
        title="Categorías"
        description="Organiza cómo se clasifican los productos en la tienda"
        actions={
          <Button onClick={openCreate} icon={<Plus className="h-4 w-4" />}>
            Nueva categoría
          </Button>
        }
      />

      <Card>
        {categories.loading ? (
          <LoadingState label="Cargando categorías…" />
        ) : categories.error ? (
          <ErrorState message={categories.error} onRetry={categories.retry} />
        ) : sortedCategories.length === 0 ? (
          <EmptyState
            title="No hay categorías"
            description="Crea las categorías que usarán los vendedores para clasificar productos."
            icon={<Folder className="h-6 w-6" />}
            action={
              <Button onClick={openCreate} icon={<Plus className="h-4 w-4" />}>
                Crear primera categoría
              </Button>
            }
          />
        ) : (
          <>
            <ul className="divide-y divide-slate-200 dark:divide-white/10">
              {sortedCategories.map((category, index) => (
                <li key={category.id} className="p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400 dark:bg-white/10">
                      {category.icon ? (
                        <span className="text-lg">{category.icon}</span>
                      ) : (
                        <Tag className="h-5 w-5" />
                      )}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {category.name}
                        </p>
                        <Badge tone={category.active ? 'success' : 'neutral'}>
                          {category.active ? 'Activa' : 'Inactiva'}
                        </Badge>
                      </div>

                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        /{category.slug}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => openEdit(category)}
                      icon={<Pencil className="h-4 w-4" />}
                    >
                      Editar
                    </Button>

                    <Button
                      variant="secondary"
                      disabled={index === 0}
                      onClick={() => move(index, 'up')}
                      icon={<ArrowUp className="h-4 w-4" />}
                    >
                      Subir
                    </Button>

                    <Button
                      variant="secondary"
                      disabled={index === sortedCategories.length - 1}
                      onClick={() => move(index, 'down')}
                      icon={<ArrowDown className="h-4 w-4" />}
                    >
                      Bajar
                    </Button>

                    <Button
                      variant="danger"
                      onClick={() => setDeleting(category)}
                      icon={<Trash2 className="h-4 w-4" />}
                    >
                      Eliminar
                    </Button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t border-slate-200 px-4 py-3 text-xs text-slate-500 dark:border-white/10 dark:text-slate-400">
              {sortedCategories.length}{' '}
              {sortedCategories.length === 1 ? 'categoría' : 'categorías'}
            </div>
          </>
        )}
      </Card>

      <Modal
        open={editing !== null}
        title={editing ? 'Editar categoría' : 'Nueva categoría'}
        description="El slug se genera automáticamente desde el nombre."
        onClose={() => setEditing(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditing(null)}>
              Cancelar
            </Button>
            <Button form="category-form" type="submit" loading={saving}>
              {editing ? 'Guardar cambios' : 'Crear categoría'}
            </Button>
          </>
        }
      >
        <form id="category-form" onSubmit={handleSave} noValidate className="space-y-4">
          <Field label="Nombre" error={formErrors.name}>
            <Input
              value={form.name}
              onChange={(event) => onNameChange(event.target.value)}
              autoFocus
            />
          </Field>

          <Field label="Slug" error={formErrors.slug}>
            <Input
              value={form.slug}
              onChange={(event) => setForm({ ...form, slug: slugify(event.target.value) })}
            />
          </Field>

          <Field label="Categoría padre" error={formErrors.parentId}>
            <Select
              value={form.parentId}
              onChange={(event) => setForm({ ...form, parentId: event.target.value })}
            >
              <option value="">Ninguna</option>
              {parentOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Icono (emoji, opcional)" hint="Puedes usar un emoji de una sola letra o símbolo.">
            <Input
              value={form.icon}
              onChange={(event) => setForm({ ...form, icon: event.target.value })}
              placeholder="Ej: 📱"
            />
          </Field>

          <Field label="Activa">
            <div className="pt-2">
              <Toggle
                checked={form.active}
                onChange={(value) => setForm({ ...form, active: value })}
                label="Categoría activa"
              />
            </div>
          </Field>
        </form>
      </Modal>

      <Modal
        open={deleting !== null}
        title="Eliminar categoría"
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
          Vas a eliminar <strong className="font-semibold">{deleting?.name}</strong> de forma
          permanente.
        </p>
      </Modal>

      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </>
  );
};

export default CategoriesPage;
