import React, { useEffect, useRef, useState } from 'react';
import { X, MapPin, Crosshair, Check } from 'lucide-react';
import type { StoreLocation } from '../types';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface StoreLocationPickerProps {
  initial?: StoreLocation | null;
  onConfirm: (location: StoreLocation) => void;
  onClose: () => void;
}

const DEFAULT_CENTER: [number, number] = [18.4626, -69.3152]; // Santo Domingo aprox

export const StoreLocationPicker: React.FC<StoreLocationPickerProps> = ({
  initial,
  onConfirm,
  onClose,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [position, setPosition] = useState<StoreLocation>(
    initial ?? { lat: DEFAULT_CENTER[0], lng: DEFAULT_CENTER[1] }
  );
  const [loadingGps, setLoadingGps] = useState(false);
  const [gpsError, setGpsError] = useState('');
  const [formattedAddress, setFormattedAddress] = useState(initial?.address || '');

  useEffect(() => {
    if (!mapRef.current) return;

    const map = L.map(mapRef.current, {
      center: [position.lat, position.lng],
      zoom: 16,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    const marker = L.marker([position.lat, position.lng], {
      draggable: true,
      icon: L.divIcon({
        className: 'custom-store-marker',
        html: `<div class="w-8 h-8 rounded-full bg-orange text-[#0A0400] flex items-center justify-center border-2 border-white shadow-lg"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.4-8 12-8 12s-8-7.6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      }),
    }).addTo(map);

    marker.on('dragend', () => {
      const { lat, lng } = marker.getLatLng();
      setPosition({ lat, lng });
      reverseGeocode(lat, lng);
    });

    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      marker.setLatLng([lat, lng]);
      map.panTo([lat, lng]);
      setPosition({ lat, lng });
      reverseGeocode(lat, lng);
    });

    leafletMap.current = map;
    markerRef.current = marker;

    return () => {
      map.remove();
      leafletMap.current = null;
      markerRef.current = null;
    };
  }, []);

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=0`,
        { headers: { 'Accept-Language': 'es' } }
      );
      if (!res.ok) return;
      const data = await res.json();
      if (data?.display_name) {
        setFormattedAddress(data.display_name);
      }
    } catch {
      // ignore
    }
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGpsError('Tu dispositivo no soporta geolocalización.');
      return;
    }
    setLoadingGps(true);
    setGpsError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition({ lat: latitude, lng: longitude });
        leafletMap.current?.setView([latitude, longitude], 17);
        markerRef.current?.setLatLng([latitude, longitude]);
        reverseGeocode(latitude, longitude);
        setLoadingGps(false);
      },
      () => {
        setGpsError('No se pudo obtener tu ubicación. Activa el GPS e inténtalo de nuevo.');
        setLoadingGps(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in" onClick={onClose}>
      <div
        className="w-full sm:max-w-lg bg-surface border-t sm:border border-line rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl max-h-[95vh] flex flex-col"
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

        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          <p className="text-xs text-text-2 leading-relaxed">
            Mueve el marcador hasta la ubicación exacta de tu tienda. También puedes pulsar “Usar mi ubicación actual”.
          </p>

          <div className="relative w-full h-72 sm:h-80 rounded-2xl overflow-hidden border border-line bg-surface-2">
            <div ref={mapRef} className="w-full h-full" />
          </div>

          <button
            onClick={useCurrentLocation}
            disabled={loadingGps}
            className="w-full py-2.5 rounded-xl bg-white/5 border border-line text-text-1 text-xs font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <Crosshair className={`w-4 h-4 ${loadingGps ? 'animate-spin' : ''}`} />
            {loadingGps ? 'Obteniendo ubicación…' : 'Usar mi ubicación actual'}
          </button>

          {gpsError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold">
              {gpsError}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-text-2">Dirección formateada (opcional)</label>
            <textarea
              rows={2}
              value={formattedAddress}
              onChange={(e) => setFormattedAddress(e.target.value)}
              placeholder="Dirección que verán los clientes..."
              className="w-full bg-white/5 border border-line rounded-2xl p-3 text-xs text-text-1 placeholder-text-3 focus:outline-none focus:border-orange resize-none"
            />
            <p className="text-[10px] text-text-3">
              Coordenadas: {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
            </p>
          </div>
        </div>

        <div className="p-4 border-t border-line bg-surface">
          <button
            onClick={() => onConfirm({ ...position, address: formattedAddress.trim() || undefined })}
            className="w-full py-3 rounded-2xl bg-orange text-[#0A0400] font-extrabold text-sm hover:bg-orange-soft transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange/20"
          >
            <Check className="w-4 h-4" />
            Confirmar ubicación
          </button>
        </div>
      </div>
    </div>
  );
};
