import React, { useState } from 'react';
import { Listing, Store, UserProfileData } from '../types';
import { CITIES } from '../data/mockData';
import { updateUserProfile } from '../services/firestore';
import { uploadImage } from '../services/imageUpload';
import {
  User,
  ShieldCheck,
  Star,
  BadgeCheck,
  Plus,
  LogOut,
  LogIn,
  LayoutDashboard,
  ShieldHalf,
  Rocket,
  BarChart3,
  Pencil,
  Camera
} from 'lucide-react';

interface UserProfileProps {
  user: UserProfileData | null;
  userListings: Listing[];
  favoriteListings: Listing[];
  onSelectListing: (listing: Listing) => void;
  onOpenCreateListing: () => void;
  onLogout: () => void;
  onRequestAuth: () => void;
  onOpenSellerPanel?: () => void;
  isAdmin?: boolean;
  isSeller?: boolean;
  userStore?: Store | null;
  onOpenCreateStore?: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  user,
  userListings,
  favoriteListings,
  onSelectListing,
  onOpenCreateListing,
  onLogout,
  onRequestAuth,
  onOpenSellerPanel,
  isAdmin = false,
  isSeller = false,
  userStore = null,
  onOpenCreateStore,
}) => {
  const [activeTab, setActiveTab] = useState<'my_items' | 'favorites' | 'security'>('my_items');

  // ---- Edición de perfil (persistida en Firestore) ----
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editCity, setEditCity] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');
  const [profileInitialized, setProfileInitialized] = useState(false);

  const startEditIfNeeded = () => {
    if (profileInitialized || !user) return;
    setEditName(user.name || '');
    setEditPhone(user.phone || '');
    setEditCity(user.city || CITIES[0]);
    setProfileInitialized(true);
  };

  const handleSaveProfile = async () => {
    if (!user || savingProfile) return;
    if (!editName.trim()) {
      setProfileMsg('El nombre no puede estar vacío.');
      return;
    }
    setSavingProfile(true);
    setProfileMsg('');
    try {
      let avatarUrl = user.avatar;
      if (avatarFile) {
        avatarUrl = await uploadImage(avatarFile, `users/${user.id}/avatar-${Date.now()}.jpg`);
      }
      await updateUserProfile(user.id, {
        name: editName.trim(),
        phone: editPhone.trim() || undefined,
        city: editCity,
        avatar: avatarUrl,
      });
      setProfileMsg('✅ Perfil actualizado correctamente.');
    } catch {
      setProfileMsg('❌ No se pudo guardar. Intenta de nuevo.');
    } finally {
      setSavingProfile(false);
    }
  };

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
              src={user.avatar || `https://ui-avatars.com/api/?background=FF6A00&color=000&name=${encodeURIComponent(user.name || 'U')}`}
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
                <span>{(user.rating ?? 5).toFixed(1)}</span>
                <span className="text-white/40">• {isSeller ? 'Cuenta de vendedor' : 'Cuenta de comprador'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <a
                href="/admin"
                className="px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-extrabold text-xs hover:scale-105 transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer"
              >
                <ShieldHalf className="w-4 h-4 text-black" />
                <span>Administración</span>
              </a>
            )}

            {isSeller && onOpenSellerPanel && (
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
            <span className="block text-base font-extrabold text-emerald-400">
              {userListings.filter((l) => l.status === 'active').length}
            </span>
            <span className="text-white/50">Activas ahora</span>
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
          onClick={() => {
            setActiveTab('security');
            startEditIfNeeded();
          }}
          className={`pb-3 border-b-2 transition-all cursor-pointer ${
            activeTab === 'security' ? 'border-[#FF6A00] text-[#FF8A3D]' : 'border-transparent text-white/50 hover:text-white'
          }`}
        >
          Configuración
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
                <span className={`text-[10px] font-semibold ${
                  item.status === 'active' ? 'text-emerald-400' : 'text-white/40'
                }`}>
                  ● {item.status === 'active' ? 'Activo' : item.status === 'sold' ? 'Vendido' : 'Pausado'}
                </span>
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
        <div className="bg-neutral-900 border border-white/10 rounded-3xl p-6 space-y-5 text-xs">
          <div className="flex items-center gap-3 text-emerald-400 font-bold">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>Cuenta protegida con Firebase Authentication</span>
          </div>

          {/* Editar perfil */}
          <div className="pt-4 border-t border-white/10 space-y-3">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <Pencil className="w-4 h-4 text-[#FF8A3D]" />
              Editar mi perfil
            </h4>

            {profileMsg && (
              <p className={`text-[11px] font-semibold ${profileMsg.startsWith('✅') ? 'text-emerald-400' : 'text-red-400'}`}>
                {profileMsg}
              </p>
            )}

            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={
                    avatarFile
                      ? URL.createObjectURL(avatarFile)
                      : user.avatar || `https://ui-avatars.com/api/?background=FF6A00&color=000&name=${encodeURIComponent(user.name || 'U')}`
                  }
                  alt=""
                  className="w-14 h-14 rounded-full object-cover border border-white/20"
                />
                <label className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-[#FF6A00] text-black cursor-pointer hover:scale-110 transition-all">
                  <Camera className="w-3 h-3" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) setAvatarFile(f);
                      e.target.value = '';
                    }}
                  />
                </label>
              </div>
              <p className="text-[11px] text-white/50">Toca el ícono de cámara para cambiar tu foto de perfil.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-white/70">Nombre completo</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF8A3D]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-white/70">Teléfono / WhatsApp</label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="Ej: 809-555-1234"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF8A3D]"
                />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <label className="text-[11px] font-bold text-white/70">Ciudad</label>
                <select
                  value={editCity}
                  onChange={(e) => setEditCity(e.target.value)}
                  className="w-full bg-[#1A1B1F] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF8A3D]"
                >
                  {CITIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleSaveProfile}
              disabled={savingProfile}
              className="px-5 py-2.5 rounded-full bg-[#FF6A00] text-black font-extrabold text-xs hover:bg-[#ff7b1a] transition-all cursor-pointer disabled:opacity-60"
            >
              {savingProfile ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>

          {/* Cerrar sesión */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-white text-sm">Cerrar sesión</h4>
              <p className="text-white/50 text-[11px]">Sal de tu cuenta en este dispositivo.</p>
            </div>
            <button
              onClick={onLogout}
              className="px-4 py-2 rounded-full bg-white/10 hover:bg-red-500/20 text-white hover:text-red-400 font-bold text-xs border border-white/10 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Salir</span>
            </button>
          </div>
        </div>
      )}

      {/* Tarjeta de vendedor: invita a crear tienda o muestra la tienda activa */}
      {isSeller ? (
        <div className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/60 via-[#101216] to-[#101216] p-5 sm:p-6 shadow-xl">
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-2xl">
                🏪
              </div>
              <div>
                <h3 className="text-sm font-black text-white">Mi tienda</h3>
                <p className="text-xs font-bold text-white truncate max-w-[180px]">{userStore?.name || 'Mi tienda'}</p>
                <div className="mt-1 flex items-center gap-2 text-[11px] font-semibold">
                  <span className="inline-flex items-center gap-1 text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Activa
                  </span>
                  <span className="text-white/40">•</span>
                  <span className="text-white/60">{userStore?.sellerLevel || 'Nuevo Vendedor'}</span>
                </div>
              </div>
            </div>

            {onOpenSellerPanel && (
              <button
                onClick={onOpenSellerPanel}
                className="flex-shrink-0 flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2.5 text-xs font-extrabold text-black hover:scale-105 transition-all shadow-md shadow-emerald-500/25 cursor-pointer"
              >
                <BarChart3 className="w-4 h-4 text-black" />
                <span>Ir al Panel de vendedor</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-3xl border border-[#FF6A00]/25 bg-gradient-to-br from-[#2B1608] via-[#18191C] to-[#18191C] p-5 sm:p-6 shadow-xl">
          <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-[#FF6A00]/15 blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 max-w-sm">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#FF6A00] to-[#FF8A3D] text-2xl">
                🏪
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black text-white">Vende en Zyplaza</h3>
                <p className="mt-0.5 text-xs text-white/60 leading-relaxed">
                  ¿Tienes productos para vender? Crea tu tienda gratis y comienza a vender en pocos minutos.
                </p>
              </div>
            </div>

            {onOpenCreateStore && (
              <button
                onClick={onOpenCreateStore}
                className="flex-shrink-0 flex items-center gap-2 rounded-full bg-gradient-to-r from-[#FF6A00] to-[#e85f00] px-4 py-2.5 text-xs font-extrabold text-black hover:scale-105 transition-all shadow-md shadow-[#FF6A00]/25 cursor-pointer"
              >
                <Rocket className="w-4 h-4 text-black" />
                <span>Crear mi tienda</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
