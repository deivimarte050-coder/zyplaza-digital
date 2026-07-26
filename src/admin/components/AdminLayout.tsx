import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  ClipboardList,
  Images,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Package,
  Settings,
  ShoppingCart,
  Store,
  Sun,
  Tags,
  Timer,
  Users,
  X
} from 'lucide-react';
import { useAdminAuth } from '../auth/AdminAuthContext';
import { useTheme } from '../theme/ThemeContext';
import { initialsOf } from '../utils/format';
import { Button, cx } from './ui';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  end?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Resumen', icon: <LayoutDashboard className="h-4.5 w-4.5" />, end: true },
  { to: '/usuarios', label: 'Usuarios', icon: <Users className="h-4.5 w-4.5" /> },
  { to: '/vendedores', label: 'Vendedores', icon: <Store className="h-4.5 w-4.5" /> },
  { to: '/productos', label: 'Productos', icon: <Package className="h-4.5 w-4.5" /> },
  { to: '/pedidos', label: 'Pedidos', icon: <ShoppingCart className="h-4.5 w-4.5" /> },
  { to: '/banners', label: 'Banners', icon: <Images className="h-4.5 w-4.5" /> },
  { to: '/categorias', label: 'Categorías', icon: <Tags className="h-4.5 w-4.5" /> },
  { to: '/actividad', label: 'Actividad', icon: <ClipboardList className="h-4.5 w-4.5" /> },
  { to: '/configuracion', label: 'Configuración', icon: <Settings className="h-4.5 w-4.5" /> }
];

const linkClasses = ({ isActive }: { isActive: boolean }) =>
  cx(
    'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
    isActive
      ? 'bg-[#FF6A00]/10 text-[#c74f00] dark:bg-[#FF6A00]/15 dark:text-[#FF9A4D]'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white'
  );

const IdleWarning: React.FC = () => {
  const { idleSecondsLeft, stayActive } = useAdminAuth();

  if (idleSecondsLeft === null) return null;

  return (
    <div className="fixed inset-x-0 top-0 z-[70] flex justify-center p-3">
      <div className="animate-admin-fade flex items-center gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-2.5 shadow-lg dark:border-amber-500/40 dark:bg-amber-500/15">
        <Timer className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
          Tu sesión se cerrará en {idleSecondsLeft} s por inactividad.
        </p>
        <Button variant="secondary" onClick={stayActive} className="py-1">
          Seguir aquí
        </Button>
      </div>
    </div>
  );
};

export const AdminLayout: React.FC = () => {
  const { profile, logout } = useAdminAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  // Cierra el menú lateral al cambiar de sección en móvil.
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    setSigningOut(true);
    try {
      await logout();
    } finally {
      setSigningOut(false);
    }
  };

  const sidebar = (
    <nav className="flex h-full flex-col gap-1 p-3">
      {NAV_ITEMS.map((item) => (
        <NavLink key={item.to} to={item.to} end={item.end} className={linkClasses}>
          {item.icon}
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#0d0e10] dark:text-white">
      <IdleWarning />

      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-white/10 dark:bg-[#111214]/90">
        <div className="flex h-14 items-center justify-between gap-3 px-4">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Abrir menú"
              className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 lg:hidden dark:text-slate-300 dark:hover:bg-white/10"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FF6A00] text-xs font-black text-white">
                Z
              </span>
              <span className="text-sm font-bold">Zyplaza</span>
              <span className="hidden rounded-md bg-slate-100 px-1.5 py-0.5 text-xs font-semibold text-slate-600 sm:inline dark:bg-white/10 dark:text-slate-300">
                Administración
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'}
              className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
            >
              {theme === 'dark' ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
            </button>

            <div className="hidden items-center gap-2 rounded-lg border border-slate-200 py-1 pl-1 pr-2.5 sm:flex dark:border-white/10">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-800 text-xs font-bold text-white dark:bg-white/10">
                {initialsOf(profile?.name ?? 'Admin')}
              </span>
              <span className="max-w-[10rem] truncate text-xs font-semibold text-slate-700 dark:text-slate-200">
                {profile?.email}
              </span>
            </div>

            <Button
              variant="ghost"
              onClick={handleLogout}
              loading={signingOut}
              icon={<LogOut className="h-4 w-4" />}
              className="px-2 sm:px-3"
            >
              <span className="hidden sm:inline">Salir</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1600px]">
        <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-60 shrink-0 overflow-y-auto border-r border-slate-200 bg-white lg:block dark:border-white/10 dark:bg-[#111214]">
          {sidebar}
        </aside>

        {menuOpen ? (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
              onClick={() => setMenuOpen(false)}
            />
            <div className="animate-admin-fade absolute inset-y-0 left-0 w-64 border-r border-slate-200 bg-white shadow-xl dark:border-white/10 dark:bg-[#111214]">
              <div className="flex h-14 items-center justify-between border-b border-slate-200 px-4 dark:border-white/10">
                <span className="text-sm font-bold">Menú</span>
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  aria-label="Cerrar menú"
                  className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/10"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              {sidebar}
            </div>
          </div>
        ) : null}

        <main className="min-w-0 flex-1 p-4 sm:p-6">
          <div className="animate-admin-fade" key={location.pathname}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
