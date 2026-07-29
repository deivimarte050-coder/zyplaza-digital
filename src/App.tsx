import React, { useState, useEffect } from 'react';
import { 
  Listing, 
  Store, 
  Conversation, 
  ChatMessage, 
  FilterState,
  UserProfileData,
  Review
} from './types';
import { 
  CITIES, 
  INITIAL_LISTINGS, 
  MOCK_STORES, 
  INITIAL_CONVERSATIONS, 
  INITIAL_CHAT_MESSAGES 
} from './data/mockData';
import { Navbar } from './components/Navbar';
import { HomeFeed } from './components/HomeFeed';
import { BusinessMap } from './components/BusinessMap';
import { ProductDetailModal } from './components/ProductDetailModal';
import { StoreProfileModal } from './components/StoreProfileModal';
import { CreateListingModal } from './components/CreateListingModal';
import { ChatDrawer } from './components/ChatDrawer';
import { UserProfile } from './components/UserProfile';
import { AuthModal } from './components/AuthModal';
import { SellerPanel } from './components/seller/SellerPanel';
import { signOut } from 'firebase/auth';
import { readStorage, writeStorage } from './utils/storage';
import { getFirebaseAuth, isFirebaseConfigured } from './lib/firebase';
import { useAdminClaim } from './hooks/useAdminClaim';

import { 
  MapPin, 
  X, 
  SlidersHorizontal, 
  Store as StoreIcon, 
  MessageSquare, 
  User, 
  Home as HomeIcon, 
  PlusCircle, 
  Smartphone, 
  Monitor,
  Search,
  Heart,
  Tag,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

export default function App() {
  // Navigation tab state
  const [activeTab, setActiveTab] = useState<'home' | 'stores' | 'chat' | 'profile'>('home');

  // Persistence state
  const [currentCity, setCurrentCity] = useState<string>('San Pedro de Macorís');
  const [viewMode, setViewMode] = useState<'full' | 'mobile-frame'>('full');

  // Auth state
  const [currentUser, setCurrentUser] = useState<UserProfileData | null>(() =>
    readStorage<UserProfileData | null>('zyplaza_user', null)
  );
  const isAdmin = useAdminClaim();
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authReason, setAuthReason] = useState<string>('');
  const [pendingAuthAction, setPendingAuthAction] = useState<(() => void) | null>(null);

  const handleRequestAuth = (reason?: string, onAuthenticated?: () => void) => {
    setAuthReason(reason || 'para contactar tiendas, enviar mensajes o publicar artículos');
    if (onAuthenticated) {
      setPendingAuthAction(() => onAuthenticated);
    } else {
      setPendingAuthAction(null);
    }
    setShowAuthModal(true);
  };

  const handleLoginSuccess = (user: UserProfileData) => {
    setCurrentUser(user);
    writeStorage('zyplaza_user', user);
    setShowAuthModal(false);

    const action = pendingAuthAction;
    setPendingAuthAction(null);

    if (action) {
      window.setTimeout(() => {
        try {
          action();
        } catch {
          setShowCreateListing(false);
          setShowChatModal(false);
        }
      }, 0);
    }
  };

  const handleCloseAuth = () => {
    setShowAuthModal(false);
    setPendingAuthAction(null);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('zyplaza_user');

    // Si la sesión venía de Firebase (Google o correo) hay que cerrarla también,
    // porque es la que concede el acceso al panel de administración.
    if (isFirebaseConfigured) {
      void signOut(getFirebaseAuth());
    }
  };

  const [listings, setListings] = useState<Listing[]>(() =>
    readStorage<Listing[]>('multiplaza_listings', INITIAL_LISTINGS)
  );

  const [stores] = useState<Store[]>(MOCK_STORES);

  const [conversations, setConversations] = useState<Conversation[]>(() =>
    readStorage<Conversation[]>('multiplaza_conversations', INITIAL_CONVERSATIONS)
  );

  const [messagesMap, setMessagesMap] = useState<Record<string, ChatMessage[]>>(() =>
    readStorage<Record<string, ChatMessage[]>>('multiplaza_messages', INITIAL_CHAT_MESSAGES)
  );

  const [favorites, setFavorites] = useState<string[]>(() =>
    readStorage<string[]>('multiplaza_favorites', ['item-1', 'item-3'])
  );

  const [reviews, setReviews] = useState<Review[]>(() =>
    readStorage<Review[]>('zyplaza_reviews', [])
  );

  useEffect(() => {
    writeStorage('zyplaza_reviews', reviews);
  }, [reviews]);

  const handleAddReview = (newReview: Omit<Review, 'id' | 'createdAt'>) => {
    const review: Review = {
      ...newReview,
      id: `rev-${Date.now()}`,
      createdAt: 'Hace un momento',
    };
    setReviews(prev => [review, ...prev]);
  };

  // Filter State
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    category: 'all',
    city: 'San Pedro de Macorís',
    maxDistanceKm: 25,
    minPrice: 0,
    maxPrice: 100000,
    condition: 'all',
    verifiedOnly: false,
    flashOnly: false,
    sortBy: 'recent',
  });

  // Modals
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [showCreateListing, setShowCreateListing] = useState<boolean>(false);
  const [showCitySelector, setShowCitySelector] = useState<boolean>(false);
  const [showFiltersModal, setShowFiltersModal] = useState<boolean>(false);
  const [showChatModal, setShowChatModal] = useState<boolean>(false);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [showSellerPanel, setShowSellerPanel] = useState<boolean>(false);

  // Sync to localStorage
  useEffect(() => {
    writeStorage('multiplaza_listings', listings);
  }, [listings]);

  useEffect(() => {
    writeStorage('multiplaza_conversations', conversations);
  }, [conversations]);

  useEffect(() => {
    writeStorage('multiplaza_messages', messagesMap);
  }, [messagesMap]);

  useEffect(() => {
    writeStorage('multiplaza_favorites', favorites);
  }, [favorites]);

  const handleToggleFavorite = (id: string) => {
    setFavorites(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleFilterChange = (newPartialFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newPartialFilters }));
  };

  const handleSelectCity = (city: string) => {
    setCurrentCity(city);
    setFilters(prev => ({ ...prev, city }));
    setShowCitySelector(false);
  };

  // Add new listing
  const handleAddListing = (newListing: Listing) => {
    setListings(prev => [newListing, ...prev]);
  };

  // Start chat with seller or store
  const handleOpenChatWithListing = (listing: Listing) => {
    setSelectedListing(null);

    let existing = conversations.find(c => c.listingId === listing.id);
    if (!existing) {
      existing = {
        id: `conv-${Date.now()}`,
        listingId: listing.id,
        listingTitle: listing.title,
        listingPrice: listing.price,
        listingImage: listing.images[0],
        sellerName: listing.sellerName,
        sellerAvatar: listing.sellerAvatar,
        isVerifiedSeller: listing.isVerifiedStore,
        lastMessage: '¡Hola! Me interesa este artículo.',
        lastMessageTime: 'Ahora',
        unreadCount: 0,
      };
      setConversations(prev => [existing!, ...prev]);
      setMessagesMap(prev => ({
        ...prev,
        [existing!.id]: [
          {
            id: `msg-${Date.now()}`,
            conversationId: existing.id,
            sender: 'user',
            text: `¡Hola ${listing.sellerName}! Quisiera consultar sobre "${listing.title}".`,
            timestamp: 'Ahora',
          }
        ]
      }));
    }

    setActiveConversationId(existing.id);
    setShowChatModal(true);
  };

  const handleSendMessage = (conversationId: string, text: string, isOffer?: boolean, offerAmount?: number) => {
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      conversationId,
      sender: 'user',
      text,
      timestamp: 'Ahora',
      isOffer,
      offerAmount,
    };

    setMessagesMap(prev => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), newMsg],
    }));

    setConversations(prev =>
      prev.map(c =>
        c.id === conversationId
          ? { ...c, lastMessage: text, lastMessageTime: 'Ahora' }
          : c
      )
    );
  };

  // Filtered Listings
  const filteredListings = listings.filter(item => {
    if (!item) return false;
    if (filters.searchQuery) {
      const q = (filters.searchQuery || '').toLowerCase();
      const matchTitle = (item.title || '').toLowerCase().includes(q);
      const matchCategory = (item.category || '').toLowerCase().includes(q);
      const matchDesc = (item.description || '').toLowerCase().includes(q);
      if (!matchTitle && !matchCategory && !matchDesc) return false;
    }
    if (filters.category !== 'all' && item.category !== filters.category) return false;
    if (filters.city !== 'all' && (item.location || '').toLowerCase() !== (filters.city || '').toLowerCase()) return false;
    if (filters.condition !== 'all' && item.condition !== filters.condition) return false;
    if (filters.verifiedOnly && !item.isVerifiedStore) return false;
    if (filters.flashOnly && !item.isFlashDeal) return false;
    if ((item.price ?? 0) < filters.minPrice || (item.price ?? 0) > filters.maxPrice) return false;
    return true;
  }).sort((a, b) => {
    if (filters.sortBy === 'price-asc') return (a.price ?? 0) - (b.price ?? 0);
    if (filters.sortBy === 'price-desc') return (b.price ?? 0) - (a.price ?? 0);
    if (filters.sortBy === 'distance') return (a.distanceKm ?? 0) - (b.distanceKm ?? 0);
    if (filters.sortBy === 'popular') return (b.viewsCount ?? 0) - (a.viewsCount ?? 0);
    return 0;
  });

  const favoriteListings = listings.filter(l => l && l.id && favorites.includes(l.id));
  const userListings = listings.filter(l => l && l.sellerName && ((l.sellerName || '').includes('Tú') || (l.sellerName || '').includes('Camila') || (l.sellerName || '').includes('TechHub')));

  // Content Container
  const appContent = (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col font-sans selection:bg-[#FF6A00] selection:text-black pb-20">
      {/* Top Main Navbar */}
      <Navbar
        currentCity={currentCity}
        onOpenCitySelector={() => setShowCitySelector(true)}
        searchQuery={filters.searchQuery}
        onSearchChange={(q) => {
          handleFilterChange({ searchQuery: q });
          if (q && activeTab !== 'home') {
            setActiveTab('home');
          }
        }}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCreateListing={() => {
          if (!currentUser) {
            handleRequestAuth('para publicar un artículo', () => setShowCreateListing(true));
          } else {
            setShowCreateListing(true);
          }
        }}
        onOpenFilters={() => setShowFiltersModal(true)}
        unreadCount={conversations.reduce((acc, c) => acc + c.unreadCount, 0)}
        viewMode={viewMode}
        setViewMode={setViewMode}
        currentUser={currentUser}
        onRequestAuth={() => handleRequestAuth()}
      />

      {/* Main Body Content */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <HomeFeed
            listings={filteredListings}
            stores={stores}
            filters={filters}
            onFilterChange={handleFilterChange}
            onSelectListing={(item) => setSelectedListing(item)}
            onSelectStore={(store) => setSelectedStore(store)}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onOpenCreateListing={() => {
              if (!currentUser) {
                handleRequestAuth('para publicar un artículo', () => setShowCreateListing(true));
              } else {
                setShowCreateListing(true);
              }
            }}
          />
        )}

        {activeTab === 'stores' && (
          <BusinessMap
            stores={stores}
            currentCity={currentCity}
            onSelectStore={(st) => setSelectedStore(st)}
            onRequestAuth={handleRequestAuth}
          />
        )}

        {activeTab === 'profile' && (
          <UserProfile
            user={currentUser}
            userListings={userListings}
            favoriteListings={favoriteListings}
            onSelectListing={(item) => setSelectedListing(item)}
            onOpenCreateListing={() => {
              if (!currentUser) {
                handleRequestAuth('para publicar un artículo', () => setShowCreateListing(true));
              } else {
                setShowCreateListing(true);
              }
            }}
            onResetData={() => {
              localStorage.clear();
              window.location.reload();
            }}
            onLogout={handleLogout}
            onRequestAuth={handleRequestAuth}
            onOpenSellerPanel={() => setShowSellerPanel(true)}
            isAdmin={isAdmin}
          />
        )}
      </main>

      {/* Bottom Fixed Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0E0F12]/95 backdrop-blur-lg border-t border-white/10 text-white px-2 py-2 flex items-center justify-around shadow-2xl">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-1 text-[11px] font-bold transition-all cursor-pointer ${
            activeTab === 'home' ? 'text-[#FF6A00]' : 'text-white/50 hover:text-white'
          }`}
        >
          <HomeIcon className="w-5 h-5" />
          <span>Inicio</span>
        </button>

        <button
          onClick={() => setActiveTab('stores')}
          className={`flex flex-col items-center gap-1 text-[11px] font-bold transition-all cursor-pointer ${
            activeTab === 'stores' ? 'text-[#FF6A00]' : 'text-white/50 hover:text-white'
          }`}
        >
          <StoreIcon className="w-5 h-5" />
          <span>Tiendas</span>
        </button>

        <button
          onClick={() => {
            if (!currentUser) {
              handleRequestAuth('para publicar un artículo', () => setShowCreateListing(true));
            } else {
              setShowCreateListing(true);
            }
          }}
          className="flex flex-col items-center gap-1 text-[11px] font-bold text-[#FF6A00] transition-all cursor-pointer hover:scale-105"
        >
          <div className="w-10 h-10 rounded-full bg-[#FF6A00] text-black flex items-center justify-center -mt-4 border-4 border-[#0A0A0A] shadow-lg shadow-[#FF6A00]/30 font-black">
            <PlusCircle className="w-6 h-6 text-black fill-black/20" />
          </div>
          <span className="text-white/80 font-extrabold text-[10px]">Vender</span>
        </button>

        <button
          onClick={() => {
            if (!currentUser) {
              handleRequestAuth('para ver tus mensajes', () => setShowChatModal(true));
            } else {
              setShowChatModal(true);
            }
          }}
          className="relative flex flex-col items-center gap-1 text-[11px] font-bold text-white/50 hover:text-white transition-all cursor-pointer"
        >
          <MessageSquare className="w-5 h-5" />
          <span>Mensajes</span>
          {conversations.reduce((acc, c) => acc + c.unreadCount, 0) > 0 && (
            <span className="absolute -top-1 right-2 w-4 h-4 rounded-full bg-[#FF6A00] text-black text-[9px] font-black flex items-center justify-center">
              {conversations.reduce((acc, c) => acc + c.unreadCount, 0)}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center gap-1 text-[11px] font-bold transition-all cursor-pointer ${
            activeTab === 'profile' ? 'text-[#FF6A00]' : 'text-white/50 hover:text-white'
          }`}
        >
          <User className="w-5 h-5" />
          <span>Perfil</span>
        </button>
      </nav>

      {/* Modals */}
      {selectedListing && (
        <ProductDetailModal
          listing={selectedListing}
          reviews={reviews}
          onAddReview={handleAddReview}
          onClose={() => setSelectedListing(null)}
          onOpenChat={handleOpenChatWithListing}
          onSelectStoreById={(storeId) => {
            const st = stores.find(s => s.id === storeId);
            if (st) {
              setSelectedListing(null);
              setSelectedStore(st);
            }
          }}
          isFavorite={favorites.includes(selectedListing.id)}
          onToggleFavorite={handleToggleFavorite}
          currentUser={currentUser}
          onRequestAuth={handleRequestAuth}
        />
      )}

      {selectedStore && (
        <StoreProfileModal
          store={selectedStore}
          storeListings={listings.filter(l => l.storeId === selectedStore.id)}
          reviews={reviews}
          onAddReview={handleAddReview}
          onClose={() => setSelectedStore(null)}
          onSelectListing={(item) => {
            setSelectedStore(null);
            setSelectedListing(item);
          }}
          onOpenChatWithStore={(st) => {
            const storeListing = listings.find(l => l.storeId === st.id) || listings[0];
            setSelectedStore(null);
            handleOpenChatWithListing(storeListing);
          }}
          currentUser={currentUser}
          onRequestAuth={handleRequestAuth}
        />
      )}

      {showCreateListing && (
        <CreateListingModal
          onClose={() => setShowCreateListing(false)}
          onAddListing={handleAddListing}
          currentCity={currentCity}
        />
      )}

      {showChatModal && (
        <ChatDrawer
          conversations={conversations}
          messagesMap={messagesMap}
          activeConversationId={activeConversationId}
          onSelectConversation={(id) => setActiveConversationId(id)}
          onSendMessage={handleSendMessage}
          onClose={() => setShowChatModal(false)}
        />
      )}

      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={handleCloseAuth}
          onLoginSuccess={handleLoginSuccess}
          titleActionReason={authReason}
        />
      )}

      {showSellerPanel && (
        <SellerPanel onClose={() => setShowSellerPanel(false)} />
      )}

      {/* City Selector Modal */}
      {showCitySelector && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-neutral-900 border border-white/10 rounded-3xl p-6 max-w-sm w-full space-y-4 text-white">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-sm font-extrabold flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#FF6A00]" />
                Selecciona tu Ciudad
              </h3>
              <button onClick={() => setShowCitySelector(false)} className="p-1 text-white/60 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-1.5 max-h-60 overflow-y-auto">
              {CITIES.map((c) => (
                <button
                  key={c}
                  onClick={() => handleSelectCity(c)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    c === currentCity
                      ? 'bg-[#FF6A00] text-black font-extrabold'
                      : 'hover:bg-white/10 text-white/80'
                  }`}
                >
                  📍 {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return appContent;
}

