// src/components/provider/LocationPickerModal.tsx
import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { MapPin, X } from 'lucide-react';
import { NimartSpinner } from '../common/NimartSpinner';
import L from 'leaflet';

// Fix Leaflet icon paths
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
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
    area: string;          // nearest village/neighbourhood
  }) => void;
  currentLat: number;
  currentLng: number;
}

// Helper: reverse geocode area using OpenStreetMap Nominatim
async function reverseGeocodeArea(lat: number, lng: number): Promise<string> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
    );
    const data = await response.json();
    const area = data.address?.suburb ||
                 data.address?.village ||
                 data.address?.neighbourhood ||
                 data.address?.city_district ||
                 data.address?.town ||
                 '';
    return area;
  } catch (err) {
    console.error('OSM reverse geocode error:', err);
    return '';
  }
}

function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
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

  // Fetch LGA and area whenever marker moves
  useEffect(() => {
    if (!selectedLat || !selectedLng) return;
    const fetchDetails = async () => {
      setLoading(true);
      try {
        // 1. Get LGA/state from your Supabase function
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

        // 2. Get area (village/neighbourhood) from OpenStreetMap
        const osmArea = await reverseGeocodeArea(selectedLat, selectedLng);
        setArea(osmArea);
      } catch (err) {
        console.error('Location fetch error:', err);
        toast.error('Could not detect location details');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [selectedLat, selectedLng]);

  const handleConfirm = () => {
    if (!lgaInfo) {
      toast.error('Please select a valid location on the map');
      return;
    }
    onLocationSelected({
      lat: selectedLat,
      lng: selectedLng,
      lgaId: lgaInfo.lga_id,
      lgaName: lgaInfo.lga_name,
      stateName: lgaInfo.state_name,
      area: area,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Set Your Exact Location</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          <MapContainer
            center={[selectedLat, selectedLng]}
            zoom={16}
            className="w-full h-full"
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            />
            <Marker
              position={[selectedLat, selectedLng]}
              draggable={true}
              eventHandlers={{
                dragend: (e) => {
                  const marker = e.target;
                  const pos = marker.getLatLng();
                  setSelectedLat(pos.lat);
                  setSelectedLng(pos.lng);
                },
              }}
            />
            <MapClickHandler onMapClick={(lat, lng) => {
              setSelectedLat(lat);
              setSelectedLng(lng);
            }} />
          </MapContainer>

          {/* Loading overlay while fetching LGA/area */}
          {loading && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
              <NimartSpinner size="md" />
            </div>
          )}

          {/* Info panel */}
          <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-3 space-y-1">
            {lgaInfo ? (
              <>
                <p className="text-sm font-medium text-gray-900">
                  {lgaInfo.lga_name}, {lgaInfo.state_name}
                </p>
                {area && (
                  <p className="text-sm text-gray-700">
                    🏘️ Area: {area}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  Drag the pin or click on the map to adjust
                </p>
              </>
            ) : (
              <p className="text-sm text-gray-500">
                Click on the map to select a location
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!lgaInfo}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2"
          >
            <MapPin className="h-4 w-4" />
            Use this location
          </button>
        </div>
      </div>
    </div>
  );
}