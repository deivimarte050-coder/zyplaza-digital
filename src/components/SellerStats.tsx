import React from 'react';
import { BarChart3, TrendingUp, Eye, DollarSign, Users, Award, ShoppingBag, ArrowUpRight } from 'lucide-react';

export const SellerStats: React.FC = () => {
  const kpis = [
    { title: 'Ventas Totales', value: 'RD$ 124,500', growth: '+18%', icon: DollarSign, color: 'text-emerald-400' },
    { title: 'Visualizaciones', value: '14,820', growth: '+24%', icon: Eye, color: 'text-[#FF8A3D]' },
    { title: 'Mensajes / Consultas', value: '186', growth: '+12%', icon: Users, color: 'text-sky-400' },
    { title: 'Tasa de Conversión', value: '4.8%', growth: '+1.2%', icon: TrendingUp, color: 'text-purple-400' },
  ];

  const topItems = [
    { name: 'Auriculares Bluetooth Pro', sales: 42, revenue: 'RD$ 102,900', views: 3200 },
    { name: 'Smartwatch Series 8', sales: 28, revenue: 'RD$ 114,800', views: 2450 },
    { name: 'Power Bank Anker 20,000mAh', sales: 19, revenue: 'RD$ 36,100', views: 1890 },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6 text-white animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-[#FF8A3D]" />
          <span>Estadísticas de mi Tienda</span>
        </h1>
        <p className="text-xs text-white/60">
          Rendimiento en tiempo real de tus publicaciones, ingresos acumulados e interacciones de compradores
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="bg-neutral-900 border border-white/10 rounded-2xl p-4 space-y-2 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between">
                <Icon className={`w-5 h-5 ${kpi.color}`} />
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-0.5">
                  <ArrowUpRight className="w-3 h-3" />
                  {kpi.growth}
                </span>
              </div>
              <div>
                <span className="text-xs text-white/50 block font-medium">{kpi.title}</span>
                <span className="text-base sm:text-xl font-black text-white">{kpi.value}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Top Performing Items & Activity Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left 2 Cols: Top Products */}
        <div className="md:col-span-2 bg-neutral-900 border border-white/10 rounded-3xl p-5 space-y-4 shadow-xl">
          <h2 className="text-sm font-extrabold text-white flex items-center gap-2 pb-2 border-b border-white/10">
            <Award className="w-4 h-4 text-[#FF8A3D]" />
            <span>Productos Más Vendidos</span>
          </h2>

          <div className="space-y-3">
            {topItems.map((item, i) => (
              <div key={i} className="bg-black/40 border border-white/5 rounded-2xl p-3.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-[#FF6A00]/20 text-[#FF8A3D] border border-[#FF6A00]/30 font-black text-xs flex items-center justify-center">
                    #{i + 1}
                  </span>
                  <div>
                    <h4 className="font-bold text-xs text-white">{item.name}</h4>
                    <span className="text-[10px] text-white/50">{item.views} vistas • {item.sales} unidades vendidas</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono font-black text-sm text-[#FF8A3D]">{item.revenue}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Rating Summary */}
        <div className="bg-neutral-900 border border-white/10 rounded-3xl p-5 space-y-4 shadow-xl flex flex-col justify-between">
          <div className="space-y-3">
            <h2 className="text-sm font-extrabold text-white flex items-center gap-2 pb-2 border-b border-white/10">
              <ShoppingBag className="w-4 h-4 text-[#FF8A3D]" />
              <span>Reputación del Vendedor</span>
            </h2>

            <div className="text-center py-4 space-y-1">
              <span className="text-4xl font-black text-[#FF8A3D]">⭐ 4.9</span>
              <p className="text-xs font-bold text-white">Excelente Reputación Local</p>
              <p className="text-[11px] text-white/50">Basado en 48 calificaciones de compradores</p>
            </div>
          </div>

          <div className="p-3 bg-emerald-950/60 border border-emerald-500/30 rounded-2xl text-[11px] text-emerald-300 space-y-1">
            <p className="font-bold">🏅 Vendedor Destacado Zyplaza</p>
            <p className="text-emerald-300/80">Tiempo medio de respuesta: ~8 minutos.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
