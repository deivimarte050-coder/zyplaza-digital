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
    <header className="sticky top-0 z-40 bg-void/95 backdrop-blur-md border-b border-line text-text-1">
      {/* Top Header Row */}
      <div className="max-w-7xl mx-auto px-3.5 sm:px-4 pt-3.5 pb-2 flex items-start justify-between gap-2">
        {/* Left Side: Brand Logo */}
        <button
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-2 text-left cursor-pointer focus:outline-none"
        >
          <div className="w-[30px] h-[30px] rounded-[8px] bg-gradient-to-br from-orange to-[#B8340A] flex items-center justify-center font-display font-bold text-[15px] text-[#0A0400] flex-shrink-0">
            Z
          </div>
          <div>
            <span className="font-display font-semibold text-[19px] tracking-tight text-text-1 leading-none block">
              Zyplaza
            </span>
            <span className="text-[11px] text-text-3 -mt-0.5 block">
              todo tu comercio, en un solo lugar
            </span>
          </div>
        </button>

        {/* Right Side: Location Selector Pill & Auth */}
        <div className="flex items-center gap-1.5">
          {/* View Mode Toggle (Full / Mobile) - Visible on larger screens */}
          <div className="hidden sm:flex items-center bg-surface border border-line rounded-full p-1 mr-0.5">
            <button
              onClick={() => setViewMode('full')}
              className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition-all ${
                viewMode === 'full' 
                  ? 'bg-white/15 text-text-1 shadow-sm' 
                  : 'text-text-2 hover:text-text-1'
              }`}
            >
              <Monitor className="w-3 h-3" />
              <span>Full</span>
            </button>
            <button
              onClick={() => setViewMode('mobile-frame')}
              className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition-all ${
                viewMode === 'mobile-frame' 
                  ? 'bg-orange text-[#0A0400] shadow-sm font-bold' 
                  : 'text-text-2 hover:text-text-1'
              }`}
            >
              <Smartphone className="w-3 h-3" />
              <span>Móvil</span>
            </button>
          </div>

          {/* Location Selector Capsule */}
          <button
            onClick={onOpenCitySelector}
            className="flex items-center gap-1.5 pl-2.5 pr-2.5 py-1.5 rounded-full bg-surface border border-line text-text-2 hover:bg-surface-2 transition-all cursor-pointer"
          >
            <span className="w-[6px] h-[6px] rounded-full bg-teal flex-shrink-0 animate-zy-pulse" />
            <span className="text-[11px] font-medium max-w-[90px] sm:max-w-none truncate">{currentCity}</span>
            <ChevronDown className="w-3 h-3 text-text-3" />
          </button>

          {/* User Profile or Login Button */}
          {currentUser ? (
            <button
              onClick={() => setActiveTab('profile')}
              className="p-0.5 rounded-full border border-orange/50 hover:border-orange transition-all cursor-pointer"
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
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-orange text-[#0A0400] font-bold text-[11px] hover:bg-orange-soft transition-all cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Ingresar</span>
            </button>
          )}
        </div>
      </div>

      {/* Search Bar Row */}
      <div className="max-w-7xl mx-auto px-3.5 sm:px-4 pb-3.5 flex items-center gap-2">
        <div className="relative flex-1 flex items-center gap-2.5 bg-surface border border-line rounded-[14px] px-3.5 py-2.5 focus-within:border-orange transition-colors">
          <Search className="w-4 h-4 text-text-3 flex-shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar productos, tiendas o artículos"
            className="w-full bg-transparent border-none outline-none text-text-1 placeholder-text-3 text-sm"
          />
          {searchQuery && (
            <button 
              onClick={() => onSearchChange('')} 
              className="text-xs text-text-2 hover:text-text-1 flex-shrink-0"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Button */}
        <button
          onClick={onOpenFilters}
          className="p-2.5 rounded-[14px] bg-surface border border-line text-text-2 hover:text-text-1 hover:bg-surface-2 transition-all cursor-pointer flex-shrink-0"
          title="Filtros"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

