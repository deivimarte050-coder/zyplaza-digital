const currencyFormatter = new Intl.NumberFormat('es-DO', {
  style: 'currency',
  currency: 'DOP',
  maximumFractionDigits: 0
});

const numberFormatter = new Intl.NumberFormat('es-DO');

const dateFormatter = new Intl.DateTimeFormat('es-DO', {
  day: '2-digit',
  month: 'short',
  year: 'numeric'
});

const dateTimeFormatter = new Intl.DateTimeFormat('es-DO', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
});

export function formatCurrency(value: number): string {
  return currencyFormatter.format(Number.isFinite(value) ? value : 0);
}

export function formatNumber(value: number): string {
  return numberFormatter.format(Number.isFinite(value) ? value : 0);
}

export function formatDate(value: Date | null): string {
  return value ? dateFormatter.format(value) : '—';
}

export function formatDateTime(value: Date | null): string {
  return value ? dateTimeFormatter.format(value) : '—';
}

/** Devuelve un texto tipo "hace 5 minutos" */
export function formatRelative(value: Date | null): string {
  if (!value) return '—';

  const seconds = Math.round((Date.now() - value.getTime()) / 1000);

  if (seconds < 60) return 'hace un momento';
  if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    return `hace ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
  }
  if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600);
    return `hace ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
  }
  if (seconds < 2592000) {
    const days = Math.floor(seconds / 86400);
    return `hace ${days} ${days === 1 ? 'día' : 'días'}`;
  }

  return formatDate(value);
}

export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part.charAt(0).toUpperCase()).join('') || '?';
}
