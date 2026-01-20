// app/providers/[id]/page.tsx - CORRECTED VERSION
'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { 
  Star, MapPin, Phone, Mail, Calendar, 
  Shield, CheckCircle, MessageSquare, User,
  ArrowLeft, Clock, Award, Users, TrendingUp,
  Eye, EyeOff, Lock, Verified, ChevronLeft,
  ChevronRight, Image as ImageIcon, Send,
  ThumbsUp, Edit, Camera, Share2, Bookmark,
  Heart, Filter, X, Loader2, AlertCircle
} from 'lucide-react'
import ReviewsList from '@/components/ReviewsList'
import { generateProviderSEO } from '@/lib/seo'

export default function ProviderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const providerId = params.id as string
  const [provider, setProvider] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'services'>('overview')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showPhone, setShowPhone] = useState(false)
  const [showEmail, setShowEmail] = useState(false)
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [actionRequiringLogin, setActionRequiringLogin] = useState<'call' | 'message' | 'booking' | null>(null)
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: ''
  })
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviewSuccess, setReviewSuccess] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [galleryImages, setGalleryImages] = useState<string[]>([])
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)
  const [stateName, setStateName] = useState<string>('')
  const [lgaName, setLgaName] = useState<string>('')

  const imageRef = useRef<HTMLDivElement>(null)

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
      
      if (session?.user) {
        // Load user profile for review submission
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single()
        setUserProfile(profile)
      }
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
          lgas (name),
          reviews (
            id,
            rating,
            comment,
            customer_name,
            service_type,
            created_at
          )
        `)
        .eq('id', providerId)
        .single()

      if (error) throw error
      
      setProvider(data)
      
      // Extract state and LGA names
      setStateName(data.states?.name || '')
      setLgaName(data.lgas?.name || '')
      
      // Simulate gallery images
      const images = []
      if (data.profile_picture_url) images.push(data.profile_picture_url)
      if (data.photo_url) images.push(data.photo_url)
      // Add placeholder gallery images
      for (let i = 0; i < 3; i++) {
        images.push(`https://images.unsplash.com/photo-${158000+i}?auto=format&fit=crop&w=800&q=80`)
      }
      setGalleryImages(images)
      
      console.log('✅ Provider loaded:', {
        id: data.id,
        business_name: data.business_name,
        state: data.states?.name,
        lga: data.lgas?.name
      })
    } catch (error) {
      console.error('Error loading provider:', error)
    } finally {
      setLoading(false)
    }
  }

  // Check if provider is verified
  const isProviderVerified = () => {
    if (!provider) return false
    
    return provider.is_verified === true && provider.verification_status === 'verified'
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

      // Check if provider has user_id
      if (!provider.user_id) {
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

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isAuthenticated) {
      alert('Please sign in to submit a review')
      router.push(`/login?redirect=/providers/${providerId}`)
      return
    }

    if (!newReview.comment.trim()) {
      alert('Please enter a review comment')
      return
    }

    setSubmittingReview(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.user) {
        throw new Error('Not authenticated')
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('user_id', session.user.id)
        .single()

      // Insert review
      const { error } = await supabase
        .from('reviews')
        .insert({
          provider_id: providerId,
          customer_id: session.user.id,
          customer_name: profile?.display_name || session.user.email?.split('@')[0] || 'Anonymous',
          rating: newReview.rating,
          comment: newReview.comment,
          service_type: provider.service_type,
          status: 'approved'
        })

      if (error) throw error

      // Update provider rating
      const { error: updateError } = await supabase.rpc('update_provider_rating', {
        provider_id_param: providerId
      })

      if (updateError) console.error('Rating update error:', updateError)

      // Show success
      setReviewSuccess(true)
      setNewReview({ rating: 5, comment: '' })
      
      // Reload provider data
      setTimeout(() => {
        loadProvider()
        setReviewSuccess(false)
      }, 2000)

    } catch (error) {
      console.error('Error submitting review:', error)
      alert('Failed to submit review. Please try again.')
    } finally {
      setSubmittingReview(false)
    }
  }

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite)
    // In production: Save to user's favorites in database
  }

  const shareProfile = () => {
    if (navigator.share) {
      navigator.share({
        title: `${provider.business_name} - Service Provider`,
        text: `Check out ${provider.business_name} on Nimart`,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  const getLocationDisplay = () => {
    if (stateName && lgaName) {
      return `${lgaName}, ${stateName}`
    } else if (stateName) {
      return stateName
    } else if (lgaName) {
      return lgaName
    } else {
      return 'Location not set'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading provider profile...</p>
        </div>
      </div>
    )
  }

  if (!provider) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center max-w-md p-8">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
            <User className="h-10 w-10 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Provider Not Found</h1>
          <p className="text-gray-600 mb-6">The provider you're looking for doesn't exist or has been removed.</p>
          <Link 
            href="/marketplace" 
            className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-xl hover:bg-green-700 font-medium transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Browse All Providers
          </Link>
        </div>
      </div>
    )
  }

  const seoData = generateProviderSEO(provider)

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
          <div className="bg-white rounded-2xl max-w-md w-full p-6 animate-scale-in">
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
                className="block w-full bg-gradient-to-r from-primary to-green-600 text-white py-3 rounded-xl hover:from-green-600 hover:to-primary font-medium text-center transition-all shadow-lg hover:shadow-xl"
              >
                Sign In
              </Link>
              <Link
                href={`/register?redirect=/providers/${providerId}`}
                onClick={() => setLoginModalOpen(false)}
                className="block w-full border-2 border-primary text-primary py-3 rounded-xl hover:bg-green-50 font-medium text-center transition-colors"
              >
                Create Account
              </Link>
              <button
                onClick={() => setLoginModalOpen(false)}
                className="block w-full py-3 text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Hero Header with Full-width Image on Mobile */}
        <div className="relative">
          {/* Background Image for Mobile (Full Width) */}
          <div className="lg:hidden relative h-64 w-full">
            {provider.profile_picture_url ? (
              <img
                src={provider.profile_picture_url}
                alt={provider.business_name}
                className="w-full h-full object-cover"
                loading="eager"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-green-600/20"></div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
            
            {/* Back Button */}
            <button
              onClick={() => router.back()}
              className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg"
            >
              <ChevronLeft className="h-5 w-5 text-gray-900" />
            </button>
            
            {/* Action Buttons */}
            <div className="absolute top-4 right-4 flex gap-2">
              <button
                onClick={shareProfile}
                className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg"
              >
                <Share2 className="h-5 w-5 text-gray-900" />
              </button>
              <button
                onClick={toggleFavorite}
                className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
                  isFavorite ? 'bg-red-500' : 'bg-white/90 backdrop-blur-sm'
                }`}
              >
                <Heart className={`h-5 w-5 ${isFavorite ? 'text-white' : 'text-gray-900'}`} fill={isFavorite ? 'currentColor' : 'none'} />
              </button>
            </div>
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:block bg-white border-b">
            <div className="max-w-7xl mx-auto px-8 py-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => router.back()}
                  className="flex items-center text-gray-600 hover:text-primary transition-colors"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  <span className="font-medium">Back to Search</span>
                </button>
                <div className="flex items-center gap-3">
                  <button
                    onClick={shareProfile}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-primary transition-colors"
                  >
                    <Share2 className="h-4 w-4" />
                    <span className="text-sm font-medium">Share</span>
                  </button>
                  <button
                    onClick={toggleFavorite}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      isFavorite 
                        ? 'bg-red-50 text-red-600' 
                        : 'text-gray-600 hover:text-primary'
                    }`}
                  >
                    <Heart className="h-4 w-4" fill={isFavorite ? 'currentColor' : 'none'} />
                    <span className="text-sm font-medium">
                      {isFavorite ? 'Saved' : 'Save'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Left Column - Main Info */}
            <div className="lg:col-span-2">
              {/* Provider Header - Modern Design */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8 mb-6">
                <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                  {/* Profile Image - Desktop */}
                  <div className="hidden md:block flex-shrink-0">
                    <div className="relative">
                      <div className="w-40 h-40 rounded-2xl overflow-hidden border-4 border-white shadow-2xl">
                        {provider.profile_picture_url ? (
                          <img
                            src={provider.profile_picture_url}
                            alt={provider.business_name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary to-green-600 flex items-center justify-center text-white text-4xl font-bold">
                            {provider.business_name.charAt(0)}
                          </div>
                        )}
                      </div>
                      
                      {/* Verification Badge */}
                      {isProviderVerified() && (
                        <div className="absolute -bottom-2 -right-2">
                          <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                            <Verified className="h-3 w-3" />
                            Verified
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Stats Summary */}
                    <div className="mt-6 grid grid-cols-2 gap-3">
                      <div className="text-center p-3 bg-gray-50 rounded-xl">
                        <div className="text-2xl font-bold text-primary">{provider.years_experience || 0}</div>
                        <div className="text-xs text-gray-600 font-medium">Years Exp</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-xl">
                        <div className="text-2xl font-bold text-primary">{provider.total_reviews || 0}</div>
                        <div className="text-xs text-gray-600 font-medium">Reviews</div>
                      </div>
                    </div>
                  </div>

                  {/* Provider Info */}
                  <div className="flex-1">
                    {/* Mobile Profile Info */}
                    <div className="md:hidden mb-6">
                      <div className="flex items-start gap-4">
                        <div className="relative">
                          <div className="w-20 h-20 rounded-xl overflow-hidden border-4 border-white shadow-lg">
                            {provider.profile_picture_url ? (
                              <img
                                src={provider.profile_picture_url}
                                alt={provider.business_name}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-primary to-green-600 flex items-center justify-center text-white text-2xl font-bold">
                                {provider.business_name.charAt(0)}
                              </div>
                            )}
                          </div>
                          {isProviderVerified() && (
                            <div className="absolute -bottom-1 -right-1">
                              <Verified className="h-5 w-5 text-green-500 bg-white rounded-full p-1" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h1 className="text-2xl font-bold text-gray-900 mb-1">
                            {provider.business_name}
                          </h1>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary">
                              {provider.service_type}
                            </span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                            <span className="text-sm">{getLocationDisplay()}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Desktop Provider Info */}
                    <div className="hidden md:block">
                      <div className="mb-4">
                        <h1 className="text-3xl font-bold text-gray-900 mb-3">
                          {provider.business_name}
                        </h1>
                        
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                          <span className="px-4 py-2 rounded-full text-sm font-medium bg-primary/10 text-primary">
                            {provider.service_type}
                          </span>
                          
                          {isProviderVerified() && (
                            <span className="px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800 flex items-center gap-2">
                              <Verified className="h-4 w-4" />
                              Verified Provider
                            </span>
                          )}
                          
                          {provider.is_online && (
                            <span className="px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800 flex items-center gap-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                              Online Now
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center text-gray-600 mb-6">
                          <MapPin className="h-5 w-5 mr-3 text-primary flex-shrink-0" />
                          <div>
                            <span className="text-lg font-medium">{getLocationDisplay()}</span>
                            {stateName && lgaName && (
                              <p className="text-sm text-gray-500 mt-1">
                                Serving {lgaName} and surrounding areas in {stateName}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Rating - Both Mobile & Desktop */}
                    <div className="mb-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center">
                          <div className="flex items-center mr-3">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-5 w-5 md:h-6 md:w-6 ${
                                  star <= Math.floor(provider.rating || 0)
                                    ? 'text-yellow-500 fill-yellow-500'
                                    : 'text-gray-300'
                                }`}
                                fill="currentColor"
                              />
                            ))}
                          </div>
                          <div>
                            <div className="text-2xl md:text-3xl font-bold text-gray-900">
                              {provider.rating?.toFixed(1) || 'New'}
                            </div>
                            <div className="text-sm text-gray-600">
                              ({provider.total_reviews || 0} reviews)
                            </div>
                          </div>
                        </div>
                        
                        <div className="h-8 w-px bg-gray-200"></div>
                        
                        <div className="text-center">
                          <div className="text-lg font-bold text-primary">
                            {provider.response_rate || 0}%
                          </div>
                          <div className="text-xs text-gray-600">Response Rate</div>
                        </div>
                      </div>
                    </div>

                    {/* Bio */}
                    {provider.bio && (
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">About</h3>
                        <p className="text-gray-600 leading-relaxed">
                          {provider.bio}
                        </p>
                      </div>
                    )}

                    {/* Gallery (Mobile Only) */}
                    {galleryImages.length > 0 && (
                      <div className="md:hidden mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Gallery</h3>
                        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
                          {galleryImages.map((img, index) => (
                            <div
                              key={index}
                              className="flex-shrink-0 w-32 h-32 rounded-xl overflow-hidden border-2 border-white shadow-md"
                            >
                              <img
                                src={img}
                                alt={`${provider.business_name} gallery ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Tabs - Modern Design */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-6 overflow-hidden">
                <div className="border-b border-gray-100">
                  <div className="flex overflow-x-auto scrollbar-hide">
                    <button
                      onClick={() => setActiveTab('overview')}
                      className={`flex-1 px-6 py-4 font-medium text-sm md:text-base whitespace-nowrap transition-all ${
                        activeTab === 'overview'
                          ? 'text-primary border-b-2 border-primary bg-primary/5'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <User className="h-4 w-4" />
                        Overview
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveTab('services')}
                      className={`flex-1 px-6 py-4 font-medium text-sm md:text-base whitespace-nowrap transition-all ${
                        activeTab === 'services'
                          ? 'text-primary border-b-2 border-primary bg-primary/5'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Award className="h-4 w-4" />
                        Services
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveTab('reviews')}
                      className={`flex-1 px-6 py-4 font-medium text-sm md:text-base whitespace-nowrap transition-all ${
                        activeTab === 'reviews'
                          ? 'text-primary border-b-2 border-primary bg-primary/5'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Star className="h-4 w-4" />
                        Reviews ({provider.total_reviews || 0})
                      </div>
                    </button>
                  </div>
                </div>

                <div className="p-6 md:p-8">
                  {activeTab === 'overview' ? (
                    <div>
                      {/* Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                          <div className="flex items-center mb-2">
                            <Clock className="h-5 w-5 text-primary mr-3" />
                            <div>
                              <div className="font-semibold text-gray-900">Experience</div>
                              <div className="text-sm text-gray-600">{provider.years_experience || 0} years in business</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                          <div className="flex items-center mb-2">
                            <TrendingUp className="h-5 w-5 text-primary mr-3" />
                            <div>
                              <div className="font-semibold text-gray-900">Response Time</div>
                              <div className="text-sm text-gray-600">{provider.response_time || 'Usually responds within 24 hours'}</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                          <div className="flex items-center mb-2">
                            <Users className="h-5 w-5 text-primary mr-3" />
                            <div>
                              <div className="font-semibold text-gray-900">Total Bookings</div>
                              <div className="text-sm text-gray-600">{provider.total_bookings || 0} completed bookings</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                          <div className="flex items-center mb-2">
                            <CheckCircle className="h-5 w-5 text-primary mr-3" />
                            <div>
                              <div className="font-semibold text-gray-900">Status</div>
                              <div className="text-sm text-gray-600">
                                {isProviderVerified() ? 'Verified and Active' : 'Pending Verification'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Location Details */}
                      <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Area</h3>
                        <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                          <div className="flex items-start">
                            <MapPin className="h-5 w-5 text-blue-600 mt-1 mr-3 flex-shrink-0" />
                            <div>
                              <div className="font-medium text-blue-900 mb-1">Primary Location</div>
                              <div className="text-gray-700">
                                {stateName && lgaName ? (
                                  <div>
                                    <div className="font-semibold">{lgaName}, {stateName}</div>
                                    {provider.city && (
                                      <div className="text-sm text-gray-600 mt-1">City: {provider.city}</div>
                                    )}
                                    {provider.address && (
                                      <div className="text-sm text-gray-600 mt-1">{provider.address}</div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="text-gray-600">Location information not provided</div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Gallery (Desktop) */}
                      {galleryImages.length > 0 && (
                        <div className="hidden md:block">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Gallery</h3>
                          <div className="grid grid-cols-3 gap-4">
                            {galleryImages.slice(0, 3).map((img, index) => (
                              <div
                                key={index}
                                className="aspect-square rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                                onClick={() => setSelectedImageIndex(index)}
                              >
                                <img
                                  src={img}
                                  alt={`${provider.business_name} gallery ${index + 1}`}
                                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : activeTab === 'services' ? (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Services Offered</h3>
                      <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                          <div className="font-medium text-gray-900 mb-2">Primary Service</div>
                          <div className="text-gray-600">{provider.service_type}</div>
                        </div>
                        
                        {provider.bio && (
                          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                            <div className="font-medium text-gray-900 mb-2">Service Description</div>
                            <div className="text-gray-600">{provider.bio}</div>
                          </div>
                        )}
                        
                        <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                          <div className="font-medium text-gray-900 mb-2">Booking Information</div>
                          <div className="text-gray-600">
                            Contact provider directly to discuss pricing and availability for your specific needs.
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {/* Review Submission Form */}
                      {isAuthenticated && (
                        <div className="mb-8">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Write a Review</h3>
                          <form onSubmit={handleSubmitReview} className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                            {reviewSuccess && (
                              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex items-center text-green-700">
                                  <CheckCircle className="h-5 w-5 mr-2" />
                                  <span className="font-medium">Review submitted successfully!</span>
                                </div>
                              </div>
                            )}
                            
                            <div className="mb-4">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Your Rating
                              </label>
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    type="button"
                                    onClick={() => setNewReview({...newReview, rating: star})}
                                    className="focus:outline-none"
                                  >
                                    <Star
                                      className={`h-8 w-8 ${
                                        star <= newReview.rating
                                          ? 'text-yellow-500 fill-yellow-500'
                                          : 'text-gray-300'
                                      } transition-colors`}
                                      fill="currentColor"
                                    />
                                  </button>
                                ))}
                              </div>
                            </div>
                            
                            <div className="mb-4">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Your Review *
                              </label>
                              <textarea
                                value={newReview.comment}
                                onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent min-h-[120px]"
                                placeholder="Share details of your experience with this provider..."
                                required
                              />
                              <div className="text-xs text-gray-500 mt-1">
                                Be specific about what you liked or didn't like
                              </div>
                            </div>
                            
                            <button
                              type="submit"
                              disabled={submittingReview || !newReview.comment.trim()}
                              className="w-full bg-primary text-white py-3 px-4 rounded-lg hover:bg-green-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                            >
                              {submittingReview ? (
                                <>
                                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                  Submitting...
                                </>
                              ) : (
                                <>
                                  <Send className="h-5 w-5 mr-2" />
                                  Submit Review
                                </>
                              )}
                            </button>
                          </form>
                        </div>
                      )}
                      
                      {/* Reviews List */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">Customer Reviews</h3>
                          <div className="text-sm text-gray-600">
                            {provider.total_reviews || 0} reviews
                          </div>
                        </div>
                        <ReviewsList providerId={providerId} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Actions & Contact */}
            <div className="lg:col-span-1">
              <div className="sticky top-4 space-y-6">
                {/* Contact Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact & Booking</h3>
                  
                  <div className="space-y-3 mb-6">
                    <button
                      onClick={handleBooking}
                      className="w-full px-4 py-4 bg-gradient-to-r from-primary to-green-600 text-white rounded-xl hover:from-green-600 hover:to-primary font-semibold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
                    >
                      <Calendar className="h-5 w-5" />
                      Book Service Now
                    </button>
                    
                    <button
                      onClick={handleSendMessage}
                      className="w-full px-4 py-4 border-2 border-primary text-primary rounded-xl hover:bg-green-50 font-semibold transition-colors flex items-center justify-center gap-3"
                    >
                      <MessageSquare className="h-5 w-5" />
                      Send Message
                    </button>

                    <button
                      onClick={handleCall}
                      disabled={!provider.phone}
                      className="w-full px-4 py-4 bg-gray-900 text-white rounded-xl hover:bg-gray-800 font-semibold transition-colors flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Phone className="h-5 w-5" />
                      Call Now
                    </button>
                  </div>

                  {/* Protected Contact Information */}
                  <div className="pt-6 border-t border-gray-100">
                    <h4 className="font-semibold text-gray-900 mb-4">Contact Information</h4>
                    
                    {/* Phone */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-gray-600 mb-2">
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="font-medium">Phone:</span>
                        </div>
                        {isAuthenticated ? (
                          <div className="flex items-center">
                            {showPhone ? (
                              <>
                                <a href={`tel:${provider.phone}`} className="text-primary hover:underline font-medium">
                                  {provider.phone || 'Not available'}
                                </a>
                                <button
                                  onClick={() => setShowPhone(false)}
                                  className="ml-2 text-gray-500 hover:text-gray-700"
                                  title="Hide phone number"
                                >
                                  <EyeOff className="h-4 w-4" />
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => setShowPhone(true)}
                                className="text-primary hover:text-green-700 flex items-center font-medium"
                              >
                                <Eye className="h-4 w-4 mr-1" />
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
                            className="text-primary hover:text-green-700 flex items-center font-medium"
                          >
                            <Lock className="h-4 w-4 mr-1" />
                            Sign in to view
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Email */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between text-gray-600 mb-2">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="font-medium">Email:</span>
                        </div>
                        {isAuthenticated ? (
                          <div className="flex items-center">
                            {showEmail ? (
                              <>
                                <a href={`mailto:${provider.email}`} className="text-primary hover:underline font-medium break-all">
                                  {provider.email || 'Not available'}
                                </a>
                                <button
                                  onClick={() => setShowEmail(false)}
                                  className="ml-2 text-gray-500 hover:text-gray-700 flex-shrink-0"
                                  title="Hide email"
                                >
                                  <EyeOff className="h-4 w-4" />
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => setShowEmail(true)}
                                className="text-primary hover:text-green-700 flex items-center font-medium"
                              >
                                <Eye className="h-4 w-4 mr-1" />
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
                            className="text-primary hover:text-green-700 flex items-center font-medium"
                          >
                            <Lock className="h-4 w-4 mr-1" />
                            Sign in to view
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Login Reminder */}
                    {!isAuthenticated && (
                      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                        <div className="flex items-start">
                          <AlertCircle className="h-5 w-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm text-yellow-800 font-medium">
                              Sign in to view contact details
                            </p>
                            <Link
                              href={`/login?redirect=/providers/${providerId}`}
                              className="text-sm text-primary hover:text-green-700 font-medium mt-1 inline-block"
                            >
                              Sign in now →
                            </Link>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Verification & Stats Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Provider Details</h4>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Verification Status</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        isProviderVerified() 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {isProviderVerified() ? '✓ Verified' : 'Pending'}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Response Rate</span>
                      <span className="font-semibold text-gray-900">
                        {provider.response_rate || 0}%
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Years Experience</span>
                      <span className="font-semibold text-gray-900">
                        {provider.years_experience || 0}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Total Bookings</span>
                      <span className="font-semibold text-gray-900">
                        {provider.total_bookings || 0}
                      </span>
                    </div>
                    
                    {stateName && (
                      <div className="pt-4 border-t border-gray-100">
                        <div className="text-sm text-gray-600 mb-2">Service Location</div>
                        <div className="flex items-center text-gray-900">
                          <MapPin className="h-4 w-4 mr-2 text-primary" />
                          <span className="font-medium">
                            {stateName}
                            {lgaName && `, ${lgaName}`}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Safety Tips */}
                <div className="bg-blue-50 rounded-2xl border border-blue-100 p-6">
                  <h4 className="font-semibold text-blue-900 mb-3">Safety Tips</h4>
                  <ul className="space-y-2 text-sm text-blue-800">
                    <li className="flex items-start">
                      <Shield className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                      Always verify provider's identity
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                      Discuss pricing and scope before booking
                    </li>
                    <li className="flex items-start">
                      <User className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                      Meet in public places for first meetings
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}