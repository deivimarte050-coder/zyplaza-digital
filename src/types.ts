export type ItemCondition = 'Nuevo' | 'Como Nuevo' | 'Buen Estado' | 'Usado' | 'Reacondicionado';

export interface Listing {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  category: string;
  condition: ItemCondition;
  city: string;
  sector?: string;
  distanceKm: number;
  storeId?: string;
  sellerId?: string;
  sellerName: string;
  sellerAvatar: string;
  sellerRating: number;
  sellerSalesCount: number;
  isVerifiedStore?: boolean;
  images: string[];
  description: string;
  tags: string[];
  stock?: number;
  isFlashOffer?: boolean;
  flashEndTime?: string; // ISO or formatted
  viewsCount: number;
  likesCount: number;
  createdAt: string;
  deliveryOption: 'Punto Neutro / Presencial' | 'Envío Local' | 'A Convenir';
  status: 'active' | 'inactive' | 'sold' | 'reserved';
}

export interface StoreSocials {
  facebook?: string;
  instagram?: string;
  twitter?: string;
}

export interface Store {
  id: string;
  name: string;
  slug: string;
  logo: string;
  coverImage: string;
  category: string;
  rating: number;
  reviewsCount: number;
  city: string;
  province?: string;
  address: string;
  verified: boolean;
  responseTime: string;
  openingHours: string;
  followersCount: number;
  totalListings: number;
  description: string;
  ownerId?: string;
  ownerName?: string;
  ownerAvatar?: string;
  whatsapp?: string;
  phone?: string;
  email?: string;
  socials?: StoreSocials;
  status?: 'active' | 'pending' | 'suspended';
  sellerLevel?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  createdAtMs: number;
  timestamp: string;
  isOffer?: boolean;
  offerAmount?: number;
  offerStatus?: 'pending' | 'accepted' | 'rejected';
  meetingPoint?: string;
}

export interface Conversation {
  id: string;
  listingId: string;
  listingTitle: string;
  listingPrice: number;
  listingImage: string;
  participants: string[];
  buyerId: string;
  buyerName: string;
  buyerAvatar: string;
  sellerId: string;
  sellerName: string;
  sellerAvatar: string;
  storeId?: string;
  isVerifiedSeller?: boolean;
  lastMessage: string;
  lastMessageTime: string;
  updatedAtMs: number;
  unreadCounts: Record<string, number>;
  meetingPoint?: string;
}

export interface FilterState {
  searchQuery: string;
  category: string;
  city: string;
  maxDistanceKm: number;
  minPrice: number;
  maxPrice: number;
  condition: string;
  verifiedOnly: boolean;
  flashOnly: boolean;
  sortBy: 'recent' | 'price_asc' | 'price_desc' | 'distance' | 'popular';
}

export interface UserProfileData {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  city: string;
  avatar?: string;
  rating?: number;
  salesCount: number;
  favorites: string[];
  followingStores?: string[];
  isVerified?: boolean;
  role?: 'buyer' | 'seller';
  storeId?: string;
  status?: 'active' | 'suspended';
  joinedDate?: string;
}

export interface Review {
  id: string;
  targetId: string; // storeId or listingId
  targetType: 'store' | 'listing';
  authorId?: string;
  authorName: string;
  authorAvatar?: string;
  rating: number; // 1 to 5
  comment: string;
  createdAt: string;
}

