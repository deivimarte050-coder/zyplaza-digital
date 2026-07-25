import React, { useState } from 'react';
import { Store, MapPin, Clock, PhoneCall, Save, Check, ShieldCheck, Image, Sparkles } from 'lucide-react';
import { Store as StoreType, UserProfileData } from '../types';

interface SellerStoreConfigProps {
  currentUser?: UserProfileData | null;
  onOpenStoreModal?: (store: StoreType) => void;
}

export const SellerStoreConfig: React.FC<SellerStoreConfigProps> = ({
  currentUser,
  onOpenStoreModal,
}) => {
  const [storeData, setStoreData] = useState({
    name: 'TechHub RD',
    category: 'Tecnología y Gadgets',
    city: currentUser?.city || 'San Pedro de Macorís',
    address: 'Av. Independencia #42, Centro Ciudad',
    phone: '+1 (809) 555-0199',
    openingHours: 'Lun-Sáb: 8:30 AM - 7:30 PM',
    description: 'Tienda líder en laptops reacondicionadas, smartphones desbloqueados, accesorios de audio y periféricos gamer con garantía local.',
    logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80',
    coverImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80',
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const previewStoreObj: StoreType = {
    id: 'store-1',
    name: storeData.name,
    slug: 'techhub-rd',
    category: storeData.category,
    logo: storeData.logo,
    coverImage: storeData.coverImage,
    description: storeData.description,
    rating: 4.9,
    reviewsCount: 48,
    followersCount: 18400,
    totalListings: 24,
    verified: true,
    city: storeData.city,
    address: storeData.address,
    openingHours: storeData.openingHours,
    responseTime: '~10 minutos',
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 text-white animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Store className="w-6 h-6 text-[#FF8A3D]" />
            <span>Mi Tienda</span>
          </h1>
          <p className="text-xs text-white/60">
            Personaliza la información pública de tu tienda en el directorio local Zyplaza
          </p>
        </div>

        {onOpenStoreModal && (
          <button
            onClick={() => onOpenStoreModal(previewStoreObj)}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition-all border border-white/10"
          >
            <Sparkles className="w-4 h-4 text-[#FF8A3D]" />
            <span>Vista Previa del Perfil</span>
          </button>
        )}
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>¡Información de la tienda actualizada con éxito en Zyplaza!</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-neutral-900 border border-white/10 rounded-3xl p-5 sm:p-6 space-y-6 shadow-2xl">
        {/* Cover Preview & Logo */}
        <div className="relative h-36 sm:h-48 rounded-2xl overflow-hidden bg-black border border-white/10">
          <img src={storeData.coverImage} alt="Cover" className="w-full h-full object-cover opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

          {/* Logo overlay */}
          <div className="absolute bottom-3 left-4 flex items-end gap-3">
            <img src={storeData.logo} alt="Logo" className="w-16 h-16 rounded-2xl border-2 border-[#FF6A00] object-cover bg-black" />
            <div>
              <span className="font-black text-base text-white block">{storeData.name}</span>
              <span className="text-xs text-[#FF8A3D] font-bold">{storeData.category}</span>
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-white/70 font-bold mb-1">Nombre de la Tienda</label>
            <input
              type="text"
              value={storeData.name}
              onChange={(e) => setStoreData({ ...storeData, name: e.target.value })}
              className="w-full bg-black/60 border border-white/15 rounded-xl p-3 text-white focus:outline-none focus:border-[#FF6A00]"
              required
            />
          </div>

          <div>
            <label className="block text-white/70 font-bold mb-1">Categoría Principal</label>
            <input
              type="text"
              value={storeData.category}
              onChange={(e) => setStoreData({ ...storeData, category: e.target.value })}
              className="w-full bg-black/60 border border-white/15 rounded-xl p-3 text-white focus:outline-none focus:border-[#FF6A00]"
              required
            />
          </div>

          <div>
            <label className="block text-white/70 font-bold mb-1">Ciudad / Municipio</label>
            <input
              type="text"
              value={storeData.city}
              onChange={(e) => setStoreData({ ...storeData, city: e.target.value })}
              className="w-full bg-black/60 border border-white/15 rounded-xl p-3 text-white focus:outline-none focus:border-[#FF6A00]"
              required
            />
          </div>

          <div>
            <label className="block text-white/70 font-bold mb-1">Teléfono WhatsApp de Atención</label>
            <input
              type="text"
              value={storeData.phone}
              onChange={(e) => setStoreData({ ...storeData, phone: e.target.value })}
              className="w-full bg-black/60 border border-white/15 rounded-xl p-3 text-white focus:outline-none focus:border-[#FF6A00]"
              required
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-white/70 font-bold mb-1">Dirección Física para Retiro de Pedidos</label>
            <input
              type="text"
              value={storeData.address}
              onChange={(e) => setStoreData({ ...storeData, address: e.target.value })}
              className="w-full bg-black/60 border border-white/15 rounded-xl p-3 text-white focus:outline-none focus:border-[#FF6A00]"
              required
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-white/70 font-bold mb-1">Horario de Atención</label>
            <input
              type="text"
              value={storeData.openingHours}
              onChange={(e) => setStoreData({ ...storeData, openingHours: e.target.value })}
              className="w-full bg-black/60 border border-white/15 rounded-xl p-3 text-white focus:outline-none focus:border-[#FF6A00]"
              required
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-white/70 font-bold mb-1">Descripción Pública de la Tienda</label>
            <textarea
              rows={3}
              value={storeData.description}
              onChange={(e) => setStoreData({ ...storeData, description: e.target.value })}
              className="w-full bg-black/60 border border-white/15 rounded-xl p-3 text-white focus:outline-none focus:border-[#FF6A00]"
              required
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 rounded-2xl bg-[#FF6A00] text-black font-extrabold text-xs sm:text-sm hover:bg-[#ff7d1c] transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-[#FF6A00]/25"
          >
            <Save className="w-4 h-4 text-black" />
            <span>Guardar Cambios de Mi Tienda</span>
          </button>
        </div>
      </form>
    </div>
  );
};
