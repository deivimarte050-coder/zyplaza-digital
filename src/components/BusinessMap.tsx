import React, { useState } from 'react';
import { Store } from '../types';
import { MapPin, Navigation, PhoneCall, Star, Search, ShieldCheck, ChevronRight, Store as StoreIcon } from 'lucide-react';

interface BusinessMapProps {
  stores: Store[];
  currentCity: string;
  onSelectStore: (store: Store) => void;
  onRequestAuth?: (reason?: string, action?: () => void) => void;
}

export const BusinessMap: React.FC<BusinessMapProps> = ({
  stores,
  currentCity,
  onSelectStore,
  onRequestAuth,
}) => {
  const [selectedStoreId, setSelectedStoreId] = useState<string>(stores[0]?.id || '');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredStores = stores.filter((st) => {
    if (!st) return false;
    const cat = (st.category || '').toLowerCase();
    const catFilter = (categoryFilter || '').toLowerCase();
    const matchesCategory = categoryFilter === 'all' || cat.includes(catFilter);

    const name = (st.name || '').toLowerCase();
    const city = (st.city || '').toLowerCase();
    const query = (searchQuery || '').toLowerCase();
    const matchesQuery = name.includes(query) || city.includes(query);
    return matchesCategory && matchesQuery;
  });

  const activeStore = stores.find((s) => s.id === selectedStoreId) || filteredStores[0] || stores[0];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 text-white animate-fade-in">
      {/* Title & Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <MapPin className="w-6 h-6 text-[#FF8A3D]" />
            <span>Mapa de Negocios Locales</span>
          </h1>
          <p className="text-xs text-white/60">
            Encuentra tiendas físicas verificadas, talleres y negocios en {currentCity} y zonas cercanas
          </p>
        </div>

        {/* Filter Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre o zona..."
            className="w-full bg-neutral-900 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#FF6A00]"
          />
        </div>
      </div>

      {/* Main Grid: Interactive Map Visual + Store List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Interactive Visual Map Simulator */}
        <div className="lg:col-span-2 bg-neutral-900 border border-white/10 rounded-3xl p-4 sm:p-6 space-y-4 relative overflow-hidden flex flex-col justify-between min-h-[420px] shadow-2xl">
          {/* Simulated Dark Map Canvas Background */}
          <div className="absolute inset-0 bg-[#12161A] opacity-90 pointer-events-none">
            {/* Grid Pattern */}
            <div className="w-full h-full bg-[radial-[#FF6A00]/10_1px,transparent_1px] [background-size:24px_24px]" />
            {/* Simulated Road Lines */}
            <div className="absolute top-1/3 left-0 right-0 h-1.5 bg-white/10 -rotate-6" />
            <div className="absolute top-0 bottom-0 left-1/2 w-1.5 bg-white/10 rotate-12" />
            <div className="absolute top-2/3 left-0 right-0 h-1 bg-[#FF6A00]/20" />
          </div>

          {/* Map Top Badge */}
          <div className="relative z-10 flex items-center justify-between bg-black/60 backdrop-blur-md border border-white/10 p-3 rounded-2xl">
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-[#FF8A3D] animate-pulse" />
              <span className="text-xs font-extrabold text-white">
                {filteredStores.length} Negocios en {currentCity}
              </span>
            </div>
            <span className="text-[10px] text-emerald-400 font-bold px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/30">
              ● En vivo
            </span>
          </div>

          {/* Simulated Map Pins */}
          <div className="relative z-10 my-12 grid grid-cols-2 sm:grid-cols-3 gap-4 min-h-[220px]">
            {filteredStores.map((st, idx) => {
              const isSelected = st.id === activeStore?.id;
              return (
                <button
                  key={st.id}
                  onClick={() => setSelectedStoreId(st.id)}
                  className={`p-3 rounded-2xl border transition-all text-left flex items-start gap-2.5 cursor-pointer backdrop-blur-md shadow-lg ${
                    isSelected
                      ? 'bg-[#FF6A00] text-black border-white scale-105 font-bold shadow-[#FF6A00]/40 z-20'
                      : 'bg-black/70 text-white border-white/15 hover:border-[#FF6A00]/60 hover:bg-black/90'
                  }`}
                  style={{ transform: `translateY(${idx % 2 === 0 ? '-8px' : '8px'})` }}
                >
                  <img src={st.logo} alt={st.name} className="w-9 h-9 rounded-xl object-cover flex-shrink-0 border border-white/20" />
                  <div className="min-w-0 flex-1">
                    <span className="block text-xs font-black truncate">{st.name}</span>
                    <span className={`block text-[10px] truncate ${isSelected ? 'text-black/80' : 'text-[#FF8A3D]'}`}>
                      📍 {st.city}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Store Quick Preview Bar at Bottom of Map */}
          {activeStore && (
            <div className="relative z-10 bg-black/80 backdrop-blur-md border border-white/15 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 animate-fade-in shadow-xl">
              <div className="flex items-center gap-3">
                <img src={activeStore.logo} alt={activeStore.name} className="w-12 h-12 rounded-2xl object-cover border-2 border-[#FF6A00]" />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-extrabold text-sm text-white">{activeStore.name}</h3>
                    {activeStore.verified && <ShieldCheck className="w-4 h-4 text-[#FF8A3D]" />}
                  </div>
                  <p className="text-xs text-white/60">{activeStore.address}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const action = () => {
                      const text = encodeURIComponent(`¡Hola ${activeStore.name}! Los encontré en el Mapa de Negocios de Zyplaza.`);
                      window.open(`https://wa.me/18095550199?text=${text}`, '_blank');
                    };
                    if (onRequestAuth) onRequestAuth('para contactar al negocio por WhatsApp', action);
                    else action();
                  }}
                  className="px-3.5 py-2 rounded-xl bg-[#25D366] text-black font-extrabold text-xs hover:bg-[#20bd5a] transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <PhoneCall className="w-3.5 h-3.5 fill-black" />
                  <span>WhatsApp</span>
                </button>

                <button
                  onClick={() => onSelectStore(activeStore)}
                  className="px-3.5 py-2 rounded-xl bg-[#FF6A00] text-black font-extrabold text-xs hover:bg-[#ff7d1c] transition-all flex items-center gap-1 cursor-pointer shadow-md"
                >
                  <span>Ver Tienda</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Stores List with ratings */}
        <div className="bg-neutral-900 border border-white/10 rounded-3xl p-4 space-y-3 flex flex-col max-h-[580px]">
          <h2 className="text-sm font-extrabold text-white flex items-center gap-2 pb-2 border-b border-white/10">
            <StoreIcon className="w-4 h-4 text-[#FF8A3D]" />
            <span>Lista de Tiendas ({filteredStores.length})</span>
          </h2>

          <div className="overflow-y-auto space-y-2.5 flex-1 pr-1">
            {filteredStores.map((st) => (
              <div
                key={st.id}
                onClick={() => {
                  setSelectedStoreId(st.id);
                  onSelectStore(st);
                }}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                  st.id === activeStore?.id
                    ? 'bg-white/10 border-[#FF6A00]'
                    : 'bg-black/40 border-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <img src={st.logo} alt={st.name} className="w-10 h-10 rounded-xl object-cover border border-[#FF6A00]" />
                    <div>
                      <h4 className="font-bold text-xs text-white">{st.name}</h4>
                      <p className="text-[10px] text-[#FF8A3D] font-semibold">{st.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-[#FF8A3D] flex items-center gap-0.5 justify-end">
                      <Star className="w-3 h-3 fill-[#FF8A3D]" />
                      {st.rating || '0.0'}
                    </span>
                    <span className="text-[10px] text-white/40 block">({st.reviewsCount} opiniones)</span>
                  </div>
                </div>

                <p className="text-[11px] text-white/60 line-clamp-1">📍 {st.address}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
