import { useCallback, useEffect, useRef, useState } from 'react';
import { describeFirebaseError } from '../../lib/collections';
import type { ToastMessage } from '../components/ui';

type Subscribe<T> = (
  onData: (items: T) => void,
  onError: (error: unknown) => void
) => () => void;

interface CollectionState<T> {
  data: T;
  loading: boolean;
  error: string;
  retry: () => void;
}

/**
 * Conecta un componente a una suscripción en tiempo real de Firestore,
 * gestionando los estados de carga, error y reintento.
 */
export function useFirestoreSubscription<T>(
  subscribe: Subscribe<T>,
  initialValue: T,
  enabled = true
): CollectionState<T> {
  const [data, setData] = useState<T>(initialValue);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);

  const subscribeRef = useRef(subscribe);
  subscribeRef.current = subscribe;

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    setError('');

    const unsubscribe = subscribeRef.current(
      (items) => {
        if (!active) return;
        setData(items);
        setLoading(false);
      },
      (subscriptionError) => {
        if (!active) return;
        console.error('Error de Firestore:', subscriptionError);
        setError(describeFirebaseError(subscriptionError));
        setLoading(false);
      }
    );

    return () => {
      active = false;
      unsubscribe();
    };
  }, [enabled, attempt]);

  const retry = useCallback(() => setAttempt((value) => value + 1), []);

  return { data, loading, error, retry };
}

/** Pila de notificaciones que se cierran solas */
export function useToasts() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const counterRef = useRef(0);

  const dismissToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const pushToast = useCallback(
    (tone: ToastMessage['tone'], text: string) => {
      counterRef.current += 1;
      const id = counterRef.current;

      setToasts((current) => [...current, { id, tone, text }]);
      window.setTimeout(() => dismissToast(id), tone === 'error' ? 6000 : 3500);
    },
    [dismissToast]
  );

  const notifySuccess = useCallback((text: string) => pushToast('success', text), [pushToast]);
  const notifyError = useCallback(
    (error: unknown, fallback = 'No se pudo completar la acción.') => {
      const message = typeof error === 'string' ? error : describeFirebaseError(error);
      pushToast('error', message || fallback);
    },
    [pushToast]
  );

  return { toasts, dismissToast, notifySuccess, notifyError };
}

/** Evita ejecutar dos veces la misma acción mientras está en curso */
export function useAsyncAction() {
  const [pendingId, setPendingId] = useState<string | null>(null);

  const run = useCallback(async (id: string, action: () => Promise<void>) => {
    setPendingId(id);
    try {
      await action();
    } finally {
      setPendingId(null);
    }
  }, []);

  return { pendingId, isPending: (id: string) => pendingId === id, run };
}
