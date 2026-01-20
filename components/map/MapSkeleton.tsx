'use client'

import { Loader2, MapPin } from 'lucide-react'

interface MapSkeletonProps {
  isMobile?: boolean
}

export default function MapSkeleton({ isMobile = false }: MapSkeletonProps) {
  return (
    <div className={`map-loading ${isMobile ? 'mobile-map-preview' : 'desktop-map'}`}>
      <div className="text-center">
        <div className="relative mb-4">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-green-600/20 rounded-full blur-xl"></div>
          </div>
          <div className="relative">
            <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto" />
          </div>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Nigerian Map</h3>
        <p className="text-gray-600 mb-4">Finding providers near you...</p>
        <div className="flex items-center justify-center text-sm text-gray-500">
          <MapPin className="h-4 w-4 mr-2" />
          <span>Loading Nigerian locations</span>
        </div>
        
        {/* Skeleton provider markers */}
        <div className="mt-6 flex justify-center space-x-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse mb-1"></div>
              <div className="w-12 h-2 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}