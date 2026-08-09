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
      <div className="relative w-full max-w-3xl bg-surface border border-line rounded-3xl overflow-hidden shadow-2xl my-auto text-text-1 max-h-[90vh] flex flex-col font-body">
        {/* Modal Header */}
        <div className="sticky top-0 z-20 bg-surface/90 backdrop-blur-md p-4 border-b border-line flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-surface-2 text-xs font-semibold text-text-2">
              {(listing.category || '').toUpperCase()}
            </span>
            <span className="text-xs text-text-3">• {listing.condition}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleFavorite(listing.id)}
              className="p-2 rounded-full bg-surface-2 border border-line hover:bg-white/15 text-text-1 transition-all cursor-pointer"
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
            </button>
            <button
              onClick={handleShare}
              className="p-2 rounded-full bg-surface-2 border border-line hover:bg-white/15 text-text-1 transition-all cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-surface-2 hover:bg-white/20 text-text-1 transition-all cursor-pointer ml-2"
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
            <div className="relative aspect-video sm:aspect-[16/10] rounded-2xl overflow-hidden bg-void border border-line">
              <img
                src={listing.images[activeImageIndex] || listing.images[0]}
                alt={listing.title}
                className="w-full h-full object-cover"
              />

              {listing.images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : listing.images.length - 1))}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-void/60 backdrop-blur-md text-text-1 hover:bg-void/80 cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setActiveImageIndex((prev) => (prev < listing.images.length - 1 ? prev + 1 : 0))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-void/60 backdrop-blur-md text-text-1 hover:bg-void/80 cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {listing.isFlashOffer && (
                <span className="absolute top-3 left-3 bg-orange text-[#0A0400] font-extrabold text-xs px-3 py-1 rounded-full shadow-lg">
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
                      activeImageIndex === idx ? 'border-orange scale-105' : 'border-line opacity-60'
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
            <h1 className="text-xl sm:text-2xl font-display font-semibold text-text-1 leading-tight">
              {listing.title}
            </h1>

            <div className="flex flex-wrap items-baseline gap-3 pt-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-orange-soft">
                RD$ {listing.price.toLocaleString()}
              </span>
              {listing.originalPrice && (
                <span className="text-sm text-text-3 line-through">
                  RD$ {listing.originalPrice.toLocaleString()}
                </span>
              )}
              {listing.originalPrice && (
                <span className="px-2 py-0.5 rounded bg-orange-dim text-orange-soft text-xs font-bold border border-orange/30">
                  Ahorras RD$ {(listing.originalPrice - listing.price).toLocaleString()}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-text-2 pt-2 border-t border-line">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-orange-soft" />
                {listing.city} ({listing.sector || 'Zona Central'}) · a {listing.distanceKm} km
              </span>
            </div>
          </div>

          {/* Seller Trust Profile Card */}
          <div className="bg-surface-2 border border-line rounded-2xl p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <img
                src={listing.sellerAvatar}
                alt={listing.sellerName}
                className="w-12 h-12 rounded-full object-cover border-2 border-orange"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-bold text-text-1">{listing.sellerName}</h4>
                  {listing.isVerifiedStore && (
                    <BadgeCheck className="w-4 h-4 text-orange-soft" />
                  )}
                </div>
                <p className="text-xs text-text-2">
                  ⭐ {listing.sellerRating} · {listing.sellerSalesCount} ventas completadas
                </p>
              </div>
            </div>

            {listing.storeId && onSelectStoreById && (
              <button
                onClick={() => onSelectStoreById(listing.storeId!)}
                className="px-3 py-1.5 rounded-full bg-white/10 text-xs font-bold text-text-1 hover:bg-white/20 transition-all"
              >
                Ver Tienda
              </button>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-text-1">Descripción del Artículo</h3>
            <p className="text-xs sm:text-sm text-text-2 leading-relaxed whitespace-pre-line bg-white/5 p-4 rounded-2xl border border-line">
              {listing.description}
            </p>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            {listing.tags.map((tag, i) => (
              <span key={i} className="px-2.5 py-1 rounded-md bg-white/5 border border-line text-[11px] text-text-2">
                #{tag}
              </span>
            ))}
          </div>

          {/* Local Safety Delivery Advice */}
          <div className="bg-orange-dim border border-orange/20 rounded-2xl p-3.5 flex items-start gap-3 text-xs text-text-2">
            <ShieldCheck className="w-5 h-5 text-orange-soft flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-orange-soft block">Consejo de Entrega Segura Zyplaza:</span>
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
        <div className="p-4 bg-surface border-t border-line grid grid-cols-1 xs:grid-cols-2 gap-2.5">
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
            className="py-3 px-4 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-[#0A0400] font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-[#25D366]/20"
          >
            <PhoneCall className="w-4 h-4 fill-[#0A0400] text-[#0A0400]" />
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
            className="py-3 px-4 rounded-2xl bg-gradient-to-r from-orange to-[#e85f00] text-[#0A0400] font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 hover:scale-102 transition-all cursor-pointer shadow-lg shadow-orange/20"
          >
            <MessageSquare className="w-4 h-4 text-[#0A0400]" />
            <span>Chat en la App</span>
          </button>
        </div>
      </div>
    </div>
  );
};
