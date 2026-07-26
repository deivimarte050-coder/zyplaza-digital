import {
  addDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp
} from 'firebase/firestore';
import { collectionRef, toDate, toText } from '../lib/collections';
import { getFirebaseAuth } from '../lib/firebase';
import type { AuditAction, AuditLogRecord } from '../types/admin';

function mapLog(id: string, data: Record<string, unknown>): AuditLogRecord {
  return {
    id,
    actorId: toText(data.actorId),
    actorEmail: toText(data.actorEmail),
    action: toText(data.action) as AuditAction,
    targetType: toText(data.targetType),
    targetId: toText(data.targetId),
    description: toText(data.description),
    createdAt: toDate(data.createdAt)
  };
}

/**
 * Guarda una acción del administrador en `adminLogs`.
 * Nunca lanza excepción: un fallo de auditoría no debe romper la operación principal.
 */
export async function logAdminAction(params: {
  action: AuditAction;
  targetType: string;
  targetId: string;
  description: string;
}): Promise<void> {
  try {
    const user = getFirebaseAuth().currentUser;

    await addDoc(collectionRef('adminLogs'), {
      actorId: user?.uid ?? 'desconocido',
      actorEmail: user?.email ?? 'desconocido',
      action: params.action,
      targetType: params.targetType,
      targetId: params.targetId,
      description: params.description,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error('No se pudo registrar la acción del administrador:', error);
  }
}

/** Escucha en tiempo real las últimas acciones registradas */
export function subscribeAuditLogs(
  onData: (logs: AuditLogRecord[]) => void,
  onError: (error: unknown) => void,
  max = 100
): () => void {
  const logsQuery = query(collectionRef('adminLogs'), orderBy('createdAt', 'desc'), limit(max));

  return onSnapshot(
    logsQuery,
    (snapshot) => onData(snapshot.docs.map((entry) => mapLog(entry.id, entry.data()))),
    onError
  );
}
