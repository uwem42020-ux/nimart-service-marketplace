// app/components/ProviderCard.tsx - UPDATED WITH SIMPLIFIED MOBILE VIEW
'use client'

import Link from 'next/link'
import { FastProvider } from '@/lib/types'
import { 
  Star, MapPin, Shield, Briefcase, Car, Zap, Droplets,
  Palette, Scissors, ChefHat, Sparkles, PhoneCall,
  Heart, ArrowRight, MessageSquare, CheckCircle,
  User
} from 'lucide-react'

interface ProviderCardProps {
  provider: FastProvider
  gridView: 'basic' | 'detailed'
  isDarkMode: boolean
  userState?: string | null
  userLGA?: string | null
}

export default function ProviderCard({ 
  provider, 
  gridView, 
  isDarkMode,
  userState = null,
  userLGA = null 
}: ProviderCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getRatingStars = (rating: number | null) => {
    const safeRating = rating || 0
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${star <= Math.floor(safeRating) 
              ? 'text-yellow-500 fill-yellow-500' 
              : 'text-gray-300 dark:text-gray-600'
            }`}
            fill="currentColor"
          />
        ))}
        <span className="ml-1 text-sm font-medium">{safeRating.toFixed(1)}</span>
      </div>
    )
  }

  const getServiceIcon = (serviceType: string) => {
    const type = serviceType.toLowerCase()
    if (type.includes('mechanic') || type.includes('car')) return <Car className="h-4 w-4" />
    if (type.includes('electric')) return <Zap className="h-4 w-4" />
    if (type.includes('plumb')) return <Droplets className="h-4 w-4" />
    if (type.includes('carpent') || type.includes('wood')) return <Briefcase className="h-4 w-4" />
    if (type.includes('paint')) return <Palette className="h-4 w-4" />
    if (type.includes('tailor') || type.includes('sew')) return <Scissors className="h-4 w-4" />
    if (type.includes('clean')) return <Sparkles className="h-4 w-4" />
    if (type.includes('chef') || type.includes('cook')) return <ChefHat className="h-4 w-4" />
    return <Briefcase className="h-4 w-4" />
  }

  const getLocationDisplay = (provider: FastProvider) => {
    const city = provider.city
    const state = provider.states?.[0]?.name
    const lga = provider.lgas?.[0]?.name
    
    if (city && state) {
      return `${city}, ${state}`
    } else if (lga && state) {
      return `${lga}, ${state}`
    } else if (state) {
      return state
    } else {
      return 'Location not set'
    }
  }

  // Calculate distance/proximity
  const getProximityInfo = () => {
    if (!userState) return null
    
    const providerState = provider.states?.[0]?.name
    const providerLGA = provider.lgas?.[0]?.name
    
    if (!providerState) return null
    
    if (providerState === userState && providerLGA === userLGA) {
      return { 
        text: 'Same LGA', 
        color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      }
    } else if (providerState === userState) {
      return { 
        text: 'Same State', 
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
      }
    } else {
      return { 
        text: 'Different State', 
        color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
      }
    }
  }

  // Get actual reviews count
  const reviewsCount = provider.total_reviews || 0
  const ratingValue = provider.rating || 0
  const proximityInfo = getProximityInfo()

  // BASIC GRID VIEW - SIMPLIFIED FOR MOBILE
  if (gridView === 'basic') {
    return (
      <Link href={`/providers/${provider.id}`}>
        <div className={`h-full flex flex-col rounded-lg overflow-hidden transition-all duration-200 hover:shadow-lg ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700 hover:border-primary/50' 
            : 'bg-white border-gray-200 hover:border-primary'
        } border`}>
          
          {/* IMAGE SECTION - Square image at top */}
          <div className="relative h-40 sm:h-48">
            {provider.profile_picture_url ? (
              <div className="w-full h-full">
                <img
                  src={provider.profile_picture_url}
                  alt={provider.business_name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                    const parent = e.currentTarget.parentElement
                    if (parent) {
                      const fallback = document.createElement('div')
                      fallback.className = 'w-full h-full bg-gradient-to-br from-primary to-green-500 flex items-center justify-center text-white text-2xl sm:text-3xl font-bold'
                      fallback.textContent = getInitials(provider.business_name)
                      parent.appendChild(fallback)
                    }
                  }}
                />
              </div>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary to-green-500 flex items-center justify-center text-white text-3xl sm:text-4xl font-bold">
                {getInitials(provider.business_name)}
              </div>
            )}
            
            {/* Badges - SIMPLIFIED */}
            <div className="absolute top-2 left-2 right-2 flex justify-between">
              {/* Verification Badge */}
              {provider.is_verified && (
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-500 text-white">
                  <Shield className="h-3 w-3 mr-1" />
                  Verified
                </span>
              )}
              
              {/* Online Status Badge */}
              {provider.is_online && (
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-500 text-white">
                  <span className="w-1.5 h-1.5 bg-white rounded-full mr-1"></span>
                  Online
                </span>
              )}
            </div>
          </div>

          {/* CONTENT SECTION - Simplified content */}
          <div className="flex-1 p-3 sm:p-4 flex flex-col">
            {/* Business Name - Truncated on mobile */}
            <h3 className={`font-bold text-base sm:text-lg mb-2 line-clamp-1 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {provider.business_name}
            </h3>
            
            {/* Service Type - SIMPLIFIED */}
            <div className="flex items-center gap-1 mb-2">
              <span className={`text-xs px-2 py-1 rounded ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                {provider.service_type}
              </span>
            </div>

            {/* Rating - SIMPLIFIED */}
            <div className="mb-2 flex items-center">
              {getRatingStars(ratingValue)}
              {reviewsCount > 0 && (
                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                  ({reviewsCount})
                </span>
              )}
            </div>

            {/* Location - SIMPLIFIED */}
            <div className="mb-3">
              <div className="flex items-center text-sm">
                <MapPin className={`h-3.5 w-3.5 mr-1.5 flex-shrink-0 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                <span className={`truncate ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {getLocationDisplay(provider)}
                </span>
              </div>
            </div>

            {/* Proximity Badge - Only show if relevant */}
            {proximityInfo && proximityInfo.text !== 'Different State' && (
              <div className="mb-3">
                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${proximityInfo.color}`}>
                  {proximityInfo.text}
                </span>
              </div>
            )}

            {/* Action Button - SIMPLIFIED */}
            <div className="mt-auto pt-2 border-t border-gray-200 dark:border-gray-700">
              <button className="w-full px-3 py-2 bg-primary text-white rounded font-medium text-sm flex items-center justify-center hover:bg-green-700 transition-colors">
                View Profile
                <ArrowRight className="h-3.5 w-3.5 ml-2" />
              </button>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  // DETAILED VIEW - More information
  return (
    <Link href={`/providers/${provider.id}`}>
      <div className={`rounded-lg overflow-hidden transition-all duration-200 hover:shadow-lg ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700 hover:border-primary/50' 
          : 'bg-white border-gray-200 hover:border-primary'
      } border`}>
        
        {/* MOBILE DETAILED VIEW - Stack vertically */}
        <div className="md:hidden">
          {/* Header with image and basic info */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-start gap-3">
              {/* Profile Image */}
              <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
                {provider.profile_picture_url ? (
                  <img
                    src={provider.profile_picture_url}
                    alt={provider.business_name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                      const parent = e.currentTarget.parentElement
                      if (parent) {
                        const fallback = document.createElement('div')
                        fallback.className = 'w-full h-full bg-gradient-to-br from-primary to-green-500 flex items-center justify-center text-white text-lg font-bold'
                        fallback.textContent = getInitials(provider.business_name)
                        parent.appendChild(fallback)
                      }
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary to-green-500 flex items-center justify-center text-white text-lg font-bold">
                    {getInitials(provider.business_name)}
                  </div>
                )}
              </div>
              
              {/* Basic Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <h3 className={`font-bold text-lg mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {provider.business_name}
                  </h3>
                  {provider.is_verified && (
                    <Shield className="h-4 w-4 text-blue-500 flex-shrink-0" />
                  )}
                </div>
                
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-sm px-2 py-1 rounded ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                    {provider.service_type}
                  </span>
                  {provider.is_online && (
                    <span className="text-xs text-green-600 dark:text-green-400 flex items-center">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></span>
                      Online
                    </span>
                  )}
                </div>
                
                {/* Rating and Location */}
                <div className="space-y-1">
                  <div className="flex items-center">
                    {getRatingStars(ratingValue)}
                  </div>
                  <div className="flex items-center text-sm">
                    <MapPin className={`h-3.5 w-3.5 mr-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                      {getLocationDisplay(provider)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Details Section */}
          <div className="p-4">
            {/* Bio if available */}
            {provider.bio && (
              <p className={`text-sm mb-4 line-clamp-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {provider.bio}
              </p>
            )}
            
            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className={`text-center p-2 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="text-lg font-bold text-primary">{ratingValue.toFixed(1)}</div>
                <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Rating</div>
              </div>
              {provider.years_experience && provider.years_experience > 0 && (
                <div className={`text-center p-2 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="text-lg font-bold text-primary">{provider.years_experience}</div>
                  <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Yrs Exp</div>
                </div>
              )}
              {provider.total_bookings && provider.total_bookings > 0 && (
                <div className={`text-center p-2 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="text-lg font-bold text-primary">{provider.total_bookings}</div>
                  <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Bookings</div>
                </div>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-2">
              <button className="flex-1 px-4 py-2.5 bg-primary text-white rounded font-medium text-sm flex items-center justify-center hover:bg-green-700 transition-colors">
                View Full Profile
                <ArrowRight className="h-3.5 w-3.5 ml-2" />
              </button>
              {provider.phone && (
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    window.open(`tel:${provider.phone}`)
                  }}
                  className="px-4 py-2.5 bg-green-600 text-white rounded font-medium text-sm hover:bg-green-700 transition-colors"
                >
                  Call
                </button>
              )}
            </div>
          </div>
        </div>

        {/* DESKTOP DETAILED VIEW - Horizontal layout */}
        <div className="hidden md:block p-6">
          <div className="flex gap-6">
            {/* Left Column */}
            <div className="flex-shrink-0">
              <div className="flex flex-col items-center">
                {/* Profile Image */}
                <div className="relative w-32 h-32 overflow-hidden rounded-lg border border-gray-300 dark:border-gray-600 mb-4">
                  {provider.profile_picture_url ? (
                    <img
                      src={provider.profile_picture_url}
                      alt={provider.business_name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                        const parent = e.currentTarget.parentElement
                        if (parent) {
                          const fallback = document.createElement('div')
                          fallback.className = 'w-full h-full bg-gradient-to-br from-primary to-green-500 flex items-center justify-center text-white text-3xl font-bold'
                          fallback.textContent = getInitials(provider.business_name)
                          parent.appendChild(fallback)
                        }
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary to-green-500 flex items-center justify-center text-white text-3xl font-bold">
                      {getInitials(provider.business_name)}
                    </div>
                  )}
                  
                  {/* Online Status */}
                  {provider.is_online && (
                    <div className="absolute top-2 right-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full border border-white dark:border-gray-700"></div>
                    </div>
                  )}
                </div>
                
                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 w-full mb-4">
                  <div className={`text-center p-2 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="text-lg font-bold text-primary">{ratingValue.toFixed(1)}</div>
                    <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Rating</div>
                  </div>
                  {provider.years_experience && provider.years_experience > 0 && (
                    <div className={`text-center p-2 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <div className="text-lg font-bold text-primary">{provider.years_experience}</div>
                      <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Yrs Exp</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="flex-1">
              {/* Header */}
              <div className="mb-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className={`font-bold text-xl mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {provider.business_name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded text-sm font-medium ${isDarkMode ? 'bg-primary/20 text-primary' : 'bg-primary/10 text-primary'}`}>
                        {getServiceIcon(provider.service_type)}
                        <span className="ml-2 font-medium">{provider.service_type}</span>
                      </span>
                      
                      {provider.is_verified && (
                        <span className="inline-flex items-center px-3 py-1.5 rounded text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          <Shield className="h-3 w-3 mr-2" />
                          Verified
                        </span>
                      )}
                      
                      {provider.is_online && (
                        <span className="inline-flex items-center px-3 py-1.5 rounded text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                          Online Now
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bio */}
                {provider.bio && (
                  <p className={`text-sm mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {provider.bio}
                  </p>
                )}
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className={`p-3 rounded ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <div className="flex items-center mb-1">
                    <Star className="h-4 w-4 text-yellow-500 mr-2" />
                    <div className="font-semibold">{ratingValue.toFixed(1)}</div>
                  </div>
                  <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {reviewsCount} reviews
                  </div>
                </div>
                
                <div className={`p-3 rounded ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <div className="flex items-center mb-1">
                    <MapPin className="h-4 w-4 text-primary mr-2" />
                    <div className="font-semibold truncate">{getLocationDisplay(provider)}</div>
                  </div>
                  <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Location</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button className="flex-1 px-4 py-2.5 bg-primary text-white rounded font-medium text-sm hover:bg-green-700 transition-colors">
                  View Full Profile
                </button>
                {provider.phone && (
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      window.open(`tel:${provider.phone}`)
                    }}
                    className="px-4 py-2.5 bg-green-600 text-white rounded font-medium text-sm hover:bg-green-700 transition-colors"
                  >
                    Call Now
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}