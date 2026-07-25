import React, { useState, useRef } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Copy, 
  Eye, 
  EyeOff, 
  Star,
  MoreVertical,
  Camera,
  Upload,
  X,
  Save,
  AlertCircle,
  Check,
  Calendar,
  Tag,
  Barcode,
  Box,
  Ruler,
  Scale,
  Shield
} from 'lucide-react';

interface SellerProductsProps {
  darkMode: boolean;
}

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  offerPrice?: number;
  category: string;
  stock: number;
  minStock: number;
  sku: string;
  barcode?: string;
  brand: string;
  status: 'active' | 'inactive' | 'out_of_stock';
  featured: boolean;
  images: string[];
  video?: string;
  variants: ProductVariant[];
  weight?: number;
  dimensions?: string;
  warranty?: string;
  tags: string[];
  createdAt: string;
}

interface ProductVariant {
  id: string;
  name: string;
  type: 'color' | 'size' | 'capacity' | 'other';
  values: string[];
}

export const SellerProducts: React.FC<SellerProductsProps> = ({ darkMode }) => {
  const [products, setProducts] = useState<Product[]>([
    {
      id: '1',
      name: 'iPhone 15 Pro Max 256GB',
      price: 65000,
      originalPrice: 70000,
      offerPrice: 62000,
      category: 'Electrónica',
      stock: 15,
      minStock: 5,
      sku: 'IP15PM-256',
      barcode: '1234567890123',
      brand: 'Apple',
      status: 'active',
      featured: true,
      images: ['https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=300&q=80'],
      variants: [
        { id: 'v1', name: 'Color', type: 'color', values: ['Negro Titanio', 'Blanco Titanio', 'Azul Titanio'] },
        { id: 'v2', name: 'Capacidad', type: 'capacity', values: ['256GB', '512GB', '1TB'] }
      ],
      weight: 0.221,
      dimensions: '159.9 x 76.7 x 8.25 mm',
      warranty: '1 año',
      tags: ['smartphone', 'apple', 'iphone', '5g'],
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      name: 'Laptop HP Pavilion 15',
      price: 45000,
      category: 'Electrónica',
      stock: 8,
      minStock: 3,
      sku: 'HP-PAV-15',
      brand: 'HP',
      status: 'active',
      featured: false,
      images: ['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=300&q=80'],
      variants: [],
      warranty: '2 años',
      tags: ['laptop', 'hp', 'computadora'],
      createdAt: '2024-01-10'
    },
    {
      id: '3',
      name: 'AirPods Pro 2',
      price: 12000,
      originalPrice: 14000,
      category: 'Electrónica',
      stock: 0,
      minStock: 10,
      sku: 'APP-PRO-2',
      brand: 'Apple',
      status: 'out_of_stock',
      featured: false,
      images: ['https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=300&q=80'],
      variants: [],
      warranty: '1 año',
      tags: ['audio', 'apple', 'airpods'],
      createdAt: '2024-01-05'
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const categories = ['Electrónica', 'Ropa', 'Hogar', 'Deportes', 'Automotriz', 'Salud', 'Alimentos', 'Otros'];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || product.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleCreateProduct = () => {
    setEditingProduct(null);
    setShowCreateModal(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowCreateModal(true);
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
    setShowDeleteConfirm(null);
  };

  const handleDuplicateProduct = (product: Product) => {
    const newProduct: Product = {
      ...product,
      id: Date.now().toString(),
      name: `${product.name} (Copia)`,
      status: 'inactive',
      featured: false,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setProducts([newProduct, ...products]);
  };

  const handleToggleStatus = (product: Product) => {
    setProducts(products.map(p => 
      p.id === product.id 
        ? { ...p, status: p.status === 'active' ? 'inactive' : 'active' }
        : p
    ));
  };

  const handleToggleFeatured = (product: Product) => {
    setProducts(products.map(p => 
      p.id === product.id 
        ? { ...p, featured: !p.featured }
        : p
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400';
      case 'inactive': return 'bg-gray-500/20 text-gray-400';
      case 'out_of_stock': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Activo';
      case 'inactive': return 'Inactivo';
      case 'out_of_stock': return 'Agotado';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-[#FF6A00]" />
          <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Gestión de Productos</h2>
        </div>
        <button
          onClick={handleCreateProduct}
          className="px-4 py-2 rounded-xl bg-[#FF6A00] text-black font-medium text-xs flex items-center gap-2 hover:bg-[#e85f00] transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Producto</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className={`p-4 rounded-xl border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
          <p className={`text-xs ${darkMode ? 'text-white/60' : 'text-gray-500'}`}>Total Productos</p>
          <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{products.length}</p>
        </div>
        <div className={`p-4 rounded-xl border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
          <p className={`text-xs ${darkMode ? 'text-white/60' : 'text-gray-500'}`}>Activos</p>
          <p className={`text-2xl font-bold text-green-500`}>{products.filter(p => p.status === 'active').length}</p>
        </div>
        <div className={`p-4 rounded-xl border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
          <p className={`text-xs ${darkMode ? 'text-white/60' : 'text-gray-500'}`}>Agotados</p>
          <p className={`text-2xl font-bold text-red-500`}>{products.filter(p => p.status === 'out_of_stock').length}</p>
        </div>
        <div className={`p-4 rounded-xl border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
          <p className={`text-xs ${darkMode ? 'text-white/60' : 'text-gray-500'}`}>Destacados</p>
          <p className={`text-2xl font-bold text-[#FF6A00]`}>{products.filter(p => p.featured).length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className={`p-4 rounded-xl border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${darkMode ? 'text-white/40' : 'text-gray-400'}`} />
            <input
              type="text"
              placeholder="Buscar por nombre o SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-9 pr-4 py-2 rounded-lg text-xs ${darkMode ? 'bg-white/5 text-white border-white/10' : 'bg-gray-50 text-gray-900 border-gray-200'} border focus:outline-none focus:border-[#FF6A00]`}
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={`px-4 py-2 rounded-lg text-xs ${darkMode ? 'bg-white/5 text-white border-white/10' : 'bg-gray-50 text-gray-900 border-gray-200'} border focus:outline-none focus:border-[#FF6A00]`}
          >
            <option value="all">Todas las categorías</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className={`px-4 py-2 rounded-lg text-xs ${darkMode ? 'bg-white/5 text-white border-white/10' : 'bg-gray-50 text-gray-900 border-gray-200'} border focus:outline-none focus:border-[#FF6A00]`}
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
            <option value="out_of_stock">Agotados</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map(product => (
          <div
            key={product.id}
            className={`p-4 rounded-xl border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} group hover:border-[#FF6A00]/30 transition-all`}
          >
            {/* Product Image */}
            <div className="relative h-40 rounded-lg overflow-hidden mb-3">
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {product.featured && (
                <div className="absolute top-2 left-2 px-2 py-1 rounded-full bg-[#FF6A00] text-black text-[10px] font-bold flex items-center gap-1">
                  <Star className="w-3 h-3 fill-black" />
                  Destacado
                </div>
              )}
              <span className={`absolute top-2 right-2 px-2 py-1 rounded-full text-[10px] font-bold ${getStatusColor(product.status)}`}>
                {getStatusLabel(product.status)}
              </span>
            </div>

            {/* Product Info */}
            <div className="space-y-2">
              <div>
                <h3 className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'} truncate`}>{product.name}</h3>
                <p className={`text-[10px] ${darkMode ? 'text-white/60' : 'text-gray-500'}`}>SKU: {product.sku}</p>
              </div>

              <div className="flex items-center gap-2">
                <p className={`text-lg font-bold text-[#FF6A00]`}>RD$ {product.price.toLocaleString()}</p>
                {product.originalPrice && (
                  <p className={`text-xs line-through ${darkMode ? 'text-white/40' : 'text-gray-400'}`}>
                    RD$ {product.originalPrice.toLocaleString()}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between text-[10px]">
                <span className={darkMode ? 'text-white/60' : 'text-gray-500'}>
                  Stock: {product.stock}
                </span>
                <span className={product.stock <= product.minStock ? 'text-red-500' : 'text-green-500'}>
                  {product.stock <= product.minStock ? '⚠️ Bajo' : '✓ OK'}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                <button
                  onClick={() => handleEditProduct(product)}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium ${darkMode ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} transition-all flex items-center justify-center gap-1`}
                >
                  <Edit className="w-3 h-3" />
                  Editar
                </button>
                <button
                  onClick={() => handleDuplicateProduct(product)}
                  className={`p-2 rounded-lg ${darkMode ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} transition-all`}
                  title="Duplicar"
                >
                  <Copy className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleToggleStatus(product)}
                  className={`p-2 rounded-lg ${darkMode ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} transition-all`}
                  title={product.status === 'active' ? 'Desactivar' : 'Activar'}
                >
                  {product.status === 'active' ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                </button>
                <button
                  onClick={() => handleToggleFeatured(product)}
                  className={`p-2 rounded-lg ${product.featured ? 'bg-[#FF6A00]/20 text-[#FF6A00]' : darkMode ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} transition-all`}
                  title="Destacar"
                >
                  <Star className={`w-3 h-3 ${product.featured ? 'fill-[#FF6A00]' : ''}`} />
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(product.id)}
                  className={`p-2 rounded-lg ${darkMode ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-red-50 text-red-500 hover:bg-red-100'} transition-all`}
                  title="Eliminar"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className={`max-w-sm w-full p-6 rounded-2xl ${darkMode ? 'bg-[#18191C] border border-white/10' : 'bg-white border border-gray-200'}`}>
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>¿Eliminar producto?</h3>
                <p className={`text-sm ${darkMode ? 'text-white/60' : 'text-gray-500'}`}>
                  Esta acción no se puede deshacer.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-medium ${darkMode ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleDeleteProduct(showDeleteConfirm)}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-xs font-medium hover:bg-red-600"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal Placeholder */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className={`max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 rounded-2xl ${darkMode ? 'bg-[#18191C] border border-white/10' : 'bg-white border border-gray-200'}`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className={`p-2 rounded-lg ${darkMode ? 'hover:bg-white/10 text-white' : 'hover:bg-gray-100 text-gray-700'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className={`p-8 rounded-xl border border-dashed ${darkMode ? 'border-white/10 bg-white/5' : 'border-gray-300 bg-gray-50'} text-center`}>
              <Package className={`w-12 h-12 mx-auto mb-3 ${darkMode ? 'text-white/40' : 'text-gray-400'}`} />
              <p className={`text-sm ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
                Formulario de producto completo en construcción...
              </p>
              <p className={`text-xs ${darkMode ? 'text-white/40' : 'text-gray-400'} mt-2`}>
                Incluirá: imágenes múltiples, video, variantes, SKU, código de barras, stock, dimensiones, garantía, etiquetas, programación de publicación, etc.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
