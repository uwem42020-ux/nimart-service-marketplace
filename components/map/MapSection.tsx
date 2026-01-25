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
  Star, Compass
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

// Dynamic imports with proper loading states
const MapContainer = dynamic(() => import('./MapContainer'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary mb-1"></div>
        <p className="text-xs text-gray-500">Loading map...</p>
      </div>
    </div>
  )
})

const ProviderMarker = dynamic(() => import('./ProviderMarker'), { 
  ssr: false,
  loading: () => null
})

const UserLocationMarker = dynamic(() => import('./UserLocationMarker'), { 
  ssr: false,
  loading: () => null
})

const MapControls = dynamic(() => import('./MapControls'), { 
  ssr: false,
  loading: () => null
})

const MapFilterModal = dynamic(() => import('./MapFilterModal'), { 
  ssr: false,
  loading: () => null
})

const MapSkeleton = dynamic(() => import('./MapSkeleton'), { 
  ssr: false,
  loading: () => (
    <div className="map-loading">
      <div className="text-center">
        <Loader2 className="h-10 w-10 text-primary animate-spin mx-auto" />
      </div>
    </div>
  )
})

// Helper function to clean up Leaflet maps
const cleanupLeafletMaps = () => {
  if (typeof window === 'undefined') return;
  
  document.querySelectorAll('.leaflet-container').forEach(container => {
    try {
      if (container.parentNode) {
        container.parentNode.removeChild(container);
      }
    } catch (e) {
      // Ignore
    }
  });
};

interface MapSectionProps {
  userLocation: UserLocation
  isMobile?: boolean
  isExpanded?: boolean // ADDED THIS PROP
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
  isExpanded = false, // ADDED DEFAULT VALUE
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
  
  const mapRef = useRef<any>(null)
  const lastUpdateRef = useRef<number>(0)
  const UPDATE_THROTTLE_MS = 30000

  // Check if client-side and clean up existing maps
  useEffect(() => {
    setIsClient(true)
    setOnlineStatus(navigator.onLine)
    
    // Clean up any existing maps
    cleanupLeafletMaps()
    
    // Delay map rendering
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
        } catch (error) {
          console.log('Map cleanup error:', error)
        }
      }
      
      // Extra cleanup
      cleanupLeafletMaps()
    }
  }, [])

  // Handle isExpanded prop changes
  useEffect(() => {
    if (isExpanded && !isFullscreen) {
      // If isExpanded prop is true but isFullscreen state is false, update it
      setIsFullscreen(true)
    } else if (!isExpanded && isFullscreen) {
      // If isExpanded prop is false but isFullscreen state is true, update it
      setIsFullscreen(false)
    }
  }, [isExpanded, isFullscreen])

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
      // Get providers from database
      const mapProviders = await getMapProviders(
        userLocation.state && userLocation.lga 
          ? { lat: userLocation.coordinates?.latitude || 9.0765, lng: userLocation.coordinates?.longitude || 7.3986 }
          : undefined
      )
      
      setProviders(mapProviders)
      
      // Apply initial filters
      applyFilters(mapFilters, mapProviders)
      
      // Set initial markers
      const userLoc = userLocation.coordinates 
        ? { lat: userLocation.coordinates.latitude, lng: userLocation.coordinates.longitude }
        : undefined
      
      const initialMarkers = providersToMarkers(mapProviders, userLoc)
      setMarkers(initialMarkers)
      
    } catch (error) {
      console.error('Error loading map data:', error)
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
    
    // Filter by distance
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
    const newFullscreenState = !isFullscreen
    setIsFullscreen(newFullscreenState)
    
    if (newFullscreenState) {
      // Enter fullscreen
      document.body.style.overflow = 'hidden'
      document.documentElement.style.overflow = 'hidden'
      
      // Force a small delay to ensure DOM updates
      setTimeout(() => {
        if (mapRef.current && typeof mapRef.current.invalidateSize === 'function') {
          mapRef.current.invalidateSize()
          
          // Center map on user location if available
          if (userLocation.coordinates) {
            setTimeout(() => {
              mapRef.current.setView([
                userLocation.coordinates!.latitude, 
                userLocation.coordinates!.longitude
              ], 13)
            }, 100)
          }
        }
      }, 50)
    } else {
      // Exit fullscreen
      document.body.style.overflow = 'auto'
      document.documentElement.style.overflow = 'auto'
      
      setTimeout(() => {
        if (mapRef.current && typeof mapRef.current.invalidateSize === 'function') {
          mapRef.current.invalidateSize()
        }
      }, 100)
    }
  }

  // Handle closing fullscreen
  const handleCloseFullscreen = () => {
    setIsFullscreen(false)
    document.body.style.overflow = 'auto'
    document.documentElement.style.overflow = 'auto'
    
    setTimeout(() => {
      if (mapRef.current && typeof mapRef.current.invalidateSize === 'function') {
        mapRef.current.invalidateSize()
      }
    }, 100)
  }

  // Locate user on map
  const handleLocateUser = async () => {
    if (!navigator.geolocation) {
      if (typeof window !== 'undefined' && (window as any).Nimart?.showToast) {
        (window as any).Nimart.showToast({
          title: 'Geolocation Error',
          message: 'Your browser does not support location services',
          type: 'error',
          duration: 4000
        })
      }
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
      
      // Save to localStorage
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
      if (typeof window !== 'undefined' && (window as any).Nimart?.showToast) {
        (window as any).Nimart.showToast({
          title: 'Location Found!',
          message: 'Map centered on your location',
          type: 'success',
          duration: 3000
        })
      }
      
    } catch (error: any) {
      console.error('Location error:', error)
      if (typeof window !== 'undefined' && (window as any).Nimart?.showToast) {
        (window as any).Nimart.showToast({
          title: 'Location Error',
          message: 'Could not get your location. Please check permissions.',
          type: 'error',
          duration: 4000
        })
      }
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

  // Calculate map center and zoom
  const getMapCenter = (): [number, number] => {
    if (userLocation.coordinates) {
      return [userLocation.coordinates.latitude, userLocation.coordinates.longitude]
    }
    
    return [NIGERIA_DEFAULT_CENTER.lat, NIGERIA_DEFAULT_CENTER.lng]
  }

  const getMapZoom = (): number => {
    return mapSettings?.desktop_settings?.initial_zoom || 
           (isMobile ? 10 : 7)
  }

  // Refresh map data
  const handleRefresh = () => {
    const now = Date.now()
    if (now - lastUpdateRef.current < UPDATE_THROTTLE_MS) {
      return
    }
    
    lastUpdateRef.current = now
    loadMapData()
    
    // Show refresh message
    if (typeof window !== 'undefined' && (window as any).Nimart?.showToast) {
      (window as any).Nimart.showToast({
        title: 'Refreshing Map',
        message: 'Loading latest providers...',
        type: 'info',
        duration: 2000
      })
    }
  }

  // Force map resize after data loads
  useEffect(() => {
    if (!loading && !loadingProviders && mapRef.current) {
      const resizeMap = () => {
        if (mapRef.current && typeof mapRef.current.invalidateSize === 'function') {
          setTimeout(() => {
            try {
              mapRef.current.invalidateSize()
            } catch (error) {
              console.log('Map resize error:', error)
            }
          }, 200)
        }
      }
      
      resizeMap()
      
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

  // Get map height based on isExpanded prop
  const getMapHeight = () => {
    if (isExpanded || isFullscreen) {
      return '100vh'
    }
    if (isMobile && !isExpanded) {
      return '240px'
    }
    return '500px'
  }

  // Render loading state
  if (!isClient || loading || !shouldRenderMap) {
    return <MapSkeleton isMobile={isMobile} />
  }

  // Render offline state
  if (!onlineStatus) {
    return (
      <div className={`bg-gray-50 rounded-2xl border border-gray-200 p-6 text-center ${className}`} style={{ height: getMapHeight() }}>
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4">
          <WifiOff className="h-6 w-6 text-gray-400" />
        </div>
        <h3 className="text-base font-semibold mb-2 text-gray-900">Offline Mode</h3>
        <p className="text-sm text-gray-600 mb-4">Map requires internet connection.</p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-green-700 text-sm font-medium"
        >
          <RefreshCw className="h-3 w-3 mr-1.5" />
          Retry Connection
        </button>
      </div>
    )
  }

  // Render mobile preview (non-expanded, non-fullscreen)
  if (isMobile && !isExpanded && !isFullscreen) {
    return (
      <>
        {/* Filter Modal */}
        {showFilterModal && (
          <MapFilterModal
            isOpen={showFilterModal}
            onClose={() => {
              setShowFilterModal(false)
              document.body.style.overflow = 'auto'
            }}
            onApplyFilters={handleApplyFilters}
            currentFilters={mapFilters}
          />
        )}
        
        <div className={`bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden ${className}`} style={{ height: 'auto' }}>
          {/* Map Preview Header */}
          <div className="p-3 border-b border-gray-200">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 text-primary mr-1.5" />
                <h3 className="text-sm font-semibold text-gray-900">Service Map</h3>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                  {nearbyCount} nearby
                </span>
                <button
                  onClick={toggleFullscreen}
                  className="p-1.5 bg-primary hover:bg-green-700 text-white rounded-lg transition-colors"
                  aria-label="Open fullscreen map"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="flex justify-between items-center px-1 pt-1">
              <div className="text-center">
                <div className="text-xs font-semibold text-green-700">{verifiedCount}</div>
                <div className="text-[10px] text-green-600">Verified</div>
              </div>
              <div className="text-center">
                <div className="text-xs font-semibold text-blue-700">{onlineCount}</div>
                <div className="text-[10px] text-blue-600">Online</div>
              </div>
              <div className="text-center">
                <div className="text-xs font-semibold text-purple-700">{providers.length}</div>
                <div className="text-[10px] text-purple-600">Total</div>
              </div>
            </div>
          </div>
          
          {/* Mini Map Preview */}
          <div 
            className="mobile-map-preview cursor-pointer relative bg-white"
            onClick={toggleFullscreen}
            style={{ height: '240px', minHeight: '240px' }}
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
                    mapRef={mapRef}
                  >
                    {/* User Location */}
                    {userLocation.coordinates && (
                      <UserLocationMarker
                        position={[userLocation.coordinates.latitude, userLocation.coordinates.longitude]}
                        isPulsing={true}
                      />
                    )}
                    
                    {/* Sample markers */}
                    {markers.slice(0, 6).map(marker => (
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent flex items-end">
                  <div className="p-3 text-white w-full">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium">Tap to open full map</p>
                        <p className="text-[10px] opacity-90">{nearbyCount} providers available</p>
                      </div>
                      <div className="bg-white text-primary px-3 py-1 rounded-full text-xs font-medium shadow-sm">
                        Explore Map
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
          
          {/* Quick Actions */}
          <div className="p-2 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-between">
              <button
                onClick={() => {
                  setShowFilterModal(true)
                  document.body.style.overflow = 'hidden'
                }}
                className="flex items-center text-xs text-gray-700 hover:text-primary px-2 py-1.5 rounded-lg hover:bg-white"
              >
                <Filter className="h-3 w-3 mr-1" />
                Filter
              </button>
              <button
                onClick={handleLocateUser}
                disabled={detectingLocation}
                className="flex items-center text-xs text-primary hover:text-green-700 px-2 py-1.5 rounded-lg hover:bg-white"
              >
                {detectingLocation ? (
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                ) : (
                  <Navigation className="h-3 w-3 mr-1" />
                )}
                {detectingLocation ? 'Locating...' : 'Find Me'}
              </button>
              <button
                onClick={handleRefresh}
                disabled={loadingProviders}
                className="flex items-center text-xs text-gray-700 hover:text-primary px-2 py-1.5 rounded-lg hover:bg-white"
              >
                <RefreshCw className={`h-3 w-3 mr-1 ${loadingProviders ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </>
    )
  }

  // Render full map (desktop or expanded/fullscreen mobile)
  return (
    <>
      {/* Filter Modal */}
      {showFilterModal && (
        <MapFilterModal
          isOpen={showFilterModal}
          onClose={() => {
            setShowFilterModal(false)
            document.body.style.overflow = 'auto'
          }}
          onApplyFilters={handleApplyFilters}
          currentFilters={mapFilters}
        />
      )}
      
      {/* Fullscreen/Expanded Map */}
      <div className={`${(isExpanded || isFullscreen) ? 'mobile-fullscreen-map' : `desktop-map ${className}`}`} style={{ 
        position: 'relative', 
        zIndex: (isExpanded || isFullscreen) ? 9999 : 1,
        height: getMapHeight(),
        backgroundColor: 'white'
      }}>
        {/* Mobile Fullscreen Header - Only show if expanded/fullscreen AND mobile */}
        {(isExpanded || isFullscreen) && isMobile && (
          <div className="mobile-map-header px-3 py-2 bg-white border-b border-gray-200 shadow-sm" style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 10000
          }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button
                  onClick={handleCloseFullscreen}
                  className="p-2 mr-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Back to homepage"
                >
                  <ChevronLeft className="h-5 w-5 text-gray-700" />
                </button>
                <div>
                  <h2 className="text-base font-bold text-gray-900">Service Map</h2>
                  <p className="text-xs text-gray-600">
                    {markers.length} providers • {userLocation.state || 'Nigeria'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setShowFilterModal(true)
                    document.body.style.overflow = 'hidden'
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Filter providers"
                >
                  <Filter className="h-5 w-5 text-gray-700" />
                </button>
                <button
                  onClick={handleLocateUser}
                  disabled={detectingLocation}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Find my location"
                >
                  {detectingLocation ? (
                    <Loader2 className="h-5 w-5 text-primary animate-spin" />
                  ) : (
                    <Navigation className="h-5 w-5 text-primary" />
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Map Container */}
        <div className={(isExpanded || isFullscreen) ? 'mobile-map-content' : 'h-full'} style={{
          position: (isExpanded || isFullscreen) ? 'absolute' : 'relative',
          top: (isExpanded || isFullscreen) && isMobile ? '60px' : '0',
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'white'
        }}>
          <MapContainer
            center={getMapCenter()}
            zoom={getMapZoom()}
            mapRef={mapRef}
            isFullscreen={isExpanded || isFullscreen}
            className={(isExpanded || isFullscreen) ? 'h-full' : 'h-full'}
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
              isFullscreen={isExpanded || isFullscreen}
              onCloseFullscreen={(isExpanded || isFullscreen) ? handleCloseFullscreen : undefined}
              onFilterClick={() => {
                setShowFilterModal(true)
                document.body.style.overflow = 'hidden'
              }}
              userLocation={userLocation.coordinates ? [userLocation.coordinates.latitude, userLocation.coordinates.longitude] : null}
            />
          </MapContainer>
        </div>
        
        {/* Desktop Map Stats Footer - Only show if not expanded and not mobile */}
        {!isExpanded && !isFullscreen && !isMobile && (
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-[1000]">
            <div className="bg-white/95 backdrop-blur-sm rounded-xl p-3 border border-gray-200 shadow-lg min-w-[280px]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center">
                    <CheckCircle className="h-3.5 w-3.5 text-green-600 mr-1.5" />
                    <span className="text-xs font-medium">{verifiedCount} verified</span>
                  </div>
                  <div className="flex items-center">
                    <User className="h-3.5 w-3.5 text-blue-600 mr-1.5" />
                    <span className="text-xs font-medium">{onlineCount} online</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-3.5 w-3.5 text-primary mr-1.5" />
                    <span className="text-xs font-medium">{markers.length} nearby</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setShowFilterModal(true)
                    document.body.style.overflow = 'hidden'
                  }}
                  className="flex-1 px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium flex items-center justify-center"
                >
                  <Filter className="h-3.5 w-3.5 mr-1" />
                  Filter
                </button>
                <button
                  onClick={handleRefresh}
                  disabled={loadingProviders}
                  className="flex-1 px-2.5 py-1.5 bg-primary hover:bg-green-700 text-white rounded-lg text-xs font-medium flex items-center justify-center"
                >
                  <RefreshCw className={`h-3.5 w-3.5 mr-1 ${loadingProviders ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}