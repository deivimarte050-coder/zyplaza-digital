import React, { useState } from 'react';
import { Listing } from '../types';
import { Package, Plus, Eye, Edit3, Trash2, CheckCircle, PauseCircle, Search } from 'lucide-react';

interface SellerProductsProps {
  userListings: Listing[];
  onSelectListing: (listing: Listing) => void;
  onOpenCreateListing: () => void;
}

export const SellerProducts: React.FC<SellerProductsProps> = ({
  userListings,
  onSelectListing,
  onOpenCreateListing,
}) => {
  const [search, setSearch] = useState('');

  const filtered = userListings.filter((item) =>
    item && item.title && (item.title || '').toLowerCase().includes((search || '').toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6 text-white animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Package className="w-6 h-6 text-[#FF8A3D]" />
            <span>Mis Productos ({userListings.length})</span>
          </h1>
          <p className="text-xs text-white/60">
            Administra tus artículos publicados, modifica precios y revisa estadísticas de vistas
          </p>
        </div>

        <button
          onClick={onOpenCreateListing}
          className="px-4 py-2.5 rounded-2xl bg-[#FF6A00] text-black font-extrabold text-xs sm:text-sm hover:scale-105 transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-[#FF6A00]/25"
        >
          <Plus className="w-4.5 h-4.5 text-black" />
          <span>Publicar Producto (+)</span>
        </button>
      </div>

      {/* Filter / Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar entre tus productos..."
          className="w-full bg-neutral-900 border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#FF6A00]"
        />
      </div>

      {/* Products Grid */}
      {filtered.length === 0 ? (
        <div className="bg-neutral-900 border border-white/10 rounded-3xl p-12 text-center space-y-3">
          <Package className="w-12 h-12 text-white/20 mx-auto" />
          <h3 className="text-base font-bold text-white">No tienes productos en esta lista</h3>
          <p className="text-xs text-white/50 max-w-sm mx-auto">
            Haz clic en "Publicar Producto (+)" para agregar tus artículos a la tienda y empezar a recibir ventas.
          </p>
          <button
            onClick={onOpenCreateListing}
            className="mt-2 px-5 py-2.5 rounded-xl bg-[#FF6A00] text-black font-extrabold text-xs cursor-pointer hover:bg-[#ff7d1c]"
          >
            Publicar mi primer producto
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-neutral-900 border border-white/10 rounded-3xl overflow-hidden hover:border-[#FF6A00]/40 transition-all flex flex-col justify-between shadow-xl"
            >
              <div>
                <div className="relative aspect-video bg-black overflow-hidden cursor-pointer" onClick={() => onSelectListing(item)}>
                  <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                  <span className="absolute top-2 right-2 px-2.5 py-1 rounded-full bg-emerald-950/90 text-emerald-400 border border-emerald-500/40 text-[10px] font-black flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    <span>Activo</span>
                  </span>
                </div>

                <div className="p-4 space-y-2">
                  <h3 className="font-bold text-sm text-white line-clamp-1">{item.title}</h3>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-black text-[#FF8A3D] text-sm">
                      RD$ {item.price.toLocaleString()}
                    </span>
                    <span className="text-[11px] text-white/50 flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-white/40" />
                      <span>{item.viewsCount} vistas</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="px-4 py-3 bg-black/40 border-t border-white/5 flex items-center justify-between text-xs">
                <button
                  onClick={() => onSelectListing(item)}
                  className="text-white/70 hover:text-white font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-[#FF8A3D]" />
                  <span>Ver</span>
                </button>

                <button
                  onClick={() => alert(`Edición de precio de "${item.title}": Cambios guardados`)}
                  className="text-white/70 hover:text-white font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Editar</span>
                </button>

                <button
                  onClick={() => alert(`El artículo "${item.title}" ha sido pausado temporalmente.`)}
                  className="text-white/70 hover:text-white font-bold flex items-center gap-1 cursor-pointer"
                >
                  <PauseCircle className="w-3.5 h-3.5 text-rose-400" />
                  <span>Pausar</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
