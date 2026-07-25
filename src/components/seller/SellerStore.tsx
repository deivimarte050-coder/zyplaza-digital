import React, { useState, useRef } from 'react';
import { 
  Store, 
  Camera, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Save, 
  X,
  Upload,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Check,
  AlertCircle
} from 'lucide-react';

interface SellerStoreProps {
  darkMode: boolean;
}

export const SellerStore: React.FC<SellerStoreProps> = ({ darkMode }) => {
  const [storeData, setStoreData] = useState({
    name: 'TechHub Store',
    description: 'Tienda especializada en tecnología y electrónica con los mejores precios del mercado.',
    logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=300&q=80',
    banner: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1200&q=80',
    category: 'Electrónica',
    address: 'Calle Duarte #123, San Pedro de Macorís',
    city: 'San Pedro de Macorís',
    whatsapp: '+1 (809) 555-0123',
    email: 'contact@techhub.do',
    openingHours: 'Lun-Vie: 9:00 AM - 7:00 PM\nSáb: 10:00 AM - 6:00 PM\nDom: Cerrado',
    returnPolicy: 'Devoluciones aceptadas dentro de 7 días con factura original.',
    warranty: 'Garantía de 1 año en todos los productos electrónicos.',
    deliveryMethods: ['Envío Local', 'Punto Neutro', 'A Convenir'],
    socialMedia: {
      facebook: 'https://facebook.com/techhub',
      instagram: 'https://instagram.com/techhub',
      twitter: '',
      linkedin: ''
    }
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setStoreData({ ...storeData, logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setStoreData({ ...storeData, banner: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 1500);
  };

  const toggleDeliveryMethod = (method: string) => {
    setStoreData({
      ...storeData,
      deliveryMethods: storeData.deliveryMethods.includes(method)
        ? storeData.deliveryMethods.filter(m => m !== method)
        : [...storeData.deliveryMethods, method]
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Store className="w-5 h-5 text-[#FF6A00]" />
          <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Mi Tienda</h2>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`px-4 py-2 rounded-xl text-xs font-medium flex items-center gap-2 transition-all ${
            saving
              ? 'bg-gray-500 text-white cursor-not-allowed'
              : 'bg-[#FF6A00] text-black hover:bg-[#e85f00]'
          }`}
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              <span>Guardando...</span>
            </>
          ) : saved ? (
            <>
              <Check className="w-4 h-4" />
              <span>Guardado</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Guardar Cambios</span>
            </>
          )}
        </button>
      </div>

      {/* Banner */}
      <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
        <label className={`text-xs font-bold ${darkMode ? 'text-white/80' : 'text-gray-700'} mb-3 block`}>
          Banner de Tienda
        </label>
        <div
          onClick={() => bannerInputRef.current?.click()}
          className="relative h-48 rounded-xl overflow-hidden cursor-pointer group"
        >
          <img
            src={storeData.banner}
            alt="Banner"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="flex items-center gap-2 text-white">
              <Camera className="w-5 h-5" />
              <span className="text-xs font-medium">Cambiar Banner</span>
            </div>
          </div>
          <input
            ref={bannerInputRef}
            type="file"
            accept="image/*"
            onChange={handleBannerUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* Logo & Basic Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Logo */}
        <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
          <label className={`text-xs font-bold ${darkMode ? 'text-white/80' : 'text-gray-700'} mb-3 block`}>
            Logo
          </label>
          <div
            onClick={() => logoInputRef.current?.click()}
            className="relative w-32 h-32 mx-auto rounded-xl overflow-hidden cursor-pointer group"
          >
            <img
              src={storeData.logo}
              alt="Logo"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="w-6 h-6 text-white" />
            </div>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
          </div>
          <p className={`text-[10px] text-center mt-2 ${darkMode ? 'text-white/40' : 'text-gray-400'}`}>
            Click para cambiar
          </p>
        </div>

        {/* Basic Info */}
        <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} lg:col-span-2 space-y-4`}>
          <div>
            <label className={`text-xs font-bold ${darkMode ? 'text-white/80' : 'text-gray-700'} mb-2 block`}>
              Nombre de Tienda
            </label>
            <input
              type="text"
              value={storeData.name}
              onChange={(e) => setStoreData({ ...storeData, name: e.target.value })}
              className={`w-full px-4 py-2.5 rounded-xl text-xs ${darkMode ? 'bg-white/5 text-white border-white/10' : 'bg-gray-50 text-gray-900 border-gray-200'} border focus:outline-none focus:border-[#FF6A00]`}
            />
          </div>

          <div>
            <label className={`text-xs font-bold ${darkMode ? 'text-white/80' : 'text-gray-700'} mb-2 block`}>
              Descripción
            </label>
            <textarea
              value={storeData.description}
              onChange={(e) => setStoreData({ ...storeData, description: e.target.value })}
              rows={3}
              className={`w-full px-4 py-2.5 rounded-xl text-xs ${darkMode ? 'bg-white/5 text-white border-white/10' : 'bg-gray-50 text-gray-900 border-gray-200'} border focus:outline-none focus:border-[#FF6A00] resize-none`}
            />
          </div>

          <div>
            <label className={`text-xs font-bold ${darkMode ? 'text-white/80' : 'text-gray-700'} mb-2 block`}>
              Categoría
            </label>
            <select
              value={storeData.category}
              onChange={(e) => setStoreData({ ...storeData, category: e.target.value })}
              className={`w-full px-4 py-2.5 rounded-xl text-xs ${darkMode ? 'bg-white/5 text-white border-white/10' : 'bg-gray-50 text-gray-900 border-gray-200'} border focus:outline-none focus:border-[#FF6A00]`}
            >
              <option>Electrónica</option>
              <option>Ropa y Accesorios</option>
              <option>Hogar y Muebles</option>
              <option>Deportes</option>
              <option>Automotriz</option>
              <option>Salud y Belleza</option>
              <option>Alimentos</option>
              <option>Otros</option>
            </select>
          </div>
        </div>
      </div>

      {/* Contact & Location */}
      <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} space-y-4`}>
        <h3 className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'} flex items-center gap-2`}>
          <MapPin className="w-4 h-4 text-[#FF6A00]" />
          Ubicación y Contacto
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`text-xs font-bold ${darkMode ? 'text-white/80' : 'text-gray-700'} mb-2 block`}>
              Dirección
            </label>
            <input
              type="text"
              value={storeData.address}
              onChange={(e) => setStoreData({ ...storeData, address: e.target.value })}
              className={`w-full px-4 py-2.5 rounded-xl text-xs ${darkMode ? 'bg-white/5 text-white border-white/10' : 'bg-gray-50 text-gray-900 border-gray-200'} border focus:outline-none focus:border-[#FF6A00]`}
            />
          </div>

          <div>
            <label className={`text-xs font-bold ${darkMode ? 'text-white/80' : 'text-gray-700'} mb-2 block`}>
              Ciudad
            </label>
            <select
              value={storeData.city}
              onChange={(e) => setStoreData({ ...storeData, city: e.target.value })}
              className={`w-full px-4 py-2.5 rounded-xl text-xs ${darkMode ? 'bg-white/5 text-white border-white/10' : 'bg-gray-50 text-gray-900 border-gray-200'} border focus:outline-none focus:border-[#FF6A00]`}
            >
              <option>San Pedro de Macorís</option>
              <option>Santo Domingo</option>
              <option>Santiago</option>
              <option>La Romana</option>
              <option>Punta Cana</option>
            </select>
          </div>

          <div>
            <label className={`text-xs font-bold ${darkMode ? 'text-white/80' : 'text-gray-700'} mb-2 block`}>
              WhatsApp
            </label>
            <div className="relative">
              <Phone className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${darkMode ? 'text-white/40' : 'text-gray-400'}`} />
              <input
                type="tel"
                value={storeData.whatsapp}
                onChange={(e) => setStoreData({ ...storeData, whatsapp: e.target.value })}
                className={`w-full pl-9 pr-4 py-2.5 rounded-xl text-xs ${darkMode ? 'bg-white/5 text-white border-white/10' : 'bg-gray-50 text-gray-900 border-gray-200'} border focus:outline-none focus:border-[#FF6A00]`}
              />
            </div>
          </div>

          <div>
            <label className={`text-xs font-bold ${darkMode ? 'text-white/80' : 'text-gray-700'} mb-2 block`}>
              Email
            </label>
            <div className="relative">
              <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${darkMode ? 'text-white/40' : 'text-gray-400'}`} />
              <input
                type="email"
                value={storeData.email}
                onChange={(e) => setStoreData({ ...storeData, email: e.target.value })}
                className={`w-full pl-9 pr-4 py-2.5 rounded-xl text-xs ${darkMode ? 'bg-white/5 text-white border-white/10' : 'bg-gray-50 text-gray-900 border-gray-200'} border focus:outline-none focus:border-[#FF6A00]`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Hours & Policies */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} space-y-4`}>
          <h3 className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'} flex items-center gap-2`}>
            <Clock className="w-4 h-4 text-[#FF6A00]" />
            Horario
          </h3>
          <textarea
            value={storeData.openingHours}
            onChange={(e) => setStoreData({ ...storeData, openingHours: e.target.value })}
            rows={4}
            className={`w-full px-4 py-2.5 rounded-xl text-xs ${darkMode ? 'bg-white/5 text-white border-white/10' : 'bg-gray-50 text-gray-900 border-gray-200'} border focus:outline-none focus:border-[#FF6A00] resize-none`}
            placeholder="Lun-Vie: 9:00 AM - 7:00 PM\nSáb: 10:00 AM - 6:00 PM\nDom: Cerrado"
          />
        </div>

        <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} space-y-4`}>
          <h3 className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'} flex items-center gap-2`}>
            <AlertCircle className="w-4 h-4 text-[#FF6A00]" />
            Políticas
          </h3>
          <div className="space-y-3">
            <div>
              <label className={`text-xs font-bold ${darkMode ? 'text-white/80' : 'text-gray-700'} mb-2 block`}>
                Política de Devoluciones
              </label>
              <textarea
                value={storeData.returnPolicy}
                onChange={(e) => setStoreData({ ...storeData, returnPolicy: e.target.value })}
                rows={2}
                className={`w-full px-4 py-2.5 rounded-xl text-xs ${darkMode ? 'bg-white/5 text-white border-white/10' : 'bg-gray-50 text-gray-900 border-gray-200'} border focus:outline-none focus:border-[#FF6A00] resize-none`}
              />
            </div>
            <div>
              <label className={`text-xs font-bold ${darkMode ? 'text-white/80' : 'text-gray-700'} mb-2 block`}>
                Garantía
              </label>
              <textarea
                value={storeData.warranty}
                onChange={(e) => setStoreData({ ...storeData, warranty: e.target.value })}
                rows={2}
                className={`w-full px-4 py-2.5 rounded-xl text-xs ${darkMode ? 'bg-white/5 text-white border-white/10' : 'bg-gray-50 text-gray-900 border-gray-200'} border focus:outline-none focus:border-[#FF6A00] resize-none`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Delivery Methods */}
      <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
        <h3 className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
          Métodos de Entrega
        </h3>
        <div className="flex flex-wrap gap-3">
          {['Envío Local', 'Punto Neutro', 'A Convenir', 'Recoger en Tienda'].map((method) => (
            <button
              key={method}
              onClick={() => toggleDeliveryMethod(method)}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                storeData.deliveryMethods.includes(method)
                  ? 'bg-[#FF6A00] text-black'
                  : darkMode
                  ? 'bg-white/5 text-white/70 hover:bg-white/10'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {storeData.deliveryMethods.includes(method) && <Check className="w-3 h-3 inline mr-1" />}
              {method}
            </button>
          ))}
        </div>
      </div>

      {/* Social Media */}
      <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
        <h3 className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
          Redes Sociales
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`text-xs font-bold ${darkMode ? 'text-white/80' : 'text-gray-700'} mb-2 flex items-center gap-2`}>
              <Facebook className="w-4 h-4 text-blue-500" />
              Facebook
            </label>
            <input
              type="url"
              value={storeData.socialMedia.facebook}
              onChange={(e) => setStoreData({ 
                ...storeData, 
                socialMedia: { ...storeData.socialMedia, facebook: e.target.value } 
              })}
              placeholder="https://facebook.com/tutienda"
              className={`w-full px-4 py-2.5 rounded-xl text-xs ${darkMode ? 'bg-white/5 text-white border-white/10' : 'bg-gray-50 text-gray-900 border-gray-200'} border focus:outline-none focus:border-[#FF6A00]`}
            />
          </div>

          <div>
            <label className={`text-xs font-bold ${darkMode ? 'text-white/80' : 'text-gray-700'} mb-2 flex items-center gap-2`}>
              <Instagram className="w-4 h-4 text-pink-500" />
              Instagram
            </label>
            <input
              type="url"
              value={storeData.socialMedia.instagram}
              onChange={(e) => setStoreData({ 
                ...storeData, 
                socialMedia: { ...storeData.socialMedia, instagram: e.target.value } 
              })}
              placeholder="https://instagram.com/tutienda"
              className={`w-full px-4 py-2.5 rounded-xl text-xs ${darkMode ? 'bg-white/5 text-white border-white/10' : 'bg-gray-50 text-gray-900 border-gray-200'} border focus:outline-none focus:border-[#FF6A00]`}
            />
          </div>

          <div>
            <label className={`text-xs font-bold ${darkMode ? 'text-white/80' : 'text-gray-700'} mb-2 flex items-center gap-2`}>
              <Twitter className="w-4 h-4 text-blue-400" />
              Twitter
            </label>
            <input
              type="url"
              value={storeData.socialMedia.twitter}
              onChange={(e) => setStoreData({ 
                ...storeData, 
                socialMedia: { ...storeData.socialMedia, twitter: e.target.value } 
              })}
              placeholder="https://twitter.com/tutienda"
              className={`w-full px-4 py-2.5 rounded-xl text-xs ${darkMode ? 'bg-white/5 text-white border-white/10' : 'bg-gray-50 text-gray-900 border-gray-200'} border focus:outline-none focus:border-[#FF6A00]`}
            />
          </div>

          <div>
            <label className={`text-xs font-bold ${darkMode ? 'text-white/80' : 'text-gray-700'} mb-2 flex items-center gap-2`}>
              <Linkedin className="w-4 h-4 text-blue-600" />
              LinkedIn
            </label>
            <input
              type="url"
              value={storeData.socialMedia.linkedin}
              onChange={(e) => setStoreData({ 
                ...storeData, 
                socialMedia: { ...storeData.socialMedia, linkedin: e.target.value } 
              })}
              placeholder="https://linkedin.com/company/tutienda"
              className={`w-full px-4 py-2.5 rounded-xl text-xs ${darkMode ? 'bg-white/5 text-white border-white/10' : 'bg-gray-50 text-gray-900 border-gray-200'} border focus:outline-none focus:border-[#FF6A00]`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
