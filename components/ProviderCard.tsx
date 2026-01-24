// components/ProviderCard.tsx - UPDATED WITH ALL FEATURES
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Star, MapPin, Shield, Clock,
  Verified, Briefcase, Navigation
} from 'lucide-react'
import { FastProvider } from '@/lib/types'

interface ProviderCardProps {
  provider: FastProvider
  gridView: 'basic' | 'detailed'
  isDarkMode: boolean
  userState: string | null
  userLGA: string | null
  userCoordinates?: { latitude: number; longitude: number } | null
}

export default function ProviderCard({ 
  provider, 
  gridView = 'basic',
  isDarkMode = false,
  userState = null,
  userLGA = null,
  userCoordinates = null
}: ProviderCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [distance, setDistance] = useState<string>('')

  // Calculate distance from user
  useEffect(() => {
    const calculateDistance = () => {
      if (!userCoordinates || !provider.latitude || !provider.longitude) {
        return ''
      }
      
      const R = 6371 // Earth's radius in km
      const dLat = toRad(provider.latitude - userCoordinates.latitude)
      const dLon = toRad(provider.longitude - userCoordinates.longitude)
      const lat1 = toRad(userCoordinates.latitude)
      const lat2 = toRad(provider.latitude)
      
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
      const distanceKm = R * c
      
      if (distanceKm < 1) {
        return `${Math.round(distanceKm * 1000)}m away`
      } else {
        return `${distanceKm.toFixed(1)}km away`
      }
    }
    
    const toRad = (value: number) => {
      return value * Math.PI / 180
    }
    
    const dist = calculateDistance()
    setDistance(dist)
  }, [userCoordinates, provider.latitude, provider.longitude])

  // Get image URL
  const getImageUrl = () => {
    return provider.profile_picture_url || 
      `https://ui-avatars.com/api/?name=${encodeURIComponent(provider.business_name || 'Provider')}&background=008751&color=fff&size=256&bold=true`
  }

  const imageUrl = getImageUrl()

  // Verification badge
  const getVerificationBadge = () => {
    if (provider.verification_status === 'verified') {
      return {
        text: 'Verified',
        color: 'bg-green-500 text-white',
        icon: <Verified className="h-3 w-3" />
      }
    } else if (provider.verification_status === 'pending' || provider.verification_status === 'pending_email') {
      return {
        text: 'Pending',
        color: 'bg-yellow-500 text-white',
        icon: <Clock className="h-3 w-3" />
      }
    } else {
      return {
        text: 'Unverified',
        color: 'bg-gray-500 text-white',
        icon: <Shield className="h-3 w-3" />
      }
    }
  }

  const verificationBadge = getVerificationBadge()

  // Format rating
  const formatRating = (rating: number) => {
    return rating > 0 ? rating.toFixed(1) : 'New'
  }

  // Get state and LGA names
  const stateName = provider.states?.[0]?.name || ''
  const lgaName = provider.lgas?.[0]?.name || ''

  // Basic grid view
  if (gridView === 'basic') {
    return (
      <div className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-200">
        {/* Image container */}
        <div className="relative w-full aspect-square bg-gray-100 overflow-hidden">
          {/* Background image */}
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ 
              backgroundImage: `url('${imageUrl}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
          
          {/* Verification badge */}
          <div className={`absolute top-2 right-2 ${verificationBadge.color} px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg`}>
            {verificationBadge.icon}
            {verificationBadge.text}
          </div>
        </div>

        {/* Content - Updated layout */}
        <div className="p-4 space-y-3">
          {/* Business name and service type */}
          <div>
            <h3 className="font-bold text-gray-900 text-sm truncate">
              {provider.business_name}
            </h3>
            <p className="text-xs text-gray-600 truncate">
              {provider.service_type}
            </p>
          </div>
          
          {/* Rating and Reviews */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 mr-1" />
              <span className="font-semibold text-gray-900 text-xs">
                {formatRating(provider.rating)}
              </span>
              <span className="text-gray-500 text-xs ml-1">
                ({provider.total_reviews || 0} reviews)
              </span>
            </div>
            
            {/* Bookings count */}
            {provider.total_bookings > 0 && (
              <div className="flex items-center text-xs text-gray-600">
                <Briefcase className="h-3 w-3 mr-1" />
                {provider.total_bookings}
              </div>
            )}
          </div>
          
          {/* Location and Distance */}
          <div className="space-y-1">
            {stateName && (
              <div className="flex items-center text-gray-500 text-xs">
                <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                <span className="truncate">
                  {lgaName ? `${lgaName}, ${stateName}` : stateName}
                </span>
              </div>
            )}
            
            {/* Distance from user */}
            {distance && (
              <div className="flex items-center text-primary text-xs font-medium">
                <Navigation className="h-3 w-3 mr-1" />
                {distance}
              </div>
            )}
          </div>
          
          {/* View Profile Button */}
          <Link
            href={`/providers/${provider.id}`}
            className="block w-full bg-primary text-white text-center py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors mt-2"
          >
            View Profile
          </Link>
        </div>
      </div>
    )
  }

  // Detailed view
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-200">
      <div className="md:flex">
        {/* Image column */}
        <div className="md:w-1/3 relative">
          <div className="relative w-full aspect-square md:h-full bg-gray-100">
            {/* Background image */}
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ 
                backgroundImage: `url('${imageUrl}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            />
            
            {/* Verification badge */}
            <div className={`absolute top-3 left-3 ${verificationBadge.color} px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg`}>
              {verificationBadge.icon}
              {verificationBadge.text}
            </div>
          </div>
        </div>

        {/* Content column */}
        <div className="md:w-2/3 p-6">
          {/* Header with rating */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                {provider.business_name}
              </h3>
              <p className="text-primary font-medium">
                {provider.service_type}
              </p>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                {formatRating(provider.rating)}
              </div>
              <div className="text-sm text-gray-600">
                {provider.total_reviews || 0} reviews
              </div>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {provider.years_experience > 0 && (
              <div className="bg-gray-50 p-3 rounded-lg text-center">
                <div className="text-lg font-bold text-primary">{provider.years_experience}</div>
                <div className="text-xs text-gray-600">Years Exp</div>
              </div>
            )}
            
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <div className="text-lg font-bold text-primary">{provider.total_bookings || 0}</div>
              <div className="text-xs text-gray-600">Bookings</div>
            </div>
            
            {provider.response_rate && (
              <div className="bg-gray-50 p-3 rounded-lg text-center">
                <div className="text-lg font-bold text-primary">{provider.response_rate}%</div>
                <div className="text-xs text-gray-600">Response Rate</div>
              </div>
            )}
            
            {distance && (
              <div className="bg-gray-50 p-3 rounded-lg text-center">
                <div className="text-lg font-bold text-primary">{distance.split(' ')[0]}</div>
                <div className="text-xs text-gray-600">Distance</div>
              </div>
            )}
          </div>

          {/* Location */}
          {stateName && (
            <div className="flex items-center text-gray-600 mb-4">
              <MapPin className="h-5 w-5 mr-2 text-primary flex-shrink-0" />
              <div>
                <div className="font-medium">
                  {lgaName ? `${lgaName}, ${stateName}` : stateName}
                </div>
                {provider.city && (
                  <div className="text-sm text-gray-500">City: {provider.city}</div>
                )}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3">
            <Link
              href={`/providers/${provider.id}`}
              className="flex-1 bg-primary text-white py-3 px-4 rounded-lg hover:bg-green-700 font-medium text-center transition-colors"
            >
              View Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}