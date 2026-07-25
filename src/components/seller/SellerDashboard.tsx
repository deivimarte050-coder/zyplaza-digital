import React from 'react';
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Package,
  Star,
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  CheckCircle2
} from 'lucide-react';

type SellerSection = 'home' | 'products' | 'orders' | 'messages' | 'money' | 'store';

interface SellerDashboardProps {
  darkMode: boolean;
  onNavigate?: (section: SellerSection) => void;
}

export const SellerDashboard: React.FC<SellerDashboardProps> = ({ darkMode, onNavigate }) => {
  const tasks = [
    {
      id: 'prepare',
      title: '3 pedidos esperan que los prepares',
      detail: 'El cliente ya pagó. Prepáralos hoy para no perder la venta.',
      action: 'Ver pedidos',
      section: 'orders' as SellerSection,
      icon: ShoppingCart,
      urgent: true
    },
    {
      id: 'stock',
      title: '2 productos se quedaron sin stock',
      detail: 'AirPods Pro y iPad Air. Nadie puede comprarlos ahora mismo.',
      action: 'Revisar productos',
      section: 'products' as SellerSection,
      icon: AlertCircle,
      urgent: true
    },
    {
      id: 'ship',
      title: '5 pedidos listos para entregar',
      detail: 'Ya están preparados. Solo falta marcarlos como enviados.',
      action: 'Ver pedidos',
      section: 'orders' as SellerSection,
      icon: Package,
      urgent: false
    }
  ];

  const mainStats = [
    {
      title: 'Vendiste hoy',
      value: 'RD$ 45,230',
      change: '+12.5%',
      positive: true,
      icon: DollarSign
    },
    {
      title: 'Pedidos nuevos',
      value: '23',
      change: '+5 hoy',
      positive: true,
      icon: ShoppingCart
    },
    {
      title: 'Por despachar',
      value: '8',
      change: '-2 que ayer',
      positive: true,
      icon: Package
    },
    {
      title: 'Tu calificación',
      value: '4.9',
      change: '+0.1',
      positive: true,
      icon: Star
    }
  ];

  const weekSales = [
    { day: 'Lun', height: 65, amount: 'RD$ 29,400' },
    { day: 'Mar', height: 45, amount: 'RD$ 20,300' },
    { day: 'Mié', height: 80, amount: 'RD$ 36,200' },
    { day: 'Jue', height: 55, amount: 'RD$ 24,800' },
    { day: 'Vie', height: 90, amount: 'RD$ 40,700' },
    { day: 'Sáb', height: 70, amount: 'RD$ 31,600' },
    { day: 'Dom', height: 85, amount: 'RD$ 45,230' }
  ];

  const recentOrders = [
    { id: 'ORD-001', customer: 'María García', product: 'iPhone 15 Pro', amount: 'RD$ 45,000', status: 'Nuevo', time: 'Hace 5 min' },
    { id: 'ORD-002', customer: 'Juan Pérez', product: 'Laptop HP', amount: 'RD$ 32,500', status: 'Preparando', time: 'Hace 15 min' },
    { id: 'ORD-003', customer: 'Ana López', product: 'AirPods Pro', amount: 'RD$ 12,000', status: 'Enviado', time: 'Hace 30 min' },
    { id: 'ORD-004', customer: 'Carlos Ruiz', product: 'Samsung Galaxy', amount: 'RD$ 28,000', status: 'Entregado', time: 'Hace 1 hora' }
  ];

  const topProducts = [
    { name: 'iPhone 15 Pro', sales: 45, revenue: 'RD$ 2,025,000' },
    { name: 'Laptop HP Pavilion', sales: 32, revenue: 'RD$ 1,040,000' },
    { name: 'AirPods Pro', sales: 28, revenue: 'RD$ 336,000' },
    { name: 'Samsung Galaxy S24', sales: 25, revenue: 'RD$ 700,000' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Nuevo': return 'bg-blue-500/20 text-blue-300';
      case 'Preparando': return 'bg-yellow-500/20 text-yellow-300';
      case 'Enviado': return 'bg-purple-500/20 text-purple-300';
      case 'Entregado': return 'bg-green-500/20 text-green-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  const cardClass = darkMode
    ? 'bg-white/5 border-white/10'
    : 'bg-white border-gray-200';
  const titleClass = darkMode ? 'text-white' : 'text-gray-900';
  const mutedClass = darkMode ? 'text-white/70' : 'text-gray-600';
  const rowClass = darkMode ? 'bg-white/5' : 'bg-gray-50';

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Tareas pendientes */}
      <section className={`p-5 rounded-2xl border ${cardClass}`}>
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className={`text-base font-bold ${titleClass}`}>
            Tienes {tasks.length} cosas por hacer
          </h2>
          <span className="text-sm font-semibold px-3 py-1 rounded-full bg-[#FF6A00]/20 text-[#FF8A3D]">
            Hoy
          </span>
        </div>

        {tasks.length === 0 ? (
          <div className={`flex items-center gap-3 p-4 rounded-xl ${rowClass}`}>
            <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
            <p className={`text-sm ${mutedClass}`}>Todo está al día. No tienes pendientes.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => {
              const Icon = task.icon;

              return (
                <div
                  key={task.id}
                  className={`p-4 rounded-xl flex flex-col sm:flex-row sm:items-center gap-3 ${rowClass}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    task.urgent ? 'bg-[#FF6A00]/20' : darkMode ? 'bg-white/10' : 'bg-gray-200'
                  }`}>
                    <Icon className={`w-5 h-5 ${task.urgent ? 'text-[#FF6A00]' : mutedClass}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${titleClass}`}>{task.title}</p>
                    <p className={`text-sm mt-0.5 ${mutedClass}`}>{task.detail}</p>
                  </div>

                  <button
                    onClick={() => onNavigate?.(task.section)}
                    className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#FF6A00] text-black text-sm font-bold hover:bg-[#e85f00] transition-all flex-shrink-0"
                  >
                    <span>{task.action}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Métricas principales */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {mainStats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div key={stat.title} className={`p-4 rounded-2xl border ${cardClass}`}>
              <div className="flex items-center gap-2 mb-3">
                <Icon className="w-5 h-5 text-[#FF6A00]" />
                <p className={`text-sm font-medium ${mutedClass}`}>{stat.title}</p>
              </div>
              <p className={`text-2xl font-bold ${titleClass}`}>{stat.value}</p>
              <p className={`flex items-center gap-1 text-sm font-medium mt-1 ${
                stat.positive ? 'text-green-500' : 'text-red-500'
              }`}>
                {stat.positive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                {stat.change}
              </p>
            </div>
          );
        })}
      </section>

      {/* Ventas de la semana */}
      <section className={`p-5 rounded-2xl border ${cardClass}`}>
        <div className="flex items-center justify-between gap-3 mb-5">
          <h2 className={`text-base font-bold ${titleClass}`}>Ventas de esta semana</h2>
          <span className={`text-sm font-semibold ${titleClass}`}>RD$ 228,230</span>
        </div>
        <div className="flex items-end justify-between gap-2 h-44">
          {weekSales.map((item) => (
            <div key={item.day} className="flex-1 flex flex-col items-center justify-end h-full gap-2">
              <span className={`text-xs font-semibold ${mutedClass}`}>
                {item.amount.replace('RD$ ', '')}
              </span>
              <div
                className="w-full rounded-t-lg bg-gradient-to-t from-[#FF6A00] to-[#FF8A3D]"
                style={{ height: `${item.height}%` }}
              />
              <span className={`text-sm font-medium ${mutedClass}`}>{item.day}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Pedidos y productos */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className={`p-5 rounded-2xl border ${cardClass}`}>
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className={`text-base font-bold ${titleClass}`}>Últimos pedidos</h2>
            <button
              onClick={() => onNavigate?.('orders')}
              className="text-sm font-semibold text-[#FF8A3D] hover:underline"
            >
              Ver todos
            </button>
          </div>
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div key={order.id} className={`p-3 rounded-xl flex items-center justify-between gap-3 ${rowClass}`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`text-sm font-semibold ${titleClass}`}>{order.customer}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className={`text-sm truncate ${mutedClass}`}>{order.product}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`text-sm font-bold ${titleClass}`}>{order.amount}</p>
                  <p className={`text-xs ${mutedClass}`}>{order.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={`p-5 rounded-2xl border ${cardClass}`}>
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className={`text-base font-bold ${titleClass}`}>Lo que más vendes</h2>
            <button
              onClick={() => onNavigate?.('products')}
              className="text-sm font-semibold text-[#FF8A3D] hover:underline"
            >
              Ver todos
            </button>
          </div>
          <div className="space-y-3">
            {topProducts.map((product, index) => (
              <div key={product.name} className={`p-3 rounded-xl flex items-center justify-between gap-3 ${rowClass}`}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                    darkMode ? 'bg-white/10 text-white' : 'bg-gray-200 text-gray-800'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="min-w-0">
                    <p className={`text-sm font-semibold truncate ${titleClass}`}>{product.name}</p>
                    <p className={`text-sm ${mutedClass}`}>{product.sales} vendidos</p>
                  </div>
                </div>
                <p className={`text-sm font-bold flex-shrink-0 ${titleClass}`}>{product.revenue}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Accesos rápidos */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={() => onNavigate?.('products')}
          className={`p-4 rounded-2xl border flex items-center gap-3 transition-all ${cardClass} ${
            darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-50'
          }`}
        >
          <Plus className="w-5 h-5 text-[#FF6A00] flex-shrink-0" />
          <span className={`text-sm font-semibold ${titleClass}`}>Publicar un producto</span>
        </button>
        <button
          onClick={() => onNavigate?.('orders')}
          className={`p-4 rounded-2xl border flex items-center gap-3 transition-all ${cardClass} ${
            darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-50'
          }`}
        >
          <ShoppingCart className="w-5 h-5 text-[#FF6A00] flex-shrink-0" />
          <span className={`text-sm font-semibold ${titleClass}`}>Despachar pedidos</span>
        </button>
        <button
          onClick={() => onNavigate?.('store')}
          className={`p-4 rounded-2xl border flex items-center gap-3 transition-all ${cardClass} ${
            darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-50'
          }`}
        >
          <TrendingUp className="w-5 h-5 text-[#FF6A00] flex-shrink-0" />
          <span className={`text-sm font-semibold ${titleClass}`}>Mejorar mi tienda</span>
        </button>
      </section>
    </div>
  );
};
