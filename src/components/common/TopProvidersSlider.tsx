import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';
import { MapPin, Star } from 'lucide-react';
import { OptimizedImage } from './OptimizedImage';
import { useEffect, useState } from 'react';

// Cache helpers (24 hour expiry)
const saveToCache = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
  } catch (e) {}
};

const loadFromCache = (key: string, maxAge = 1000 * 60 * 60 * 24) => { // 24 hours
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

// Skeleton card component – looks exactly like real card but gray
const SkeletonCard = () => (
  <div className="flex-shrink-0 w-36 sm:w-[30%] lg:w-[22%] snap-start bg-white rounded-xl border-2 border-gray-200 p-2 flex flex-col animate-pulse">
    <div className="w-full aspect-square rounded-lg bg-gray-200 mb-1 sm:mb-2"></div>
    <div className="flex-1">
      <div className="h-3 bg-gray-200 rounded w-3/4 mb-1"></div>
      <div className="h-2 bg-gray-200 rounded w-1/2"></div>
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
    queryKey: ['top-providers'],
    queryFn: async () => {
      try {
        const { data: providers, error: providerError } = await supabase
          .from('providers')
          .select('id, business_name, top_placement_until')
          .gte('top_placement_until', new Date().toISOString())
          .eq('is_available', true)
          .order('top_placement_until', { ascending: false })
          .limit(3);

        if (providerError) throw providerError;
        if (!providers || providers.length === 0) return [];

        const ids = providers.map(p => p.id);
        const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select('id, lat, lng, avatar_url, full_name, lga_name')
          .in('id', ids);

        if (profileError) throw profileError;

        const merged = providers.map(provider => ({
          ...provider,
          profile: profiles?.find(p => p.id === provider.id) ?? null,
        }));

        saveToCache('top-providers-cache', merged);
        return merged;
      } catch (err) {
        const cached = loadFromCache('top-providers-cache');
        if (cached) return cached;
        throw err;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 60 * 24, // Keep in cache 24 hours
    retry: 1,
    placeholderData: loadFromCache('top-providers-cache'), // shows cached immediately if exists
  });

  // Show skeletons while loading (no text, just gray blocks)
  if (isLoading && !topProviders) {
    return (
      <div className="mb-6 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Star className="h-4 w-4 text-amber-500" /> Top Providers
        </h3>
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
          {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  const displayData = topProviders || [];
  if (displayData.length === 0) return null;

  return (
    <div className="mb-6 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
      <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <Star className="h-4 w-4 text-amber-500" /> Top Providers
        {isOffline && <span className="text-xs text-gray-400 ml-2">(Offline mode)</span>}
      </h3>
      <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2 snap-x snap-mandatory">
        {displayData.map(provider => {
          const prof = (provider as any).profile || {};
          const location = prof.lga_name ? prof.lga_name : 'Location not set';
          return (
            <Link
              key={provider.id}
              to={`/provider/${provider.id}`}
              className="flex-shrink-0 w-36 sm:w-[30%] lg:w-[22%] snap-start bg-white rounded-xl border-2 border-green-700 p-2 hover:shadow-md transition flex flex-col"
            >
              <div className="w-full aspect-square rounded-lg overflow-hidden bg-gray-100 mb-1 sm:mb-2">
                {prof.avatar_url ? (
                  <OptimizedImage 
                    src={prof.avatar_url} 
                    alt={provider.business_name} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xl sm:text-2xl font-bold text-primary-600 bg-primary-50">
                    {(provider.business_name || 'P')[0]}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-[11px] sm:text-sm text-gray-900 truncate">
                  {provider.business_name}
                </p>
                <p className="text-[9px] sm:text-xs text-gray-500 flex items-center gap-0.5 sm:gap-1 mt-0.5">
                  <MapPin className="h-2 w-2 sm:h-3 sm:w-3 flex-shrink-0" /> 
                  <span className="truncate">{location}</span>
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}