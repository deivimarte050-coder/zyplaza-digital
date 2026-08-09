import React, { useState } from 'react';
import { Conversation, ChatMessage } from '../types';
import { 
  Send, 
  Sparkles, 
  DollarSign, 
  MapPin, 
  CheckCheck, 
  X, 
  ChevronLeft, 
  BadgeCheck, 
  MessageSquare,
  ShieldAlert
} from 'lucide-react';

interface ChatDrawerProps {
  conversations: Conversation[];
  messagesMap: Record<string, ChatMessage[]>;
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onSendMessage: (conversationId: string, text: string, isOffer?: boolean, offerAmount?: number) => void;
  onClose: () => void;
  currentUserId: string;
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({
  conversations,
  messagesMap,
  activeConversationId,
  onSelectConversation,
  onSendMessage,
  onClose,
  currentUserId,
}) => {
  const [inputText, setInputText] = useState('');
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [customOfferAmount, setCustomOfferAmount] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [loadingAi, setLoadingAi] = useState(false);

  const activeConv = conversations.find(c => c.id === activeConversationId) || conversations[0];
  const activeMessages = activeConv ? (messagesMap[activeConv.id] || []) : [];

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !activeConv) return;
    onSendMessage(activeConv.id, inputText.trim());
    setInputText('');
  };

  const handleSendOfferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customOfferAmount || !activeConv) return;
    const amount = parseFloat(customOfferAmount);
    onSendMessage(
      activeConv.id,
      `He enviado una oferta formal por RD$ ${amount.toLocaleString()}`,
      true,
      amount
    );
    setShowOfferModal(false);
    setCustomOfferAmount('');
  };

  // Generate Gemini AI smart reply suggestions
  const handleGenerateAiReplies = async () => {
    if (!activeConv) return;
    setLoadingAi(true);
    const lastMsg = activeMessages[activeMessages.length - 1]?.text || 'Hola';
    try {
      const res = await fetch('/api/ai/chat-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lastMessage: lastMsg,
          listingTitle: activeConv.listingTitle,
          listingPrice: activeConv.listingPrice,
          userRole: activeConv.buyerId === currentUserId ? 'buyer' : 'seller',
        }),
      });
      const data = await res.json();
      if (data.suggestions && Array.isArray(data.suggestions)) {
        setAiSuggestions(data.suggestions);
      }
    } catch (err) {
      console.error('Error fetching AI chat replies:', err);
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-4xl bg-surface border border-line rounded-3xl overflow-hidden shadow-2xl my-auto text-text-1 h-[85vh] flex flex-col md:flex-row font-body">
        
        {/* Left Sidebar: Conversations List */}
        <div className={`w-full md:w-80 border-r border-line bg-void flex flex-col ${activeConversationId ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-line flex items-center justify-between">
            <h2 className="text-base font-display font-semibold text-text-1 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-orange-soft" />
              Mensajes
            </h2>
            <button onClick={onClose} className="md:hidden p-1.5 text-text-2 hover:text-text-1">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {conversations.map(conv => {
              const iAmBuyer = conv.buyerId === currentUserId;
              const otherName = iAmBuyer ? conv.sellerName : conv.buyerName;
              const otherAvatar = iAmBuyer ? conv.sellerAvatar : conv.buyerAvatar;
              const myUnread = conv.unreadCounts[currentUserId] ?? 0;

              return (
                <div
                  key={conv.id}
                  onClick={() => onSelectConversation(conv.id)}
                  className={`flex items-center gap-2.5 p-3 cursor-pointer border-b border-line hover:bg-white/5 transition-all ${
                    conv.id === activeConversationId ? 'bg-white/5 border-l-2 border-l-orange' : ''
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <img src={otherAvatar} alt={otherName} className="w-10 h-10 rounded-full object-cover border border-line" />
                    {myUnread > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-orange text-[#0A0400] text-[9px] font-black flex items-center justify-center">
                        {myUnread}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <p className="text-xs font-bold text-text-1 truncate flex items-center gap-1">
                        {otherName}
                        {iAmBuyer && conv.isVerifiedSeller && <ShieldAlert className="w-3 h-3 text-orange-soft flex-shrink-0" />}
                      </p>
                      <span className="text-[9px] text-text-3 flex-shrink-0 ml-1">{conv.lastMessageTime}</span>
                    </div>
                    <p className="text-[10px] text-text-2 truncate mt-0.5">{conv.listingTitle}</p>
                    <p className="text-[11px] text-text-3 truncate mt-0.5">{conv.lastMessage}</p>
                  </div>
                </div>
              );
            })}
            {conversations.length === 0 && (
              <div className="p-6 text-center text-text-3 text-xs">
                No tienes conversaciones abiertas.
              </div>
            )}
          </div>
        </div>

        {/* Right Main Chat Thread */}
        {activeConv ? (
          <div className={`flex-1 flex flex-col bg-surface ${!activeConversationId ? 'hidden md:flex' : 'flex'}`}>
            {/* Top Bar */}
            <div className="p-3.5 border-b border-line bg-surface/90 backdrop-blur-md flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onSelectConversation('')}
                  className="md:hidden p-1.5 text-text-2 hover:text-text-1"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="relative flex-shrink-0">
                  <img
                    src={activeConv.buyerId === currentUserId ? activeConv.sellerAvatar : activeConv.buyerAvatar}
                    alt=""
                    className="w-9 h-9 rounded-full object-cover border border-line"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-text-1 truncate flex items-center gap-1">
                    {activeConv.buyerId === currentUserId ? activeConv.sellerName : activeConv.buyerName}
                    {activeConv.buyerId === currentUserId && activeConv.isVerifiedSeller && (
                      <ShieldAlert className="w-3.5 h-3.5 text-orange-soft flex-shrink-0" />
                    )}
                  </p>
                  <p className="text-[10px] text-text-2 truncate">{activeConv.listingTitle}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowOfferModal(true)}
                  className="px-3 py-1.5 rounded-full bg-orange-dim border border-orange/40 text-orange-soft text-xs font-bold hover:bg-orange-dim/80 transition-all flex items-center gap-1 cursor-pointer"
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Hacer Oferta</span>
                </button>

                <button onClick={onClose} className="p-2 text-text-2 hover:text-text-1 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Product Item Info Header Bar */}
            <div className="px-4 py-2 bg-white/5 border-b border-line flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 truncate">
                <img src={activeConv.listingImage} alt="" className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                <div className="truncate">
                  <span className="font-bold text-text-1 block truncate">{activeConv.listingTitle}</span>
                  <span className="text-orange-soft font-extrabold text-[11px]">
                    RD$ {activeConv.listingPrice.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Chat Messages Feed */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {activeMessages.map((m) => {
                const isMe = m.senderId === currentUserId;
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl p-3 text-xs sm:text-sm leading-relaxed space-y-1.5 ${
                        isMe
                          ? 'bg-gradient-to-r from-orange to-[#e85f00] text-[#0A0400] font-semibold rounded-br-none shadow-md'
                          : 'bg-surface-2 text-text-1 rounded-bl-none border border-line'
                      }`}
                    >
                      <p>{m.text}</p>

                      {m.isOffer && (
                        <div className="p-2 rounded-xl bg-black/20 border border-black/10 font-bold text-xs space-y-1">
                          <span>Oferta Formal: RD$ {m.offerAmount?.toLocaleString()}</span>
                          {m.offerStatus === 'pending' && (
                            <span className="block text-[10px] text-amber-300">Esperando respuesta del vendedor</span>
                          )}
                          {m.offerStatus === 'accepted' && (
                            <span className="block text-[10px] text-teal">¡Oferta aceptada por el vendedor!</span>
                          )}
                        </div>
                      )}

                      {m.meetingPoint && (
                        <div className="flex items-center gap-1.5 pt-1 border-t border-black/10 text-[11px] font-bold">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>Punto de Encuentro: {m.meetingPoint}</span>
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-text-3 mt-1 px-1">{m.timestamp}</span>
                  </div>
                );
              })}
            </div>

            {/* AI Smart Replies Suggestions Bar */}
            <div className="px-4 py-2 bg-surface-2/80 border-t border-line space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-purple-300 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  Sugerencias Rápidas de la IA
                </span>
                <button
                  type="button"
                  onClick={handleGenerateAiReplies}
                  disabled={loadingAi}
                  className="text-[10px] font-bold text-orange-soft hover:underline cursor-pointer"
                >
                  {loadingAi ? 'Generando...' : 'Generar más'}
                </button>
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {(aiSuggestions.length > 0
                  ? aiSuggestions
                  : ['¿Sigue disponible?', '¿Aceptas RD$ ' + Math.round(activeConv.listingPrice * 0.9) + '?', '¿Dónde nos podemos reunir?']
                ).map((sug, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setInputText(sug)}
                    className="px-2.5 py-1 rounded-full bg-white/5 border border-line hover:border-orange-soft hover:bg-white/10 text-[11px] text-text-2 whitespace-nowrap cursor-pointer transition-all"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSend} className="p-3 border-t border-line bg-surface flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Escribe tu mensaje o pregunta..."
                className="flex-1 bg-white/5 border border-line rounded-full px-4 py-2.5 text-xs sm:text-sm text-text-1 placeholder-text-3 focus:outline-none focus:border-orange-soft"
              />
              <button
                type="submit"
                className="p-2.5 rounded-full bg-orange text-[#0A0400] hover:scale-105 transition-all shadow-md shadow-orange/20 cursor-pointer"
              >
                <Send className="w-4 h-4 text-[#0A0400]" />
              </button>
            </form>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8 text-center text-text-3">
            <p className="text-xs sm:text-sm">Selecciona una conversación para ver los mensajes.</p>
          </div>
        )}
      </div>

      {/* Offer Modal Overlay */}
      {showOfferModal && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-surface border border-line rounded-2xl p-5 w-full max-w-sm space-y-4 text-text-1 font-body">
            <div className="flex justify-between items-center">
              <h3 className="font-display font-semibold text-sm flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-orange-soft" />
                Hacer Oferta de Compra
              </h3>
              <button onClick={() => setShowOfferModal(false)} className="text-text-2 hover:text-text-1">✕</button>
            </div>

            <p className="text-xs text-text-2">
              Precio publicado: <span className="font-bold text-text-1">RD$ {activeConv?.listingPrice.toLocaleString()}</span>
            </p>

            <form onSubmit={handleSendOfferSubmit} className="space-y-3">
              <input
                type="number"
                value={customOfferAmount}
                onChange={(e) => setCustomOfferAmount(e.target.value)}
                placeholder="Monto de tu oferta en RD$"
                required
                className="w-full bg-white/5 border border-line rounded-xl px-3.5 py-2 text-xs text-text-1 focus:outline-none focus:border-orange-soft"
              />
              <button
                type="submit"
                className="w-full py-2.5 rounded-full bg-orange text-[#0A0400] font-extrabold text-xs cursor-pointer hover:scale-105 transition-all"
              >
                Enviar Oferta
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
