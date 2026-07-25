import React, { useState } from 'react';
import { 
  ShoppingCart, 
  Package, 
  Truck, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Search, 
  Filter, 
  Eye, 
  MessageSquare, 
  Printer, 
  MoreVertical,
  User,
  MapPin,
  Phone,
  Calendar,
  DollarSign,
  ArrowRight,
  FileText,
  X
} from 'lucide-react';

interface SellerOrdersProps {
  darkMode: boolean;
}

type OrderStatus = 'new' | 'confirmed' | 'preparing' | 'ready' | 'shipped' | 'delivered' | 'cancelled' | 'returned';

interface Order {
  id: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  items: {
    id: string;
    name: string;
    quantity: number;
    price: number;
    image: string;
  }[];
  total: number;
  status: OrderStatus;
  paymentMethod: string;
  shippingMethod: string;
  trackingNumber?: string;
  createdAt: string;
  estimatedDelivery?: string;
}

export const SellerOrders: React.FC<SellerOrdersProps> = ({ darkMode }) => {
  const [orders, setOrders] = useState<Order[]>([
    {
      id: 'ORD-001',
      customer: {
        name: 'María García',
        email: 'maria.garcia@email.com',
        phone: '+1 (809) 555-0123',
        address: 'Calle Principal #45, San Pedro de Macorís'
      },
      items: [
        { id: '1', name: 'iPhone 15 Pro Max', quantity: 1, price: 65000, image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=100&q=80' },
        { id: '2', name: 'AirPods Pro', quantity: 1, price: 12000, image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=100&q=80' }
      ],
      total: 77000,
      status: 'new',
      paymentMethod: 'Tarjeta de Crédito',
      shippingMethod: 'Envío Local',
      createdAt: '2024-01-20 10:30',
      estimatedDelivery: '2024-01-23'
    },
    {
      id: 'ORD-002',
      customer: {
        name: 'Juan Pérez',
        email: 'juan.perez@email.com',
        phone: '+1 (809) 555-0456',
        address: 'Av. Independencia #123, Santo Domingo'
      },
      items: [
        { id: '3', name: 'Laptop HP Pavilion', quantity: 1, price: 45000, image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=100&q=80' }
      ],
      total: 45000,
      status: 'confirmed',
      paymentMethod: 'Transferencia',
      shippingMethod: 'Punto Neutro',
      createdAt: '2024-01-20 09:15',
      estimatedDelivery: '2024-01-24'
    },
    {
      id: 'ORD-003',
      customer: {
        name: 'Ana López',
        email: 'ana.lopez@email.com',
        phone: '+1 (809) 555-0789',
        address: 'Calle del Sol #67, La Romana'
      },
      items: [
        { id: '4', name: 'Samsung Galaxy S24', quantity: 1, price: 52000, image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=100&q=80' }
      ],
      total: 52000,
      status: 'preparing',
      paymentMethod: 'Pago contra entrega',
      shippingMethod: 'A Convenir',
      createdAt: '2024-01-19 15:45',
      estimatedDelivery: '2024-01-22'
    },
    {
      id: 'ORD-004',
      customer: {
        name: 'Carlos Ruiz',
        email: 'carlos.ruiz@email.com',
        phone: '+1 (809) 555-0321',
        address: 'Calle 27 de Febrero #89, Santiago'
      },
      items: [
        { id: '5', name: 'iPad Air', quantity: 1, price: 35000, image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=100&q=80' }
      ],
      total: 35000,
      status: 'shipped',
      paymentMethod: 'Tarjeta de Débito',
      shippingMethod: 'Envío Local',
      trackingNumber: 'TRK-789456123',
      createdAt: '2024-01-18 11:20',
      estimatedDelivery: '2024-01-21'
    },
    {
      id: 'ORD-005',
      customer: {
        name: 'Laura Díaz',
        email: 'laura.diaz@email.com',
        phone: '+1 (809) 555-0654',
        address: 'Calle Mella #234, Punta Cana'
      },
      items: [
        { id: '6', name: 'Apple Watch Series 9', quantity: 1, price: 28000, image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=100&q=80' }
      ],
      total: 28000,
      status: 'delivered',
      paymentMethod: 'PayPal',
      shippingMethod: 'Envío Local',
      trackingNumber: 'TRK-456789123',
      createdAt: '2024-01-15 14:00',
      estimatedDelivery: '2024-01-18'
    }
  ]);

  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const statusOptions = [
    { value: 'all', label: 'Todos', icon: ShoppingCart, color: 'text-gray-500' },
    { value: 'new', label: 'Nuevos', icon: Clock, color: 'text-blue-500' },
    { value: 'confirmed', label: 'Confirmados', icon: CheckCircle, color: 'text-green-500' },
    { value: 'preparing', label: 'Preparando', icon: Package, color: 'text-yellow-500' },
    { value: 'ready', label: 'Listos', icon: Package, color: 'text-purple-500' },
    { value: 'shipped', label: 'Enviados', icon: Truck, color: 'text-indigo-500' },
    { value: 'delivered', label: 'Entregados', icon: CheckCircle, color: 'text-emerald-500' },
    { value: 'cancelled', label: 'Cancelados', icon: XCircle, color: 'text-red-500' },
    { value: 'returned', label: 'Devueltos', icon: ArrowRight, color: 'text-orange-500' }
  ];

  const filteredOrders = orders.filter(order => {
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.customer.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    setOrders(orders.map(order =>
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'new': return 'bg-blue-500/20 text-blue-400';
      case 'confirmed': return 'bg-green-500/20 text-green-400';
      case 'preparing': return 'bg-yellow-500/20 text-yellow-400';
      case 'ready': return 'bg-purple-500/20 text-purple-400';
      case 'shipped': return 'bg-indigo-500/20 text-indigo-400';
      case 'delivered': return 'bg-emerald-500/20 text-emerald-400';
      case 'cancelled': return 'bg-red-500/20 text-red-400';
      case 'returned': return 'bg-orange-500/20 text-orange-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStatusLabel = (status: OrderStatus) => {
    switch (status) {
      case 'new': return 'Nuevo';
      case 'confirmed': return 'Confirmado';
      case 'preparing': return 'Preparando';
      case 'ready': return 'Listo para envío';
      case 'shipped': return 'En camino';
      case 'delivered': return 'Entregado';
      case 'cancelled': return 'Cancelado';
      case 'returned': return 'Devuelto';
      default: return status;
    }
  };

  const getStatusProgress = (status: OrderStatus) => {
    const progressMap: Record<OrderStatus, number> = {
      'new': 10,
      'confirmed': 25,
      'preparing': 50,
      'ready': 75,
      'shipped': 90,
      'delivered': 100,
      'cancelled': 0,
      'returned': 0
    };
    return progressMap[status] || 0;
  };

  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    const flow: OrderStatus[] = ['new', 'confirmed', 'preparing', 'ready', 'shipped', 'delivered'];
    const currentIndex = flow.indexOf(currentStatus);
    if (currentIndex === -1 || currentIndex === flow.length - 1) return null;
    return flow[currentIndex + 1];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-[#FF6A00]" />
          <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Gestión de Pedidos</h2>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statusOptions.slice(1).map((status) => {
          const Icon = status.icon;
          const count = orders.filter(o => o.status === status.value).length;
          return (
            <div
              key={status.value}
              className={`p-4 rounded-xl border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${status.color}`} />
                <span className={`text-xs ${darkMode ? 'text-white/60' : 'text-gray-500'}`}>{status.label}</span>
              </div>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{count}</p>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className={`p-4 rounded-xl border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${darkMode ? 'text-white/40' : 'text-gray-400'}`} />
            <input
              type="text"
              placeholder="Buscar por pedido o cliente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-9 pr-4 py-2 rounded-lg text-xs ${darkMode ? 'bg-white/5 text-white border-white/10' : 'bg-gray-50 text-gray-900 border-gray-200'} border focus:outline-none focus:border-[#FF6A00]`}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((status) => {
              const Icon = status.icon;
              return (
                <button
                  key={status.value}
                  onClick={() => setSelectedStatus(status.value as OrderStatus | 'all')}
                  className={`px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                    selectedStatus === status.value
                      ? 'bg-[#FF6A00] text-black'
                      : darkMode
                      ? 'bg-white/10 text-white/70 hover:bg-white/20'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{status.label}</span>
                  {status.value !== 'all' && (
                    <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[9px] ${
                      selectedStatus === status.value ? 'bg-black/20' : darkMode ? 'bg-white/20' : 'bg-gray-300'
                    }`}>
                      {orders.filter(o => o.status === status.value).length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {filteredOrders.map(order => (
          <div
            key={order.id}
            className={`p-4 rounded-xl border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} hover:border-[#FF6A00]/30 transition-all`}
          >
            {/* Order Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{order.id}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </div>
                  <p className={`text-[10px] ${darkMode ? 'text-white/60' : 'text-gray-500'}`}>
                    {order.createdAt}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedOrder(order)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium ${darkMode ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} transition-all flex items-center gap-1`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  Ver detalles
                </button>
                <button className={`p-1.5 rounded-lg ${darkMode ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} transition-all`}>
                  <MessageSquare className="w-3.5 h-3.5" />
                </button>
                <button className={`p-1.5 rounded-lg ${darkMode ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} transition-all`}>
                  <Printer className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Order Progress */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <span className={`text-[10px] ${darkMode ? 'text-white/60' : 'text-gray-500'}`}>Progreso del pedido</span>
                <span className={`text-[10px] font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {getStatusProgress(order.status)}%
                </span>
              </div>
              <div className={`h-1.5 rounded-full ${darkMode ? 'bg-white/10' : 'bg-gray-200'}`}>
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#FF6A00] to-[#FF8A3D] transition-all"
                  style={{ width: `${getStatusProgress(order.status)}%` }}
                />
              </div>
            </div>

            {/* Order Items Preview */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex -space-x-2">
                {order.items.slice(0, 3).map((item, index) => (
                  <img
                    key={item.id}
                    src={item.image}
                    alt={item.name}
                    className="w-10 h-10 rounded-lg border-2 border-[#0A0A0A] object-cover"
                  />
                ))}
                {order.items.length > 3 && (
                  <div className={`w-10 h-10 rounded-lg border-2 border-[#0A0A0A] flex items-center justify-center text-[10px] font-bold ${darkMode ? 'bg-white/10 text-white' : 'bg-gray-200 text-gray-700'}`}>
                    +{order.items.length - 3}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className={`text-xs font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {order.items.map(item => item.name).join(', ')}
                </p>
                <p className={`text-[10px] ${darkMode ? 'text-white/60' : 'text-gray-500'}`}>
                  {order.items.length} {order.items.length === 1 ? 'artículo' : 'artículos'}
                </p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-bold text-[#FF6A00]`}>RD$ {order.total.toLocaleString()}</p>
                <p className={`text-[10px] ${darkMode ? 'text-white/60' : 'text-gray-500'}`}>
                  {order.paymentMethod}
                </p>
              </div>
            </div>

            {/* Customer Info */}
            <div className={`flex items-center gap-2 p-3 rounded-lg ${darkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
              <User className={`w-4 h-4 ${darkMode ? 'text-white/40' : 'text-gray-400'}`} />
              <span className={`text-xs font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{order.customer.name}</span>
              <span className={`text-[10px] ${darkMode ? 'text-white/40' : 'text-gray-400'}`}>•</span>
              <MapPin className={`w-3.5 h-3.5 ${darkMode ? 'text-white/40' : 'text-gray-400'}`} />
              <span className={`text-[10px] ${darkMode ? 'text-white/60' : 'text-gray-500'}`}>{order.customer.address}</span>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/10">
              {getNextStatus(order.status) && (
                <button
                  onClick={() => handleStatusChange(order.id, getNextStatus(order.status)!)}
                  className="flex-1 py-2 rounded-lg bg-[#FF6A00] text-black text-xs font-medium hover:bg-[#e85f00] transition-all flex items-center justify-center gap-1"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  {getStatusLabel(getNextStatus(order.status)!)}
                </button>
              )}
              <button
                onClick={() => handleStatusChange(order.id, 'cancelled')}
                className={`px-3 py-2 rounded-lg text-xs font-medium ${darkMode ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-red-50 text-red-500 hover:bg-red-100'} transition-all`}
              >
                Cancelar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className={`max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 rounded-2xl ${darkMode ? 'bg-[#18191C] border border-white/10' : 'bg-white border border-gray-200'}`}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {selectedOrder.id}
                </h3>
                <p className={`text-xs ${darkMode ? 'text-white/60' : 'text-gray-500'}`}>
                  {selectedOrder.createdAt}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className={`p-2 rounded-lg ${darkMode ? 'hover:bg-white/10 text-white' : 'hover:bg-gray-100 text-gray-700'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer Details */}
            <div className={`p-4 rounded-xl mb-4 ${darkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
              <h4 className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-3 flex items-center gap-2`}>
                <User className="w-4 h-4 text-[#FF6A00]" />
                Información del Cliente
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className={darkMode ? 'text-white/60' : 'text-gray-500'}>Nombre:</span>
                  <span className={darkMode ? 'text-white' : 'text-gray-900'}>{selectedOrder.customer.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className={`w-3 h-3 ${darkMode ? 'text-white/40' : 'text-gray-400'}`} />
                  <span className={darkMode ? 'text-white' : 'text-gray-900'}>{selectedOrder.customer.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className={`w-3 h-3 ${darkMode ? 'text-white/40' : 'text-gray-400'}`} />
                  <span className={darkMode ? 'text-white' : 'text-gray-900'}>{selectedOrder.customer.address}</span>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className={`p-4 rounded-xl mb-4 ${darkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
              <h4 className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-3 flex items-center gap-2`}>
                <Package className="w-4 h-4 text-[#FF6A00]" />
                Artículos del Pedido
              </h4>
              <div className="space-y-3">
                {selectedOrder.items.map(item => (
                  <div key={item.id} className="flex items-center gap-3">
                    <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
                    <div className="flex-1">
                      <p className={`text-xs font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{item.name}</p>
                      <p className={`text-[10px] ${darkMode ? 'text-white/60' : 'text-gray-500'}`}>
                        Cantidad: {item.quantity}
                      </p>
                    </div>
                    <p className={`text-xs font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      RD$ {(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
              <div className={`mt-4 pt-3 border-t ${darkMode ? 'border-white/10' : 'border-gray-200'} flex items-center justify-between`}>
                <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Total</span>
                <span className={`text-lg font-bold text-[#FF6A00]`}>RD$ {selectedOrder.total.toLocaleString()}</span>
              </div>
            </div>

            {/* Shipping Info */}
            <div className={`p-4 rounded-xl mb-4 ${darkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
              <h4 className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-3 flex items-center gap-2`}>
                <Truck className="w-4 h-4 text-[#FF6A00]" />
                Información de Envío
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className={darkMode ? 'text-white/60' : 'text-gray-500'}>Método:</span>
                  <span className={darkMode ? 'text-white' : 'text-gray-900'}>{selectedOrder.shippingMethod}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={darkMode ? 'text-white/60' : 'text-gray-500'}>Pago:</span>
                  <span className={darkMode ? 'text-white' : 'text-gray-900'}>{selectedOrder.paymentMethod}</span>
                </div>
                {selectedOrder.trackingNumber && (
                  <div className="flex items-center gap-2">
                    <span className={darkMode ? 'text-white/60' : 'text-gray-500'}>Guía:</span>
                    <span className={darkMode ? 'text-white' : 'text-gray-900'}>{selectedOrder.trackingNumber}</span>
                  </div>
                )}
                {selectedOrder.estimatedDelivery && (
                  <div className="flex items-center gap-2">
                    <Calendar className={`w-3 h-3 ${darkMode ? 'text-white/40' : 'text-gray-400'}`} />
                    <span className={darkMode ? 'text-white' : 'text-gray-900'}>
                      Entrega estimada: {selectedOrder.estimatedDelivery}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedOrder(null)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-medium ${darkMode ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                Cerrar
              </button>
              <button className="flex-1 py-2.5 rounded-xl bg-[#FF6A00] text-black text-xs font-medium hover:bg-[#e85f00]">
                <FileText className="w-4 h-4 inline mr-1" />
                Imprimir Factura
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
