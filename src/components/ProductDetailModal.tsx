import React, { useState } from 'react';
import { Listing, Store, UserProfileData, Review } from '../types';
import { ReviewSection } from './ReviewSection';
import { 
  X, 
  Heart, 
  MapPin, 
  Share2, 
  MessageSquare, 
  DollarSign, 
  BadgeCheck, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  ChevronLeft, 
  ChevronRight,
  PhoneCall
} from 'lucide-react';

interface ProductDetailModalProps {
  listing: Listing | null;
  reviews?: Review[];
  onAddReview?: (review: Omit<Review, 'id' | 'createdAt'>) => void;
  onClose: () => void;
  onOpenChat: (listing: Listing) => void;
  onSelectStoreById?: (storeId: string) => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  currentUser?: UserProfileData | null;
  onRequestAuth?: (reason?: string, onAuthenticated?: () => void) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  listing,
  reviews = [],
  onAddReview,
  onClose,
  onOpenChat,
  onSelectStoreById,
  isFavorite,
  onToggleFavorite,
  currentUser,
  onRequestAuth,
}) => {
  if (!listing) return null;

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [offerInput, setOfferInput] = useState('');
  const [showOfferBox, setShowOfferBox] = useState(false);
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  const handleShare = () => {
    navigator.clipboard?.writeText?.(window.location.href);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-3xl bg-[#121212] border border-white/10 rounded-3xl overflow-hidden shadow-2xl my-auto text-white max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="sticky top-0 z-20 bg-[#121212]/90 backdrop-blur-md p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-white/10 text-xs font-semibold text-white/80">
              {(listing.category || '').toUpperCase()}
            </span>
            <span className="text-xs text-white/50">• {listing.condition}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleFavorite(listing.id)}
              className="p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/15 text-white transition-all cursor-pointer"
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
            </button>
            <button
              onClick={handleShare}
              className="p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/15 text-white transition-all cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scroll Body */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-6 flex-1">
          {copiedSuccess && (
            <div className="bg-[#2ED573]/20 border border-[#2ED573]/40 text-[#2ED573] p-2.5 rounded-xl text-xs font-bold text-center">
              ¡Enlace copiado al portapapeles!
            </div>
          )}

          {/* Photo Gallery Carousel */}
          <div className="space-y-3">
            <div className="relative aspect-video sm:aspect-[16/10] rounded-2xl overflow-hidden bg-neutral-950 border border-white/10">
              <img
                src={listing.images[activeImageIndex] || listing.images[0]}
                alt={listing.title}
                className="w-full h-full object-cover"
              />

              {listing.images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : listing.images.length - 1))}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black/80 cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setActiveImageIndex((prev) => (prev < listing.images.length - 1 ? prev + 1 : 0))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black/80 cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {listing.isFlashOffer && (
                <span className="absolute top-3 left-3 bg-[#FF6A00] text-black font-extrabold text-xs px-3 py-1 rounded-full shadow-lg">
                  ⚡ OFERTA RELÁMPAGO
                </span>
              )}
            </div>

            {/* Thumbnails */}
            {listing.images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {listing.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 cursor-pointer ${
                      activeImageIndex === idx ? 'border-[#FF6A00] scale-105' : 'border-white/10 opacity-60'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title & Price Header */}
          <div className="space-y-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">
              {listing.title}
            </h1>

            <div className="flex flex-wrap items-baseline gap-3 pt-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#FF8A3D]">
                RD$ {listing.price.toLocaleString()}
              </span>
              {listing.originalPrice && (
                <span className="text-sm text-white/40 line-through">
                  RD$ {listing.originalPrice.toLocaleString()}
                </span>
              )}
              {listing.originalPrice && (
                <span className="px-2 py-0.5 rounded bg-[#FF6A00]/20 text-[#FF8A3D] text-xs font-bold border border-[#FF6A00]/30">
                  Ahorras RD$ {(listing.originalPrice - listing.price).toLocaleString()}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-white/60 pt-2 border-t border-white/10">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-[#FF8A3D]" />
                {listing.city} ({listing.sector || 'Zona Central'}) · a {listing.distanceKm} km
              </span>
            </div>
          </div>

          {/* Seller Trust Profile Card */}
          <div className="bg-neutral-900/90 border border-white/10 rounded-2xl p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <img
                src={listing.sellerAvatar}
                alt={listing.sellerName}
                className="w-12 h-12 rounded-full object-cover border-2 border-[#FF6A00]"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-bold text-white">{listing.sellerName}</h4>
                  {listing.isVerifiedStore && (
                    <BadgeCheck className="w-4 h-4 text-[#FF8A3D]" />
                  )}
                </div>
                <p className="text-xs text-white/50">
                  ⭐ {listing.sellerRating} · {listing.sellerSalesCount} ventas completadas
                </p>
              </div>
            </div>

            {listing.storeId && onSelectStoreById && (
              <button
                onClick={() => onSelectStoreById(listing.storeId!)}
                className="px-3 py-1.5 rounded-full bg-white/10 text-xs font-bold text-white hover:bg-white/20 transition-all"
              >
                Ver Tienda
              </button>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-white">Descripción del Artículo</h3>
            <p className="text-xs sm:text-sm text-white/80 leading-relaxed whitespace-pre-line bg-white/5 p-4 rounded-2xl border border-white/5">
              {listing.description}
            </p>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            {listing.tags.map((tag, i) => (
              <span key={i} className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[11px] text-white/60">
                #{tag}
              </span>
            ))}
          </div>

          {/* Local Safety Delivery Advice */}
          <div className="bg-[#FF6A00]/10 border border-[#FF6A00]/20 rounded-2xl p-3.5 flex items-start gap-3 text-xs text-white/80">
            <ShieldCheck className="w-5 h-5 text-[#FF8A3D] flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-[#FF8A3D] block">Consejo de Entrega Segura Multiplaza:</span>
              <span>Recomendamos reunirse en puntos concurridos (plazas comerciales, estaciones o parqueos iluminados) y verificar el funcionamiento del artículo antes de transferir dinero.</span>
            </div>
          </div>

          {/* Product Reviews Section */}
          {onAddReview && (
            <ReviewSection
              targetId={listing.id}
              targetType="listing"
              title="Opiniones de este Artículo"
              reviews={reviews}
              onAddReview={onAddReview}
              currentUser={currentUser}
              onRequestAuth={onRequestAuth}
            />
          )}
        </div>

        {/* Action Bar Sticky Bottom */}
        <div className="p-4 bg-[#121212] border-t border-white/10 grid grid-cols-1 xs:grid-cols-2 gap-2.5">
          {/* WhatsApp Button */}
          <button
            onClick={() => {
              const action = () => {
                const text = encodeURIComponent(`¡Hola! Vi tu publicación "${listing.title}" en Zyplaza y me interesa.`);
                window.open(`https://wa.me/18095550199?text=${text}`, '_blank');
              };
              if (!currentUser && onRequestAuth) {
                onRequestAuth('para contactar a la tienda por WhatsApp', action);
              } else {
                action();
              }
            }}
            className="py-3 px-4 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-black font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-[#25D366]/20"
          >
            <PhoneCall className="w-4 h-4 fill-black text-black" />
            <span>Contactar WhatsApp</span>
          </button>

          {/* In-app Chat Button */}
          <button
            onClick={() => {
              const action = () => onOpenChat(listing);
              if (!currentUser && onRequestAuth) {
                onRequestAuth('para enviar un mensaje directo en la app', action);
              } else {
                action();
              }
            }}
            className="py-3 px-4 rounded-2xl bg-gradient-to-r from-[#FF6A00] to-[#e85f00] text-black font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 hover:scale-102 transition-all cursor-pointer shadow-lg shadow-[#FF6A00]/20"
          >
            <MessageSquare className="w-4 h-4 text-black" />
            <span>Chat en la App</span>
          </button>
        </div>
      </div>
    </div>
  );
};
