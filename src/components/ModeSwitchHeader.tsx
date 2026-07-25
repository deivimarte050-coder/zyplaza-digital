import React from 'react';
import { motion } from 'motion/react';
import { 
  ShoppingBag, 
  Search, 
  MapPin, 
  Heart, 
  PackageCheck, 
  MessageSquare, 
  PlusCircle, 
  Package, 
  ClipboardList, 
  BarChart3, 
  Store,
  MapPin as LocationIcon,
  ChevronDown,
  User,
  LogIn
} from 'lucide-react';
import { UserProfileData } from '../types';

export type AppMode = 'buyer' | 'seller';

export type BuyerTab = 'explore' | 'search' | 'map' | 'favorites' | 'purchases' | 'messages';
export type SellerTab = 'publish' | 'products' | 'orders' | 'stats' | 'store' | 'messages';

interface ModeSwitchHeaderProps {
  mode: AppMode;
  onModeChange: (newMode: AppMode) => void;
  buyerTab: BuyerTab;
  onBuyerTabChange: (tab: BuyerTab) => void;
  sellerTab: SellerTab;
  onSellerTabChange: (tab: SellerTab) => void;
  unreadCount?: number;
  currentCity: string;
  onOpenCitySelector: () => void;
  currentUser?: UserProfileData | null;
  onRequestAuth?: () => void;
}

export const ModeSwitchHeader: React.FC<ModeSwitchHeaderProps> = ({
  mode,
  onModeChange,
  buyerTab,
  onBuyerTabChange,
  sellerTab,
  onSellerTabChange,
  unreadCount = 0,
  currentCity,
  onOpenCitySelector,
  currentUser,
  onRequestAuth,
}) => {
  // Option lists strictly as requested
  const buyerOptions = [
    { id: 'explore' as BuyerTab, label: 'Explorar productos', icon: ShoppingBag },
    { id: 'search' as BuyerTab, label: 'Buscar', icon: Search },
    { id: 'map' as BuyerTab, label: 'Mapa de negocios', icon: MapPin },
    { id: 'favorites' as BuyerTab, label: 'Favoritos', icon: Heart },
    { id: 'purchases' as BuyerTab, label: 'Mis compras', icon: PackageCheck },
    { id: 'messages' as BuyerTab, label: 'Mensajes', icon: MessageSquare, badge: unreadCount },
  ];

  const sellerOptions = [
    { id: 'publish' as SellerTab, label: 'Publicar producto (+)', icon: PlusCircle, highlight: true },
    { id: 'products' as SellerTab, label: 'Mis productos', icon: Package },
    { id: 'orders' as SellerTab, label: 'Pedidos', icon: ClipboardList },
    { id: 'stats' as SellerTab, label: 'Estadísticas', icon: BarChart3 },
    { id: 'store' as SellerTab, label: 'Mi tienda', icon: Store },
    { id: 'messages' as SellerTab, label: 'Mensajes', icon: MessageSquare, badge: unreadCount },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0E0F12]/95 backdrop-blur-md border-b border-white/10 text-white shadow-xl">
      {/* Top Branding & Location bar */}
      <div className="max-w-7xl mx-auto px-4 pt-3 pb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-black text-xl tracking-tight text-white">Zyplaza</span>
          <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-[#FF6A00]/20 text-[#FF8A3D] border border-[#FF6A00]/40">
            {mode === 'buyer' ? 'Comprador' : 'Vendedor'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Location button */}
          <button
            onClick={onOpenCitySelector}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white/90 transition-all cursor-pointer"
          >
            <LocationIcon className="w-3.5 h-3.5 text-[#FF6A00]" />
            <span className="font-medium text-xs max-w-[110px] sm:max-w-none truncate">{currentCity}</span>
            <ChevronDown className="w-3 h-3 text-white/50" />
          </button>

          {/* Auth Button or User Avatar */}
          {currentUser ? (
            <div className="flex items-center gap-2 pl-1">
              <img
                src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover border border-[#FF6A00]"
              />
            </div>
          ) : (
            <button
              onClick={onRequestAuth}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FF6A00] text-black font-extrabold text-xs hover:bg-[#ff7d1c] transition-all cursor-pointer shadow-md shadow-[#FF6A00]/20"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Ingresar</span>
            </button>
          )}
        </div>
      </div>

      {/* Large Main Mode Switcher Toggle */}
      <div className="max-w-xl mx-auto px-4 py-2">
        <div className="relative bg-neutral-900 border border-white/15 rounded-2xl p-1.5 flex items-center justify-between shadow-2xl">
          {/* Animated Selection Pill */}
          <motion.div
            className="absolute top-1.5 bottom-1.5 rounded-xl bg-gradient-to-r from-[#FF6A00] to-[#E55B00] shadow-lg shadow-[#FF6A00]/30"
            initial={false}
            animate={{
              left: mode === 'buyer' ? '0.375rem' : 'calc(50% + 0.1875rem)',
              width: 'calc(50% - 0.5625rem)',
            }}
            transition={{ type: 'spring', stiffness: 450, damping: 35 }}
          />

          {/* Option 1: Modo Comprador */}
          <button
            onClick={() => onModeChange('buyer')}
            className={`relative z-10 w-1/2 py-2.5 sm:py-3 px-3 rounded-xl flex items-center justify-center gap-2 text-xs sm:text-sm font-extrabold transition-colors cursor-pointer select-none ${
              mode === 'buyer' ? 'text-black' : 'text-white/70 hover:text-white'
            }`}
          >
            <span className="text-base sm:text-lg">🛒</span>
            <span>Modo Comprador</span>
          </button>

          {/* Option 2: Modo Vendedor */}
          <button
            onClick={() => onModeChange('seller')}
            className={`relative z-10 w-1/2 py-2.5 sm:py-3 px-3 rounded-xl flex items-center justify-center gap-2 text-xs sm:text-sm font-extrabold transition-colors cursor-pointer select-none ${
              mode === 'seller' ? 'text-black' : 'text-white/70 hover:text-white'
            }`}
          >
            <span className="text-base sm:text-lg">🏪</span>
            <span>Modo Vendedor</span>
          </button>
        </div>
      </div>

      {/* Mode Sub-Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 pb-2 pt-1 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-max justify-start sm:justify-center">
          {mode === 'buyer'
            ? buyerOptions.map((opt) => {
                const Icon = opt.icon;
                const isActive = buyerTab === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => onBuyerTabChange(opt.id)}
                    className={`relative px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                      isActive
                        ? 'bg-white text-black shadow-md font-extrabold scale-[1.02]'
                        : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/5'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#FF6A00]' : 'text-white/60'}`} />
                    <span>{opt.label}</span>

                    {opt.badge && opt.badge > 0 ? (
                      <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-[#FF6A00] text-black font-black text-[10px]">
                        {opt.badge}
                      </span>
                    ) : null}
                  </button>
                );
              })
            : sellerOptions.map((opt) => {
                const Icon = opt.icon;
                const isActive = sellerTab === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => onSellerTabChange(opt.id)}
                    className={`relative px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                      isActive
                        ? 'bg-[#FF6A00] text-black shadow-lg font-extrabold scale-[1.02]'
                        : opt.highlight
                        ? 'bg-[#FF6A00]/20 text-[#FF8A3D] border border-[#FF6A00]/40 hover:bg-[#FF6A00]/30'
                        : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/5'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-black' : opt.highlight ? 'text-[#FF6A00]' : 'text-white/60'}`} />
                    <span>{opt.label}</span>

                    {opt.badge && opt.badge > 0 ? (
                      <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-white text-black font-black text-[10px]">
                        {opt.badge}
                      </span>
                    ) : null}
                  </button>
                );
              })}
        </div>
      </div>
    </header>
  );
};
