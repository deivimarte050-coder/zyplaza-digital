import React, { useEffect, useRef, useState } from 'react';
import { X, MapPin, Navigation, Car } from 'lucide-react';
import type { Store } from '../types';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface StoreLocationModalProps {
  store: Store;
  onClose: () => void;
}

function isMobile() {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

function openNavigation(lat: number, lng: number, provider: 'google' | 'waze') {
  const deepLinks: Record<string, string> = {
    google: `comgooglemaps://?q=${lat},${lng}`,
    waze: `waze://?ll=${lat},${lng}&navigate=yes`,
  };
  const webUrls: Record<string, string> = {
    google: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
    waze: `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`,
  };

  if (isMobile()) {
    const start = Date.now();
    window.location.href = deepLinks[provider];
    window.setTimeout(() => {
      if (Date.now() - start < 1800 && document.visibilityState !== 'hidden') {
        window.open(webUrls[provider], '_blank');
      }
    }, 1500);
  } else {
    window.open(webUrls[provider], '_blank');
  }
}

export const StoreLocationModal: React.FC<StoreLocationModalProps> = ({ store, onClose }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const [showRouteOptions, setShowRouteOptions] = useState(false);

  const location = store.location;
  const lat = location?.lat ?? 0;
  const lng = location?.lng ?? 0;
  const address = location?.address || [store.address, store.city].filter(Boolean).join(', ') || 'Ubicación no especificada';

  useEffect(() => {
    if (!mapRef.current) return;

    const map = L.map(mapRef.current, {
      center: [lat, lng],
      zoom: 16,
      zoomControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    L.marker([lat, lng], {
      icon: L.divIcon({
        className: 'custom-store-marker',
        html: `<div class="w-8 h-8 rounded-full bg-orange text-[#0A0400] flex items-center justify-center border-2 border-white shadow-lg"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.4-8 12-8 12s-8-7.6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      }),
    }).addTo(map);

    leafletMap.current = map;

    return () => {
      map.remove();
      leafletMap.current = null;
    };
  }, [lat, lng]);

  return (
    <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in" onClick={onClose}>
      <div
        className="w-full sm:max-w-md bg-surface border-t sm:border border-line rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-line bg-surface">
          <h2 className="text-base font-display font-semibold text-text-1 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-orange-soft" />
            Ubicación de la tienda
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-surface-2 text-text-2 hover:text-text-1 hover:bg-line transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-text-1">{store.name}</h3>
            <p className="text-xs text-text-2 flex items-start gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-orange-soft flex-shrink-0 mt-0.5" />
              {address}
            </p>
          </div>

          <div className="relative w-full h-64 sm:h-72 rounded-2xl overflow-hidden border border-line bg-surface-2">
            <div ref={mapRef} className="w-full h-full" />
          </div>

          <button
            onClick={() => setShowRouteOptions(true)}
            className="w-full py-3 rounded-2xl bg-orange text-[#0A0400] font-extrabold text-sm hover:bg-orange-soft transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange/20"
          >
            <Car className="w-4 h-4" />
            Cómo llegar
          </button>
        </div>
      </div>

      {showRouteOptions && (
        <div
          className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowRouteOptions(false)}
        >
          <div
            className="w-full max-w-xs bg-surface border border-line rounded-3xl p-5 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-sm font-display font-semibold text-text-1 text-center">
              ¿Dónde quieres abrir la ruta?
            </h3>

            <button
              onClick={() => {
                openNavigation(lat, lng, 'google');
                setShowRouteOptions(false);
              }}
              className="w-full py-3 rounded-2xl bg-white text-[#0A0400] font-extrabold text-sm hover:bg-white/90 transition-all flex items-center justify-center gap-2 border border-line"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#4285F4"/>
                <circle cx="12" cy="9" r="2.5" fill="white"/>
              </svg>
              Google Maps
            </button>

            <button
              onClick={() => {
                openNavigation(lat, lng, 'waze');
                setShowRouteOptions(false);
              }}
              className="w-full py-3 rounded-2xl bg-[#1FB365] text-white font-extrabold text-sm hover:bg-[#1a9b58] transition-all flex items-center justify-center gap-2"
            >
              <Navigation className="w-5 h-5" />
              Waze
            </button>

            <button
              onClick={() => setShowRouteOptions(false)}
              className="w-full py-2.5 rounded-xl text-text-2 text-xs font-bold hover:bg-white/5 transition-all"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
