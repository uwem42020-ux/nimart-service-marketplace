// components/MarketplaceProviders.tsx
'use client'

import { useState, useEffect } from 'react'
import ProviderCard from '@/components/ProviderCard'
import { supabase } from '@/lib/supabase'
import { FastProvider } from '@/lib/types'
import { 
  Filter, SortAsc, Loader2, AlertCircle,
  Grid, List, ChevronDown
} from 'lucide-react'

export default function MarketplaceProviders() {
  const [providers, setProviders] = useState<FastProvider[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [gridView, setGridView] = useState<'basic' | 'detailed'>('basic')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    category: '',
    state: '',
    minRating: 0,
    verifiedOnly: true
  })

  const loadProviders = async () => {
    try {
      setLoading(true)
      setError(null)
      
      let query = supabase
        .from('providers')
        .select(`*, states (name), lgas (name)`)
        .eq('is_active', true)
        .in('verification_status', ['verified', 'pending'])
        .order('rating', { ascending: false })
        .limit(50)

      // Apply filters
      if (filters.category) {
        query = query.ilike('service_type', `%${filters.category}%`)
      }
      
      if (filters.state) {
        query = query.eq('states.name', filters.state)
      }
      
      if (filters.minRating > 0) {
        query = query.gte('rating', filters.minRating)
      }
      
      if (filters.verifiedOnly) {
        query = query.eq('is_verified', true)
      }

      const { data, error } = await query

      if (error) throw error
      
      const typedProviders: FastProvider[] = (data || []).map((provider: any) => ({
        id: provider.id,
        business_name: provider.business_name || 'Provider',
        service_type: provider.service_type || 'Service',
        rating: provider.rating || 0,
        total_reviews: provider.total_reviews || 0,
        profile_picture_url: provider.profile_picture_url || provider.photo_url,
        state_id: provider.state_id,
        lga_id: provider.lga_id,
        states: provider.states ? [{ name: provider.states.name }] : null,
        lgas: provider.lgas ? [{ name: provider.lgas.name }] : null,
        years_experience: provider.years_experience || 0,
        is_verified: provider.is_verified || false,
        verification_status: provider.verification_status,
        created_at: provider.created_at || new Date().toISOString(),
        bio: provider.bio || '',
        phone: provider.phone || '',
        total_bookings: provider.total_bookings || 0,
        response_time: provider.response_time,
        city: provider.city || '',
        response_rate: provider.response_rate,
        is_online: provider.is_online || false
      }))

      setProviders(typedProviders)
    } catch (err: any) {
      console.error('Error loading providers:', err)
      setError('Failed to load providers. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProviders()
  }, [filters])

  const categories = [
    'Mechanics', 'Electricians', 'Plumbers', 'Carpenters', 'Painters',
    'Tailors', 'Cleaners', 'Chefs', 'Drivers', 'Technicians'
  ]

  const states = [
    'Lagos', 'Abuja', 'Port Harcourt', 'Ibadan', 'Kano',
    'Benin City', 'Abeokuta', 'Onitsha', 'Enugu', 'Warri'
  ]

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>
        <h3 className="text-xl font-semibold mb-3 text-gray-900">Error Loading Providers</h3>
        <p className="mb-4 text-gray-600">{error}</p>
        <button
          onClick={loadProviders}
          className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-green-700 font-semibold"
        >
          <Loader2 className="h-5 w-5 mr-2" />
          Retry
        </button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
        {Array.from({ length: 10 }).map((_, i) => (
          <div 
            key={`skeleton-${i}`}
            className="rounded-lg overflow-hidden animate-pulse bg-gray-200"
          >
            <div className="aspect-square bg-gray-300"></div>
            <div className="p-3 sm:p-4">
              <div className="h-4 bg-gray-300 rounded mb-3 w-3/4"></div>
              <div className="h-3 bg-gray-300 rounded mb-3 w-1/2"></div>
              <div className="h-8 bg-gray-300 rounded w-full"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <>
      {/* Mobile Filters Toggle */}
      <div className="lg:hidden mb-6">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="w-full flex items-center justify-between p-4 bg-white rounded-xl border border-gray-300"
        >
          <div className="flex items-center">
            <Filter className="h-5 w-5 mr-3" />
            <span className="font-medium">Filters</span>
          </div>
          <ChevronDown className={`h-5 w-5 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Filters Panel */}
      {(showFilters || window.innerWidth >= 1024) && (
        <div className={`${showFilters ? 'block mb-6' : 'hidden lg:block'} bg-white rounded-xl p-6 border border-gray-200`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* State Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State
              </label>
              <select
                value={filters.state}
                onChange={(e) => setFilters({ ...filters, state: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">All States</option>
                {states.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>

            {/* Rating Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Rating
              </label>
              <select
                value={filters.minRating}
                onChange={(e) => setFilters({ ...filters, minRating: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="0">Any Rating</option>
                <option value="3">3 Stars & Above</option>
                <option value="4">4 Stars & Above</option>
                <option value="4.5">4.5 Stars & Above</option>
              </select>
            </div>
          </div>

          {/* Additional Filters */}
          <div className="mt-6 flex flex-wrap gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.verifiedOnly}
                onChange={(e) => setFilters({ ...filters, verifiedOnly: e.target.checked })}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="ml-2 text-sm text-gray-700">Verified Only</span>
            </label>
            
            <button
              onClick={() => setFilters({
                category: '',
                state: '',
                minRating: 0,
                verifiedOnly: true
              })}
              className="text-sm text-primary hover:text-green-700 font-medium"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      )}

      {/* View Toggle and Results Count */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-gray-600">
            Showing {providers.length} provider{providers.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setGridView('basic')}
              className={`p-2 rounded-md ${gridView === 'basic' ? 'bg-white shadow-sm' : ''}`}
            >
              <Grid className="h-5 w-5" />
            </button>
            <button
              onClick={() => setGridView('detailed')}
              className={`p-2 rounded-md ${gridView === 'detailed' ? 'bg-white shadow-sm' : ''}`}
            >
              <List className="h-5 w-5" />
            </button>
          </div>
          <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
            <option>Sort by: Rating</option>
            <option>Sort by: Experience</option>
            <option>Sort by: Reviews</option>
          </select>
        </div>
      </div>

      {/* Providers Grid */}
      {providers.length > 0 ? (
        <div className={gridView === 'basic' 
          ? "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6"
          : "grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6"
        }>
          {providers.map((provider) => (
            <ProviderCard 
              key={provider.id}
              provider={provider}
              gridView={gridView}
              isDarkMode={false}
              userState={null}
              userLGA={null}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
            <Filter className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold mb-3 text-gray-900">No Providers Found</h3>
          <p className="mb-4 text-gray-600">
            {filters.category || filters.state 
              ? 'Try adjusting your filters to see more results.'
              : 'No verified providers are currently available.'}
          </p>
          {(filters.category || filters.state || filters.minRating > 0) && (
            <button
              onClick={() => setFilters({
                category: '',
                state: '',
                minRating: 0,
                verifiedOnly: true
              })}
              className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-green-700 font-semibold"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}
    </>
  )
}