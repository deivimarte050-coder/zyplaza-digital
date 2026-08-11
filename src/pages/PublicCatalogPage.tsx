import React, { useEffect, useMemo, useState } from 'react';
import {
  Search,
  MapPin,
  Star,
  Package,
  BadgeCheck,
  Share2,
  X,
  Heart,
  PhoneCall,
  ExternalLink,
  ShoppingBag,
  Layers,
} from 'lucide-react';
import { Listing, Store } from '../types';
import {
  subscribeStoreBySlug,
  subscribeListingsByStore,
} from '../services/firestore';
import { ShareCatalogMenu } from '../components/catalog/ShareCatalogMenu';

function getSlugFromPath(): string {
  const match = window.location.pathname.match(/\/catalogo\/([^/]+)/);
  return match ? decodeURIComponent(match[1]) : '';
}

/** Construye la URL de la app principal para acciones que requieren cuenta. */
function buildAppUrl(params: Record<string, string>): string {
  const search = new URLSearchParams(params).toString();
  return `${window.location.origin}/${search ? `?${search}` : ''}`;
}

const ProductCard: React.FC<{
  item: Listing;
  onOpen: () => void;
  onRequireAccount: () => void;
}> = ({ item, onOpen, onRequireAccount }) => {
  const outOfStock = typeof item.stock === 'number' && item.stock <= 0;

  return (
    <div className="group bg-surface border border-line hover:border-orange/50 rounded-2xl overflow-hidden transition-all hover:-translate-y-1 flex flex-col">
      <div className="relative aspect-square bg-surface-2 overflow-hidden cursor-pointer" onClick={onOpen}>
        <img
          src={item.images[0]}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {outOfStock && (
          <div className="absolute inset-0 bg-void/60 flex items-center justify-center">
            <span className="text-[10px] font-extrabold text-white bg-red-500/90 px-2.5 py-1 rounded-full">
              Agotado
            </span>
          </div>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRequireAccount();
          }}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-void/60 backdrop-blur text-white hover:text-red-400 transition-all cursor-pointer"
          title="Guardar en favoritos"
        >
          <Heart className="w-3.5 h-3.5" />
        </button>
        {item.category && (
          <span className="absolute bottom-2 left-2 text-[9px] font-bold uppercase tracking-wide bg-void/60 backdrop-blur text-text-1 px-2 py-1 rounded-full">
            {item.category}
          </span>
        )}
      </div>
      <div className="p-3 flex-1 flex flex-col gap-1.5">
        <h4 className="text-xs font-bold text-text-1 line-clamp-2 min-h-[2rem]">{item.title}</h4>
        <p className="text-sm font-extrabold text-orange-soft">RD$ {item.price.toLocaleString()}</p>
        <div className="mt-auto pt-1.5 flex items-center gap-1.5">
          <button
            onClick={onOpen}
            className="flex-1 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-text-1 text-[10px] font-bold transition-all cursor-pointer"
          >
            Ver producto
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRequireAccount();
            }}
            disabled={outOfStock}
            className="flex-1 py-1.5 rounded-lg bg-orange text-void text-[10px] font-extrabold hover:bg-orange-soft transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
};

const ProductDetailSheet: React.FC<{
  item: Listing;
  store: Store;
  onClose: () => void;
  onRequireAccount: () => void;
}> = ({ item, store, onClose, onRequireAccount }) => {
  const whatsappDigits = (store.whatsapp || '').replace(/\D/g, '');
  const whatsappIntl = whatsappDigits.length === 10 ? `1${whatsappDigits}` : whatsappDigits;
  const whatsappUrl = whatsappIntl
    ? `https://wa.me/${whatsappIntl}?text=${encodeURIComponent(
        `¡Hola! Vi "${item.title}" (RD$ ${item.price.toLocaleString()}) en el catálogo de ${store.name} en Zyplaza.`
      )}`
    : null;

  return (
    <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center animate-fade-in" onClick={onClose}>
      <div
        className="w-full sm:max-w-md bg-surface border border-line rounded-t-3xl sm:rounded-3xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative aspect-square bg-surface-2 flex-shrink-0">
          <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 rounded-full bg-void/70 text-white hover:bg-void/90 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 space-y-3 overflow-y-auto">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wide text-orange-soft">{item.category}</span>
            <h2 className="text-lg font-display font-semibold text-text-1">{item.title}</h2>
            <p className="text-xl font-extrabold text-orange-soft mt-1">RD$ {item.price.toLocaleString()}</p>
          </div>
          {item.description && (
            <p className="text-xs text-text-2 leading-relaxed">{item.description}</p>
          )}
          <div className="flex items-center gap-2 pt-2">
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-[#0A0400] text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                Contactar por WhatsApp
              </a>
            )}
            <button
              onClick={onRequireAccount}
              className="flex-1 py-2.5 rounded-xl bg-orange text-void text-xs font-extrabold hover:bg-orange-soft transition-all cursor-pointer"
            >
              Agregar al carrito
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const PublicCatalogPage: React.FC = () => {
  const [slug] = useState(getSlugFromPath);
  const [store, setStore] = useState<Store | null | undefined>(undefined);
  const [listings, setListings] = useState<Listing[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [selectedItem, setSelectedItem] = useState<Listing | null>(null);
  const [showShare, setShowShare] = useState(false);
  const [accountPrompt, setAccountPrompt] = useState(false);

  useEffect(() => {
    if (!slug) {
      setStore(null);
      return;
    }
    const unsub = subscribeStoreBySlug(slug, setStore);
    return () => unsub();
  }, [slug]);

  useEffect(() => {
    if (!store) return;
    const unsub = subscribeListingsByStore(store.id, setListings);
    return () => unsub();
  }, [store?.id]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    listings.forEach((l) => l.category && set.add(l.category));
    return Array.from(set);
  }, [listings]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return listings.filter((l) => {
      if (category !== 'all' && l.category !== category) return false;
      if (!q) return true;
      return (
        l.title.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q) ||
        l.category.toLowerCase().includes(q)
      );
    });
  }, [listings, searchQuery, category]);

  const featured = useMemo(
    () => [...listings].sort((a, b) => (b.viewsCount ?? 0) - (a.viewsCount ?? 0)).slice(0, 4),
    [listings]
  );

  const handleRequireAccount = () => {
    setAccountPrompt(true);
  };

  const goToApp = (extra: Record<string, string> = {}) => {
    if (!store) return;
    window.location.href = buildAppUrl({ store: store.id, ...extra });
  };

  if (store === undefined) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-orange border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (store === null) {
    return (
      <div className="min-h-screen bg-void flex flex-col items-center justify-center gap-3 px-6 text-center">
        <ShoppingBag className="w-10 h-10 text-text-3" />
        <h1 className="text-lg font-display font-semibold text-text-1">Catálogo no disponible</h1>
        <p className="text-xs text-text-3 max-w-xs">
          Esta tienda no existe o ya no está activa en Zyplaza.
        </p>
        <a
          href="/"
          className="mt-2 px-4 py-2 rounded-xl bg-orange text-void text-xs font-extrabold hover:bg-orange-soft transition-all"
        >
          Ir a Zyplaza
        </a>
      </div>
    );
  }

  const whatsappDigits = (store.whatsapp || '').replace(/\D/g, '');
  const whatsappIntl = whatsappDigits.length === 10 ? `1${whatsappDigits}` : whatsappDigits;
  const whatsappUrl = whatsappIntl
    ? `https://wa.me/${whatsappIntl}?text=${encodeURIComponent(`¡Hola! Vi tu catálogo de "${store.name}" en Zyplaza.`)}`
    : null;

  return (
    <div className="min-h-screen bg-void text-text-1 font-body pb-24">
      {/* Portada */}
      <div className="relative h-44 sm:h-56 bg-surface-2 overflow-hidden">
        {store.coverImage ? (
          <img src={store.coverImage} alt={store.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-orange/30 to-surface" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-void via-void/30 to-transparent" />
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-14 relative z-10">
        {/* Header de tienda */}
        <div className="flex flex-col items-center text-center gap-2">
          <img
            src={store.logo}
            alt={store.name}
            className="w-24 h-24 rounded-3xl object-cover border-4 border-void bg-surface-2 shadow-xl"
          />
          <div className="flex items-center gap-1.5">
            <h1 className="text-xl font-display font-semibold">{store.name}</h1>
            {store.verified && <BadgeCheck className="w-5 h-5 text-orange-soft" />}
          </div>
          <p className="text-xs text-orange-soft font-semibold">{store.category}</p>

          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-text-3">
            <span className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-400" /> {store.rating.toFixed(1)}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> {store.city}
            </span>
            <span className="flex items-center gap-1">
              <Package className="w-3.5 h-3.5" /> {listings.length} productos
            </span>
          </div>

          {store.description && (
            <p className="text-xs text-text-2 max-w-md leading-relaxed mt-1">{store.description}</p>
          )}

          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={() => goToApp()}
              className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-text-1 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Ver tienda
            </button>
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-[#0A0400] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                WhatsApp
              </a>
            )}
            <button
              onClick={() => setShowShare(true)}
              className="px-4 py-2 rounded-full bg-orange/15 border border-orange/30 hover:bg-orange/25 text-orange-soft text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              Compartir
            </button>
          </div>
        </div>

        {/* Buscador */}
        <div className="relative mt-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar productos..."
            className="w-full bg-surface border border-line rounded-xl pl-9 pr-3 py-2.5 text-xs text-text-1 placeholder-text-3 focus:outline-none focus:border-orange"
          />
        </div>

        {/* Categorías */}
        {categories.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar mt-3 pb-1">
            <button
              onClick={() => setCategory('all')}
              className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                category === 'all' ? 'bg-orange text-void' : 'bg-white/5 text-text-2 hover:bg-white/10'
              }`}
            >
              Todos
            </button>
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                  category === c ? 'bg-orange text-void' : 'bg-white/5 text-text-2 hover:bg-white/10'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        {/* Productos destacados */}
        {!searchQuery && category === 'all' && featured.length > 0 && (
          <div className="mt-6 space-y-3">
            <h2 className="text-sm font-display font-semibold flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-orange-soft" />
              Productos destacados
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {featured.map((item) => (
                <ProductCard
                  key={item.id}
                  item={item}
                  onOpen={() => setSelectedItem(item)}
                  onRequireAccount={handleRequireAccount}
                />
              ))}
            </div>
          </div>
        )}

        {/* Todos los productos */}
        <div className="mt-6 space-y-3">
          <h2 className="text-sm font-display font-semibold">
            {searchQuery || category !== 'all' ? `Resultados (${filtered.length})` : `Todos los productos (${listings.length})`}
          </h2>

          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line-strong p-10 text-center">
              <p className="text-sm font-bold text-text-2">Sin productos que coincidan</p>
              <p className="text-xs text-text-3 mt-1">Prueba con otra búsqueda o categoría.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {filtered.map((item) => (
                <ProductCard
                  key={item.id}
                  item={item}
                  onOpen={() => setSelectedItem(item)}
                  onRequireAccount={handleRequireAccount}
                />
              ))}
            </div>
          )}
        </div>

        <p className="text-center text-[10px] text-text-3 mt-10">Catálogo creado con Zyplaza</p>
      </div>

      {/* Botón flotante de compartir */}
      <button
        onClick={() => setShowShare(true)}
        className="fixed bottom-5 right-5 z-40 w-14 h-14 rounded-full bg-orange text-void shadow-2xl shadow-orange/30 flex items-center justify-center hover:scale-105 transition-transform cursor-pointer"
        title="Compartir catálogo"
      >
        <Share2 className="w-5 h-5" />
      </button>

      {selectedItem && (
        <ProductDetailSheet
          item={selectedItem}
          store={store}
          onClose={() => setSelectedItem(null)}
          onRequireAccount={handleRequireAccount}
        />
      )}

      {showShare && (
        <ShareCatalogMenu
          url={window.location.href}
          storeName={store.name}
          productCount={listings.length}
          onClose={() => setShowShare(false)}
        />
      )}

      {accountPrompt && (
        <div
          className="fixed inset-0 z-[90] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setAccountPrompt(false)}
        >
          <div
            className="bg-surface border border-line rounded-2xl p-5 w-full max-w-sm space-y-4 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-sm font-extrabold text-text-1">Inicia sesión para continuar</h3>
            <p className="text-xs text-text-2">
              Necesitas una cuenta gratuita en Zyplaza para guardar favoritos, agregar al carrito o chatear con la tienda.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setAccountPrompt(false)}
                className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-text-1 text-xs font-bold transition-all cursor-pointer"
              >
                Ahora no
              </button>
              <button
                onClick={() => goToApp({ auth: '1' })}
                className="flex-1 py-2.5 rounded-xl bg-orange text-void text-xs font-extrabold hover:bg-orange-soft transition-all cursor-pointer"
              >
                Crear cuenta / Entrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
