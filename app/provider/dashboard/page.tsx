// app/provider/dashboard/page.tsx - COMPLETE FIXED VERSION
'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  Shield, MapPin, Star, UserCheck, Calendar, 
  MessageSquare, DollarSign, TrendingUp,
  Users, Clock, CheckCircle, Package,
  Bell, BarChart, CreditCard, Upload,
  Camera, Image as ImageIcon, FileText,
  IdCard, FileCheck, AlertCircle, X,
  ArrowLeft, LogOut, Home, Settings,
  Loader2, Briefcase, Award, ThumbsUp, Eye,
  CloudUpload, Camera as CameraIcon, FileImage,
  User, FileUp, CheckCircle2, RefreshCw,
  ChevronLeft, ChevronRight
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type VerificationDocument = {
  file: File | null;
  status: 'not_uploaded' | 'pending' | 'approved' | 'rejected';
  url: string | null;
};

type VerificationDocuments = {
  id_document: VerificationDocument;
  passport_photo: VerificationDocument;
  utility_bill: VerificationDocument;
  live_photo: VerificationDocument;
};

type GalleryImage = {
  id: string;
  image_url: string;
  caption: string | null;
  is_primary: boolean;
};

export default function ProviderDashboard() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [providerData, setProviderData] = useState<any>(null)
  const [profileImage, setProfileImage] = useState<string>('')
  const [reviews, setReviews] = useState<any[]>([])
  const [recentBookings, setRecentBookings] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'dashboard' | 'gallery' | 'verification'>('dashboard')
  const [uploading, setUploading] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState<'demo' | 'pending' | 'verified'>('demo')
  const [verificationDocuments, setVerificationDocuments] = useState<VerificationDocuments>({
    id_document: { file: null, status: 'not_uploaded', url: null },
    passport_photo: { file: null, status: 'not_uploaded', url: null },
    utility_bill: { file: null, status: 'not_uploaded', url: null },
    live_photo: { file: null, status: 'not_uploaded', url: null }
  })
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([])
  const [uploadProgress, setUploadProgress] = useState(0)
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    averageRating: 0,
    totalReviews: 0,
    pendingBookings: 0,
    completedBookings: 0
  })

  const fileInputRefs = {
    id_document: useRef<HTMLInputElement>(null),
    passport_photo: useRef<HTMLInputElement>(null),
    utility_bill: useRef<HTMLInputElement>(null),
    live_photo: useRef<HTMLInputElement>(null),
    gallery: useRef<HTMLInputElement>(null)
  }

  const router = useRouter()

  useEffect(() => {
    console.log('🚀 Dashboard mounted')
    
    const checkAuth = async () => {
      try {
        console.log('🔍 Checking authentication...')
        
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Session error:', error)
          router.push('/login')
          return
        }
        
        if (!session) {
          console.log('❌ No session found, redirecting to login')
          router.push('/login')
          return
        }
        
        console.log('✅ Session found:', session.user.email)
        console.log('📋 User metadata:', session.user.user_metadata)
        
        // Check if user is a provider
        const userType = session.user.user_metadata?.user_type
        if (userType !== 'provider') {
          alert('Only providers can access this page')
          router.push('/')
          return
        }
        
        setUser(session.user)
        
        // Load provider data
        await loadProviderData(session.user)
        
      } catch (error) {
        console.error('Auth error:', error)
        router.push('/login')
      }
    }
    
    checkAuth()
  }, [router])

  async function loadProviderData(user: any) {
    try {
      console.log('📦 Loading provider data for:', user.email)
      
      // Try to get provider by user_id
      let { data, error } = await supabase
        .from('providers')
        .select('*')
        .eq('user_id', user.id)
        .single()
      
      // If not found, try by email
      if (error || !data) {
        console.log('Provider not found by user_id, trying email...')
        const { data: emailData, error: emailError } = await supabase
          .from('providers')
          .select('*')
          .eq('email', user.email)
          .single()
        
        if (emailError || !emailData) {
          console.error('Provider not found for user:', emailError)
          alert('Provider profile not found. Please complete your provider profile.')
          router.push('/provider/register')
          return
        }
        
        data = emailData
      }
      
      if (data) {
        console.log('✅ Provider data loaded:', data.business_name)
        setProviderData(data)
        
        // Set profile image
        if (data.profile_picture_url) {
          setProfileImage(data.profile_picture_url)
        } else {
          // Generate avatar from business name
          const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(data.business_name || user.email)}&background=008751&color=fff&size=256`
          setProfileImage(avatarUrl)
        }
        
        // Load verification status - FIXED LOGIC
        await checkVerificationStatus(data)
        
        // Load gallery images
        await loadGalleryImages(data.id)
        
        // Load reviews
        await loadReviews(data.id)
        
        // Load bookings
        await loadBookings(data.id)
        
        // Calculate stats
        calculateStats(data)
      }
      
    } catch (error) {
      console.error('Error loading provider profile:', error)
      // Create default avatar on error
      const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email)}&background=008751&color=fff&size=256`
      setProfileImage(avatarUrl)
    } finally {
      setLoading(false)
    }
  }

  async function checkVerificationStatus(provider: any) {
    try {
      // CRITICAL FIX: Check both fields for verification
      const isFullyVerified = provider.is_verified === true && 
        provider.verification_status === 'verified';
      
      const isPendingReview = provider.verification_status === 'pending';
      
      if (isFullyVerified) {
        setVerificationStatus('verified');
      } else if (isPendingReview) {
        setVerificationStatus('pending');
      } else {
        setVerificationStatus('demo');
      }
      
      // Load document status from database
      const { data: documents, error } = await supabase
        .from('provider_documents')
        .select('*')
        .eq('provider_id', provider.id)
      
      if (error) {
        console.log('No documents found yet:', error.message)
        return
      }
      
      // Update verification documents state
      if (documents && documents.length > 0) {
        const updatedDocuments = { ...verificationDocuments }
        
        documents.forEach((doc: any) => {
          const docType = doc.document_type as keyof VerificationDocuments
          updatedDocuments[docType] = {
            file: null,
            status: doc.status,
            url: doc.document_url
          }
        })
        
        setVerificationDocuments(updatedDocuments)
      }
      
    } catch (error) {
      console.error('Error checking verification status:', error)
    }
  }

  async function loadGalleryImages(providerId: string) {
    try {
      const { data: galleryData, error } = await supabase
        .from('provider_gallery')
        .select('*')
        .eq('provider_id', providerId)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false })
      
      if (error) {
        console.log('No gallery images yet:', error.message)
        return
      }
      
      if (galleryData) {
        setGalleryImages(galleryData)
      }
    } catch (error) {
      console.error('Error loading gallery:', error)
    }
  }

  async function loadReviews(providerId: string) {
    try {
      console.log('⭐ Loading reviews for provider:', providerId)
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('provider_id', providerId)
        .order('created_at', { ascending: false })
        .limit(5)
      
      if (!error && data) {
        console.log(`✅ Loaded ${data.length} reviews`)
        setReviews(data)
      }
    } catch (error) {
      console.error('Error loading reviews:', error)
    }
  }

  async function loadBookings(providerId: string) {
    try {
      console.log('📋 Loading bookings for provider:', providerId)
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('provider_id', providerId)
        .order('created_at', { ascending: false })
        .limit(5)
      
      if (!error && data) {
        console.log(`✅ Loaded ${data.length} recent bookings`)
        setRecentBookings(data)
        
        // Calculate booking stats
        const pendingBookings = data.filter(b => b.status === 'pending').length
        const completedBookings = data.filter(b => b.status === 'completed').length
        
        setStats(prev => ({
          ...prev,
          pendingBookings,
          completedBookings
        }))
      }
    } catch (error) {
      console.error('Error loading bookings:', error)
    }
  }

  function calculateStats(provider: any) {
    const totalBookings = provider.total_bookings || 0
    const totalRevenue = provider.total_earnings || 0
    const averageRating = provider.rating || 0
    const totalReviews = provider.total_reviews || 0
    
    setStats({
      totalBookings,
      totalRevenue,
      averageRating,
      totalReviews,
      pendingBookings: 0,
      completedBookings: 0
    })
    
    console.log('📊 Stats calculated:', {
      totalBookings,
      totalRevenue,
      averageRating,
      totalReviews
    })
  }

  const handleFileUpload = async (type: keyof VerificationDocuments, file: File) => {
    if (!file || !user || !providerData) return
    
    setUploading(true)
    setUploadProgress(0)
    
    try {
      // Validate file size (max 5MB)
      const MAX_SIZE = 5 * 1024 * 1024 // 5MB
      if (file.size > MAX_SIZE) {
        alert('File size too large. Maximum size is 5MB.')
        return
      }
      
      // Validate file type
      const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      const validPdfTypes = ['application/pdf']
      
      if (type === 'live_photo' || type === 'passport_photo') {
        if (!validImageTypes.includes(file.type)) {
          alert('Please upload a valid image (JPG, PNG, WebP)')
          return
        }
      } else {
        if (!validImageTypes.includes(file.type) && !validPdfTypes.includes(file.type)) {
          alert('Please upload a valid image (JPG, PNG, WebP) or PDF')
          return
        }
      }
      
      // Start upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)
      
      // 1. Upload to Supabase Storage - FIXED PATH
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}_${type}_${Date.now()}.${fileExt}`
      const filePath = `${user.id}/${fileName}`  // FIXED: removed "documents/" prefix
      
      const { data: storageData, error: uploadError } = await supabase.storage
        .from('provider-documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })
      
      if (uploadError) {
        clearInterval(progressInterval)
        throw new Error(`Upload failed: ${uploadError.message}`)
      }
      
      setUploadProgress(95)
      
      // 2. Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('provider-documents')
        .getPublicUrl(filePath)
      
      // 3. Save to database with pending status
      const { error: dbError } = await supabase
        .from('provider_documents')
        .upsert({
          provider_id: providerData.id,
          document_type: type,
          document_url: publicUrl,
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'provider_id,document_type'
        })
      
      if (dbError) {
        clearInterval(progressInterval)
        throw dbError
      }
      
      // 4. Update local state
      setVerificationDocuments(prev => ({
        ...prev,
        [type]: {
          file,
          status: 'pending',
          url: publicUrl
        }
      }))
      
      clearInterval(progressInterval)
      setUploadProgress(100)
      
      // 5. Check if all documents uploaded
      const updatedDocs = { ...verificationDocuments, [type]: { file, status: 'pending', url: publicUrl } }
      const allUploaded = Object.values(updatedDocs).every(doc => doc.status !== 'not_uploaded')
      
      if (allUploaded && verificationStatus === 'demo') {
        // Update provider status to pending
        await supabase
          .from('providers')
          .update({ 
            verification_status: 'pending',
            verification_submitted_at: new Date().toISOString()
          })
          .eq('id', providerData.id)
        
        setVerificationStatus('pending')
      }
      
      alert(`${type.replace('_', ' ').toUpperCase()} uploaded successfully! Status: Pending Review`)
      
    } catch (error: any) {
      console.error('Upload error:', error)
      alert(`Upload failed: ${error.message || 'Please try again'}`)
    } finally {
      setTimeout(() => {
        setUploading(false)
        setUploadProgress(0)
      }, 500)
    }
  }

  const handleGalleryUpload = async (files: FileList) => {
    if (!user || !providerData) return
    
    setUploading(true)
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        
        if (!file.type.startsWith('image/')) {
          alert(`${file.name} is not an image. Skipping.`)
          continue
        }
        
        // Upload to Supabase Storage
        const fileExt = file.name.split('.').pop()
        const fileName = `${user.id}_gallery_${Date.now()}_${i}.${fileExt}`
        const filePath = `${user.id}/${fileName}`
        
        const { data, error: uploadError } = await supabase.storage
          .from('provider-gallery')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          })
        
        if (uploadError) throw uploadError
        
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('provider-gallery')
          .getPublicUrl(filePath)
        
        // Save to database
        const { error: dbError } = await supabase
          .from('provider_gallery')
          .insert({
            provider_id: providerData.id,
            image_url: publicUrl,
            caption: '',
            is_primary: galleryImages.length === 0 && i === 0,
            sort_order: galleryImages.length + i
          })
        
        if (dbError) throw dbError
        
        // Add to local state
        setGalleryImages(prev => [...prev, {
          id: `temp_${Date.now()}_${i}`,
          image_url: publicUrl,
          caption: '',
          is_primary: prev.length === 0 && i === 0
        }])
      }
      
      alert(`${files.length} image(s) added to gallery!`)
      
    } catch (error: any) {
      console.error('Gallery upload error:', error)
      alert(`Gallery upload failed: ${error.message || 'Please try again'}`)
    } finally {
      setUploading(false)
    }
  }

  const removeGalleryImage = async (imageId: string, imageUrl: string) => {
    try {
      // Extract file path from URL
      const urlParts = imageUrl.split('/')
      const fileName = urlParts[urlParts.length - 1]
      const filePath = `${user?.id}/${fileName}`
      
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('provider-gallery')
        .remove([filePath])
      
      if (storageError) throw storageError
      
      // Delete from database if not temporary
      if (!imageId.startsWith('temp_')) {
        const { error: dbError } = await supabase
          .from('provider_gallery')
          .delete()
          .eq('id', imageId)
        
        if (dbError) throw dbError
      }
      
      // Update local state
      setGalleryImages(prev => prev.filter(img => img.id !== imageId))
      
      alert('Image removed from gallery!')
    } catch (error) {
      console.error('Error removing image:', error)
      alert('Failed to remove image. Please try again.')
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const renderVerificationStatus = () => {
    const statusConfig = {
      demo: {
        color: 'bg-yellow-100 text-yellow-800',
        icon: AlertCircle,
        title: 'Verification Required',
        description: 'Upload all 4 documents to get verified and start receiving more bookings'
      },
      pending: {
        color: 'bg-blue-100 text-blue-800',
        icon: Clock,
        title: 'Verification Pending Review',
        description: 'Your documents are under review by our team (24-48 hours)'
      },
      verified: {
        color: 'bg-green-100 text-green-800',
        icon: CheckCircle2,
        title: 'Fully Verified',
        description: 'Your account is fully verified by Nimart team'
      }
    }
    
    const config = statusConfig[verificationStatus]
    const Icon = config.icon
    
    return (
      <div className={`p-4 rounded-xl ${config.color} mb-6`}>
        <div className="flex items-start">
          <Icon className="h-6 w-6 mr-3 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-lg mb-1">{config.title}</h3>
            <p className="text-sm opacity-90">{config.description}</p>
            {verificationStatus === 'demo' && (
              <button
                onClick={() => setActiveTab('verification')}
                className="mt-3 px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm font-medium hover:bg-yellow-700"
              >
                Upload Documents Now →
              </button>
            )}
            {verificationStatus === 'pending' && (
              <div className="mt-3 text-sm text-blue-700 font-medium">
                ⏳ Your verification is being reviewed. You'll be notified once approved.
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Calculate uploaded document count
  const uploadedCount = Object.values(verificationDocuments).filter(
    doc => doc.status !== 'not_uploaded'
  ).length

  // Check if all documents are uploaded
  const allDocumentsUploaded = Object.values(verificationDocuments).every(
    doc => doc.status !== 'not_uploaded'
  )

  // Show loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-white/30 bg-white/20 flex items-center justify-center shadow-lg">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt={providerData?.business_name || user?.email}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-bold">
                      {providerData?.business_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  )}
                </div>
                {verificationStatus === 'verified' && (
                  <div className="absolute -bottom-1 -right-1">
                    <div className="bg-green-500 text-white rounded-full p-1">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold">Welcome back, {providerData?.business_name || user?.email?.split('@')[0]}!</h1>
                <p className="opacity-90 text-sm">{user?.email}</p>
                <div className="flex items-center mt-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    verificationStatus === 'verified' ? 'bg-green-500/30 text-green-200' : 
                    verificationStatus === 'pending' ? 'bg-yellow-500/30 text-yellow-200' : 
                    'bg-red-500/30 text-red-200'
                  }`}>
                    {verificationStatus === 'verified' ? '✅ Fully Verified' : 
                     verificationStatus === 'pending' ? '⏳ Verification Pending' : 
                     '❌ Verification Required'}
                  </span>
                  <span className="ml-2 px-3 py-1 bg-white/20 rounded-full text-xs">
                    <Star className="h-3 w-3 inline mr-1" />
                    {stats.averageRating.toFixed(1)} Rating
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-4 md:mt-0 flex items-center gap-3">
              <Link
                href="/"
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg flex items-center"
              >
                <Home className="h-4 w-4 mr-2" />
                Home
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg flex items-center"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* CRITICAL NOTICE FOR ALL USERS - RED BANNER */}
        {verificationStatus !== 'verified' && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-red-900 mb-1">⚠️ VERIFICATION REQUIRED</h3>
                <p className="text-red-700 text-sm">
                  {verificationStatus === 'demo' 
                    ? 'You must upload verification documents to get fully verified and appear as "Verified" to customers.'
                    : 'Your verification documents are under review. You will appear as "Verified" once approved by Nimart admin.'
                  }
                </p>
                <button
                  onClick={() => setActiveTab('verification')}
                  className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
                >
                  {verificationStatus === 'demo' ? 'Upload Documents Now' : 'Check Verification Status'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Navigation Tabs */}
        <div className="mb-8">
          <div className="flex border-b border-gray-200 overflow-x-auto">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-6 py-3 font-medium text-sm md:text-base whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'dashboard'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <BarChart className="h-4 w-4" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('gallery')}
              className={`px-6 py-3 font-medium text-sm md:text-base whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'gallery'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ImageIcon className="h-4 w-4" />
              Gallery
            </button>
            <button
              onClick={() => setActiveTab('verification')}
              className={`px-6 py-3 font-medium text-sm md:text-base whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'verification'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Shield className="h-4 w-4" />
              Verification {uploadedCount > 0 && `(${uploadedCount}/4)`}
            </button>
          </div>
        </div>

        {/* Dashboard Tab Content */}
        {activeTab === 'dashboard' && (
          <>
            {/* Verification Status Banner */}
            {renderVerificationStatus()}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-xl mr-4">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Total Bookings</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
                  </div>
                </div>
                <div className="mt-4 flex justify-between text-sm">
                  <span className="text-green-600">{stats.completedBookings} completed</span>
                  <span className="text-yellow-600">{stats.pendingBookings} pending</span>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-xl mr-4">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">₦{stats.totalRevenue.toLocaleString()}</p>
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-500 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
                  Total earnings
                </div>
              </div>
              
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-yellow-100 rounded-xl mr-4">
                    <Star className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Average Rating</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.averageRating.toFixed(1)}</p>
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-500 flex items-center">
                  <ThumbsUp className="h-4 w-4 mr-1 text-blue-500" />
                  {stats.totalReviews} reviews
                </div>
              </div>
              
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-xl mr-4">
                    <UserCheck className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Verification Status</p>
                    <p className="text-2xl font-bold text-gray-900 capitalize">
                      {verificationStatus === 'verified' ? '✅ Verified' : 
                       verificationStatus === 'pending' ? '⏳ Pending' : 
                       '❌ Required'}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  {verificationStatus !== 'verified' && (
                    <button 
                      onClick={() => setActiveTab('verification')}
                      className="text-sm text-primary hover:text-green-700 font-medium"
                    >
                      {verificationStatus === 'demo' ? 'Upload Documents →' : 'Check Status →'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-8">
                {/* Quick Links */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Link 
                      href="/provider/bookings"
                      className="flex flex-col items-center p-4 border-2 border-gray-100 rounded-xl hover:border-primary hover:bg-green-50 transition-all"
                    >
                      <div className="p-3 bg-primary/10 rounded-lg mb-3">
                        <Calendar className="h-6 w-6 text-primary" />
                      </div>
                      <span className="text-sm font-medium">Bookings</span>
                    </Link>
                    <Link 
                      href="/messages"
                      className="flex flex-col items-center p-4 border-2 border-gray-100 rounded-xl hover:border-primary hover:bg-green-50 transition-all"
                    >
                      <div className="p-3 bg-primary/10 rounded-lg mb-3">
                        <MessageSquare className="h-6 w-6 text-primary" />
                      </div>
                      <span className="text-sm font-medium">Messages</span>
                    </Link>
                    <button
                      onClick={() => setActiveTab('gallery')}
                      className="flex flex-col items-center p-4 border-2 border-gray-100 rounded-xl hover:border-primary hover:bg-green-50 transition-all"
                    >
                      <div className="p-3 bg-primary/10 rounded-lg mb-3">
                        <CameraIcon className="h-6 w-6 text-primary" />
                      </div>
                      <span className="text-sm font-medium">Gallery</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('verification')}
                      className="flex flex-col items-center p-4 border-2 border-gray-100 rounded-xl hover:border-primary hover:bg-green-50 transition-all"
                    >
                      <div className="p-3 bg-primary/10 rounded-lg mb-3">
                        <FileCheck className="h-6 w-6 text-primary" />
                      </div>
                      <span className="text-sm font-medium">Verification</span>
                    </button>
                  </div>
                </div>

                {/* Recent Reviews */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Recent Reviews</h3>
                    <Link 
                      href="/provider/reviews"
                      className="text-primary hover:text-green-700 text-sm font-medium flex items-center"
                    >
                      View All <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </div>
                  
                  {reviews.length > 0 ? (
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-semibold text-gray-900">{review.customer_name}</h4>
                              <div className="flex items-center mt-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${i < Math.floor(review.rating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                                  />
                                ))}
                                <span className="ml-2 text-sm text-gray-500">
                                  {new Date(review.created_at).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <p className="text-gray-600 text-sm">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No reviews yet</p>
                      <p className="text-sm text-gray-500 mt-2">Your reviews will appear here</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-8">
                {/* Provider Info */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Profile Summary</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center mb-2">
                        <Briefcase className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="font-medium text-gray-900">Business Info</span>
                      </div>
                      <div className="space-y-2 text-sm pl-6">
                        <p><span className="text-gray-600">Name:</span> {providerData?.business_name || 'Not set'}</p>
                        <p><span className="text-gray-600">Service:</span> {providerData?.service_type || 'Not set'}</p>
                        <p><span className="text-gray-600">Phone:</span> {providerData?.phone || 'Not set'}</p>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center mb-2">
                        <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="font-medium text-gray-900">Location</span>
                      </div>
                      <div className="space-y-2 text-sm pl-6">
                        <p><span className="text-gray-600">Address:</span> {providerData?.address || 'Not set'}</p>
                        <p><span className="text-gray-600">Experience:</span> {providerData?.years_experience || 0} years</p>
                        <p><span className="text-gray-600">Verification:</span> 
                          <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                            verificationStatus === 'verified' ? 'bg-green-100 text-green-800' : 
                            verificationStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'
                          }`}>
                            {verificationStatus === 'verified' ? '✅ Verified' : 
                             verificationStatus === 'pending' ? '⏳ Pending' : 
                             '❌ Required'}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <Link
                      href="/provider/profile"
                      className="w-full px-4 py-3 bg-primary text-white rounded-lg hover:bg-green-700 font-medium flex items-center justify-center"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Manage Profile
                    </Link>
                  </div>
                </div>

                {/* Recent Bookings */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Recent Bookings</h3>
                    <Link 
                      href="/provider/bookings"
                      className="text-primary hover:text-green-700 text-sm font-medium flex items-center"
                    >
                      View All <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </div>
                  
                  {recentBookings.length > 0 ? (
                    <div className="space-y-4">
                      {recentBookings.map((booking) => (
                        <div key={booking.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-semibold text-gray-900">{booking.customer_name}</h4>
                              <p className="text-sm text-gray-500">{booking.service_name}</p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${booking.status === 'completed' ? 'bg-green-100 text-green-800' : booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                              {booking.status}
                            </span>
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span>{new Date(booking.scheduled_date).toLocaleDateString()} at {booking.scheduled_time}</span>
                          </div>
                          <div className="text-sm font-medium text-gray-900 mt-1">
                            ₦{booking.service_price?.toLocaleString() || '0'}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No bookings yet</p>
                      <p className="text-sm text-gray-500 mt-2">Your bookings will appear here</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Gallery Tab Content */}
        {activeTab === 'gallery' && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Service Gallery</h3>
              <p className="text-gray-600">Upload photos of your work to showcase your services</p>
            </div>

            {/* Upload Area */}
            <div 
              className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center mb-8 hover:border-primary transition-colors cursor-pointer"
              onClick={() => fileInputRefs.gallery.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRefs.gallery}
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files && handleGalleryUpload(e.target.files)}
                disabled={uploading}
              />
              
              {uploading ? (
                <div className="mb-4">
                  <Loader2 className="h-16 w-16 text-primary animate-spin mx-auto" />
                  <p className="mt-4 text-gray-600">Uploading images...</p>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <CloudUpload className="h-16 w-16 text-gray-400 mx-auto" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Upload Photos</h4>
                  <p className="text-gray-600 mb-4">Click to browse or drag and drop your images here</p>
                  <p className="text-sm text-gray-500">JPG, PNG up to 5MB each</p>
                </>
              )}
            </div>

            {/* Gallery Grid */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Your Gallery ({galleryImages.length} photos)</h4>
              
              {galleryImages.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {galleryImages.map((img) => (
                    <div key={img.id} className="relative group">
                      <div className="aspect-square rounded-xl overflow-hidden border border-gray-200">
                        <img
                          src={img.image_url}
                          alt={img.caption || 'Gallery image'}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      {img.is_primary && (
                        <div className="absolute top-2 left-2">
                          <span className="px-2 py-1 bg-primary text-white text-xs rounded-full">
                            Primary
                          </span>
                        </div>
                      )}
                      <button
                        onClick={() => removeGalleryImage(img.id, img.image_url)}
                        className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <ImageIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No gallery images yet</p>
                  <p className="text-sm text-gray-500 mt-2">Upload photos to showcase your work</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Verification Tab Content */}
        {activeTab === 'verification' && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Complete Verification</h3>
              <p className="text-gray-600">Upload required documents to get fully verified and appear as "Verified" to customers</p>
              <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-4">
                <p className="text-sm text-blue-800">
                  <strong>⚠️ IMPORTANT:</strong> "Fully Verified" badge will only appear after admin approves your documents. 
                  This process takes 24-48 hours. You'll be notified once approved.
                </p>
              </div>
            </div>

            {/* Verification Status */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Verification Status</h4>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    verificationStatus === 'demo' ? 'bg-red-100 text-red-800' : 
                    verificationStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-green-100 text-green-800'
                  }`}>
                    {verificationStatus === 'demo' ? <AlertCircle className="h-6 w-6" /> : 
                     verificationStatus === 'pending' ? <Clock className="h-6 w-6" /> : 
                     <CheckCircle2 className="h-6 w-6" />}
                  </div>
                  <div>
                    <h5 className="font-bold text-lg">
                      {verificationStatus === 'demo' ? '❌ Verification Required' : 
                       verificationStatus === 'pending' ? '⏳ Verification Pending' : 
                       '✅ Fully Verified'}
                    </h5>
                    <p className="text-gray-600">
                      {verificationStatus === 'demo' && 'Upload all 4 documents to start verification'}
                      {verificationStatus === 'pending' && 'Documents under review (24-48 hours)'}
                      {verificationStatus === 'verified' && 'Your account is fully verified by Nimart admin'}
                    </p>
                    <div className="mt-2">
                      <div className="flex items-center">
                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${
                              verificationStatus === 'demo' ? 'bg-red-500' :
                              verificationStatus === 'pending' ? 'bg-yellow-500' :
                              'bg-green-500'
                            }`}
                            style={{ width: `${(uploadedCount / 4) * 100}%` }}
                          ></div>
                        </div>
                        <span className="ml-2 text-sm font-medium">
                          {uploadedCount}/4 documents uploaded
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                {verificationStatus !== 'verified' && (
                  <div className="text-right">
                    <p className="text-sm text-gray-600 mb-2">Benefits of verification:</p>
                    <div className="flex items-center text-sm text-green-600 mb-1">
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      <span>✅ "Verified" badge on profile</span>
                    </div>
                    <div className="flex items-center text-sm text-green-600">
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      <span>✅ Higher trust score & more bookings</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Upload Progress */}
            {uploading && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Uploading document...</span>
                  <span className="text-sm font-medium text-primary">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Required Documents */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Required Documents</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* ID Document */}
                <div className={`border-2 rounded-xl p-6 hover:border-primary transition-colors ${
                  verificationDocuments.id_document.status === 'approved' ? 'border-green-200 bg-green-50' :
                  verificationDocuments.id_document.status === 'pending' ? 'border-blue-200 bg-blue-50' :
                  verificationDocuments.id_document.status === 'rejected' ? 'border-red-200 bg-red-50' :
                  'border-gray-200'
                }`}>
                  <div className="flex items-start mb-4">
                    <div className={`p-3 rounded-lg mr-4 ${
                      verificationDocuments.id_document.status === 'approved' ? 'bg-green-100' :
                      verificationDocuments.id_document.status === 'pending' ? 'bg-blue-100' :
                      verificationDocuments.id_document.status === 'rejected' ? 'bg-red-100' :
                      'bg-gray-100'
                    }`}>
                      <IdCard className={`h-6 w-6 ${
                        verificationDocuments.id_document.status === 'approved' ? 'text-green-600' :
                        verificationDocuments.id_document.status === 'pending' ? 'text-blue-600' :
                        verificationDocuments.id_document.status === 'rejected' ? 'text-red-600' :
                        'text-gray-600'
                      }`} />
                    </div>
                    <div>
                      <h5 className="font-bold text-gray-900 mb-1">Identification Document</h5>
                      <p className="text-sm text-gray-600">NIN, Driver's License, Voter's Card, or BVN</p>
                      {verificationDocuments.id_document.status !== 'not_uploaded' && (
                        <span className={`mt-1 inline-block px-2 py-1 rounded text-xs font-medium ${
                          verificationDocuments.id_document.status === 'approved' ? 'bg-green-100 text-green-800' :
                          verificationDocuments.id_document.status === 'pending' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {verificationDocuments.id_document.status}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {verificationDocuments.id_document.status === 'not_uploaded' ? (
                    <div 
                      className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-primary"
                      onClick={() => fileInputRefs.id_document.current?.click()}
                    >
                      <input
                        type="file"
                        ref={fileInputRefs.id_document}
                        accept=".jpg,.jpeg,.png,.pdf"
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && handleFileUpload('id_document', e.target.files[0])}
                        disabled={uploading}
                      />
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Upload ID Document</p>
                      <p className="text-xs text-gray-500 mt-1">JPG, PNG, PDF up to 5MB</p>
                    </div>
                  ) : (
                    <div className={`rounded-lg p-3 ${
                      verificationDocuments.id_document.status === 'approved' ? 'bg-green-50 border border-green-200' :
                      verificationDocuments.id_document.status === 'pending' ? 'bg-blue-50 border border-blue-200' :
                      'bg-red-50 border border-red-200'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <FileText className={`h-5 w-5 mr-2 ${
                            verificationDocuments.id_document.status === 'approved' ? 'text-green-600' :
                            verificationDocuments.id_document.status === 'pending' ? 'text-blue-600' :
                            'text-red-600'
                          }`} />
                          <div>
                            <span className="text-sm font-medium">Document uploaded</span>
                            <p className="text-xs text-gray-500 mt-1">
                              Status: {verificationDocuments.id_document.status}
                            </p>
                          </div>
                        </div>
                        {verificationDocuments.id_document.url && (
                          <a
                            href={verificationDocuments.id_document.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-green-700 text-sm font-medium"
                          >
                            View
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Passport Photo */}
                <div className={`border-2 rounded-xl p-6 hover:border-primary transition-colors ${
                  verificationDocuments.passport_photo.status === 'approved' ? 'border-green-200 bg-green-50' :
                  verificationDocuments.passport_photo.status === 'pending' ? 'border-blue-200 bg-blue-50' :
                  verificationDocuments.passport_photo.status === 'rejected' ? 'border-red-200 bg-red-50' :
                  'border-gray-200'
                }`}>
                  <div className="flex items-start mb-4">
                    <div className={`p-3 rounded-lg mr-4 ${
                      verificationDocuments.passport_photo.status === 'approved' ? 'bg-green-100' :
                      verificationDocuments.passport_photo.status === 'pending' ? 'bg-blue-100' :
                      verificationDocuments.passport_photo.status === 'rejected' ? 'bg-red-100' :
                      'bg-gray-100'
                    }`}>
                      <User className={`h-6 w-6 ${
                        verificationDocuments.passport_photo.status === 'approved' ? 'text-green-600' :
                        verificationDocuments.passport_photo.status === 'pending' ? 'text-blue-600' :
                        verificationDocuments.passport_photo.status === 'rejected' ? 'text-red-600' :
                        'text-gray-600'
                      }`} />
                    </div>
                    <div>
                      <h5 className="font-bold text-gray-900 mb-1">Recent Passport Photo</h5>
                      <p className="text-sm text-gray-600">Clear recent passport photograph</p>
                      {verificationDocuments.passport_photo.status !== 'not_uploaded' && (
                        <span className={`mt-1 inline-block px-2 py-1 rounded text-xs font-medium ${
                          verificationDocuments.passport_photo.status === 'approved' ? 'bg-green-100 text-green-800' :
                          verificationDocuments.passport_photo.status === 'pending' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {verificationDocuments.passport_photo.status}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {verificationDocuments.passport_photo.status === 'not_uploaded' ? (
                    <div 
                      className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-primary"
                      onClick={() => fileInputRefs.passport_photo.current?.click()}
                    >
                      <input
                        type="file"
                        ref={fileInputRefs.passport_photo}
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && handleFileUpload('passport_photo', e.target.files[0])}
                        disabled={uploading}
                      />
                      <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Upload Passport Photo</p>
                      <p className="text-xs text-gray-500 mt-1">JPG, PNG up to 5MB</p>
                    </div>
                  ) : (
                    <div className={`rounded-lg p-3 ${
                      verificationDocuments.passport_photo.status === 'approved' ? 'bg-green-50 border border-green-200' :
                      verificationDocuments.passport_photo.status === 'pending' ? 'bg-blue-50 border border-blue-200' :
                      'bg-red-50 border border-red-200'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <ImageIcon className={`h-5 w-5 mr-2 ${
                            verificationDocuments.passport_photo.status === 'approved' ? 'text-green-600' :
                            verificationDocuments.passport_photo.status === 'pending' ? 'text-blue-600' :
                            'text-red-600'
                          }`} />
                          <div>
                            <span className="text-sm font-medium">Photo uploaded</span>
                            <p className="text-xs text-gray-500 mt-1">
                              Status: {verificationDocuments.passport_photo.status}
                            </p>
                          </div>
                        </div>
                        {verificationDocuments.passport_photo.url && (
                          <a
                            href={verificationDocuments.passport_photo.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-green-700 text-sm font-medium"
                          >
                            View
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Utility Bill */}
                <div className={`border-2 rounded-xl p-6 hover:border-primary transition-colors ${
                  verificationDocuments.utility_bill.status === 'approved' ? 'border-green-200 bg-green-50' :
                  verificationDocuments.utility_bill.status === 'pending' ? 'border-blue-200 bg-blue-50' :
                  verificationDocuments.utility_bill.status === 'rejected' ? 'border-red-200 bg-red-50' :
                  'border-gray-200'
                }`}>
                  <div className="flex items-start mb-4">
                    <div className={`p-3 rounded-lg mr-4 ${
                      verificationDocuments.utility_bill.status === 'approved' ? 'bg-green-100' :
                      verificationDocuments.utility_bill.status === 'pending' ? 'bg-blue-100' :
                      verificationDocuments.utility_bill.status === 'rejected' ? 'bg-red-100' :
                      'bg-gray-100'
                    }`}>
                      <FileText className={`h-6 w-6 ${
                        verificationDocuments.utility_bill.status === 'approved' ? 'text-green-600' :
                        verificationDocuments.utility_bill.status === 'pending' ? 'text-blue-600' :
                        verificationDocuments.utility_bill.status === 'rejected' ? 'text-red-600' :
                        'text-gray-600'
                      }`} />
                    </div>
                    <div>
                      <h5 className="font-bold text-gray-900 mb-1">Utility Bill</h5>
                      <p className="text-sm text-gray-600">Not older than 5 months (PHCN, Water, etc.)</p>
                      {verificationDocuments.utility_bill.status !== 'not_uploaded' && (
                        <span className={`mt-1 inline-block px-2 py-1 rounded text-xs font-medium ${
                          verificationDocuments.utility_bill.status === 'approved' ? 'bg-green-100 text-green-800' :
                          verificationDocuments.utility_bill.status === 'pending' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {verificationDocuments.utility_bill.status}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {verificationDocuments.utility_bill.status === 'not_uploaded' ? (
                    <div 
                      className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-primary"
                      onClick={() => fileInputRefs.utility_bill.current?.click()}
                    >
                      <input
                        type="file"
                        ref={fileInputRefs.utility_bill}
                        accept=".jpg,.jpeg,.png,.pdf"
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && handleFileUpload('utility_bill', e.target.files[0])}
                        disabled={uploading}
                      />
                      <FileUp className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Upload Utility Bill</p>
                      <p className="text-xs text-gray-500 mt-1">JPG, PNG, PDF up to 5MB</p>
                    </div>
                  ) : (
                    <div className={`rounded-lg p-3 ${
                      verificationDocuments.utility_bill.status === 'approved' ? 'bg-green-50 border border-green-200' :
                      verificationDocuments.utility_bill.status === 'pending' ? 'bg-blue-50 border border-blue-200' :
                      'bg-red-50 border border-red-200'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <FileText className={`h-5 w-5 mr-2 ${
                            verificationDocuments.utility_bill.status === 'approved' ? 'text-green-600' :
                            verificationDocuments.utility_bill.status === 'pending' ? 'text-blue-600' :
                            'text-red-600'
                          }`} />
                          <div>
                            <span className="text-sm font-medium">Utility bill uploaded</span>
                            <p className="text-xs text-gray-500 mt-1">
                              Status: {verificationDocuments.utility_bill.status}
                            </p>
                          </div>
                        </div>
                        {verificationDocuments.utility_bill.url && (
                          <a
                            href={verificationDocuments.utility_bill.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-green-700 text-sm font-medium"
                          >
                            View
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Live Photo */}
                <div className={`border-2 rounded-xl p-6 hover:border-primary transition-colors ${
                  verificationDocuments.live_photo.status === 'approved' ? 'border-green-200 bg-green-50' :
                  verificationDocuments.live_photo.status === 'pending' ? 'border-blue-200 bg-blue-50' :
                  verificationDocuments.live_photo.status === 'rejected' ? 'border-red-200 bg-red-50' :
                  'border-gray-200'
                }`}>
                  <div className="flex items-start mb-4">
                    <div className={`p-3 rounded-lg mr-4 ${
                      verificationDocuments.live_photo.status === 'approved' ? 'bg-green-100' :
                      verificationDocuments.live_photo.status === 'pending' ? 'bg-blue-100' :
                      verificationDocuments.live_photo.status === 'rejected' ? 'bg-red-100' :
                      'bg-gray-100'
                    }`}>
                      <CameraIcon className={`h-6 w-6 ${
                        verificationDocuments.live_photo.status === 'approved' ? 'text-green-600' :
                        verificationDocuments.live_photo.status === 'pending' ? 'text-blue-600' :
                        verificationDocuments.live_photo.status === 'rejected' ? 'text-red-600' :
                        'text-gray-600'
                      }`} />
                    </div>
                    <div>
                      <h5 className="font-bold text-gray-900 mb-1">Live Photograph</h5>
                      <p className="text-sm text-gray-600">You holding your uploaded ID document</p>
                      {verificationDocuments.live_photo.status !== 'not_uploaded' && (
                        <span className={`mt-1 inline-block px-2 py-1 rounded text-xs font-medium ${
                          verificationDocuments.live_photo.status === 'approved' ? 'bg-green-100 text-green-800' :
                          verificationDocuments.live_photo.status === 'pending' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {verificationDocuments.live_photo.status}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {verificationDocuments.live_photo.status === 'not_uploaded' ? (
                    <div 
                      className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-primary"
                      onClick={() => fileInputRefs.live_photo.current?.click()}
                    >
                      <input
                        type="file"
                        ref={fileInputRefs.live_photo}
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && handleFileUpload('live_photo', e.target.files[0])}
                        disabled={uploading}
                      />
                      <CameraIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Upload Live Photo</p>
                      <p className="text-xs text-gray-500 mt-1">JPG, PNG up to 5MB</p>
                    </div>
                  ) : (
                    <div className={`rounded-lg p-3 ${
                      verificationDocuments.live_photo.status === 'approved' ? 'bg-green-50 border border-green-200' :
                      verificationDocuments.live_photo.status === 'pending' ? 'bg-blue-50 border border-blue-200' :
                      'bg-red-50 border border-red-200'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <FileImage className={`h-5 w-5 mr-2 ${
                            verificationDocuments.live_photo.status === 'approved' ? 'text-green-600' :
                            verificationDocuments.live_photo.status === 'pending' ? 'text-blue-600' :
                            'text-red-600'
                          }`} />
                          <div>
                            <span className="text-sm font-medium">Live photo uploaded</span>
                            <p className="text-xs text-gray-500 mt-1">
                              Status: {verificationDocuments.live_photo.status}
                            </p>
                          </div>
                        </div>
                        {verificationDocuments.live_photo.url && (
                          <a
                            href={verificationDocuments.live_photo.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-green-700 text-sm font-medium"
                          >
                            View
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Submit for Review Button */}
            {allDocumentsUploaded && verificationStatus === 'demo' && (
              <div className="mt-8 p-6 bg-gradient-to-r from-primary/5 to-green-600/5 border border-primary/20 rounded-xl">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Ready for Submission</h4>
                <p className="text-gray-600 mb-4">
                  You have uploaded all required documents. Submit them for verification review.
                </p>
                <button
                  onClick={async () => {
                    setUploading(true)
                    try {
                      // Update provider status to pending
                      await supabase
                        .from('providers')
                        .update({ 
                          verification_status: 'pending',
                          verification_submitted_at: new Date().toISOString()
                        })
                        .eq('id', providerData.id)
                      
                      setVerificationStatus('pending')
                      alert('✅ Documents submitted for verification! Our team will review them within 24-48 hours.')
                    } catch (error) {
                      console.error('Submit error:', error)
                      alert('❌ Submission failed. Please try again.')
                    } finally {
                      setUploading(false)
                    }
                  }}
                  className="w-full px-6 py-4 bg-gradient-to-r from-primary to-green-600 text-white rounded-xl hover:from-green-600 hover:to-primary font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={uploading}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2 inline" />
                      Submitting...
                    </>
                  ) : 'Submit for Verification Review'}
                </button>
                <p className="text-sm text-gray-500 mt-2 text-center">
                  ⏰ Review process takes 24-48 hours. You'll be notified once approved.
                </p>
              </div>
            )}

            {/* Verification Instructions */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
              <h5 className="font-bold text-blue-900 mb-3">Verification Instructions</h5>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start">
                  <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span>All documents must be clear and readable</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Make sure your face is visible in passport and live photos</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Utility bills must not be older than 5 months</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Verification review takes 24-48 hours</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span>✅ "Fully Verified" badge only appears after admin approval</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* CTA Buttons */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-block px-8 py-3 bg-primary text-white rounded-xl hover:bg-green-700 font-medium mr-4 shadow-lg hover:shadow-xl transition-all"
          >
            Go to Homepage
          </Link>
          <Link
            href="/marketplace"
            className="inline-block px-8 py-3 border-2 border-primary text-primary rounded-xl hover:bg-green-50 font-medium shadow-lg hover:shadow-xl transition-all"
          >
            Browse Marketplace
          </Link>
        </div>
      </div>
    </div>
  )
}