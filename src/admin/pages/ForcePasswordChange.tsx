import React, { useMemo, useState } from 'react';
import { KeyRound, LogOut, ShieldAlert } from 'lucide-react';
import { describeFirebaseError } from '../../lib/collections';
import { useAdminAuth } from '../auth/AdminAuthContext';
import { Button, Field, Input, cx } from '../components/ui';

interface Requirement {
  label: string;
  met: boolean;
}

function evaluate(password: string): Requirement[] {
  return [
    { label: 'Al menos 10 caracteres', met: password.length >= 10 },
    { label: 'Una letra mayúscula', met: /[A-ZÁÉÍÓÚÑ]/.test(password) },
    { label: 'Una letra minúscula', met: /[a-záéíóúñ]/.test(password) },
    { label: 'Un número', met: /\d/.test(password) },
    { label: 'Un símbolo (!@#$%…)', met: /[^A-Za-z0-9]/.test(password) }
  ];
}

export const ForcePasswordChange: React.FC = () => {
  const { changePassword, logout, profile } = useAdminAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  const requirements = useMemo(() => evaluate(newPassword), [newPassword]);
  const allMet = requirements.every((requirement) => requirement.met);
  const matches = newPassword.length > 0 && newPassword === confirmPassword;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError('');

    if (!currentPassword) {
      setFormError('Escribe la contraseña temporal que usaste para entrar.');
      return;
    }

    if (!allMet) {
      setFormError('La nueva contraseña no cumple todos los requisitos.');
      return;
    }

    if (!matches) {
      setFormError('Las dos contraseñas nuevas no coinciden.');
      return;
    }

    if (currentPassword === newPassword) {
      setFormError('La nueva contraseña debe ser distinta de la temporal.');
      return;
    }

    setLoading(true);

    try {
      await changePassword(currentPassword, newPassword);
    } catch (error) {
      setFormError(describeFirebaseError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-[#0d0e10]">
      <div className="animate-admin-fade w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500 text-white">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Cambia tu contraseña
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Estás usando una contraseña temporal. Define una propia para continuar.
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

          <Field label="Contraseña temporal actual">
            <Input
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
            />
          </Field>

          <Field label="Nueva contraseña">
            <Input
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
            />
          </Field>

          <ul className="grid gap-1.5">
            {requirements.map((requirement) => (
              <li
                key={requirement.label}
                className={cx(
                  'flex items-center gap-2 text-xs font-medium',
                  requirement.met
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-500 dark:text-slate-400'
                )}
              >
                <span
                  className={cx(
                    'inline-block h-1.5 w-1.5 rounded-full',
                    requirement.met ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-white/25'
                  )}
                />
                {requirement.label}
              </li>
            ))}
          </ul>

          <Field
            label="Repite la nueva contraseña"
            error={
              confirmPassword.length > 0 && !matches ? 'Las contraseñas no coinciden.' : undefined
            }
          >
            <Input
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
          </Field>

          <Button
            type="submit"
            loading={loading}
            icon={<KeyRound className="h-4 w-4" />}
            className="w-full"
          >
            Guardar y continuar
          </Button>

          <button
            type="button"
            onClick={() => void logout()}
            className="flex w-full items-center justify-center gap-1.5 text-xs font-medium text-slate-500 transition-colors hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <LogOut className="h-3.5 w-3.5" />
            Salir de la cuenta {profile?.email}
          </button>
        </form>
      </div>
    </div>
  );
};
