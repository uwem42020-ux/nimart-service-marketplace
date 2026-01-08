// app/page.tsx - SIMPLIFIED WITH WORKING ICONS
'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { 
  Search, MapPin, Star, Shield, CheckCircle, 
  ArrowRight, ChevronRight, ChevronDown,
  Briefcase, Car, Zap, Droplets,
  Palette, Scissors, ChefHat, Sparkles,
  Wrench,
  Grid, List,
  Mail, Phone, Facebook, Instagram, Youtube,
  Home as HomeIcon, Utensils, Cake, Store, Calendar, Mic, Flower,
  Camera, Video, Users, Bike, Truck, Package, Smartphone, Laptop,
  Code, PenTool, TrendingUp, Calculator, Scale, Building, Map,
  Book, GraduationCap, Award, Eye, AlertTriangle,
  Layers, Clock, Heart, User, Shirt, Baby, Square,
  Circle, Hammer
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
  states: { name: string }[] | null
  lgas: { name: string }[] | null
  years_experience: number | null
  is_verified: boolean | null
  created_at: string
  bio: string | null
  phone: string | null
}

interface ServiceCategory {
  id: string
  name: string
  icon: string | null
  description: string | null
  sort_order: number
  color?: string
  darkColor?: string
}

export default function Home() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [featuredProviders, setFeaturedProviders] = useState<FastProvider[]>([])
  const [loadingProviders, setLoadingProviders] = useState(true)
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [categoriesVisible, setCategoriesVisible] = useState(8)
  const [gridView, setGridView] = useState<'amazon' | 'detailed'>('amazon')
  const [isDarkMode, setIsDarkMode] = useState(false)

  // Simple icon mapping - only use icons that exist
  const getIconComponent = (iconName: string | null): React.ReactNode => {
    if (!iconName) return <Briefcase className="h-5 w-5" />
    
    // Map database icon names to available Lucide icons
    const iconMap: Record<string, React.ReactNode> = {
      'car': <Car className="h-5 w-5" />,
      'zap': <Zap className="h-5 w-5" />,
      'droplets': <Droplets className="h-5 w-5" />,
      'hammer': <Hammer className="h-5 w-5" />,
      'palette': <Palette className="h-5 w-5" />,
      'scissors': <Scissors className="h-5 w-5" />,
      'sparkles': <Sparkles className="h-5 w-5" />,
      'chef-hat': <ChefHat className="h-5 w-5" />,
      'home': <HomeIcon className="h-5 w-5" />,
      'shirt': <Shirt className="h-5 w-5" />,
      'baby': <Baby className="h-5 w-5" />,
      'user': <User className="h-5 w-5" />,
      'utensils': <Utensils className="h-5 w-5" />,
      'cake': <Cake className="h-5 w-5" />,
      'store': <Store className="h-5 w-5" />,
      'calendar': <Calendar className="h-5 w-5" />,
      'mic': <Mic className="h-5 w-5" />,
      'flower': <Flower className="h-5 w-5" />,
      'camera': <Camera className="h-5 w-5" />,
      'video': <Video className="h-5 w-5" />,
      'users': <Users className="h-5 w-5" />,
      'bike': <Bike className="h-5 w-5" />,
      'truck': <Truck className="h-5 w-5" />,
      'package': <Package className="h-5 w-5" />,
      'smartphone': <Smartphone className="h-5 w-5" />,
      'laptop': <Laptop className="h-5 w-5" />,
      'code': <Code className="h-5 w-5" />,
      'pen-tool': <PenTool className="h-5 w-5" />,
      'trending-up': <TrendingUp className="h-5 w-5" />,
      'calculator': <Calculator className="h-5 w-5" />,
      'scale': <Scale className="h-5 w-5" />,
      'building': <Building className="h-5 w-5" />,
      'map': <Map className="h-5 w-5" />,
      'book': <Book className="h-5 w-5" />,
      'graduation-cap': <GraduationCap className="h-5 w-5" />,
      'award': <Award className="h-5 w-5" />,
      'eye': <Eye className="h-5 w-5" />,
      'alert-triangle': <AlertTriangle className="h-5 w-5" />,
      'layers': <Layers className="h-5 w-5" />,
      'clock': <Clock className="h-5 w-5" />,
      'heart': <Heart className="h-5 w-5" />,
      'square': <Square className="h-5 w-5" />,
      'circle': <Circle className="h-5 w-5" />,
      'grid': <Grid className="h-5 w-5" />,
      'wrench': <Wrench className="h-5 w-5" />,
      
      // Fallbacks for icons that don't exist
      'steering-wheel': <Car className="h-5 w-5" />,
      'briefcase': <Briefcase className="h-5 w-5" />,
      'car-front': <Car className="h-5 w-5" />,
      'shield': <Shield className="h-5 w-5" />,
      'tree': <Sparkles className="h-5 w-5" />,
      'leaf': <Sparkles className="h-5 w-5" />,
      'fish': <Droplets className="h-5 w-5" />,
      'dress': <Shirt className="h-5 w-5" />,
      'brush': <PenTool className="h-5 w-5" />,
      'cut': <Scissors className="h-5 w-5" />,
      'tool': <Wrench className="h-5 w-5" />,
    }
    
    return iconMap[iconName] || <Briefcase className="h-5 w-5" />
  }

  // Color mapping
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
    ]
    return colors[index % colors.length]
  }

  // Check for dark mode
  useEffect(() => {
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    setIsDarkMode(darkModeMediaQuery.matches)
    
    const handleChange = (e: MediaQueryListEvent) => setIsDarkMode(e.matches)
    darkModeMediaQuery.addEventListener('change', handleChange)
    
    return () => darkModeMediaQuery.removeEventListener('change', handleChange)
  }, [])

  // Mock providers
  const getMockProviders = (): FastProvider[] => {
    const services = ['Mechanics', 'Electricians', 'Plumbers', 'Carpenters', 'Painters']
    const cities = ['Lagos', 'Abuja', 'Port Harcourt', 'Ibadan', 'Kano']
    
    return Array.from({ length: 10 }).map((_, i) => ({
      id: `mock-${i}`,
      business_name: `Mock Provider ${i + 1}`,
      service_type: services[i % services.length],
      rating: 4.0 + Math.random(),
      total_reviews: Math.floor(Math.random() * 50) + 10,
      profile_picture_url: null,
      state_id: null,
      lga_id: null,
      states: [{ name: cities[i % cities.length] }],
      lgas: [{ name: `${cities[i % cities.length]} LGA` }],
      years_experience: Math.floor(Math.random() * 10) + 1,
      is_verified: true,
      created_at: new Date().toISOString(),
      bio: `Professional ${services[i % services.length]} with ${Math.floor(Math.random() * 10) + 1} years of experience`,
      phone: `080${Math.floor(Math.random() * 100000000)}`
    }))
  }

  // Load categories
  const loadServiceCategories = async () => {
    try {
      setLoadingCategories(true)
      
      const { data, error } = await supabase
        .from('service_categories')
        .select('id, name, icon, description, sort_order')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })

      if (error) {
        console.error('Error loading categories:', error)
        setServiceCategories(getFallbackCategories())
      } else if (data && data.length > 0) {
        const categoriesWithColors = data.map((category, index) => {
          const colors = getCategoryColors(index)
          return {
            ...category,
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
    ]
    
    return fallbackCategories.map((cat, index) => {
      const colors = getCategoryColors(index)
      return {
        id: `fallback-${index}`,
        name: cat.name,
        icon: cat.icon,
        description: cat.description,
        sort_order: index + 1,
        ...colors
      }
    })
  }

  useEffect(() => {
    loadServiceCategories()
    loadFeaturedProviders()
  }, [])

  const loadFeaturedProviders = async () => {
    try {
      setLoadingProviders(true)
      
      const { data: providers, error } = await supabase
        .from('providers')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(15)

      if (error) {
        console.error('Load error:', error)
        setFeaturedProviders(getMockProviders())
        return
      }

      if (providers && providers.length > 0) {
        const typedProvidersPromises = providers.map(async (provider) => {
          let stateName = 'Location not set'
          let lgaName = ''
          
          if (provider.state_id) {
            const { data: stateData } = await supabase
              .from('states')
              .select('name')
              .eq('id', provider.state_id)
              .single()
            
            if (stateData) stateName = stateData.name
          }
          
          if (provider.lga_id) {
            const { data: lgaData } = await supabase
              .from('lgas')
              .select('name')
              .eq('id', provider.lga_id)
              .single()
            
            if (lgaData) lgaName = lgaData.name
          }
          
          return {
            id: provider.id,
            business_name: provider.business_name,
            service_type: provider.service_type,
            rating: provider.rating,
            total_reviews: provider.total_reviews,
            profile_picture_url: provider.profile_picture_url,
            state_id: provider.state_id,
            lga_id: provider.lga_id,
            states: stateName ? [{ name: stateName }] : null,
            lgas: lgaName ? [{ name: lgaName }] : null,
            years_experience: provider.years_experience,
            is_verified: provider.is_verified,
            created_at: provider.created_at,
            bio: provider.bio,
            phone: provider.phone
          } as FastProvider
        })
        
        const typedProviders = await Promise.all(typedProvidersPromises)
        setFeaturedProviders(typedProviders)
        
      } else {
        setFeaturedProviders(getMockProviders())
      }
      
    } catch (error) {
      console.error('Loading error:', error)
      setFeaturedProviders(getMockProviders())
    } finally {
      setLoadingProviders(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/marketplace?search=${encodeURIComponent(searchQuery)}`)
    }
  }

  const handleShowMoreCategories = () => {
    setCategoriesVisible(prev => Math.min(prev + 8, serviceCategories.length))
  }

  const handleShowLessCategories = () => {
    setCategoriesVisible(8)
  }

  // Amazon grid item
  const AmazonGridItem = ({ provider }: { provider: FastProvider }) => {
    return (
      <div className={`group rounded-lg overflow-hidden border ${isDarkMode ? 'border-gray-700 bg-gray-800 hover:border-primary' : 'border-gray-200 bg-white hover:border-primary'} transition-all duration-200 hover:shadow-lg`}>
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          {provider.profile_picture_url ? (
            <img
              src={provider.profile_picture_url}
              alt={provider.business_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className={`w-full h-full flex items-center justify-center ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className="text-3xl font-bold text-primary">
                {provider.business_name?.charAt(0) || 'P'}
              </div>
            </div>
          )}
        </div>
        
        <div className="p-3">
          <h3 className={`font-semibold text-sm line-clamp-1 mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {provider.business_name}
          </h3>
          
          <p className={`text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {provider.service_type}
          </p>
          
          <div className="flex items-center text-xs mb-2">
            <MapPin className={`h-3 w-3 mr-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} title={`${provider.states?.[0]?.name || ''}${provider.lgas?.[0]?.name ? `, ${provider.lgas[0].name}` : ''}`}>
              <span className="truncate">{provider.states?.[0]?.name || 'Location'}</span>
            </span>
          </div>
          
          <div className="flex items-center mb-3">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${i < Math.floor(provider.rating || 0) ? 'text-yellow-500 fill-yellow-500' : isDarkMode ? 'text-gray-700' : 'text-gray-300'}`}
                />
              ))}
            </div>
            <span className={`text-xs ml-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              ({provider.total_reviews || 0})
            </span>
          </div>
          
          <Link
            href={`/providers/${provider.id}`}
            className={`w-full block text-center py-1.5 rounded-md text-sm font-medium transition-colors ${
              isDarkMode 
                ? 'bg-primary hover:bg-green-700 text-white' 
                : 'bg-primary hover:bg-green-700 text-white'
            }`}
          >
            View
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen transition-colors duration-200 ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {/* Hero Section */}
      <div className={`relative overflow-hidden ${isDarkMode ? 'bg-gray-900' : 'bg-white'} border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 -left-40 w-[600px] h-[600px] bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-full animate-pulse-slow blur-3xl"></div>
          <div className="absolute bottom-0 -right-40 w-[600px] h-[600px] bg-gradient-to-bl from-green-500/10 via-primary/5 to-transparent rounded-full animate-pulse-slow blur-3xl animation-delay-1000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-24">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight">
              <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>Find Trusted </span>
              <span className="text-primary">Service Providers near you</span>
            </h1>
          </div>

          <div className="max-w-3xl mx-auto px-2 sm:px-0">
            <form onSubmit={handleSearch} className="relative">
              <div className={`relative ${isDarkMode ? 'bg-gray-800/80 backdrop-blur-sm border-gray-700' : 'bg-white/80 backdrop-blur-sm border-gray-300'} rounded-xl sm:rounded-2xl border shadow-2xl p-1.5 sm:p-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-0`}>
                <div className="flex-1 flex items-center min-w-0">
                  <Search className={`h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} ml-3 sm:ml-5 mr-2 sm:mr-4`} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="What service do you need?"
                    className={`flex-1 min-w-0 py-3 sm:py-4 text-base sm:text-lg border-0 focus:outline-none focus:ring-0 bg-transparent ${
                      isDarkMode 
                        ? 'text-white placeholder-gray-400' 
                        : 'text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full sm:w-auto sm:ml-2 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-primary to-green-600 text-white rounded-lg sm:rounded-xl hover:from-green-600 hover:to-primary font-bold text-base sm:text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Service Categories */}
      <section className={`py-12 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className={`text-2xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Browse by Category
            </h2>
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
              {serviceCategories.length} professional services available
            </p>
          </div>

          {loadingCategories ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div 
                  key={`skeleton-category-${i}`} 
                  className={`p-4 rounded-xl animate-pulse ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
                >
                  <div className="flex items-center">
                    <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'} mr-3`}>
                      <div className="h-5 w-5"></div>
                    </div>
                    <div className="flex-1">
                      <div className={`h-4 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'} rounded mb-2 w-3/4`}></div>
                      <div className={`h-3 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'} rounded w-1/2`}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : serviceCategories.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {serviceCategories.slice(0, categoriesVisible).map((category, index) => (
                  <Link
                    key={category.id}
                    href={`/marketplace?service=${encodeURIComponent(category.name)}`}
                    className={`group p-4 rounded-xl transition-all duration-300 hover:-translate-y-1 ${
                      isDarkMode 
                        ? `${category.darkColor} border border-gray-700 hover:border-primary/50` 
                        : `${category.color} border border-gray-200 hover:border-primary`
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-900/30' : 'bg-white/50'} mr-3`}>
                        <div className={isDarkMode ? category.darkColor?.split(' ')[0] : category.color?.split(' ')[0]}>
                          {getIconComponent(category.icon)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-semibold mb-1 truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {category.name}
                        </h3>
                        <p className={`text-xs truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} title={category.description || ''}>
                          {category.description || 'Professional services'}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {serviceCategories.length > 8 && (
                <div className="text-center mt-8">
                  {categoriesVisible < serviceCategories.length ? (
                    <button
                      onClick={handleShowMoreCategories}
                      className="inline-flex items-center px-6 py-3 border-2 border-primary text-primary hover:bg-green-50 dark:hover:bg-green-900/10 rounded-lg font-semibold transition-colors"
                    >
                      <ChevronDown className="h-5 w-5 mr-2" />
                      Show More Categories ({categoriesVisible}/{serviceCategories.length})
                    </button>
                  ) : (
                    <button
                      onClick={handleShowLessCategories}
                      className="inline-flex items-center px-6 py-3 border-2 border-primary text-primary hover:bg-green-50 dark:hover:bg-green-900/10 rounded-lg font-semibold transition-colors"
                    >
                      <ChevronDown className="h-5 w-5 mr-2 rotate-180" />
                      Show Less Categories
                    </button>
                  )}
                  
                  <p className={`mt-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Showing {categoriesVisible} of {serviceCategories.length} categories
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} mb-4`}>
                <Briefcase className={`h-8 w-8 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
              </div>
              <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                No Categories Found
              </h3>
              <p className={`mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Service categories will appear here once added.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Featured Providers */}
      <section className={`py-12 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <div>
              <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                Featured Providers
              </h2>
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                Top professionals available near you
              </p>
            </div>
            
            <div className="mt-4 md:mt-0">
              <div className={`inline-flex rounded-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-300'} p-1`}>
                <button
                  onClick={() => setGridView('amazon')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center ${
                    gridView === 'amazon'
                      ? 'bg-primary text-white'
                      : isDarkMode 
                        ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-800' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Grid className="h-4 w-4" />
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
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {gridView === 'amazon' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
              {loadingProviders ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <div 
                    key={`skeleton-amazon-${i}`}
                    className={`rounded-lg overflow-hidden animate-pulse ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}
                  >
                    <div className={`aspect-square ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
                    <div className="p-3">
                      <div className={`h-3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'} rounded mb-2 w-3/4`}></div>
                      <div className={`h-3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'} rounded mb-2 w-1/2`}></div>
                      <div className={`h-6 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'} rounded mb-2`}></div>
                      <div className={`h-8 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'} rounded w-full`}></div>
                    </div>
                  </div>
                ))
              ) : featuredProviders.length > 0 ? (
                featuredProviders.map((provider) => (
                  <AmazonGridItem key={provider.id} provider={provider} />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} mb-4`}>
                    <Briefcase className={`h-8 w-8 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                  </div>
                  <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    No Providers Found
                  </h3>
                  <p className={`mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    There are no service providers registered yet.
                  </p>
                  <Link
                    href="/provider/register"
                    className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-green-700 font-semibold"
                  >
                    <Briefcase className="h-5 w-5 mr-2" />
                    Become a Provider
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              {loadingProviders ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div 
                    key={`skeleton-detailed-${i}`} 
                    className={`rounded-xl overflow-hidden animate-pulse ${
                      isDarkMode ? 'bg-gray-800' : 'bg-white'
                    } ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} border`}
                  >
                    <div className="p-4 md:p-6">
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="md:w-1/3">
                          <div className={`aspect-square rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                        </div>
                        <div className="md:w-2/3 space-y-3">
                          <div className={`h-4 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} w-3/4`}></div>
                          <div className={`h-3 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} w-1/2`}></div>
                          <div className={`h-3 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} w-2/3`}></div>
                          <div className={`h-3 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} w-full`}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : featuredProviders.length > 0 ? (
                featuredProviders.map((provider) => (
                  <div 
                    key={provider.id}
                    className={`rounded-xl overflow-hidden border ${
                      isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="p-4 md:p-6">
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="md:w-1/3">
                          <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                            {provider.profile_picture_url ? (
                              <img
                                src={provider.profile_picture_url}
                                alt={provider.business_name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className={`w-full h-full flex items-center justify-center ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                                <div className="text-3xl font-bold text-primary">
                                  {provider.business_name?.charAt(0) || 'P'}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="md:w-2/3">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {provider.business_name}
                              </h3>
                              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                {provider.service_type}
                              </p>
                            </div>
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                              <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {provider.rating?.toFixed(1) || '0.0'}
                              </span>
                              <span className={`text-sm ml-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                ({provider.total_reviews || 0})
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center mb-3">
                            <MapPin className={`h-4 w-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mr-2`} />
                            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                              {provider.states?.[0]?.name || 'Location not set'}
                              {provider.lgas?.[0]?.name ? `, ${provider.lgas[0].name}` : ''}
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 mb-4">
                            {provider.years_experience && (
                              <span className={`px-2 py-1 rounded text-xs ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                                {provider.years_experience} years exp.
                              </span>
                            )}
                            {provider.is_verified && (
                              <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800">
                                <CheckCircle className="h-3 w-3 inline mr-1" />
                                Verified
                              </span>
                            )}
                          </div>
                          
                          {provider.bio && (
                            <p className={`text-sm mb-4 line-clamp-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {provider.bio}
                            </p>
                          )}
                          
                          <div className="flex space-x-3">
                            <Link
                              href={`/providers/${provider.id}`}
                              className={`flex-1 text-center py-2 rounded-lg font-medium transition-colors ${
                                isDarkMode 
                                  ? 'bg-primary hover:bg-green-700 text-white' 
                                  : 'bg-primary hover:bg-green-700 text-white'
                              }`}
                            >
                              View Profile
                            </Link>
                            <Link
                              href={`/bookings/new?provider=${provider.id}`}
                              className={`flex-1 text-center py-2 rounded-lg font-medium transition-colors ${
                                isDarkMode 
                                  ? 'border border-primary text-primary hover:bg-primary/10' 
                                  : 'border border-primary text-primary hover:bg-green-50'
                              }`}
                            >
                              Book Now
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} mb-4`}>
                    <Briefcase className={`h-8 w-8 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                  </div>
                  <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    No Providers Found
                  </h3>
                  <p className={`mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    There are no service providers registered yet.
                  </p>
                  <Link
                    href="/provider/register"
                    className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-green-700 font-semibold"
                  >
                    <Briefcase className="h-5 w-5 mr-2" />
                    Become a Provider
                  </Link>
                </div>
              )}
            </div>
          )}

          {featuredProviders.length > 0 && (
            <div className="text-center mt-8">
              <Link
                href="/marketplace"
                className="inline-flex items-center px-6 py-3 border-2 border-primary text-primary hover:bg-green-50 dark:hover:bg-green-900/10 rounded-lg font-semibold transition-colors"
              >
                View All Providers
                <ChevronRight className="h-5 w-5 ml-2" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className={`py-12 ${isDarkMode ? 'bg-gradient-to-br from-gray-900 to-primary/20' : 'bg-gradient-to-br from-primary to-green-600'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
              Are You a Service Provider?
            </h2>
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
              Join Nigeria's fastest-growing service marketplace with {serviceCategories.length} service categories
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/provider/register"
                className="inline-flex items-center justify-center px-6 py-3 bg-white text-primary rounded-lg hover:bg-gray-100 font-bold text-base transition-colors"
              >
                <Briefcase className="h-5 w-5 mr-2" />
                Register as Provider
              </Link>
              <Link
                href="/marketplace"
                className="inline-flex items-center justify-center px-6 py-3 bg-transparent border-2 border-white text-white rounded-lg hover:bg-white/10 font-bold text-base transition-colors"
              >
                Browse Marketplace
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 text-gray-800 pt-12 sm:pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 md:gap-12">
            <div className="col-span-2 md:col-span-1">
              <div className="relative h-12 w-32 mb-4 sm:mb-6">
                <Image
                  src="/logo.png"
                  alt="Nimart Logo"
                  fill
                  className="object-contain"
                  sizes="160px"
                />
              </div>
              <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                Nigeria's premier service marketplace connecting customers with trusted professionals.
              </p>
              
              <div className="space-y-3 mb-6">
                <a 
                  href="mailto:info@nimart.ng" 
                  className="flex items-center space-x-2 text-gray-700 hover:text-primary transition-colors group"
                >
                  <Mail className="h-4 w-4 text-primary group-hover:scale-110 transition-transform flex-shrink-0" />
                  <span className="text-sm break-all">info@nimart.ng</span>
                </a>
                <a 
                  href="tel:+2348038887589" 
                  className="flex items-center space-x-2 text-gray-700 hover:text-primary transition-colors group"
                >
                  <Phone className="h-4 w-4 text-primary group-hover:scale-110 transition-transform flex-shrink-0" />
                  <span className="text-sm">+234 803 888 7589</span>
                </a>
              </div>

              <div className="flex items-center flex-wrap gap-2 sm:gap-3">
                <a
                  href="https://facebook.com/nimart"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white hover:bg-primary flex items-center justify-center transition-all duration-200 hover:scale-110 group shadow-sm"
                  aria-label="Facebook"
                >
                  <Facebook className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 group-hover:text-white" />
                </a>
                <a
                  href="https://instagram.com/nimart"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white hover:bg-primary flex items-center justify-center transition-all duration-200 hover:scale-110 group shadow-sm"
                  aria-label="Instagram"
                >
                  <Instagram className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 group-hover:text-white" />
                </a>
                <a
                  href="https://youtube.com/@nimart"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white hover:bg-primary flex items-center justify-center transition-all duration-200 hover:scale-110 group shadow-sm"
                  aria-label="YouTube"
                >
                  <Youtube className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 group-hover:text-white" />
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-bold mb-4 text-gray-900">For Customers</h3>
              <ul className="space-y-2.5">
                <li>
                  <Link href="/marketplace" className="text-gray-600 hover:text-primary transition-colors text-sm sm:text-base">
                    Browse Services
                  </Link>
                </li>
                <li>
                  <Link href="/how-it-works" className="text-gray-600 hover:text-primary transition-colors text-sm sm:text-base">
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link href="/help" className="text-gray-600 hover:text-primary transition-colors text-sm sm:text-base">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-600 hover:text-primary transition-colors text-sm sm:text-base">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-bold mb-4 text-gray-900">For Providers</h3>
              <ul className="space-y-2.5">
                <li>
                  <Link href="/provider/register" className="text-gray-600 hover:text-primary transition-colors text-sm sm:text-base">
                    Become a Provider
                  </Link>
                </li>
                <li>
                  <Link href="/provider/benefits" className="text-gray-600 hover:text-primary transition-colors text-sm sm:text-base">
                    Provider Benefits
                  </Link>
                </li>
                <li>
                  <Link href="/provider/support" className="text-gray-600 hover:text-primary transition-colors text-sm sm:text-base">
                    Provider Support
                  </Link>
                </li>
                <li>
                  <Link href="/provider/terms" className="text-gray-600 hover:text-primary transition-colors text-sm sm:text-base">
                    Terms & Conditions
                  </Link>
                </li>
              </ul>
            </div>

            <div className="col-span-2 md:col-span-1">
              <h3 className="text-base sm:text-lg font-bold mb-4 text-gray-900">Company</h3>
              <ul className="space-y-2.5">
                <li>
                  <Link href="/about" className="text-gray-600 hover:text-primary transition-colors text-sm sm:text-base">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/careers" className="text-gray-600 hover:text-primary transition-colors text-sm sm:text-base">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="text-gray-600 hover:text-primary transition-colors text-sm sm:text-base">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-gray-600 hover:text-primary transition-colors text-sm sm:text-base">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-300 mt-8 sm:mt-12 pt-6 sm:pt-8">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
              <p className="text-gray-600 text-sm text-center sm:text-left">
                © {new Date().getFullYear()} Nimart. All rights reserved.
              </p>
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
                <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
                <Link href="/cookies" className="hover:text-primary transition-colors">Cookies</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}