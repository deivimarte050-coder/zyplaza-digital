import React from 'react';
import { UserProfileData } from '../types';
import { 
  Store as StoreIcon, 
  Search, 
  MapPin, 
  PlusCircle, 
  MessageSquare, 
  User, 
  Sparkles, 
  SlidersHorizontal,
  Smartphone,
  Monitor,
  Menu,
  ChevronDown,
  LogIn
} from 'lucide-react';

interface NavbarProps {
  currentCity: string;
  onOpenCitySelector: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeTab: 'home' | 'stores' | 'chat' | 'profile';
  setActiveTab: (tab: 'home' | 'stores' | 'chat' | 'profile') => void;
  onOpenCreateListing: () => void;
  onOpenFilters: () => void;
  unreadCount: number;
  viewMode: 'full' | 'mobile-frame';
  setViewMode: (mode: 'full' | 'mobile-frame') => void;
  currentUser?: UserProfileData | null;
  onRequestAuth?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentCity,
  onOpenCitySelector,
  searchQuery,
  onSearchChange,
  activeTab,
  setActiveTab,
  onOpenCreateListing,
  onOpenFilters,
  unreadCount,
  viewMode,
  setViewMode,
  currentUser,
  onRequestAuth,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0E0F12]/95 backdrop-blur-md border-b border-white/10 text-white">
      {/* Top Header Row */}
      <div className="max-w-7xl mx-auto px-3.5 sm:px-4 pt-3 pb-2 flex items-center justify-between gap-2">
        {/* Left Side: Brand Logo */}
        <div className="flex items-center gap-2.5">
          <button 
            onClick={() => setActiveTab('home')}
            className="flex flex-col text-left cursor-pointer focus:outline-none"
          >
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base sm:text-lg tracking-tight font-sans text-white">Zyplaza</span>
              <span className="text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded bg-[#FF6A00]/20 text-[#FF8A3D] border border-[#FF6A00]/40">
                LOCAL
              </span>
            </div>
            <span className="text-[10px] text-white/50 -mt-0.5 font-normal">
              todo tu comercio en un solo lugar
            </span>
          </button>
        </div>

        {/* Right Side: Location Selector Pill & Auth */}
        <div className="flex items-center gap-1.5">
          {/* View Mode Toggle (Full / Mobile) - Visible on larger screens */}
          <div className="hidden sm:flex items-center bg-white/5 border border-white/10 rounded-full p-1 mr-0.5">
            <button
              onClick={() => setViewMode('full')}
              className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition-all ${
                viewMode === 'full' 
                  ? 'bg-white/15 text-white shadow-sm' 
                  : 'text-white/50 hover:text-white'
              }`}
            >
              <Monitor className="w-3 h-3" />
              <span>Full</span>
            </button>
            <button
              onClick={() => setViewMode('mobile-frame')}
              className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition-all ${
                viewMode === 'mobile-frame' 
                  ? 'bg-[#FF6A00] text-black shadow-sm font-bold' 
                  : 'text-white/50 hover:text-white'
              }`}
            >
              <Smartphone className="w-3 h-3" />
              <span>Móvil</span>
            </button>
          </div>

          {/* Location Selector Capsule */}
          <button
            onClick={onOpenCitySelector}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-2xl bg-[#1A1B1F] border border-white/10 text-xs text-white/90 hover:bg-[#232429] transition-all cursor-pointer shadow-sm"
          >
            <MapPin className="w-3.5 h-3.5 text-[#FF6A00] flex-shrink-0" />
            <span className="text-[11px] font-medium max-w-[90px] sm:max-w-none truncate">{currentCity}</span>
            <ChevronDown className="w-3 h-3 text-white/50" />
          </button>

          {/* User Profile or Login Button */}
          {currentUser ? (
            <button
              onClick={() => setActiveTab('profile')}
              className="p-0.5 rounded-full border border-[#FF6A00]/50 hover:border-[#FF6A00] transition-all cursor-pointer"
              title="Mi Cuenta"
            >
              <img
                src={currentUser.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"}
                alt={currentUser.name}
                className="w-7 h-7 rounded-full object-cover"
              />
            </button>
          ) : (
            <button
              onClick={onRequestAuth}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-2xl bg-[#FF6A00] text-black font-extrabold text-[11px] hover:bg-[#ff7d1c] transition-all cursor-pointer shadow-sm"
            >
              <LogIn className="w-3.5 h-3.5 text-black" />
              <span className="hidden xs:inline">Ingresar</span>
            </button>
          )}
        </div>
      </div>

      {/* Search Bar Row */}
      <div className="max-w-7xl mx-auto px-3.5 sm:px-4 pb-2.5 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar productos, tiendas o artículos..."
            className="w-full bg-[#18191C] border border-white/10 rounded-full pl-9 pr-8 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#FF8A3D] transition-all"
          />
          {searchQuery && (
            <button 
              onClick={() => onSearchChange('')} 
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/50 hover:text-white p-1"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Button */}
        <button
          onClick={onOpenFilters}
          className="p-2 rounded-full bg-[#18191C] border border-white/10 text-white/80 hover:text-white hover:bg-white/10 transition-all cursor-pointer flex-shrink-0"
          title="Filtros"
        >
          <SlidersHorizontal className="w-4 h-4 text-white/80" />
        </button>
      </div>
    </header>
  );
};

