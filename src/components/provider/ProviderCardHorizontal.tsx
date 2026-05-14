// src/components/provider/ProviderCardHorizontal.tsx
import { memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Star, Briefcase, Clock, CheckCircle } from 'lucide-react';
import { OptimizedImage } from '../common/OptimizedImage';
import { formatDistance } from '../../lib/distance';
import { cn } from '../../lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import type { Database } from '../../types/database';

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

interface ProviderCardHorizontalProps {
  provider: ProviderWithProfile;
  className?: string;
}

const statusIconMap: Record<string, string> = {
  available: '/active.svg',
  busy: '/busy.svg',
  away: '/away.svg',
};

export const ProviderCardHorizontal = memo(function ProviderCardHorizontal({
  provider,
  className,
}: ProviderCardHorizontalProps) {
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
    : 'Recently';

  const handleBook = () => {
    if (provider.status === 'away') return;
    if (!user) {
      navigate('/auth/signin');
      return;
    }
    navigate(`/provider/${provider.id}?book=true`);
  };

  return (
    <div
      className={cn(
        'bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden flex flex-row items-stretch hover:shadow-md transition-shadow',
        className
      )}
    >
      {/* Image */}
      <Link
        to={`/provider/${provider.id}`}
        className="w-28 sm:w-32 flex-shrink-0 relative bg-gray-100 overflow-hidden"
      >
        {provider.profile?.avatar_url ? (
          <OptimizedImage
            src={provider.profile.avatar_url}
            alt={provider.business_name || provider.profile.full_name || 'Provider'}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary-50">
            <span className="text-3xl font-semibold text-primary-600">
              {(provider.business_name || provider.profile?.full_name || 'P')[0]}
            </span>
          </div>
        )}
        {/* Status icon */}
        <img
          src={statusIconMap[provider.status] || '/active.svg'}
          alt={provider.status}
          className="absolute top-2 right-2 h-5 w-5 ring-2 ring-white rounded-full"
        />
        {/* Verified badge */}
        {provider.profile?.is_verified && (
          <div className="absolute top-2 left-2 bg-blue-500 text-white p-0.5 rounded-full">
            <CheckCircle className="h-3.5 w-3.5" />
          </div>
        )}
        {/* Boosted badge – placed next to verified badge if both present */}
        {new Date(provider.boost_until) > new Date() && (
          <div className={`absolute top-2 ${provider.profile?.is_verified ? 'left-12' : 'left-2'} bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full font-medium`}>
            Boosted
          </div>
        )}
      </Link>

      {/* Details */}
      <div className="flex-1 p-3 sm:p-4 flex flex-col justify-between">
        <div>
          <Link
            to={`/provider/${provider.id}`}
            className="font-semibold text-primary-600 truncate hover:underline"
          >
            {provider.business_name || provider.profile?.full_name || 'Unnamed Provider'}
          </Link>
          {provider.description && (
            <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{provider.description}</p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs">
          <span className="flex items-center gap-1 text-gray-600">
            <MapPin className="h-3.5 w-3.5" />
            {locationString}
          </span>
          {provider.average_rating !== undefined && provider.average_rating > 0 && (
            <span className="flex items-center gap-1 text-yellow-500">
              <Star className="h-3.5 w-3.5 fill-yellow-400" />
              {provider.average_rating.toFixed(1)} ({provider.review_count || 0})
            </span>
          )}
          <span className="flex items-center gap-1 text-gray-500">
            <Clock className="h-3.5 w-3.5" />
            {lastSeen}
          </span>
          {provider.distance !== undefined && (
            <span className="flex items-center gap-1 text-gray-700 font-medium">
              <MapPin className="h-3.5 w-3.5 text-primary-600" />
              {formatDistance(provider.distance)}
            </span>
          )}
        </div>

        <div className="mt-2 flex items-center justify-between">
          <Link
            to={`/search?category=${provider.selected_category_slug}`}
            className="text-xs text-primary-600 hover:underline flex items-center gap-1"
          >
            <Briefcase className="h-3 w-3" />
            {categoryDisplay}
          </Link>
          {provider.status === 'away' ? (
            <button
              disabled
              className="bg-gray-300 text-gray-500 text-xs px-3 py-1.5 rounded-md cursor-not-allowed"
            >
              Not Available
            </button>
          ) : (
            <button
              onClick={handleBook}
              className="bg-primary-600 text-white text-xs px-3 py-1.5 rounded-md hover:bg-primary-700 transition-colors"
            >
              Book Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
});