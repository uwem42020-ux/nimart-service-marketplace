'use client'

import dynamic from 'next/dynamic'
import { MapContainerProps as LeafletMapContainerProps } from 'react-leaflet'
import { forwardRef, ForwardedRef, useEffect, useRef, useState } from 'react'

// Dynamically import MapContainer to avoid SSR issues with Leaflet
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
  innerRef?: ForwardedRef<any>
}

const MapContainer = forwardRef(function MapContainerComponent({
  children,
  className = '',
  isFullscreen = false,
  innerRef,
  center = [9.0765, 7.3986], // Abuja, Nigeria as default
  zoom = 6,
  ...props
}: MapContainerProps, ref: ForwardedRef<any>) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [mapKey, setMapKey] = useState(0)
  const [isMounted, setIsMounted] = useState(false)
  
  // Safe DOM cleanup function with null checks
  const safeCleanup = () => {
    // Check if containerRef.current exists
    if (!containerRef || !containerRef.current) return;
    
    try {
      const container = containerRef.current;
      
      // Check if element still exists and is connected to DOM
      if (container && container.isConnected) {
        const leafletContainers = container.querySelectorAll('.leaflet-container');
        leafletContainers.forEach((containerElement: Element) => {
          // Type guard to ensure it's an HTMLElement
          if (containerElement && containerElement.parentNode === container) {
            try {
              container.removeChild(containerElement);
            } catch (err) {
              // Element might already be removed, ignore
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
    
    // Increment key to force fresh instance
    setMapKey(prev => prev + 1);
    
    return () => {
      // Only cleanup if component is actually unmounting
      safeCleanup();
    }
  }, []);
  
  // Generate a unique key to force fresh map instance
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
        ref={innerRef}
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
})

MapContainer.displayName = 'MapContainer'

export default MapContainer