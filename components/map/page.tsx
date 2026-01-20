'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Home, Filter, Navigation, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { UserLocation } from '@/lib/types'

// Dynamically import MapSection
const MapSection = dynamic(() => import('@/components/map/MapSection'), { 
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="mt-4 text-gray-600">Loading Nigerian map...</p>
      </div>
    </div>
  )
})

export default function MapPage() {
  const router = useRouter()
  const [userLocation, setUserLocation] = useState<UserLocation>({
    state: null,
    lga: null,
    coordinates: null,
    detected: false
  })
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    loadUserLocation()
  }, [])
  
  const loadUserLocation = async () => {
    try {
      // Try to get saved location from localStorage
      const savedLocation = localStorage.getItem('nimart-user-location')
      if (savedLocation) {
        const parsedLocation = JSON.parse(savedLocation)
        setUserLocation(parsedLocation)
      }
      
      // Try to detect current location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const coords = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            }
            
            // FIXED: Properly update the state with all required fields
            setUserLocation(prev => ({
              ...prev,
              coordinates: coords,
              detected: true,
              state: prev.state,
              lga: prev.lga
            }))
          },
          (error) => {
            console.log('Location permission denied:', error)
            setLoading(false)
          },
          {
            enableHighAccuracy: true,
            timeout: 10000
          }
        )
      } else {
        setLoading(false)
      }
    } catch (error) {
      console.error('Error loading location:', error)
      setLoading(false)
    }
  }
  
  // FIXED: Handle location detection with proper state update
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser')
      return
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }
        
        // Proper state update
        setUserLocation(prev => ({
          ...prev,
          coordinates: coords,
          detected: true
        }))
        
        // Save to localStorage
        const newLocation = {
          ...userLocation,
          coordinates: coords,
          detected: true
        }
        localStorage.setItem('nimart-user-location', JSON.stringify(newLocation))
        
        alert('Location detected!')
      },
      (error) => {
        console.error('Location error:', error)
        alert('Unable to get your location. Please ensure location services are enabled.')
      },
      {
        enableHighAccuracy: true,
        timeout: 10000
      }
    )
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Loading map...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary to-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-white/20 rounded-lg mr-3"
                aria-label="Go back"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold">Nigerian Service Map</h1>
                <p className="text-sm opacity-90">Find trusted providers near you</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Link
                href="/"
                className="p-2 hover:bg-white/20 rounded-lg flex items-center"
                aria-label="Go to homepage"
              >
                <Home className="h-5 w-5" />
              </Link>
            </div>
          </div>
          
          {/* Location Status */}
          <div className="mt-4 p-3 bg-white/20 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Navigation className="h-5 w-5 mr-2" />
                <div>
                  <p className="text-sm font-medium">Your Location</p>
                  <p className="text-xs opacity-90">
                    {userLocation.detected && userLocation.coordinates
                      ? `📍 ${userLocation.coordinates.latitude.toFixed(4)}, ${userLocation.coordinates.longitude.toFixed(4)}`
                      : userLocation.state
                      ? `📍 ${userLocation.lga ? userLocation.lga + ', ' : ''}${userLocation.state}`
                      : '📍 Location not set'}
                  </p>
                </div>
              </div>
              
              {!userLocation.detected && (
                <button
                  onClick={handleDetectLocation}
                  className="px-3 py-1.5 bg-white text-primary text-sm font-medium rounded-lg hover:bg-gray-100"
                >
                  Detect Location
                </button>
              )}
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Map */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <MapSection 
            userLocation={userLocation}
            className="h-[calc(100vh-200px)] min-h-[500px]"
          />
        </div>
        
        {/* Info Section */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h3 className="font-semibold text-blue-900 mb-2">How to Use the Map</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Click on provider markers to see details</li>
              <li>• Use the locate button to find your position</li>
              <li>• Zoom in/out to explore different areas</li>
              <li>• Green checkmarks = Verified providers</li>
            </ul>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <h3 className="font-semibold text-green-900 mb-2">Verification Status</h3>
            <ul className="text-sm text-green-800 space-y-1">
              <li className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span>Verified - Documents approved by Nimart</span>
              </li>
              <li className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                <span>Unverified - Pending document upload</span>
              </li>
              <li className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <span>Pending - Documents under review</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
            <h3 className="font-semibold text-purple-900 mb-2">Need Help?</h3>
            <p className="text-sm text-purple-800 mb-3">
              Can't find a provider in your area?
            </p>
            <div className="flex flex-col gap-2">
              <Link
                href="/provider/register"
                className="px-3 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 text-center"
              >
                Register as Provider
              </Link>
              <Link
                href="/contact"
                className="px-3 py-2 border border-purple-600 text-purple-600 text-sm font-medium rounded-lg hover:bg-purple-50 text-center"
              >
                Request a Service
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}