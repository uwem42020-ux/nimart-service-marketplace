// app/components/ProviderCard.tsx - UPDATED WITH FIXED INTERFACE
'use client'

import Link from 'next/link'
import { 
  Star, MapPin, Shield, Briefcase, Car, Zap, Droplets,
  Palette, Scissors, ChefHat, Sparkles, Eye, PhoneCall,
  Heart, Bookmark, ArrowRight, MessageSquare
} from 'lucide-react'

interface FastProvider {
  id: string
  business_name: string
  service_type: string
  rating: number | null
  total_reviews: number | null
  profile_picture_url: string | null
  state_id: string | null
  lga_id: string | null
  states: { name: string }[] | null  // Changed to array
  lgas: { name: string }[] | null    // Changed to array
  years_experience: number | null
  is_verified: boolean | null
  created_at: string
  bio: string | null
  phone: string | null
  response_rate?: number | null
}

interface ProviderCardProps {
  provider: FastProvider
  gridView: 'basic' | 'detailed'
  isDarkMode: boolean
}

export default function ProviderCard({ provider, gridView, isDarkMode }: ProviderCardProps) {
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
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`h-4 w-4 ${star <= Math.floor(safeRating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300 dark:text-gray-600'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
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

  const getStateName = (provider: FastProvider) => {
    if (!provider.states || provider.states.length === 0) return 'Select State'
    return provider.states[0]?.name || 'Select State'
  }

  const getLocationDisplay = (provider: FastProvider) => {
    const state = provider.states?.[0]?.name
    const lga = provider.lgas?.[0]?.name
    
    if (lga && state) {
      return `${lga}, ${state}`
    } else if (state) {
      return state
    } else {
      return 'Location not set'
    }
  }

  // Get actual reviews count
  const reviewsCount = provider.total_reviews || 0
  const ratingValue = provider.rating || 0

  if (gridView === 'basic') {
    return (
      <Link href={`/providers/${provider.id}`} className="block">
        <div className={`group rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        } border`}>
          <div className="p-5">
            <div className="flex items-start gap-4">
              {/* Profile Image */}
              <div className="flex-shrink-0 flex flex-col items-center">
                <div className="w-28 h-28 rounded-xl overflow-hidden border-2 border-white dark:border-gray-700 shadow-md">
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
                          fallback.className = 'w-full h-full bg-gradient-to-br from-primary to-green-500 flex items-center justify-center text-white text-2xl font-bold'
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
                </div>
                
                {/* Reviews Count */}
                <div className="mt-2 flex items-center justify-center text-xs text-gray-500 dark:text-gray-400">
                  <Star className="h-3 w-3 mr-1" />
                  {reviewsCount} review{reviewsCount !== 1 ? 's' : ''}
                </div>
              </div>

              {/* Text Content */}
              <div className="flex-1 min-w-0 flex flex-col justify-between h-28">
                {/* Header with Name and Verification */}
                <div>
                  <h3 className={`font-bold text-lg truncate group-hover:text-primary transition-colors ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {provider.business_name}
                  </h3>
                  <div className="flex items-center gap-1 mt-1">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      isDarkMode ? 'bg-primary/20 text-primary' : 'bg-primary/10 text-primary'
                    }`}>
                      {getServiceIcon(provider.service_type)}
                      <span className="ml-1">{provider.service_type}</span>
                    </span>
                    {provider.is_verified && !provider.id.startsWith('mock-') && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        <Shield className="h-3 w-3 mr-1" />
                        Verified
                      </span>
                    )}
                  </div>
                </div>

                {/* Rating and Stats */}
                <div className="space-y-1">
                  <div className="flex items-center">
                    {getRatingStars(ratingValue)}
                    <span className={`ml-1 text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {ratingValue.toFixed(1)}
                    </span>
                  </div>

                  <div className="flex items-center text-xs">
                    <div className={`flex items-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      <MapPin className="h-3 w-3 mr-1" />
                      <span>{getLocationDisplay(provider)}</span>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div>
                  <div className="inline-flex items-center justify-center w-full px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-green-700 font-medium text-xs transition-colors shadow-sm hover:shadow group-hover:bg-green-700">
                    View Profile
                    <ArrowRight className="h-3 w-3 ml-1 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  // EXPANDED VIEW
  return (
    <Link href={`/providers/${provider.id}`} className="block">
      <div className={`group rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      } border`}>
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left Column */}
            <div className="flex-shrink-0">
              <div className="flex flex-col items-center">
                {/* Profile Image */}
                <div className="relative w-40 h-40 rounded-xl overflow-hidden border-4 border-white dark:border-gray-700 shadow-lg mb-4">
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
                          fallback.className = 'w-full h-full bg-gradient-to-br from-primary to-green-500 flex items-center justify-center text-white text-4xl font-bold'
                          fallback.textContent = getInitials(provider.business_name)
                          parent.appendChild(fallback)
                        }
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary to-green-500 flex items-center justify-center text-white text-5xl font-bold">
                      {getInitials(provider.business_name)}
                    </div>
                  )}
                </div>
                
                {/* Quick Contact */}
                {provider.phone && (
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      window.open(`tel:${provider.phone}`)
                    }}
                    className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium text-sm transition-colors flex items-center justify-center shadow-sm hover:shadow mb-2"
                  >
                    <PhoneCall className="h-3 w-3 mr-2" />
                    Call Now
                  </button>
                )}
                
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    window.location.href = `/messages?provider=${provider.id}`
                  }}
                  className="w-full px-3 py-2 border border-primary text-primary rounded-lg hover:bg-green-50 dark:hover:bg-green-900/10 font-medium text-sm transition-colors flex items-center justify-center"
                >
                  <MessageSquare className="h-3 w-3 mr-2" />
                  Message
                </button>
              </div>
            </div>

            {/* Right Column */}
            <div className="flex-1">
              {/* Header */}
              <div className="mb-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className={`font-bold text-xl mb-2 group-hover:text-primary transition-colors ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {provider.business_name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        isDarkMode ? 'bg-primary/20 text-primary' : 'bg-primary/10 text-primary'
                      }`}>
                        {getServiceIcon(provider.service_type)}
                        <span className="ml-2">{provider.service_type}</span>
                      </span>
                      {provider.is_verified && !provider.id.startsWith('mock-') && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          <Shield className="h-3 w-3 mr-2" />
                          Verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bio */}
                {provider.bio && (
                  <p className={`text-sm mb-6 line-clamp-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {provider.bio}
                  </p>
                )}
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <div className={`text-center p-2 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <div className="text-lg font-bold text-primary mb-1">{ratingValue.toFixed(1)}</div>
                  <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Rating</div>
                </div>
                <div className={`text-center p-2 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <div className="text-lg font-bold text-primary mb-1">{reviewsCount}</div>
                  <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Reviews</div>
                </div>
                <div className={`text-center p-2 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <div className="text-lg font-bold text-primary mb-1">{provider.years_experience || 0}</div>
                  <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Years Exp.</div>
                </div>
                <div className={`text-center p-2 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <div className="text-lg font-bold text-primary mb-1">
                    <MapPin className="h-4 w-4 mx-auto" />
                  </div>
                  <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{getLocationDisplay(provider)}</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <div className="flex-1 px-3 py-2 bg-primary text-white rounded-lg hover:bg-green-700 font-medium text-sm text-center transition-colors shadow-sm hover:shadow cursor-pointer">
                  View Full Profile
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    // Handle favorite
                  }}
                  className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <Heart className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    // Handle bookmark
                  }}
                  className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <Bookmark className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}