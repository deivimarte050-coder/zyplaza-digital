import React, { useEffect } from 'react';
import { AlertTriangle, Check, Info, Loader2, X } from 'lucide-react';

export function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

/* --------------------------------- Botón --------------------------------- */

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';

const BUTTON_STYLES: Record<ButtonVariant, string> = {
  primary:
    'bg-[#FF6A00] text-white hover:bg-[#e85f00] focus-visible:outline-[#FF6A00] disabled:bg-[#FF6A00]/50',
  secondary:
    'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 dark:bg-white/5 dark:text-slate-100 dark:border-white/10 dark:hover:bg-white/10',
  ghost:
    'bg-transparent text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10',
  danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-600/50',
  success: 'bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-emerald-600/50'
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  loading = false,
  icon,
  children,
  className,
  disabled,
  ...rest
}) => (
  <button
    {...rest}
    disabled={disabled || loading}
    className={cx(
      'inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold',
      'transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
      'disabled:cursor-not-allowed disabled:opacity-70',
      BUTTON_STYLES[variant],
      className
    )}
  >
    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
    {children}
  </button>
);

/* ------------------------------- Contenedor ------------------------------- */

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className
}) => (
  <div
    className={cx(
      'rounded-xl border border-slate-200 bg-white shadow-sm',
      'dark:border-white/10 dark:bg-[#15161a]',
      className
    )}
  >
    {children}
  </div>
);

export const PageHeader: React.FC<{
  title: string;
  description: string;
  actions?: React.ReactNode;
}> = ({ title, description, actions }) => (
  <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
    <div>
      <h1 className="text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">{title}</h1>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{description}</p>
    </div>
    {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
  </div>
);

/* --------------------------------- Badge ---------------------------------- */

export type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

const BADGE_STYLES: Record<BadgeTone, string> = {
  neutral: 'bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200',
  success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300',
  warning: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300',
  danger: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300',
  info: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300'
};

export const Badge: React.FC<{ tone?: BadgeTone; children: React.ReactNode }> = ({
  tone = 'neutral',
  children
}) => (
  <span
    className={cx(
      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
      BADGE_STYLES[tone]
    )}
  >
    {children}
  </span>
);

/* ------------------------------- Formularios ------------------------------ */

interface FieldProps {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}

export const Field: React.FC<FieldProps> = ({ label, error, hint, children }) => (
  <label className="block">
    <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
      {label}
    </span>
    {children}
    {error ? (
      <span className="mt-1 block text-xs font-medium text-red-600 dark:text-red-400">{error}</span>
    ) : null}
    {!error && hint ? (
      <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">{hint}</span>
    ) : null}
  </label>
);

export const inputClasses =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 ' +
  'placeholder:text-slate-400 focus:border-[#FF6A00] focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/20 ' +
  'disabled:bg-slate-50 disabled:text-slate-500 ' +
  'dark:border-white/15 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500 dark:disabled:bg-white/5';

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({
  className,
  ...rest
}) => <input {...rest} className={cx(inputClasses, className)} />;

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = ({
  className,
  children,
  ...rest
}) => (
  <select {...rest} className={cx(inputClasses, 'dark:[&>option]:bg-[#15161a]', className)}>
    {children}
  </select>
);

export const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = ({
  className,
  ...rest
}) => <textarea {...rest} className={cx(inputClasses, 'min-h-[90px] resize-y', className)} />;

export const Toggle: React.FC<{
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  disabled?: boolean;
}> = ({ checked, onChange, label, disabled }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    disabled={disabled}
    onClick={() => onChange(!checked)}
    className={cx(
      'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors',
      'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF6A00]',
      checked ? 'bg-[#FF6A00]' : 'bg-slate-300 dark:bg-white/20',
      disabled && 'cursor-not-allowed opacity-60'
    )}
  >
    <span
      className={cx(
        'inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow transition-transform',
        checked ? 'translate-x-6' : 'translate-x-1'
      )}
      style={{ height: '1.125rem', width: '1.125rem' }}
    />
  </button>
);

/* --------------------------------- Modal ---------------------------------- */

interface ModalProps {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: 'sm' | 'md' | 'lg';
}

const MODAL_WIDTH = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-3xl' } as const;

export const Modal: React.FC<ModalProps> = ({
  open,
  title,
  description,
  onClose,
  children,
  footer,
  width = 'md'
}) => {
  useEffect(() => {
    if (!open) return;

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className={cx(
          'animate-admin-scale my-auto w-full rounded-xl bg-white shadow-2xl dark:bg-[#15161a]',
          'border border-slate-200 dark:border-white/10',
          MODAL_WIDTH[width]
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5 dark:border-white/10">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">{title}</h2>
            {description ? (
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{description}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[65vh] overflow-y-auto p-5">{children}</div>

        {footer ? (
          <div className="flex flex-wrap justify-end gap-2 border-t border-slate-200 p-4 dark:border-white/10">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
};

/* ------------------------------- Estados UI ------------------------------- */

export const EmptyState: React.FC<{
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}> = ({ title, description, icon, action }) => (
  <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
    <div className="rounded-full bg-slate-100 p-3 text-slate-500 dark:bg-white/5 dark:text-slate-400">
      {icon ?? <Info className="h-6 w-6" />}
    </div>
    <div>
      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{title}</p>
      <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">
        {description}
      </p>
    </div>
    {action}
  </div>
);

export const LoadingState: React.FC<{ label?: string }> = ({ label = 'Cargando datos…' }) => (
  <div className="flex items-center justify-center gap-2 px-6 py-14 text-sm text-slate-500 dark:text-slate-400">
    <Loader2 className="h-4 w-4 animate-spin" />
    <span>{label}</span>
  </div>
);

export const ErrorState: React.FC<{ message: string; onRetry?: () => void }> = ({
  message,
  onRetry
}) => (
  <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
    <div className="rounded-full bg-red-100 p-3 text-red-600 dark:bg-red-500/15 dark:text-red-400">
      <AlertTriangle className="h-6 w-6" />
    </div>
    <p className="max-w-md text-sm font-medium text-slate-700 dark:text-slate-200">{message}</p>
    {onRetry ? (
      <Button variant="secondary" onClick={onRetry}>
        Reintentar
      </Button>
    ) : null}
  </div>
);

/* ------------------------------ Notificación ------------------------------ */

export interface ToastMessage {
  id: number;
  tone: 'success' | 'error';
  text: string;
}

export const ToastStack: React.FC<{
  toasts: ToastMessage[];
  onDismiss: (id: number) => void;
}> = ({ toasts, onDismiss }) => (
  <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-full max-w-sm flex-col gap-2">
    {toasts.map((toast) => (
      <div
        key={toast.id}
        role="status"
        className={cx(
          'animate-admin-fade pointer-events-auto flex items-start gap-2.5 rounded-lg border p-3 shadow-lg',
          toast.tone === 'success'
            ? 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200'
            : 'border-red-200 bg-red-50 text-red-900 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200'
        )}
      >
        {toast.tone === 'success' ? (
          <Check className="mt-0.5 h-4 w-4 shrink-0" />
        ) : (
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        )}
        <p className="flex-1 text-sm font-medium">{toast.text}</p>
        <button
          type="button"
          onClick={() => onDismiss(toast.id)}
          aria-label="Cerrar aviso"
          className="rounded p-0.5 opacity-70 transition-opacity hover:opacity-100"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    ))}
  </div>
);
