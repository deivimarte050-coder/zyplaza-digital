import React, { useState } from 'react';
import { Eye, EyeOff, Lock, LogIn, Mail, ShieldCheck } from 'lucide-react';
import { describeFirebaseError } from '../../lib/collections';
import { useAdminAuth } from '../auth/AdminAuthContext';
import { Button, Field, Input, cx } from '../components/ui';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const AdminLogin: React.FC = () => {
  const { login } = useAdminAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = (): boolean => {
    const nextErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      nextErrors.email = 'Escribe tu correo electrónico.';
    } else if (!EMAIL_PATTERN.test(email.trim())) {
      nextErrors.email = 'El correo no tiene un formato válido.';
    }

    if (!password) {
      nextErrors.password = 'Escribe tu contraseña.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError('');

    if (!validate()) return;

    setLoading(true);

    try {
      await login(email, password);
    } catch (error) {
      setFormError(describeFirebaseError(error));
      setPassword('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-[#0d0e10]">
      <div className="animate-admin-fade w-full max-w-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[#FF6A00] text-white">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Panel de Zyplaza</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Acceso exclusivo para administradores
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#15161a]"
        >
          {formError ? (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
            >
              {formError}
            </div>
          ) : null}

          <Field label="Correo electrónico" error={errors.email}>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                type="email"
                value={email}
                autoComplete="username"
                autoFocus
                placeholder="admin@zyplaza.com"
                onChange={(event) => setEmail(event.target.value)}
                className="pl-9"
                aria-invalid={Boolean(errors.email)}
              />
            </div>
          </Field>

          <Field label="Contraseña" error={errors.password}>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                autoComplete="current-password"
                placeholder="••••••••"
                onChange={(event) => setPassword(event.target.value)}
                className="pl-9 pr-10"
                aria-invalid={Boolean(errors.password)}
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                className={cx(
                  'absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-slate-400',
                  'transition-colors hover:text-slate-700 dark:hover:text-slate-200'
                )}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </Field>

          <Button type="submit" loading={loading} icon={<LogIn className="h-4 w-4" />} className="w-full">
            Entrar al panel
          </Button>

          <p className="text-center text-xs text-slate-500 dark:text-slate-400">
            La sesión se cierra sola tras un rato sin actividad.
          </p>
        </form>
      </div>
    </div>
  );
};
