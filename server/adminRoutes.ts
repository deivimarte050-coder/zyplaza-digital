import { Router, type NextFunction, type Request, type Response } from 'express';
import { FieldValue } from 'firebase-admin/firestore';
import { adminAuth, adminDb, isAdminConfigured } from './firebaseAdmin.js';

export const adminRouter = Router();

interface AuthedRequest extends Request {
  admin?: { uid: string; email: string };
}

/**
 * Verifica el token de Firebase enviado en la cabecera Authorization y exige
 * que el usuario tenga el custom claim role=admin. Sin esto, cualquier persona
 * podría llamar a estos endpoints directamente.
 */
async function requireAdmin(req: AuthedRequest, res: Response, next: NextFunction): Promise<void> {
  if (!isAdminConfigured()) {
    res.status(503).json({ error: 'El servidor no tiene configuradas las credenciales de Firebase.' });
    return;
  }

  const header = req.headers.authorization ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';

  if (!token) {
    res.status(401).json({ error: 'Falta el token de sesión.' });
    return;
  }

  try {
    const decoded = await adminAuth().verifyIdToken(token, true);

    if (decoded.role !== 'admin') {
      res.status(403).json({ error: 'Tu cuenta no tiene permisos de administrador.' });
      return;
    }

    req.admin = { uid: decoded.uid, email: decoded.email ?? '' };
    next();
  } catch {
    res.status(401).json({ error: 'La sesión no es válida o expiró. Inicia sesión nuevamente.' });
  }
}

async function writeAuditLog(
  actor: { uid: string; email: string },
  entry: { action: string; targetType: string; targetId: string; description: string }
): Promise<void> {
  try {
    await adminDb().collection('adminLogs').add({
      actorId: actor.uid,
      actorEmail: actor.email,
      ...entry,
      createdAt: FieldValue.serverTimestamp()
    });
  } catch (error) {
    console.error('No se pudo registrar la acción del administrador:', error);
  }
}

const ROLES = ['user', 'seller', 'admin'] as const;
type Role = (typeof ROLES)[number];

/** Cambia el rol: actualiza el claim del token y el documento del perfil */
adminRouter.post('/admin/users/:uid/role', requireAdmin, async (req: AuthedRequest, res) => {
  const { uid } = req.params;
  const role = String(req.body?.role ?? '') as Role;

  if (!ROLES.includes(role)) {
    res.status(400).json({ error: 'El rol indicado no es válido.' });
    return;
  }

  if (uid === req.admin?.uid && role !== 'admin') {
    res.status(400).json({ error: 'No puedes quitarte a ti mismo el rol de administrador.' });
    return;
  }

  try {
    await adminAuth().setCustomUserClaims(uid, { role });
    await adminDb().collection('users').doc(uid).update({
      role,
      updatedAt: FieldValue.serverTimestamp()
    });
    // Invalida los tokens vigentes para que el nuevo rol aplique de inmediato.
    await adminAuth().revokeRefreshTokens(uid);

    await writeAuditLog(req.admin!, {
      action: 'user.role_changed',
      targetType: 'user',
      targetId: uid,
      description: `Cambió el rol del usuario ${uid} a ${role}`
    });

    res.json({ ok: true, role });
  } catch (error) {
    console.error('Error al cambiar el rol:', error);
    res.status(500).json({ error: 'No se pudo cambiar el rol del usuario.' });
  }
});

/** Suspende o reactiva la cuenta, bloqueando también el acceso en Firebase Auth */
adminRouter.post('/admin/users/:uid/status', requireAdmin, async (req: AuthedRequest, res) => {
  const { uid } = req.params;
  const status = String(req.body?.status ?? '');

  if (status !== 'active' && status !== 'suspended') {
    res.status(400).json({ error: 'El estado indicado no es válido.' });
    return;
  }

  if (uid === req.admin?.uid) {
    res.status(400).json({ error: 'No puedes suspender tu propia cuenta.' });
    return;
  }

  try {
    const suspended = status === 'suspended';

    await adminAuth().updateUser(uid, { disabled: suspended });
    await adminDb().collection('users').doc(uid).update({
      status,
      updatedAt: FieldValue.serverTimestamp()
    });

    if (suspended) await adminAuth().revokeRefreshTokens(uid);

    await writeAuditLog(req.admin!, {
      action: suspended ? 'user.suspended' : 'user.reactivated',
      targetType: 'user',
      targetId: uid,
      description: `${suspended ? 'Suspendió' : 'Reactivó'} la cuenta ${uid}`
    });

    res.json({ ok: true, status });
  } catch (error) {
    console.error('Error al cambiar el estado:', error);
    res.status(500).json({ error: 'No se pudo cambiar el estado de la cuenta.' });
  }
});

/** Elimina la cuenta por completo: credenciales de acceso y documento de perfil */
adminRouter.delete('/admin/users/:uid', requireAdmin, async (req: AuthedRequest, res) => {
  const { uid } = req.params;

  if (uid === req.admin?.uid) {
    res.status(400).json({ error: 'No puedes eliminar tu propia cuenta.' });
    return;
  }

  try {
    await adminDb().collection('users').doc(uid).delete();

    try {
      await adminAuth().deleteUser(uid);
    } catch (error) {
      // Si el perfil existía sin credenciales, el borrado del documento basta.
      if ((error as { code?: string }).code !== 'auth/user-not-found') throw error;
    }

    await writeAuditLog(req.admin!, {
      action: 'user.deleted',
      targetType: 'user',
      targetId: uid,
      description: `Eliminó la cuenta ${uid}`
    });

    res.json({ ok: true });
  } catch (error) {
    console.error('Error al eliminar el usuario:', error);
    res.status(500).json({ error: 'No se pudo eliminar la cuenta.' });
  }
});

/** Indica si el servidor tiene credenciales de Firebase, para diagnóstico del panel */
adminRouter.get('/admin/status', (_req, res) => {
  res.json({ adminSdkConfigured: isAdminConfigured() });
});
