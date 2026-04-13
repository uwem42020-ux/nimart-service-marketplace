import { memo } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, Clock, CheckCircle } from 'lucide-react';
import { OptimizedImage } from '../common/OptimizedImage';
import { formatDistance } from '../../lib/distance';
import { cn } from '../../lib/utils';
import type { ProviderWithProfile } from '../../types/database';

interface ProviderCardProps {
  provider: ProviderWithProfile;
  className?: string;
}

export const ProviderCard = memo(function ProviderCard({ provider, className }: ProviderCardProps) {
  const statusColors = {
    available: 'bg-green-500',
    busy: 'bg-yellow-500',
    away: 'bg-gray-400',
  };

  return (
    <Link
      to={`/provider/${provider.id}`}
      className={cn(
        'block bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow',
        className
      )}
    >
      <div className="p-4">
        <div className="flex items-start space-x-4">
          <div className="relative">
            {provider.profile.avatar_url ? (
              <OptimizedImage
                src={provider.profile.avatar_url}
                alt={provider.business_name || provider.profile.full_name || 'Provider'}
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-2xl font-semibold text-primary-600">
                  {(provider.business_name || provider.profile.full_name || 'P')[0]}
                </span>
              </div>
            )}
            <span
              className={cn(
                'absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white',
                statusColors[provider.status]
              )}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {provider.business_name || provider.profile.full_name}
              </h3>
              {provider.profile.is_verified && (
                <CheckCircle className="h-5 w-5 text-blue-500 flex-shrink-0 ml-2" />
              )}
            </div>

            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {provider.description || 'No description provided'}
            </p>

            <div className="flex items-center mt-2 text-sm text-gray-500 space-x-4">
              {provider.distance !== undefined && (
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{formatDistance(provider.distance)}</span>
                </div>
              )}
              {provider.average_rating && (
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-400 mr-1" />
                  <span>
                    {provider.average_rating.toFixed(1)} ({provider.review_count})
                  </span>
                </div>
              )}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {provider.tags?.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
});