'use client'

import dynamic from 'next/dynamic'
import { MapContainerProps as LeafletMapContainerProps } from 'react-leaflet'
import { useEffect, useRef, useState } from 'react'

// Dynamically import the actual Leaflet MapContainer
const LazyMapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mb-2"></div>
          <p className="text-sm text-gray-500">Loading map...</p>
        </div>
      </div>
    )
  }
)

// Dynamically import TileLayer
const LazyTileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { 
    ssr: false,
    loading: () => null
  }
)

// Dynamically import ZoomControl
const LazyZoomControl = dynamic(
  () => import('react-leaflet').then((mod) => mod.ZoomControl),
  { ssr: false }
)

interface MapContainerProps extends Omit<LeafletMapContainerProps, 'ref'> {
  children: React.ReactNode
  className?: string
  isFullscreen?: boolean
  mapRef?: React.Ref<any> // Optional ref parameter
}

// SIMPLIFIED: Remove forwardRef, use props for ref
const MapContainer = ({
  children,
  className = '',
  isFullscreen = false,
  center = [9.0765, 7.3986], // Abuja, Nigeria as default
  zoom = 6,
  mapRef, // Accept ref as a prop instead
  ...props
}: MapContainerProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const internalMapRef = useRef<any>(null) // Internal ref for the actual map
  const [mapKey, setMapKey] = useState(0)
  const [isMounted, setIsMounted] = useState(false)
  
  // Safe DOM cleanup function with null checks
  const safeCleanup = () => {
    if (!containerRef || !containerRef.current) return;
    
    try {
      const container = containerRef.current;
      
      if (container && container.isConnected) {
        const leafletContainers = container.querySelectorAll('.leaflet-container');
        leafletContainers.forEach((containerElement: Element) => {
          if (containerElement && containerElement.parentNode === container) {
            try {
              container.removeChild(containerElement);
            } catch (err) {
              console.log('Cleanup warning: Element already removed');
            }
          }
        });
      }
    } catch (error) {
      console.log('Safe cleanup error (non-critical):', error);
    }
  }
  
  useEffect(() => {
    setIsMounted(true);
    setMapKey(prev => prev + 1);
    
    return () => {
      safeCleanup();
    }
  }, []);
  
  const uniqueKey = `map-${mapKey}-${isMounted ? 'mounted' : 'loading'}`;

  if (!isMounted) {
    return (
      <div 
        ref={containerRef}
        className={`relative ${isFullscreen ? 'fullscreen-map' : 'responsive-map-container'} ${className}`}
        style={{
          height: isFullscreen ? '100vh' : '100%',
          minHeight: isFullscreen ? '100vh' : '500px',
          width: '100%'
        }}
      >
        <div className="w-full h-full bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mb-2"></div>
            <p className="text-sm text-gray-500">Preparing map...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`relative ${isFullscreen ? 'fullscreen-map' : 'responsive-map-container'} ${className}`}
      style={{
        height: isFullscreen ? '100vh' : '100%',
        minHeight: isFullscreen ? '100vh' : '500px',
        width: '100%'
      }}
    >
      <LazyMapContainer
        key={uniqueKey}
        center={center as [number, number]}
        zoom={zoom}
        style={{ 
          height: '100%', 
          width: '100%'
        }}
        className="leaflet-container"
        zoomControl={false}
        scrollWheelZoom={true}
        touchZoom={true}
        doubleClickZoom={true}
        dragging={true}
        ref={(node) => {
          // Handle both internal ref and passed ref
          internalMapRef.current = node;
          if (mapRef) {
            if (typeof mapRef === 'function') {
              mapRef(node);
            } else {
              (mapRef as React.MutableRefObject<any>).current = node;
            }
          }
        }}
        {...props}
      >
        <LazyTileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {children}
        
        <LazyZoomControl position="bottomright" />
      </LazyMapContainer>
    </div>
  )
}

MapContainer.displayName = 'MapContainer'

export default MapContainer