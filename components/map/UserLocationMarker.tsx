'use client'

import { Marker, Circle } from 'react-leaflet'
import L from 'leaflet'

interface UserLocationMarkerProps {
  position: [number, number]
  accuracy?: number
  isPulsing?: boolean
}

export default function UserLocationMarker({ 
  position, 
  accuracy, 
  isPulsing = true 
}: UserLocationMarkerProps) {
  
  // Create user location icon
  const createUserIcon = () => {
    return L.divIcon({
      html: `
        <div style="
          width: 20px;
          height: 20px;
          background: #3b82f6;
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 5px rgba(0,0,0,0.3);
          position: relative;
          ${isPulsing ? 'animation: pulse 2s infinite;' : ''}
        ">
          <div style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 6px;
            height: 6px;
            background: white;
            border-radius: 50%;
          "></div>
        </div>
      `,
      className: 'user-location-marker',
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    })
  }
  
  return (
    <>
      {/* Accuracy circle */}
      {accuracy && accuracy > 0 && (
        <Circle
          center={position}
          radius={accuracy}
          pathOptions={{
            fillColor: '#3b82f6',
            fillOpacity: 0.1,
            color: '#3b82f6',
            opacity: 0.3,
            weight: 1
          }}
        />
      )}
      
      {/* User marker */}
      <Marker
        position={position}
        icon={createUserIcon()}
      />
      
      {/* Pulsing effect circle */}
      {isPulsing && (
        <Circle
          center={position}
          radius={30}
          pathOptions={{
            fillColor: '#3b82f6',
            fillOpacity: 0,
            color: '#3b82f6',
            opacity: 0.5,
            weight: 2,
            dashArray: '5, 10'
          }}
        />
      )}
    </>
  )
}