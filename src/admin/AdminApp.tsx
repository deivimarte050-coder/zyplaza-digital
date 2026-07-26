import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, ShieldOff } from 'lucide-react';
import { AdminAuthProvider, useAdminAuth } from './auth/AdminAuthContext';
import { ThemeProvider } from './theme/ThemeContext';
import { AdminLayout } from './components/AdminLayout';
import { AdminLogin } from './pages/AdminLogin';
import { ForcePasswordChange } from './pages/ForcePasswordChange';
import { Button, LoadingState } from './components/ui';

// Cada módulo se descarga solo cuando se visita, para que el panel abra rápido.
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const UsersPage = lazy(() => import('./pages/UsersPage'));
const SellersPage = lazy(() => import('./pages/SellersPage'));
const ProductsPage = lazy(() => import('./pages/ProductsPage'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const BannersPage = lazy(() => import('./pages/BannersPage'));
const CategoriesPage = lazy(() => import('./pages/CategoriesPage'));
const ActivityPage = lazy(() => import('./pages/ActivityPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

const SetupRequired: React.FC<{ missingKeys: string[] }> = ({ missingKeys }) => (
  <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-[#0d0e10]">
    <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#15161a]">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500 text-white">
        <AlertTriangle className="h-6 w-6" />
      </div>

      <h1 className="text-lg font-bold text-slate-900 dark:text-white">
        Falta conectar Firebase
      </h1>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
        El panel necesita las claves de tu proyecto de Firebase para leer y guardar datos.
        Copia el archivo <code className="rounded bg-slate-100 px-1 dark:bg-white/10">.env.example</code>{' '}
        como <code className="rounded bg-slate-100 px-1 dark:bg-white/10">.env.local</code> y completa
        estos valores:
      </p>

      <ul className="mt-3 space-y-1 rounded-lg bg-slate-50 p-3 dark:bg-white/5">
        {missingKeys.map((key) => (
          <li key={key} className="font-mono text-xs text-slate-700 dark:text-slate-300">
            {key}
          </li>
        ))}
      </ul>

      <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
        Los encuentras en la consola de Firebase, en Configuración del proyecto → Tus apps → App web.
        Después reinicia el servidor con <code className="rounded bg-slate-100 px-1 dark:bg-white/10">npm run dev</code>.
      </p>
    </div>
  </div>
);

const NoAccess: React.FC<{ message: string; onLogout: () => void }> = ({ message, onLogout }) => (
  <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-[#0d0e10]">
    <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-white/10 dark:bg-[#15161a]">
      <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-red-500 text-white">
        <ShieldOff className="h-6 w-6" />
      </div>
      <h1 className="text-lg font-bold text-slate-900 dark:text-white">Acceso restringido</h1>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{message}</p>
      <Button variant="secondary" onClick={onLogout} className="mt-4 w-full">
        Usar otra cuenta
      </Button>
      <a
        href="/"
        className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Volver a la tienda
      </a>
    </div>
  </div>
);

const NotFound: React.FC = () => (
  <div className="rounded-xl border border-slate-200 bg-white p-10 text-center dark:border-white/10 dark:bg-[#15161a]">
    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Sección no encontrada</h2>
    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
      La dirección que abriste no existe dentro del panel.
    </p>
    <Link
      to="/"
      className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#FF6A00] hover:underline"
    >
      <ArrowLeft className="h-4 w-4" />
      Ir al resumen
    </Link>
  </div>
);

/** Decide qué mostrar según el estado de la sesión y los permisos */
const AdminGate: React.FC = () => {
  const { loading, user, isAdmin, profile, accessError, logout, configured, missingKeys } =
    useAdminAuth();

  if (!configured) return <SetupRequired missingKeys={missingKeys} />;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-[#0d0e10]">
        <LoadingState label="Verificando tu sesión…" />
      </div>
    );
  }

  if (!user) return <AdminLogin />;

  if (!isAdmin) {
    return (
      <NoAccess
        message={accessError || 'Esta cuenta no tiene permisos de administrador.'}
        onLogout={() => void logout()}
      />
    );
  }

  if (profile?.mustChangePassword) return <ForcePasswordChange />;

  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route
          index
          element={
            <Suspense fallback={<LoadingState />}>
              <DashboardPage />
            </Suspense>
          }
        />
        <Route
          path="usuarios"
          element={
            <Suspense fallback={<LoadingState />}>
              <UsersPage />
            </Suspense>
          }
        />
        <Route
          path="vendedores"
          element={
            <Suspense fallback={<LoadingState />}>
              <SellersPage />
            </Suspense>
          }
        />
        <Route
          path="productos"
          element={
            <Suspense fallback={<LoadingState />}>
              <ProductsPage />
            </Suspense>
          }
        />
        <Route
          path="pedidos"
          element={
            <Suspense fallback={<LoadingState />}>
              <OrdersPage />
            </Suspense>
          }
        />
        <Route
          path="banners"
          element={
            <Suspense fallback={<LoadingState />}>
              <BannersPage />
            </Suspense>
          }
        />
        <Route
          path="categorias"
          element={
            <Suspense fallback={<LoadingState />}>
              <CategoriesPage />
            </Suspense>
          }
        />
        <Route
          path="actividad"
          element={
            <Suspense fallback={<LoadingState />}>
              <ActivityPage />
            </Suspense>
          }
        />
        <Route
          path="configuracion"
          element={
            <Suspense fallback={<LoadingState />}>
              <SettingsPage />
            </Suspense>
          }
        />
        <Route path="404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="404" replace />} />
      </Route>
    </Routes>
  );
};

export const AdminApp: React.FC = () => (
  <ThemeProvider>
    <AdminAuthProvider>
      <BrowserRouter basename="/admin">
        <AdminGate />
      </BrowserRouter>
    </AdminAuthProvider>
  </ThemeProvider>
);

export default AdminApp;
