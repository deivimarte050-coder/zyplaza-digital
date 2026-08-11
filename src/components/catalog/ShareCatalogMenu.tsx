import React, { useState } from 'react';
import {
  X,
  Link2,
  Check,
  Share2,
  Send,
} from 'lucide-react';

interface ShareCatalogMenuProps {
  url: string;
  storeName: string;
  productCount: number;
  onClose: () => void;
}

/**
 * Menú profesional para compartir el catálogo público de una tienda.
 * Se usa tanto desde el perfil de tienda como desde la propia página
 * del catálogo compartido.
 */
export const ShareCatalogMenu: React.FC<ShareCatalogMenuProps> = ({
  url,
  storeName,
  productCount,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  const message =
    `🛍️ CATÁLOGO DE ${storeName.toUpperCase()}\n\n` +
    `🔥 Descubre todos nuestros productos en Zyplaza.\n\n` +
    `📦 Tenemos ${productCount} producto${productCount === 1 ? '' : 's'} disponible${productCount === 1 ? '' : 's'}.\n\n` +
    `👉 Mira el catálogo completo:\n${url}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('Copia el enlace de tu catálogo:', url);
    }
  };

  const handleNativeShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: `Catálogo de ${storeName}`, text: message, url });
        return;
      }
      handleCopy();
    } catch {
      // El usuario canceló el share nativo; no hacer nada.
    }
  };

  const options = [
    {
      label: 'WhatsApp',
      color: 'bg-[#25D366] text-[#0A0400]',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12.004 2.003c-5.514 0-9.997 4.483-9.997 9.997 0 1.763.462 3.483 1.34 4.997l-1.424 5.2 5.325-1.397a9.96 9.96 0 0 0 4.756 1.21h.004c5.514 0 9.997-4.483 9.997-9.997 0-2.67-1.04-5.18-2.929-7.07a9.929 9.929 0 0 0-7.072-2.94zm0 18.184h-.003a8.19 8.19 0 0 1-4.174-1.143l-.3-.178-3.16.829.843-3.08-.196-.317a8.176 8.176 0 0 1-1.256-4.378c0-4.522 3.68-8.202 8.25-8.202 2.203 0 4.274.859 5.833 2.418a8.181 8.181 0 0 1 2.412 5.79c-.001 4.522-3.68 8.202-8.249 8.202z"/></svg>
      ),
      onClick: () =>
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank'),
    },
    {
      label: 'Facebook',
      color: 'bg-[#1877F2] text-white',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.51 1.49-3.89 3.77-3.89 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.91h-2.34V22c4.78-.76 8.44-4.92 8.44-9.94z"/></svg>
      ),
      onClick: () =>
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
          '_blank'
        ),
    },
    {
      label: 'Telegram',
      color: 'bg-[#26A5E4] text-white',
      icon: <Send className="w-5 h-5" />,
      onClick: () =>
        window.open(
          `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(
            `Catálogo de ${storeName} en Zyplaza`
          )}`,
          '_blank'
        ),
    },
    {
      label: 'Instagram',
      color: 'bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM12 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
      ),
      onClick: () => {
        handleCopy();
      },
    },
  ];

  return (
    <div
      className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-sm bg-surface border border-line rounded-t-3xl sm:rounded-3xl p-5 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-base font-display font-semibold text-text-1">Compartir catálogo</h3>
            <p className="text-xs text-text-3 mt-0.5">Comparte todos tus productos en un solo enlace.</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/5 text-text-3 hover:text-text-1 hover:bg-white/10 transition-all cursor-pointer flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {options.map((opt) => (
            <button
              key={opt.label}
              onClick={opt.onClick}
              className="flex flex-col items-center gap-1.5 cursor-pointer group"
            >
              <span
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform ${opt.color}`}
              >
                {opt.icon}
              </span>
              <span className="text-[10px] font-semibold text-text-2">{opt.label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 bg-white/5 border border-line rounded-xl px-3 py-2.5">
          <Link2 className="w-4 h-4 text-text-3 flex-shrink-0" />
          <span className="text-xs text-text-2 truncate flex-1">{url}</span>
          <button
            onClick={handleCopy}
            className="text-[11px] font-bold text-orange-soft hover:text-orange transition-colors cursor-pointer flex-shrink-0 flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : null}
            {copied ? 'Copiado' : 'Copiar'}
          </button>
        </div>

        <button
          onClick={handleNativeShare}
          className="w-full py-2.5 rounded-xl bg-orange text-void text-xs font-extrabold hover:bg-orange-soft transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <Share2 className="w-4 h-4" />
          Compartir mediante el sistema del teléfono
        </button>
      </div>
    </div>
  );
};
