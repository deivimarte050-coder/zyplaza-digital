import React, { useState } from 'react';
import { Listing, UserProfileData } from '../types';
import { 
  User, 
  ShoppingBag, 
  Heart, 
  ShieldCheck, 
  Star, 
  MapPin, 
  Settings, 
  RotateCcw, 
  BadgeCheck, 
  Plus,
  LogOut,
  LogIn,
  LayoutDashboard
} from 'lucide-react';

interface UserProfileProps {
  user: UserProfileData | null;
  userListings: Listing[];
  favoriteListings: Listing[];
  onSelectListing: (listing: Listing) => void;
  onOpenCreateListing: () => void;
  onResetData: () => void;
  onLogout: () => void;
  onRequestAuth: () => void;
  onOpenSellerPanel?: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  user,
  userListings,
  favoriteListings,
  onSelectListing,
  onOpenCreateListing,
  onResetData,
  onLogout,
  onRequestAuth,
  onOpenSellerPanel,
}) => {
  const [activeTab, setActiveTab] = useState<'my_items' | 'favorites' | 'security'>('my_items');

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 space-y-6 text-white text-center">
        <div className="bg-[#18191C] border border-white/10 rounded-3xl p-8 space-y-4 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-[#FF6A00]/20 border border-[#FF6A00]/30 flex items-center justify-center mx-auto text-[#FF8A3D]">
            <User className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-black text-white">Inicia Sesión en Zyplaza</h2>
            <p className="text-xs text-white/60">
              Crea tu cuenta o ingresa para publicar productos, contactar vendedores por WhatsApp, chatear y administrar tu perfil local.
            </p>
          </div>

          <button
            onClick={onRequestAuth}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#FF6A00] to-[#e85f00] text-black font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 hover:scale-[1.02] transition-all cursor-pointer shadow-lg shadow-[#FF6A00]/20"
          >
            <LogIn className="w-4 h-4 text-black" />
            <span>Iniciar Sesión / Registrarse</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 text-white pb-16">
      {/* Profile Card Header */}
      <div className="bg-[#18191C] border border-white/10 rounded-3xl p-6 relative overflow-hidden shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={user.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"}
              alt="Perfil"
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-[#FF6A00]"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-extrabold text-white">{user.name}</h1>
                {user.isVerified && <BadgeCheck className="w-5 h-5 text-[#FF8A3D]" />}
              </div>
              <p className="text-xs text-white/50">{user.email || user.phone} · {user.city}</p>

              <div className="flex items-center gap-2 mt-2 text-xs font-semibold text-[#FF8A3D]">
                <Star className="w-4 h-4 fill-[#FF8A3D] text-[#FF8A3D]" />
                <span>{user.rating || '5.0'} Vendedor Verificado</span>
                <span className="text-white/40">• {user.salesCount || 0} ventas</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenSellerPanel && (
              <button
                onClick={onOpenSellerPanel}
                className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-extrabold text-xs hover:scale-105 transition-all shadow-md shadow-purple-500/20 flex items-center gap-1.5 cursor-pointer"
              >
                <LayoutDashboard className="w-4 h-4 text-white" />
                <span>Panel Vendedor</span>
              </button>
            )}

            <button
              onClick={onOpenCreateListing}
              className="px-4 py-2 rounded-full bg-[#FF6A00] text-black font-extrabold text-xs hover:scale-105 transition-all shadow-md shadow-[#FF6A00]/20 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-black" />
              <span>Publicar</span>
            </button>

            <button
              onClick={onLogout}
              className="p-2 rounded-full bg-white/5 hover:bg-red-500/20 text-white hover:text-red-400 border border-white/10 transition-all cursor-pointer"
              title="Cerrar Sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mt-6 pt-4 border-t border-white/10 text-center text-xs">
          <div>
            <span className="block text-base font-extrabold text-white">{userListings.length}</span>
            <span className="text-white/50">Publicaciones</span>
          </div>
          <div>
            <span className="block text-base font-extrabold text-[#FF8A3D]">{favoriteListings.length}</span>
            <span className="text-white/50">Favoritos</span>
          </div>
          <div>
            <span className="block text-base font-extrabold text-emerald-400">100%</span>
            <span className="text-white/50">Reputación Positiva</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-white/10 text-xs sm:text-sm font-bold gap-6">
        <button
          onClick={() => setActiveTab('my_items')}
          className={`pb-3 border-b-2 transition-all cursor-pointer ${
            activeTab === 'my_items' ? 'border-[#FF6A00] text-[#FF8A3D]' : 'border-transparent text-white/50 hover:text-white'
          }`}
        >
          Mis Publicaciones ({userListings.length})
        </button>

        <button
          onClick={() => setActiveTab('favorites')}
          className={`pb-3 border-b-2 transition-all cursor-pointer ${
            activeTab === 'favorites' ? 'border-[#FF6A00] text-[#FF8A3D]' : 'border-transparent text-white/50 hover:text-white'
          }`}
        >
          Guardados / Favoritos ({favoriteListings.length})
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`pb-3 border-b-2 transition-all cursor-pointer ${
            activeTab === 'security' ? 'border-[#FF6A00] text-[#FF8A3D]' : 'border-transparent text-white/50 hover:text-white'
          }`}
        >
          Seguridad y Configuración
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'my_items' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {userListings.map(item => (
            <div
              key={item.id}
              onClick={() => onSelectListing(item)}
              className="bg-neutral-900 border border-white/10 rounded-2xl overflow-hidden p-3 cursor-pointer hover:border-[#FF6A00]/50 transition-all flex items-center gap-3"
            >
              <img src={item.images[0]} alt="" className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-white truncate">{item.title}</h4>
                <p className="text-xs font-extrabold text-[#FF8A3D] mt-0.5">RD$ {item.price.toLocaleString()}</p>
                <span className="text-[10px] text-emerald-400 font-semibold">● Activo</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'favorites' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {favoriteListings.length === 0 ? (
            <p className="text-xs text-white/50 col-span-full py-8 text-center">No tienes artículos guardados en favoritos.</p>
          ) : (
            favoriteListings.map(item => (
              <div
                key={item.id}
                onClick={() => onSelectListing(item)}
                className="bg-neutral-900 border border-white/10 rounded-2xl overflow-hidden p-3 cursor-pointer hover:border-[#FF6A00]/50 transition-all flex items-center gap-3"
              >
                <img src={item.images[0]} alt="" className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-white truncate">{item.title}</h4>
                  <p className="text-xs font-extrabold text-[#FF8A3D] mt-0.5">RD$ {item.price.toLocaleString()}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'security' && (
        <div className="bg-neutral-900 border border-white/10 rounded-3xl p-6 space-y-4 text-xs">
          <div className="flex items-center gap-3 text-emerald-400 font-bold">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>Verificación de Identidad Activa (Verificado con Cédula)</span>
          </div>

          <div className="pt-4 border-t border-white/10 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-white text-sm">Restablecer Datos de Demostración</h4>
              <p className="text-white/50 text-[11px]">Restaura las ofertas relámpago, tiendas y chats originales del prototipo.</p>
            </div>
            <button
              onClick={onResetData}
              className="px-4 py-2 rounded-full bg-white/10 hover:bg-red-500/20 text-white hover:text-red-400 font-bold text-xs border border-white/10 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restablecer</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
