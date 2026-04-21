// src/pages/customer/ProviderProfile.tsx
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { calculateDistance, formatDistance } from '../../lib/distance';
import { BookingFormModal } from '../../components/customer/BookingFormModal';
import { PortfolioGallery } from '../../components/provider/PortfolioGallery';
import { ReviewsList } from '../../components/reviews/ReviewsList';
import { ChatWidget } from '../../components/chat/ChatWidget';
import { SEO } from '../../components/common/SEO';
import { NimartSpinner } from '../../components/common/NimartSpinner';
import {
  MapPin,
  Star,
  Calendar,
  ArrowLeft,
  CheckCircle,
  X,
  MessageCircle,
  Flag,
  Phone,
  Clock,
  Shield,
  Eye,
  EyeOff,
  Package,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { OptimizedImage } from '../../components/common/OptimizedImage';
import { cn } from '../../lib/utils';
import type { Database } from '../../types/database';
import { formatDistanceToNow } from 'date-fns';

type ProviderRow = Database['public']['Tables']['providers']['Row'];
type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type PortfolioImageRow = Database['public']['Tables']['portfolio_images']['Row'];
type ReviewRow = Database['public']['Tables']['reviews']['Row'] & {
  reviewer: { full_name: string | null; avatar_url: string | null } | null;
};
type ServiceRow = Database['public']['Tables']['provider_services']['Row'];

interface FullProvider extends ProviderRow {
  profile: ProfileRow | null;
  portfolio_images: PortfolioImageRow[];
  reviews: ReviewRow[];
  services: ServiceRow[];
  distance?: number;
  completedBookings?: number;
  lastSignInAt?: string | null;
}

const statusIconMap: Record<string, string> = {
  available: '/active.svg',
  busy: '/busy.svg',
  away: '/away.svg',
};

const priceTypeLabels: Record<string, string> = {
  fixed: 'Fixed Price',
  hourly: 'Per Hour',
  daily: 'Per Day',
  negotiable: 'Negotiable',
};

export default function ProviderProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [searchParams] = useSearchParams();
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewContent, setReviewContent] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const requireAuth = (callback: () => void) => {
    if (!user) {
      toast.error('Please sign in to continue');
      navigate('/auth/signin');
      return;
    }
    callback();
  };

  useEffect(() => {
    if (searchParams.get('book') === 'true' && user) {
      setShowBookingModal(true);
    }
  }, [searchParams, user]);

  useEffect(() => {
    if (searchParams.get('review') === 'true') {
      requireAuth(() => setShowReviewModal(true));
    }
  }, [searchParams, user]);

  const { data: provider, isLoading, refetch } = useQuery({
    queryKey: ['provider', id],
    queryFn: async () => {
      if (!id) throw new Error('No provider ID');

      const { data: providerData, error: providerError } = await supabase
        .from('providers')
        .select('*')
        .eq('id', id)
        .single();

      if (providerError) throw providerError;
      if (!providerData) throw new Error('Provider not found');

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      const { data: portfolioImages } = await supabase
        .from('portfolio_images')
        .select('*')
        .eq('provider_id', id)
        .order('created_at', { ascending: false });

      const { data: reviews } = await supabase
        .from('reviews')
        .select(`
          id,
          rating,
          content,
          created_at,
          reviewer:reviewer_id(full_name, avatar_url)
        `)
        .eq('provider_id', id)
        .order('created_at', { ascending: false });

      const { data: services } = await supabase
        .from('provider_services')
        .select('*')
        .eq('provider_id', id)
        .order('created_at', { ascending: true });

      const { data: completedData } = await supabase
        .rpc('get_provider_completed_bookings', { provider_id: id });

      const { data: lastSignInData } = await supabase
        .rpc('get_user_last_sign_in', { user_id: id });

      const fullProvider: FullProvider = {
        ...providerData,
        profile: profileData ?? null,
        portfolio_images: portfolioImages ?? [],
        reviews: (reviews as ReviewRow[]) ?? [],
        services: services ?? [],
        completedBookings: completedData ?? 0,
        lastSignInAt: lastSignInData,
      };

      if (profile?.lat && profile?.lng && profileData?.lat && profileData?.lng) {
        fullProvider.distance = calculateDistance(
          profile.lat,
          profile.lng,
          profileData.lat,
          profileData.lng
        );
      }

      return fullProvider;
    },
    enabled: !!id,
  });

  const submitReview = async () => {
    if (!user) {
      toast.error('Please sign in to leave a review');
      navigate('/auth/signin');
      return;
    }
    setSubmittingReview(true);
    try {
      const { data: existingReview } = await supabase
        .from('reviews')
        .select('id')
        .eq('reviewer_id', user.id)
        .eq('provider_id', id!)
        .maybeSingle();

      if (existingReview) {
        toast.error('You have already reviewed this provider');
        setShowReviewModal(false);
        return;
      }

      const { error } = await supabase
        .from('reviews')
        .insert([{
          reviewer_id: user.id,
          provider_id: id!,
          rating: reviewRating,
          content: reviewContent || null,
        }]);

      if (error) throw error;
      toast.success('Review submitted! Thank you.');
      setShowReviewModal(false);
      refetch();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  const submitReport = async () => {
    if (!user) {
      toast.error('Please sign in to report this provider');
      navigate('/auth/signin');
      return;
    }
    if (!reportReason.trim()) {
      toast.error('Please provide a reason for the report');
      return;
    }
    setSubmittingReport(true);
    try {
      const { error } = await supabase
        .from('reports')
        .insert({
          reporter_id: user.id,
          provider_id: id!,
          reason: reportReason.trim(),
        });

      if (error) throw error;
      toast.success('Thank you for your report. Our team will review it.');
      setShowReportModal(false);
      setReportReason('');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSubmittingReport(false);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current || !provider?.portfolio_images.length) return;
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50;
    if (Math.abs(diff) > threshold) {
      if (diff > 0 && currentImageIndex < provider.portfolio_images.length - 1) {
        setCurrentImageIndex(prev => prev + 1);
      } else if (diff < 0 && currentImageIndex > 0) {
        setCurrentImageIndex(prev => prev - 1);
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const nextImage = () => {
    if (provider?.portfolio_images && currentImageIndex < provider.portfolio_images.length - 1) {
      setCurrentImageIndex(prev => prev + 1);
    }
  };

  const prevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(prev => prev - 1);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <NimartSpinner size="lg" />
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <p className="text-gray-500">Provider not found.</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-primary-600 hover:underline">
          Go back
        </button>
      </div>
    );
  }

  const avgRating = provider.reviews.length
    ? provider.reviews.reduce((acc, r) => acc + r.rating, 0) / provider.reviews.length
    : 0;

  const lastSeen = provider.lastSignInAt
    ? formatDistanceToNow(new Date(provider.lastSignInAt), { addSuffix: true })
    : 'Recently';

  const locationString = provider.profile?.lga_name
    ? `${provider.profile.lga_name}, ${provider.profile?.state_name || ''}`
    : 'Location not set';

  const providerSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": provider.business_name || provider.profile?.full_name,
    "description": provider.description,
    "image": provider.profile?.avatar_url,
    "telephone": provider.profile?.phone,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": provider.profile?.lga_name,
      "addressRegion": provider.profile?.state_name,
      "addressCountry": "NG"
    },
    "aggregateRating": provider.reviews.length > 0 ? {
      "@type": "AggregateRating",
      "ratingValue": avgRating,
      "reviewCount": provider.reviews.length
    } : undefined
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SEO
        title={provider.business_name || provider.profile?.full_name || 'Provider Profile'}
        description={provider.description || `Book ${provider.business_name} on Nimart. Verified professional in ${provider.profile?.lga_name}.`}
        image={provider.profile?.avatar_url || '/og-image.png'}
        url={`https://nimart.ng/provider/${id}`}
        type="profile"
        schema={providerSchema}
      />

      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center text-gray-600 hover:text-primary-600"
      >
        <ArrowLeft className="h-5 w-5 mr-1" />
        Back to results
      </button>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar with Status Icon */}
            <div className="relative w-32 h-32 mx-auto md:mx-0 flex-shrink-0">
              {provider.profile?.avatar_url ? (
                <OptimizedImage
                  src={provider.profile.avatar_url}
                  alt={provider.business_name || provider.profile.full_name || ''}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-4xl font-semibold text-primary-600">
                    {(provider.business_name || provider.profile?.full_name || 'P')[0]}
                  </span>
                </div>
              )}
              <img
                src={statusIconMap[provider.status] || '/active.svg'}
                alt={provider.status}
                className="absolute bottom-2 right-2 h-6 w-6 ring-2 ring-white rounded-full"
              />
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {provider.business_name || provider.profile?.full_name}
                </h1>
                {provider.profile?.is_verified && (
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Verified
                  </span>
                )}
              </div>
              <p className="text-gray-600 mb-3">{provider.description}</p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm">
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>
                    {locationString}
                    {provider.distance && (
                      <span className="ml-1 text-gray-500">
                        ({formatDistance(provider.distance)})
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-400 mr-1" />
                  <span className="font-medium">{avgRating.toFixed(1)}</span>
                  <span className="text-gray-500 ml-1">({provider.reviews.length} reviews)</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{provider.completedBookings} bookings completed</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>Last seen {lastSeen}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-row justify-end md:justify-start gap-2">
              <button
                onClick={() => requireAuth(() => setShowBookingModal(true))}
                className="bg-primary-600 text-white px-4 py-1.5 rounded-lg hover:bg-primary-700 transition flex items-center gap-1 text-sm"
              >
                <Calendar className="h-4 w-4" />
                Book Now
              </button>
              <button
                onClick={() => requireAuth(() => document.getElementById('chat-widget-trigger')?.click())}
                className="border border-gray-300 text-gray-700 px-4 py-1.5 rounded-lg hover:bg-gray-50 transition flex items-center gap-1 text-sm"
              >
                <MessageCircle className="h-4 w-4" />
                Message
              </button>
              <button
                onClick={() => requireAuth(() => setShowReportModal(true))}
                className="border border-red-300 text-red-600 px-4 py-1.5 rounded-lg hover:bg-red-50 transition flex items-center gap-1 text-sm"
              >
                <Flag className="h-4 w-4" />
                Report
              </button>
            </div>
          </div>

          {/* Contact & Safety Row */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => requireAuth(() => setShowPhone(!showPhone))}
                className="flex items-center gap-1 text-sm text-primary-600 hover:underline"
              >
                <Phone className="h-4 w-4" />
                {showPhone ? (
                  <span>{provider.profile?.phone || 'No phone provided'}</span>
                ) : (
                  <span>Show Contact</span>
                )}
                {showPhone ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <div className="flex items-start gap-2 text-sm text-gray-600">
              <Shield className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <div className="bg-gray-50 rounded-lg p-3 text-xs space-y-1">
                <p className="font-medium mb-1">Safety Tips</p>
                <p>• Meet in a safe location</p>
                <p>• Verify the provider's identity and reviews</p>
                <p>• Avoid paying upfront before service completion</p>
                <p>• Keep communication on the platform</p>
              </div>
            </div>
          </div>
        </div>

        {/* Services & Pricing */}
        {provider.services.length > 0 && (
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Package className="h-5 w-5 text-primary-600" />
              Services & Pricing
            </h2>
            <div className="space-y-3">
              {provider.services.map((service) => (
                <div key={service.id} className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">{service.name}</p>
                    {service.description && (
                      <p className="text-sm text-gray-500">{service.description}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary-600">₦{service.price.toLocaleString()}</p>
                    <p className="text-xs text-gray-400">{priceTypeLabels[service.price_type]}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Portfolio */}
        {provider.portfolio_images.length > 0 && (
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold mb-4">Portfolio</h2>
            {/* Mobile: Swipeable Carousel */}
            <div className="block md:hidden">
              <div
                className="relative overflow-hidden rounded-lg"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <div
                  className="flex transition-transform duration-300 ease-out"
                  style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
                >
                  {provider.portfolio_images.map((image) => (
                    <div key={image.id} className="w-full flex-shrink-0">
                      <img
                        src={image.image_url}
                        alt={image.title || 'Portfolio'}
                        className="w-full h-auto object-contain"
                        style={{ maxHeight: '70vh' }}
                      />
                    </div>
                  ))}
                </div>
                {/* Navigation Arrows */}
                {provider.portfolio_images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      disabled={currentImageIndex === 0}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-1 bg-black/30 text-white rounded-full disabled:opacity-30"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      disabled={currentImageIndex === provider.portfolio_images.length - 1}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 bg-black/30 text-white rounded-full disabled:opacity-30"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}
                {/* Dots Indicator */}
                <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
                  {provider.portfolio_images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={cn(
                        'w-2 h-2 rounded-full transition-all',
                        currentImageIndex === idx
                          ? 'bg-white scale-125'
                          : 'bg-white/50'
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>
            {/* Desktop: Grid Gallery */}
            <div className="hidden md:block">
              <PortfolioGallery images={provider.portfolio_images} />
            </div>
          </div>
        )}

        {/* Reviews */}
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Reviews</h2>
          <ReviewsList reviews={provider.reviews} />
        </div>
      </div>

      <BookingFormModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        providerId={id!}
        providerName={provider.business_name || provider.profile?.full_name || 'Provider'}
      />

      <div className="hidden">
        <ChatWidget
          recipientId={id!}
          recipientName={provider.business_name || provider.profile?.full_name || 'Provider'}
        />
        <button id="chat-widget-trigger" onClick={() => {
          const widgetButton = document.querySelector('.fixed.bottom-4.right-4 button') as HTMLButtonElement;
          widgetButton?.click();
        }} />
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Leave a Review</h2>
              <button onClick={() => setShowReviewModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={cn(
                          'h-8 w-8',
                          star <= reviewRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                        )}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Your Review (optional)</label>
                <textarea
                  value={reviewContent}
                  onChange={(e) => setReviewContent(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Share your experience..."
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={submitReview}
                  disabled={submittingReview}
                  className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Report Provider</h2>
              <button onClick={() => setShowReportModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <p className="text-sm text-gray-600">
                Please let us know why you're reporting this provider.
              </p>
              <textarea
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="e.g., Fake profile, inappropriate content, etc."
              />
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowReportModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={submitReport}
                  disabled={submittingReport}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {submittingReport ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}