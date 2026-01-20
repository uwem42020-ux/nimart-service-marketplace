// app/links/marketplace/page.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import { 
  Search, Filter, MapPin, Star, Shield, CheckCircle, 
  Grid, List, ArrowRight, ChevronRight, ChevronDown,
  Car, Zap, Droplets, Hammer, Palette, Scissors,
  Sparkles, ChefHat, Briefcase, Users, Clock,
  Home as HomeIcon, Phone, Mail, Map
} from 'lucide-react'
import MarketplaceProviders from '@/components/MarketplaceProviders'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Service Marketplace | Find Verified Professionals in Nigeria | Nimart',
  description: 'Browse and find verified service providers in Nigeria. Mechanics, electricians, plumbers, carpenters, painters, tailors, cleaners, chefs & 50+ other services. All providers are verified.',
  keywords: 'service marketplace Nigeria, find service providers, verified professionals, mechanics near me, electricians Nigeria, plumbers Lagos, carpenters Abuja, painters Port Harcourt, tailors Ibadan, cleaners Kano, chefs Nigeria, hire professionals',
  openGraph: {
    type: 'website',
    url: 'https://nimart.ng/links/marketplace',
    title: 'Service Marketplace | Find Verified Professionals in Nigeria',
    description: 'Browse and find verified service providers in Nigeria. All providers are verified for your safety.',
    siteName: 'Nimart',
    locale: 'en_NG',
    images: [{
      url: 'https://nimart.ng/og-marketplace.png',
      width: 1200,
      height: 630,
      alt: 'Nimart Service Marketplace'
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Service Marketplace | Find Verified Professionals',
    description: 'Browse and find verified service providers in Nigeria',
    images: ['https://nimart.ng/og-marketplace.png'],
    site: '@nimartng',
    creator: '@nimartng',
  },
  alternates: {
    canonical: 'https://nimart.ng/links/marketplace',
  },
}

const serviceCategories = [
  { name: 'Mechanics', icon: Car, count: '250+', description: 'Auto repairs & maintenance' },
  { name: 'Electricians', icon: Zap, count: '180+', description: 'Electrical installations' },
  { name: 'Plumbers', icon: Droplets, count: '150+', description: 'Plumbing & pipe works' },
  { name: 'Carpenters', icon: Hammer, count: '120+', description: 'Woodwork & furniture' },
  { name: 'Painters', icon: Palette, count: '90+', description: 'Painting & decoration' },
  { name: 'Tailors', icon: Scissors, count: '200+', description: 'Fashion & clothing' },
  { name: 'Cleaners', icon: Sparkles, count: '160+', description: 'Home & office cleaning' },
  { name: 'Chefs', icon: ChefHat, count: '80+', description: 'Cooking & catering' },
  { name: 'Lawyers', icon: Briefcase, count: '60+', description: 'Legal services' },
  { name: 'Technicians', icon: Zap, count: '140+', description: 'Technical services' },
  { name: 'Drivers', icon: Car, count: '110+', description: 'Transportation services' },
  { name: 'Tutors', icon: Users, count: '70+', description: 'Education & tutoring' },
]

const states = [
  'Lagos', 'Abuja', 'Port Harcourt', 'Ibadan', 'Kano',
  'Benin City', 'Abeokuta', 'Onitsha', 'Enugu', 'Warri',
  'Calabar', 'Uyo', 'Jos', 'Kaduna', 'Maiduguri'
]

export default function MarketplacePage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Service Marketplace',
    description: 'Find and hire verified service providers in Nigeria across all 36 states',
    url: 'https://nimart.ng/links/marketplace',
    publisher: {
      '@type': 'Organization',
      name: 'Nimart',
      logo: 'https://nimart.ng/logo.png'
    },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: serviceCategories.map((cat, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Service',
          name: `${cat.name} Services`,
          description: cat.description,
          serviceType: cat.name,
          areaServed: 'Nigeria'
        }
      }))
    }
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://nimart.ng'
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Marketplace',
        item: 'https://nimart.ng/links/marketplace'
      }
    ]
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
              Find Verified Service Providers
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl mb-8 sm:mb-10 opacity-90">
              Browse {serviceCategories.reduce((sum, cat) => sum + parseInt(cat.count), 0)}+ verified professionals across Nigeria
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto bg-white rounded-xl sm:rounded-2xl p-2 shadow-2xl">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1 flex items-center px-4 py-3 sm:py-4">
                  <Search className="h-5 w-5 text-gray-400 mr-3" />
                  <input
                    type="text"
                    placeholder="Search for services or providers..."
                    className="flex-1 border-0 focus:outline-none focus:ring-0 text-gray-900 placeholder-gray-500 text-sm sm:text-base"
                  />
                </div>
                <div className="relative flex-1 flex items-center px-4 py-3 sm:py-4 border-t sm:border-t-0 sm:border-l border-gray-200">
                  <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                  <select className="flex-1 border-0 focus:outline-none focus:ring-0 text-gray-900 bg-transparent text-sm sm:text-base">
                    <option value="">All Nigeria</option>
                    {states.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
                <button className="bg-primary hover:bg-green-700 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-lg sm:rounded-xl transition-colors">
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold mb-2">Verified Professionals</h3>
              <p className="text-gray-600">All providers are thoroughly verified for your safety</p>
            </div>
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-4">
                <Star className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold mb-2">Customer Reviews</h3>
              <p className="text-gray-600">Read genuine reviews from previous customers</p>
            </div>
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 mb-4">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-bold mb-2">Quick Response</h3>
              <p className="text-gray-600">Most providers respond within 1 hour</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 sticky top-6">
              <h2 className="text-lg font-bold mb-6 flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Filters
              </h2>
              
              {/* Categories */}
              <div className="mb-8">
                <h3 className="font-bold mb-4 text-gray-900">Categories</h3>
                <div className="space-y-3">
                  {serviceCategories.map((category) => {
                    const Icon = category.icon
                    return (
                      <label key={category.name} className="flex items-center cursor-pointer">
                        <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
                        <div className="ml-3 flex items-center">
                          <div className="p-1.5 rounded-lg bg-gray-100 mr-2">
                            <Icon className="h-4 w-4 text-gray-600" />
                          </div>
                          <span className="text-gray-700">{category.name}</span>
                          <span className="ml-auto text-sm text-gray-500">{category.count}</span>
                        </div>
                      </label>
                    )
                  })}
                </div>
              </div>

              {/* States */}
              <div className="mb-8">
                <h3 className="font-bold mb-4 text-gray-900">States</h3>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                  {states.map(state => (
                    <label key={state} className="flex items-center cursor-pointer">
                      <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
                      <span className="ml-3 text-gray-700">{state}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Verification */}
              <div className="mb-6">
                <h3 className="font-bold mb-4 text-gray-900">Verification</h3>
                <div className="space-y-3">
                  <label className="flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded border-gray-300 text-primary focus:ring-primary" />
                    <span className="ml-3 flex items-center">
                      <Shield className="h-4 w-4 text-green-600 mr-2" />
                      Verified Only
                    </span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
                    <span className="ml-3 flex items-center">
                      <CheckCircle className="h-4 w-4 text-blue-600 mr-2" />
                      ID Verified
                    </span>
                  </label>
                </div>
              </div>

              <button className="w-full bg-primary hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors">
                Apply Filters
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:w-3/4">
            {/* Header */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Available Providers</h2>
                  <p className="text-gray-600 mt-1">Showing 1-20 of 250+ verified providers</p>
                </div>
                <div className="flex items-center gap-4 mt-4 sm:mt-0">
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <button className="p-2 rounded-md bg-white shadow-sm">
                      <Grid className="h-5 w-5" />
                    </button>
                    <button className="p-2 rounded-md">
                      <List className="h-5 w-5" />
                    </button>
                  </div>
                  <select className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-700">
                    <option>Sort by: Rating</option>
                    <option>Sort by: Experience</option>
                    <option>Sort by: Response Time</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Providers Grid */}
            <MarketplaceProviders />
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-primary to-blue-600 text-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Are You a Service Provider?
          </h2>
          <p className="text-lg sm:text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join Nigeria's fastest-growing service marketplace and reach thousands of customers
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/provider/register"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary rounded-xl hover:bg-gray-100 font-bold text-lg transition-all hover:scale-105 shadow-2xl"
            >
              <Briefcase className="h-6 w-6 mr-3" />
              Register as Provider
            </Link>
            <Link
              href="/how-it-works"
              className="inline-flex items-center justify-center px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl hover:bg-white/10 font-bold text-lg transition-all hover:scale-105"
            >
              Learn How It Works
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}