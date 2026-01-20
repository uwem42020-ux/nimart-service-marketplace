// app/page.tsx - CORRECTED VERSION WITH PROPER FLOW
'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { FastProvider, ServiceCategory, UserLocation, State, LGA } from '@/lib/types'
import { supabase } from '@/lib/supabase'
import ProviderCard from '@/components/ProviderCard'
import HomepageMap from '@/components/map/HomepageMap'
import { 
  Search, MapPin, Star, Shield, CheckCircle, 
  ArrowRight, ChevronRight, ChevronDown,
  Briefcase, Car, Zap, Droplets,
  Palette, Scissors, ChefHat, Sparkles,
  Wrench, Grid, List, Mail, Phone, 
  Facebook, Instagram, Youtube, Home as HomeIcon, 
  Utensils, Cake, Store, Calendar, Mic, Flower,
  Camera, Video, Users, Bike, Truck, Package, 
  Smartphone, Laptop, Code, PenTool, TrendingUp, 
  Calculator, Scale, Building, Map, Book, 
  GraduationCap, Award, Eye, AlertTriangle, Layers, 
  Clock, Heart, User, Shirt, Baby, Square, Circle, 
  Hammer, WifiOff, RefreshCw, Filter, SortAsc, SortDesc,
  X, Menu, ChevronLeft, ChevronRight as RightIcon,
  Navigation, Compass, Target, CheckCircle2, Loader2,
  MessageCircle, Bell, UserCircle, ChevronUp, ChevronDown as DownIcon,
  CalendarDays, Twitter
} from 'lucide-react'

// Import utilities
import { getUserLocation } from '@/lib/location'
import { SORT_OPTIONS, SortOption, sortProviders } from '@/lib/sorting'

export default function Home() {
  const router = useRouter()
  const pathname = usePathname()
  const [searchQuery, setSearchQuery] = useState('')
  const [featuredProviders, setFeaturedProviders] = useState<FastProvider[]>([])
  const [loadingProviders, setLoadingProviders] = useState(true)
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [categoriesVisible, setCategoriesVisible] = useState(6)
  const [gridView, setGridView] = useState<'basic' | 'detailed'>('basic')
  
  // Location state - for filtering providers
  const [userLocation, setUserLocation] = useState<UserLocation>({
    state: null,
    lga: null,
    coordinates: null,
    detected: false
  })
  const [detectingLocation, setDetectingLocation] = useState(false)
  const [sortBy, setSortBy] = useState<SortOption>('distance')
  const [selectedState, setSelectedState] = useState<string>('')
  const [selectedLGA, setSelectedLGA] = useState<string>('')
  const [states, setStates] = useState<State[]>([])
  const [lgas, setLgas] = useState<LGA[]>([])
  const [filteredProviders, setFilteredProviders] = useState<FastProvider[]>([])
  const [onlineStatus, setOnlineStatus] = useState(true)
  const [showLocationSection, setShowLocationSection] = useState(false)
  const [currentLocationText, setCurrentLocationText] = useState('Location not set')
  const [locationIconActive, setLocationIconActive] = useState(false)

  // Search results state
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [searchResults, setSearchResults] = useState<FastProvider[]>([])
  const [searchResultsLoading, setSearchResultsLoading] = useState(false)

  // Search suggestions
  const [searchSuggestions, setSearchSuggestions] = useState<Array<{suggestion: string, type: string}>>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)

  // Mobile navigation state
  const [activeNav, setActiveNav] = useState<'home' | 'bookings' | 'messages' | 'notifications' | 'profile'>('home')
  
  // Footer state for mobile
  const [showMobileFooter, setShowMobileFooter] = useState(false)
  
  // Track scroll for footer visibility
  const [lastScrollY, setLastScrollY] = useState(0)
  const [showFooterNav, setShowFooterNav] = useState(false)

  // Popular tags scroll
  const popularTagsRef = useRef<HTMLDivElement>(null)
  
  // Categories scroll ref
  const categoriesScrollRef = useRef<HTMLDivElement>(null)

  // Mobile navigation items
  const mobileNavItems = [
    { key: 'home', icon: HomeIcon, label: 'Home', path: '/' },
    { key: 'bookings', icon: CalendarDays, label: 'Bookings', path: '/bookings' },
    { key: 'messages', icon: MessageCircle, label: 'Messages', path: '/messages' },
    { key: 'notifications', icon: Bell, label: 'Alerts', path: '/notifications' },
    { key: 'profile', icon: UserCircle, label: 'Profile', path: '/profile' }
  ]

  // Popular services with Lucide icons (no custom icons needed)
  const popularServices = [
    { name: 'Mechanics', icon: Car, color: 'bg-red-100 text-red-600' },
    { name: 'Electricians', icon: Zap, color: 'bg-yellow-100 text-yellow-600' },
    { name: 'Plumbers', icon: Droplets, color: 'bg-blue-100 text-blue-600' },
    { name: 'Carpenters', icon: Hammer, color: 'bg-amber-100 text-amber-600' },
    { name: 'Painters', icon: Palette, color: 'bg-indigo-100 text-indigo-600' },
    { name: 'Tailors', icon: Scissors, color: 'bg-pink-100 text-pink-600' },
    { name: 'Cleaners', icon: Sparkles, color: 'bg-purple-100 text-purple-600' },
    { name: 'Chefs', icon: ChefHat, color: 'bg-green-100 text-green-600' },
    { name: 'Lawyers', icon: Scale, color: 'bg-gray-100 text-gray-600' },
    { name: 'Technicians', icon: Wrench, color: 'bg-cyan-100 text-cyan-600' },
  ]

  // Animation for location icon
  useEffect(() => {
    if (detectingLocation) {
      const interval = setInterval(() => {
        setLocationIconActive(prev => !prev)
      }, 800)
      return () => clearInterval(interval)
    } else {
      setLocationIconActive(false)
    }
  }, [detectingLocation])

  // Check online status
  useEffect(() => {
    const handleOnlineStatus = () => {
      setOnlineStatus(navigator.onLine)
    }
    
    handleOnlineStatus()
    window.addEventListener('online', handleOnlineStatus)
    window.addEventListener('offline', handleOnlineStatus)
    
    return () => {
      window.removeEventListener('online', handleOnlineStatus)
      window.removeEventListener('offline', handleOnlineStatus)
    }
  }, [])

  // Set active nav based on pathname
  useEffect(() => {
    if (pathname === '/') setActiveNav('home')
    else if (pathname.includes('/bookings')) setActiveNav('bookings')
    else if (pathname.includes('/messages')) setActiveNav('messages')
    else if (pathname.includes('/notifications')) setActiveNav('notifications')
    else if (pathname.includes('/profile')) setActiveNav('profile')
  }, [pathname])

  // Scroll handler for footer navigation visibility
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const isScrollingUp = currentScrollY < lastScrollY
      
      // Show footer nav only when scrolling up AND not at the very top
      if (isScrollingUp && currentScrollY > 100) {
        setShowFooterNav(true)
      } 
      // Hide footer nav when scrolling down or at top
      else {
        setShowFooterNav(false)
      }
      
      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  // Hide footer when nav item is clicked
  useEffect(() => {
    setShowMobileFooter(false)
  }, [activeNav])

  // Load service categories with provider counts
  const loadServiceCategories = async () => {
    try {
      setLoadingCategories(true)
      
      // Try RPC function first
      const { data, error } = await supabase
        .rpc('get_popular_categories_with_providers')

      if (error) {
        console.error('Error loading categories via RPC:', error)
        // Fallback to regular query
        const { data: categoriesData, error: catError } = await supabase
          .from('service_categories')
          .select('*')
          .eq('is_active', true)
          .order('sort_order')
          .limit(58)
        
        if (catError) {
          console.error('Fallback categories error:', catError)
          setServiceCategories(getFallbackCategories())
          return
        }
        
        if (categoriesData && categoriesData.length > 0) {
          const categoriesWithColors = categoriesData.map((category: any, index: number) => {
            const colors = getCategoryColors(index)
            return {
              id: category.id,
              name: category.name,
              icon: category.icon,
              description: category.description || 'Professional services',
              sort_order: category.sort_order,
              provider_count: 0,
              ...colors
            }
          })
          setServiceCategories(categoriesWithColors)
        } else {
          setServiceCategories(getFallbackCategories())
        }
      } else if (data && data.length > 0) {
        const categoriesWithColors = data.map((category: any, index: number) => {
          const colors = getCategoryColors(index)
          return {
            id: category.category_id,
            name: category.category_name,
            icon: category.icon,
            description: `${category.provider_count} providers`,
            sort_order: index + 1,
            provider_count: category.provider_count,
            ...colors
          }
        })
        setServiceCategories(categoriesWithColors)
      } else {
        setServiceCategories(getFallbackCategories())
      }
      
    } catch (error) {
      console.error('Error loading categories:', error)
      setServiceCategories(getFallbackCategories())
    } finally {
      setLoadingCategories(false)
    }
  }

  // Fallback categories
  const getFallbackCategories = (): ServiceCategory[] => {
    const fallbackCategories = [
      { name: 'Mechanics', description: 'Auto repairs & maintenance', icon: 'car' },
      { name: 'Electricians', description: 'Electrical installations', icon: 'zap' },
      { name: 'Plumbers', description: 'Plumbing & pipe works', icon: 'droplets' },
      { name: 'Carpenters', description: 'Woodwork & furniture', icon: 'hammer' },
      { name: 'Painters', description: 'Painting & decoration', icon: 'palette' },
      { name: 'Tailors', description: 'Fashion & clothing', icon: 'scissors' },
      { name: 'Cleaners', description: 'Home & office cleaning', icon: 'sparkles' },
      { name: 'Chefs', description: 'Cooking & catering', icon: 'chef-hat' },
      { name: 'Lawyers', description: 'Legal services', icon: 'scale' },
      { name: 'Technicians', description: 'Technical services', icon: 'wrench' },
    ]
    
    return fallbackCategories.map((cat, index) => {
      const colors = getCategoryColors(index)
      return {
        id: `fallback-${index}`,
        name: cat.name,
        icon: cat.icon,
        description: cat.description,
        sort_order: index + 1,
        provider_count: 0,
        ...colors
      }
    })
  }

  // Color mapping for categories
  const getCategoryColors = (index: number) => {
    const colors = [
      { color: 'text-orange-600 bg-orange-50', darkColor: 'text-orange-400 bg-orange-900/20' },
      { color: 'text-yellow-600 bg-yellow-50', darkColor: 'text-yellow-400 bg-yellow-900/20' },
      { color: 'text-blue-600 bg-blue-50', darkColor: 'text-blue-400 bg-blue-900/20' },
      { color: 'text-green-600 bg-green-50', darkColor: 'text-green-400 bg-green-900/20' },
      { color: 'text-purple-600 bg-purple-50', darkColor: 'text-purple-400 bg-purple-900/20' },
      { color: 'text-pink-600 bg-pink-50', darkColor: 'text-pink-400 bg-pink-900/20' },
      { color: 'text-red-600 bg-red-50', darkColor: 'text-red-400 bg-red-900/20' },
      { color: 'text-indigo-600 bg-indigo-50', darkColor: 'text-indigo-400 bg-indigo-900/20' },
      { color: 'text-teal-600 bg-teal-50', darkColor: 'text-teal-400 bg-teal-900/20' },
      { color: 'text-cyan-600 bg-cyan-50', darkColor: 'text-cyan-400 bg-cyan-900/20' },
    ]
    return colors[index % colors.length]
  }

  // Simple icon mapping for service categories
  const getIconComponent = (iconName: string | null): React.ReactNode => {
    if (!iconName) return <Briefcase className="h-4 w-4" />
    
    const iconMap: Record<string, React.ReactNode> = {
      'car': <Car className="h-4 w-4" />,
      'zap': <Zap className="h-4 w-4" />,
      'droplets': <Droplets className="h-4 w-4" />,
      'hammer': <Hammer className="h-4 w-4" />,
      'palette': <Palette className="h-4 w-4" />,
      'scissors': <Scissors className="h-4 w-4" />,
      'sparkles': <Sparkles className="h-4 w-4" />,
      'chef-hat': <ChefHat className="h-4 w-4" />,
      'home': <HomeIcon className="h-4 w-4" />,
      'shirt': <Shirt className="h-4 w-4" />,
      'baby': <Baby className="h-4 w-4" />,
      'user': <User className="h-4 w-4" />,
      'utensils': <Utensils className="h-4 w-4" />,
      'cake': <Cake className="h-4 w-4" />,
      'store': <Store className="h-4 w-4" />,
      'calendar': <Calendar className="h-4 w-4" />,
      'mic': <Mic className="h-4 w-4" />,
      'flower': <Flower className="h-4 w-4" />,
      'camera': <Camera className="h-4 w-4" />,
      'video': <Video className="h-4 w-4" />,
      'users': <Users className="h-4 w-4" />,
      'bike': <Bike className="h-4 w-4" />,
      'truck': <Truck className="h-4 w-4" />,
      'package': <Package className="h-4 w-4" />,
      'smartphone': <Smartphone className="h-4 w-4" />,
      'laptop': <Laptop className="h-4 w-4" />,
      'code': <Code className="h-4 w-4" />,
      'pen-tool': <PenTool className="h-4 w-4" />,
      'trending-up': <TrendingUp className="h-4 w-4" />,
      'calculator': <Calculator className="h-4 w-4" />,
      'scale': <Scale className="h-4 w-4" />,
      'building': <Building className="h-4 w-4" />,
      'map': <Map className="h-4 w-4" />,
      'book': <Book className="h-4 w-4" />,
      'graduation-cap': <GraduationCap className="h-4 w-4" />,
      'award': <Award className="h-4 w-4" />,
      'eye': <Eye className="h-4 w-4" />,
      'alert-triangle': <AlertTriangle className="h-4 w-4" />,
      'layers': <Layers className="h-4 w-4" />,
      'clock': <Clock className="h-4 w-4" />,
      'heart': <Heart className="h-4 w-4" />,
      'square': <Square className="h-4 w-4" />,
      'circle': <Circle className="h-4 w-4" />,
      'grid': <Grid className="h-4 w-4" />,
      'wrench': <Wrench className="h-4 w-4" />,
      'steering-wheel': <Car className="h-4 w-4" />,
      'briefcase': <Briefcase className="h-4 w-4" />,
      'car-front': <Car className="h-4 w-4" />,
      'shield': <Shield className="h-4 w-4" />,
      'tree': <Sparkles className="h-4 w-4" />,
      'leaf': <Sparkles className="h-4 w-4" />,
      'fish': <Droplets className="h-4 w-4" />,
      'dress': <Shirt className="h-4 w-4" />,
      'brush': <PenTool className="h-4 w-4" />,
      'cut': <Scissors className="h-4 w-4" />,
      'tool': <Wrench className="h-4 w-4" />,
    }
    
    return iconMap[iconName] || <Briefcase className="h-4 w-4" />
  }

  // FIXED: Load providers - Show only confirmed OTP providers (not pending_email)
  const loadFeaturedProviders = async () => {
    try {
      setLoadingProviders(true)
      
      if (!navigator.onLine) {
        throw new Error('No internet connection')
      }
      
      console.log('🔄 Loading providers...')
      
      // Try SQL function first
      const { data: providers, error } = await supabase
        .rpc('get_featured_providers', {
          limit_count: 20
        })

      if (error) {
        console.error('RPC Error:', error)
        // Fallback to direct query
        await loadProvidersDirectly()
        return
      }
      
      if (providers && providers.length > 0) {
        const typedProviders: FastProvider[] = providers.map((provider: any) => ({
          id: provider.id,
          business_name: provider.business_name,
          service_type: provider.service_type,
          rating: provider.rating || 0,
          total_reviews: provider.total_reviews || 0,
          profile_picture_url: provider.profile_picture_url,
          state_id: provider.state_id || '',
          lga_id: provider.lga_id || '',
          states: provider.state_name ? [{ name: provider.state_name }] : null,
          lgas: provider.lga_name ? [{ name: provider.lga_name }] : null,
          years_experience: provider.years_experience || 0,
          is_verified: provider.is_verified || false,
          verification_status: provider.verification_status || 'unverified',
          created_at: provider.created_at || new Date().toISOString(),
          bio: provider.bio || '',
          phone: provider.phone || '',
          total_bookings: provider.total_bookings || 0,
          response_time: provider.response_time,
          city: provider.city || '',
          response_rate: provider.response_rate,
          is_online: provider.is_online || false
        }))
        
        // FILTER: Only show providers who confirmed OTP (NOT pending_email)
        const confirmedProviders = typedProviders.filter(p => 
          p.verification_status !== 'pending_email' && 
          p.verification_status !== 'demo'
        )
        
        console.log(`📊 Found ${typedProviders.length} total, ${confirmedProviders.length} confirmed OTP`)
        
        setFeaturedProviders(confirmedProviders)
        setFilteredProviders(confirmedProviders)
      } else {
        await loadProvidersDirectly()
      }
      
    } catch (error: any) {
      console.error('Loading error:', error)
      await loadProvidersDirectly()
    } finally {
      setLoadingProviders(false)
    }
  }

  // FIXED: Direct provider loading - Show only confirmed OTP providers
  const loadProvidersDirectly = async () => {
    try {
      console.log('📋 Loading providers directly from database...')
      
      const { data: providersData, error } = await supabase
        .from('providers')
        .select(`*, states (name), lgas (name)`)
        .eq('is_active', true)
        // Show only providers who confirmed OTP: unverified, pending, or verified
        // DO NOT show: pending_email (didn't confirm OTP) or demo
        .in('verification_status', ['unverified', 'pending', 'verified'])
        .order('rating', { ascending: false })
        .limit(20)

      if (error) {
        console.error('Direct query error:', error)
        throw error
      }
      
      if (providersData && providersData.length > 0) {
        const typedProviders: FastProvider[] = providersData.map((provider: any) => ({
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
        
        console.log(`✅ Loaded ${typedProviders.length} confirmed providers`)
        console.log('Provider status breakdown:', typedProviders.map(p => ({
          name: p.business_name,
          status: p.verification_status,
          is_verified: p.is_verified
        })))
        
        setFeaturedProviders(typedProviders)
        setFilteredProviders(typedProviders)
      } else {
        console.log('⚠️ No confirmed providers found (all are pending_email or demo)')
        setFeaturedProviders([])
        setFilteredProviders([])
      }
    } catch (error) {
      console.error('Direct load error:', error)
      setFeaturedProviders([])
      setFilteredProviders([])
    }
  }

  // Load states and LGAs for dropdowns
  const loadStatesAndLGAs = async () => {
    try {
      // Load states
      const { data: statesData, error: statesError } = await supabase
        .from('states')
        .select('id, name')
        .order('name')
      
      if (statesError) throw statesError
      
      if (statesData) {
        setStates(statesData)
      }
      
      // Load all LGAs
      const { data: lgasData, error: lgasError } = await supabase
        .from('lgas')
        .select('id, name, state_id')
        .order('name')
      
      if (lgasError) throw lgasError
      
      if (lgasData) {
        setLgas(lgasData)
      }
    } catch (error) {
      console.error('Error loading location data:', error)
    }
  }

  // Initialize everything
  useEffect(() => {
    const initializeData = async () => {
      console.log('🔄 Initializing homepage data...')
      await Promise.all([
        loadServiceCategories(),
        loadFeaturedProviders(),
        loadStatesAndLGAs()
      ])
      
      // Check if user has saved location in localStorage
      const savedLocation = localStorage.getItem('nimart-user-location')
      if (savedLocation) {
        try {
          const location = JSON.parse(savedLocation)
          setUserLocation(location)
          if (location.state && location.lga) {
            setCurrentLocationText(`${location.lga}, ${location.state}`)
          } else if (location.state) {
            setCurrentLocationText(location.state)
          }
        } catch (error) {
          console.error('Error parsing saved location:', error)
        }
      }
      
      console.log('✅ Homepage initialization complete')
    }
    
    initializeData()
  }, [])

  // Update filtered providers when dependencies change
  useEffect(() => {
    updateFilteredProviders()
  }, [featuredProviders, sortBy, selectedState, selectedLGA, userLocation])

  // Search for providers as user types
  const handleSearchInput = async (value: string) => {
    setSearchQuery(value)
    
    if (value.trim().length > 1) {
      setSearchLoading(true)
      setShowSuggestions(true)
      
      try {
        // Get search suggestions
        const { data: suggestions, error } = await supabase
          .rpc('get_search_suggestions_autocomplete', {
            partial_query: value
          })
        
        if (error) {
          console.error('Suggestions error:', error)
        } else if (suggestions) {
          setSearchSuggestions(suggestions)
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error)
      } finally {
        setSearchLoading(false)
      }
    } else {
      setShowSuggestions(false)
      setSearchSuggestions([])
    }
  }

  // Perform search - Only search confirmed providers
  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setShowSearchResults(false)
      setSearchResults([])
      loadFeaturedProviders()
      return
    }
    
    setSearchResultsLoading(true)
    setShowSearchResults(true)
    setShowSuggestions(false)
    
    try {
      // Use the simple_provider_search SQL function
      const { data: searchResults, error } = await supabase
        .rpc('simple_provider_search', {
          search_term: query
        })
      
      if (error) {
        console.error('Search RPC error:', error)
        // Fallback to regular query - Only search confirmed providers
        const { data: providersData, error: directError } = await supabase
          .from('providers')
          .select(`*, states (name), lgas (name)`)
          .eq('is_active', true)
          .in('verification_status', ['unverified', 'pending', 'verified']) // Only confirmed
          .or(`business_name.ilike.%${query}%,service_type.ilike.%${query}%,bio.ilike.%${query}%`)
          .limit(50)
        
        if (directError) {
          console.error('Fallback search error:', directError)
          throw directError
        }
        
        if (providersData && providersData.length > 0) {
          const typedProviders: FastProvider[] = providersData.map((provider: any) => ({
            id: provider.id,
            business_name: provider.business_name,
            service_type: provider.service_type,
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
            created_at: provider.created_at,
            bio: provider.bio || '',
            phone: provider.phone || '',
            total_bookings: provider.total_bookings || 0,
            response_time: provider.response_time,
            city: provider.city || '',
            response_rate: provider.response_rate,
            is_online: provider.is_online || false
          }))
          
          setSearchResults(typedProviders)
        } else {
          setSearchResults([])
        }
      } else if (searchResults && searchResults.length > 0) {
        // Filter search results to only show confirmed providers
        const confirmedSearchResults = searchResults.filter((provider: any) => 
          provider.verification_status !== 'pending_email' && 
          provider.verification_status !== 'demo'
        )
        
        const typedProviders: FastProvider[] = confirmedSearchResults.map((provider: any) => ({
          id: provider.id,
          business_name: provider.business_name,
          service_type: provider.service_type,
          rating: provider.rating || 0,
          total_reviews: provider.total_reviews || 0,
          profile_picture_url: provider.profile_picture_url,
          state_id: '',
          lga_id: '',
          states: provider.state_name ? [{ name: provider.state_name }] : null,
          lgas: provider.lga_name ? [{ name: provider.lga_name }] : null,
          years_experience: provider.years_experience || 0,
          is_verified: provider.is_verified || false,
          verification_status: provider.verification_status,
          created_at: provider.created_at || new Date().toISOString(),
          bio: provider.bio || '',
          phone: provider.phone || '',
          total_bookings: provider.total_bookings || 0,
          response_time: provider.response_time || null,
          city: provider.city || '',
          response_rate: provider.response_rate || null,
          is_online: provider.is_online || false
        }))
        
        setSearchResults(typedProviders)
      } else {
        setSearchResults([])
      }
    } catch (error) {
      console.error('Search error:', error)
      setSearchResults([])
    } finally {
      setSearchResultsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      performSearch(searchQuery)
    }
  }

  // Location detection - for filtering providers
  const detectUserLocation = async () => {
    setDetectingLocation(true)
    setCurrentLocationText('Detecting location...')
    
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const coords = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            }
            
            setCurrentLocationText('Getting your address...')
            
            try {
              // Use reverse geocoding API
              const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${coords.latitude}&lon=${coords.longitude}&format=json&addressdetails=1&zoom=10`
              )
              
              if (response.ok) {
                const data = await response.json()
                const address = data.address
                
                const state = address.state || address.region || address.county
                const lga = address.county || address.city_district || address.city || address.town
                
                if (state) {
                  const newLocation: UserLocation = {
                    coordinates: coords,
                    state: state,
                    lga: lga,
                    detected: true
                  }
                  
                  setUserLocation(newLocation)
                  setCurrentLocationText(`${lga || 'Area'}, ${state}`)
                  
                  setTimeout(() => {
                    if (typeof window !== 'undefined' && (window as any).Nimart?.showToast) {
                      (window as any).Nimart.showToast({
                        title: 'Location Detected!',
                        message: `Found you in ${lga ? lga + ', ' : ''}${state}`,
                        type: 'success',
                        duration: 3000
                      })
                    }
                  }, 500)
                  
                  localStorage.setItem('nimart-user-location', JSON.stringify(newLocation))
                  
                  // Update filtered providers with new location
                  updateFilteredProviders()
                } else {
                  throw new Error('Could not determine location')
                }
              } else {
                throw new Error('Geocoding service failed')
              }
            } catch (geocodeError) {
              console.error('Geocoding error:', geocodeError)
              const newLocation: UserLocation = {
                coordinates: coords,
                state: null,
                lga: null,
                detected: true
              }
              
              setUserLocation(newLocation)
              setCurrentLocationText(`Near ${coords.latitude.toFixed(2)}, ${coords.longitude.toFixed(2)}`)
              
              localStorage.setItem('nimart-user-location', JSON.stringify(newLocation))
              
              // Update filtered providers
              updateFilteredProviders()
            }
            
            setDetectingLocation(false)
          },
          (error) => {
            console.error('Geolocation error:', error)
            setCurrentLocationText('Location access denied')
            setDetectingLocation(false)
          },
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0
          }
        )
      } else {
        setCurrentLocationText('Geolocation not supported')
        setDetectingLocation(false)
      }
    } catch (error) {
      console.error('Location error:', error)
      setCurrentLocationText('Location detection failed')
      setDetectingLocation(false)
    }
  }

  // Get LGAs for selected state
  const getLGAsForState = (stateId: string) => {
    return lgas.filter(lga => lga.state_id === stateId)
  }

  // Sort and filter providers based on location selection
  const updateFilteredProviders = () => {
    let filtered = [...featuredProviders]
    
    // Filter by selected state
    if (selectedState) {
      const stateName = states.find(s => s.id === selectedState)?.name
      filtered = filtered.filter(p => 
        p.states?.[0]?.name === stateName
      )
    }
    
    // Filter by selected LGA
    if (selectedLGA) {
      const lgaName = lgas.find(l => l.id === selectedLGA)?.name
      filtered = filtered.filter(p => 
        p.lgas?.[0]?.name === lgaName
      )
    }
    
    // Sort providers based on user's location
    const sorted = sortProviders(
      filtered,
      sortBy,
      userLocation.state,
      userLocation.lga
    )
    
    setFilteredProviders(sorted)
  }

  const handleShowMoreCategories = () => {
    setCategoriesVisible(prev => Math.min(prev + 6, serviceCategories.length))
  }

  const handleShowLessCategories = () => {
    setCategoriesVisible(6)
  }

  // Save user's manual location selection - for filtering providers
  const handleLocationSelect = () => {
    const selectedStateName = states.find(s => s.id === selectedState)?.name || null
    const selectedLGAName = lgas.find(l => l.id === selectedLGA)?.name || null
    
    if (selectedStateName) {
      const newLocation: UserLocation = {
        state: selectedStateName,
        lga: selectedLGAName,
        coordinates: null,
        detected: true
      }
      
      setUserLocation(newLocation)
      setCurrentLocationText(`${selectedLGAName || 'Area'}, ${selectedStateName}`)
      
      localStorage.setItem('nimart-user-location', JSON.stringify(newLocation))
      
      // Update filtered providers with new location
      updateFilteredProviders()
    }
  }

  // Clear search
  const clearSearch = () => {
    setSearchQuery('')
    setShowSuggestions(false)
    setShowSearchResults(false)
    setSearchSuggestions([])
    loadFeaturedProviders()
  }

  // Handle provider profile click
  const handleProviderProfileClick = async (providerId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        router.push(`/providers/${providerId}`)
      } else {
        router.push(`/login?redirect=/providers/${providerId}`)
      }
    } catch (error) {
      console.error('Auth check error:', error)
      router.push(`/login?redirect=/providers/${providerId}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-safe-nav">
      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <div className={`lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 pb-safe transition-transform duration-300 ${showFooterNav ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="flex justify-around items-center py-3">
          {mobileNavItems.map((item) => {
            const Icon = item.icon
            const isActive = activeNav === item.key
            return (
              <Link
                key={item.key}
                href={item.path}
                className={`flex flex-col items-center justify-center w-16 h-16 rounded-xl transition-all duration-300 ${isActive ? 'text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveNav(item.key as any)}
              >
                <div className={`relative p-3 rounded-full ${isActive ? 'bg-primary/10' : 'hover:bg-gray-100'}`}>
                  <Icon className="h-6 w-6" />
                  {isActive && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full"></div>
                  )}
                </div>
                <span className={`mt-1 text-xs font-medium ${isActive ? 'text-primary' : 'text-gray-500'}`}>
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-white border-b border-gray-200">
        <div className="absolute inset-0 overflow-hidden opacity-10">
          <div className="absolute -top-20 -left-20 w-80 h-80 bg-primary/10 rounded-full"></div>
          <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-green-500/10 rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/5 rounded-full"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-10">
          <div className="max-w-4xl mx-auto px-2 sm:px-0">
            <form onSubmit={handleSearch} className="relative">
              <div className="relative bg-white/95 backdrop-blur-sm border-gray-300 rounded-2xl sm:rounded-3xl border-2 shadow-2xl p-2 sm:p-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-0">
                <div className="flex-1 flex items-center min-w-0">
                  <Search className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0 text-gray-500 ml-3 sm:ml-5 mr-2 sm:mr-4" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearchInput(e.target.value)}
                    onFocus={() => searchQuery.length > 1 && setShowSuggestions(true)}
                    placeholder="Search for services or providers..."
                    className="flex-1 min-w-0 py-3 sm:py-4 md:py-5 text-sm sm:text-base md:text-lg border-0 focus:outline-none focus:ring-0 bg-transparent text-gray-900 placeholder-gray-500"
                    aria-label="Search for services"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="p-2 mr-2 hover:bg-gray-100 rounded-full transition-colors"
                      aria-label="Clear search"
                    >
                      <X className="h-5 w-5 text-gray-400" />
                    </button>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={searchLoading}
                  className={`w-full sm:w-auto sm:ml-2 px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 bg-gradient-to-r from-primary to-green-600 text-white rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base md:text-lg transition-all duration-300 ${searchLoading ? 'opacity-70 cursor-not-allowed' : 'hover:from-green-700 hover:to-primary hover:shadow-lg'}`}
                  aria-label="Search services"
                >
                  {searchLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="h-4 w-4 sm:h-5 sm:w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Searching...
                    </div>
                  ) : 'Search'}
                </button>
              </div>
              
              {/* Search Suggestions Dropdown */}
              {showSuggestions && searchSuggestions.length > 0 && (
                <div className="absolute z-[100] w-full mt-2 bg-white border-gray-200 border-2 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
                  <div className="py-2">
                    {searchSuggestions.map((suggestion, index) => (
                      <button
                        key={`${suggestion.suggestion}-${index}`}
                        type="button"
                        onClick={() => {
                          setSearchQuery(suggestion.suggestion)
                          performSearch(suggestion.suggestion)
                          setShowSuggestions(false)
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-gray-100 flex items-center text-gray-800 transition-colors"
                      >
                        <Search className="h-4 w-4 mr-3 text-gray-400" />
                        <div>
                          <div className="font-medium">{suggestion.suggestion}</div>
                          <div className="text-xs text-gray-500 capitalize">{suggestion.type}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </form>
            
            {/* POPULAR SERVICES - USING LUCIDE ICONS */}
            <div className="mt-6 sm:mt-8">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-500">Popular Services:</span>
              </div>
              
              {/* DESKTOP: ICON GRID */}
              <div className="hidden lg:block">
                <div className="grid grid-cols-5 gap-3">
                  {popularServices.map((service) => {
                    const Icon = service.icon
                    return (
                      <button
                        key={service.name}
                        onClick={() => {
                          setSearchQuery(service.name)
                          performSearch(service.name)
                        }}
                        className="flex flex-col items-center p-3 rounded-xl bg-white border border-gray-200 hover:border-primary hover:shadow-md transition-all duration-300"
                      >
                        <div className={`p-2 rounded-full ${service.color} mb-2`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <span className="text-xs font-medium text-gray-700 text-center">{service.name}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
              
              {/* MOBILE: ICON GRID */}
              <div className="lg:hidden">
                <div className="grid grid-cols-5 gap-2">
                  {popularServices.map((service) => {
                    const Icon = service.icon
                    return (
                      <button
                        key={service.name}
                        onClick={() => {
                          setSearchQuery(service.name)
                          performSearch(service.name)
                        }}
                        className="flex flex-col items-center p-2 rounded-lg bg-white border border-gray-200 hover:border-primary active:scale-95 transition-all duration-200"
                      >
                        <div className={`p-1.5 rounded-full ${service.color} mb-1`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="text-xs font-medium text-gray-700 text-center leading-tight">{service.name}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SEARCH RESULTS SECTION */}
      {showSearchResults && (
        <div className="py-8 bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                  Search Results for "{searchQuery}"
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  {searchResultsLoading ? 'Searching...' : `${searchResults.length} result${searchResults.length !== 1 ? 's' : ''} found`}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowSearchResults(false)
                  setSearchResults([])
                }}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                <X className="h-4 w-4" />
                Close results
              </button>
            </div>

            {searchResultsLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div 
                    key={`search-skeleton-${i}`}
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
            ) : searchResults.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
                {searchResults.map((provider) => (
                  <ProviderCard 
                    key={provider.id}
                    provider={provider}
                    gridView="basic"
                    isDarkMode={false}
                    userState={userLocation.state}
                    userLGA={userLocation.lga}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-900">
                  No Results Found
                </h3>
                <p className="mb-4 text-sm sm:text-base text-gray-600">
                  No confirmed providers found for "{searchQuery}". Try a different search term.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* INTERACTIVE MAP SECTION - SEPARATE FROM LOCATION SELECTOR */}
      <section className="py-10 sm:py-14 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 sm:mb-10">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
              Explore Service Providers Across Nigeria
            </h2>
            <p className="text-gray-600">
              Browse our nationwide network of verified professionals. Click on map markers to view provider details.
            </p>
          </div>
          
          {/* Homepage Map Component - Shows all providers across Nigeria */}
          {/* FIX: Pass userLocation prop to HomepageMap component */}
          <HomepageMap userLocation={userLocation} />
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <div className="w-6 h-6 rounded-full bg-green-500 border-2 border-white mr-2"></div>
                <span className="text-sm font-medium">Verified Provider</span>
              </div>
              <p className="text-xs text-gray-600">Professionals who have completed verification</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <div className="w-6 h-6 rounded-full bg-yellow-500 border-2 border-white mr-2"></div>
                <span className="text-sm font-medium">Unverified Provider</span>
              </div>
              <p className="text-xs text-gray-600">Providers awaiting verification</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-white mr-2"></div>
                <span className="text-sm font-medium">Major Cities</span>
              </div>
              <p className="text-xs text-gray-600">Key service hubs across Nigeria</p>
            </div>
          </div>
        </div>
      </section>

      {/* LOCATION DETECTION SECTION - FOR FILTERING PROVIDERS */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Mobile toggle button */}
          <div className="sm:hidden py-4">
            <button
              onClick={() => setShowLocationSection(!showLocationSection)}
              className="w-full flex items-center justify-between p-4 rounded-xl bg-gray-50 transition-all duration-300"
            >
              <div className="flex items-center">
                <div className="relative mr-3">
                  <MapPin className={`h-6 w-6 ${locationIconActive ? 'text-primary' : 'text-gray-500'} transition-colors duration-300`} />
                  {detectingLocation && (
                    <div className="absolute -inset-1">
                      <div className="absolute inset-0 border-2 border-primary/30 rounded-full animate-ping"></div>
                    </div>
                  )}
                </div>
                <div className="text-left">
                  <span className="font-medium block">Find Local Services</span>
                  <span className="text-sm text-gray-500">{currentLocationText}</span>
                </div>
              </div>
              <ChevronDown className={`h-5 w-5 transition-transform duration-300 ${showLocationSection ? 'rotate-180' : ''}`} />
            </button>
          </div>
          
          {/* Location section - This controls the provider filtering */}
          <div className={`${showLocationSection ? 'block' : 'hidden'} sm:block py-8 sm:py-10`}>
            <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-gray-50 to-blue-50 border border-blue-100 shadow-lg">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center mb-4">
                    <div className="relative mr-3">
                      <MapPin className={`h-6 w-6 ${locationIconActive ? 'text-primary animate-pulse' : 'text-primary'} transition-all duration-500`} />
                      {detectingLocation && (
                        <div className="absolute -inset-2">
                          <div className="absolute inset-0 border-2 border-primary/20 rounded-full animate-ping"></div>
                          <div className="absolute inset-1 border-2 border-primary/10 rounded-full animate-ping animation-delay-300"></div>
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        Find Services in Your Area
                      </h3>
                      <p className="text-sm mt-1 text-gray-600">
                        {userLocation.detected && userLocation.state 
                          ? `📍 Services near ${userLocation.lga ? userLocation.lga + ', ' : ''}${userLocation.state}`
                          : 'Set your location to find the closest professionals'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Current Location Display */}
                  <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <MapPin className="h-5 w-5 text-primary mr-2" />
                        <span className="font-medium text-gray-700">
                          Your Location:
                        </span>
                      </div>
                      <span className="font-bold text-sm sm:text-base text-gray-900">
                        {currentLocationText}
                      </span>
                    </div>
                    
                    {/* Location Accuracy Indicator */}
                    {userLocation.detected && userLocation.coordinates && (
                      <div className="mt-3 flex items-center text-xs text-green-600">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        <span>High accuracy location detected</span>
                      </div>
                    )}
                    
                    {/* Show detected State and LGA */}
                    {userLocation.state && (
                      <div className="mt-3 grid grid-cols-2 gap-3">
                        <div className="p-2 rounded-lg bg-gray-50">
                          <div className="text-xs text-gray-500">State</div>
                          <div className="font-medium">{userLocation.state}</div>
                        </div>
                        {userLocation.lga && (
                          <div className="p-2 rounded-lg bg-gray-50">
                            <div className="text-xs text-gray-500">LGA</div>
                            <div className="font-medium">{userLocation.lga}</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
                  {/* Auto-detect Button */}
                  <div className="relative">
                    <button
                      onClick={detectUserLocation}
                      disabled={detectingLocation}
                      className={`relative px-6 py-3 rounded-xl font-semibold flex items-center justify-center transition-all duration-300 overflow-hidden min-w-[160px] ${detectingLocation
                        ? 'bg-primary/90 cursor-wait shadow-lg'
                        : 'bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-primary shadow-lg hover:shadow-xl'
                      }`}
                    >
                      {detectingLocation && (
                        <div className="absolute inset-0">
                          <div className="absolute inset-0 bg-gradient-to-r from-primary via-blue-500 to-primary animate-gradient-x"></div>
                        </div>
                      )}
                      
                      <div className="relative flex items-center z-10">
                        {detectingLocation ? (
                          <>
                            <div className="relative mr-3">
                              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            </div>
                            <span className="text-white font-semibold">Detecting...</span>
                          </>
                        ) : (
                          <>
                            <div className="relative mr-3">
                              <Navigation className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-white font-semibold">Auto-detect</span>
                          </>
                        )}
                      </div>
                    </button>
                  </div>
                  
                  <div className="hidden sm:block text-sm text-gray-500 text-center">OR</div>
                  
                  {/* State/LGA Selection - For filtering providers */}
                  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <div className="relative flex-1">
                      <Compass className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
                      <select
                        value={selectedState}
                        onChange={(e) => {
                          setSelectedState(e.target.value)
                          setSelectedLGA('')
                          // Trigger provider filtering
                          setTimeout(() => updateFilteredProviders(), 100)
                        }}
                        className="pl-10 pr-4 py-3 rounded-xl border w-full appearance-none bg-white border-gray-300 text-gray-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        <option value="">Select State</option>
                        {states.map((state) => (
                          <option key={state.id} value={state.id}>
                            {state.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="relative flex-1">
                      <Map className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
                      <select
                        value={selectedLGA}
                        onChange={(e) => {
                          setSelectedLGA(e.target.value)
                          // Trigger provider filtering
                          setTimeout(() => updateFilteredProviders(), 100)
                        }}
                        disabled={!selectedState}
                        className={`pl-10 pr-4 py-3 rounded-xl border w-full appearance-none bg-white border-gray-300 text-gray-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${!selectedState ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <option value="">Select LGA</option>
                        {getLGAsForState(selectedState).map((lga) => (
                          <option key={lga.id} value={lga.id}>
                            {lga.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <button
                      onClick={handleLocationSelect}
                      disabled={!selectedState}
                      className={`px-6 py-3 rounded-xl font-semibold transition-all bg-gray-800 hover:bg-gray-900 text-white ${!selectedState ? 'opacity-50 cursor-not-allowed' : 'shadow-md hover:shadow-lg'}`}
                    >
                      Set Location
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Location-based provider count */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">
                      {selectedState || selectedLGA 
                        ? `Providers in ${selectedLGA ? lgas.find(l => l.id === selectedLGA)?.name + ', ' : ''}${states.find(s => s.id === selectedState)?.name || ''}`
                        : userLocation.state
                        ? `Providers near ${userLocation.lga ? userLocation.lga + ', ' : ''}${userLocation.state}`
                        : 'All available providers'
                      }
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">
                      {filteredProviders.length} provider{filteredProviders.length !== 1 ? 's' : ''}
                    </p>
                    <p className="text-xs text-gray-500">
                      {selectedState || selectedLGA || userLocation.state ? 'Filtered by location' : 'Showing all providers'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FEATURED PROVIDERS SECTION - FILTERED BY LOCATION SELECTION */}
      <section className="py-10 sm:py-14 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 sm:mb-10">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                Service Providers
              </h2>
              <p className="mt-2 text-sm sm:text-base text-gray-600 hidden lg:block">
                {filteredProviders.length} provider{filteredProviders.length !== 1 ? 's' : ''} available
                {selectedState || selectedLGA || userLocation.state ? ' in your area' : ''}
              </p>
              <p className="mt-2 text-sm sm:text-base text-gray-600 lg:hidden">
                Available providers{selectedState || selectedLGA || userLocation.state ? ' in your area' : ''}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full md:w-auto mt-4 sm:mt-5 md:mt-0">
              {/* View Toggle */}
              <div className={`inline-flex rounded-xl border border-gray-300 p-1 ${gridView === 'basic' ? 'mb-3 sm:mb-0' : ''}`}>
                <button
                  onClick={() => setGridView('basic')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-all ${gridView === 'basic'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Grid className="h-4 w-4 mr-2" />
                  Grid
                </button>
                <button
                  onClick={() => setGridView('detailed')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-all ${gridView === 'detailed'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <List className="h-4 w-4 mr-2" />
                  List
                </button>
              </div>
              
              <div className="lg:hidden h-4"></div>
              
              {/* Sorting Controls - These work with the location filtering */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin">
                {SORT_OPTIONS.map((option) => (
                  <button
                    key={option.key}
                    onClick={() => {
                      setSortBy(option.key)
                      // Update sorting immediately
                      updateFilteredProviders()
                    }}
                    className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${sortBy === option.key
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Providers Grid - Filtered by location selection */}
          {!onlineStatus ? (
            <div className="text-center py-12 sm:py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-6">
                <WifiOff className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold mb-3 text-gray-900">
                No Internet Connection
              </h3>
              <p className="mb-6 max-w-md mx-auto text-base text-gray-600">
                Please check your internet connection and try again.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 bg-primary text-white rounded-xl hover:bg-green-700 font-semibold text-base shadow-lg hover:shadow-xl transition-all"
              >
                <RefreshCw className="h-5 w-5 sm:h-6 sm:w-6 mr-3" />
                Retry Connection
              </button>
            </div>
          ) : (
            <div className={gridView === 'basic' 
              ? "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4 md:gap-6"
              : "grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6"
            }>
              {loadingProviders ? (
                Array.from({ length: gridView === 'basic' ? 10 : 4 }).map((_, i) => (
                  <div 
                    key={`skeleton-${i}`}
                    className="rounded-xl overflow-hidden animate-pulse bg-gray-200"
                  >
                    <div className="aspect-square bg-gray-300"></div>
                    <div className="p-3 sm:p-4">
                      <div className="h-4 bg-gray-300 rounded mb-3 w-3/4"></div>
                      <div className="h-3 bg-gray-300 rounded mb-3 w-1/2"></div>
                      <div className="h-10 bg-gray-300 rounded w-full"></div>
                    </div>
                  </div>
                ))
              ) : filteredProviders.length > 0 ? (
                filteredProviders.map((provider) => (
                  <div key={provider.id} onClick={(e) => handleProviderProfileClick(provider.id, e)} className="cursor-pointer">
                    <ProviderCard 
                      provider={provider}
                      gridView={gridView}
                      isDarkMode={false}
                      userState={userLocation.state}
                      userLGA={userLocation.lga}
                    />
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12 sm:py-16">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-6">
                    <Briefcase className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-semibold mb-3 text-gray-900">
                    No Providers Available
                  </h3>
                  <p className="mb-6 text-base text-gray-600">
                    {selectedState || selectedLGA 
                      ? `No confirmed providers in ${selectedLGA ? lgas.find(l => l.id === selectedLGA)?.name + ', ' : ''}${states.find(s => s.id === selectedState)?.name || ''}.`
                      : searchQuery
                      ? `No confirmed providers found for "${searchQuery}".`
                      : 'No service providers have confirmed their accounts yet.'}
                  </p>
                  {selectedState || selectedLGA ? (
                    <button
                      onClick={() => {
                        setSelectedState('')
                        setSelectedLGA('')
                        setUserLocation({
                          state: null,
                          lga: null,
                          coordinates: null,
                          detected: false
                        })
                        setCurrentLocationText('Location not set')
                        loadFeaturedProviders()
                      }}
                      className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 bg-primary text-white rounded-xl hover:bg-green-700 font-semibold text-base shadow-lg hover:shadow-xl transition-all"
                    >
                      <Filter className="h-5 w-5 sm:h-6 sm:w-6 mr-3" />
                      Clear Location Filter
                    </button>
                  ) : searchQuery ? (
                    <button
                      onClick={() => {
                        setSearchQuery('')
                        loadFeaturedProviders()
                      }}
                      className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 bg-primary text-white rounded-xl hover:bg-green-700 font-semibold text-base shadow-lg hover:shadow-xl transition-all"
                    >
                      <X className="h-5 w-5 sm:h-6 sm:w-6 mr-3" />
                      Clear Search
                    </button>
                  ) : (
                    <Link
                      href="/links/become-a-provider"
                      className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 bg-primary text-white rounded-xl hover:bg-green-700 font-semibold text-base shadow-lg hover:shadow-xl transition-all"
                    >
                      <Briefcase className="h-5 w-5 sm:h-6 sm:w-6 mr-3" />
                      Become First Provider
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}

          {filteredProviders.length > 0 && !showSearchResults && (
            <div className="text-center mt-8 sm:mt-10">
              <Link
                href="/links/marketplace"
                className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 border-2 border-primary text-primary hover:bg-green-50 rounded-xl font-semibold text-base transition-all hover:scale-105"
              >
                View All Providers
                <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6 ml-3" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Service Categories Section */}
      <section className="py-10 sm:py-14 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 text-gray-900">
              Browse by Category
            </h2>
            <p className="text-base text-gray-600">
              {serviceCategories.length}+ professional service categories
            </p>
          </div>

          {loadingCategories ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div 
                  key={`skeleton-category-${i}`} 
                  className="p-4 rounded-xl animate-pulse bg-gray-200"
                >
                  <div className="flex items-center">
                    <div className="p-2 rounded-lg bg-gray-300 mr-3">
                      <div className="h-4 w-4"></div>
                    </div>
                    <div className="flex-1">
                      <div className="h-3 bg-gray-300 rounded mb-2 w-3/4"></div>
                      <div className="h-2 bg-gray-300 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : serviceCategories.length > 0 ? (
            <>
              {/* Categories Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {serviceCategories.slice(0, categoriesVisible).map((category, index) => (
                  <Link
                    key={category.id}
                    href={`/links/marketplace?service=${encodeURIComponent(category.name)}`}
                    className={`group p-3 rounded-lg transition-all duration-300 hover:shadow-md ${category.color || 'text-gray-600 bg-gray-50'} border border-gray-200 hover:border-primary`}
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="p-2 rounded-lg bg-white/50 mb-2">
                        <div className={category.color?.split(' ')[0] || 'text-gray-600'}>
                          {getIconComponent(category.icon)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-xs mb-1 truncate text-gray-900">
                          {category.name}
                        </h3>
                        <p className="text-[10px] text-gray-600 truncate" title={category.description || ''}>
                          {category.description || 'Professional services'}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {serviceCategories.length > 6 && (
                <div className="text-center mt-8 sm:mt-10">
                  {categoriesVisible < serviceCategories.length ? (
                    <button
                      onClick={handleShowMoreCategories}
                      className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 border-2 border-primary text-primary hover:bg-green-50 rounded-xl font-semibold text-base transition-all hover:scale-105"
                    >
                      <ChevronDown className="h-5 w-5 sm:h-6 sm:w-6 mr-3" />
                      Show More Categories ({categoriesVisible}/{serviceCategories.length})
                    </button>
                  ) : (
                    <button
                      onClick={handleShowLessCategories}
                      className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 border-2 border-primary text-primary hover:bg-green-50 rounded-xl font-semibold text-base transition-all hover:scale-105"
                    >
                      <ChevronDown className="h-5 w-5 sm:h-6 sm:w-6 mr-3 rotate-180" />
                      Show Less Categories
                    </button>
                  )}
                  
                  <p className="mt-4 text-sm text-gray-600">
                    Showing {categoriesVisible} of {serviceCategories.length} categories
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 sm:py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-6">
                <Briefcase className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold mb-3 text-gray-900">
                No Categories Found
              </h3>
              <p className="mb-6 text-base text-gray-600">
                Service categories will appear here once added.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-primary via-green-600 to-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 sm:mb-8">
              Are You a Service Provider?
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-8 sm:mb-10 max-w-3xl mx-auto">
              Join Nigeria's fastest-growing service marketplace
            </p>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
              <Link
                href="/links/become-a-provider"
                className="inline-flex items-center justify-center px-8 sm:px-10 py-4 sm:py-5 bg-white text-primary rounded-2xl hover:bg-gray-100 font-bold text-lg sm:text-xl transition-all hover:scale-105 shadow-2xl"
              >
                <Briefcase className="h-6 w-6 sm:h-7 sm:w-7 mr-3" />
                Register as Provider
              </Link>
              <Link
                href="/links/marketplace"
                className="inline-flex items-center justify-center px-8 sm:px-10 py-4 sm:py-5 bg-transparent border-2 border-white text-white rounded-2xl hover:bg-white/10 font-bold text-lg sm:text-xl transition-all hover:scale-105"
              >
                Browse Marketplace
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* DESKTOP FOOTER */}
      <footer className="hidden lg:block bg-gray-50 text-gray-800 pt-12 sm:pt-16 pb-8 sm:pb-12">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
            {/* Brand Column */}
            <div className="col-span-2 lg:col-span-1">
              <div className="mb-6">
                <div className="relative h-12 w-40 mb-6">
                  <Image
                    src="/logo.png"
                    alt="Nimart Logo - Nigeria's #1 Service Marketplace"
                    fill
                    className="object-contain grayscale"
                    sizes="160px"
                  />
                </div>
                <p className="text-gray-600 text-sm mb-8 leading-relaxed">
                  Nigeria's premier service marketplace connecting customers with trusted professionals across all 36 states.
                </p>
              </div>
              
              <div className="space-y-4 mb-8">
                <a 
                  href="mailto:info@nimart.ng" 
                  className="flex items-center space-x-3 text-gray-700 hover:text-primary transition-colors group"
                >
                  <div className="p-2 bg-white rounded-lg group-hover:bg-primary/10 transition-colors">
                    <Mail className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="text-sm font-medium">info@nimart.ng</span>
                </a>
              </div>

              <div className="flex items-center space-x-4">
                <a
                  href="https://web.facebook.com/profile.php?id=61551209078955"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 hover:bg-primary flex items-center justify-center transition-all duration-300 hover:scale-110 group shadow-md"
                  aria-label="Follow Nimart on Facebook"
                >
                  <Facebook className="h-5 w-5 text-gray-600 dark:text-gray-400 group-hover:text-white font-bold" />
                </a>
                <a
                  href="https://www.instagram.com/nimartng/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 hover:bg-primary flex items-center justify-center transition-all duration-300 hover:scale-110 group shadow-md"
                  aria-label="Follow Nimart on Instagram"
                >
                  <Instagram className="h-5 w-5 text-gray-600 dark:text-gray-400 group-hover:text-white font-bold" />
                </a>
                <a
                  href="https://www.youtube.com/channel/UCqt-rVe6MZphQQuR76kbUaw"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 hover:bg-primary flex items-center justify-center transition-all duration-300 hover:scale-110 group shadow-md"
                  aria-label="Subscribe to Nimart on YouTube"
                >
                  <Youtube className="h-5 w-5 text-gray-600 dark:text-gray-400 group-hover:text-white font-bold" />
                </a>
                <a
                  href="https://x.com/nimartng"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 hover:bg-primary flex items-center justify-center transition-all duration-300 hover:scale-110 group shadow-md"
                  aria-label="Follow Nimart on Twitter/X"
                >
                  <Twitter className="h-5 w-5 text-gray-600 dark:text-gray-400 group-hover:text-white font-bold" />
                </a>
              </div>
            </div>

            {/* For Customers */}
            <div>
              <h3 className="text-lg font-bold mb-6 text-gray-900 dark:text-white pb-3 border-b border-gray-200 dark:border-gray-800">For Customers</h3>
              <ul className="space-y-4">
                <li>
                  <Link href="/links/marketplace" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors text-sm font-medium">
                    Browse Services
                  </Link>
                </li>
                <li>
                  <Link href="/links/how-it-works" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors text-sm font-medium">
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link href="/links/help-center" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors text-sm font-medium">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/links/contact" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors text-sm font-medium">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>

            {/* For Providers */}
            <div>
              <h3 className="text-lg font-bold mb-6 text-gray-900 dark:text-white pb-3 border-b border-gray-200 dark:border-gray-800">For Providers</h3>
              <ul className="space-y-4">
                <li>
                  <Link href="/links/become-a-provider" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors text-sm font-medium">
                    Become a Provider
                  </Link>
                </li>
                <li>
                  <Link href="/links/provider-benefits" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors text-sm font-medium">
                    Provider Benefits
                  </Link>
                </li>
                <li>
                  <Link href="/links/provider-support" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors text-sm font-medium">
                    Provider Support
                  </Link>
                </li>
                <li>
                  <Link href="/links/terms-conditions" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors text-sm font-medium">
                    Terms & Conditions
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div className="col-span-2 lg:col-span-1">
              <h3 className="text-lg font-bold mb-6 text-gray-900 dark:text-white pb-3 border-b border-gray-200 dark:border-gray-800">Legal</h3>
              <ul className="space-y-4">
                <li>
                  <Link href="/links/privacy-policy" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors text-sm font-medium">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/links/terms-of-service" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors text-sm font-medium">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/links/cookie-policy" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors text-sm font-medium">
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-300 dark:border-gray-800 mt-12 sm:mt-16 pt-8 sm:pt-10">
            <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
              <div className="text-center lg:text-left">
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  © {new Date().getFullYear()} Nimart Nigeria. All rights reserved.
                </p>
                <p className="text-gray-500 dark:text-gray-500 text-xs mt-2">
                  Nigeria's #1 Service Marketplace
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center lg:justify-end gap-4 sm:gap-6 text-sm text-gray-600 dark:text-gray-400">
                <Link href="/links/privacy-policy" className="hover:text-primary transition-colors font-medium">Privacy Policy</Link>
                <Link href="/links/terms-of-service" className="hover:text-primary transition-colors font-medium">Terms of Service</Link>
                <Link href="/links/cookie-policy" className="hover:text-primary transition-colors font-medium">Cookie Policy</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* COMPLETE MOBILE FOOTER WITH 2 COLUMNS */}
      <div className="lg:hidden bg-white border-t border-gray-200 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Logo and Description */}
          <div className="text-center mb-8">
            <div className="relative h-10 w-32 mx-auto mb-4">
              <Image
                src="/logo.png"
                alt="Nimart"
                fill
                className="object-contain grayscale"
              />
            </div>
            <p className="text-sm text-gray-600">
              Nigeria's premier service marketplace connecting customers with trusted professionals across all 36 states.
            </p>
          </div>

          {/* 2 Column Grid for Mobile Footer */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            {/* Column 1: For Customers */}
            <div>
              <h4 className="font-bold text-gray-900 mb-4 text-sm">For Customers</h4>
              <ul className="space-y-3">
                <li>
                  <Link href="/links/marketplace" className="text-xs text-gray-600 hover:text-primary">
                    Browse Services
                  </Link>
                </li>
                <li>
                  <Link href="/links/how-it-works" className="text-xs text-gray-600 hover:text-primary">
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link href="/links/help-center" className="text-xs text-gray-600 hover:text-primary">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/links/contact" className="text-xs text-gray-600 hover:text-primary">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 2: For Providers */}
            <div>
              <h4 className="font-bold text-gray-900 mb-4 text-sm">For Providers</h4>
              <ul className="space-y-3">
                <li>
                  <Link href="/links/become-a-provider" className="text-xs text-gray-600 hover:text-primary">
                    Become a Provider
                  </Link>
                </li>
                <li>
                  <Link href="/links/provider-benefits" className="text-xs text-gray-600 hover:text-primary">
                    Provider Benefits
                  </Link>
                </li>
                <li>
                  <Link href="/links/provider-support" className="text-xs text-gray-600 hover:text-primary">
                    Provider Support
                  </Link>
                </li>
                <li>
                  <Link href="/links/terms-conditions" className="text-xs text-gray-600 hover:text-primary">
                    Terms & Conditions
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Legal Links - Full width below */}
          <div className="mb-8">
            <h4 className="font-bold text-gray-900 mb-4 text-sm">Legal</h4>
            <div className="grid grid-cols-2 gap-4">
              <ul className="space-y-3">
                <li>
                  <Link href="/links/privacy-policy" className="text-xs text-gray-600 hover:text-primary">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/links/terms-of-service" className="text-xs text-gray-600 hover:text-primary">
                    Terms of Service
                  </Link>
                </li>
              </ul>
              <ul className="space-y-3">
                <li>
                  <Link href="/links/cookie-policy" className="text-xs text-gray-600 hover:text-primary">
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Social Icons and Contact */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-4 mb-4">
              <a
                href="https://web.facebook.com/profile.php?id=61551209078955"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-primary flex items-center justify-center transition-all duration-300 hover:scale-110 group"
                aria-label="Follow Nimart on Facebook"
              >
                <Facebook className="h-5 w-5 text-gray-600 group-hover:text-white" />
              </a>
              <a
                href="https://www.instagram.com/nimartng/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-primary flex items-center justify-center transition-all duration-300 hover:scale-110 group"
                aria-label="Follow Nimart on Instagram"
              >
                <Instagram className="h-5 w-5 text-gray-600 group-hover:text-white" />
              </a>
              <a
                href="https://www.youtube.com/channel/UCqt-rVe6MZphQQuR76kbUaw"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-primary flex items-center justify-center transition-all duration-300 hover:scale-110 group"
                aria-label="Subscribe to Nimart on YouTube"
              >
                <Youtube className="h-5 w-5 text-gray-600 group-hover:text-white" />
              </a>
              <a
                href="https://x.com/nimartng"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-primary flex items-center justify-center transition-all duration-300 hover:scale-110 group"
                aria-label="Follow Nimart on Twitter/X"
              >
                <Twitter className="h-5 w-5 text-gray-600 group-hover:text-white" />
              </a>
            </div>

            {/* Contact */}
            <a 
              href="mailto:info@nimart.ng" 
              className="flex items-center justify-center text-sm text-gray-600 hover:text-primary mb-4"
            >
              <Mail className="h-4 w-4 mr-2" />
              info@nimart.ng
            </a>
          </div>

          {/* Copyright and Legal Links */}
          <div className="pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center mb-4">
              © {new Date().getFullYear()} Nimart Nigeria. All rights reserved.
              <br />
              Nigeria's #1 Service Marketplace
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-500">
              <Link href="/links/privacy-policy" className="hover:text-primary">Privacy Policy</Link>
              <Link href="/links/terms-of-service" className="hover:text-primary">Terms of Service</Link>
              <Link href="/links/cookie-policy" className="hover:text-primary">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}