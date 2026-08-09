import React, { useState } from 'react';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  EyeOff,
  Eye,
  Package,
  X,
  AlertTriangle,
} from 'lucide-react';
import { Listing } from '../../types';
import { CreateListingModal, ListingFormInput } from '../CreateListingModal';

interface SellerProductsProps {
  darkMode: boolean;
  products: Listing[];
  onSubmitListing: (input: ListingFormInput, editingId?: string) => Promise<void>;
  onDeleteListing: (listing: Listing) => void;
  onToggleStatus: (listing: Listing) => void;
}

export const SellerProducts: React.FC<SellerProductsProps> = ({
  products,
  onSubmitListing,
  onDeleteListing,
  onToggleStatus,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Listing | null>(null);

  const filtered = products.filter((p) =>
    (p.title || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCount = products.filter((p) => p.status === 'active').length;

  const openCreate = () => {
    setEditingListing(null);
    setShowForm(true);
  };

  const openEdit = (listing: Listing) => {
    setEditingListing(listing);
    setShowForm(true);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4 text-white">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black">Mis Productos</h2>
          <p className="text-xs text-white/50">
            {products.length} publicados · {activeCount} activos
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#FF6A00] text-black text-xs font-extrabold hover:bg-[#ff7b1a] transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Nuevo producto
        </button>
      </div>

      {/* Búsqueda */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar en tus productos..."
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#FF8A3D]"
        />
      </div>

      {/* Lista */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 p-10 text-center space-y-3">
          <Package className="w-10 h-10 mx-auto text-white/20" />
          <p className="text-sm font-bold text-white/70">
            {products.length === 0 ? 'Aún no tienes productos' : 'Sin resultados'}
          </p>
          <p className="text-xs text-white/40">
            {products.length === 0
              ? 'Publica tu primer artículo y empieza a vender.'
              : 'Prueba con otra búsqueda.'}
          </p>
          {products.length === 0 && (
            <button
              onClick={openCreate}
              className="px-4 py-2 rounded-xl bg-[#FF6A00] text-black text-xs font-extrabold hover:bg-[#ff7b1a] transition-all cursor-pointer"
            >
              Publicar mi primer producto
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-2.5">
          {filtered.map((p) => (
            <div
              key={p.id}
              className={`rounded-2xl border border-white/10 bg-white/5 p-3 flex items-center gap-3 ${
                p.status !== 'active' ? 'opacity-60' : ''
              }`}
            >
              <img
                src={p.images[0]}
                alt={p.title}
                className="w-14 h-14 rounded-xl object-cover bg-white/5 flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-bold truncate">{p.title}</p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                  <span className="text-xs font-extrabold text-[#FF8A3D]">
                    RD$ {p.price.toLocaleString()}
                  </span>
                  {p.stock !== undefined && (
                    <span className={`text-[10px] font-semibold ${p.stock <= 0 ? 'text-red-400' : 'text-white/50'}`}>
                      Stock: {p.stock}
                    </span>
                  )}
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    p.status === 'active'
                      ? 'bg-emerald-500/15 text-emerald-400'
                      : 'bg-white/10 text-white/50'
                  }`}>
                    {p.status === 'active' ? 'Activo' : p.status === 'sold' ? 'Vendido' : 'Pausado'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  onClick={() => onToggleStatus(p)}
                  title={p.status === 'active' ? 'Pausar publicación' : 'Reactivar publicación'}
                  className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                >
                  {p.status === 'active' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => openEdit(p)}
                  title="Editar"
                  className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setConfirmDelete(p)}
                  title="Eliminar"
                  className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal crear/editar */}
      {showForm && (
        <CreateListingModal
          onClose={() => {
            setShowForm(false);
            setEditingListing(null);
          }}
          onSubmitListing={onSubmitListing}
          currentCity=""
          editingListing={editingListing}
        />
      )}

      {/* Confirmación de borrado */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#181818] border border-white/10 rounded-2xl p-5 w-full max-w-sm space-y-4">
            <div className="flex items-start justify-between">
              <h3 className="font-extrabold text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                Eliminar producto
              </h3>
              <button onClick={() => setConfirmDelete(null)} className="text-white/50 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-white/60">
              Vas a eliminar <span className="font-bold text-white">"{confirmDelete.title}"</span> de forma
              permanente. Desaparecerá de Zyplaza para todos los usuarios.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  onDeleteListing(confirmDelete);
                  setConfirmDelete(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-xs font-extrabold hover:bg-red-600 transition-all cursor-pointer"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
