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
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({
  conversations,
  messagesMap,
  activeConversationId,
  onSelectConversation,
  onSendMessage,
  onClose,
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
          userRole: 'buyer',
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
      <div className="relative w-full max-w-4xl bg-[#121212] border border-white/10 rounded-3xl overflow-hidden shadow-2xl my-auto text-white h-[85vh] flex flex-col md:flex-row">
        
        {/* Left Sidebar: Conversations List */}
        <div className={`w-full md:w-80 border-r border-white/10 bg-[#0E0E0E] flex flex-col ${activeConversationId ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#FF8A3D]" />
              Mensajes
            </h2>
            <button onClick={onClose} className="md:hidden p-1.5 text-white/60 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="overflow-y-auto flex-1 divide-y divide-white/5">
            {conversations.map(conv => (
              <div
                key={conv.id}
                onClick={() => onSelectConversation(conv.id)}
                className={`p-3.5 flex items-center gap-3 cursor-pointer transition-colors ${
                  activeConv?.id === conv.id ? 'bg-[#FF6A00]/15 border-l-4 border-[#FF6A00]' : 'hover:bg-white/5'
                }`}
              >
                <img
                  src={conv.sellerAvatar}
                  alt={conv.sellerName}
                  className="w-11 h-11 rounded-full object-cover border border-white/10 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white truncate flex items-center gap-1">
                      {conv.sellerName}
                      {conv.isVerifiedSeller && <BadgeCheck className="w-3.5 h-3.5 text-[#FF8A3D]" />}
                    </span>
                    <span className="text-[10px] text-white/40">{conv.lastMessageTime}</span>
                  </div>
                  <p className="text-xs text-white/60 truncate mt-0.5">{conv.lastMessage}</p>
                  <p className="text-[10px] text-[#FF8A3D] font-semibold truncate mt-0.5">
                    {conv.listingTitle}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Main Chat Thread */}
        {activeConv ? (
          <div className={`flex-1 flex flex-col bg-[#121212] ${!activeConversationId ? 'hidden md:flex' : 'flex'}`}>
            {/* Top Bar */}
            <div className="p-3.5 border-b border-white/10 bg-[#121212]/90 backdrop-blur-md flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onSelectConversation('')}
                  className="md:hidden p-1.5 text-white/60 hover:text-white"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <img
                  src={activeConv.sellerAvatar}
                  alt={activeConv.sellerName}
                  className="w-9 h-9 rounded-full object-cover border border-[#FF6A00]"
                />
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1">
                    {activeConv.sellerName}
                    {activeConv.isVerifiedSeller && <BadgeCheck className="w-3.5 h-3.5 text-[#FF8A3D]" />}
                  </h3>
                  <span className="text-[10px] text-[#2ED573]">● En línea en San Pedro</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowOfferModal(true)}
                  className="px-3 py-1.5 rounded-full bg-[#FF6A00]/20 border border-[#FF6A00]/40 text-[#FF8A3D] text-xs font-bold hover:bg-[#FF6A00]/30 transition-all flex items-center gap-1 cursor-pointer"
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Hacer Oferta</span>
                </button>

                <button onClick={onClose} className="p-2 text-white/60 hover:text-white cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Product Item Info Header Bar */}
            <div className="px-4 py-2 bg-white/5 border-b border-white/5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 truncate">
                <img src={activeConv.listingImage} alt="" className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                <div className="truncate">
                  <span className="font-bold text-white block truncate">{activeConv.listingTitle}</span>
                  <span className="text-[#FF8A3D] font-extrabold text-[11px]">
                    RD$ {activeConv.listingPrice.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Chat Messages Feed */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {activeMessages.map((m) => {
                const isMe = m.sender === 'user';
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl p-3 text-xs sm:text-sm leading-relaxed space-y-1.5 ${
                        isMe
                          ? 'bg-gradient-to-r from-[#FF6A00] to-[#e85f00] text-black font-semibold rounded-br-none shadow-md'
                          : 'bg-neutral-800 text-white rounded-bl-none border border-white/10'
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
                            <span className="block text-[10px] text-emerald-300">¡Oferta aceptada por el vendedor!</span>
                          )}
                        </div>
                      )}

                      {m.meetingPoint && (
                        <div className="flex items-center gap-1.5 pt-1 border-t border-black/10 text-[11px] font-bold">
                          <MapPin className="w-3.5 h-3.5 text-black" />
                          <span>Punto de Encuentro: {m.meetingPoint}</span>
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-white/40 mt-1 px-1">{m.timestamp}</span>
                  </div>
                );
              })}
            </div>

            {/* AI Smart Replies Suggestions Bar */}
            <div className="px-4 py-2 bg-neutral-900/80 border-t border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-purple-300 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  Sugerencias Rápidas de la IA
                </span>
                <button
                  type="button"
                  onClick={handleGenerateAiReplies}
                  disabled={loadingAi}
                  className="text-[10px] font-bold text-[#FF8A3D] hover:underline cursor-pointer"
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
                    className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 hover:border-[#FF8A3D] hover:bg-white/10 text-[11px] text-white/80 whitespace-nowrap cursor-pointer transition-all"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSend} className="p-3 border-t border-white/10 bg-[#121212] flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Escribe tu mensaje o pregunta..."
                className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2.5 text-xs sm:text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#FF8A3D]"
              />
              <button
                type="submit"
                className="p-2.5 rounded-full bg-[#FF6A00] text-black hover:scale-105 transition-all shadow-md shadow-[#FF6A00]/20 cursor-pointer"
              >
                <Send className="w-4 h-4 text-black" />
              </button>
            </form>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8 text-center text-white/40">
            <p className="text-xs sm:text-sm">Selecciona una conversación para chatear con el vendedor.</p>
          </div>
        )}
      </div>

      {/* Offer Modal Overlay */}
      {showOfferModal && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#181818] border border-white/10 rounded-2xl p-5 w-full max-w-sm space-y-4 text-white">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-sm flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-[#FF8A3D]" />
                Hacer Oferta de Compra
              </h3>
              <button onClick={() => setShowOfferModal(false)} className="text-white/50 hover:text-white">✕</button>
            </div>

            <p className="text-xs text-white/60">
              Precio publicado: <span className="font-bold text-white">RD$ {activeConv?.listingPrice.toLocaleString()}</span>
            </p>

            <form onSubmit={handleSendOfferSubmit} className="space-y-3">
              <input
                type="number"
                value={customOfferAmount}
                onChange={(e) => setCustomOfferAmount(e.target.value)}
                placeholder="Monto de tu oferta en RD$"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#FF8A3D]"
              />
              <button
                type="submit"
                className="w-full py-2.5 rounded-full bg-[#FF6A00] text-black font-extrabold text-xs cursor-pointer hover:scale-105 transition-all"
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
