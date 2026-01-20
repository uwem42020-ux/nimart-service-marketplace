'use client'

import { useEffect } from 'react'
import { Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { ProviderMarker as ProviderMarkerType } from '@/lib/map-types'
import { createMarkerHTML, generatePopupContent, getMarkerColor } from '@/lib/map-utils'
import { useRouter } from 'next/navigation'

interface ProviderMarkerProps {
  marker: ProviderMarkerType
  onClick?: (providerId: string) => void
}

export default function ProviderMarker({ marker, onClick }: ProviderMarkerProps) {
  const router = useRouter()
  
  useEffect(() => {
    // Cleanup function
    return () => {
      // Remove custom icon from memory
      if ((L as any).markerCache) {
        delete (L as any).markerCache[marker.id]
      }
    }
  }, [marker.id])
  
  // Create custom icon
  const createCustomIcon = () => {
    const iconSize = marker.is_verified ? 40 : 30
    const borderColor = getMarkerColor(marker.verification_status)
    
    return L.divIcon({
      html: createMarkerHTML(
        marker.profile_picture_url,
        marker.business_name,
        marker.verification_status,
        iconSize
      ),
      className: `custom-marker ${marker.verification_status}-marker`,
      iconSize: [iconSize, iconSize],
      iconAnchor: [iconSize / 2, iconSize / 2],
      popupAnchor: [0, -iconSize / 2]
    })
  }
  
  const handleMarkerClick = (e: L.LeafletMouseEvent) => {
    e.originalEvent.preventDefault()
    e.originalEvent.stopPropagation()
    
    if (onClick) {
      onClick(marker.id)
    } else {
      router.push(`/providers/${marker.id}`)
    }
  }
  
  const handlePopupClick = () => {
    router.push(`/providers/${marker.id}`)
  }
  
  return (
    <Marker
      position={[marker.lat, marker.lng]}
      icon={createCustomIcon()}
      eventHandlers={{
        click: handleMarkerClick
      }}
    >
      <Popup>
        <div 
          dangerouslySetInnerHTML={{ 
            __html: generatePopupContent(marker) 
          }}
          onClick={handlePopupClick}
          style={{ cursor: 'pointer' }}
        />
      </Popup>
    </Marker>
  )
}