import React, { useState } from 'react';
import { Review, UserProfileData } from '../types';
import { Star, MessageSquarePlus, Send, User } from 'lucide-react';

interface ReviewSectionProps {
  targetId: string;
  targetType: 'store' | 'listing';
  title?: string;
  reviews: Review[];
  onAddReview: (review: Omit<Review, 'id' | 'createdAt'>) => void;
  currentUser?: UserProfileData | null;
  onRequestAuth?: (reason?: string, onAuthenticated?: () => void) => void;
}

export const ReviewSection: React.FC<ReviewSectionProps> = ({
  targetId,
  targetType,
  title = 'Opiniones y Calificaciones',
  reviews,
  onAddReview,
  currentUser,
  onRequestAuth,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittedMessage, setSubmittedMessage] = useState(false);

  const itemReviews = reviews.filter(
    (r) => r.targetId === targetId && r.targetType === targetType
  );

  const reviewCount = itemReviews.length;
  const avgRating =
    reviewCount > 0
      ? (itemReviews.reduce((acc, r) => acc + r.rating, 0) / reviewCount).toFixed(1)
      : '0.0';

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    const doPublish = () => {
      onAddReview({
        targetId,
        targetType,
        authorName: currentUser?.name || 'Usuario de Zyplaza',
        authorAvatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        rating,
        comment: comment.trim(),
      });
      setComment('');
      setRating(5);
      setShowForm(false);
      setSubmittedMessage(true);
      setTimeout(() => setSubmittedMessage(false), 3000);
    };

    if (!currentUser && onRequestAuth) {
      onRequestAuth('para publicar tu opinión y calificación', doPublish);
    } else {
      doPublish();
    }
  };

  return (
    <div className="space-y-4 bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div>
          <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
            <Star className="w-4 h-4 fill-[#FF8A3D] text-[#FF8A3D]" />
            <span>{title}</span>
          </h3>
          <div className="flex items-center gap-2 mt-1 text-xs">
            <span className="font-black text-lg text-[#FF8A3D]">⭐ {avgRating}</span>
            <span className="text-white/50">({reviewCount} {reviewCount === 1 ? 'opinión' : 'opiniones'})</span>
          </div>
        </div>

        <button
          onClick={() => {
            if (!currentUser && onRequestAuth) {
              onRequestAuth('para calificar y publicar tu opinión', () => setShowForm(!showForm));
            } else {
              setShowForm(!showForm);
            }
          }}
          className="px-3.5 py-2 rounded-xl bg-[#FF6A00] text-black font-extrabold text-xs hover:scale-105 transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
        >
          <MessageSquarePlus className="w-4 h-4 text-black" />
          <span>{showForm ? 'Cancelar' : 'Escribir Opinión'}</span>
        </button>
      </div>

      {/* Success Notification */}
      {submittedMessage && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 rounded-xl text-xs font-bold animate-fade-in">
          ¡Gracias! Tu opinión y calificación con estrellas se han publicado con éxito.
        </div>
      )}

      {/* Write Review Form */}
      {showForm && (
        <form onSubmit={handleFormSubmit} className="bg-neutral-900 border border-[#FF6A00]/40 rounded-2xl p-4 space-y-3 animate-fade-in">
          <h4 className="text-xs font-bold text-white">Califica con Estrellas</h4>
          
          {/* Interactive Star Picker */}
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((starIndex) => (
              <button
                type="button"
                key={starIndex}
                onClick={() => setRating(starIndex)}
                className="p-1 hover:scale-125 transition-transform cursor-pointer"
              >
                <Star
                  className={`w-6 h-6 ${
                    starIndex <= rating
                      ? 'fill-[#FF8A3D] text-[#FF8A3D]'
                      : 'text-white/30 fill-transparent'
                  }`}
                />
              </button>
            ))}
            <span className="text-xs font-bold text-[#FF8A3D] ml-2">{rating} / 5 estrellas</span>
          </div>

          {/* Comment input */}
          <div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Escribe tu opinión honesta (ej: Excelente servicio, rápida entrega y producto impecable)..."
              rows={3}
              className="w-full bg-black/60 border border-white/15 rounded-xl p-3 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#FF6A00]"
              required
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#FF6A00] text-black font-extrabold text-xs hover:bg-[#ff7d1c] transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Send className="w-3.5 h-3.5 text-black" />
              <span>Publicar Opinión</span>
            </button>
          </div>
        </form>
      )}

      {/* Reviews List */}
      <div className="space-y-3 pt-1">
        {itemReviews.length === 0 ? (
          <div className="text-center py-6 text-xs text-white/50 space-y-1">
            <p className="font-semibold text-white/70">Aún no hay opiniones escritas.</p>
            <p>Sé el primero en calificar con estrellas y contar tu experiencia.</p>
          </div>
        ) : (
          itemReviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-neutral-900/80 border border-white/10 rounded-2xl p-3.5 space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {rev.authorAvatar ? (
                    <img
                      src={rev.authorAvatar}
                      alt={rev.authorName}
                      className="w-7 h-7 rounded-full object-cover border border-[#FF6A00]/50"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white/70">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                  <div>
                    <span className="font-bold text-white block leading-tight">{rev.authorName}</span>
                    <span className="text-[10px] text-white/40">{rev.createdAt}</span>
                  </div>
                </div>

                {/* Stars display */}
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-3.5 h-3.5 ${
                        s <= rev.rating
                          ? 'fill-[#FF8A3D] text-[#FF8A3D]'
                          : 'text-white/20 fill-transparent'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <p className="text-white/80 pl-9 leading-relaxed">{rev.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
