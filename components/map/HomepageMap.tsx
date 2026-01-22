'use client'

import { useState, useEffect } from 'react'
import { useMediaQuery } from 'react-responsive'
import { UserLocation } from '@/lib/types'
import MapSection from './MapSection' // <-- MUST BE MapSection

interface HomepageMapProps {
  userLocation: UserLocation
}

export default function HomepageMap({ userLocation }: HomepageMapProps) {
  const [isMounted, setIsMounted] = useState(false)
  const isMobile = useMediaQuery({ maxWidth: 768 })
  
  useEffect(() => {
    setIsMounted(true)
  }, [])
  
  if (!isMounted) {
    return (
      <div className="bg-gray-50 rounded-2xl border border-gray-200 p-4 sm:p-6 h-[500px] sm:h-[500px] flex items-center justify-center">
        <div className="animate-pulse w-full max-w-4xl">
          <div className="h-[400px] sm:h-[400px] bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="w-full">
      {/* Location Status */}
      <div className="mb-6 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg mr-3">
              <div className="w-6 h-6 bg-blue-500 rounded-full relative">
                <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-20"></div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">My Location</h3>
              <p className="text-sm text-gray-600">
                {userLocation && userLocation.detected && userLocation.state 
                  ? `${userLocation.lga ? userLocation.lga + ', ' : ''}${userLocation.state}`
                  : userLocation && userLocation.coordinates
                  ? `📍 ${userLocation.coordinates.latitude.toFixed(4)}, ${userLocation.coordinates.longitude.toFixed(4)}`
                  : '📍 Location not set'}
              </p>
            </div>
          </div>
          
          {userLocation && userLocation.detected && (
            <div className="flex items-center text-sm">
              <span className="px-3 py-1.5 bg-green-100 text-green-800 rounded-full font-medium">
                ✅ Location detected
              </span>
            </div>
          )}
        </div>
        
        {userLocation && !userLocation.detected && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800 flex items-center">
              <span className="mr-2">📍</span>
              Set your location to see providers near you. Use the location button on the map.
            </p>
          </div>
        )}
      </div>
      
      {/* Map Component - FIXED: Removed fixed height wrapper for mobile */}
      <div className={`${isMobile ? 'rounded-xl overflow-hidden border border-gray-300 shadow-xl relative h-auto' : 'rounded-xl overflow-hidden border border-gray-300 shadow-xl relative h-[500px]'}`}>
        {/* FIXED: Using MapSection component */}
        <MapSection 
          userLocation={userLocation}
          isMobile={isMobile}
        />
      </div>
      
      {/* Map Legend */}
      <div className="mt-6 p-4 bg-white rounded-xl border border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-3">Map Legend</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full border-3 border-green-500 bg-white flex items-center justify-center mr-2">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            </div>
            <span className="text-sm">Verified Provider</span>
          </div>
          <div className="flex items-center">
            <div className="w-7 h-7 rounded-full border-2 border-yellow-500 bg-white flex items-center justify-center mr-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            </div>
            <span className="text-sm">Unverified</span>
          </div>
          <div className="flex items-center">
            <div className="w-6 h-6 rounded-full border-2 border-blue-500 bg-white flex items-center justify-center mr-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            </div>
            <span className="text-sm">Your Location</span>
          </div>
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-2">
              <div className="w-6 h-6 rounded-full bg-purple-500 text-white text-xs font-bold flex items-center justify-center">
                3
              </div>
            </div>
            <span className="text-sm">Cluster of Providers</span>
          </div>
        </div>
      </div>
      
      {/* Call to Action */}
      <div className="mt-6 text-center">
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="/marketplace"
            className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-green-700 font-medium transition-colors"
          >
            Browse All Providers
          </a>
          <a
            href="/provider/register"
            className="px-6 py-3 border-2 border-primary text-primary rounded-xl hover:bg-green-50 font-medium transition-colors"
          >
            Become a Provider
          </a>
        </div>
      </div>
    </div>
  )
}