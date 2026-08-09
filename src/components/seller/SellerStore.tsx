import React from 'react';
import {
  Store as StoreIcon,
  Pencil,
  MapPin,
  Phone,
  Clock,
  Star,
  Package,
  MessageSquare,
  BadgeCheck,
  Facebook,
  Instagram,
  Twitter,
} from 'lucide-react';
import { Store } from '../../types';

interface SellerStoreProps {
  darkMode: boolean;
  store: Store | null;
  onEditStore: () => void;
}

export const SellerStore: React.FC<SellerStoreProps> = ({ store, onEditStore }) => {
  if (!store) {
    return (
      <div className="max-w-xl mx-auto rounded-2xl border border-dashed border-line-strong p-10 text-center space-y-3 text-text-1">
        <StoreIcon className="w-10 h-10 mx-auto text-text-3" />
        <p className="text-sm font-bold text-text-2">No tienes una tienda todavía</p>
        <p className="text-xs text-text-3">
          Crea tu tienda para mostrar tu marca, contacto y todos tus productos en un solo lugar.
        </p>
      </div>
    );
  }

  const infoRows: { icon: React.ElementType; label: string; value?: string }[] = [
    { icon: MapPin, label: 'Ubicación', value: [store.address, store.city, store.province].filter(Boolean).join(', ') },
    { icon: Phone, label: 'WhatsApp', value: store.whatsapp },
    { icon: Phone, label: 'Teléfono', value: store.phone },
    { icon: Clock, label: 'Horario', value: store.openingHours },
  ];

  const socials = [
    { icon: Facebook, url: store.socials?.facebook, label: 'Facebook' },
    { icon: Instagram, url: store.socials?.instagram, label: 'Instagram' },
    { icon: Twitter, url: store.socials?.twitter, label: 'X / Twitter' },
  ].filter((s) => s.url);

  return (
    <div className="max-w-3xl mx-auto space-y-5 text-text-1">
      {/* Portada */}
      <div className="rounded-2xl border border-line overflow-hidden bg-surface">
        <div className="h-36 bg-gradient-to-r from-orange/30 to-surface relative">
          {store.coverImage ? (
            <img src={store.coverImage} alt="" className="w-full h-full object-cover" />
          ) : null}
          <div className="absolute -bottom-8 left-5 flex items-end gap-3">
            <img
              src={store.logo}
              alt={store.name}
              className="w-20 h-20 rounded-2xl object-cover border-4 border-void bg-surface-2"
            />
          </div>
          <button
            onClick={onEditStore}
            className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-void/60 backdrop-blur border border-line text-xs font-bold hover:bg-void/80 transition-all cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5" />
            Editar tienda
          </button>
        </div>
        <div className="pt-11 pb-4 px-5">
          <h2 className="text-lg font-black flex items-center gap-2 font-display">
            {store.name}
            {store.verified && <BadgeCheck className="w-5 h-5 text-orange" />}
          </h2>
          <p className="text-xs text-text-3">{store.category}</p>
          {store.description && <p className="text-xs text-text-2 mt-2 leading-relaxed">{store.description}</p>}
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-line bg-surface p-4 text-center">
          <Package className="w-4 h-4 mx-auto text-orange mb-1" />
          <p className="text-lg font-black">{store.totalListings}</p>
          <p className="text-[10px] text-text-3 font-semibold">Productos</p>
        </div>
        <div className="rounded-2xl border border-line bg-surface p-4 text-center">
          <Star className="w-4 h-4 mx-auto text-amber-400 mb-1" />
          <p className="text-lg font-black">{store.rating.toFixed(1)}</p>
          <p className="text-[10px] text-text-3 font-semibold">{store.reviewsCount} reseñas</p>
        </div>
        <div className="rounded-2xl border border-line bg-surface p-4 text-center">
          <MessageSquare className="w-4 h-4 mx-auto text-emerald-400 mb-1" />
          <p className="text-lg font-black">{store.responseTime}</p>
          <p className="text-[10px] text-text-3 font-semibold">Respuesta</p>
        </div>
      </div>

      {/* Información de contacto */}
      <div className="rounded-2xl border border-line bg-surface p-5 space-y-3">
        <h3 className="text-sm font-bold">Información de contacto</h3>
        {infoRows.map((row) => (
          <div key={row.label} className="flex items-center gap-3 text-xs">
            <row.icon className="w-4 h-4 text-text-3 flex-shrink-0" />
            <span className="text-text-3 font-semibold w-20">{row.label}</span>
            <span className="text-text-1 font-medium truncate">{row.value || 'No especificado'}</span>
          </div>
        ))}
        {socials.length > 0 && (
          <div className="flex items-center gap-2 pt-2 border-t border-line">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                title={s.label}
                className="p-2 rounded-lg bg-surface-2 border border-line text-text-3 hover:text-text-1 hover:bg-line transition-all"
              >
                <s.icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={onEditStore}
        className="w-full py-3 rounded-xl bg-orange text-void text-sm font-extrabold hover:bg-orange-soft transition-all cursor-pointer flex items-center justify-center gap-2"
      >
        <Pencil className="w-4 h-4" />
        Editar información de mi tienda
      </button>
    </div>
  );
};
