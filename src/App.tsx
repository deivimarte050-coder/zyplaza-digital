import React, { useState, useEffect, useMemo } from 'react';
import {
  Listing,
  Store,
  Conversation,
  ChatMessage,
  FilterState,
  UserProfileData,
  Review
} from './types';
import { CITIES } from './data/mockData';
import { Navbar } from './components/Navbar';
import { HomeFeed } from './components/HomeFeed';
import { BusinessMap } from './components/BusinessMap';
import { ProductDetailModal } from './components/ProductDetailModal';
import { StoreProfileModal } from './components/StoreProfileModal';
import { CreateListingModal, ListingFormInput } from './components/CreateListingModal';
import { ChatDrawer } from './components/ChatDrawer';
import { UserProfile } from './components/UserProfile';
import { AuthModal } from './components/AuthModal';
import { CreateStoreModal, CreateStoreInput } from './components/CreateStoreModal';
import { SellerPanel } from './components/seller/SellerPanel';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirebaseAuth, isFirebaseConfigured } from './lib/firebase';
import { useAdminClaim } from './hooks/useAdminClaim';
import {
  subscribeActiveStores,
  subscribeActiveListings,
  subscribeSellerListings,
  subscribeReviews,
  subscribeUserProfile,
  subscribeStore,
  subscribeConversations,
  subscribeMessages,
  createStoreDoc,
  updateStoreDoc,
  createListingDoc,
  updateListingDoc,
  deleteListingDoc,
  addReviewDoc,
  updateUserProfile,
  findConversation,
  createConversationDoc,
  sendChatMessage,
  markConversationRead,
  getUserProfile,
  newDocId,
} from './services/firestore';
import { uploadImage } from './services/imageUpload';

import {
  MapPin,
  X,
  Store as StoreIcon,
  MessageSquare,
  User,
  Home as HomeIcon,
  PlusCircle,
  SlidersHorizontal,
  RotateCcw
} from 'lucide-react';

const DEFAULT_FILTERS: FilterState = {
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
};

const slugify = (text: string) =>
  text.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

/** Limpia las claves del prototipo que vivían en localStorage. */
function cleanupLegacyLocalData() {
  const legacyKeys = [
    'multiplaza_listings',
    'multiplaza_stores',
    'multiplaza_conversations',
    'multiplaza_messages',
    'multiplaza_favorites',
    'zyplaza_users',
    'zyplaza_reviews',
    'zyplaza_user',
  ];
  legacyKeys.forEach((k) => localStorage.removeItem(k));
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'stores' | 'chat' | 'profile'>('home');
  const [currentCity, setCurrentCity] = useState<string>('San Pedro de Macorís');
  const [viewMode, setViewMode] = useState<'full' | 'mobile-frame'>('full');

  // ------------------------- Auth -------------------------
  const [currentUser, setCurrentUser] = useState<UserProfileData | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(isFirebaseConfigured);
  const isAdmin = useAdminClaim(currentUser?.id);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authReason, setAuthReason] = useState<string>('');
  const [pendingAuthAction, setPendingAuthAction] = useState<(() => void) | null>(null);

  // --------------------- Datos Firebase -------------------
  const [listings, setListings] = useState<Listing[]>([]);
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [userStore, setUserStore] = useState<Store | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messagesMap, setMessagesMap] = useState<Record<string, ChatMessage[]>>({});
  const [reviews, setReviews] = useState<Review[]>([]);
  const [guestFavorites, setGuestFavorites] = useState<string[]>([]);

  // ------------------------- Modales ----------------------
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [showCreateListing, setShowCreateListing] = useState<boolean>(false);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [showCitySelector, setShowCitySelector] = useState<boolean>(false);
  const [showFiltersModal, setShowFiltersModal] = useState<boolean>(false);
  const [showChatModal, setShowChatModal] = useState<boolean>(false);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [showSellerPanel, setShowSellerPanel] = useState<boolean>(false);
  const [showCreateStore, setShowCreateStore] = useState<boolean>(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [storeToast, setStoreToast] = useState<string>('');

  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  const showToast = (msg: string) => {
    setStoreToast(msg);
    window.setTimeout(() => setStoreToast(''), 4000);
  };

  // ------------------- Limpieza del prototipo -------------
  useEffect(() => {
    cleanupLegacyLocalData();
  }, []);

  // ----------------- Sesión Firebase + perfil -------------
  useEffect(() => {
    if (!isFirebaseConfigured) {
      setAuthLoading(false);
      return;
    }

    let unsubProfile: (() => void) | null = null;

    const unsubAuth = onAuthStateChanged(getFirebaseAuth(), (fbUser) => {
      if (unsubProfile) {
        unsubProfile();
        unsubProfile = null;
      }

      if (!fbUser) {
        setCurrentUser(null);
        setAuthLoading(false);
        return;
      }

      // Perfil en tiempo real: si el rol o la foto cambian en Firestore,
      // toda la app se entera al instante.
      unsubProfile = subscribeUserProfile(fbUser.uid, (profile) => {
        if (profile) {
          setCurrentUser(profile);
        } else {
          // Cuenta de Auth sin documento de perfil (caso raro): crearlo.
          void getUserProfile(fbUser.uid).then((p) => setCurrentUser(p));
        }
        setAuthLoading(false);
      });
    });

    return () => {
      unsubAuth();
      if (unsubProfile) unsubProfile();
    };
  }, []);

  // ------------- Listeners públicos en tiempo real --------
  useEffect(() => {
    if (!isFirebaseConfigured) return;
    const unsubStores = subscribeActiveStores(setStores);
    const unsubListings = subscribeActiveListings(setListings);
    const unsubReviews = subscribeReviews(setReviews);
    return () => {
      unsubStores();
      unsubListings();
      unsubReviews();
    };
  }, []);

  // --------- Tienda del usuario (incluso si está inactiva) -
  useEffect(() => {
    if (!currentUser?.storeId) {
      setUserStore(null);
      return;
    }
    const unsub = subscribeStore(currentUser.storeId, setUserStore);
    return () => unsub();
  }, [currentUser?.storeId]);

  // ------ Productos propios y conversaciones del usuario --
  useEffect(() => {
    if (!currentUser) {
      setMyListings([]);
      setConversations([]);
      setMessagesMap({});
      return;
    }
    const unsubMine = subscribeSellerListings(currentUser.id, setMyListings);
    const unsubConvs = subscribeConversations(currentUser.id, setConversations);
    return () => {
      unsubMine();
      unsubConvs();
    };
  }, [currentUser?.id]);

  // -------- Mensajes de la conversación activa ------------
  useEffect(() => {
    if (!activeConversationId || !currentUser) return;
    const unsub = subscribeMessages(activeConversationId, (msgs) => {
      setMessagesMap((prev) => ({ ...prev, [activeConversationId]: msgs }));
    });
    void markConversationRead(activeConversationId, currentUser.id);
    return () => unsub();
  }, [activeConversationId, currentUser?.id]);

  // ---------- Enlace compartido ?store=<id> ---------------
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const storeId = params.get('store');
    if (!storeId || stores.length === 0) return;
    const found = stores.find((s) => s.id === storeId || s.slug === storeId);
    if (found) {
      setSelectedStore(found);
      params.delete('store');
      const newUrl = window.location.pathname + (params.toString() ? `?${params}` : '');
      window.history.replaceState({}, '', newUrl);
    }
  }, [stores]);

  // ----------------------- Derivados ----------------------
  const isSeller = currentUser?.role === 'seller';
  const favorites = currentUser?.favorites ?? guestFavorites;

  const unreadTotal = useMemo(
    () => conversations.reduce((acc, c) => acc + (currentUser ? (c.unreadCounts[currentUser.id] ?? 0) : 0), 0),
    [conversations, currentUser]
  );

  // ----------------------- Auth actions -------------------
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
    if (isFirebaseConfigured) {
      void signOut(getFirebaseAuth());
    }
  };

  // -------------------- Flujo "Vender" --------------------
  const [pendingVender, setPendingVender] = useState(false);

  useEffect(() => {
    if (!pendingVender || !currentUser) return;
    setPendingVender(false);
    if (currentUser.role === 'seller') {
      setShowSellerPanel(true);
    } else {
      setEditingStore(null);
      setShowCreateStore(true);
    }
  }, [pendingVender, currentUser]);

  const handleVenderClick = () => {
    if (!currentUser) {
      setPendingVender(true);
      handleRequestAuth('para crear tu tienda y vender en Zyplaza');
      return;
    }

    if (isSeller) {
      setShowSellerPanel(true);
    } else {
      setEditingStore(null);
      setShowCreateStore(true);
    }
  };

  // ------------------ Crear / editar tienda ---------------
  const handleSubmitStore = async (input: CreateStoreInput) => {
    if (!currentUser) throw new Error('Debes iniciar sesión.');

    // El id definitivo se conoce desde antes de escribir, así las imágenes
    // se suben una sola vez con la ruta correcta.
    const targetId = editingStore?.id ?? newDocId('stores');
    const logoUrl = input.logoFile
      ? await uploadImage(input.logoFile, `stores/${targetId}/logo-${Date.now()}.jpg`)
      : editingStore?.logo;
    const bannerUrl = input.bannerFile
      ? await uploadImage(input.bannerFile, `stores/${targetId}/banner-${Date.now()}.jpg`)
      : editingStore?.coverImage;

    if (editingStore) {
      await updateStoreDoc(editingStore.id, {
        name: input.name,
        slug: slugify(input.name),
        category: input.category,
        description: input.description,
        province: input.province,
        city: input.city,
        address: input.address,
        phone: input.phone,
        whatsapp: input.whatsapp,
        openingHours: input.openingHours,
        logo: logoUrl,
        coverImage: bannerUrl,
        socials: { facebook: input.facebook, instagram: input.instagram, twitter: input.twitter },
        ownerName: currentUser.name,
        ownerAvatar: currentUser.avatar,
      });
      showToast('¡Tu tienda se actualizó correctamente!');
      return;
    }

    const base: Store = {
      id: targetId,
      name: input.name,
      slug: slugify(input.name),
      logo: logoUrl ?? `https://ui-avatars.com/api/?background=FF6A00&color=000&name=${encodeURIComponent(input.name)}`,
      coverImage: bannerUrl ?? '',
      category: input.category,
      rating: 5.0,
      reviewsCount: 0,
      city: input.city,
      province: input.province,
      address: input.address,
      verified: false,
      responseTime: '~30 minutos',
      openingHours: input.openingHours || 'Todos los días',
      followersCount: 0,
      totalListings: 0,
      description: input.description,
      ownerId: currentUser.id,
      ownerName: currentUser.name,
      ownerAvatar: currentUser.avatar,
      whatsapp: input.whatsapp,
      phone: input.phone,
      email: currentUser.email,
      socials: { facebook: input.facebook, instagram: input.instagram, twitter: input.twitter },
      status: 'active',
      sellerLevel: 'Nuevo Vendedor',
      createdAt: new Date().toISOString(),
    };

    await createStoreDoc(base);
    await updateUserProfile(currentUser.id, { role: 'seller', storeId: targetId });
    showToast('¡Tu tienda ha sido creada con éxito!');
  };

  // ------------- Crear / editar / borrar productos --------
  const handleSubmitListing = async (input: ListingFormInput, editingId?: string) => {
    if (!currentUser) throw new Error('Debes iniciar sesión.');

    const productId = editingId ?? newDocId('products');
    const uploadedUrls: string[] = [];
    for (let i = 0; i < input.imageFiles.length; i++) {
      uploadedUrls.push(
        await uploadImage(input.imageFiles[i], `products/${productId}/${Date.now()}-${i}.jpg`)
      );
    }
    const images = [...input.existingImages, ...uploadedUrls];

    const sellerName = userStore?.name ?? currentUser.name;
    const sellerAvatar = userStore?.logo ?? currentUser.avatar ?? '';

    if (editingId) {
      await updateListingDoc(editingId, {
        title: input.title,
        category: input.category,
        condition: input.condition,
        price: input.price,
        originalPrice: input.originalPrice,
        city: input.city,
        sector: input.sector,
        description: input.description,
        tags: input.tags,
        deliveryOption: input.deliveryOption,
        stock: input.stock,
        images,
        sellerName,
        sellerAvatar,
      });
      showToast('Producto actualizado correctamente.');
      return;
    }

    const newListing: Listing = {
      id: productId,
      title: input.title,
      price: input.price,
      originalPrice: input.originalPrice,
      category: input.category,
      condition: input.condition,
      city: input.city,
      sector: input.sector,
      distanceKm: 0,
      storeId: userStore?.id,
      sellerId: currentUser.id,
      sellerName,
      sellerAvatar,
      sellerRating: userStore?.rating ?? 5,
      sellerSalesCount: currentUser.salesCount ?? 0,
      isVerifiedStore: userStore?.verified ?? false,
      images,
      description: input.description,
      tags: input.tags,
      stock: input.stock,
      viewsCount: 0,
      likesCount: 0,
      createdAt: new Date().toISOString(),
      deliveryOption: input.deliveryOption,
      status: 'active',
    };

    await createListingDoc(newListing);
    showToast('¡Tu artículo ya está publicado!');
  };

  const handleDeleteListing = async (listing: Listing) => {
    try {
      await deleteListingDoc(listing);
      showToast('Producto eliminado.');
    } catch {
      showToast('No se pudo eliminar el producto.');
    }
  };

  const handleToggleListingStatus = async (listing: Listing) => {
    const next = listing.status === 'active' ? 'inactive' : 'active';
    await updateListingDoc(listing.id, { status: next }).catch(() => undefined);
  };

  const handleEditListingRequest = (listing: Listing) => {
    setEditingListing(listing);
    setShowCreateListing(true);
  };

  // ---------------------- Favoritos -----------------------
  const handleToggleFavorite = (id: string) => {
    if (!currentUser) {
      setGuestFavorites((prev) =>
        prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      );
      return;
    }
    const current = currentUser.favorites ?? [];
    const next = current.includes(id) ? current.filter((f) => f !== id) : [...current, id];
    void updateUserProfile(currentUser.id, { favorites: next });
  };

  // ------------------------ Reseñas -----------------------
  const handleAddReview = (newReview: Omit<Review, 'id' | 'createdAt'>) => {
    void addReviewDoc({
      ...newReview,
      authorId: currentUser?.id,
      authorName: currentUser?.name ?? newReview.authorName,
      authorAvatar: currentUser?.avatar ?? newReview.authorAvatar,
    });
  };

  // ------------------------- Chat -------------------------
  const handleOpenChatWithListing = (listing: Listing) => {
    if (!currentUser) {
      handleRequestAuth('para chatear con el vendedor', () => handleOpenChatWithListing(listing));
      return;
    }
    if (listing.sellerId === currentUser.id) {
      showToast('Este artículo es tuyo.');
      return;
    }

    setSelectedListing(null);

    void (async () => {
      let conv = await findConversation(currentUser.id, listing.id);
      if (!conv) {
        const now = Date.now();
        const newId = await createConversationDoc({
          listingId: listing.id,
          listingTitle: listing.title,
          listingPrice: listing.price,
          listingImage: listing.images[0] ?? '',
          participants: [currentUser.id, listing.sellerId ?? ''],
          buyerId: currentUser.id,
          buyerName: currentUser.name,
          buyerAvatar: currentUser.avatar ?? '',
          sellerId: listing.sellerId ?? '',
          sellerName: listing.sellerName,
          sellerAvatar: listing.sellerAvatar,
          storeId: listing.storeId,
          isVerifiedSeller: listing.isVerifiedStore,
          lastMessage: '',
          updatedAtMs: now,
          unreadCounts: {},
        });
        conv = {
          id: newId,
          listingId: listing.id,
          listingTitle: listing.title,
          listingPrice: listing.price,
          listingImage: listing.images[0] ?? '',
          participants: [currentUser.id, listing.sellerId ?? ''],
          buyerId: currentUser.id,
          buyerName: currentUser.name,
          buyerAvatar: currentUser.avatar ?? '',
          sellerId: listing.sellerId ?? '',
          sellerName: listing.sellerName,
          sellerAvatar: listing.sellerAvatar,
          storeId: listing.storeId,
          isVerifiedSeller: listing.isVerifiedStore,
          lastMessage: '',
          lastMessageTime: 'Ahora',
          updatedAtMs: now,
          unreadCounts: {},
        };
        await sendChatMessage(conv, currentUser.id, `¡Hola ${listing.sellerName}! Me interesa "${listing.title}".`);
      }

      setActiveConversationId(conv.id);
      setShowChatModal(true);
    })();
  };

  const handleOpenChatWithStore = (store: Store) => {
    const storeListing = listings.find((l) => l.storeId === store.id);
    if (storeListing) {
      handleOpenChatWithListing(storeListing);
      return;
    }
    if (!store.whatsapp) {
      showToast('Esta tienda aún no tiene productos ni WhatsApp.');
      return;
    }
    const phone = store.whatsapp.replace(/\D/g, '');
    const intl = phone.length === 10 ? `1${phone}` : phone;
    const text = encodeURIComponent(`¡Hola! Vi tu tienda "${store.name}" en Zyplaza y quisiera hacer una consulta.`);
    window.open(`https://wa.me/${intl}?text=${text}`, '_blank');
  };

  const handleSendMessage = (conversationId: string, text: string, isOffer?: boolean, offerAmount?: number) => {
    if (!currentUser) return;
    const conv = conversations.find((c) => c.id === conversationId);
    if (!conv) return;
    void sendChatMessage(conv, currentUser.id, text, isOffer, offerAmount);
  };

  // ---------------------- Filtros -------------------------
  const handleFilterChange = (newPartialFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newPartialFilters }));
  };

  const handleSelectCity = (city: string) => {
    setCurrentCity(city);
    setFilters((prev) => ({ ...prev, city }));
    setShowCitySelector(false);
  };

  const filteredListings = listings
    .filter((item) => {
      if (!item) return false;
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        const matchTitle = (item.title || '').toLowerCase().includes(q);
        const matchCategory = (item.category || '').toLowerCase().includes(q);
        const matchDesc = (item.description || '').toLowerCase().includes(q);
        const matchSeller = (item.sellerName || '').toLowerCase().includes(q);
        const matchTags = (item.tags || []).some((t) => t.toLowerCase().includes(q));
        if (!matchTitle && !matchCategory && !matchDesc && !matchSeller && !matchTags) return false;
      }
      if (filters.category !== 'all' && item.category !== filters.category) return false;
      // Al buscar por texto, mostramos coincidencias de cualquier ciudad
      // (igual que Facebook Marketplace); el filtro de ciudad solo aplica
      // cuando el usuario está navegando sin una búsqueda activa.
      if (
        !filters.searchQuery &&
        filters.city !== 'all' &&
        (item.city || '').trim().toLowerCase() !== (filters.city || '').trim().toLowerCase()
      ) {
        return false;
      }
      if (filters.condition !== 'all' && item.condition !== filters.condition) return false;
      if (filters.verifiedOnly && !item.isVerifiedStore) return false;
      if (filters.flashOnly && !(item.originalPrice && item.originalPrice > item.price)) return false;
      if ((item.price ?? 0) < filters.minPrice || (item.price ?? 0) > filters.maxPrice) return false;
      return true;
    })
    .sort((a, b) => {
      if (filters.sortBy === 'price_asc') return (a.price ?? 0) - (b.price ?? 0);
      if (filters.sortBy === 'price_desc') return (b.price ?? 0) - (a.price ?? 0);
      if (filters.sortBy === 'popular') return (b.viewsCount ?? 0) - (a.viewsCount ?? 0);
      return (b.createdAt || '').localeCompare(a.createdAt || '');
    });

  const favoriteListings = listings.filter((l) => l && l.id && favorites.includes(l.id));

  const openCreateListingFlow = () => {
    if (!currentUser) {
      handleRequestAuth('para publicar un artículo', () => {
        setEditingListing(null);
        setShowCreateListing(true);
      });
    } else {
      setEditingListing(null);
      setShowCreateListing(true);
    }
  };

  // --------------------- Splash inicial -------------------
  if (authLoading) {
    return (
      <div className="min-h-screen bg-void flex flex-col items-center justify-center gap-3 text-text-1 font-body">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange to-[#B8340A] flex items-center justify-center font-display font-bold text-[#0A0400] animate-pulse">
          Z
        </div>
        <p className="text-xs text-text-3 font-semibold">Cargando Zyplaza...</p>
      </div>
    );
  }

  // ------------------------- Render -----------------------
  const appContent = (
    <div className="min-h-screen bg-void text-text-1 flex flex-col font-body selection:bg-orange selection:text-[#0A0400] pb-20">
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
        onOpenCreateListing={openCreateListingFlow}
        onOpenFilters={() => setShowFiltersModal(true)}
        unreadCount={unreadTotal}
        viewMode={viewMode}
        setViewMode={setViewMode}
        currentUser={currentUser}
        onRequestAuth={() => handleRequestAuth()}
      />

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
            onOpenCreateListing={openCreateListingFlow}
            isSeller={isSeller}
            onOpenCreateStore={handleVenderClick}
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
            userListings={myListings}
            favoriteListings={favoriteListings}
            onSelectListing={(item) => setSelectedListing(item)}
            onOpenCreateListing={openCreateListingFlow}
            onLogout={handleLogout}
            onRequestAuth={handleRequestAuth}
            onOpenSellerPanel={() => setShowSellerPanel(true)}
            isAdmin={isAdmin}
            isSeller={isSeller}
            userStore={userStore}
            onOpenCreateStore={handleVenderClick}
          />
        )}
      </main>

      {/* Bottom Fixed Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-surface/90 backdrop-blur-lg border-t border-line text-text-1 px-2 py-2 flex items-center justify-around shadow-2xl">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-1 text-[10px] transition-all cursor-pointer ${
            activeTab === 'home' ? 'text-orange-soft' : 'text-text-3 hover:text-text-1'
          }`}
        >
          <HomeIcon className="w-5 h-5" />
          <span>Inicio</span>
        </button>

        <button
          onClick={() => setActiveTab('stores')}
          className={`flex flex-col items-center gap-1 text-[10px] transition-all cursor-pointer ${
            activeTab === 'stores' ? 'text-orange-soft' : 'text-text-3 hover:text-text-1'
          }`}
        >
          <StoreIcon className="w-5 h-5" />
          <span>Tiendas</span>
        </button>

        <button
          onClick={handleVenderClick}
          className="flex flex-col items-center gap-1 text-[10px] text-text-3 transition-all cursor-pointer"
        >
          <div className="w-[46px] h-[46px] rounded-[14px] -mt-6 bg-gradient-to-br from-orange to-[#C4400E] flex items-center justify-center text-[#0A0400] shadow-lg shadow-orange/35">
            <PlusCircle className="w-5 h-5" />
          </div>
        </button>

        <button
          onClick={() => {
            if (!currentUser) {
              handleRequestAuth('para ver tus mensajes', () => setShowChatModal(true));
            } else {
              setShowChatModal(true);
            }
          }}
          className="relative flex flex-col items-center gap-1 text-[10px] text-text-3 hover:text-text-1 transition-all cursor-pointer"
        >
          <MessageSquare className="w-5 h-5" />
          <span>Mensajes</span>
          {unreadTotal > 0 && (
            <span className="absolute -top-1 right-2 w-4 h-4 rounded-full bg-orange text-[#0A0400] text-[9px] font-black flex items-center justify-center">
              {unreadTotal}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center gap-1 text-[10px] transition-all cursor-pointer ${
            activeTab === 'profile' ? 'text-orange-soft' : 'text-text-3 hover:text-text-1'
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
            const st = stores.find((s) => s.id === storeId);
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
          storeListings={listings.filter((l) => l.storeId === selectedStore.id)}
          reviews={reviews}
          onAddReview={handleAddReview}
          onClose={() => setSelectedStore(null)}
          onSelectListing={(item) => {
            setSelectedStore(null);
            setSelectedListing(item);
          }}
          onOpenChatWithStore={handleOpenChatWithStore}
          currentUser={currentUser}
          onRequestAuth={handleRequestAuth}
        />
      )}

      {showCreateListing && (
        <CreateListingModal
          onClose={() => {
            setShowCreateListing(false);
            setEditingListing(null);
          }}
          onSubmitListing={handleSubmitListing}
          currentCity={currentCity}
          editingListing={editingListing}
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
          currentUserId={currentUser?.id ?? ''}
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
        <SellerPanel
          onClose={() => setShowSellerPanel(false)}
          store={userStore}
          products={myListings}
          onEditStore={() => {
            setEditingStore(userStore);
            setShowCreateStore(true);
          }}
          onSubmitListing={handleSubmitListing}
          onDeleteListing={handleDeleteListing}
          onToggleListingStatus={handleToggleListingStatus}
        />
      )}

      {showCreateStore && (
        <CreateStoreModal
          isOpen={showCreateStore}
          onClose={() => {
            setShowCreateStore(false);
            setEditingStore(null);
          }}
          onSubmitStore={handleSubmitStore}
          initialStore={editingStore}
        />
      )}

      {storeToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] px-4 py-2.5 rounded-full bg-emerald-500 text-black text-xs font-extrabold shadow-lg shadow-emerald-500/30 animate-fade-in flex items-center gap-2">
          <span>✅</span>
          <span>{storeToast}</span>
        </div>
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
              <button
                onClick={() => handleSelectCity('all')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filters.city === 'all'
                    ? 'bg-[#FF6A00] text-black font-extrabold'
                    : 'hover:bg-white/10 text-white/80'
                }`}
              >
                🌎 Todas las ciudades
              </button>
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

      {/* Filters Modal */}
      {showFiltersModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-neutral-900 border border-white/10 rounded-3xl p-6 max-w-sm w-full space-y-4 text-white">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-sm font-extrabold flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#FF6A00]" />
                Filtros de Búsqueda
              </h3>
              <button onClick={() => setShowFiltersModal(false)} className="p-1 text-white/60 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-white/70">Categoría</label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange({ category: e.target.value })}
                  className="w-full bg-[#1A1B1F] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF8A3D]"
                >
                  <option value="all">Todas</option>
                  <option value="tech">Tecnología</option>
                  <option value="fashion">Moda y Ropa</option>
                  <option value="home">Hogar y Muebles</option>
                  <option value="vehicles">Vehículos</option>
                  <option value="sports">Deportes</option>
                  <option value="beauty">Belleza</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-white/70">Precio mínimo</label>
                  <input
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange({ minPrice: Number(e.target.value) || 0 })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF8A3D]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-white/70">Precio máximo</label>
                  <input
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange({ maxPrice: Number(e.target.value) || 100000 })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF8A3D]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-white/70">Estado del artículo</label>
                <select
                  value={filters.condition}
                  onChange={(e) => handleFilterChange({ condition: e.target.value })}
                  className="w-full bg-[#1A1B1F] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF8A3D]"
                >
                  <option value="all">Todos</option>
                  <option value="Nuevo">Nuevo</option>
                  <option value="Como Nuevo">Como Nuevo</option>
                  <option value="Buen Estado">Buen Estado</option>
                  <option value="Usado">Usado</option>
                  <option value="Reacondicionado">Reacondicionado</option>
                </select>
              </div>

              <label className="flex items-center gap-2 text-xs font-semibold text-white/80 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.verifiedOnly}
                  onChange={(e) => handleFilterChange({ verifiedOnly: e.target.checked })}
                  className="accent-[#FF6A00] w-4 h-4"
                />
                Solo vendedores verificados
              </label>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => {
                    setFilters({ ...DEFAULT_FILTERS, city: currentCity, searchQuery: filters.searchQuery });
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Limpiar
                </button>
                <button
                  onClick={() => setShowFiltersModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-[#FF6A00] text-black text-xs font-extrabold hover:bg-[#ff7b1a] transition-all cursor-pointer"
                >
                  Aplicar filtros
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return appContent;
}
