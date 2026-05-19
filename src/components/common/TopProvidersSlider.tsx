// src/components/common/TopProvidersSlider.tsx
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { OptimizedImage } from './OptimizedImage';
import { useEffect, useState } from 'react';
import { cn } from '../../lib/utils';

const saveToCache = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
  } catch (e) {}
};

const loadFromCache = (key: string, maxAge = 1000 * 60 * 60 * 24) => {
  try {
    const cached = localStorage.getItem(key);
    if (!cached) return null;
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > maxAge) return null;
    return data;
  } catch {
    return null;
  }
};

const SkeletonCard = () => (
  <div className="flex-shrink-0 w-32 sm:w-36 md:w-44 lg:w-48 snap-start rounded-xl overflow-hidden animate-pulse bg-gray-200">
    <div className="w-full aspect-[4/5] bg-gray-300" />
    <div className="p-2 space-y-1">
      <div className="h-3 bg-gray-300 rounded w-3/4" />
      <div className="h-2 bg-gray-300 rounded w-1/2" />
    </div>
  </div>
);

export function TopProvidersSlider() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const { data: topProviders, isLoading } = useQuery({
    queryKey: ['top-providers', 'final-no-hover'],
    queryFn: async () => {
      try {
        const { data: providers, error: providerError } = await supabase
          .from('providers')
          .select('id, business_name, top_placement_until, boost_until')
          .gte('top_placement_until', new Date().toISOString())
          .eq('is_available', true)
          .order('top_placement_until', { ascending: false })
          .limit(5);

        if (providerError) throw providerError;
        if (!providers || providers.length === 0) return [];

        const ids = providers.map(p => p.id);
        const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select('id, avatar_url, full_name, lga_name, is_verified')
          .in('id', ids);

        if (profileError) throw profileError;

        const merged = providers.map(provider => ({
          ...provider,
          profile: profiles?.find(p => p.id === provider.id) ?? null,
          isBoosted: provider.boost_until ? new Date(provider.boost_until) > new Date() : false,
        }));

        saveToCache('top-providers-cache', merged);
        return merged;
      } catch (err) {
        const cached = loadFromCache('top-providers-cache');
        if (cached) return cached;
        throw err;
      }
    },
    staleTime: 1000 * 60 * 60 * 6,
    gcTime: 1000 * 60 * 60 * 24,
    retry: 1,
    placeholderData: loadFromCache('top-providers-cache'),
  });

  if (isLoading && !topProviders) {
    return (
      <div className="mb-6 px-2 sm:px-6 lg:px-8">
        <div className="inline-block bg-[#008751] text-white text-sm font-semibold px-4 py-1.5 rounded-full mb-3">
          Top Providers
        </div>
        <div className="flex gap-1 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-2">
          {[1, 2, 3, 4, 5].map(i => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  const displayData = topProviders || [];
  if (displayData.length === 0) return null;

  return (
    <div className="mb-6 px-2 sm:px-6 lg:px-8">
      <div className="inline-block bg-[#008751] text-white text-sm font-semibold px-4 py-1.5 rounded-full mb-3">
        Top Providers
        {isOffline && <span className="ml-2 text-xs text-white/80">(Offline mode)</span>}
      </div>
      <div className="flex gap-1 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-2">
        {displayData.map(provider => {
          const prof = provider.profile || {};
          const location = prof.lga_name || 'Location not set';
          const isVerified = prof.is_verified;
          const isBoosted = provider.isBoosted;
          const bgImage = prof.avatar_url || null;

          return (
            <Link
              key={provider.id}
              to={`/provider/${provider.id}`}
              className={cn(
                'flex-shrink-0 w-32 sm:w-36 md:w-44 lg:w-48 snap-start rounded-xl',
                isBoosted && 'border-2 border-amber-500'
              )}
            >
              <div className="rounded-xl overflow-hidden bg-white shadow-sm">
                <div className="relative w-full aspect-[4/5] bg-gray-100">
                  {bgImage ? (
                    <OptimizedImage
                      src={bgImage}
                      alt={provider.business_name}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-100 to-primary-200" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  {isVerified && (
                    <div className="absolute top-2 right-2 bg-white rounded-full p-0.5 shadow-sm z-10">
                      <img src="/verify.png" alt="Verified" className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                  )}
                  {isBoosted && (
                    <div className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm z-10">
                      BOOSTED
                    </div>
                  )}
                </div>
                <div className="p-2">
                  <div className="font-semibold text-xs sm:text-sm text-gray-900 truncate">
                    {provider.business_name}
                  </div>
                  <div className="flex items-center gap-0.5 text-[10px] sm:text-xs text-gray-500 truncate mt-0.5">
                    <MapPin className="h-2.5 w-2.5 flex-shrink-0" />
                    <span className="truncate">{location}</span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}