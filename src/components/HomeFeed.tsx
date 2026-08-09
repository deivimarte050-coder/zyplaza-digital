import React, { useState, useEffect } from 'react';
import { 
  Listing, 
  Store, 
  FilterState 
} from '../types';
import { 
  Zap, 
  Heart, 
  ChevronRight,
  ShieldCheck,
  Tag,
  Headphones,
  LayoutGrid,
  Monitor,
  Shirt,
  Armchair,
  Sparkles,
  MoreHorizontal,
  BadgeCheck,
  Star,
  MapPin,
  SlidersHorizontal,
  Clock,
  Cpu,
  ShoppingBag,
  Home as HomeIcon,
  Car,
  Trophy,
  TrendingUp
} from 'lucide-react';

interface HomeFeedProps {
  listings: Listing[];
  stores: Store[];
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  onSelectListing: (listing: Listing) => void;
  onSelectStore: (store: Store) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onOpenCreateListing: () => void;
  isSeller?: boolean;
  onOpenCreateStore?: () => void;
}

export const HomeFeed: React.FC<HomeFeedProps> = ({
  listings,
  stores,
  filters,
  onFilterChange,
  onSelectListing,
  onSelectStore,
  favorites,
  onToggleFavorite,
  onOpenCreateListing,
  isSeller = false,
  onOpenCreateStore,
}) => {
  const categories = [
    { id: 'tech', label: 'Tecnología', icon: Cpu },
    { id: 'fashion', label: 'Moda', icon: ShoppingBag },
    { id: 'home', label: 'Hogar', icon: HomeIcon },
    { id: 'vehicles', label: 'Vehículos', icon: Car },
    { id: 'sports', label: 'Deportes', icon: Trophy },
    { id: 'beauty', label: 'Belleza', icon: Sparkles },
  ];

  // Ofertas reales: productos publicados con descuento (precio original > precio).
  const flashItems: Listing[] = [...listings]
    .filter((l) => l.originalPrice && l.originalPrice > l.price)
    .sort((a, b) => {
      const discA = 1 - a.price / (a.originalPrice ?? a.price);
      const discB = 1 - b.price / (b.originalPrice ?? b.price);
      return discB - discA;
    })
    .slice(0, 3);

  // Tiendas que coinciden con la búsqueda actual.
  const searchQuery = (filters.searchQuery || '').trim().toLowerCase();
  const matchedStores: Store[] = searchQuery
    ? stores.filter((st) => {
        const name = (st.name || '').toLowerCase();
        const cat = (st.category || '').toLowerCase();
        const desc = (st.description || '').toLowerCase();
        return name.includes(searchQuery) || cat.includes(searchQuery) || desc.includes(searchQuery);
      })
    : [];

  return (
    <div className="space-y-4 pb-20 pt-1">
      {/* 1. Category Tiles Bar (Exact matches screenshot) */}
      <div className="overflow-x-auto no-scrollbar flex items-center gap-2.5 px-3.5 sm:px-4 max-w-7xl mx-auto">
        {categories.map(cat => {
          const isActive = filters.category === cat.id;
          const IconComp = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => onFilterChange({ category: cat.id })}
              className={`flex flex-col items-center justify-center w-[72px] h-[68px] sm:w-20 sm:h-20 rounded-2xl flex-shrink-0 transition-all cursor-pointer ${
                isActive || (cat.id === 'all' && filters.category === 'all')
                  ? 'bg-[#3D2012] border border-[#FF6A00]/50 text-[#FF8A3D] shadow-md shadow-[#FF6A00]/10'
                  : 'bg-[#18191C] border border-white/5 text-white/70 hover:bg-[#222429] hover:text-white'
              }`}
            >
              <IconComp className={`w-5 h-5 mb-1.5 ${isActive ? 'text-[#FF8A3D]' : 'text-white/80'}`} />
              <span className="text-[11px] font-medium leading-none text-center">{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* 2. Hero Banner (Dark warm orange background + 3D shopping bag) */}
      <div className="max-w-7xl mx-auto px-3.5 sm:px-4">
        <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-r from-[#170C06] via-[#2D1408] to-[#8A3402] p-4 sm:p-6 flex items-center justify-between shadow-2xl">
          {/* Subtle Orange Glow Circle */}
          <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#FF6A00]/30 via-transparent to-transparent pointer-events-none" />

          {/* Left Text Column */}
          <div className="relative z-10 max-w-md space-y-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#2B170C] border border-[#FF6A00]/30 text-[#FF8A3D] text-[10px] font-extrabold tracking-wider uppercase">
              <Zap className="w-3 h-3 fill-[#FF8A3D] text-[#FF8A3D]" />
              Semanas de Ofertas Locales
            </span>
            
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
              Ahorra hasta un <span className="text-[#FF8A3D]">40% en tecnología y moda</span> cerca de ti
            </h1>
            
            <p className="text-[11px] sm:text-xs text-white/70 leading-normal font-normal max-w-xs">
              Conecta directamente con vendedores particulares y negocios verificados de {filters.city || 'San Pedro de Macorís'}.
            </p>

            <div className="pt-1">
              <button 
                onClick={() => onFilterChange({ flashOnly: true })}
                className="bg-white text-black font-extrabold text-xs px-4 py-2 rounded-full shadow-lg hover:bg-neutral-100 transition-all flex items-center gap-1 cursor-pointer"
              >
                <span>Ver ofertas</span>
                <ChevronRight className="w-3.5 h-3.5 text-black" />
              </button>
            </div>
          </div>

          {/* Right 3D Shopping Bag Illustration */}
          <div className="relative hidden xs:flex items-center justify-center w-28 sm:w-36 h-28 sm:h-36 flex-shrink-0">
            {/* 3D Bag graphic rendering */}
            <div className="relative w-24 h-28 bg-gradient-to-br from-[#2D2E33] to-[#121316] rounded-2xl shadow-2xl border border-white/20 flex flex-col items-center justify-center transform rotate-6 hover:rotate-0 transition-transform duration-300">
              {/* Bag Handles */}
              <div className="absolute -top-3 w-12 h-6 border-2 border-white/40 rounded-t-full pointer-events-none" />
              {/* Giant Percent Symbol */}
              <span className="text-4xl font-black text-[#FF6A00] tracking-tighter drop-shadow-[0_4px_12px_rgba(255,106,0,0.5)]">
                %
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Trust Badges Row */}
      <div className="max-w-7xl mx-auto px-3.5 sm:px-4 py-1">
        <div className="grid grid-cols-3 gap-1 bg-[#141518] border border-white/5 rounded-2xl p-2.5 text-center text-[10px] sm:text-xs text-white/70">
          <div className="flex items-center justify-center gap-1.5 px-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#FF8A3D] flex-shrink-0" />
            <span className="line-clamp-1 font-medium">Vendedores verificados</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 px-1 border-x border-white/10">
            <Tag className="w-3.5 h-3.5 text-[#FF8A3D] flex-shrink-0" />
            <span className="line-clamp-1 font-medium">Las mejores ofertas</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 px-1">
            <Headphones className="w-3.5 h-3.5 text-[#FF8A3D] flex-shrink-0" />
            <span className="line-clamp-1 font-medium">Soporte local rápido</span>
          </div>
        </div>
      </div>

      {/* Store search results (solo cuando hay búsqueda) */}
      {matchedStores.length > 0 && (
        <section>
          <h2 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-1.5 mb-3">
            <TrendingUp className="w-4 h-4 text-[#FF8A3D]" />
            Tiendas encontradas
          </h2>
          <div className="flex gap-2.5 overflow-x-auto pb-1.5 no-scrollbar">
            {matchedStores.map(store => (
              <div
                key={store.id}
                onClick={() => onSelectStore(store)}
                className="flex-shrink-0 w-56 bg-neutral-900 border border-white/10 rounded-2xl p-3 flex items-center gap-2.5 cursor-pointer hover:border-[#FF6A00]/50 transition-all active:scale-95"
              >
                <img src={store.logo} alt={store.name} className="w-11 h-11 rounded-xl object-cover border border-white/10 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate flex items-center gap-1">
                    {store.name}
                    {store.verified && <ShieldCheck className="w-3.5 h-3.5 text-[#FF8A3D]" />}
                  </p>
                  <p className="text-[10px] text-white/50 truncate">{store.category} · {store.city}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Flash Deals (solo si hay ofertas reales) */}
      {flashItems.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-[#FF8A3D] fill-[#FF8A3D]" />
              Ofertas Relámpago
            </h2>
            <div className="flex items-center gap-1 text-[10px] font-bold text-[#FF8A3D] bg-[#FF6A00]/10 px-2 py-0.5 rounded-md border border-[#FF6A00]/30">
              <Clock className="w-3 h-3" />
              <span>Por tiempo limitado</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {flashItems.map(item => (
              <div
                key={item.id}
                onClick={() => onSelectListing(item)}
                className="bg-neutral-900 rounded-xl overflow-hidden cursor-pointer border border-[#FF6A00]/30 hover:border-[#FF6A00] shadow-[0_0_15px_rgba(255,106,0,0.1)] transition-all active:scale-95"
              >
                <div className="relative aspect-square">
                  <img src={item.images[0]} alt={item.title} loading="lazy" className="w-full h-full object-cover" />
                  <div className="absolute top-1.5 left-1.5 bg-[#FF6A00] text-black text-[8px] font-black px-1.5 py-0.5 rounded">
                    -{item.originalPrice ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100) : 0}%
                  </div>
                </div>
                <div className="p-1.5 sm:p-2 space-y-0.5">
                  <p className="text-[10px] sm:text-xs font-semibold text-white truncate">{item.title}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs sm:text-sm font-extrabold text-[#FF8A3D]">
                      RD$ {item.price.toLocaleString()}
                    </span>
                    {item.originalPrice && (
                      <span className="text-[9px] text-white/40 line-through hidden sm:inline">
                        {item.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 6. All Listings Grid */}
      <section className="max-w-7xl mx-auto px-3.5 sm:px-4 pt-3">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm sm:text-base font-bold text-white">
            Más Publicaciones Cercanas ({listings.length})
          </h2>

          <select
            value={filters.sortBy}
            onChange={(e) => onFilterChange({ sortBy: e.target.value as any })}
            className="bg-[#18191C] border border-white/10 rounded-full px-2.5 py-1 text-[11px] text-white focus:outline-none focus:border-[#FF8A3D] cursor-pointer"
          >
            <option value="recent">Más recientes</option>
            <option value="price_asc">Menor precio</option>
            <option value="price_desc">Mayor precio</option>
            <option value="distance">Más cercanos</option>
          </select>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {listings.map(item => (
            <div
              key={item.id}
              onClick={() => onSelectListing(item)}
              className="bg-[#18191C] border border-white/10 rounded-2xl overflow-hidden cursor-pointer hover:border-[#FF6A00]/40 transition-all shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-square w-full bg-neutral-950 overflow-hidden">
                  <img
                    src={item.images[0]}
                    alt={item.title}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                  {item.isVerifiedStore && (
                    <span className="absolute top-2 left-2 bg-black/80 backdrop-blur-md text-[#FF8A3D] text-[9px] font-bold px-1.5 py-0.5 rounded-md border border-[#FF6A00]/30 flex items-center gap-1">
                      <BadgeCheck className="w-2.5 h-2.5 text-[#FF6A00]" />
                      Verificado
                    </span>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(item.id);
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 backdrop-blur-md text-white hover:text-red-500 transition-colors"
                  >
                    <Heart className={`w-3.5 h-3.5 ${favorites.includes(item.id) ? 'fill-red-500 text-red-500' : ''}`} />
                  </button>
                </div>

                <div className="p-2.5 space-y-1">
                  <h3 className="text-xs font-semibold text-white line-clamp-2 leading-snug">
                    {item.title}
                  </h3>

                  <div className="flex items-baseline gap-1.5 pt-1">
                    <span className="text-sm font-extrabold text-[#FF8A3D]">
                      RD$ {item.price.toLocaleString()}
                    </span>
                    {item.originalPrice && (
                      <span className="text-[10px] text-white/40 line-through">
                        RD$ {item.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-2.5 pt-0 flex items-center justify-between text-[10px] text-white/50">
                <span className="truncate max-w-[100px]">{item.sellerName}</span>
                <span className="flex items-center gap-0.5">
                  <MapPin className="w-2.5 h-2.5 text-[#FF8A3D]" />
                  {item.distanceKm} km
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

