import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import {
  EmailAuthProvider,
  onAuthStateChanged,
  onIdTokenChanged,
  reauthenticateWithCredential,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  type User
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { COLLECTIONS, describeFirebaseError } from '../../lib/collections';
import { getDb, getFirebaseAuth, isFirebaseConfigured, missingFirebaseKeys } from '../../lib/firebase';
import { logAdminAction } from '../../services/audit';

/** Minutos de inactividad antes de cerrar la sesión automáticamente */
export const IDLE_TIMEOUT_MINUTES = 20;
const IDLE_WARNING_SECONDS = 60;

interface AdminProfile {
  uid: string;
  name: string;
  email: string;
  mustChangePassword: boolean;
}

interface AdminAuthValue {
  loading: boolean;
  user: User | null;
  profile: AdminProfile | null;
  isAdmin: boolean;
  accessError: string;
  idleSecondsLeft: number | null;
  configured: boolean;
  missingKeys: string[];
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  stayActive: () => void;
  getIdToken: () => Promise<string>;
}

const AdminAuthContext = createContext<AdminAuthValue | null>(null);

export function useAdminAuth(): AdminAuthValue {
  const context = useContext(AdminAuthContext);

  if (!context) {
    throw new Error('useAdminAuth debe usarse dentro de <AdminAuthProvider>');
  }

  return context;
}

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const configured = isFirebaseConfigured;

  const [loading, setLoading] = useState(configured);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [accessError, setAccessError] = useState('');
  const [idleSecondsLeft, setIdleSecondsLeft] = useState<number | null>(null);

  const lastActivityRef = useRef<number>(Date.now());

  /** Lee el rol desde el token (custom claim) y el perfil desde Firestore */
  const loadSession = useCallback(async (nextUser: User | null) => {
    if (!nextUser) {
      setUser(null);
      setProfile(null);
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    try {
      const tokenResult = await nextUser.getIdTokenResult(true);
      const admin = tokenResult.claims.role === 'admin';

      setUser(nextUser);
      setIsAdmin(admin);

      if (!admin) {
        setProfile(null);
        setAccessError('Esta cuenta no tiene permisos de administrador.');
        setLoading(false);
        return;
      }

      const snapshot = await getDoc(doc(getDb(), COLLECTIONS.users, nextUser.uid));
      const data = snapshot.data() ?? {};

      setProfile({
        uid: nextUser.uid,
        name: typeof data.name === 'string' ? data.name : 'Administrador',
        email: nextUser.email ?? '',
        mustChangePassword: data.mustChangePassword === true
      });

      setAccessError('');
    } catch (error) {
      setAccessError(describeFirebaseError(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!configured) return;

    const auth = getFirebaseAuth();
    const unsubscribeAuth = onAuthStateChanged(auth, loadSession);
    // Mantiene el rol sincronizado si el token se renueva o se revoca.
    const unsubscribeToken = onIdTokenChanged(auth, (nextUser) => {
      if (!nextUser) return;
      void nextUser.getIdTokenResult().then((result) => setIsAdmin(result.claims.role === 'admin'));
    });

    return () => {
      unsubscribeAuth();
      unsubscribeToken();
    };
  }, [configured, loadSession]);

  const logout = useCallback(async () => {
    if (isAdmin) {
      await logAdminAction({
        action: 'admin.logout',
        targetType: 'session',
        targetId: user?.uid ?? '',
        description: 'Cerró sesión en el panel'
      });
    }

    await signOut(getFirebaseAuth());
    setIdleSecondsLeft(null);
  }, [isAdmin, user]);

  /* ------------------------ Cierre por inactividad ------------------------ */

  const stayActive = useCallback(() => {
    lastActivityRef.current = Date.now();
    setIdleSecondsLeft(null);
  }, []);

  useEffect(() => {
    if (!user || !isAdmin) return;

    const events = ['mousedown', 'keydown', 'touchstart', 'scroll', 'visibilitychange'];
    const markActivity = () => {
      lastActivityRef.current = Date.now();
    };

    events.forEach((event) => window.addEventListener(event, markActivity, { passive: true }));

    const interval = window.setInterval(() => {
      const idleMs = Date.now() - lastActivityRef.current;
      const remaining = Math.ceil((IDLE_TIMEOUT_MINUTES * 60 * 1000 - idleMs) / 1000);

      if (remaining <= 0) {
        void logout();
        return;
      }

      setIdleSecondsLeft(remaining <= IDLE_WARNING_SECONDS ? remaining : null);
    }, 1000);

    return () => {
      events.forEach((event) => window.removeEventListener(event, markActivity));
      window.clearInterval(interval);
    };
  }, [user, isAdmin, logout]);

  /* ------------------------------- Acciones ------------------------------- */

  const login = useCallback(async (email: string, password: string) => {
    const auth = getFirebaseAuth();
    const credential = await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
    const tokenResult = await credential.user.getIdTokenResult(true);

    if (tokenResult.claims.role !== 'admin') {
      await signOut(auth);
      throw new Error('Esta cuenta no tiene permisos para entrar al panel de administración.');
    }

    try {
      await updateDoc(doc(getDb(), COLLECTIONS.users, credential.user.uid), {
        lastLoginAt: serverTimestamp()
      });
    } catch (error) {
      console.error('No se pudo registrar la fecha de acceso:', error);
    }

    await logAdminAction({
      action: 'admin.login',
      targetType: 'session',
      targetId: credential.user.uid,
      description: 'Inició sesión en el panel'
    });

    lastActivityRef.current = Date.now();
  }, []);

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      const auth = getFirebaseAuth();
      const currentUser = auth.currentUser;

      if (!currentUser?.email) {
        throw new Error('Tu sesión expiró. Inicia sesión nuevamente.');
      }

      // Firebase exige autenticación reciente para cambiar la contraseña.
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
      await reauthenticateWithCredential(currentUser, credential);
      await updatePassword(currentUser, newPassword);

      await updateDoc(doc(getDb(), COLLECTIONS.users, currentUser.uid), {
        mustChangePassword: false,
        updatedAt: serverTimestamp()
      });

      await logAdminAction({
        action: 'admin.password_changed',
        targetType: 'session',
        targetId: currentUser.uid,
        description: 'Cambió su contraseña de acceso'
      });

      setProfile((previous) => (previous ? { ...previous, mustChangePassword: false } : previous));
    },
    []
  );

  const getIdToken = useCallback(async () => {
    const currentUser = getFirebaseAuth().currentUser;

    if (!currentUser) throw new Error('Tu sesión expiró. Inicia sesión nuevamente.');

    return currentUser.getIdToken();
  }, []);

  const value = useMemo<AdminAuthValue>(
    () => ({
      loading,
      user,
      profile,
      isAdmin,
      accessError,
      idleSecondsLeft,
      configured,
      missingKeys: missingFirebaseKeys,
      login,
      logout,
      changePassword,
      stayActive,
      getIdToken
    }),
    [
      loading,
      user,
      profile,
      isAdmin,
      accessError,
      idleSecondsLeft,
      configured,
      login,
      logout,
      changePassword,
      stayActive,
      getIdToken
    ]
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
};
