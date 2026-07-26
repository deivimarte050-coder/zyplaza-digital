import { doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import { COLLECTIONS, SETTINGS_DOC_ID, toBoolean, toDate, toNumber, toText } from '../lib/collections';
import { getDb } from '../lib/firebase';
import type { PaymentMethodSetting, SettingsRecord } from '../types/admin';
import { logAdminAction } from './audit';

export const DEFAULT_PAYMENT_METHODS: PaymentMethodSetting[] = [
  { id: 'cash', label: 'Efectivo al recibir', enabled: true },
  { id: 'transfer', label: 'Transferencia bancaria', enabled: true },
  { id: 'card', label: 'Tarjeta de crédito o débito', enabled: false },
  { id: 'paypal', label: 'PayPal', enabled: false }
];

export const DEFAULT_SETTINGS: SettingsRecord = {
  siteName: 'Zyplaza',
  logoUrl: '',
  commissionRate: 5,
  whatsapp: '',
  supportEmail: '',
  facebook: '',
  instagram: '',
  tiktok: '',
  paymentMethods: DEFAULT_PAYMENT_METHODS,
  maintenanceMode: false,
  maintenanceMessage: 'Estamos realizando mejoras. Vuelve en unos minutos.',
  updatedAt: null
};

function mapPaymentMethods(value: unknown): PaymentMethodSetting[] {
  if (!Array.isArray(value) || value.length === 0) return DEFAULT_PAYMENT_METHODS;

  return value.map((raw) => {
    const method = (raw ?? {}) as Record<string, unknown>;
    return {
      id: toText(method.id, 'metodo'),
      label: toText(method.label, 'Método de pago'),
      enabled: toBoolean(method.enabled)
    };
  });
}

export function mapSettings(data: Record<string, unknown>): SettingsRecord {
  return {
    siteName: toText(data.siteName, DEFAULT_SETTINGS.siteName),
    logoUrl: toText(data.logoUrl),
    commissionRate: toNumber(data.commissionRate, DEFAULT_SETTINGS.commissionRate),
    whatsapp: toText(data.whatsapp),
    supportEmail: toText(data.supportEmail),
    facebook: toText(data.facebook),
    instagram: toText(data.instagram),
    tiktok: toText(data.tiktok),
    paymentMethods: mapPaymentMethods(data.paymentMethods),
    maintenanceMode: toBoolean(data.maintenanceMode),
    maintenanceMessage: toText(data.maintenanceMessage, DEFAULT_SETTINGS.maintenanceMessage),
    updatedAt: toDate(data.updatedAt)
  };
}

function settingsRef() {
  return doc(getDb(), COLLECTIONS.settings, SETTINGS_DOC_ID);
}

export function subscribeSettings(
  onData: (settings: SettingsRecord) => void,
  onError: (error: unknown) => void
): () => void {
  return onSnapshot(
    settingsRef(),
    (snapshot) => onData(snapshot.exists() ? mapSettings(snapshot.data()) : DEFAULT_SETTINGS),
    onError
  );
}

export async function saveSettings(settings: Omit<SettingsRecord, 'updatedAt'>): Promise<void> {
  await setDoc(settingsRef(), { ...settings, updatedAt: serverTimestamp() }, { merge: true });

  await logAdminAction({
    action: 'settings.updated',
    targetType: 'settings',
    targetId: SETTINGS_DOC_ID,
    description: 'Actualizó la configuración general de Zyplaza'
  });
}
