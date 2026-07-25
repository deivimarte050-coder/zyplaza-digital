import React, { useState } from 'react';
import {
  Home,
  Store,
  Package,
  ShoppingCart,
  MessageSquare,
  DollarSign,
  Bell,
  LogOut,
  X,
  Sparkles,
  Clock,
  Sun,
  Moon
} from 'lucide-react';
import { SellerDashboard } from './SellerDashboard';
import { SellerStore } from './SellerStore';
import { SellerProducts } from './SellerProducts';
import { SellerOrders } from './SellerOrders';

export type SellerPanelTab =
  | 'home'
  | 'products'
  | 'orders'
  | 'messages'
  | 'money'
  | 'store';

interface SellerPanelProps {
  onClose: () => void;
}

interface MenuItem {
  id: SellerPanelTab;
  label: string;
  description: string;
  icon: React.ElementType;
  ready: boolean;
  badge?: number;
}

const MENU_ITEMS: MenuItem[] = [
  {
    id: 'home',
    label: 'Inicio',
    description: 'Lo que tienes que hacer hoy',
    icon: Home,
    ready: true
  },
  {
    id: 'products',
    label: 'Productos',
    description: 'Publica artículos y controla tu stock',
    icon: Package,
    ready: true
  },
  {
    id: 'orders',
    label: 'Pedidos',
    description: 'Prepara y despacha tus ventas',
    icon: ShoppingCart,
    ready: true,
    badge: 8
  },
  {
    id: 'messages',
    label: 'Mensajes',
    description: 'Responde a tus clientes',
    icon: MessageSquare,
    ready: false
  },
  {
    id: 'money',
    label: 'Dinero',
    description: 'Ventas, cobros y facturas',
    icon: DollarSign,
    ready: false
  },
  {
    id: 'store',
    label: 'Mi Tienda',
    description: 'Perfil, horario y ajustes',
    icon: Store,
    ready: true
  }
];

export const SellerPanel: React.FC<SellerPanelProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<SellerPanelTab>('home');
  const [darkMode, setDarkMode] = useState(true);

  const activeItem = MENU_ITEMS.find(item => item.id === activeTab) ?? MENU_ITEMS[0];

  const ActiveIcon = activeItem.icon;

  return (
    <div className={`fixed inset-0 z-50 ${darkMode ? 'bg-[#0A0A0A]' : 'bg-gray-50'} flex flex-col md:flex-row`}>
      {/* Sidebar (escritorio) */}
      <aside className={`hidden md:flex md:flex-col w-72 h-full ${darkMode ? 'bg-[#0E0F12] border-r border-white/10' : 'bg-white border-r border-gray-200'}`}>
        <div className={`p-5 border-b ${darkMode ? 'border-white/10' : 'border-gray-200'}`}>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#FF6A00] to-[#e85f00] flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className={`text-base font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Zyplaza</h2>
              <p className={`text-sm ${darkMode ? 'text-white/70' : 'text-gray-600'}`}>Panel de vendedor</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full text-left flex items-start gap-3 px-3 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-[#FF6A00] text-black'
                    : darkMode
                    ? 'text-white hover:bg-white/10'
                    : 'text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span className="flex-1 min-w-0">
                  <span className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{item.label}</span>
                    {item.badge ? (
                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                        isActive ? 'bg-black/20 text-black' : 'bg-[#FF6A00] text-black'
                      }`}>
                        {item.badge}
                      </span>
                    ) : null}
                    {!item.ready && (
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-black/15 text-black'
                          : darkMode ? 'bg-white/15 text-white/80' : 'bg-gray-200 text-gray-700'
                      }`}>
                        Pronto
                      </span>
                    )}
                  </span>
                  <span className={`block text-xs mt-0.5 ${
                    isActive ? 'text-black/70' : darkMode ? 'text-white/60' : 'text-gray-600'
                  }`}>
                    {item.description}
                  </span>
                </span>
              </button>
            );
          })}
        </nav>

        <div className={`p-3 border-t space-y-1.5 ${darkMode ? 'border-white/10' : 'border-gray-200'}`}>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              darkMode ? 'text-white hover:bg-white/10' : 'text-gray-900 hover:bg-gray-100'
            }`}
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            <span>{darkMode ? 'Modo claro' : 'Modo oscuro'}</span>
          </button>
          <button
            onClick={onClose}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span>Salir del panel</span>
          </button>
        </div>
      </aside>

      {/* Contenido */}
      <main className="flex-1 flex flex-col min-h-0">
        {/* Encabezado */}
        <header className={`flex items-center justify-between gap-3 p-4 border-b ${darkMode ? 'border-white/10 bg-[#0E0F12]' : 'border-gray-200 bg-white'}`}>
          <div className="flex items-center gap-3 min-w-0">
            <div className={`md:hidden w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${darkMode ? 'bg-white/10' : 'bg-gray-100'}`}>
              <ActiveIcon className="w-5 h-5 text-[#FF6A00]" />
            </div>
            <div className="min-w-0">
              <h1 className={`text-lg font-bold truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {activeItem.label}
              </h1>
              <p className={`text-sm truncate ${darkMode ? 'text-white/70' : 'text-gray-600'}`}>
                {activeItem.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              aria-label="Notificaciones"
              className={`relative p-2.5 rounded-xl ${darkMode ? 'hover:bg-white/10 text-white' : 'hover:bg-gray-100 text-gray-700'}`}
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#FF6A00] rounded-full" />
            </button>
            <button
              onClick={onClose}
              aria-label="Salir del panel"
              className={`p-2.5 rounded-xl ${darkMode ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Área de contenido */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-6">
          {activeTab === 'home' && (
            <SellerDashboard darkMode={darkMode} onNavigate={setActiveTab} />
          )}

          {activeTab === 'products' && <SellerProducts darkMode={darkMode} />}

          {activeTab === 'orders' && <SellerOrders darkMode={darkMode} />}

          {activeTab === 'store' && <SellerStore darkMode={darkMode} />}

          {!activeItem.ready && (
            <div className={`max-w-md mx-auto mt-6 p-6 rounded-2xl border text-center ${
              darkMode ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-white'
            }`}>
              <div className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-4 ${
                darkMode ? 'bg-white/10' : 'bg-gray-100'
              }`}>
                <Clock className="w-7 h-7 text-[#FF6A00]" />
              </div>
              <h2 className={`text-lg font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {activeItem.label} llega pronto
              </h2>
              <p className={`text-sm mb-5 ${darkMode ? 'text-white/70' : 'text-gray-600'}`}>
                Estamos preparando esta sección. Mientras tanto puedes seguir vendiendo con normalidad.
              </p>
              <button
                onClick={() => setActiveTab('home')}
                className="w-full py-3 rounded-xl bg-[#FF6A00] text-black text-sm font-bold hover:bg-[#e85f00] transition-all"
              >
                Volver a Inicio
              </button>
            </div>
          )}
        </div>

        {/* Navegación inferior (móvil) */}
        <nav className={`md:hidden fixed bottom-0 left-0 right-0 z-40 border-t ${
          darkMode ? 'border-white/10 bg-[#0E0F12]' : 'border-gray-200 bg-white'
        }`}>
          <div className="grid grid-cols-6">
            {MENU_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className="relative flex flex-col items-center gap-1 py-2.5"
                >
                  <span className="relative">
                    <Icon className={`w-5 h-5 ${
                      isActive ? 'text-[#FF6A00]' : darkMode ? 'text-white/60' : 'text-gray-500'
                    }`} />
                    {item.badge ? (
                      <span className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 rounded-full bg-[#FF6A00] text-black text-[10px] font-bold flex items-center justify-center">
                        {item.badge}
                      </span>
                    ) : null}
                  </span>
                  <span className={`text-[11px] font-medium ${
                    isActive ? 'text-[#FF6A00]' : darkMode ? 'text-white/60' : 'text-gray-500'
                  }`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      </main>
    </div>
  );
};
