import React, { useState } from 'react';
import { Store, Listing, UserProfileData, Review } from '../types';
import { ReviewSection } from './ReviewSection';
import { 
  X, 
  BadgeCheck, 
  ShieldCheck,
  MapPin,
  Clock,
  MessageSquare,
  Star,
  Package,
  Phone,
  Share2,
  Facebook,
  Instagram,
  Twitter,
  Check,
  ShoppingBag,
  Users,
  PhoneCall,
  UserPlus
} from 'lucide-react';
import { toggleFollowStore } from '../services/firestore';

interface StoreProfileModalProps {
  store: Store | null;
  storeListings: Listing[];
  reviews: Review[];
  onAddReview: (review: Omit<Review, 'id' | 'createdAt'>) => void;
  onClose: () => void;
  onSelectListing: (listing: Listing) => void;
  onOpenChatWithStore: (store: Store) => void;
  currentUser?: UserProfileData | null;
  onRequestAuth?: (reason?: string, onAuthenticated?: () => void) => void;
}

export const StoreProfileModal: React.FC<StoreProfileModalProps> = ({
  store,
  storeListings,
  reviews,
  onAddReview,
  onClose,
  onSelectListing,
  onOpenChatWithStore,
  currentUser,
  onRequestAuth,
}) => {
  const [activeTab, setActiveTab] = useState<'products' | 'reviews'>('products');
  const [copied, setCopied] = useState(false);
  const [followBusy, setFollowBusy] = useState(false);

  const isFollowing = !!(
    store && currentUser?.followingStores && currentUser.followingStores.includes(store.id)
  );

  const handleToggleFollow = () => {
    if (!store) return;
    if (!currentUser) {
      onRequestAuth?.('para seguir a esta tienda');
      return;
    }
    setFollowBusy(true);
    toggleFollowStore(currentUser.id, store.id, isFollowing).finally(() => setFollowBusy(false));
  };

  if (!store) return null;

  const handleShare = async () => {
    const url = `${window.location.origin}${window.location.pathname}?store=${store.id}`;
    const text = `Mira la tienda "${store.name}" en Zyplaza: ${url}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: store.name, text, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      } catch {
        window.prompt('Copia el enlace de la tienda:', url);
      }
    }
  };

  const whatsappDigits = (store.whatsapp || '').replace(/\D/g, '');
  const whatsappIntl = whatsappDigits.length === 10 ? `1${whatsappDigits}` : whatsappDigits;
  const whatsappUrl = whatsappIntl
    ? `https://wa.me/${whatsappIntl}?text=${encodeURIComponent(`¡Hola! Vi tu tienda "${store.name}" en Zyplaza.`)}`
    : null;
  const telUrl = store.phone ? `tel:${store.phone.replace(/[^\d+]/g, '')}` : null;

  const storeReviews = reviews.filter((r) => r.targetId === store.id && r.targetType === 'store');
  const reviewCount = storeReviews.length;
  const avgRating =
    reviewCount > 0
      ? (storeReviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount).toFixed(1)
      : '0.0';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-3xl bg-surface border border-line rounded-3xl overflow-hidden shadow-2xl my-auto text-text-1 max-h-[90vh] flex flex-col font-body">
        {/* Floating Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2.5 rounded-full bg-void/70 backdrop-blur-md text-text-1 hover:bg-void/90 transition-all cursor-pointer z-30 shadow-lg border border-line-strong"
          title="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Share Button */}
        <button
          onClick={handleShare}
          className="absolute bottom-3 right-3 z-10 px-2.5 py-2 rounded-xl bg-void/60 backdrop-blur border border-line text-text-1 hover:bg-void/80 transition-all cursor-pointer flex items-center gap-1.5"
          title="Compartir tienda"
        >
          {copied ? <Check className="w-4 h-4 text-teal" /> : <Share2 className="w-4 h-4" />}
          <span className="text-[10px] font-bold">{copied ? '¡Copiado!' : 'Compartir'}</span>
        </button>

        {/* Single Scrollable Content Body */}
        <div className="overflow-y-auto flex-1 space-y-6 pb-6">
          {/* Cover Photo */}
          <div className="relative h-40 sm:h-52 bg-surface-2 overflow-hidden flex-shrink-0">
            <img src={store.coverImage} alt={store.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-void/40" />
          </div>

          {/* Store Header Info */}
          <div className="px-4 sm:px-6 -mt-12 relative z-10 space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className="flex items-end gap-3">
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl overflow-hidden border-4 border-surface bg-surface-2 shadow-xl flex-shrink-0">
                  <img src={store.logo} alt={store.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-display font-semibold text-text-1">{store.name}</h1>
                    {store.verified && <BadgeCheck className="w-5 h-5 text-orange-soft" />}
                  </div>
                  <p className="text-xs text-orange-soft font-semibold">{store.category}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleToggleFollow}
                  disabled={followBusy}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-60 ${
                    isFollowing
                      ? 'bg-white/15 text-text-1 border border-line-strong'
                      : 'bg-orange text-[#0A0400] hover:scale-105 shadow-md shadow-orange/20'
                  }`}
                >
                  {isFollowing ? <Check className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
                  <span>{isFollowing ? 'Siguiendo' : 'Seguir'}</span>
                </button>

                {whatsappUrl && (
                  <button
                    onClick={() => {
                      const action = () => window.open(whatsappUrl, '_blank');
                      if (!currentUser && onRequestAuth) {
                        onRequestAuth('para contactar a esta tienda por WhatsApp', action);
                      } else {
                        action();
                      }
                    }}
                    className="px-3 py-1.5 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-[#0A0400] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <PhoneCall className="w-3.5 h-3.5 fill-[#0A0400] text-[#0A0400]" />
                    <span>WhatsApp</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    const action = () => onOpenChatWithStore(store);
                    if (!currentUser && onRequestAuth) {
                      onRequestAuth('para enviar un mensaje a la tienda', action);
                    } else {
                      action();
                    }
                  }}
                  className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-text-1 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-orange-soft" />
                  <span>Chat App</span>
                </button>
              </div>
            </div>

            {/* Stats bar */}
            <div className="grid grid-cols-3 gap-2 bg-white/5 border border-line rounded-2xl p-3 text-center">
              <div>
                <span className="block text-base font-extrabold text-text-1">
                  {store.followersCount.toLocaleString()}
                </span>
                <span className="text-[10px] text-text-2">Seguidores</span>
              </div>
              <div>
                <span className="block text-base font-extrabold text-orange-soft">⭐ {avgRating}</span>
                <span className="text-[10px] text-text-2">{reviewCount} opiniones</span>
              </div>
              <div>
                <span className="block text-base font-extrabold text-text-1">{storeListings.length}</span>
                <span className="text-[10px] text-text-2">Artículos Activos</span>
              </div>
            </div>

            {/* Location & Hours info */}
            <div className="space-y-1.5 text-xs text-text-2 bg-white/5 p-3.5 rounded-2xl border border-line">
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-orange-soft" />
                <span>{store.address}, {store.city}</span>
              </p>
              <p className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-soft" />
                <span>{store.openingHours} (Responde en {store.responseTime})</span>
              </p>
              {store.phone && (
                <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-orange-soft" />
                  <a href={telUrl ?? '#'} className="hover:text-orange-soft transition-colors">{store.phone}</a>
                </p>
              )}
              <p className="text-text-2 pt-1 leading-relaxed">{store.description}</p>

              {/* Redes sociales reales de la tienda */}
              {(store.socials?.facebook || store.socials?.instagram || store.socials?.twitter) && (
                <div className="flex items-center gap-2 pt-2 border-t border-line">
                  {store.socials?.facebook && (
                    <a href={store.socials.facebook} target="_blank" rel="noopener noreferrer" title="Facebook"
                      className="p-2 rounded-lg bg-white/5 border border-line text-text-2 hover:text-text-1 hover:bg-white/10 transition-all">
                      <Facebook className="w-4 h-4" />
                    </a>
                  )}
                  {store.socials?.instagram && (
                    <a href={store.socials.instagram} target="_blank" rel="noopener noreferrer" title="Instagram"
                      className="p-2 rounded-lg bg-white/5 border border-line text-text-2 hover:text-text-1 hover:bg-white/10 transition-all">
                      <Instagram className="w-4 h-4" />
                    </a>
                  )}
                  {store.socials?.twitter && (
                    <a href={store.socials.twitter} target="_blank" rel="noopener noreferrer" title="X / Twitter"
                      className="p-2 rounded-lg bg-white/5 border border-line text-text-2 hover:text-text-1 hover:bg-white/10 transition-all">
                      <Twitter className="w-4 h-4" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Store Catalog & Reviews */}
          <div className="px-4 sm:px-6 space-y-6">
            {/* Catalog */}
            <div className="space-y-3">
              <h3 className="text-base font-display font-semibold text-text-1 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-orange-soft" />
                Catálogo de la Tienda ({storeListings.length})
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {storeListings.map(item => (
                  <div
                    key={item.id}
                    onClick={() => onSelectListing(item)}
                    className="group bg-surface-2 border border-line hover:border-orange/50 rounded-2xl overflow-hidden cursor-pointer transition-all hover:-translate-y-1"
                  >
                    <div className="aspect-square overflow-hidden bg-void">
                      <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </div>
                    <div className="p-2.5">
                      <h4 className="text-xs font-bold text-text-1 line-clamp-1">{item.title}</h4>
                      <p className="text-xs font-extrabold text-orange-soft mt-1">
                        RD$ {item.price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Store Opinions Section */}
            <ReviewSection
              targetId={store.id}
              targetType="store"
              title={`Opiniones de ${store.name}`}
              reviews={reviews}
              onAddReview={onAddReview}
              currentUser={currentUser}
              onRequestAuth={onRequestAuth}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
