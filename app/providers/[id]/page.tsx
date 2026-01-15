// app/providers/[id]/page.tsx - COMPLETE FIXED VERSION WITH MOBILE
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { 
  Star, MapPin, Phone, Mail, Calendar, 
  Shield, CheckCircle, MessageSquare,
  ArrowLeft, Clock, Award, Users, TrendingUp,
  Eye, EyeOff, Lock, Verified
} from 'lucide-react'
import ReviewsList from '@/components/ReviewsList'
import { generateProviderSEO } from '@/lib/seo'

export default function ProviderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const providerId = params.id as string
  const [provider, setProvider] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews'>('overview')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showPhone, setShowPhone] = useState(false)
  const [showEmail, setShowEmail] = useState(false)
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [actionRequiringLogin, setActionRequiringLogin] = useState<'call' | 'message' | 'booking' | null>(null)

  useEffect(() => {
    if (providerId) {
      loadProvider()
      checkAuth()
    }
  }, [providerId])

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      setIsAuthenticated(!!session?.user)
    } catch (error) {
      setIsAuthenticated(false)
    }
  }

  const loadProvider = async () => {
    try {
      const { data, error } = await supabase
        .from('providers')
        .select(`
          *,
          states (name),
          reviews (
            id,
            rating,
            comment,
            customer_name,
            created_at
          )
        `)
        .eq('id', providerId)
        .single()

      if (error) throw error
      setProvider(data)
      console.log('✅ Provider loaded:', {
        id: data.id,
        business_name: data.business_name,
        user_id: data.user_id,
        email: data.email,
        email_confirmed_at: data.email_confirmed_at, // Check this for verification
        is_verified: data.is_verified
      })
    } catch (error) {
      console.error('Error loading provider:', error)
    } finally {
      setLoading(false)
    }
  }

  // Check if provider is verified (both email confirmed and manually verified)
  const isProviderVerified = () => {
    if (!provider) return false
    
    // Check both email confirmation and manual verification
    const emailConfirmed = !!provider.email_confirmed_at
    const manuallyVerified = provider.is_verified === true
    const verificationStatus = provider.verification_status === 'approved'
    
    return emailConfirmed || manuallyVerified || verificationStatus
  }

  const handleSendMessage = async () => {
    if (!isAuthenticated) {
      setActionRequiringLogin('message')
      setLoginModalOpen(true)
      return
    }

    try {
      if (!provider) {
        alert('Provider information not loaded')
        return
      }

      console.log('💬 Starting message to provider:', {
        businessName: provider.business_name,
        providerUserId: provider.user_id,
        businessId: provider.id,
        email: provider.email
      })

      // Check if provider has user_id
      if (!provider.user_id) {
        console.error('❌ Provider missing user_id:', provider)
        alert('This provider account is not properly set up for messaging. Please try another contact method.')
        return
      }

      // Get current user session
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        router.push('/login')
        return
      }

      // Check if trying to message yourself
      if (session.user.id === provider.user_id) {
        alert('You cannot message yourself.')
        return
      }

      // Save provider info to localStorage
      const providerInfo = {
        userId: provider.user_id,
        displayName: provider.business_name,
        userType: 'provider' as const,
        providerBusinessId: provider.id,
        email: provider.email
      }

      console.log('💾 Saving to localStorage:', providerInfo)
      localStorage.setItem('selectedProvider', JSON.stringify(providerInfo))

      // Navigate to messages page
      router.push('/messages')
      
    } catch (error) {
      console.error('❌ Error in handleSendMessage:', error)
      alert('Failed to start conversation. Please try again.')
    }
  }

  const handleCall = () => {
    if (!isAuthenticated) {
      setActionRequiringLogin('call')
      setLoginModalOpen(true)
      return
    }

    if (provider?.phone) {
      window.open(`tel:${provider.phone}`)
    } else {
      alert('Phone number not available for this provider')
    }
  }

  const handleBooking = () => {
    if (!isAuthenticated) {
      setActionRequiringLogin('booking')
      setLoginModalOpen(true)
      return
    }

    router.push(`/bookings/new?provider=${providerId}`)
  }

  const handleLoginSuccess = () => {
    setLoginModalOpen(false)
    checkAuth()
    
    if (actionRequiringLogin) {
      setTimeout(() => {
        switch (actionRequiringLogin) {
          case 'call':
            handleCall()
            break
          case 'message':
            handleSendMessage()
            break
          case 'booking':
            handleBooking()
            break
        }
      }, 500)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!provider) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Provider Not Found</h1>
          <Link href="/marketplace" className="text-primary hover:underline">
            Browse all providers
          </Link>
        </div>
      </div>
    )
  }

  const location = provider.states?.[0]?.name || 'Nigeria'
  const seoData = generateProviderSEO(provider) // Removed location parameter

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(seoData.structuredData)
        }}
      />

      {/* Login Modal */}
      {loginModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Lock className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Sign In Required
              </h3>
              <p className="text-gray-600">
                {actionRequiringLogin === 'call' && 'You need to sign in to view the phone number'}
                {actionRequiringLogin === 'message' && 'You need to sign in to send a message'}
                {actionRequiringLogin === 'booking' && 'You need to sign in to book a service'}
              </p>
            </div>
            
            <div className="space-y-3">
              <Link
                href={`/login?redirect=/providers/${providerId}`}
                onClick={() => setLoginModalOpen(false)}
                className="block w-full bg-gradient-to-r from-primary to-green-600 text-white py-3 rounded-lg hover:from-green-600 hover:to-primary font-medium text-center"
              >
                Sign In
              </Link>
              <Link
                href={`/register?redirect=/providers/${providerId}`}
                onClick={() => setLoginModalOpen(false)}
                className="block w-full border-2 border-primary text-primary py-3 rounded-lg hover:bg-green-50 font-medium text-center"
              >
                Create Account
              </Link>
              <button
                onClick={() => setLoginModalOpen(false)}
                className="block w-full py-3 text-gray-600 hover:text-gray-900 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-primary mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span className="text-sm md:text-base">Back</span>
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Left Column - Main Info */}
            <div className="lg:col-span-2">
              {/* Provider Header - Mobile Optimized */}
              <div className="bg-white rounded-xl shadow-sm border p-4 md:p-6 mb-6">
                <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                  {/* Profile Image - Mobile Optimized */}
                  <div className="flex-shrink-0 mx-auto md:mx-0">
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden border-4 border-white shadow-lg">
                      {provider.profile_picture_url ? (
                        <img
                          src={provider.profile_picture_url}
                          alt={provider.business_name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary to-green-600 flex items-center justify-center text-white text-3xl md:text-4xl font-bold">
                          {provider.business_name.charAt(0)}
                        </div>
                      )}
                    </div>
                    
                    {/* Verification Badge on Mobile */}
                    <div className="mt-3 md:hidden text-center">
                      {isProviderVerified() ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <Verified className="h-3 w-3 mr-1" />
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <Shield className="h-3 w-3 mr-1" />
                          Unverified
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Provider Info */}
                  <div className="flex-1">
                    <div className="mb-3 md:mb-4">
                      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                        {provider.business_name}
                      </h1>
                      
                      <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-3">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs md:text-sm font-medium bg-primary/10 text-primary">
                          {provider.service_type}
                        </span>
                        
                        {/* Verification Badge - Desktop */}
                        {isProviderVerified() && (
                          <span className="hidden md:inline-flex items-center px-3 py-1 rounded-full text-xs md:text-sm font-medium bg-green-100 text-green-800">
                            <Verified className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                            Verified Provider
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center text-gray-600 mb-2">
                        <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="text-sm md:text-base">{location}</span>
                      </div>
                    </div>

                    {/* Rating - Mobile Optimized */}
                    <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 md:h-5 md:w-5 text-yellow-500 fill-yellow-500" />
                        <span className="ml-1 md:ml-2 text-lg md:text-xl font-bold text-gray-900">
                          {provider.rating?.toFixed(1) || 'New'}
                        </span>
                        <span className="ml-1 text-xs md:text-sm text-gray-600">
                          ({provider.total_reviews || 0} reviews)
                        </span>
                      </div>
                    </div>

                    {/* Stats - Mobile Optimized */}
                    <div className="grid grid-cols-3 gap-3 md:gap-4 pt-3 md:pt-4 border-t">
                      <div className="text-center md:text-left">
                        <div className="text-xl md:text-2xl font-bold text-primary">{provider.years_experience || 0}</div>
                        <div className="text-xs md:text-sm text-gray-600">Years Exp</div>
                      </div>
                      <div className="text-center md:text-left">
                        <div className="text-xl md:text-2xl font-bold text-primary">{provider.total_reviews || 0}</div>
                        <div className="text-xs md:text-sm text-gray-600">Reviews</div>
                      </div>
                      <div className="text-center md:text-left">
                        <div className="text-xl md:text-2xl font-bold text-primary">
                          {provider.rating ? `${(provider.rating * 20).toFixed(0)}%` : 'New'}
                        </div>
                        <div className="text-xs md:text-sm text-gray-600">Rating</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs - Mobile Optimized */}
              <div className="bg-white rounded-xl shadow-sm border mb-6">
                <div className="border-b">
                  <div className="flex">
                    <button
                      onClick={() => setActiveTab('overview')}
                      className={`flex-1 px-4 py-3 md:px-6 md:py-4 font-medium text-sm md:text-base ${
                        activeTab === 'overview'
                          ? 'text-primary border-b-2 border-primary'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Overview
                    </button>
                    <button
                      onClick={() => setActiveTab('reviews')}
                      className={`flex-1 px-4 py-3 md:px-6 md:py-4 font-medium text-sm md:text-base ${
                        activeTab === 'reviews'
                          ? 'text-primary border-b-2 border-primary'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Reviews ({provider.total_reviews || 0})
                    </button>
                  </div>
                </div>

                <div className="p-4 md:p-6">
                  {activeTab === 'overview' ? (
                    <div>
                      {provider.bio && (
                        <div className="mb-4 md:mb-6">
                          <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2 md:mb-3">About</h3>
                          <p className="text-sm md:text-base text-gray-600 leading-relaxed">{provider.bio}</p>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                        <div className="flex items-center text-gray-600">
                          <Clock className="h-4 w-4 md:h-5 md:w-5 mr-2 md:mr-3 text-primary flex-shrink-0" />
                          <div>
                            <div className="text-sm md:text-base font-medium">Experience</div>
                            <div className="text-xs md:text-sm">{provider.years_experience || 0} years</div>
                          </div>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Award className="h-4 w-4 md:h-5 md:w-5 mr-2 md:mr-3 text-primary flex-shrink-0" />
                          <div>
                            <div className="text-sm md:text-base font-medium">Service Type</div>
                            <div className="text-xs md:text-sm">{provider.service_type}</div>
                          </div>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <MapPin className="h-4 w-4 md:h-5 md:w-5 mr-2 md:mr-3 text-primary flex-shrink-0" />
                          <div>
                            <div className="text-sm md:text-base font-medium">Location</div>
                            <div className="text-xs md:text-sm">{location}</div>
                          </div>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <CheckCircle className="h-4 w-4 md:h-5 md:w-5 mr-2 md:mr-3 text-primary flex-shrink-0" />
                          <div>
                            <div className="text-sm md:text-base font-medium">Status</div>
                            <div className="text-xs md:text-sm">
                              {isProviderVerified() ? 'Verified Provider' : 'Pending Verification'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <ReviewsList providerId={providerId} />
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Actions - Mobile Optimized */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border p-4 md:p-6 sticky top-4">
                <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">Contact & Booking</h3>
                
                <div className="space-y-2 md:space-y-3 mb-4 md:mb-6">
                  <button
                    onClick={handleCall}
                    className="flex items-center justify-center w-full px-3 md:px-4 py-2 md:py-3 bg-primary text-white rounded-lg hover:bg-green-700 font-medium transition-colors text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!provider.phone}
                  >
                    <Phone className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                    Call Now
                  </button>
                  
                  <button
                    onClick={handleSendMessage}
                    className="flex items-center justify-center w-full px-3 md:px-4 py-2 md:py-3 border-2 border-primary text-primary rounded-lg hover:bg-green-50 font-medium transition-colors text-sm md:text-base"
                  >
                    <MessageSquare className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                    Send Message
                  </button>

                  <button
                    onClick={handleBooking}
                    className="flex items-center justify-center w-full px-3 md:px-4 py-2 md:py-3 bg-gradient-to-r from-primary to-green-600 text-white rounded-lg hover:from-green-600 hover:to-primary font-medium transition-all shadow-md hover:shadow-lg text-sm md:text-base"
                  >
                    <Calendar className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                    Book Service
                  </button>
                </div>

                {/* Protected Contact Information */}
                <div className="pt-4 md:pt-6 border-t">
                  <h4 className="font-medium text-gray-900 mb-3 md:mb-4 text-sm md:text-base">Contact Information</h4>
                  
                  {/* Phone Number */}
                  <div className="mb-3 md:mb-4">
                    <div className="flex items-center justify-between text-gray-600 mb-1 md:mb-2">
                      <div className="flex items-center">
                        <Phone className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2 flex-shrink-0" />
                        <span className="font-medium text-xs md:text-sm">Phone:</span>
                      </div>
                      {isAuthenticated ? (
                        <div className="flex items-center">
                          {showPhone ? (
                            <>
                              <a href={`tel:${provider.phone}`} className="text-primary hover:underline text-xs md:text-sm">
                                {provider.phone || 'Not available'}
                              </a>
                              <button
                                onClick={() => setShowPhone(false)}
                                className="ml-1 md:ml-2 text-gray-500 hover:text-gray-700"
                                title="Hide phone number"
                              >
                                <EyeOff className="h-3 w-3 md:h-4 md:w-4" />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => setShowPhone(true)}
                              className="text-primary hover:text-green-700 flex items-center text-xs md:text-sm"
                            >
                              <Eye className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                              View Phone
                            </button>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setActionRequiringLogin('call')
                            setLoginModalOpen(true)
                          }}
                          className="text-primary hover:text-green-700 flex items-center text-xs md:text-sm"
                        >
                          <Lock className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                          Sign in to view
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Email */}
                  <div className="mb-3 md:mb-4">
                    <div className="flex items-center justify-between text-gray-600 mb-1 md:mb-2">
                      <div className="flex items-center">
                        <Mail className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2 flex-shrink-0" />
                        <span className="font-medium text-xs md:text-sm">Email:</span>
                      </div>
                      {isAuthenticated ? (
                        <div className="flex items-center">
                          {showEmail ? (
                            <>
                              <a href={`mailto:${provider.email}`} className="text-primary hover:underline break-all text-xs md:text-sm">
                                {provider.email || 'Not available'}
                              </a>
                              <button
                                onClick={() => setShowEmail(false)}
                                className="ml-1 md:ml-2 text-gray-500 hover:text-gray-700 flex-shrink-0"
                                title="Hide email"
                              >
                                <EyeOff className="h-3 w-3 md:h-4 md:w-4" />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => setShowEmail(true)}
                              className="text-primary hover:text-green-700 flex items-center text-xs md:text-sm"
                            >
                              <Eye className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                              View Email
                            </button>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setActionRequiringLogin('message')
                            setLoginModalOpen(true)
                          }}
                          className="text-primary hover:text-green-700 flex items-center text-xs md:text-sm"
                        >
                          <Lock className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                          Sign in to view
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Login Reminder */}
                  {!isAuthenticated && (
                    <div className="mt-3 md:mt-4 p-2 md:p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-xs md:text-sm text-yellow-800">
                        Sign in to view contact details and contact this provider
                      </p>
                      <Link
                        href={`/login?redirect=/providers/${providerId}`}
                        className="text-xs md:text-sm text-primary hover:text-green-700 font-medium mt-1 block"
                      >
                        Sign in now →
                      </Link>
                    </div>
                  )}
                </div>

                {/* Verification Status Info */}
                <div className="mt-4 md:mt-6 pt-3 md:pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-xs md:text-sm text-gray-600">Verification Status:</span>
                    <span className={`text-xs md:text-sm font-medium px-2 py-1 rounded-full ${
                      isProviderVerified() 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {isProviderVerified() ? 'Verified' : 'Unverified'}
                    </span>
                  </div>
                  {!isProviderVerified() && (
                    <p className="text-xs text-gray-500 mt-1">
                      This provider's email or identity hasn't been fully verified yet.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}