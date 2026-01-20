'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useMediaQuery } from 'react-responsive'
import { UserLocation } from '@/lib/types'

// Dynamically import MapSection to avoid SSR issues
const MapSection = dynamic(() => import('./MapSection'), { 
  ssr: false,
  loading: () => (
    <div className="bg-gray-50 rounded-2xl border border-gray-200 p-8 h-[600px] flex items-center justify-center">
      <div className="animate-pulse w-full max-w-4xl">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4 mx-auto"></div>
        <div className="h-[500px] bg-gray-200 rounded"></div>
      </div>
    </div>
  )
})

interface HomepageMapProps {
  userLocation: UserLocation
}

export default function HomepageMap({ userLocation }: HomepageMapProps) {
  const [isMounted, setIsMounted] = useState(false)
  const isMobile = useMediaQuery({ maxWidth: 768 })
  const [mapKey, setMapKey] = useState(0)
  
  useEffect(() => {
    setIsMounted(true)
  }, [])
  
  // Force remount when location changes significantly
  useEffect(() => {
    if (userLocation?.state || userLocation?.coordinates) {
      setMapKey(prev => prev + 1)
    }
  }, [userLocation?.state, userLocation?.coordinates?.latitude, userLocation?.coordinates?.longitude])
  
  if (!isMounted) {
    return (
      <div className="bg-gray-50 rounded-2xl border border-gray-200 p-4 sm:p-6 h-[600px] flex items-center justify-center">
        <div className="animate-pulse w-full max-w-4xl">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4 mx-auto"></div>
          <div className="h-[500px] sm:h-[500px] bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }
  
  return (
    <section className="py-8 sm:py-12 bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 text-gray-900">
            Find Verified Services Near You
          </h2>
          <p className="text-base text-gray-600 max-w-3xl mx-auto">
            Browse our interactive map to discover trusted service providers across Nigeria.
            Verified providers are marked with a green checkmark.
          </p>
        </div>
        
        <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-blue-100 shadow-lg">
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
                  <h3 className="font-semibold text-gray-900">Your Current Location</h3>
                  <p className="text-sm text-gray-600">
                    {userLocation && userLocation.detected && userLocation.state 
                      ? `${userLocation.lga ? userLocation.lga + ', ' : ''}${userLocation.state}`
                      : 'Set your location to see nearby providers'}
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
          
          {/* Map Component - Key forces remount on location change */}
          <div 
            key={`homepage-map-${mapKey}`}
            className="rounded-xl overflow-hidden border border-gray-300 shadow-xl"
            style={{ height: '600px' }}
          >
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
            <p className="text-sm text-gray-600 mb-4">
              Can't find what you're looking for? Try searching for specific services.
            </p>
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
        
        {/* Provider Statistics */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200">
            <div className="flex items-center">
              <div className="p-3 bg-blue-500 rounded-xl mr-4">
                <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Nationwide Coverage</h3>
                <p className="text-gray-600 mt-1">Providers across all 36 states + FCT</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-2xl border border-green-200">
            <div className="flex items-center">
              <div className="p-3 bg-green-500 rounded-xl mr-4">
                <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-green-500"></div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Verified Professionals</h3>
                <p className="text-gray-600 mt-1">Background-checked service providers</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-2xl border border-purple-200">
            <div className="flex items-center">
              <div className="p-3 bg-purple-500 rounded-xl mr-4">
                <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full bg-purple-500 text-white text-xs font-bold flex items-center justify-center">
                    3
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Real-time Updates</h3>
                <p className="text-gray-600 mt-1">Live provider locations and status</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Mobile Tips */}
        {isMobile && (
          <div className="mt-8 p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-2xl border border-yellow-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-500 rounded-lg mr-3">
                <div className="w-5 h-5 flex items-center justify-center">
                  <span className="text-white font-bold">!</span>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Mobile Tips</h4>
                <p className="text-sm text-gray-600 mt-1">
                  • Pinch to zoom • Tap markers for details • Use fullscreen for better view
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}