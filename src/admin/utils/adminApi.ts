import { getFirebaseAuth } from '../../lib/firebase';
import type { AccountStatus, UserRole } from '../../types/admin';

async function authorizedFetch(path: string, init: RequestInit = {}): Promise<unknown> {
  const currentUser = getFirebaseAuth().currentUser;

  if (!currentUser) {
    throw new Error('Tu sesión expiró. Inicia sesión nuevamente.');
  }

  const token = await currentUser.getIdToken();

  const response = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(init.headers ?? {})
    }
  });

  let payload: unknown = null;

  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const message =
      typeof payload === 'object' && payload && 'error' in payload
        ? String((payload as { error: unknown }).error)
        : 'El servidor no pudo completar la acción.';

    throw new Error(message);
  }

  return payload;
}

/** Cambia el rol del usuario en el token y en su perfil */
export function requestRoleChange(uid: string, role: UserRole): Promise<unknown> {
  return authorizedFetch(`/api/admin/users/${uid}/role`, {
    method: 'POST',
    body: JSON.stringify({ role })
  });
}

/** Suspende o reactiva la cuenta, bloqueando también el acceso */
export function requestStatusChange(uid: string, status: AccountStatus): Promise<unknown> {
  return authorizedFetch(`/api/admin/users/${uid}/status`, {
    method: 'POST',
    body: JSON.stringify({ status })
  });
}

/** Elimina credenciales y perfil del usuario */
export function requestUserDeletion(uid: string): Promise<unknown> {
  return authorizedFetch(`/api/admin/users/${uid}`, { method: 'DELETE' });
}

/** Comprueba si el servidor tiene configuradas las credenciales de Firebase */
export async function fetchAdminSdkStatus(): Promise<boolean> {
  try {
    const result = await fetch('/api/admin/status');
    if (!result.ok) return false;

    const data = (await result.json()) as { adminSdkConfigured?: boolean };
    return data.adminSdkConfigured === true;
  } catch {
    return false;
  }
}
