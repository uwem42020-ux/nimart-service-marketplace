'use client'

import { useMap } from 'react-leaflet'
import { MapPin, Navigation, ZoomIn, ZoomOut, X, Maximize2, Minimize2, Filter } from 'lucide-react'
import { useState } from 'react'

interface MapControlsProps {
  onLocateUser?: () => void
  onToggleFullscreen?: () => void
  isFullscreen?: boolean
  onCloseFullscreen?: () => void
  onFilterClick?: () => void
  showFilter?: boolean
  userLocation?: [number, number] | null
}

export default function MapControls({
  onLocateUser,
  onToggleFullscreen,
  isFullscreen = false,
  onCloseFullscreen,
  onFilterClick,
  showFilter = true,
  userLocation
}: MapControlsProps) {
  const map = useMap()
  const [isLocating, setIsLocating] = useState(false)
  
  const handleZoomIn = () => {
    map.zoomIn()
  }
  
  const handleZoomOut = () => {
    map.zoomOut()
  }
  
  const handleLocateUser = async () => {
    if (!onLocateUser) return
    
    setIsLocating(true)
    try {
      await onLocateUser()
    } finally {
      setIsLocating(false)
    }
  }
  
  const handleRecenterToNigeria = () => {
    map.setView([9.0765, 7.3986], 6)
  }
  
  return (
    <div className="map-controls-container">
      {/* Fullscreen close button (only in fullscreen mode) */}
      {isFullscreen && onCloseFullscreen && (
        <button
          onClick={onCloseFullscreen}
          className="map-control-button bg-red-500 hover:bg-red-600 text-white"
          aria-label="Close map"
          title="Close map"
        >
          <X className="h-5 w-5" />
        </button>
      )}
      
      {/* Fullscreen toggle (only in non-fullscreen mode) */}
      {!isFullscreen && onToggleFullscreen && (
        <button
          onClick={onToggleFullscreen}
          className="map-control-button bg-primary hover:bg-green-700 text-white"
          aria-label="Fullscreen map"
          title="Fullscreen map"
        >
          <Maximize2 className="h-5 w-5" />
        </button>
      )}
      
      {/* Filter button */}
      {showFilter && onFilterClick && (
        <button
          onClick={onFilterClick}
          className="map-control-button bg-white hover:bg-gray-50 text-gray-700"
          aria-label="Filter providers"
          title="Filter providers"
        >
          <Filter className="h-5 w-5" />
        </button>
      )}
      
      {/* Locate user button */}
      {onLocateUser && (
        <button
          onClick={handleLocateUser}
          disabled={isLocating}
          className={`map-control-button ${userLocation ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-white hover:bg-gray-50 text-gray-700'}`}
          aria-label="Locate me"
          title="Find my location"
        >
          {isLocating ? (
            <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Navigation className="h-5 w-5" />
          )}
        </button>
      )}
      
      {/* Recenter to Nigeria button */}
      <button
        onClick={handleRecenterToNigeria}
        className="map-control-button bg-white hover:bg-gray-50 text-gray-700"
        aria-label="Recenter to Nigeria"
        title="Center map on Nigeria"
      >
        <MapPin className="h-5 w-5" />
      </button>
      
      {/* Zoom controls */}
      <div className="flex flex-col gap-1">
        <button
          onClick={handleZoomIn}
          className="map-control-button bg-white hover:bg-gray-50 text-gray-700"
          aria-label="Zoom in"
          title="Zoom in"
        >
          <ZoomIn className="h-5 w-5" />
        </button>
        
        <button
          onClick={handleZoomOut}
          className="map-control-button bg-white hover:bg-gray-50 text-gray-700"
          aria-label="Zoom out"
          title="Zoom out"
        >
          <ZoomOut className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}