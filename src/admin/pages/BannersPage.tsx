import React, { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Image as ImageIcon, Pencil, Plus, Trash2 } from 'lucide-react';
import type { BannerRecord, BannerSlot } from '../../types/admin';
import {
  createBanner,
  deleteBanner,
  reorderBanners,
  subscribeBanners,
  updateBanner
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

type BannerForm = {
  title: string;
  imageUrl: string;
  linkUrl: string;
  slot: BannerSlot;
  active: boolean;
};

const emptyForm: BannerForm = {
  title: '',
  imageUrl: '',
  linkUrl: '',
  slot: 'main',
  active: true
};

const BannersPage: React.FC = () => {
  const { toasts, dismissToast, notifySuccess, notifyError } = useToasts();
  const { isPending, run } = useAsyncAction();

  const banners = useFirestoreSubscription<BannerRecord[]>(subscribeBanners, []);

  const [editing, setEditing] = useState<BannerRecord | null>(null);
  const [form, setForm] = useState<BannerForm>(emptyForm);
  const [formErrors, setFormErrors] = useState<Partial<BannerForm>>({});
  const [saving, setSaving] = useState(false);

  const [deleting, setDeleting] = useState<BannerRecord | null>(null);

  const sortedBanners = useMemo(
    () => [...banners.data].sort((a, b) => a.order - b.order),
    [banners.data]
  );

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm });
    setFormErrors({});
  };

  const openEdit = (banner: BannerRecord) => {
    setEditing(banner);
    setForm({
      title: banner.title,
      imageUrl: banner.imageUrl,
      linkUrl: banner.linkUrl,
      slot: banner.slot,
      active: banner.active
    });
    setFormErrors({});
  };

  const validate = (): boolean => {
    const errors: Partial<BannerForm> = {};

    if (form.title.trim().length < 3) {
      errors.title = 'El título debe tener al menos 3 caracteres.';
    }

    if (form.imageUrl.trim().length === 0) {
      errors.imageUrl = 'La URL de la imagen es obligatoria.';
    } else if (!form.imageUrl.trim().startsWith('http')) {
      errors.imageUrl = 'Debe ser una URL válida que empiece con http o https.';
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
        ...form,
        order: editing ? editing.order : sortedBanners.length
      };

      if (editing) {
        await updateBanner(editing.id, input);
        notifySuccess('El banner se actualizó.');
      } else {
        await createBanner(input);
        notifySuccess('El banner se creó.');
      }

      setEditing(undefined as unknown as null);
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
        await deleteBanner(deleting);
        notifySuccess(`${deleting.title} fue eliminado.`);
        setDeleting(null);
      } catch (error) {
        notifyError(error);
      }
    });
  };

  const move = async (index: number, direction: 'up' | 'down') => {
    if (index === undefined) return;
    const target = index + (direction === 'up' ? -1 : 1);
    if (target < 0 || target >= sortedBanners.length) return;

    const reordered = [...sortedBanners];
    const temp = reordered[index];
    reordered[index] = reordered[target];
    reordered[target] = temp;

    return run(`reorder-${index}`, async () => {
      try {
        await reorderBanners(reordered);
        notifySuccess('Orden actualizado.');
      } catch (error) {
        notifyError(error);
      }
    });
  };

  const handleToggleActive = (banner: BannerRecord) =>
    run(`active-${banner.id}`, async () => {
      try {
        await updateBanner(banner.id, {
          title: banner.title,
          imageUrl: banner.imageUrl,
          linkUrl: banner.linkUrl,
          slot: banner.slot,
          active: !banner.active,
          order: banner.order
        });
        notifySuccess(banner.active ? 'Banner desactivado.' : 'Banner activado.');
      } catch (error) {
        notifyError(error);
      }
    });

  return (
    <>
      <PageHeader
        title="Banners"
        description="Crea y ordena los banners que se muestran en la app"
        actions={
          <Button onClick={openCreate} icon={<Plus className="h-4 w-4" />}>
            Nuevo banner
          </Button>
        }
      />

      <Card>
        {banners.loading ? (
          <LoadingState label="Cargando banners…" />
        ) : banners.error ? (
          <ErrorState message={banners.error} onRetry={banners.retry} />
        ) : sortedBanners.length === 0 ? (
          <EmptyState
            title="No hay banners"
            description="Los banners aparecerán aquí para publicarlos en la app."
            icon={<ImageIcon className="h-6 w-6" />}
            action={
              <Button onClick={openCreate} icon={<Plus className="h-4 w-4" />}>
                Crear primer banner
              </Button>
            }
          />
        ) : (
          <>
            <ul className="divide-y divide-slate-200 dark:divide-white/10">
              {sortedBanners.map((banner, index) => (
                <li key={banner.id} className="p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                    {banner.imageUrl ? (
                      <img
                        src={banner.imageUrl}
                        alt={banner.title}
                        className="h-16 w-28 shrink-0 rounded-lg object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <span className="flex h-16 w-28 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400 dark:bg-white/10">
                        <ImageIcon className="h-6 w-6" />
                      </span>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-slate-900 dark:text-white">{banner.title}</p>
                        <Badge tone={banner.active ? 'success' : 'neutral'}>
                          {banner.active ? 'Activo' : 'Inactivo'}
                        </Badge>
                        <Badge tone="info">{banner.slot === 'main' ? 'Principal' : 'Secundario'}</Badge>
                      </div>

                      {banner.linkUrl ? (
                        <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                          {banner.linkUrl}
                        </p>
                      ) : null}

                      <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                        Orden {banner.order + 1} de {sortedBanners.length}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => openEdit(banner)}
                      icon={<Pencil className="h-4 w-4" />}
                    >
                      Editar
                    </Button>

                    <Button
                      variant="secondary"
                      loading={isPending(`active-${banner.id}`)}
                      onClick={() => handleToggleActive(banner)}
                    >
                      {banner.active ? 'Desactivar' : 'Activar'}
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
                      disabled={index === sortedBanners.length - 1}
                      onClick={() => move(index, 'down')}
                      icon={<ArrowDown className="h-4 w-4" />}
                    >
                      Bajar
                    </Button>

                    <Button
                      variant="danger"
                      onClick={() => setDeleting(banner)}
                      icon={<Trash2 className="h-4 w-4" />}
                    >
                      Eliminar
                    </Button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t border-slate-200 px-4 py-3 text-xs text-slate-500 dark:border-white/10 dark:text-slate-400">
              {sortedBanners.length} {sortedBanners.length === 1 ? 'banner' : 'banners'}
            </div>
          </>
        )}
      </Card>

      <Modal
        open={editing !== null}
        title={editing ? 'Editar banner' : 'Nuevo banner'}
        description="Completa los datos del banner. El orden se asigna automáticamente."
        onClose={() => setEditing(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditing(null)}>
              Cancelar
            </Button>
            <Button form="banner-form" type="submit" loading={saving}>
              {editing ? 'Guardar cambios' : 'Crear banner'}
            </Button>
          </>
        }
      >
        <form id="banner-form" onSubmit={handleSave} noValidate className="space-y-4">
          <Field label="Título" error={formErrors.title}>
            <Input
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              autoFocus
            />
          </Field>

          <Field label="URL de la imagen" error={formErrors.imageUrl}>
            <Input
              value={form.imageUrl}
              onChange={(event) => setForm({ ...form, imageUrl: event.target.value })}
              placeholder="https://"
            />
          </Field>

          <Field label="Enlace (opcional)">
            <Input
              value={form.linkUrl}
              onChange={(event) => setForm({ ...form, linkUrl: event.target.value })}
              placeholder="https://"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Ubicación">
              <Select
                value={form.slot}
                onChange={(event) => setForm({ ...form, slot: event.target.value as BannerSlot })}
              >
                <option value="main">Principal</option>
                <option value="secondary">Secundario</option>
              </Select>
            </Field>

            <Field label="Activo">
              <div className="pt-2">
                <Toggle
                  checked={form.active}
                  onChange={(value) => setForm({ ...form, active: value })}
                  label="Banner activo"
                />
              </div>
            </Field>
          </div>
        </form>
      </Modal>

      <Modal
        open={deleting !== null}
        title="Eliminar banner"
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
      </Modal>

      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </>
  );
};

export default BannersPage;
