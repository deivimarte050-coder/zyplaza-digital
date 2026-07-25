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
  Clock
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
}) => {
  // Flash deal active countdown state
  const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 13, seconds: 44 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 2, minutes: 13, seconds: 44 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const categoriesList = [
    { id: 'all', name: 'Todas', icon: LayoutGrid },
    { id: 'tech', name: 'Tecnología', icon: Monitor },
    { id: 'fashion', name: 'Moda y Ropa', icon: Shirt },
    { id: 'home', name: 'Hogar', icon: Armchair },
    { id: 'beauty', name: 'Belleza', icon: Sparkles },
    { id: 'more', name: 'Más', icon: MoreHorizontal },
  ];

  // Specific 3 items for Flash Deals matching image
  const flashItems = [
    {
      id: 'item-1',
      title: 'Auriculares Inalámbricos',
      price: 2450,
      originalPrice: 3800,
      discount: '-35%',
      bgColor: 'bg-[#F2B705]', // Yellow background from screenshot
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'item-2',
      title: 'Smartwatch Series 8',
      price: 4100,
      originalPrice: 5900,
      discount: '-30%',
      bgColor: 'bg-[#E3E5E8]', // Light gray background from screenshot
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'item-3',
      title: 'Tenis Deportivos Running',
      price: 2890,
      originalPrice: 3900,
      discount: '-25%',
      bgColor: 'bg-[#B80D18]', // Red background from screenshot
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80',
    },
  ];

  return (
    <div className="space-y-4 pb-20 pt-1">
      {/* 1. Category Tiles Bar (Exact matches screenshot) */}
      <div className="overflow-x-auto no-scrollbar flex items-center gap-2.5 px-3.5 sm:px-4 max-w-7xl mx-auto">
        {categoriesList.map(cat => {
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
              <span className="text-[11px] font-medium leading-none text-center">{cat.name}</span>
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

      {/* 4. Ofertas Relámpago (Flash Deals) */}
      <section className="max-w-7xl mx-auto px-3.5 sm:px-4 pt-1">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <h2 className="text-sm sm:text-base font-black text-white flex items-center gap-1">
              <Zap className="w-4 h-4 text-[#FF6A00] fill-[#FF6A00]" />
              Ofertas Relámpago
            </h2>
            {/* Timer Badge */}
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#3D140C] border border-[#FF6A00]/30 font-mono text-[11px] font-bold text-[#FF6A00]">
              <Clock className="w-3 h-3 text-[#FF6A00]" />
              <span>{String(timeLeft.hours).padStart(2, '0')} : {String(timeLeft.minutes).padStart(2, '0')} : {String(timeLeft.seconds).padStart(2, '0')}</span>
            </div>
          </div>

          <button 
            onClick={() => onFilterChange({ flashOnly: !filters.flashOnly })}
            className="text-xs font-semibold text-[#FF8A3D] hover:underline flex items-center gap-0.5"
          >
            <span>Ver todas</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 3 Flash Offer Cards matching Screenshot */}
        <div className="grid grid-cols-3 gap-2.5">
          {flashItems.map(item => (
            <div
              key={item.id}
              onClick={() => {
                const found = listings.find(l => l.id === item.id) || listings[0];
                onSelectListing(found);
              }}
              className="bg-[#18191C] border border-white/10 rounded-2xl overflow-hidden cursor-pointer hover:border-[#FF6A00]/40 transition-all shadow-md flex flex-col justify-between"
            >
              <div className="relative aspect-square w-full flex items-center justify-center p-2 overflow-hidden" style={{ backgroundColor: item.bgColor.replace('bg-[', '').replace(']', '') }}>
                {/* Discount Badge */}
                <span className="absolute top-2 left-2 bg-[#FF6A00] text-black text-[10px] font-black px-1.5 py-0.5 rounded-md shadow">
                  {item.discount}
                </span>

                {/* Heart Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(item.id);
                  }}
                  className="absolute top-2 right-2 p-1 rounded-full bg-black/40 backdrop-blur-sm text-white hover:text-red-500 transition-colors"
                >
                  <Heart className={`w-3.5 h-3.5 ${favorites.includes(item.id) ? 'fill-red-500 text-red-500' : ''}`} />
                </button>

                {/* Product Image */}
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-contain mix-blend-multiply drop-shadow-md"
                />
              </div>

              {/* Card Text Content */}
              <div className="p-2.5 space-y-1 bg-[#18191C]">
                <h3 className="text-[11px] font-medium text-white/90 line-clamp-1">
                  {item.title}
                </h3>
                <div className="flex flex-col xs:flex-row xs:items-baseline gap-1">
                  <span className="text-xs font-black text-[#FF8A3D]">
                    RD$ {item.price.toLocaleString()}
                  </span>
                  <span className="text-[9px] text-white/40 line-through">
                    RD$ {item.originalPrice.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. "¿Tienes un negocio?" Banner */}
      <section className="max-w-7xl mx-auto px-3.5 sm:px-4 pt-2">
        <div className="bg-[#18191C] border border-white/10 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            {/* Storefront 3D graphic */}
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#FF6A00] to-[#FF8A3D] p-0.5 flex-shrink-0 flex items-center justify-center shadow-md">
              <div className="w-full h-full bg-[#18191C] rounded-[10px] flex items-center justify-center">
                <span className="text-xl">🏪</span>
              </div>
            </div>

            <div>
              <h3 className="text-xs sm:text-sm font-bold text-white">
                ¿Tienes un negocio?
              </h3>
              <p className="text-[10px] sm:text-xs text-white/60 leading-tight">
                Únete a Zyplaza <span className="text-[#FF8A3D] font-bold">LOCAL</span> y haz crecer tus ventas hoy mismo.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenCreateListing}
            className="flex-shrink-0 bg-[#FF6A00] text-black font-extrabold text-[11px] sm:text-xs px-3.5 py-2 rounded-xl hover:bg-[#ff7b1a] transition-all cursor-pointer shadow-md"
          >
            Publicar mi negocio
          </button>
        </div>
      </section>

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

