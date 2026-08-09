import React from 'react';
import {
  Package,
  Eye,
  AlertCircle,
  CheckCircle2,
  Store as StoreIcon,
  ArrowRight,
  Plus,
  Star,
} from 'lucide-react';
import { Listing, Store } from '../../types';

type SellerSection = 'home' | 'products' | 'store';

interface SellerDashboardProps {
  darkMode: boolean;
  onNavigate: (section: SellerSection) => void;
  store: Store | null;
  products: Listing[];
}

export const SellerDashboard: React.FC<SellerDashboardProps> = ({ onNavigate, store, products }) => {
  const activeProducts = products.filter((p) => p.status === 'active');
  const inactiveProducts = products.filter((p) => p.status !== 'active');
  const outOfStock = products.filter((p) => p.stock !== undefined && p.stock <= 0 && p.status === 'active');
  const totalViews = products.reduce((acc, p) => acc + (p.viewsCount || 0), 0);
  const topViewed = [...products].sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0)).slice(0, 5);
  const recentProducts = [...products].slice(0, 4);

  const stats = [
    { title: 'Productos activos', value: String(activeProducts.length), icon: Package, color: 'text-emerald-400', bg: 'bg-emerald-500/15' },
    { title: 'Visitas a tus artículos', value: totalViews.toLocaleString(), icon: Eye, color: 'text-blue-400', bg: 'bg-blue-500/15' },
    { title: 'Pausados / vendidos', value: String(inactiveProducts.length), icon: AlertCircle, color: 'text-amber-400', bg: 'bg-amber-500/15' },
    { title: 'Calificación de tienda', value: (store?.rating ?? 5).toFixed(1), icon: Star, color: 'text-[#FF8A3D]', bg: 'bg-[#FF6A00]/15' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 text-white">
      {/* Saludo */}
      <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-[#FF6A00]/15 to-transparent p-5">
        <h2 className="text-lg font-black flex items-center gap-2">
          <StoreIcon className="w-5 h-5 text-[#FF8A3D]" />
          {store?.name ?? 'Tu tienda'}
        </h2>
        <p className="text-xs text-white/60 mt-1">
          Aquí ves el resumen real de tu actividad en Zyplaza. Todo se actualiza en tiempo real.
        </p>
      </div>

      {/* Estadísticas reales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s) => (
          <div key={s.title} className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-2">
            <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center`}>
              <s.icon className={`w-4.5 h-4.5 ${s.color}`} />
            </div>
            <p className="text-xl font-black text-white">{s.value}</p>
            <p className="text-[11px] text-white/50 font-semibold">{s.title}</p>
          </div>
        ))}
      </div>

      {/* Alertas reales */}
      {outOfStock.length > 0 && (
        <button
          onClick={() => onNavigate('products')}
          className="w-full text-left rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 flex items-center gap-3 hover:bg-amber-500/15 transition-all"
        >
          <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-bold text-amber-300">
              {outOfStock.length} {outOfStock.length === 1 ? 'producto se quedó' : 'productos se quedaron'} sin stock
            </p>
            <p className="text-xs text-white/60">Tócalo para actualizar el inventario.</p>
          </div>
          <ArrowRight className="w-4 h-4 text-amber-400" />
        </button>
      )}

      {products.length === 0 && (
        <button
          onClick={() => onNavigate('products')}
          className="w-full text-left rounded-2xl border border-[#FF6A00]/30 bg-[#FF6A00]/10 p-5 flex items-center gap-3 hover:bg-[#FF6A00]/15 transition-all"
        >
          <Plus className="w-6 h-6 text-[#FF8A3D] flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-bold text-white">Publica tu primer producto</p>
            <p className="text-xs text-white/60">Todavía no tienes artículos a la venta. Empieza ahora.</p>
          </div>
          <ArrowRight className="w-4 h-4 text-[#FF8A3D]" />
        </button>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {/* Más vistos */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <Eye className="w-4 h-4 text-blue-400" />
            Tus artículos más vistos
          </h3>
          {topViewed.length === 0 ? (
            <p className="text-xs text-white/40">Sin artículos todavía.</p>
          ) : (
            <div className="space-y-2">
              {topViewed.map((p) => (
                <div key={p.id} className="flex items-center gap-3">
                  <img src={p.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover bg-white/5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate">{p.title}</p>
                    <p className="text-[10px] text-white/40">{p.viewsCount} visitas</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    p.status === 'active' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-white/10 text-white/50'
                  }`}>
                    {p.status === 'active' ? 'Activo' : 'Pausado'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recientes */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Publicados recientemente
          </h3>
          {recentProducts.length === 0 ? (
            <p className="text-xs text-white/40">Sin artículos todavía.</p>
          ) : (
            <div className="space-y-2">
              {recentProducts.map((p) => (
                <div key={p.id} className="flex items-center gap-3">
                  <img src={p.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover bg-white/5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate">{p.title}</p>
                    <p className="text-[10px] text-[#FF8A3D] font-bold">RD$ {p.price.toLocaleString()}</p>
                  </div>
                  <button
                    onClick={() => onNavigate('products')}
                    className="text-[10px] font-bold text-white/50 hover:text-white border border-white/10 rounded-full px-2.5 py-1"
                  >
                    Gestionar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
