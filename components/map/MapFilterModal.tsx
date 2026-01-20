'use client'

import { useState } from 'react'
import { X, Filter as FilterIcon, CheckCircle, Clock, Star, MapPin } from 'lucide-react'

interface MapFilterModalProps {
  isOpen: boolean
  onClose: () => void
  onApplyFilters: (filters: MapFilters) => void
  currentFilters?: MapFilters
}

export interface MapFilters {
  serviceType: string
  verificationStatus: 'all' | 'verified' | 'unverified' | 'pending'
  minRating: number
  maxDistance: number
  showOnlineOnly: boolean
}

const DEFAULT_FILTERS: MapFilters = {
  serviceType: '',
  verificationStatus: 'all',
  minRating: 0,
  maxDistance: 100,
  showOnlineOnly: false
}

const SERVICE_TYPES = [
  'Mechanics', 'Electricians', 'Plumbers', 'Carpenters', 'Painters',
  'Tailors', 'Cleaners', 'Chefs', 'Lawyers', 'Technicians'
]

const DISTANCE_OPTIONS = [
  { value: 10, label: 'Within 10 km' },
  { value: 25, label: 'Within 25 km' },
  { value: 50, label: 'Within 50 km' },
  { value: 100, label: 'Within 100 km' },
  { value: 200, label: 'Within 200 km' }
]

const RATING_OPTIONS = [
  { value: 0, label: 'Any rating' },
  { value: 3, label: '3+ stars' },
  { value: 4, label: '4+ stars' },
  { value: 4.5, label: '4.5+ stars' }
]

export default function MapFilterModal({
  isOpen,
  onClose,
  onApplyFilters,
  currentFilters = DEFAULT_FILTERS
}: MapFilterModalProps) {
  const [filters, setFilters] = useState<MapFilters>(currentFilters)
  const [selectedServiceType, setSelectedServiceType] = useState(currentFilters.serviceType)
  
  if (!isOpen) return null
  
  const handleApplyFilters = () => {
    onApplyFilters(filters)
    onClose()
  }
  
  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS)
    setSelectedServiceType('')
  }
  
  const handleServiceTypeSelect = (service: string) => {
    const newServiceType = selectedServiceType === service ? '' : service
    setSelectedServiceType(newServiceType)
    setFilters(prev => ({ ...prev, serviceType: newServiceType }))
  }
  
  const handleVerificationStatusSelect = (status: MapFilters['verificationStatus']) => {
    setFilters(prev => ({ ...prev, verificationStatus: status }))
  }
  
  const handleDistanceChange = (distance: number) => {
    setFilters(prev => ({ ...prev, maxDistance: distance }))
  }
  
  const handleRatingChange = (rating: number) => {
    setFilters(prev => ({ ...prev, minRating: rating }))
  }
  
  const handleToggleOnlineOnly = () => {
    setFilters(prev => ({ ...prev, showOnlineOnly: !prev.showOnlineOnly }))
  }
  
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FilterIcon className="h-6 w-6 text-primary mr-3" />
              <h2 className="text-xl font-bold text-gray-900">Map Filters</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close filters"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
          <p className="text-gray-600 mt-2">Filter providers on the map</p>
        </div>
        
        {/* Filters Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Service Type */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Service Type</h3>
            <div className="flex flex-wrap gap-2">
              {SERVICE_TYPES.map((service) => (
                <button
                  key={service}
                  onClick={() => handleServiceTypeSelect(service)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${selectedServiceType === service
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {service}
                </button>
              ))}
            </div>
          </div>
          
          {/* Verification Status */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Verification Status</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleVerificationStatusSelect('all')}
                className={`p-3 rounded-lg border flex items-center justify-center ${filters.verificationStatus === 'all'
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="text-sm font-medium">All</span>
              </button>
              <button
                onClick={() => handleVerificationStatusSelect('verified')}
                className={`p-3 rounded-lg border flex items-center justify-center ${filters.verificationStatus === 'verified'
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">Verified</span>
              </button>
              <button
                onClick={() => handleVerificationStatusSelect('unverified')}
                className={`p-3 rounded-lg border flex items-center justify-center ${filters.verificationStatus === 'unverified'
                  ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                  : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Clock className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">Unverified</span>
              </button>
              <button
                onClick={() => handleVerificationStatusSelect('pending')}
                className={`p-3 rounded-lg border flex items-center justify-center ${filters.verificationStatus === 'pending'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Clock className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">Pending</span>
              </button>
            </div>
          </div>
          
          {/* Minimum Rating */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Minimum Rating</h3>
            <div className="flex flex-wrap gap-2">
              {RATING_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleRatingChange(option.value)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center ${filters.minRating === option.value
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Star className={`h-4 w-4 mr-1 ${option.value > 0 ? 'fill-current' : ''}`} />
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Maximum Distance */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Maximum Distance</h3>
            <div className="flex flex-wrap gap-2">
              {DISTANCE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleDistanceChange(option.value)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center ${filters.maxDistance === option.value
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <MapPin className="h-4 w-4 mr-1" />
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Online Only Toggle */}
          <div className="mb-6">
            <label className="flex items-center cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={filters.showOnlineOnly}
                  onChange={handleToggleOnlineOnly}
                  className="sr-only"
                />
                <div className={`w-10 h-6 rounded-full transition-colors ${filters.showOnlineOnly ? 'bg-primary' : 'bg-gray-300'}`}>
                  <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${filters.showOnlineOnly ? 'transform translate-x-4' : ''}`} />
                </div>
              </div>
              <span className="ml-3 font-medium text-gray-900">Show online providers only</span>
            </label>
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex gap-3">
            <button
              onClick={handleResetFilters}
              className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-100 transition-colors"
            >
              Reset All
            </button>
            <button
              onClick={handleApplyFilters}
              className="flex-1 px-4 py-3 bg-primary text-white rounded-xl font-medium hover:bg-green-700 transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}