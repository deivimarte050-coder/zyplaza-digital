import React, { useEffect, useRef, useState } from 'react';
import { X, Store as StoreIcon, Phone, FileText, Camera, Upload, CheckCircle, Rocket, MapPin, Clock, Save } from 'lucide-react';
import { Store, StoreLocation } from '../types';
import { CITIES } from '../data/mockData';
import { readFileAsDataUrl } from '../services/imageUpload';
import { StoreLocationPicker } from './StoreLocationPicker';

export interface CreateStoreInput {
  name: string;
  category: string;
  description: string;
  province: string;
  city: string;
  address: string;
  phone: string;
  whatsapp: string;
  openingHours: string;
  facebook: string;
  instagram: string;
  twitter: string;
  location?: StoreLocation;
  logoFile: File | null;
  bannerFile: File | null;
}

interface CreateStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitStore: (input: CreateStoreInput) => Promise<void>;
  initialStore?: Store | null;
}

const STORE_CATEGORIES = [
  'Tecnología y Electrónica',
  'Moda y Ropa',
  'Hogar y Muebles',
  'Belleza y Cuidado',
  'Deportes',
  'Vehículos y Repuestos',
  'Alimentos y Bebidas',
  'Salud',
  'Juguetes y Niños',
  'Servicios',
  'General',
];

const EMPTY_INPUT: CreateStoreInput = {
  name: '',
  category: 'General',
  description: '',
  province: '',
  city: 'San Pedro de Macorís',
  address: '',
  phone: '',
  whatsapp: '',
  openingHours: 'Lun-Sáb: 9:00 AM - 6:00 PM',
  facebook: '',
  instagram: '',
  twitter: '',
  logoFile: null,
  bannerFile: null,
};

export const CreateStoreModal: React.FC<CreateStoreModalProps> = ({ isOpen, onClose, onSubmitStore, initialStore }) => {
  const isEditing = Boolean(initialStore);
  const [form, setForm] = useState<CreateStoreInput>(EMPTY_INPUT);
  const [logoPreview, setLogoPreview] = useState('');
  const [bannerPreview, setBannerPreview] = useState('');
  const [errors, setErrors] = useState<{ name?: string; whatsapp?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    if (initialStore) {
      setForm({
        name: initialStore.name || '',
        category: initialStore.category || 'General',
        description: initialStore.description || '',
        province: initialStore.province || '',
        city: initialStore.city || 'San Pedro de Macorís',
        address: initialStore.address || '',
        phone: initialStore.phone || '',
        whatsapp: initialStore.whatsapp || '',
        openingHours: initialStore.openingHours || '',
        facebook: initialStore.socials?.facebook || '',
        instagram: initialStore.socials?.instagram || '',
        twitter: initialStore.socials?.twitter || '',
        location: initialStore.location || undefined,
        logoFile: null,
        bannerFile: null,
      });
      setLogoPreview(initialStore.logo || '');
      setBannerPreview(initialStore.coverImage || '');
    } else {
      setForm(EMPTY_INPUT);
      setLogoPreview('');
      setBannerPreview('');
    }
    setErrors({});
    setSubmitError('');
    setSuccess(false);
  }, [isOpen, initialStore]);

  if (!isOpen) return null;

  const set = (patch: Partial<CreateStoreInput>) => setForm((prev) => ({ ...prev, ...patch }));

  const pickImage = async (
    e: React.ChangeEvent<HTMLInputElement>,
    kind: 'logo' | 'banner'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/') || file.size > 8 * 1024 * 1024) {
      setSubmitError('Selecciona una imagen válida de máximo 8 MB.');
      e.target.value = '';
      return;
    }
    setSubmitError('');
    const preview = await readFileAsDataUrl(file);
    if (kind === 'logo') {
      set({ logoFile: file });
      setLogoPreview(preview);
    } else {
      set({ bannerFile: file });
      setBannerPreview(preview);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nextErrors: { name?: string; whatsapp?: string } = {};
    const cleanName = form.name.trim();
    const cleanWhatsapp = form.whatsapp.replace(/\D/g, '');

    if (cleanName.length < 3) nextErrors.name = 'Escribe el nombre de tu tienda.';
    if (cleanWhatsapp.length < 10) nextErrors.whatsapp = 'Ingresa un número de WhatsApp válido.';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    setSubmitError('');

    try {
      await onSubmitStore({ ...form, name: cleanName, whatsapp: cleanWhatsapp });
      setSuccess(true);
      window.setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1400);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'No se pudo guardar la tienda. Inténtalo de nuevo.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-md bg-surface border border-line rounded-3xl overflow-hidden shadow-2xl my-auto text-text-1 p-5 sm:p-6 space-y-5 font-body">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 border border-line text-text-2 hover:text-text-1 hover:bg-white/10 transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {success ? (
          <div className="py-10 flex flex-col items-center justify-center text-center gap-3 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-teal/15 border border-teal/30 flex items-center justify-center text-teal">
              <CheckCircle className="w-9 h-9" />
            </div>
            <h2 className="text-lg font-display font-semibold text-text-1">
              {isEditing ? '¡Tienda actualizada!' : '¡Tu tienda ha sido creada!'}
            </h2>
            <p className="text-xs text-text-2 max-w-xs">
              {isEditing
                ? 'Los cambios ya se ven en todo Zyplaza.'
                : 'Ya puedes empezar a publicar productos y vender en Zyplaza.'}
            </p>
          </div>
        ) : (
          <>
            <div className="text-center space-y-1.5 pt-2">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-orange to-orange-soft text-[#0A0400]">
                <Rocket className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-display font-semibold text-text-1">{isEditing ? 'Editar mi tienda' : 'Crear mi tienda'}</h2>
              <p className="text-xs text-text-2 max-w-xs mx-auto leading-relaxed">
                {isEditing
                  ? 'Actualiza la información que ven tus clientes.'
                  : 'Menos de un minuto y ya puedes empezar a vender en Zyplaza.'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
              {/* Banner */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-text-2">Banner de la tienda (opcional)</label>
                <div
                  onClick={() => bannerInputRef.current?.click()}
                  className="relative h-24 rounded-2xl bg-white/5 border-2 border-dashed border-line-strong overflow-hidden cursor-pointer hover:border-orange-soft transition-all flex items-center justify-center"
                >
                  {bannerPreview ? (
                    <img src={bannerPreview} alt="Banner" className="w-full h-full object-cover" />
                  ) : (
                    <span className="flex items-center gap-2 text-xs text-text-3">
                      <Camera className="w-4 h-4" /> Subir banner
                    </span>
                  )}
                </div>
                <input
                  ref={bannerInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => pickImage(e, 'banner')}
                  className="hidden"
                />
              </div>

              {/* Logo */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-text-2">Logo de la tienda (opcional)</label>
                <div className="flex items-center gap-3">
                  <div
                    onClick={() => logoInputRef.current?.click()}
                    className="w-14 h-14 rounded-full bg-white/5 border-2 border-dashed border-line-strong flex items-center justify-center cursor-pointer hover:border-orange-soft transition-all overflow-hidden flex-shrink-0"
                  >
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-5 h-5 text-text-3" />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    className="flex-1 py-2 px-3 bg-white/5 border border-line rounded-xl text-xs text-text-2 hover:bg-white/10 hover:text-text-1 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Subir logo</span>
                  </button>
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => pickImage(e, 'logo')}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Nombre */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-text-2">Nombre de la tienda *</label>
                <div className="relative">
                  <StoreIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-3" />
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => set({ name: e.target.value })}
                    placeholder="Ej: TechHub RD"
                    className="w-full bg-white/5 border border-line rounded-2xl pl-9 pr-3 py-2.5 text-xs text-text-1 placeholder-text-3 focus:outline-none focus:border-orange-soft"
                  />
                </div>
                {errors.name && <p className="text-[11px] text-red-400 font-semibold">{errors.name}</p>}
              </div>

              {/* Categoría */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-text-2">Categoría</label>
                <select
                  value={form.category}
                  onChange={(e) => set({ category: e.target.value })}
                  className="w-full bg-surface border border-line rounded-2xl px-3 py-2.5 text-xs text-text-1 focus:outline-none focus:border-orange-soft"
                >
                  {STORE_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Descripción */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-text-2">Descripción (opcional)</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 w-4 h-4 text-text-3" />
                  <textarea
                    rows={2}
                    value={form.description}
                    onChange={(e) => set({ description: e.target.value })}
                    placeholder="Cuéntale a tus clientes qué vendes..."
                    className="w-full bg-white/5 border border-line rounded-2xl pl-9 pr-3 py-2.5 text-xs text-text-1 placeholder-text-3 focus:outline-none focus:border-orange-soft resize-none"
                  />
                </div>
              </div>

              {/* Ubicación */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-text-2">Provincia</label>
                  <input
                    type="text"
                    value={form.province}
                    onChange={(e) => set({ province: e.target.value })}
                    placeholder="Ej: San Pedro de Macorís"
                    className="w-full bg-white/5 border border-line rounded-2xl px-3 py-2.5 text-xs text-text-1 placeholder-text-3 focus:outline-none focus:border-orange-soft"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-text-2">Ciudad</label>
                  <select
                    value={form.city}
                    onChange={(e) => set({ city: e.target.value })}
                    className="w-full bg-surface border border-line rounded-2xl px-3 py-2.5 text-xs text-text-1 focus:outline-none focus:border-orange-soft"
                  >
                    {CITIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-text-2">Dirección (opcional)</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-3" />
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) => set({ address: e.target.value })}
                    placeholder="Ej: Av. Independencia #42, Centro"
                    className="w-full bg-white/5 border border-line rounded-2xl pl-9 pr-3 py-2.5 text-xs text-text-1 placeholder-text-3 focus:outline-none focus:border-orange-soft"
                  />
                </div>
              </div>

              {/* Ubicación GPS */}
              <div className="p-3.5 rounded-2xl border border-line bg-white/5 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-orange-soft" />
                    <span className="text-xs font-bold text-text-1">Ubicación de la tienda</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowLocationPicker(true)}
                    className="px-3 py-1.5 rounded-xl bg-orange/15 border border-orange/30 text-orange-soft text-[10px] font-bold hover:bg-orange/25 transition-all"
                  >
                    {form.location ? 'Cambiar ubicación' : 'Configurar ubicación'}
                  </button>
                </div>
                {form.location ? (
                  <p className="text-[10px] text-text-2">
                    Lat: {form.location.lat.toFixed(6)}, Lng: {form.location.lng.toFixed(6)}
                    {form.location.address ? ` — ${form.location.address}` : ''}
                  </p>
                ) : (
                  <p className="text-[10px] text-text-3">
                    ⚠️ Configura la ubicación de tu tienda para que tus clientes puedan encontrarte.
                  </p>
                )}
              </div>

              {/* Contacto */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-text-2">WhatsApp *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-3" />
                    <input
                      type="tel"
                      value={form.whatsapp}
                      onChange={(e) => set({ whatsapp: e.target.value })}
                      placeholder="809-555-0199"
                      className="w-full bg-white/5 border border-line rounded-2xl pl-9 pr-3 py-2.5 text-xs text-text-1 placeholder-text-3 focus:outline-none focus:border-orange-soft"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-text-2">Teléfono (opcional)</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-3" />
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => set({ phone: e.target.value })}
                      placeholder="809-555-0199"
                      className="w-full bg-white/5 border border-line rounded-2xl pl-9 pr-3 py-2.5 text-xs text-text-1 placeholder-text-3 focus:outline-none focus:border-orange-soft"
                    />
                  </div>
                </div>
              </div>
              {errors.whatsapp && <p className="text-[11px] text-red-400 font-semibold">{errors.whatsapp}</p>}

              {/* Horario */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-text-2">Horario</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-3" />
                  <input
                    type="text"
                    value={form.openingHours}
                    onChange={(e) => set({ openingHours: e.target.value })}
                    placeholder="Ej: Lun-Sáb: 9:00 AM - 6:00 PM"
                    className="w-full bg-white/5 border border-line rounded-2xl pl-9 pr-3 py-2.5 text-xs text-text-1 placeholder-text-3 focus:outline-none focus:border-orange-soft"
                  />
                </div>
              </div>

              {/* Redes sociales */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-text-2">Redes sociales (opcional)</label>
                <div className="space-y-2">
                  <input
                    type="url"
                    value={form.facebook}
                    onChange={(e) => set({ facebook: e.target.value })}
                    placeholder="Facebook: https://facebook.com/tutienda"
                    className="w-full bg-white/5 border border-line rounded-2xl px-3 py-2.5 text-xs text-text-1 placeholder-text-3 focus:outline-none focus:border-orange-soft"
                  />
                  <input
                    type="url"
                    value={form.instagram}
                    onChange={(e) => set({ instagram: e.target.value })}
                    placeholder="Instagram: https://instagram.com/tutienda"
                    className="w-full bg-white/5 border border-line rounded-2xl px-3 py-2.5 text-xs text-text-1 placeholder-text-3 focus:outline-none focus:border-orange-soft"
                  />
                  <input
                    type="url"
                    value={form.twitter}
                    onChange={(e) => set({ twitter: e.target.value })}
                    placeholder="X / Twitter: https://x.com/tutienda"
                    className="w-full bg-white/5 border border-line rounded-2xl px-3 py-2.5 text-xs text-text-1 placeholder-text-3 focus:outline-none focus:border-orange-soft"
                  />
                </div>
              </div>

              {submitError && (
                <div className="p-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-semibold text-center">
                  {submitError}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-orange to-[#e85f00] text-[#0A0400] font-extrabold text-xs sm:text-sm rounded-2xl hover:scale-[1.02] active:scale-95 transition-all cursor-pointer shadow-lg shadow-orange/20 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {submitting ? (
                  <span>Guardando...</span>
                ) : isEditing ? (
                  <>
                    <span>Guardar cambios</span>
                    <Save className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <span>Crear tienda</span>
                    <Rocket className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>

      {showLocationPicker && (
        <StoreLocationPicker
          initial={form.location || null}
          onConfirm={(loc) => {
            set({ location: loc });
            setShowLocationPicker(false);
          }}
          onClose={() => setShowLocationPicker(false)}
        />
      )}
    </div>
  );
};
