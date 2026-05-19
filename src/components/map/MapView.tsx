// src/components/map/MapView.tsx
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { calculateDistance } from '../../lib/distance';
import { createProviderMarkerIcon } from './ProviderMarkerIcon';
import { ProviderMapCard } from './ProviderMapCard';
import { Search, X, LocateFixed, Maximize2, Minimize2, Map as MapIcon, List, Layers } from 'lucide-react';
import { cn } from '../../lib/utils';
import toast from 'react-hot-toast';
import type { Database } from '../../types/database';

// Types
type ProviderRow = Database['public']['Tables']['providers']['Row'];
type ProfileRow = Database['public']['Tables']['profiles']['Row'];

interface MapProvider extends ProviderRow {
  profile: ProfileRow | null;
  distance?: number;
  display_lat?: number;
  display_lng?: number;
}

// Constants
const NIGERIA_BOUNDS: L.LatLngBoundsExpression = [
  [4.0, 2.0],
  [14.0, 15.0],
];

const lgaBoundaryStyle = {
  color: '#5a7a6a',
  weight: 0.8,
  opacity: 0.5,
  fillOpacity: 0.0,
  dashArray: '3 3',
};

const lgaBoundaryHoverStyle = {
  color: '#008751',
  weight: 2,
  opacity: 0.9,
  fillOpacity: 0.08,
  dashArray: '',
};

// Helper: create pulsing provider marker icon
function createPulsingProviderIcon(status: string, avatarUrl?: string | null, isSelected = false) {
  const size = isSelected ? 52 : 42;
  const statusColors: Record<string, string> = { available: '#22c55e', busy: '#eab308', away: '#ef4444' };
  const statusColor = statusColors[status] || '#6b7280';

  return L.divIcon({
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%);">
        <div style="position: relative;">
          <div style="width: ${size}px; height: ${size}px; border-radius: 50%; overflow: hidden; border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.2); background: #f3f4f6; z-index: 2; position: relative;">
            ${avatarUrl ? `<img src="${avatarUrl}" alt="" style="width:100%;height:100%;object-fit:cover;" />` : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:${size * 0.4}px;font-weight:600;color:#008751;">?</div>`}
          </div>
          <div style="position: absolute; top: 50%; left: 50%; width: ${size + 12}px; height: ${size + 12}px; margin-left: -${(size + 12) / 2}px; margin-top: -${(size + 12) / 2}px; border: 2px solid #008751; border-radius: 50%; animation: providerPulse 2s infinite; z-index: 1;"></div>
        </div>
        <div style="position: absolute; bottom: 2px; right: 2px; width: ${size * 0.33}px; height: ${size * 0.33}px; background: ${statusColor}; border: 2px solid white; border-radius: 50%; z-index: 3;"></div>
      </div>
    `,
    className: 'provider-marker',
    iconSize: [size + 12, size + 12],
    iconAnchor: [(size + 12) / 2, size + 12],
    popupAnchor: [0, -(size + 12)],
  });
}

// Helper: create user location icon (blue pulsing dot)
function createUserLocationIcon() {
  return L.divIcon({
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%);">
        <div style="position: relative;">
          <div style="width: 16px; height: 16px; background: #3b82f6; border: 3px solid white; border-radius: 50%; box-shadow: 0 0 12px rgba(59,130,246,0.5); position: relative; z-index: 2;"></div>
          <div style="position: absolute; top: 50%; left: 50%; width: 36px; height: 36px; margin-left: -18px; margin-top: -18px; border: 2px solid rgba(59,130,246,0.3); border-radius: 50%; animation: userLocationPulse 2s infinite; z-index: 1;"></div>
        </div>
        <div style="font-size: 11px; color: #3b82f6; font-weight: 600; text-shadow: 0 0 4px white, 0 0 4px white; margin-top: 2px; white-space: nowrap;">Your Location</div>
      </div>
    `,
    className: '',
    iconSize: [40, 60],
    iconAnchor: [20, 60],
  });
}

// ----------------------------------------------------------------------
// Subcomponents that need useMap (must be inside MapContainer)
// ----------------------------------------------------------------------

function MapBoundsController() {
  const map = useMap();
  useEffect(() => {
    map.setMinZoom(6);
    map.setMaxBounds(NIGERIA_BOUNDS);
  }, [map]);
  return null;
}

// Component to display user location marker (blue dot)
function UserLocationMarker({ position }: { position: [number, number] | null }) {
  const map = useMap();
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!position) {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      return;
    }
    if (markerRef.current) {
      markerRef.current.setLatLng(position);
    } else {
      const icon = createUserLocationIcon();
      markerRef.current = L.marker(position, { icon, zIndexOffset: 1000 }).addTo(map);
    }
  }, [position, map]);

  return null;
}

// LGA boundaries layer
function LGABoundaries({ onLgaClick }: { onLgaClick: (lgaId: number) => void }) {
  const map = useMap();
  const [geoJsonData, setGeoJsonData] = useState<any>(null);

  const onEachFeature = useCallback(
    (feature: any, layer: L.Layer) => {
      const lgaId = feature.properties.uniq_id;
      const lgaName = feature.properties.lga_name;
      const stateName = feature.properties.state_name;
      layer.bindTooltip(`${lgaName}, ${stateName}`, { sticky: true, direction: 'top', className: 'lga-tooltip' });
      layer.on('click', () => onLgaClick(lgaId));
      layer.on('mouseover', () => { if (layer instanceof L.Path) layer.setStyle(lgaBoundaryHoverStyle); });
      layer.on('mouseout', () => { if (layer instanceof L.Path) layer.setStyle(lgaBoundaryStyle); });
    },
    [onLgaClick]
  );

  useEffect(() => {
    const fetchBoundaries = async () => {
      const bounds = map.getBounds();
      const sw = bounds.getSouthWest();
      const ne = bounds.getNorthEast();
      const { data, error } = await supabase.rpc('get_lga_boundaries_in_box', {
        sw_lng: sw.lng,
        sw_lat: sw.lat,
        ne_lng: ne.lng,
        ne_lat: ne.lat,
      });
      if (!error && data) {
        const features = data.map((row: any) => ({
          type: 'Feature',
          properties: { uniq_id: row.uniq_id, lga_name: row.lga_name, state_name: row.state_name },
          geometry: JSON.parse(row.boundary_json),
        }));
        setGeoJsonData({ type: 'FeatureCollection', features });
      }
    };
    fetchBoundaries();
  }, [map]);

  if (!geoJsonData) return null;
  return <GeoJSON data={geoJsonData} style={lgaBoundaryStyle} onEachFeature={onEachFeature} />;
}

// Right vertical button stack (includes locate button that updates user location)
function MapControlButtons({
  satelliteView,
  setSatelliteView,
  isFullscreen,
  setIsFullscreen,
  showProviderList,
  setShowProviderList,
  onLocationFound,
}: {
  satelliteView: boolean;
  setSatelliteView: (v: boolean) => void;
  isFullscreen: boolean;
  setIsFullscreen: (v: boolean) => void;
  showProviderList: boolean;
  setShowProviderList: (v: boolean) => void;
  onLocationFound: (pos: [number, number]) => void;
}) {
  const map = useMap();

  const handleLocate = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported');
      return;
    }
    toast.loading('Getting your location...', { id: 'locate' });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        map.setView([latitude, longitude], 16);
        onLocationFound([latitude, longitude]);
        toast.success('Location found', { id: 'locate' });
      },
      (err) => {
        console.error(err);
        let message = 'Unable to get your location. ';
        if (err.code === 1) message += 'Please allow location access.';
        else if (err.code === 2) message += 'Location unavailable.';
        else if (err.code === 3) message += 'Request timed out.';
        toast.error(message, { id: 'locate' });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="absolute top-20 right-3 z-[1000] flex flex-col gap-2">
      <button
        onClick={() => setSatelliteView(!satelliteView)}
        className={cn('bg-white p-2.5 rounded-lg shadow-lg border', satelliteView ? 'border-primary-500 text-primary-600' : 'border-gray-200')}
        title={satelliteView ? 'Street View' : 'Satellite'}
      >
        <Layers className="h-4 w-4" />
      </button>
      <button
        onClick={() => setIsFullscreen(!isFullscreen)}
        className="bg-white p-2.5 rounded-lg shadow-lg border border-gray-200"
      >
        {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
      </button>
      <button
        onClick={() => setShowProviderList(!showProviderList)}
        className="bg-white p-2.5 rounded-lg shadow-lg border border-gray-200"
      >
        {showProviderList ? <MapIcon className="h-4 w-4" /> : <List className="h-4 w-4" />}
      </button>
      <button
        onClick={handleLocate}
        className="bg-white p-2.5 rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50 transition"
        title="My Location"
      >
        <LocateFixed className="h-4 w-4 text-primary-600" />
      </button>
    </div>
  );
}

// ----------------------------------------------------------------------
// Main MapView component
// ----------------------------------------------------------------------
export function MapView() {
  const { profile } = useAuth();

  // UI state
  const [mapCenter, setMapCenter] = useState<[number, number]>([9.0765, 7.3986]);
  const [mapZoom, setMapZoom] = useState(7);
  const [selectedProvider, setSelectedProvider] = useState<MapProvider | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showProviderList, setShowProviderList] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [satelliteView, setSatelliteView] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [initialLocationDone, setInitialLocationDone] = useState(false);

  // Location filters (state & LGA)
  const [states, setStates] = useState<any[]>([]);
  const [lgas, setLgas] = useState<any[]>([]);
  const [selectedState, setSelectedState] = useState('');
  const [selectedLga, setSelectedLga] = useState('');

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
    if (!selectedState) {
      setLgas([]);
      return;
    }
    supabase
      .from('lga_centers')
      .select('lga_id, lga_name, lat, lng')
      .eq('state_id', parseInt(selectedState))
      .order('lga_name')
      .then(({ data }) => setLgas(data || []));
  }, [selectedState]);

  // Zoom to LGA when selected
  const handleLgaSelect = useCallback(
    (lgaId: number) => {
      setSelectedLga(lgaId.toString());
      const lga = lgas.find(l => l.lga_id === lgaId);
      if (lga?.lat && lga?.lng) {
        setMapCenter([lga.lat, lga.lng]);
        setMapZoom(14);
      }
    },
    [lgas]
  );

  // Query providers
  const { data: allProviders, isLoading } = useQuery({
    queryKey: ['map-providers', userLocation?.[0], userLocation?.[1]],
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
          ? calculateDistance(userLocation[0], userLocation[1], p.lat, p.lng)
          : undefined;
        return { ...provider, profile: p, distance } as MapProvider;
      });
    },
    staleTime: 1000 * 60 * 5,
  });

  // Filter and de‑duplicate markers
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

  // Get initial user location once and center the map on it
  useEffect(() => {
    if (initialLocationDone) return;
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported');
      setInitialLocationDone(true);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation([latitude, longitude]);
        setMapCenter([latitude, longitude]);
        setMapZoom(14);
        setInitialLocationDone(true);
      },
      (err) => {
        console.warn('Initial location error:', err);
        setInitialLocationDone(true);
        // Don't show toast on initial load – user can click locate button
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [initialLocationDone]);

  // Prevent page drag when panning map on touch devices
  useEffect(() => {
    const container = document.querySelector('.leaflet-container');
    if (container) (container as HTMLElement).style.touchAction = 'none';
  }, []);

  const isLoggedInProvider = profile?.role === 'provider';

  return (
    <>
      <style>{`
        @keyframes userLocationPulse {
          0% { transform: scale(0.8); opacity: 0.6; }
          70% { transform: scale(1.6); opacity: 0; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes providerPulse {
          0% { transform: scale(0.9); opacity: 0.5; }
          70% { transform: scale(1.3); opacity: 0; }
          100% { transform: scale(1.3); opacity: 0; }
        }
        .leaflet-control-attribution { font-size: 10px !important; }
        .lga-tooltip {
          background: white;
          border: none;
          border-radius: 6px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          padding: 4px 8px;
          font-size: 12px;
          font-weight: 500;
          color: #1f2937;
        }
        .leaflet-container {
          touch-action: none;
        }
      `}</style>

      <div className={cn(
        'relative',
        isFullscreen ? 'fixed inset-0 z-50' : 'h-[calc(100vh-64px-56px)] md:h-[calc(100vh-64px)]'
      )}>
        {/* Top bar: search + state/LGA (outside map container) */}
        <div className="absolute top-3 left-3 right-3 z-[1000] flex gap-2">
          <div className="flex-1 relative max-w-[200px] sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search…"
              className="w-full pl-9 pr-4 py-2.5 bg-white rounded-lg shadow-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
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
              onChange={(e) => {
                setSelectedState(e.target.value);
                setSelectedLga('');
              }}
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

        {/* Map and sidebar */}
        <div className="flex h-full">
          <div className={cn('flex-1', !showProviderList && 'w-full')}>
            <MapContainer
              center={mapCenter}
              zoom={mapZoom}
              className="w-full h-full"
              zoomControl={false}
              maxBounds={NIGERIA_BOUNDS}
              maxBoundsViscosity={1.0}
              minZoom={6}
            >
              {satelliteView ? (
                <TileLayer
                  attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                />
              ) : (
                <TileLayer
                  attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
                  url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                />
              )}

              <LGABoundaries onLgaClick={handleLgaSelect} />
              <MapBoundsController />
              <UserLocationMarker position={userLocation} />

              {providersWithCoords.map(provider => {
                const isOwnProvider = isLoggedInProvider && profile?.id === provider.id;
                const icon = isOwnProvider
                  ? createPulsingProviderIcon(provider.status, provider.profile?.avatar_url, selectedProvider?.id === provider.id)
                  : createProviderMarkerIcon(provider.status, provider.profile?.avatar_url, selectedProvider?.id === provider.id);
                return (
                  <Marker
                    key={provider.id}
                    position={[provider.display_lat!, provider.display_lng!]}
                    icon={icon}
                    eventHandlers={{ click: () => setSelectedProvider(provider) }}
                  >
                    <Popup>
                      <div className="w-60 font-body">
                        <h4 className="font-semibold text-gray-900 mb-1">
                          {provider.business_name || provider.profile?.full_name || 'Provider'}
                        </h4>
                        <p className="text-sm text-gray-500">{provider.profile?.lga_name || ''}</p>
                        {provider.distance !== undefined && (
                          <p className="text-sm font-medium text-gray-700 mt-1">
                            {provider.distance.toFixed(1)} km from you
                          </p>
                        )}
                        <a href={`/provider/${provider.id}`} className="block mt-2 text-center bg-primary-600 text-white py-1.5 rounded-md text-sm font-medium hover:bg-primary-700">
                          View Details →
                        </a>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}

              <MapControlButtons
                satelliteView={satelliteView}
                setSatelliteView={setSatelliteView}
                isFullscreen={isFullscreen}
                setIsFullscreen={setIsFullscreen}
                showProviderList={showProviderList}
                setShowProviderList={setShowProviderList}
                onLocationFound={setUserLocation}
              />
            </MapContainer>

            {/* Mobile bottom sheet */}
            {selectedProvider && (
              <div className="absolute bottom-20 left-0 right-0 flex justify-center z-[1000] md:hidden animate-slide-up">
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
              <div className="hidden md:flex absolute top-20 right-4 z-[1000]">
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
                        if (provider.display_lat && provider.display_lng) {
                          setMapCenter([provider.display_lat, provider.display_lng]);
                          setMapZoom(17);
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
    </>
  );
}