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
  TrendingUp,
  Search,
  Plus
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
      {/* 1. Category Tiles Bar */}
      <div className="max-w-7xl mx-auto px-3.5 sm:px-4">
        <p className="font-mono text-[10.5px] tracking-[0.08em] uppercase text-text-3 mb-3">Categorías</p>
        <div className="relative grid grid-cols-5 sm:flex sm:items-center sm:gap-4 gap-2">
          <div className="hidden sm:block absolute top-[22px] left-[10%] right-[10%] h-px zy-dashed-line" />
          {categories.map(cat => {
            const isActive = filters.category === cat.id;
            const IconComp = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => onFilterChange({ category: cat.id })}
                className="relative z-10 flex flex-col items-center gap-2 cursor-pointer"
              >
                <div
                  className={`w-11 h-11 rounded-[13px] flex items-center justify-center border transition-all ${
                    isActive
                      ? 'bg-orange-dim border-orange text-orange-soft'
                      : 'bg-surface border-line text-orange-soft hover:border-line-strong'
                  }`}
                >
                  <IconComp className="w-[18px] h-[18px]" />
                </div>
                <span className="text-[10.5px] text-text-2 text-center leading-tight">{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Hero Banner */}
      <div className="max-w-7xl mx-auto px-3.5 sm:px-4">
        <div
          className="relative rounded-[18px] p-5 sm:p-6 border border-line overflow-hidden bg-surface"
          style={{ backgroundImage: 'radial-gradient(circle at 85% -10%, rgba(255,94,26,0.35), transparent 55%)' }}
        >
          <div className="absolute inset-0 zy-grid-bg pointer-events-none" />

          <span className="relative inline-flex items-center gap-1.5 font-mono text-[10.5px] text-orange-soft bg-orange-dim border border-orange/30 px-2.5 py-[5px] rounded-full mb-3.5">
            <Zap className="w-[11px] h-[11px] fill-orange-soft" />
            SEMANAS DE OFERTAS LOCALES
          </span>

          <h2 className="relative font-display font-semibold text-[21px] leading-[1.25] text-text-1 tracking-tight mb-2 max-w-[85%]">
            Ahorra hasta <em className="text-orange-soft not-italic">40%</em> en tecnología y moda
          </h2>

          <p className="relative text-[12.5px] text-text-2 leading-relaxed mb-4 max-w-[88%]">
            Conecta directamente con vendedores particulares y negocios verificados de {filters.city || 'San Pedro de Macorís'}.
          </p>

          <button
            onClick={() => onFilterChange({ flashOnly: true })}
            className="relative inline-flex items-center gap-1.5 bg-text-1 text-void font-semibold text-[13px] px-4 py-2.5 rounded-[11px] cursor-pointer hover:opacity-90 transition-opacity"
          >
            Ver ofertas
            <ChevronRight className="w-[13px] h-[13px]" />
          </button>
        </div>
      </div>

      {/* 3. Trust Badges Row */}
      <div className="max-w-7xl mx-auto px-3.5 sm:px-4 py-1">
        <div className="grid grid-cols-3 gap-1 bg-surface border border-line rounded-2xl p-2.5 text-center text-[10px] sm:text-xs text-text-2">
          <div className="flex items-center justify-center gap-1.5 px-1">
            <ShieldCheck className="w-3.5 h-3.5 text-orange-soft flex-shrink-0" />
            <span className="line-clamp-1 font-medium">Vendedores verificados</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 px-1 border-x border-line">
            <Tag className="w-3.5 h-3.5 text-orange-soft flex-shrink-0" />
            <span className="line-clamp-1 font-medium">Las mejores ofertas</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 px-1">
            <Headphones className="w-3.5 h-3.5 text-orange-soft flex-shrink-0" />
            <span className="line-clamp-1 font-medium">Soporte local rápido</span>
          </div>
        </div>
      </div>

      {/* Store search results (solo cuando hay búsqueda) */}
      {matchedStores.length > 0 && (
        <section className="max-w-7xl mx-auto px-3.5 sm:px-4">
          <h2 className="font-display font-semibold text-[15px] text-text-1 flex items-center gap-1.5 mb-3">
            <TrendingUp className="w-4 h-4 text-orange-soft" />
            Tiendas encontradas
          </h2>
          <div className="flex gap-2.5 overflow-x-auto pb-1.5 no-scrollbar">
            {matchedStores.map(store => (
              <div
                key={store.id}
                onClick={() => onSelectStore(store)}
                className="flex-shrink-0 w-56 bg-surface border border-line rounded-2xl p-3 flex items-center gap-2.5 cursor-pointer hover:border-orange/50 transition-all active:scale-95"
              >
                <img src={store.logo} alt={store.name} className="w-11 h-11 rounded-xl object-cover border border-line flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-text-1 truncate flex items-center gap-1">
                    {store.name}
                    {store.verified && <ShieldCheck className="w-3.5 h-3.5 text-orange-soft" />}
                  </p>
                  <p className="text-[10px] text-text-2 truncate">{store.category} · {store.city}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Flash Deals (solo si hay ofertas reales) */}
      {flashItems.length > 0 && (
        <section className="max-w-7xl mx-auto px-3.5 sm:px-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-semibold text-[15px] text-text-1 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-orange-soft fill-orange-soft" />
              Ofertas Relámpago
            </h2>
            <div className="flex items-center gap-1 text-[10px] font-bold text-orange-soft bg-orange-dim px-2 py-0.5 rounded-md border border-orange/30">
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
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="font-display font-semibold text-[15px] text-text-1">
            {searchQuery
              ? `Resultados para "${filters.searchQuery}" (${listings.length})`
              : 'Publicaciones cercanas'}
          </h3>

          <select
            value={filters.sortBy}
            onChange={(e) => onFilterChange({ sortBy: e.target.value as any })}
            className="bg-transparent text-[12px] text-text-2 focus:outline-none cursor-pointer"
          >
            <option value="recent">Más recientes</option>
            <option value="price_asc">Menor precio</option>
            <option value="price_desc">Mayor precio</option>
            <option value="distance">Más cercanos</option>
          </select>
        </div>

        {listings.length === 0 ? (
          <div className="border border-dashed border-line-strong rounded-2xl px-6 py-9 text-center">
            <div className="w-[46px] h-[46px] rounded-[13px] bg-surface-2 border border-line flex items-center justify-center text-text-3 mx-auto mb-3.5">
              <Search className="w-5 h-5" />
            </div>
            <h4 className="font-display font-semibold text-[14.5px] text-text-1 mb-1.5">
              {searchQuery ? 'No encontramos coincidencias' : 'Aún no hay publicaciones aquí'}
            </h4>
            <p className="text-[12.5px] text-text-2 leading-relaxed max-w-[230px] mx-auto mb-4">
              {searchQuery
                ? 'Prueba con otra palabra clave o revisa más tarde: nuevos artículos se publican todos los días.'
                : 'Sé el primero en vender cerca de ti. Tu artículo aparecerá aquí en cuanto lo publiques.'}
            </p>
            <button
              onClick={onOpenCreateListing}
              className="inline-flex items-center gap-1.5 bg-orange-dim text-orange-soft border border-orange/30 text-[12.5px] font-semibold px-3.5 py-2.5 rounded-[10px] cursor-pointer hover:bg-orange-dim/80 transition-colors"
            >
              <Plus className="w-[13px] h-[13px]" />
              Publicar artículo
            </button>
          </div>
        ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {listings.map(item => (
            <div
              key={item.id}
              onClick={() => onSelectListing(item)}
              className="bg-surface border border-line rounded-2xl overflow-hidden cursor-pointer hover:border-orange/40 transition-all shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-square w-full bg-void overflow-hidden">
                  <img
                    src={item.images[0]}
                    alt={item.title}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                  {item.isVerifiedStore && (
                    <span className="absolute top-2 left-2 bg-void/80 backdrop-blur-md text-orange-soft text-[9px] font-bold px-1.5 py-0.5 rounded-md border border-orange/30 flex items-center gap-1">
                      <BadgeCheck className="w-2.5 h-2.5 text-orange" />
                      Verificado
                    </span>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(item.id);
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-void/50 backdrop-blur-md text-text-1 hover:text-red-500 transition-colors"
                  >
                    <Heart className={`w-3.5 h-3.5 ${favorites.includes(item.id) ? 'fill-red-500 text-red-500' : ''}`} />
                  </button>
                </div>

                <div className="p-2.5 space-y-1">
                  <h3 className="text-xs font-semibold text-text-1 line-clamp-2 leading-snug">
                    {item.title}
                  </h3>

                  <div className="flex items-baseline gap-1.5 pt-1">
                    <span className="text-sm font-extrabold text-orange-soft">
                      RD$ {item.price.toLocaleString()}
                    </span>
                    {item.originalPrice && (
                      <span className="text-[10px] text-text-3 line-through">
                        RD$ {item.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-2.5 pt-0 flex items-center justify-between text-[10px] text-text-2">
                <span className="truncate max-w-[100px]">{item.sellerName}</span>
                <span className="flex items-center gap-0.5">
                  <MapPin className="w-2.5 h-2.5 text-[#FF8A3D]" />
                  {item.distanceKm} km
                </span>
              </div>
            </div>
          ))}
        </div>
        )}
      </section>
    </div>
  );
};

