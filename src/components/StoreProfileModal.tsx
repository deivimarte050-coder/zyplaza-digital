import React, { useState } from 'react';
import { Store, Listing, UserProfileData, Review } from '../types';
import { ReviewSection } from './ReviewSection';
import { 
  X, 
  BadgeCheck, 
  Star, 
  MapPin, 
  Clock, 
  MessageSquare, 
  UserPlus, 
  Check, 
  ShoppingBag, 
  Users,
  PhoneCall
} from 'lucide-react';

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
  if (!store) return null;

  const [isFollowing, setIsFollowing] = useState(false);

  const storeReviews = reviews.filter((r) => r.targetId === store.id && r.targetType === 'store');
  const reviewCount = storeReviews.length;
  const avgRating =
    reviewCount > 0
      ? (storeReviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount).toFixed(1)
      : '0.0';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-3xl bg-[#121212] border border-white/10 rounded-3xl overflow-hidden shadow-2xl my-auto text-white max-h-[90vh] flex flex-col">
        {/* Floating Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2.5 rounded-full bg-black/70 backdrop-blur-md text-white hover:bg-black/90 transition-all cursor-pointer z-30 shadow-lg border border-white/20"
          title="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Single Scrollable Content Body */}
        <div className="overflow-y-auto flex-1 space-y-6 pb-6">
          {/* Cover Photo */}
          <div className="relative h-40 sm:h-52 bg-neutral-900 overflow-hidden flex-shrink-0">
            <img src={store.coverImage} alt={store.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-black/40" />
          </div>

          {/* Store Header Info */}
          <div className="px-4 sm:px-6 -mt-12 relative z-10 space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className="flex items-end gap-3">
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl overflow-hidden border-4 border-[#121212] bg-neutral-900 shadow-xl flex-shrink-0">
                  <img src={store.logo} alt={store.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-extrabold text-white">{store.name}</h1>
                    {store.verified && <BadgeCheck className="w-5 h-5 text-[#FF8A3D]" />}
                  </div>
                  <p className="text-xs text-[#FF8A3D] font-semibold">{store.category}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setIsFollowing(!isFollowing)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    isFollowing
                      ? 'bg-white/15 text-white border border-white/20'
                      : 'bg-[#FF6A00] text-black hover:scale-105 shadow-md shadow-[#FF6A00]/20'
                  }`}
                >
                  {isFollowing ? <Check className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
                  <span>{isFollowing ? 'Siguiendo' : 'Seguir'}</span>
                </button>

                <button
                  onClick={() => {
                    const action = () => {
                      const text = encodeURIComponent(`¡Hola! Vi tu tienda "${store.name}" en Zyplaza y quisiera hacer una consulta.`);
                      window.open(`https://wa.me/18095550199?text=${text}`, '_blank');
                    };
                    if (!currentUser && onRequestAuth) {
                      onRequestAuth('para contactar a esta tienda por WhatsApp', action);
                    } else {
                      action();
                    }
                  }}
                  className="px-3 py-1.5 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-black text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <PhoneCall className="w-3.5 h-3.5 fill-black text-black" />
                  <span>WhatsApp</span>
                </button>

                <button
                  onClick={() => {
                    const action = () => onOpenChatWithStore(store);
                    if (!currentUser && onRequestAuth) {
                      onRequestAuth('para enviar un mensaje a la tienda', action);
                    } else {
                      action();
                    }
                  }}
                  className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-[#FF8A3D]" />
                  <span>Chat App</span>
                </button>
              </div>
            </div>

            {/* Stats bar */}
            <div className="grid grid-cols-3 gap-2 bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
              <div>
                <span className="block text-base font-extrabold text-white">
                  {(store.followersCount + (isFollowing ? 1 : 0)).toLocaleString()}
                </span>
                <span className="text-[10px] text-white/50">Seguidores</span>
              </div>
              <div>
                <span className="block text-base font-extrabold text-[#FF8A3D]">⭐ {avgRating}</span>
                <span className="text-[10px] text-white/50">{reviewCount} opiniones</span>
              </div>
              <div>
                <span className="block text-base font-extrabold text-white">{storeListings.length}</span>
                <span className="text-[10px] text-white/50">Artículos Activos</span>
              </div>
            </div>

            {/* Location & Hours info */}
            <div className="space-y-1.5 text-xs text-white/70 bg-white/5 p-3.5 rounded-2xl border border-white/5">
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#FF8A3D]" />
                <span>{store.address}, {store.city}</span>
              </p>
              <p className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#FF8A3D]" />
                <span>{store.openingHours} (Responde en {store.responseTime})</span>
              </p>
              <p className="text-white/60 pt-1 leading-relaxed">{store.description}</p>
            </div>
          </div>

          {/* Store Catalog & Reviews */}
          <div className="px-4 sm:px-6 space-y-6">
            {/* Catalog */}
            <div className="space-y-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-[#FF8A3D]" />
                Catálogo de la Tienda ({storeListings.length})
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {storeListings.map(item => (
                  <div
                    key={item.id}
                    onClick={() => onSelectListing(item)}
                    className="group bg-neutral-900 border border-white/10 hover:border-[#FF6A00]/50 rounded-2xl overflow-hidden cursor-pointer transition-all hover:-translate-y-1"
                  >
                    <div className="aspect-square overflow-hidden bg-neutral-950">
                      <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </div>
                    <div className="p-2.5">
                      <h4 className="text-xs font-bold text-white line-clamp-1">{item.title}</h4>
                      <p className="text-xs font-extrabold text-[#FF8A3D] mt-1">
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
