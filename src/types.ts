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
  sellerName: string;
  sellerAvatar: string;
  sellerRating: number;
  sellerSalesCount: number;
  isVerifiedStore?: boolean;
  images: string[];
  description: string;
  tags: string[];
  isFlashOffer?: boolean;
  flashEndTime?: string; // ISO or formatted
  viewsCount: number;
  likesCount: number;
  createdAt: string;
  deliveryOption: 'Punto Neutro / Presencial' | 'Envío Local' | 'A Convenir';
  status: 'active' | 'sold' | 'reserved';
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
  address: string;
  verified: boolean;
  responseTime: string;
  openingHours: string;
  followersCount: number;
  totalListings: number;
  description: string;
  ownerId?: string;
  whatsapp?: string;
  status?: 'active' | 'pending' | 'suspended';
  sellerLevel?: string;
  createdAt?: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  sender: 'user' | 'seller';
  text: string;
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
  sellerName: string;
  sellerAvatar: string;
  isVerifiedSeller?: boolean;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
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
  salesCount?: number;
  joinedDate?: string;
  isVerified?: boolean;
  role?: 'buyer' | 'seller';
  storeId?: string;
}

export interface Review {
  id: string;
  targetId: string; // storeId or listingId
  targetType: 'store' | 'listing';
  authorName: string;
  authorAvatar?: string;
  rating: number; // 1 to 5
  comment: string;
  createdAt: string;
}

