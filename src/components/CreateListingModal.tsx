import React, { useState } from 'react';
import { Listing, ItemCondition } from '../types';
import { CITIES } from '../data/mockData';
import { 
  X, 
  Upload, 
  MapPin, 
  DollarSign, 
  Tag, 
  PackageCheck, 
  CheckCircle2
} from 'lucide-react';

interface CreateListingModalProps {
  onClose: () => void;
  onAddListing: (newListing: Listing) => void;
  currentCity: string;
}

export const CreateListingModal: React.FC<CreateListingModalProps> = ({
  onClose,
  onAddListing,
  currentCity,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('tech');
  const [condition, setCondition] = useState<ItemCondition>('Como Nuevo');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [city, setCity] = useState(currentCity || 'San Pedro de Macorís');
  const [sector, setSector] = useState('');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [deliveryOption, setDeliveryOption] = useState<'Punto Neutro / Presencial' | 'Envío Local' | 'A Convenir'>('Punto Neutro / Presencial');
  const [images, setImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80',
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !price) return;

    const parsedPrice = parseFloat(price);
    const parsedOriginal = originalPrice ? parseFloat(originalPrice) : undefined;

    const newListing: Listing = {
      id: `item-${Date.now()}`,
      title,
      price: parsedPrice,
      originalPrice: parsedOriginal,
      category,
      condition,
      city,
      sector: sector || 'Centro',
      distanceKm: 1.2,
      sellerName: 'Tú (Vendedor Local)',
      sellerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
      sellerRating: 5.0,
      sellerSalesCount: 1,
      images,
      description: description || 'Artículo publicado por el usuario en Zyplaza Local.',
      tags: tagsInput ? tagsInput.split(',').map(t => t.trim()) : ['VentaLocal'],
      viewsCount: 1,
      likesCount: 0,
      createdAt: 'Justo ahora',
      deliveryOption,
      status: 'active',
    };

    onAddListing(newListing);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#121212] border border-white/10 rounded-3xl overflow-hidden shadow-2xl my-auto text-white max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-[#121212]/90 backdrop-blur-md">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white flex items-center gap-2">
              <PackageCheck className="w-5 h-5 text-[#FF8A3D]" />
              Publicar Nuevo Artículo
            </h2>
            <p className="text-xs text-white/50">Vende rápido a compradores de tu ciudad</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Title input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-white/80">Título del Artículo *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Laptop Lenovo Core i5 16GB RAM o Tenis Nike Talla 41"
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-[#FF8A3D]"
            />
          </div>

          {/* Category & Condition */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white/80">Categoría</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-[#FF8A3D]"
              >
                <option value="tech" className="bg-neutral-900">Tecnología y Gadgets</option>
                <option value="fashion" className="bg-neutral-900">Moda y Ropa</option>
                <option value="home" className="bg-neutral-900">Hogar y Muebles</option>
                <option value="vehicles" className="bg-neutral-900">Vehículos</option>
                <option value="sports" className="bg-neutral-900">Deportes</option>
                <option value="beauty" className="bg-neutral-900">Belleza</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white/80">Estado del Producto</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as ItemCondition)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-[#FF8A3D]"
              >
                <option value="Nuevo" className="bg-neutral-900">Nuevo (En caja)</option>
                <option value="Como Nuevo" className="bg-neutral-900">Como Nuevo (Poco uso)</option>
                <option value="Buen Estado" className="bg-neutral-900">Buen Estado</option>
                <option value="Usado" className="bg-neutral-900">Usado</option>
                <option value="Reacondicionado" className="bg-neutral-900">Reacondicionado</option>
              </select>
            </div>
          </div>

          {/* Price inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white/80">Precio de Venta (RD$) *</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="2500"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-[#FF8A3D]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white/80">Precio Original / Referencia (Opcional)</label>
              <input
                type="number"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                placeholder="4000"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-[#FF8A3D]"
              />
            </div>
          </div>

          {/* City & Sector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white/80">Ciudad</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-[#FF8A3D]"
              >
                {CITIES.map(c => (
                  <option key={c} value={c} className="bg-neutral-900">{c}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white/80">Sector / Barrio</label>
              <input
                type="text"
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                placeholder="Ej: Miramar, Centro, Los Jardines"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-[#FF8A3D]"
              />
            </div>
          </div>

          {/* Delivery option */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-white/80">Modalidad de Entrega</label>
            <div className="grid grid-cols-3 gap-2">
              {(['Punto Neutro / Presencial', 'Envío Local', 'A Convenir'] as const).map(opt => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setDeliveryOption(opt)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border text-center transition-all cursor-pointer ${
                    deliveryOption === opt
                      ? 'bg-[#FF6A00] text-black border-[#FF6A00]'
                      : 'bg-white/5 text-white/70 border-white/10 hover:border-white/20'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Description textarea */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-white/80">Descripción Detallada</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Describe los detalles, tiempo de uso, motivo de venta e información importante..."
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs sm:text-sm text-white focus:outline-none focus:border-[#FF8A3D]"
            />
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#FF6A00] to-[#e85f00] text-black font-extrabold text-sm hover:scale-105 transition-all shadow-lg shadow-[#FF6A00]/25 cursor-pointer"
            >
              Publicar Artículo Ahora
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
