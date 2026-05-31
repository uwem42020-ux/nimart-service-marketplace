import { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { MapPin, X, LocateFixed, Loader2, Search } from 'lucide-react';
import { NimartSpinner } from '../common/NimartSpinner';
import L from 'leaflet';
import { useDebounce } from '../../hooks/useDebounce'; // you already have this hook

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Custom red marker that pulses – more visible
const customMarker = L.divIcon({
  html: `<div style="position: relative; width: 0; height: 0;">
    <div style="position: absolute; width: 24px; height: 24px; background: #008751; border: 3px solid white; border-radius: 50%; transform: translate(-50%, -100%); box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>
    <div style="position: absolute; width: 12px; height: 12px; background: #008751; border-radius: 50%; transform: translate(-50%, -350%); animation: pulse 1.2s infinite;"></div>
    <style>
      @keyframes pulse {
        0% { transform: translate(-50%, -350%) scale(1); opacity: 0.6; }
        100% { transform: translate(-50%, -350%) scale(3); opacity: 0; }
      }
    </style>
  </div>`,
  className: '',
  iconSize: [1, 1],
  iconAnchor: [12, 24],
});

// Blue dot for user's actual location (non‑draggable)
const blueDotIcon = L.divIcon({
  html: `<div style="width: 14px; height: 14px; background: #3b82f6; border: 2px solid white; border-radius: 50%; box-shadow: 0 0 0 2px rgba(59,130,246,0.5);"></div>`,
  className: '',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

// ---- Helpers ----

async function reverseGeocodeArea(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
    );
    const data = await res.json();
    return (
      data.address?.suburb ||
      data.address?.village ||
      data.address?.neighbourhood ||
      data.address?.city_district ||
      data.address?.town ||
      ''
    );
  } catch {
    return '';
  }
}

async function searchPlaces(query: string): Promise<{ display_name: string; lat: string; lon: string }[]> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=ng`
  );
  return res.json();
}

function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// ---- Component ----

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

const DEFAULT_LAT = 9.0556;
const DEFAULT_LNG = 7.4914;

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
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const debouncedSearch = useDebounce(searchTerm, 500);

  // ---- Fetch LGA and area when marker moves ----
  useEffect(() => {
    if (!selectedLat || !selectedLng) return;
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.rpc('find_nearest_lga', {
          user_lat: selectedLat,
          user_lng: selectedLng,
        });
        if (error) throw error;
        if (data && data.length > 0) {
          setLgaInfo({
            lga_id: data[0].lga_id,
            lga_name: data[0].lga_name,
            state_name: data[0].state_name,
          });
        } else {
          setLgaInfo(null);
        }
        const osmArea = await reverseGeocodeArea(selectedLat, selectedLng);
        setArea(osmArea);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [selectedLat, selectedLng]);

  // ---- Auto‑detect GPS on modal open ----
  useEffect(() => {
    if (!isOpen) return;
    if (!navigator.geolocation) return;

    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation([latitude, longitude]);

        // Only move the marker if the user hasn't already set a custom location
        // (i.e., if the current coords are still the default)
        if (currentLat === DEFAULT_LAT && currentLng === DEFAULT_LNG) {
          setSelectedLat(latitude);
          setSelectedLng(longitude);
        }
        setGettingLocation(false);
      },
      () => {
        setGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [isOpen]);

  // ---- Search places ----
  useEffect(() => {
    if (!debouncedSearch || debouncedSearch.length < 3) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    searchPlaces(debouncedSearch).then((results) => {
      setSearchResults(results);
      setShowResults(true);
    });
  }, [debouncedSearch]);

  const handleSelectSearchResult = (lat: string, lon: string) => {
    const newLat = parseFloat(lat);
    const newLng = parseFloat(lon);
    setSelectedLat(newLat);
    setSelectedLng(newLng);
    setShowResults(false);
    setSearchTerm('');
  };

  // ---- "Use my current location" button ----
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
        toast.error('Unable to get your location. Check your device settings.');
        setGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // ---- Confirm ----
  const isDefaultLocation = selectedLat === DEFAULT_LAT && selectedLng === DEFAULT_LNG;

  const handleConfirm = () => {
    if (!lgaInfo) {
      toast.error('Please select a valid location on the map');
      return;
    }
    if (isDefaultLocation) {
      toast.error('Please move the map to your exact location or use "Use my current location"');
      return;
    }
    onLocationSelected({
      lat: selectedLat,
      lng: selectedLng,
      lgaId: lgaInfo.lga_id,
      lgaName: lgaInfo.lga_name,
      stateName: lgaInfo.state_name,
      area,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Set Your Exact Location</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search bar */}
        <div className="px-4 py-2 border-b relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search address, landmark, or area..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          {showResults && searchResults.length > 0 && (
            <div className="absolute z-10 mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto w-full left-4 right-4" style={{ width: 'calc(100% - 2rem)' }}>
              {searchResults.map((place, idx) => (
                <button
                  key={idx}
                  className="w-full text-left px-4 py-2.5 hover:bg-gray-50 border-b last:border-0 text-sm"
                  onClick={() => handleSelectSearchResult(place.lat, place.lon)}
                >
                  {place.display_name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          <MapContainer
            center={[selectedLat, selectedLng]}
            zoom={16}
            className="w-full h-full"
            scrollWheelZoom={true}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            />

            {/* Draggable main marker */}
            <Marker
              position={[selectedLat, selectedLng]}
              icon={customMarker}
              draggable={true}
              eventHandlers={{
                dragend: (e) => {
                  const pos = e.target.getLatLng();
                  setSelectedLat(pos.lat);
                  setSelectedLng(pos.lng);
                },
              }}
            />

            {/* Reference blue dot (user's actual GPS) */}
            {userLocation && (
              <Marker position={userLocation} icon={blueDotIcon} interactive={false} />
            )}

            <MapClickHandler
              onMapClick={(lat, lng) => {
                setSelectedLat(lat);
                setSelectedLng(lng);
              }}
            />
          </MapContainer>

          {/* Info overlay */}
          <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-3 space-y-1">
            {loading ? (
              <div className="flex justify-center py-2">
                <NimartSpinner size="sm" />
              </div>
            ) : lgaInfo ? (
              <>
                <p className="text-sm font-medium text-gray-900">
                  📍 {lgaInfo.lga_name}, {lgaInfo.state_name}
                </p>
                {area && <p className="text-xs text-gray-600">🏘️ {area}</p>}
                <p className="text-xs text-gray-500">
                  Drag the red pin to your exact workshop/office, or click on the map
                </p>
              </>
            ) : (
              <p className="text-sm text-gray-500">Click or drag the pin on the map to select your service location</p>
            )}
          </div>
        </div>

        {/* Bottom actions */}
        <div className="p-4 border-t flex justify-between items-center gap-3 flex-wrap">
          <button
            onClick={handleUseCurrentLocation}
            disabled={gettingLocation}
            className="flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition text-sm font-medium"
          >
            {gettingLocation ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LocateFixed className="h-4 w-4" />
            )}
            Use my current location
          </button>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!lgaInfo || isDefaultLocation}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 text-sm font-medium"
            >
              Use this location
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}