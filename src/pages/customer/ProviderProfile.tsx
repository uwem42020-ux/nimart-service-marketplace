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
import { MapPin, Star, Calendar, ArrowLeft, CheckCircle, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { OptimizedImage } from '../../components/common/OptimizedImage';
import { cn } from '../../lib/utils';

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

  useEffect(() => {
    if (searchParams.get('review') === 'true') {
      setShowReviewModal(true);
    }
  }, [searchParams]);

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

      const fullProvider = {
        ...providerData,
        profile: profileData,
        portfolio_images: portfolioImages || [],
        reviews: reviews || [],
      };

      if (profile?.lat && profile?.lng && profileData?.lat && profileData?.lng) {
        (fullProvider as any).distance = calculateDistance(
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

  async function submitReview() {
    if (!user) {
      toast.error('Please sign in to leave a review');
      return;
    }
    setSubmittingReview(true);
    try {
      const { data: existingReview } = await supabase
        .from('reviews')
        .select('id')
        .eq('reviewer_id', user.id)
        .eq('provider_id', id)
        .maybeSingle();

      if (existingReview) {
        toast.error('You have already reviewed this provider');
        setShowReviewModal(false);
        return;
      }

      const { error } = await supabase.from('reviews').insert({
        reviewer_id: user.id,
        provider_id: id,
        rating: reviewRating,
        content: reviewContent || null,
      });

      if (error) throw error;
      toast.success('Review submitted! Thank you.');
      setShowReviewModal(false);
      refetch();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSubmittingReview(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
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

  const avgRating = provider.reviews?.length
    ? provider.reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / provider.reviews.length
    : 0;

  const statusColors = {
    available: 'bg-green-500',
    busy: 'bg-yellow-500',
    away: 'bg-gray-400',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            <div className="relative">
              {provider.profile?.avatar_url ? (
                <OptimizedImage
                  src={provider.profile.avatar_url}
                  alt={provider.business_name || provider.profile.full_name}
                  className="w-32 h-32 rounded-full object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-4xl font-semibold text-primary-600">
                    {(provider.business_name || provider.profile?.full_name || 'P')[0]}
                  </span>
                </div>
              )}
              <span
                className={cn(
                  'absolute bottom-2 right-2 block h-4 w-4 rounded-full ring-2 ring-white',
                  statusColors[provider.status as keyof typeof statusColors] || 'bg-gray-400'
                )}
              />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
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
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>
                    {provider.profile?.lga_name || 'Location not set'}
                    {(provider as any).distance && (
                      <span className="ml-1 text-gray-500">
                        ({formatDistance((provider as any).distance)})
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-400 mr-1" />
                  <span className="font-medium">{avgRating.toFixed(1)}</span>
                  <span className="text-gray-500 ml-1">({provider.reviews?.length || 0} reviews)</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowBookingModal(true)}
                className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition flex items-center justify-center gap-2"
              >
                <Calendar className="h-5 w-5" />
                Book Now
              </button>
              
              <ChatWidget
                recipientId={id!}
                recipientName={provider.business_name || provider.profile?.full_name || 'Provider'}
              />
            </div>
          </div>
        </div>

        {provider.portfolio_images?.length > 0 && (
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold mb-4">Portfolio</h2>
            <PortfolioGallery images={provider.portfolio_images} />
          </div>
        )}

        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Reviews</h2>
          <ReviewsList reviews={provider.reviews || []} />
        </div>
      </div>

      <BookingFormModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        providerId={id!}
        providerName={provider.business_name || provider.profile?.full_name || 'Provider'}
      />

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
    </div>
  );
}