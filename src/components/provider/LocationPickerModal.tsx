// src/components/provider/LocationPickerModal.tsx
import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { MapPin, X, LocateFixed, Loader2 } from 'lucide-react';
import { NimartSpinner } from '../common/NimartSpinner';
import L from 'leaflet';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Blue dot icon for user's current location (reference only)
const blueDotIcon = L.divIcon({
  html: `<div style="width: 12px; height: 12px; background: #3b82f6; border: 2px solid white; border-radius: 50%; box-shadow: 0 0 0 2px rgba(59,130,246,0.5);"></div>`,
  className: '',
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelected: (data: {
    lat: number;
    lng: number;
    lgaId: number;
    lgaName: string;
    stateName: string;
    area: string;
  }) => void;
  currentLat: number;
  currentLng: number;
}

async function reverseGeocodeArea(lat: number, lng: number): Promise<string> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
    );
    const data = await response.json();
    return data.address?.suburb || data.address?.village || data.address?.neighbourhood || data.address?.city_district || data.address?.town || '';
  } catch {
    return '';
  }
}

function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({ click(e) { onMapClick(e.latlng.lat, e.latlng.lng); } });
  return null;
}

export function LocationPickerModal({
  isOpen,
  onClose,
  onLocationSelected,
  currentLat,
  currentLng,
}: LocationPickerModalProps) {
  const [selectedLat, setSelectedLat] = useState(currentLat);
  const [selectedLng, setSelectedLng] = useState(currentLng);
  const [lgaInfo, setLgaInfo] = useState<{ lga_id: number; lga_name: string; state_name: string } | null>(null);
  const [area, setArea] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  // Fetch LGA and area when marker moves
  useEffect(() => {
    if (!selectedLat || !selectedLng) return;
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.rpc('find_nearest_lga', { user_lat: selectedLat, user_lng: selectedLng });
        if (error) throw error;
        if (data && data.length > 0) {
          setLgaInfo({
            lga_id: data[0].lga_id,
            lga_name: data[0].lga_name,
            state_name: data[0].state_name,
          });
        } else setLgaInfo(null);
        const osmArea = await reverseGeocodeArea(selectedLat, selectedLng);
        setArea(osmArea);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchDetails();
  }, [selectedLat, selectedLng]);

  // On modal open, get user's current location for blue dot reference
  useEffect(() => {
    if (!isOpen) return;
    if (!navigator.geolocation) return;
    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation([pos.coords.latitude, pos.coords.longitude]);
        setGettingLocation(false);
      },
      () => setGettingLocation(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [isOpen]);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported');
      return;
    }
    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setSelectedLat(latitude);
        setSelectedLng(longitude);
        setUserLocation([latitude, longitude]);
        setGettingLocation(false);
        toast.success('Map centered on your location');
      },
      () => {
        toast.error('Unable to get your location');
        setGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleConfirm = () => {
    if (!lgaInfo) { toast.error('Please select a valid location'); return; }
    onLocationSelected({ lat: selectedLat, lng: selectedLng, lgaId: lgaInfo.lga_id, lgaName: lgaInfo.lga_name, stateName: lgaInfo.state_name, area });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Set Your Exact Location</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X className="h-5 w-5" /></button>
        </div>
        <div className="flex-1 relative">
          <MapContainer center={[selectedLat, selectedLng]} zoom={16} className="w-full h-full">
            <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>' />
            {/* Draggable marker (the one the user moves) */}
            <Marker
              position={[selectedLat, selectedLng]}
              draggable={true}
              eventHandlers={{ dragend: (e) => {
                const pos = e.target.getLatLng();
                setSelectedLat(pos.lat);
                setSelectedLng(pos.lng);
              } }}
            />
            {/* Reference blue dot – user's actual location (non‑draggable) */}
            {userLocation && (
              <Marker position={userLocation} icon={blueDotIcon} interactive={false} />
            )}
            <MapClickHandler onMapClick={(lat, lng) => { setSelectedLat(lat); setSelectedLng(lng); }} />
          </MapContainer>

          <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-3 space-y-1">
            {loading ? <div className="flex justify-center py-2"><NimartSpinner size="sm" /></div> : lgaInfo ? (
              <>
                <p className="text-sm font-medium text-gray-900">{lgaInfo.lga_name}, {lgaInfo.state_name}</p>
                {area && <p className="text-sm text-gray-700">📍 Area: {area}</p>}
                <p className="text-xs text-gray-500">Drag the pin to match your exact location</p>
              </>
            ) : <p className="text-sm text-gray-500">Click or drag the pin on the map</p>}
          </div>
        </div>
        <div className="p-4 border-t flex justify-between items-center gap-3">
          <button
            onClick={handleUseCurrentLocation}
            disabled={gettingLocation}
            className="flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100"
          >
            {gettingLocation ? <Loader2 className="h-4 w-4 animate-spin" /> : <LocateFixed className="h-4 w-4" />}
            Use my current location
          </button>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
            <button onClick={handleConfirm} disabled={!lgaInfo} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">Use this location</button>
          </div>
        </div>
      </div>
    </div>
  );
}