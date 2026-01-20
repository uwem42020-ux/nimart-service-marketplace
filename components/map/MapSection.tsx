'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { 
  MapPin, Navigation, ZoomIn, ZoomOut, 
  Maximize2, Minimize2, X, Filter, 
  ChevronLeft, User, CheckCircle, Clock,
  Loader2, AlertCircle, WifiOff, RefreshCw,
  Star
} from 'lucide-react'
import { UserLocation } from '@/lib/types'
import { 
  MapProvider, 
  ProviderMarker as ProviderMarkerType,
  NIGERIA_DEFAULT_CENTER,
  NIGERIA_BOUNDS 
} from '@/lib/map-types'
import { 
  providersToMarkers, 
  filterProvidersByDistance,
  calculateMapBounds,
  getInitialZoomLevel
} from '@/lib/map-utils'
import { getMapProviders, getMapSettings } from '@/lib/map-services'

// Dynamically import components to avoid SSR issues
const MapContainer = dynamic(() => import('./MapContainer'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
      <Loader2 className="h-8 w-8 text-primary animate-spin" />
    </div>
  )
})
const ProviderMarker = dynamic(() => import('./ProviderMarker'), { ssr: false })
const UserLocationMarker = dynamic(() => import('./UserLocationMarker'), { ssr: false })
const MapControls = dynamic(() => import('./MapControls'), { ssr: false })
const MapFilterModal = dynamic(() => import('./MapFilterModal'), { ssr: false })
const MapSkeleton = dynamic(() => import('./MapSkeleton'), { ssr: false })

// Helper function to clean up Leaflet maps
const cleanupLeafletMaps = () => {
  if (typeof window === 'undefined') return;
  
  // Remove all leaflet containers
  document.querySelectorAll('.leaflet-container').forEach(container => {
    container.remove();
  });
  
  // Remove leaflet panes
  document.querySelectorAll('.leaflet-pane').forEach(pane => {
    pane.remove();
  });
  
  // Remove leaflet controls
  document.querySelectorAll('.leaflet-control').forEach(control => {
    control.remove();
  });
};

interface MapSectionProps {
  userLocation: UserLocation
  isMobile?: boolean
  className?: string
}

interface MapFilters {
  serviceType: string
  verificationStatus: 'all' | 'verified' | 'unverified' | 'pending'
  minRating: number
  maxDistance: number
  showOnlineOnly: boolean
}

const DEFAULT_FILTERS: MapFilters = {
  serviceType: '',
  verificationStatus: 'all',
  minRating: 0,
  maxDistance: 100,
  showOnlineOnly: false
}

export default function MapSection({ 
  userLocation, 
  isMobile = false,
  className = ''
}: MapSectionProps) {
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadingProviders, setLoadingProviders] = useState(true)
  const [providers, setProviders] = useState<MapProvider[]>([])
  const [filteredProviders, setFilteredProviders] = useState<MapProvider[]>([])
  const [markers, setMarkers] = useState<ProviderMarkerType[]>([])
  const [mapFilters, setMapFilters] = useState<MapFilters>(DEFAULT_FILTERS)
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [mapSettings, setMapSettings] = useState<any>(null)
  const [onlineStatus, setOnlineStatus] = useState(true)
  const [detectingLocation, setDetectingLocation] = useState(false)
  const [shouldRenderMap, setShouldRenderMap] = useState(false)
  const [mapVersion, setMapVersion] = useState(0)
  
  const mapRef = useRef<any>(null)
  const lastUpdateRef = useRef<number>(0)
  const UPDATE_THROTTLE_MS = 30000 // 30 seconds

  // Check if client-side and clean up existing maps
  useEffect(() => {
    setIsClient(true)
    setOnlineStatus(navigator.onLine)
    
    // Clean up any existing maps
    cleanupLeafletMaps()
    
    // Delay map rendering to prevent initialization conflicts
    const timer = setTimeout(() => {
      setShouldRenderMap(true)
    }, 150)
    
    const handleOnlineStatus = () => {
      setOnlineStatus(navigator.onLine)
      if (navigator.onLine && providers.length === 0) {
        loadMapData()
      }
    }
    
    window.addEventListener('online', handleOnlineStatus)
    window.addEventListener('offline', handleOnlineStatus)
    
    return () => {
      clearTimeout(timer)
      window.removeEventListener('online', handleOnlineStatus)
      window.removeEventListener('offline', handleOnlineStatus)
      
      // Clean up map on unmount
      if (mapRef.current && typeof mapRef.current.remove === 'function') {
        try {
          mapRef.current.remove()
          console.log('🗺️ Map instance removed on unmount')
        } catch (error) {
          console.log('Map cleanup error:', error)
        }
      }
      
      // Extra cleanup
      cleanupLeafletMaps()
    }
  }, [])

  // Initialize map settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await getMapSettings()
        setMapSettings(settings)
      } catch (error) {
        console.error('Failed to load map settings:', error)
      }
    }
    
    if (isClient) {
      loadSettings()
    }
  }, [isClient])

  // Load map data
  const loadMapData = useCallback(async () => {
    if (!onlineStatus) return
    
    setLoadingProviders(true)
    
    try {
      console.log('📍 Loading map providers...')
      
      // Get providers from database
      const mapProviders = await getMapProviders(
        userLocation.state && userLocation.lga 
          ? { lat: userLocation.coordinates?.latitude || 9.0765, lng: userLocation.coordinates?.longitude || 7.3986 }
          : undefined
      )
      
      console.log(`✅ Loaded ${mapProviders.length} providers for map`)
      console.log('📊 Providers with coordinates:', 
        mapProviders.filter(p => p.latitude && p.longitude).length
      )
      
      setProviders(mapProviders)
      
      // Apply initial filters
      applyFilters(mapFilters, mapProviders)
      
      // Set initial markers
      const userLoc = userLocation.coordinates 
        ? { lat: userLocation.coordinates.latitude, lng: userLocation.coordinates.longitude }
        : undefined
      
      const initialMarkers = providersToMarkers(mapProviders, userLoc)
      console.log(`📍 Created ${initialMarkers.length} markers`)
      setMarkers(initialMarkers)
      
    } catch (error) {
      console.error('❌ Error loading map data:', error)
    } finally {
      setLoadingProviders(false)
      setLoading(false)
    }
  }, [userLocation, onlineStatus, mapFilters])

  // Initial data load
  useEffect(() => {
    if (isClient && onlineStatus && shouldRenderMap) {
      loadMapData()
    }
  }, [isClient, onlineStatus, shouldRenderMap, loadMapData])

  // Apply filters to providers
  const applyFilters = useCallback((filters: MapFilters, providerList?: MapProvider[]) => {
    const providersToFilter = providerList || providers
    
    let filtered = [...providersToFilter]
    
    // Filter by service type
    if (filters.serviceType) {
      filtered = filtered.filter(p => 
        p.service_type?.toLowerCase().includes(filters.serviceType.toLowerCase())
      )
    }
    
    // Filter by verification status
    if (filters.verificationStatus !== 'all') {
      filtered = filtered.filter(p => {
        if (filters.verificationStatus === 'verified') {
          return p.is_verified && p.verification_status === 'verified'
        } else if (filters.verificationStatus === 'pending') {
          return p.verification_status === 'pending'
        } else if (filters.verificationStatus === 'unverified') {
          return !p.is_verified && p.verification_status === 'unverified'
        }
        return true
      })
    }
    
    // Filter by rating
    if (filters.minRating > 0) {
      filtered = filtered.filter(p => p.rating >= filters.minRating)
    }
    
    // Filter by distance (if user location available)
    if (userLocation.coordinates && filters.maxDistance < 1000) {
      filtered = filterProvidersByDistance(
        filtered,
        { lat: userLocation.coordinates.latitude, lng: userLocation.coordinates.longitude },
        filters.maxDistance
      )
    }
    
    // Filter by online status
    if (filters.showOnlineOnly) {
      filtered = filtered.filter(p => p.is_online)
    }
    
    setFilteredProviders(filtered)
    
    // Update markers
    const userLoc = userLocation.coordinates 
      ? { lat: userLocation.coordinates.latitude, lng: userLocation.coordinates.longitude }
      : undefined
    
    const newMarkers = providersToMarkers(filtered, userLoc)
    setMarkers(newMarkers)
  }, [providers, userLocation])

  // Handle filter changes
  const handleApplyFilters = (newFilters: MapFilters) => {
    setMapFilters(newFilters)
    applyFilters(newFilters)
  }

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
    
    if (!isFullscreen) {
      // Enter fullscreen
      document.body.style.overflow = 'hidden'
    } else {
      // Exit fullscreen
      document.body.style.overflow = 'auto'
    }
    
    // Force map to re-render after fullscreen change
    setTimeout(() => {
      if (mapRef.current && typeof mapRef.current.invalidateSize === 'function') {
        mapRef.current.invalidateSize()
      }
    }, 100)
  }

  // Handle closing fullscreen
  const handleCloseFullscreen = () => {
    setIsFullscreen(false)
    document.body.style.overflow = 'auto'
    
    // Force map resize
    setTimeout(() => {
      if (mapRef.current && typeof mapRef.current.invalidateSize === 'function') {
        mapRef.current.invalidateSize()
      }
    }, 100)
  }

  // Locate user on map - FIXED VERSION
  const handleLocateUser = async () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser')
      return
    }
    
    setDetectingLocation(true)
    
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        })
      })
      
      const { latitude, longitude } = position.coords
      
      // Save to localStorage (this will update the parent component on next load)
      const newLocation = {
        coordinates: { latitude, longitude },
        detected: true,
        state: userLocation.state,
        lga: userLocation.lga
      }
      localStorage.setItem('nimart-user-location', JSON.stringify(newLocation))
      
      // Center map on user location
      if (mapRef.current) {
        const map = mapRef.current
        if (map && typeof map.setView === 'function') {
          map.setView([latitude, longitude], 13)
        }
      }
      
      // Show success message
      alert('📍 Location detected! Map centered on your position.')
      
    } catch (error: any) {
      console.error('Location error:', error)
      alert('Unable to get your location. Please ensure location services are enabled.')
    } finally {
      setDetectingLocation(false)
    }
  }

  // Handle provider click
  const handleProviderClick = (providerId: string) => {
    if (isFullscreen) {
      handleCloseFullscreen()
    }
    router.push(`/providers/${providerId}`)
  }

  // Calculate map center and zoom - FIXED TYPE ISSUE
  const getMapCenter = (): [number, number] => {
    if (userLocation.coordinates) {
      return [userLocation.coordinates.latitude, userLocation.coordinates.longitude]
    }
    
    // Default to Abuja, Nigeria
    return [NIGERIA_DEFAULT_CENTER.lat, NIGERIA_DEFAULT_CENTER.lng]
  }

  const getMapZoom = (): number => {
    return mapSettings?.desktop_settings?.initial_zoom || 
           (isMobile ? 10 : 7)
  }

  // Get bounds for all markers
  const getMapBounds = () => {
    if (markers.length > 0) {
      return calculateMapBounds(markers)
    }
    return [
      [NIGERIA_BOUNDS.south, NIGERIA_BOUNDS.west],
      [NIGERIA_BOUNDS.north, NIGERIA_BOUNDS.east]
    ]
  }

  // Refresh map data
  const handleRefresh = () => {
    const now = Date.now()
    if (now - lastUpdateRef.current < UPDATE_THROTTLE_MS) {
      return // Throttle updates
    }
    
    lastUpdateRef.current = now
    loadMapData()
  }

  // Force map resize after data loads
  useEffect(() => {
    if (!loading && !loadingProviders && mapRef.current) {
      const resizeMap = () => {
        if (mapRef.current && typeof mapRef.current.invalidateSize === 'function') {
          setTimeout(() => {
            try {
              mapRef.current.invalidateSize()
              console.log('🗺️ Map size invalidated after data load')
            } catch (error) {
              console.log('Map resize error:', error)
            }
          }, 200)
        }
      }
      
      resizeMap()
      
      // Also resize on window resize
      const handleResize = () => {
        resizeMap()
      }
      
      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }
  }, [loading, loadingProviders])

  // Statistics
  const verifiedCount = providers.filter(p => p.is_verified).length
  const nearbyCount = filteredProviders.length
  const onlineCount = providers.filter(p => p.is_online).length

  // Render loading state
  if (!isClient || loading || !shouldRenderMap) {
    return <MapSkeleton isMobile={isMobile} />
  }

  // Render offline state
  if (!onlineStatus) {
    return (
      <div className={`bg-gray-50 rounded-2xl border border-gray-200 p-8 text-center ${className}`} style={{ height: isFullscreen ? '100vh' : '500px' }}>
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-6">
          <WifiOff className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold mb-2 text-gray-900">Offline Mode</h3>
        <p className="text-gray-600 mb-4">Map requires internet connection to load providers.</p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-green-700 font-medium"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry Connection
        </button>
      </div>
    )
  }

  // Render mobile preview (non-fullscreen)
  if (isMobile && !isFullscreen) {
    return (
      <div className={`bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden ${className}`}>
        {/* Map Preview Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <MapPin className="h-5 w-5 text-primary mr-2" />
              <h3 className="font-semibold text-gray-900">Nigerian Service Map</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                {nearbyCount} nearby
              </span>
              <button
                onClick={toggleFullscreen}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Open fullscreen map"
              >
                <Maximize2 className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="mt-3 grid grid-cols-3 gap-2">
            <div className="text-center p-2 bg-green-50 rounded-lg">
              <div className="text-sm font-semibold text-green-700">{verifiedCount}</div>
              <div className="text-xs text-green-600">Verified</div>
            </div>
            <div className="text-center p-2 bg-blue-50 rounded-lg">
              <div className="text-sm font-semibold text-blue-700">{onlineCount}</div>
              <div className="text-xs text-blue-600">Online</div>
            </div>
            <div className="text-center p-2 bg-purple-50 rounded-lg">
              <div className="text-sm font-semibold text-purple-700">{providers.length}</div>
              <div className="text-xs text-purple-600">Total</div>
            </div>
          </div>
        </div>
        
        {/* Mini Map Preview */}
        <div 
          className="mobile-map-preview cursor-pointer relative"
          onClick={toggleFullscreen}
          style={{ height: '250px' }}
        >
          {loadingProviders ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
          ) : (
            <>
              {/* Map Container */}
              <div className="absolute inset-0">
                <MapContainer
                  center={getMapCenter()}
                  zoom={10}
                  className="h-full w-full"
                  innerRef={mapRef}
                >
                  {/* User Location */}
                  {userLocation.coordinates && (
                    <UserLocationMarker
                      position={[userLocation.coordinates.latitude, userLocation.coordinates.longitude]}
                      isPulsing={true}
                    />
                  )}
                  
                  {/* Sample markers (show only a few for preview) */}
                  {markers.slice(0, 5).map(marker => (
                    <ProviderMarker
                      key={marker.id}
                      marker={marker}
                      onClick={handleProviderClick}
                    />
                  ))}
                  
                  <MapControls
                    userLocation={userLocation.coordinates ? [userLocation.coordinates.latitude, userLocation.coordinates.longitude] : null}
                  />
                </MapContainer>
              </div>
              
              {/* Overlay with CTA */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent flex items-end">
                <div className="p-4 text-white w-full">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Tap to explore full map</p>
                      <p className="text-xs opacity-90">{nearbyCount} providers near you</p>
                    </div>
                    <div className="bg-white text-gray-900 px-3 py-1 rounded-full text-sm font-medium">
                      View Map
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
        
        {/* Quick Actions */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex justify-between">
            <button
              onClick={() => setShowFilterModal(true)}
              className="flex items-center text-sm text-gray-600 hover:text-gray-900"
            >
              <Filter className="h-4 w-4 mr-1" />
              Filter
            </button>
            <button
              onClick={handleLocateUser}
              disabled={detectingLocation}
              className="flex items-center text-sm text-primary hover:text-green-700"
            >
              {detectingLocation ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Navigation className="h-4 w-4 mr-1" />
              )}
              {detectingLocation ? 'Locating...' : 'Find Me'}
            </button>
            <button
              onClick={handleRefresh}
              disabled={loadingProviders}
              className="flex items-center text-sm text-gray-600 hover:text-gray-900"
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${loadingProviders ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Render full map (desktop or mobile fullscreen)
  return (
    <>
      {/* Filter Modal */}
      <MapFilterModal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApplyFilters={handleApplyFilters}
        currentFilters={mapFilters}
      />
      
      {/* Fullscreen Map */}
      <div className={`${isFullscreen ? 'mobile-fullscreen-map' : `desktop-map ${className}`}`}>
        {/* Mobile Fullscreen Header */}
        {isFullscreen && (
          <div className="mobile-map-header">
            <div className="flex items-center">
              <button
                onClick={handleCloseFullscreen}
                className="p-2 mr-3 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Back to homepage"
              >
                <ChevronLeft className="h-5 w-5 text-gray-700" />
              </button>
              <div>
                <h2 className="font-bold text-gray-900">Nigerian Service Map</h2>
                <p className="text-sm text-gray-600">
                  {markers.length} providers • {userLocation.state || 'Nigeria'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilterModal(true)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Filter providers"
              >
                <Filter className="h-5 w-5 text-gray-700" />
              </button>
              <button
                onClick={handleCloseFullscreen}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close map"
              >
                <X className="h-5 w-5 text-gray-700" />
              </button>
            </div>
          </div>
        )}
        
        {/* Map Container */}
        <div className={isFullscreen ? 'mobile-map-content' : 'h-full'}>
          <MapContainer
            key={`map-container-${mapVersion}-${isFullscreen ? 'fullscreen' : 'normal'}`}
            center={getMapCenter()}
            zoom={getMapZoom()}
            innerRef={mapRef}
            isFullscreen={isFullscreen}
            className={isFullscreen ? 'h-full' : 'h-full'}
          >
            {/* Provider Markers */}
            {markers.map(marker => (
              <ProviderMarker
                key={marker.id}
                marker={marker}
                onClick={handleProviderClick}
              />
            ))}
            
            {/* User Location */}
            {userLocation.coordinates && (
              <UserLocationMarker
                position={[userLocation.coordinates.latitude, userLocation.coordinates.longitude]}
                accuracy={50}
                isPulsing={true}
              />
            )}
            
            {/* Map Controls */}
            <MapControls
              onLocateUser={handleLocateUser}
              onToggleFullscreen={isMobile ? toggleFullscreen : undefined}
              isFullscreen={isFullscreen}
              onCloseFullscreen={isFullscreen ? handleCloseFullscreen : undefined}
              onFilterClick={() => setShowFilterModal(true)}
              userLocation={userLocation.coordinates ? [userLocation.coordinates.latitude, userLocation.coordinates.longitude] : null}
            />
          </MapContainer>
        </div>
        
        {/* Desktop Map Stats Footer */}
        {!isFullscreen && !isMobile && (
          <div className="absolute bottom-4 left-4 right-4 z-[1000]">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-gray-200 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span className="text-sm font-medium">{verifiedCount} verified</span>
                  </div>
                  <div className="flex items-center">
                    <User className="h-4 w-4 text-blue-600 mr-2" />
                    <span className="text-sm font-medium">{onlineCount} online</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 text-primary mr-2" />
                    <span className="text-sm font-medium">{markers.length} nearby</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowFilterModal(true)}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium flex items-center"
                  >
                    <Filter className="h-4 w-4 mr-1" />
                    Filter
                  </button>
                  <button
                    onClick={handleRefresh}
                    disabled={loadingProviders}
                    className="px-3 py-1.5 bg-primary hover:bg-green-700 text-white rounded-lg text-sm font-medium flex items-center"
                  >
                    <RefreshCw className={`h-4 w-4 mr-1 ${loadingProviders ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                </div>
              </div>
              
              {/* Current Filters Display */}
              {(mapFilters.serviceType || mapFilters.verificationStatus !== 'all' || mapFilters.minRating > 0) && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center flex-wrap gap-2">
                    <span className="text-xs text-gray-500">Active filters:</span>
                    {mapFilters.serviceType && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {mapFilters.serviceType}
                      </span>
                    )}
                    {mapFilters.verificationStatus !== 'all' && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        {mapFilters.verificationStatus}
                      </span>
                    )}
                    {mapFilters.minRating > 0 && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                        {mapFilters.minRating}+ stars
                      </span>
                    )}
                    {mapFilters.showOnlineOnly && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                        Online only
                      </span>
                    )}
                    <button
                      onClick={() => handleApplyFilters(DEFAULT_FILTERS)}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      Clear all
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  )
}