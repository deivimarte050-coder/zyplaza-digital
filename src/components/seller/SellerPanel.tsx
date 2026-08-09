import React, { useState } from 'react';
import { X, Home, Package, Store as StoreNavIcon } from 'lucide-react';
import { SellerDashboard } from './SellerDashboard';
import { SellerProducts } from './SellerProducts';
import { SellerStore } from './SellerStore';
import { Listing, Store } from '../../types';
import { ListingFormInput } from '../CreateListingModal';

type SellerSection = 'home' | 'products' | 'store';

interface SellerPanelProps {
  onClose: () => void;
  store: Store | null;
  products: Listing[];
  onEditStore: () => void;
  onSubmitListing: (input: ListingFormInput, editingId?: string) => Promise<void>;
  onDeleteListing: (listing: Listing) => void;
  onToggleListingStatus: (listing: Listing) => void;
}

export const SellerPanel: React.FC<SellerPanelProps> = ({
  onClose,
  store,
  products,
  onEditStore,
  onSubmitListing,
  onDeleteListing,
  onToggleListingStatus,
}) => {
  const [section, setSection] = useState<SellerSection>('home');

  const tabs = [
    { id: 'home' as SellerSection, label: 'Inicio', icon: Home },
    { id: 'products' as SellerSection, label: 'Productos', icon: Package },
    { id: 'store' as SellerSection, label: 'Mi Tienda', icon: StoreNavIcon },
  ];

  const activeTab = tabs.find((tab) => tab.id === section);

  const renderContent = () => {
    switch (section) {
      case 'products':
        return (
          <SellerProducts
            darkMode={true}
            products={products}
            onSubmitListing={onSubmitListing}
            onDeleteListing={onDeleteListing}
            onToggleStatus={onToggleListingStatus}
          />
        );
      case 'store':
        return <SellerStore darkMode={true} store={store} onEditStore={onEditStore} />;
      case 'home':
      default:
        return (
          <SellerDashboard
            darkMode={true}
            onNavigate={(s) => setSection(s)}
            store={store}
            products={products}
          />
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0A0A0A] flex flex-col md:flex-row">
      {/* Sidebar (escritorio) */}
      <aside className="hidden md:flex md:flex-col w-64 h-full bg-[#0E0F12] border-r border-white/10">
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#FF6A00] to-[#e85f00] flex items-center justify-center">
              <StoreNavIcon className="w-6 h-6 text-black" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Zyplaza</h2>
              <p className="text-sm text-white/70">Panel de vendedor</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = section === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setSection(tab.id)}
                className={`w-full text-left flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                  isActive ? 'bg-[#FF6A00] text-black' : 'text-white hover:bg-white/10'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-semibold">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/10">
          <button
            onClick={onClose}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-500/10 transition-all"
          >
            <X className="w-5 h-5" />
            <span>Salir del panel</span>
          </button>
        </div>
      </aside>

      {/* Contenido */}
      <main className="flex-1 flex flex-col min-h-0">
        {/* Encabezado */}
        <header className="flex items-center justify-between gap-3 p-4 border-b border-white/10 bg-[#0E0F12]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#FF6A00]/15 flex items-center justify-center flex-shrink-0">
              {activeTab && <activeTab.icon className="w-5 h-5 text-[#FF6A00]" />}
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-bold truncate text-white">{activeTab?.label}</h1>
              <p className="text-sm truncate text-white/70">{store?.name ?? 'Tu tienda'}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Salir del panel"
            className="p-2.5 rounded-xl bg-white/10 text-white hover:bg-white/20 flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* Área de contenido */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-6">{renderContent()}</div>

        {/* Navegación inferior (móvil) */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-[#0E0F12]">
          <div className="grid grid-cols-3">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = section === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setSection(tab.id)}
                  className="flex flex-col items-center gap-1 py-2.5"
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-[#FF6A00]' : 'text-white/60'}`} />
                  <span className={`text-[11px] font-medium ${isActive ? 'text-[#FF6A00]' : 'text-white/60'}`}>
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      </main>
    </div>
  );
};
