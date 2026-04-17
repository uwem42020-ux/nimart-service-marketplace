// src/components/provider/ProviderCard.tsx
import { memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Star, CheckCircle, Briefcase, Clock } from 'lucide-react';
import { OptimizedImage } from '../common/OptimizedImage';
import { formatDistance } from '../../lib/distance';
import { cn } from '../../lib/utils';
import type { Database } from '../../types/database';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

type ProviderRow = Database['public']['Tables']['providers']['Row'];
type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type PortfolioImageRow = Database['public']['Tables']['portfolio_images']['Row'];

export interface ProviderWithProfile extends ProviderRow {
  profile: ProfileRow;
  portfolio_images: PortfolioImageRow[];
  distance?: number;
  average_rating?: number;
  review_count?: number;
  lastSignInAt?: string | null;
}

interface ProviderCardProps {
  provider: ProviderWithProfile;
  className?: string;
}

// Map status to SVG icon
const statusIconMap: Record<string, string> = {
  available: '/active.svg',
  busy: '/busy.svg',
  away: '/away.svg',
};

export const ProviderCard = memo(function ProviderCard({ provider, className }: ProviderCardProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const locationString = provider.profile?.lga_name
    ? `${provider.profile.lga_name}, ${provider.profile.state_name || ''}`
    : 'Location not set';

  const categoryDisplay = provider.selected_category_slug
    ? provider.selected_category_slug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    : 'General Services';

  const lastSeen = provider.lastSignInAt
    ? formatDistanceToNow(new Date(provider.lastSignInAt), { addSuffix: true })
    : provider.profile?.updated_at
    ? formatDistanceToNow(new Date(provider.profile.updated_at), { addSuffix: true })
    : 'Recently';

  const handleBookNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error('Please sign in to book');
      navigate('/auth/signin');
      return;
    }
    // Navigate to provider profile with booking modal open
    navigate(`/provider/${provider.id}?book=true`);
  };

  return (
    <div className={cn('bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden', className)}>
      {/* Image Section */}
      <Link to={`/provider/${provider.id}`} className="block relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
        {provider.profile?.avatar_url ? (
          <OptimizedImage
            src={provider.profile.avatar_url}
            alt={provider.business_name || provider.profile.full_name || 'Provider'}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary-50">
            <span className="text-4xl font-semibold text-primary-600">
              {(provider.business_name || provider.profile?.full_name || 'P')[0]}
            </span>
          </div>
        )}
        {/* Animated Status Icon with White Outline (animate-ping for all) */}
        <div className="absolute top-3 right-3">
          <div className="relative">
            <span
              className={cn(
                "absolute inset-0 rounded-full opacity-75 animate-ping",
                provider.status === 'available' && "bg-green-400",
                provider.status === 'busy' && "bg-yellow-400",
                provider.status === 'away' && "bg-red-400"
              )}
            />
            <img
              src={statusIconMap[provider.status] || '/active.svg'}
              alt={provider.status}
              className="relative h-6 w-6 ring-2 ring-white rounded-full"
            />
          </div>
        </div>
        {/* Verified Badge */}
        {provider.profile?.is_verified && (
          <div className="absolute top-3 left-3 bg-blue-500 text-white p-1 rounded-full">
            <CheckCircle className="h-4 w-4" />
          </div>
        )}
      </Link>

      {/* Content Section */}
      <div className="p-4">
        <Link to={`/provider/${provider.id}`} className="block">
          <h3 className="font-semibold text-primary-600 truncate mb-1 hover:underline">
            {provider.business_name || provider.profile?.full_name || 'Unnamed Provider'}
          </h3>
        </Link>

        {provider.description && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-2">
            {provider.description}
          </p>
        )}

        <Link
          to={`/search?category=${provider.selected_category_slug}`}
          className="inline-flex items-center text-xs text-primary-600 hover:underline mb-2"
          onClick={(e) => e.stopPropagation()}
        >
          <Briefcase className="h-3 w-3 mr-1" />
          <span>{categoryDisplay}</span>
        </Link>

        <div className="flex items-start text-xs text-gray-600 mb-1">
          <MapPin className="h-3.5 w-3.5 mr-1 flex-shrink-0 mt-0.5" />
          <span className="line-clamp-1">{locationString}</span>
        </div>

        <div className="flex items-center text-xs text-gray-500 mb-2">
          <Clock className="h-3 w-3 mr-1" />
          <span>Last seen {lastSeen}</span>
        </div>

        <div className="flex items-center justify-between mb-3">
          {provider.distance !== undefined ? (
            <span className="text-xs font-medium text-gray-700">
              {formatDistance(provider.distance)}
            </span>
          ) : (
            <span className="text-xs text-gray-400">Distance N/A</span>
          )}
          {provider.average_rating !== undefined && provider.average_rating > 0 ? (
            <div className="flex items-center">
              <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400 mr-0.5" />
              <span className="text-xs font-medium text-gray-700">
                {provider.average_rating.toFixed(1)}
              </span>
              <span className="text-xs text-gray-400 ml-0.5">
                ({provider.review_count || 0})
              </span>
            </div>
          ) : (
            <span className="text-xs text-gray-400">No reviews</span>
          )}
        </div>

        {/* Book Now Button */}
        <button
          onClick={handleBookNow}
          className="block w-full bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium py-2 rounded-lg transition-colors text-center"
        >
          Book Now
        </button>
      </div>
    </div>
  );
});