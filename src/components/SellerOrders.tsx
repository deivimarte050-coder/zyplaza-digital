import React, { useState } from 'react';
import { ClipboardList, CheckCircle2, Clock, PhoneCall, User, MapPin, PackageCheck, AlertCircle } from 'lucide-react';
import { Listing } from '../types';

interface SellerOrdersProps {
  userListings: Listing[];
  onRequestAuth?: (reason?: string, action?: () => void) => void;
}

export const SellerOrders: React.FC<SellerOrdersProps> = ({
  userListings,
  onRequestAuth,
}) => {
  const [orders, setOrders] = useState([
    {
      id: 'PED-501',
      customerName: 'Juan Pérez',
      customerPhone: '+1 (829) 444-1234',
      city: 'San Pedro de Macorís',
      itemTitle: userListings[0]?.title || 'Laptop HP Pavilion 15 Core i5',
      price: userListings[0]?.price || 28500,
      image: userListings[0]?.images[0] || 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80',
      status: 'Pendiente de Confirmar',
      date: 'Hoy, 09:15 AM',
      paymentMethod: 'Efectivo en Entrega / Punto Neutro',
    },
    {
      id: 'PED-502',
      customerName: 'Maria Rodríguez',
      customerPhone: '+1 (809) 333-8899',
      city: 'Santo Domingo Este',
      itemTitle: 'Consola PS5 Slim Digital 1TB',
      price: 34900,
      image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=600&q=80',
      status: 'Confirmado / En Preparación',
      date: 'Ayer, 04:30 PM',
      paymentMethod: 'Transferencia BHD',
    },
  ]);

  const handleUpdateStatus = (id: string, newStatus: string) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === id ? { ...ord, status: newStatus } : ord))
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 text-white animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
          <ClipboardList className="w-6 h-6 text-[#FF8A3D]" />
          <span>Pedidos Recibidos ({orders.length})</span>
        </h1>
        <p className="text-xs text-white/60">
          Gestiona las solicitudes de compra de clientes, confirma disponibilidad y coordina entregas
        </p>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.map((ord) => {
          const isPending = ord.status.includes('Pendiente');
          return (
            <div
              key={ord.id}
              className="bg-neutral-900 border border-white/10 rounded-3xl p-4 sm:p-5 space-y-4 shadow-xl hover:border-[#FF6A00]/40 transition-all"
            >
              {/* Order Bar Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-black text-[#FF8A3D]">{ord.id}</span>
                  <span className="text-[11px] text-white/40">• {ord.date}</span>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5 ${
                    isPending
                      ? 'bg-amber-950/80 text-amber-400 border border-amber-500/40'
                      : 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40'
                  }`}
                >
                  {isPending ? <Clock className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>{ord.status}</span>
                </span>
              </div>

              {/* Body Item & Customer Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Item summary */}
                <div className="flex items-center gap-3 bg-black/40 p-3 rounded-2xl border border-white/5">
                  <img src={ord.image} alt={ord.itemTitle} className="w-16 h-16 rounded-xl object-cover border border-white/10" />
                  <div className="min-w-0">
                    <h4 className="font-bold text-xs text-white truncate">{ord.itemTitle}</h4>
                    <p className="text-xs font-black text-[#FF8A3D] mt-0.5">RD$ {ord.price.toLocaleString()}</p>
                    <p className="text-[10px] text-white/50">{ord.paymentMethod}</p>
                  </div>
                </div>

                {/* Customer summary */}
                <div className="bg-black/40 p-3 rounded-2xl border border-white/5 space-y-1 text-xs">
                  <p className="font-bold text-white flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#FF8A3D]" />
                    <span>Cliente: {ord.customerName}</span>
                  </p>
                  <p className="text-white/70 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#FF8A3D]" />
                    <span>Ubicación: {ord.city}</span>
                  </p>
                  <p className="text-white/70 flex items-center gap-1.5">
                    <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Tel: {ord.customerPhone}</span>
                  </p>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-white/5">
                <button
                  onClick={() => {
                    const action = () => {
                      const text = encodeURIComponent(`¡Hola ${ord.customerName}! Te escribo sobre tu pedido #${ord.id} en Zyplaza.`);
                      window.open(`https://wa.me/18095550199?text=${text}`, '_blank');
                    };
                    if (onRequestAuth) onRequestAuth('para enviar mensaje por WhatsApp al cliente', action);
                    else action();
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-[#25D366] text-black font-extrabold text-xs hover:bg-[#20bd5a] transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <PhoneCall className="w-3.5 h-3.5 fill-black" />
                  <span>Escribir por WhatsApp</span>
                </button>

                <div className="flex items-center gap-2">
                  {isPending ? (
                    <button
                      onClick={() => handleUpdateStatus(ord.id, 'Confirmado / En Preparación')}
                      className="px-3.5 py-1.5 rounded-xl bg-[#FF6A00] text-black font-extrabold text-xs hover:bg-[#ff7d1c] transition-all cursor-pointer shadow-md"
                    >
                      Aprobar Pedido
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUpdateStatus(ord.id, 'Completado y Entregado')}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-500 text-black font-extrabold text-xs hover:bg-emerald-400 transition-all cursor-pointer shadow-md"
                    >
                      Marcar Completado
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
