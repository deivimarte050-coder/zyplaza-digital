import React, { useEffect, useState } from 'react';
import { Save, Settings } from 'lucide-react';
import type { PaymentMethodSetting, SettingsRecord } from '../../types/admin';
import { DEFAULT_SETTINGS, saveSettings, subscribeSettings } from '../../services/settings';
import { useFirestoreSubscription, useToasts } from '../hooks/useAdminData';
import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  Field,
  Input,
  LoadingState,
  PageHeader,
  Textarea,
  ToastStack,
  Toggle
} from '../components/ui';

type Form = SettingsRecord;

const emptyForm: Form = {
  ...DEFAULT_SETTINGS
};

const SettingsPage: React.FC = () => {
  const { toasts, dismissToast, notifySuccess, notifyError } = useToasts();
  const settings = useFirestoreSubscription<SettingsRecord>(subscribeSettings, emptyForm);

  const [form, setForm] = useState<Form>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});

  useEffect(() => {
    if (settings.loading) return;
    setForm({
      siteName: settings.data.siteName,
      logoUrl: settings.data.logoUrl,
      commissionRate: settings.data.commissionRate,
      whatsapp: settings.data.whatsapp,
      supportEmail: settings.data.supportEmail,
      facebook: settings.data.facebook,
      instagram: settings.data.instagram,
      tiktok: settings.data.tiktok,
      paymentMethods: settings.data.paymentMethods,
      maintenanceMode: settings.data.maintenanceMode,
      maintenanceMessage: settings.data.maintenanceMessage,
      updatedAt: settings.data.updatedAt
    });
  }, [settings.data, settings.loading]);

  const validate = (): boolean => {
    const next: Partial<Record<keyof Form, string>> = {};

    if (form.siteName.trim().length < 2) {
      next.siteName = 'El nombre del sitio debe tener al menos 2 caracteres.';
    }

    if (!Number.isFinite(form.commissionRate) || form.commissionRate < 0 || form.commissionRate > 100) {
      next.commissionRate = 'La comisión debe ser un porcentaje entre 0 y 100.';
    }

    if (form.supportEmail && !/^\S+@\S+\.\S+$/.test(form.supportEmail)) {
      next.supportEmail = 'Introduce un correo válido.';
    }

    if (form.whatsapp && !/^[0-9+\-\s]+$/.test(form.whatsapp)) {
      next.whatsapp = 'Introduce un número válido.';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    setSaving(true);

    try {
      await saveSettings(form);
      notifySuccess('La configuración se guardó.');
    } catch (error) {
      notifyError(error);
    } finally {
      setSaving(false);
    }
  };

  const setPaymentMethod = (id: string, enabled: boolean) => {
    setForm((current) => ({
      ...current,
      paymentMethods: current.paymentMethods.map((method: PaymentMethodSetting) =>
        method.id === id ? { ...method, enabled } : method
      )
    }));
  };

  return (
    <>
      <PageHeader
        title="Configuración"
        description="Ajusta la marca, comisiones, medios de pago y mantenimiento de Zyplaza"
      />

      {settings.loading ? (
        <LoadingState label="Cargando configuración…" />
      ) : settings.error ? (
        <ErrorState message={settings.error} onRetry={settings.retry} />
      ) : !settings.data ? (
        <EmptyState
          title="No se pudo cargar la configuración"
          description="Revisa la conexión e inténtalo de nuevo."
          icon={<Settings className="h-6 w-6" />}
        />
      ) : (
        <form onSubmit={handleSave} noValidate className="space-y-6">
          <Card className="p-5">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Marca</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Nombre del sitio" error={errors.siteName}>
                <Input
                  value={form.siteName}
                  onChange={(event) => setForm({ ...form, siteName: event.target.value })}
                />
              </Field>

              <Field label="URL del logo (opcional)">
                <Input
                  value={form.logoUrl}
                  onChange={(event) => setForm({ ...form, logoUrl: event.target.value })}
                  placeholder="https://"
                />
              </Field>
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Comisión y contacto</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <Field label="Comisión (%)" error={errors.commissionRate}>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  step={0.1}
                  value={String(form.commissionRate)}
                  onChange={(event) =>
                    setForm({ ...form, commissionRate: Number(event.target.value) })
                  }
                />
              </Field>

              <Field label="WhatsApp" error={errors.whatsapp}>
                <Input
                  value={form.whatsapp}
                  onChange={(event) => setForm({ ...form, whatsapp: event.target.value })}
                  placeholder="+1 809 000 0000"
                />
              </Field>

              <Field label="Email de soporte" error={errors.supportEmail}>
                <Input
                  type="email"
                  value={form.supportEmail}
                  onChange={(event) => setForm({ ...form, supportEmail: event.target.value })}
                  placeholder="soporte@zyplaza.com"
                />
              </Field>
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Redes sociales</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <Field label="Facebook">
                <Input
                  value={form.facebook}
                  onChange={(event) => setForm({ ...form, facebook: event.target.value })}
                  placeholder="https://facebook.com/..."
                />
              </Field>

              <Field label="Instagram">
                <Input
                  value={form.instagram}
                  onChange={(event) => setForm({ ...form, instagram: event.target.value })}
                  placeholder="https://instagram.com/..."
                />
              </Field>

              <Field label="TikTok">
                <Input
                  value={form.tiktok}
                  onChange={(event) => setForm({ ...form, tiktok: event.target.value })}
                  placeholder="https://tiktok.com/@..."
                />
              </Field>
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Métodos de pago</h2>
            <div className="mt-4 space-y-3">
              {form.paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className="flex items-center justify-between rounded-lg border border-slate-200 p-3 dark:border-white/10"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {method.label}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">ID: {method.id}</p>
                  </div>
                  <Toggle
                    checked={method.enabled}
                    onChange={(value) => setPaymentMethod(method.id, value)}
                    label={`Habilitar ${method.label}`}
                  />
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Mantenimiento</h2>
            <div className="mt-4 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    Modo mantenimiento
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Mientras esté activo, los compradores verán un mensaje de mantenimiento.
                  </p>
                </div>
                <Toggle
                  checked={form.maintenanceMode}
                  onChange={(value) => setForm({ ...form, maintenanceMode: value })}
                  label="Modo mantenimiento"
                />
              </div>

              {form.maintenanceMode ? (
                <Field label="Mensaje de mantenimiento">
                  <Textarea
                    value={form.maintenanceMessage}
                    onChange={(event) =>
                      setForm({ ...form, maintenanceMessage: event.target.value })
                    }
                  />
                </Field>
              ) : null}
            </div>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" loading={saving} icon={<Save className="h-4 w-4" />}>
              Guardar configuración
            </Button>
          </div>
        </form>
      )}

      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </>
  );
};

export default SettingsPage;
