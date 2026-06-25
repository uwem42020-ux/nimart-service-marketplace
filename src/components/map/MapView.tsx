// src/components/map/MapView.tsx
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { calculateDistance } from '../../lib/distance';
import { ProviderMapCard } from './ProviderMapCard';
import { Search, X, LocateFixed, Maximize2, Minimize2, Map as MapIcon, List } from 'lucide-react';
import { cn } from '../../lib/utils';
import toast from 'react-hot-toast';
import type { Database } from '../../types/database';

type ProviderRow = Database['public']['Tables']['providers']['Row'];
type ProfileRow = Database['public']['Tables']['profiles']['Row'];

interface MapProvider extends ProviderRow {
  profile: ProfileRow | null;
  distance?: number;
  display_lat?: number;
  display_lng?: number;
}

const containerStyle = { width: '100%', height: '100%' };
const defaultCenter = { lat: 9.0765, lng: 7.3986 };
const nigeriaBounds = {
  north: 14.0,
  south: 4.0,
  east: 15.0,
  west: 2.0,
};

export function MapView() {
  const { profile } = useAuth();
  const mapRef = useRef<google.maps.Map | null>(null);
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  // UI state
  const [selectedProvider, setSelectedProvider] = useState<MapProvider | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showProviderList, setShowProviderList] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [initialLocationDone, setInitialLocationDone] = useState(false);

  // Location filters
  const [states, setStates] = useState<any[]>([]);
  const [lgas, setLgas] = useState<any[]>([]);
  const [selectedState, setSelectedState] = useState('');
  const [selectedLga, setSelectedLga] = useState('');

  // Load Google Maps
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,
    libraries: ['places'],
  });

  // Fetch states on mount
  useEffect(() => {
    supabase
      .from('lga_centers')
      .select('state_id, state_name')
      .order('state_name')
      .then(({ data }) => {
        if (data) {
          const unique = data.filter((v, i, a) => a.findIndex(t => t.state_id === v.state_id) === i);
          setStates(unique);
        }
      });
  }, []);

  // Fetch LGAs when state changes
  useEffect(() => {
    if (!selectedState) { setLgas([]); return; }
    supabase
      .from('lga_centers')
      .select('lga_id, lga_name, lat, lng')
      .eq('state_id', parseInt(selectedState))
      .order('lga_name')
      .then(({ data }) => setLgas(data || []));
  }, [selectedState]);

  // Zoom to LGA when selected
  const handleLgaSelect = useCallback((lgaId: number) => {
    setSelectedLga(lgaId.toString());
    const lga = lgas.find(l => l.lga_id === lgaId);
    if (lga?.lat && lga?.lng && mapRef.current) {
      mapRef.current.setCenter({ lat: lga.lat, lng: lga.lng });
      mapRef.current.setZoom(14);
    }
  }, [lgas]);

  // Query providers
  const { data: allProviders, isLoading } = useQuery({
    queryKey: ['map-providers', userLocation?.lat, userLocation?.lng],
    queryFn: async () => {
      const { data: providers, error } = await supabase
        .from('providers')
        .select('*')
        .eq('is_available', true)
        .limit(200);
      if (error) throw error;
      if (!providers?.length) return [];

      const ids = providers.map(p => p.id);
      const { data: profiles } = await supabase.from('profiles').select('*').in('id', ids);
      const profileMap = new Map(profiles?.map(p => [p.id, p]));

      return providers.map(provider => {
        const p = profileMap.get(provider.id) || null;
        const distance = userLocation && p?.lat && p?.lng
          ? calculateDistance(userLocation.lat, userLocation.lng, p.lat, p.lng)
          : undefined;
        return { ...provider, profile: p, distance } as MapProvider;
      });
    },
    staleTime: 1000 * 60 * 5,
  });

  // Filter providers
  const providersWithCoords = useMemo(() => {
    let filtered = (allProviders || []).filter(p => {
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return (
          p.business_name?.toLowerCase().includes(term) ||
          p.profile?.full_name?.toLowerCase().includes(term) ||
          p.selected_category_slug?.toLowerCase().includes(term)
        );
      }
      if (selectedLga && p.profile?.lga_id?.toString() !== selectedLga) return false;
      return p.profile?.lat && p.profile?.lng;
    });

    // Spread markers that share same coordinates
    const groups = new Map<string, MapProvider[]>();
    filtered.forEach(p => {
      const key = `${p.profile!.lat},${p.profile!.lng}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(p);
    });
    const result: MapProvider[] = [];
    groups.forEach(providers => {
      if (providers.length === 1) {
        result.push({ ...providers[0], display_lat: providers[0].profile!.lat!, display_lng: providers[0].profile!.lng! });
      } else {
        providers.forEach((p, idx) => {
          const angle = (2 * Math.PI * idx) / providers.length;
          const offset = 0.002;
          result.push({
            ...p,
            display_lat: p.profile!.lat! + offset * Math.cos(angle),
            display_lng: p.profile!.lng! + offset * Math.sin(angle),
          });
        });
      }
    });
    return result;
  }, [allProviders, searchTerm, selectedLga]);

  // Get initial user location
  useEffect(() => {
    if (initialLocationDone) return;
    if (!navigator.geolocation) { setInitialLocationDone(true); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);
        if (mapRef.current) {
          mapRef.current.setCenter(loc);
          mapRef.current.setZoom(14);
        }
        setInitialLocationDone(true);
      },
      () => setInitialLocationDone(true),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [initialLocationDone]);

  const handleLocate = () => {
    if (!navigator.geolocation) { toast.error('Geolocation not supported'); return; }
    toast.loading('Getting your location...', { id: 'locate' });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);
        if (mapRef.current) {
          mapRef.current.setCenter(loc);
          mapRef.current.setZoom(16);
        }
        toast.success('Location found', { id: 'locate' });
      },
      (err) => {
        let message = 'Unable to get your location. ';
        if (err.code === 1) message += 'Please allow location access.';
        else if (err.code === 2) message += 'Location unavailable.';
        else if (err.code === 3) message += 'Request timed out.';
        toast.error(message, { id: 'locate' });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  if (!isLoaded) {
    return <div className="h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" /></div>;
  }

  return (
    <div className={cn(
      'relative',
      isFullscreen ? 'fixed inset-0 z-50' : 'h-[calc(100vh-64px-56px)] md:h-[calc(100vh-64px)]'
    )}>
      {/* Top bar */}
      <div className="absolute top-3 left-3 right-3 z-10 flex gap-2">
        <div className="flex-1 relative max-w-[200px] sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search…"
            className="w-full pl-9 pr-8 py-2.5 bg-white rounded-lg shadow-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="flex gap-1">
          <select
            value={selectedState}
            onChange={(e) => { setSelectedState(e.target.value); setSelectedLga(''); }}
            className="text-xs bg-white border border-gray-200 rounded-lg px-2 py-2 w-[80px] sm:w-[120px]"
          >
            <option value="">State</option>
            {states.map(s => <option key={s.state_id} value={s.state_id}>{s.state_name}</option>)}
          </select>
          {selectedState && (
            <select
              value={selectedLga}
              onChange={(e) => handleLgaSelect(parseInt(e.target.value))}
              className="text-xs bg-white border border-gray-200 rounded-lg px-2 py-2 w-[80px] sm:w-[120px]"
            >
              <option value="">LGA</option>
              {lgas.map(l => <option key={l.lga_id} value={l.lga_id}>{l.lga_name}</option>)}
            </select>
          )}
        </div>
      </div>

      {/* Right buttons */}
      <div className="absolute top-20 right-3 z-10 flex flex-col gap-2">
        <button onClick={() => setIsFullscreen(!isFullscreen)} className="bg-white p-2.5 rounded-lg shadow-lg border border-gray-200">
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </button>
        <button onClick={() => setShowProviderList(!showProviderList)} className="bg-white p-2.5 rounded-lg shadow-lg border border-gray-200">
          {showProviderList ? <MapIcon className="h-4 w-4" /> : <List className="h-4 w-4" />}
        </button>
        <button onClick={handleLocate} className="bg-white p-2.5 rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50 transition">
          <LocateFixed className="h-4 w-4 text-primary-600" />
        </button>
      </div>

      {/* Map and sidebar */}
      <div className="flex h-full">
        <div className={cn('flex-1', !showProviderList && 'w-full')}>
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={defaultCenter}
            zoom={7}
            onLoad={(map) => { mapRef.current = map; }}
            options={{
              restriction: { latLngBounds: nigeriaBounds, strictBounds: false },
              minZoom: 6,
              streetViewControl: false,
              mapTypeControl: false,
              fullscreenControl: false,
              zoomControl: false,
            }}
          >
            {/* Provider markers */}
            {providersWithCoords.map(provider => (
              <Marker
                key={provider.id}
                position={{ lat: provider.display_lat!, lng: provider.display_lng! }}
                onClick={() => setSelectedProvider(provider)}
                icon={{
                  url: provider.status === 'available' ? '/marker-green.png' : provider.status === 'busy' ? '/marker-yellow.png' : '/marker-red.png',
                  scaledSize: new google.maps.Size(36, 36),
                }}
              />
            ))}

            {/* User location marker */}
            {userLocation && (
              <Marker
                position={userLocation}
                icon={{
                  path: google.maps.SymbolPath.CIRCLE,
                  scale: 8,
                  fillColor: '#3b82f6',
                  fillOpacity: 1,
                  strokeColor: '#fff',
                  strokeWeight: 2,
                }}
              />
            )}

            {/* Selected provider InfoWindow */}
            {selectedProvider && (
              <InfoWindow
                position={{ lat: selectedProvider.display_lat!, lng: selectedProvider.display_lng! }}
                onCloseClick={() => setSelectedProvider(null)}
              >
                <div className="w-56 font-sans text-sm">
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {selectedProvider.business_name || selectedProvider.profile?.full_name || 'Provider'}
                  </h4>
                  <p className="text-gray-500">{selectedProvider.profile?.lga_name || ''}</p>
                  {selectedProvider.distance !== undefined && (
                    <p className="font-medium text-gray-700 mt-1">{selectedProvider.distance.toFixed(1)} km away</p>
                  )}
                  <a href={`/provider/${selectedProvider.id}`} className="block mt-2 text-center bg-primary-600 text-white py-1.5 rounded-md text-xs font-medium hover:bg-primary-700">
                    View Details →
                  </a>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>

          {/* Mobile bottom sheet */}
          {selectedProvider && (
            <div className="absolute bottom-20 left-0 right-0 flex justify-center z-10 md:hidden animate-slide-up">
              <ProviderMapCard
                provider={selectedProvider}
                distance={selectedProvider.distance}
                onClose={() => setSelectedProvider(null)}
                compact
              />
            </div>
          )}

          {/* Desktop card */}
          {selectedProvider && (
            <div className="hidden md:flex absolute top-20 right-4 z-10">
              <div className="relative">
                <button onClick={() => setSelectedProvider(null)} className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow z-10">
                  <X className="h-4 w-4" />
                </button>
                <ProviderMapCard provider={selectedProvider} distance={selectedProvider.distance} />
              </div>
            </div>
          )}
        </div>

        {/* Desktop provider list sidebar */}
        {showProviderList && (
          <div className="hidden md:block w-80 border-l border-gray-200 bg-white overflow-y-auto">
            <div className="p-4 border-b sticky top-0 bg-white">
              <h3 className="font-semibold text-gray-900">
                {isLoading ? 'Searching providers…' : `${providersWithCoords.length} provider${providersWithCoords.length !== 1 ? 's' : ''} found`}
              </h3>
            </div>
            <div className="p-3 space-y-3">
              {isLoading ? (
                <div className="space-y-2">{Array(3).fill(0).map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />)}</div>
              ) : (
                providersWithCoords.map(provider => (
                  <button
                    key={provider.id}
                    onClick={() => {
                      setSelectedProvider(provider);
                      if (provider.display_lat && provider.display_lng && mapRef.current) {
                        mapRef.current.setCenter({ lat: provider.display_lat, lng: provider.display_lng });
                        mapRef.current.setZoom(17);
                      }
                    }}
                    className={cn(
                      'w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition',
                      selectedProvider?.id === provider.id ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex-shrink-0 overflow-hidden">
                        {provider.profile?.avatar_url ? (
                          <img src={provider.profile.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-sm font-bold text-primary-600 bg-primary-50">
                            {(provider.business_name || 'P')[0]}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm text-gray-900 truncate">
                          {provider.business_name || provider.profile?.full_name || 'Unnamed'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {provider.profile?.lga_name || 'Location not set'}
                          {provider.distance !== undefined && ` • ${provider.distance.toFixed(1)} km`}
                        </p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}