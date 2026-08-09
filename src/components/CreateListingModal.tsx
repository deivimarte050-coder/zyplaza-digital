import React, { useRef, useState } from 'react';
import { Listing, ItemCondition } from '../types';
import { CITIES } from '../data/mockData';
import { readFileAsDataUrl } from '../services/imageUpload';
import {
  X,
  Upload,
  PackageCheck,
  Camera,
  Trash2
} from 'lucide-react';

export interface ListingFormInput {
  title: string;
  category: string;
  condition: ItemCondition;
  price: number;
  originalPrice?: number;
  city: string;
  sector: string;
  description: string;
  tags: string[];
  deliveryOption: Listing['deliveryOption'];
  stock: number;
  existingImages: string[];
  imageFiles: File[];
}

interface CreateListingModalProps {
  onClose: () => void;
  onSubmitListing: (input: ListingFormInput, editingId?: string) => Promise<void>;
  currentCity: string;
  editingListing?: Listing | null;
}

const MAX_IMAGES = 5;

export const CreateListingModal: React.FC<CreateListingModalProps> = ({
  onClose,
  onSubmitListing,
  currentCity,
  editingListing,
}) => {
  const isEditing = Boolean(editingListing);
  const [title, setTitle] = useState(editingListing?.title ?? '');
  const [category, setCategory] = useState(editingListing?.category ?? 'tech');
  const [condition, setCondition] = useState<ItemCondition>(editingListing?.condition ?? 'Nuevo');
  const [price, setPrice] = useState(editingListing ? String(editingListing.price) : '');
  const [originalPrice, setOriginalPrice] = useState(
    editingListing?.originalPrice ? String(editingListing.originalPrice) : ''
  );
  const [city, setCity] = useState(editingListing?.city ?? currentCity ?? 'San Pedro de Macorís');
  const [sector, setSector] = useState(editingListing?.sector ?? '');
  const [description, setDescription] = useState(editingListing?.description ?? '');
  const [tagsInput, setTagsInput] = useState(editingListing?.tags?.join(', ') ?? '');
  const [stock, setStock] = useState(editingListing?.stock !== undefined ? String(editingListing.stock) : '1');
  const [deliveryOption, setDeliveryOption] = useState<Listing['deliveryOption']>(
    editingListing?.deliveryOption ?? 'Punto Neutro / Presencial'
  );
  const [existingImages, setExistingImages] = useState<string[]>(editingListing?.images ?? []);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalImages = existingImages.length + imageFiles.length;

  const handlePickImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []) as File[];
    e.target.value = '';
    setErrorMsg('');

    for (const file of files) {
      if (totalImages + imageFiles.length >= MAX_IMAGES && imageFiles.length >= MAX_IMAGES - existingImages.length) break;
      if (!file.type.startsWith('image/')) {
        setErrorMsg('Solo se permiten imágenes (JPG, PNG, WEBP).');
        continue;
      }
      if (file.size > 8 * 1024 * 1024) {
        setErrorMsg('Cada imagen debe pesar menos de 8 MB.');
        continue;
      }
      if (existingImages.length + imageFiles.length >= MAX_IMAGES) break;
      try {
        const preview = await readFileAsDataUrl(file);
        setImageFiles((prev) => [...prev, file]);
        setImagePreviews((prev) => [...prev, preview]);
      } catch {
        setErrorMsg('No se pudo leer una de las imágenes.');
      }
    }
  };

  const removeNewImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const parsedPrice = parseFloat(price);
    const parsedOriginal = originalPrice ? parseFloat(originalPrice) : undefined;
    const parsedStock = Math.max(0, parseInt(stock || '0', 10) || 0);

    if (title.trim().length < 3) {
      setErrorMsg('Escribe un título para tu artículo.');
      return;
    }
    if (!parsedPrice || parsedPrice <= 0) {
      setErrorMsg('Ingresa un precio de venta válido.');
      return;
    }
    if (existingImages.length + imageFiles.length === 0) {
      setErrorMsg('Agrega al menos una foto del artículo.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmitListing(
        {
          title: title.trim(),
          category,
          condition,
          price: parsedPrice,
          originalPrice: parsedOriginal,
          city,
          sector: sector.trim(),
          description: description.trim(),
          tags: tagsInput ? tagsInput.split(',').map((t) => t.trim()).filter(Boolean) : [],
          deliveryOption,
          stock: parsedStock,
          existingImages,
          imageFiles,
        },
        editingListing?.id
      );
      onClose();
    } catch (error) {
      setErrorMsg(
        error instanceof Error ? error.message : 'No se pudo publicar el artículo. Inténtalo de nuevo.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-2xl bg-surface border border-line rounded-3xl overflow-hidden shadow-2xl my-auto text-text-1 max-h-[90vh] flex flex-col font-body">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-line flex items-center justify-between bg-surface/90 backdrop-blur-md">
          <div>
            <h2 className="text-lg sm:text-xl font-display font-semibold text-text-1 flex items-center gap-2">
              <PackageCheck className="w-5 h-5 text-orange-soft" />
              {isEditing ? 'Editar Artículo' : 'Publicar Nuevo Artículo'}
            </h2>
            <p className="text-xs text-text-2">Vende rápido a compradores de tu ciudad</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-text-1 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-semibold text-center">
              {errorMsg}
            </div>
          )}

          {/* Images picker */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-2">Fotos del Artículo * (máx {MAX_IMAGES})</label>
            <div className="flex flex-wrap gap-2">
              {existingImages.map((src, idx) => (
                <div key={`existing-${idx}`} className="relative w-20 h-20 rounded-xl overflow-hidden border border-line">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(idx)}
                    className="absolute top-1 right-1 p-1 rounded-full bg-void/70 text-text-1 hover:text-red-400"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {imagePreviews.map((src, idx) => (
                <div key={`new-${idx}`} className="relative w-20 h-20 rounded-xl overflow-hidden border border-orange/40">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeNewImage(idx)}
                    className="absolute top-1 right-1 p-1 rounded-full bg-void/70 text-text-1 hover:text-red-400"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {totalImages < MAX_IMAGES && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-20 h-20 rounded-xl border-2 border-dashed border-line-strong hover:border-orange-soft flex flex-col items-center justify-center gap-1 text-text-3 hover:text-orange-soft transition-all cursor-pointer"
                >
                  <Camera className="w-5 h-5" />
                  <span className="text-[9px] font-bold">Agregar</span>
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handlePickImages}
              className="hidden"
            />
            <p className="text-[10px] text-text-3">JPG, PNG o WEBP. Se comprimen automáticamente para cargar rápido.</p>
          </div>

          {/* Title input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-2">Título del Artículo *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Laptop Lenovo Core i5 16GB RAM o Tenis Nike Talla 41"
              required
              className="w-full bg-white/5 border border-line rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-text-1 focus:outline-none focus:border-orange-soft"
            />
          </div>

          {/* Category & Condition */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-2">Categoría</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-white/5 border border-line rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-text-1 focus:outline-none focus:border-orange-soft"
              >
                <option value="tech" className="bg-surface-2">Tecnología y Gadgets</option>
                <option value="fashion" className="bg-surface-2">Moda y Ropa</option>
                <option value="home" className="bg-surface-2">Hogar y Muebles</option>
                <option value="vehicles" className="bg-surface-2">Vehículos</option>
                <option value="sports" className="bg-surface-2">Deportes</option>
                <option value="beauty" className="bg-surface-2">Belleza</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-2">Estado del Producto</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as ItemCondition)}
                className="w-full bg-white/5 border border-line rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-text-1 focus:outline-none focus:border-orange-soft"
              >
                <option value="Nuevo" className="bg-surface-2">Nuevo (En caja)</option>
                <option value="Como Nuevo" className="bg-surface-2">Como Nuevo (Poco uso)</option>
                <option value="Buen Estado" className="bg-surface-2">Buen Estado</option>
                <option value="Usado" className="bg-surface-2">Usado</option>
                <option value="Reacondicionado" className="bg-surface-2">Reacondicionado</option>
              </select>
            </div>
          </div>

          {/* Price inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-2">Precio de Venta (RD$) *</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="2500"
                required
                className="w-full bg-white/5 border border-line rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-text-1 focus:outline-none focus:border-orange-soft"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-2">Precio Original (Opcional)</label>
              <input
                type="number"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                placeholder="4000"
                className="w-full bg-white/5 border border-line rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-text-1 focus:outline-none focus:border-orange-soft"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-2">Stock disponible</label>
              <input
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="1"
                className="w-full bg-white/5 border border-line rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-text-1 focus:outline-none focus:border-orange-soft"
              />
            </div>
          </div>

          {/* City & Sector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-2">Ciudad</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-white/5 border border-line rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-text-1 focus:outline-none focus:border-orange-soft"
              >
                {CITIES.map(c => (
                  <option key={c} value={c} className="bg-surface-2">{c}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-2">Sector / Barrio</label>
              <input
                type="text"
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                placeholder="Ej: Miramar, Centro, Los Jardines"
                className="w-full bg-white/5 border border-line rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-text-1 focus:outline-none focus:border-orange-soft"
              />
            </div>
          </div>

          {/* Delivery option */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-2">Modalidad de Entrega</label>
            <div className="grid grid-cols-3 gap-2">
              {(['Punto Neutro / Presencial', 'Envío Local', 'A Convenir'] as const).map(opt => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setDeliveryOption(opt)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border text-center transition-all cursor-pointer ${
                    deliveryOption === opt
                      ? 'bg-orange text-[#0A0400] border-orange'
                      : 'bg-white/5 text-text-2 border-line hover:border-line-strong'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Description textarea */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-2">Descripción Detallada</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Describe los detalles, tiempo de uso, motivo de venta e información importante..."
              className="w-full bg-white/5 border border-line rounded-xl p-3 text-xs sm:text-sm text-text-1 focus:outline-none focus:border-orange-soft"
            />
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-2">Palabras clave (separadas por coma)</label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Ej: iphone, apple, smartphone, 5g"
              className="w-full bg-white/5 border border-line rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-text-1 focus:outline-none focus:border-orange-soft"
            />
            <p className="text-[10px] text-text-3">Ayudan a que tus compradores te encuentren en el buscador.</p>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-full bg-gradient-to-r from-orange to-[#e85f00] text-[#0A0400] font-extrabold text-sm hover:scale-105 transition-all shadow-lg shadow-orange/25 cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <span>{isEditing ? 'Guardando cambios...' : 'Publicando...'}</span>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>{isEditing ? 'Guardar Cambios' : 'Publicar Artículo Ahora'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
