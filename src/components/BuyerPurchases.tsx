import React, { useState } from 'react';
import { PackageCheck, Clock, CheckCircle2, Truck, ShieldCheck, PhoneCall, ChevronRight, ShoppingBag } from 'lucide-react';
import { Listing } from '../types';

interface BuyerPurchasesProps {
  listings: Listing[];
  onSelectListing: (listing: Listing) => void;
  onRequestAuth?: (reason?: string, action?: () => void) => void;
}

export const BuyerPurchases: React.FC<BuyerPurchasesProps> = ({
  listings,
  onSelectListing,
  onRequestAuth,
}) => {
  // Simulated purchases data
  const [purchases] = useState([
    {
      id: 'ord-101',
      listing: listings[0] || {
        id: 'item-1',
        title: 'Auriculares Inalámbricos Bluetooth Pro',
        price: 2450,
        images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80'],
        sellerName: 'TechHub RD',
      },
      sellerName: 'TechHub RD',
      sellerPhone: '+1 (809) 555-0199',
      status: 'Entregado',
      date: 'Hace 2 días',
      total: 2450,
      deliveryMethod: 'Punto Neutro / Presencial',
      trackingCode: 'ZYP-8821-SPM',
    },
    {
      id: 'ord-102',
      listing: listings[1] || {
        id: 'item-2',
        title: 'Smartwatch Series 8 Deportivo',
        price: 4100,
        images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80'],
        sellerName: 'TechHub RD',
      },
      sellerName: 'TechHub RD',
      sellerPhone: '+1 (809) 555-0199',
      status: 'En Camino',
      date: 'Hoy, 10:30 AM',
      total: 4100,
      deliveryMethod: 'Envío Local Express',
      trackingCode: 'ZYP-9902-SD',
    },
  ]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 text-white animate-fade-in">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
          <PackageCheck className="w-6 h-6 text-[#FF8A3D]" />
          <span>Mis Compras</span>
        </h1>
        <p className="text-xs text-white/60">
          Historial de pedidos, recibos de compra y seguimiento de entregas en Zyplaza
        </p>
      </div>

      <div className="space-y-4">
        {purchases.map((ord) => {
          const isDelivered = ord.status === 'Entregado';
          return (
            <div
              key={ord.id}
              className="bg-neutral-900 border border-white/10 rounded-3xl p-4 sm:p-5 space-y-4 shadow-xl hover:border-[#FF6A00]/40 transition-all"
            >
              {/* Order Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/10">
                <div>
                  <span className="text-xs font-mono font-bold text-[#FF8A3D]">Order #{ord.trackingCode}</span>
                  <span className="text-[11px] text-white/40 block">{ord.date}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black flex items-center gap-1.5 ${
                      isDelivered
                        ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-950/80 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {isDelivered ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Truck className="w-3.5 h-3.5" />}
                    <span>{ord.status}</span>
                  </span>
                </div>
              </div>

              {/* Product Info */}
              <div className="flex items-center gap-4">
                <img
                  src={ord.listing.images[0]}
                  alt={ord.listing.title}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-white/10 bg-black"
                />
                <div className="flex-1 min-w-0 space-y-1">
                  <h3 className="font-extrabold text-sm sm:text-base text-white truncate">{ord.listing.title}</h3>
                  <p className="text-xs text-white/50">Vendedor: <span className="text-white font-bold">{ord.sellerName}</span></p>
                  <p className="text-xs font-mono text-[#FF8A3D] font-black">
                    Total: RD$ {ord.total.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/5">
                <div className="text-[11px] text-white/60 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Método: {ord.deliveryMethod}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const action = () => {
                        const text = encodeURIComponent(`¡Hola! Quisiera consultar sobre mi compra #${ord.trackingCode}.`);
                        window.open(`https://wa.me/18095550199?text=${text}`, '_blank');
                      };
                      if (onRequestAuth) onRequestAuth('para contactar al vendedor', action);
                      else action();
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-[#25D366] text-black font-extrabold text-xs hover:bg-[#20bd5a] transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <PhoneCall className="w-3.5 h-3.5 fill-black" />
                    <span>Contactar Vendedor</span>
                  </button>

                  <button
                    onClick={() => onSelectListing(ord.listing)}
                    className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <span>Ver Artículo</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
