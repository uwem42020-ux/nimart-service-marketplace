// app/marketplace/page.tsx - Marketplace with State Filtering
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import ProviderCard from '@/components/ProviderCard'
import { 
  Search, MapPin, Filter, Grid, List, 
  ChevronDown, X, SlidersHorizontal
} from 'lucide-react'
import { generateCategorySEO, generateStructuredData } from '@/lib/seo'

interface Provider {
  id: string
  business_name: string
  service_type: string
  rating: number | null
  total_reviews: number | null
  profile_picture_url: string | null
  states: { name: string }[] | null
  years_experience: number | null
  is_verified: boolean | null
  created_at: string
  bio: string | null
  phone: string | null
}

const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe',
  'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara',
  'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau',
  'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
]

const SERVICE_TYPES = [
  'Mechanic', 'Electrician', 'Plumber', 'Carpenter', 'Painter',
  'Tailor', 'Cleaner', 'Chef', 'All Services'
]

export default function MarketplacePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [providers, setProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)
  const [gridView, setGridView] = useState<'basic' | 'detailed'>('basic')
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const [selectedState, setSelectedState] = useState(searchParams.get('state') || '')
  const [selectedService, setSelectedService] = useState(searchParams.get('service') || '')
  const [showFilters, setShowFilters] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    setIsDarkMode(darkModeMediaQuery.matches)
    
    const handleChange = (e: MediaQueryListEvent) => setIsDarkMode(e.matches)
    darkModeMediaQuery.addEventListener('change', handleChange)
    
    return () => darkModeMediaQuery.removeEventListener('change', handleChange)
  }, [])

  useEffect(() => {
    loadProviders()
  }, [selectedState, selectedService, searchQuery])

  const loadProviders = async () => {
    try {
      setLoading(true)
      
      let query = supabase
        .from('providers')
        .select(`
          id,
          business_name,
          service_type,
          rating,
          total_reviews,
          profile_picture_url,
          states (name),
          years_experience,
          is_verified,
          created_at,
          bio,
          phone
        `)

      // Apply filters
      if (selectedService && selectedService !== 'All Services') {
        query = query.ilike('service_type', `%${selectedService}%`)
      }

      if (selectedState) {
        query = query.contains('states', [{ name: selectedState }])
      }

      if (searchQuery) {
        query = query.or(`business_name.ilike.%${searchQuery}%,service_type.ilike.%${searchQuery}%,bio.ilike.%${searchQuery}%`)
      }

      const { data, error } = await query
        .order('rating', { ascending: false, nullsFirst: false })
        .order('total_reviews', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading providers:', error)
        setProviders([])
      } else {
        setProviders(data || [])
      }
    } catch (error) {
      console.error('Error loading providers:', error)
      setProviders([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateURL()
    loadProviders()
  }

  const updateURL = () => {
    const params = new URLSearchParams()
    if (searchQuery) params.set('search', searchQuery)
    if (selectedState) params.set('state', selectedState)
    if (selectedService && selectedService !== 'All Services') params.set('service', selectedService)
    
    router.push(`/marketplace?${params.toString()}`)
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedState('')
    setSelectedService('')
    router.push('/marketplace')
  }

  const activeFiltersCount = [searchQuery, selectedState, selectedService].filter(Boolean).length

  const service = selectedService && selectedService !== 'All Services' ? selectedService : undefined
  const location = selectedState || undefined
  const seoData = service ? generateCategorySEO(service, location) : {
    title: 'Service Marketplace | Nimart - Find Service Providers in Nigeria',
    description: 'Browse verified service providers across Nigeria. Find mechanics, electricians, plumbers, carpenters, painters, tailors, cleaners, and chefs near you.',
    url: 'https://nimart.ng/marketplace'
  }

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateStructuredData('Service', {
            serviceType: service || 'Service Provider',
            providerName: 'Nimart',
            location: location || 'Nigeria'
          }))
        }}
      />
      
      <div className={`min-h-screen transition-colors duration-200 ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
        {/* Header */}
        <div className={`${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} border-b sticky top-0 z-40`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* REMOVED HEADER TEXT SECTION - Search bar starts directly */}
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for services, providers, or keywords..."
                  className={`w-full pl-12 pr-4 py-3 rounded-xl border ${
                    isDarkMode 
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-primary`}
                />
              </div>
            </form>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center px-4 py-2 rounded-lg border transition-colors ${
                  showFilters
                    ? 'bg-primary text-white border-primary'
                    : isDarkMode
                      ? 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
                {activeFiltersCount > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-primary/20 rounded-full text-xs">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              {activeFiltersCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="flex items-center px-3 py-2 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 transition-colors"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear All
                </button>
              )}

              {/* Quick Service Filters */}
              <div className="flex flex-wrap gap-2 ml-auto">
                {SERVICE_TYPES.slice(0, 5).map((service) => (
                  <button
                    key={service}
                    onClick={() => {
                      setSelectedService(service === selectedService ? '' : service)
                      updateURL()
                    }}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      selectedService === service
                        ? 'bg-primary text-white'
                        : isDarkMode
                          ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {service}
                  </button>
                ))}
              </div>
            </div>

            {/* Expanded Filters */}
            {showFilters && (
              <div className={`mt-4 p-4 rounded-xl border ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Service Type Filter */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Service Type
                    </label>
                    <select
                      value={selectedService}
                      onChange={(e) => {
                        setSelectedService(e.target.value)
                        updateURL()
                      }}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDarkMode
                          ? 'bg-gray-900 border-gray-700 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-primary`}
                    >
                      <option value="">All Services</option>
                      {SERVICE_TYPES.slice(0, -1).map((service) => (
                        <option key={service} value={service}>{service}</option>
                      ))}
                    </select>
                  </div>

                  {/* State Filter */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      <MapPin className="h-4 w-4 inline mr-1" />
                      State
                    </label>
                    <select
                      value={selectedState}
                      onChange={(e) => {
                        setSelectedState(e.target.value)
                        updateURL()
                      }}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDarkMode
                          ? 'bg-gray-900 border-gray-700 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-primary`}
                    >
                      <option value="">All States</option>
                      {NIGERIAN_STATES.map((state) => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Results Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                {loading ? 'Loading...' : `Found ${providers.length} provider${providers.length !== 1 ? 's' : ''}`}
                {selectedState && ` in ${selectedState}`}
                {selectedService && selectedService !== 'All Services' && ` for ${selectedService}`}
              </p>
            </div>

            {/* View Toggle */}
            <div className="mt-4 md:mt-0 flex items-center space-x-2">
              <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mr-3`}>View:</span>
              <div className={`inline-flex rounded-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-300'} p-1`}>
                <button
                  onClick={() => setGridView('basic')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center ${
                    gridView === 'basic'
                      ? 'bg-primary text-white'
                      : isDarkMode 
                        ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-800' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Grid className="h-4 w-4 mr-1" />
                  Compact
                </button>
                <button
                  onClick={() => setGridView('detailed')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center ${
                    gridView === 'detailed'
                      ? 'bg-primary text-white'
                      : isDarkMode 
                        ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-800' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <List className="h-4 w-4 mr-1" />
                  Expanded
                </button>
              </div>
            </div>
          </div>

          {/* Providers Grid */}
          {loading ? (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className={`rounded-xl overflow-hidden animate-pulse ${
                  isDarkMode ? 'bg-gray-800' : 'bg-white'
                } border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="p-6">
                    <div className={`h-4 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} w-3/4 mb-4`}></div>
                    <div className={`h-3 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} w-1/2`}></div>
                  </div>
                </div>
              ))}
            </div>
          ) : providers.length === 0 ? (
            <div className="text-center py-12">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} mb-4`}>
                <Search className={`h-8 w-8 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
              </div>
              <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                No Providers Found
              </h3>
              <p className={`mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Try adjusting your filters or search query
              </p>
              <button
                onClick={clearFilters}
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-green-700 font-semibold"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className={`grid gap-6 ${
              gridView === 'basic' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
                : 'grid-cols-1 lg:grid-cols-2'
            }`}>
              {providers.map((provider) => (
                <ProviderCard
                  key={provider.id}
                  provider={provider}
                  gridView={gridView}
                  isDarkMode={isDarkMode}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}