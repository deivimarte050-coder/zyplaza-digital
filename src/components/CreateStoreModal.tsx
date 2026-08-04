import React, { useRef, useState } from 'react';
import { X, Store as StoreIcon, Phone, FileText, Camera, Upload, CheckCircle, Rocket } from 'lucide-react';

export interface CreateStoreInput {
  name: string;
  whatsapp: string;
  description: string;
  logo: string;
}

interface CreateStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateStore: (input: CreateStoreInput) => void;
}

export const CreateStoreModal: React.FC<CreateStoreModalProps> = ({ isOpen, onClose, onCreateStore }) => {
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [description, setDescription] = useState('');
  const [logo, setLogo] = useState('');
  const [errors, setErrors] = useState<{ name?: string; whatsapp?: string }>({});
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) return;
    if (file.size > 5 * 1024 * 1024) return;

    const reader = new FileReader();
    reader.onload = () => setLogo(typeof reader.result === 'string' ? reader.result : '');
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const nextErrors: { name?: string; whatsapp?: string } = {};
    const cleanName = name.trim();
    const cleanWhatsapp = whatsapp.replace(/\D/g, '');

    if (cleanName.length < 3) nextErrors.name = 'Escribe el nombre de tu tienda.';
    if (cleanWhatsapp.length < 10) nextErrors.whatsapp = 'Ingresa un número de WhatsApp válido.';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onCreateStore({
      name: cleanName,
      whatsapp: cleanWhatsapp,
      description: description.trim(),
      logo
    });

    setSuccess(true);
    window.setTimeout(() => {
      setSuccess(false);
      setName('');
      setWhatsapp('');
      setDescription('');
      setLogo('');
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-md bg-[#121316] border border-white/10 rounded-3xl overflow-hidden shadow-2xl my-auto text-white p-5 sm:p-6 space-y-5">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {success ? (
          <div className="py-10 flex flex-col items-center justify-center text-center gap-3 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle className="w-9 h-9" />
            </div>
            <h2 className="text-lg font-black text-white">¡Tu tienda ha sido creada!</h2>
            <p className="text-xs text-white/60 max-w-xs">
              Ya puedes empezar a publicar productos y vender en Zyplaza.
            </p>
          </div>
        ) : (
          <>
            <div className="text-center space-y-1.5 pt-2">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#FF6A00] to-[#FF8A3D] text-black">
                <Rocket className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-black text-white">Crear mi tienda</h2>
              <p className="text-xs text-white/60 max-w-xs mx-auto leading-relaxed">
                Menos de un minuto y ya puedes empezar a vender en Zyplaza.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-white/80">Nombre de la tienda</label>
                <div className="relative">
                  <StoreIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="text"
                    value={name}
                    autoFocus
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej: TechHub RD"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#FF8A3D]"
                  />
                </div>
                {errors.name && <p className="text-[11px] text-red-400 font-semibold">{errors.name}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-white/80">Número de WhatsApp</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="tel"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="Ej: 809-555-0199"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#FF8A3D]"
                  />
                </div>
                {errors.whatsapp && <p className="text-[11px] text-red-400 font-semibold">{errors.whatsapp}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-white/80">Descripción de la tienda (opcional)</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 w-4 h-4 text-white/40" />
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Cuéntale a tus clientes qué vendes..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#FF8A3D] resize-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-white/80">Logo o foto de la tienda (opcional)</label>
                <div className="flex items-center gap-3">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-14 h-14 rounded-full bg-white/5 border-2 border-dashed border-white/20 flex items-center justify-center cursor-pointer hover:border-[#FF8A3D] transition-all overflow-hidden flex-shrink-0"
                  >
                    {logo ? (
                      <img src={logo} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-5 h-5 text-white/40" />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 py-2 px-3 bg-white/5 border border-white/10 rounded-xl text-xs text-white/80 hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Subir foto</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-[#FF6A00] to-[#e85f00] text-black font-extrabold text-xs sm:text-sm rounded-2xl hover:scale-[1.02] active:scale-95 transition-all cursor-pointer shadow-lg shadow-[#FF6A00]/20 flex items-center justify-center gap-2"
              >
                <span>Crear tienda</span>
                <Rocket className="w-4 h-4 text-black" />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
