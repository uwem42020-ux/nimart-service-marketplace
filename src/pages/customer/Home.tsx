// src/pages/customer/Home.tsx
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ProviderCard } from '../../components/provider/ProviderCard';
import { useAuth } from '../../contexts/AuthContext';
import { LocationDropdown } from '../../components/common/LocationDropdown';
import { MapPin, ChevronDown, Search, WifiOff } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { TIERS } from '../../data/categories';
import { CategoryButtons } from '../../components/common/CategoryButtons';
import { CategorySidebar } from '../../components/common/CategorySidebar';
import { useLocationStore } from '../../stores/locationStore';
import { useGeolocation } from '../../hooks/useGeolocation';
import { useOffline } from '../../hooks/useOffline';
import { SEO } from '../../components/common/SEO';
import { NimartSpinner } from '../../components/common/NimartSpinner';
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

export default function Home() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const stateFilter = searchParams.get('state');
  const lgaFilter = searchParams.get('lga');
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [locationLabel, setLocationLabel] = useState('All Nigeria');
  const [states, setStates] = useState<any[]>([]);
  const [providerCounts, setProviderCounts] = useState<Record<string, number>>({});
  const [subcategoryCounts, setSubcategoryCounts] = useState<Record<number, number>>({});
  const searchInputRef = useRef<HTMLInputElement>(null);
  const autoLocationApplied = useRef(false);
  const isOffline = useOffline();

  useGeolocation();
  const { lat: globalLat, lng: globalLng, permissionGranted } = useLocationStore();
  const userLat = profile?.lat ?? globalLat ?? undefined;
  const userLng = profile?.lng ?? globalLng ?? undefined;

  useEffect(() => {
    if (!permissionGranted || !globalLat || !globalLng) return;
    if (autoLocationApplied.current) return;
    if (searchParams.get('state') || searchParams.get('lga')) return;

    const fetchNearestLGA = async () => {
      const { data, error } = await supabase.rpc('find_nearest_lga', {
        user_lat: globalLat,
        user_lng: globalLng
      });

      if (!error && data && data.length > 0) {
        const nearest = data[0];
        const params = new URLSearchParams(searchParams);
        params.set('state', nearest.state_id.toString());
        params.set('lga', nearest.lga_id.toString());
        setSearchParams(params, { replace: true });
        setLocationLabel(`${nearest.lga_name}, ${nearest.state_name}`);
        autoLocationApplied.current = true;
      }
    };

    fetchNearestLGA();
  }, [permissionGranted, globalLat, globalLng]);

  useEffect(() => {
    async function fetchStates() {
      const { data } = await supabase
        .from('lga_centers')
        .select('state_id, state_name')
        .order('state_name');
      const uniqueStates = data?.filter((v, i, a) =>
        a.findIndex(t => t.state_id === v.state_id) === i
      ) || [];
      setStates(uniqueStates);
    }
    fetchStates();
  }, []);

  const { data: featuredProviders, isLoading } = useQuery({
    queryKey: ['featured-providers', userLat, userLng, stateFilter, lgaFilter],
    queryFn: async () => {
      const { data: allProviders, error: allError } = await supabase
        .from('providers')
        .select('id, selected_category_slug, selected_subcategory_id')
        .eq('is_available', true);

      if (!allError && allProviders) {
        const catCounts: Record<string, number> = {};
        const subCounts: Record<number, number> = {};
        allProviders.forEach(p => {
          if (p.selected_category_slug) {
            catCounts[p.selected_category_slug] = (catCounts[p.selected_category_slug] || 0) + 1;
          }
          if (p.selected_subcategory_id) {
            subCounts[p.selected_subcategory_id] = (subCounts[p.selected_subcategory_id] || 0) + 1;
          }
        });
        setProviderCounts(catCounts);
        setSubcategoryCounts(subCounts);
      }

      let providerQuery = supabase
        .from('providers')
        .select(`
          id,
          business_name,
          description,
          status,
          is_available,
          selected_tier_slug,
          selected_category_slug,
          selected_subcategory_id,
          tags,
          boost_until
        `)
        .eq('is_available', true)
        .order('boost_until', { ascending: false, nullsFirst: false })
        .limit(20);

      if (lgaFilter) {
        const { data: profilesInLga } = await supabase
          .from('profiles')
          .select('id')
          .eq('lga_id', parseInt(lgaFilter));
        if (profilesInLga && profilesInLga.length > 0) {
          providerQuery = providerQuery.in('id', profilesInLga.map(p => p.id));
        } else {
          return [] as ProviderWithProfile[];
        }
      } else if (stateFilter) {
        const { data: lgasInState } = await supabase
          .from('lga_centers')
          .select('lga_id')
          .eq('state_id', parseInt(stateFilter));
        if (lgasInState && lgasInState.length > 0) {
          const lgaIds = lgasInState.map(l => l.lga_id);
          const { data: profilesInState } = await supabase
            .from('profiles')
            .select('id')
            .in('lga_id', lgaIds);
          if (profilesInState && profilesInState.length > 0) {
            providerQuery = providerQuery.in('id', profilesInState.map(p => p.id));
          } else {
            return [] as ProviderWithProfile[];
          }
        } else {
          return [] as ProviderWithProfile[];
        }
      }

      const { data: providers, error } = await providerQuery;
      if (error) throw error;
      if (!providers || providers.length === 0) return [] as ProviderWithProfile[];

      const providerIds = providers.map(p => p.id);

      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('id', providerIds);

      const { data: portfolioImages } = await supabase
        .from('portfolio_images')
        .select('*')
        .in('provider_id', providerIds);

      let distancesMap: Record<string, number> = {};
      if (userLat && userLng) {
        const { data: distances, error: rpcError } = await supabase
          .rpc('get_provider_distances', {
            user_lat: userLat,
            user_lng: userLng,
            provider_ids: providerIds
          });

        if (!rpcError && distances) {
          distances.forEach((d: any) => {
            distancesMap[d.provider_id] = d.distance_meters;
          });
        }
      }

      const providersWithDetails = await Promise.all(providers.map(async (provider) => {
        const providerProfile = profiles?.find(p => p.id === provider.id) ?? ({} as ProfileRow);
        const images = (portfolioImages || []).filter(img => img.provider_id === provider.id);
        const distanceMeters = distancesMap[provider.id];
        const distance = distanceMeters ? distanceMeters / 1000 : undefined;

        const { data: reviews } = await supabase
          .from('reviews')
          .select('rating')
          .eq('provider_id', provider.id);
        const avgRating = reviews?.length
          ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
          : 0;

        const { data: lastSignInData } = await supabase
          .rpc('get_user_last_sign_in', { user_id: provider.id });

        return {
          ...provider,
          profile: providerProfile,
          portfolio_images: images,
          distance,
          average_rating: avgRating,
          review_count: reviews?.length || 0,
          lastSignInAt: lastSignInData,
        } as ProviderWithProfile;
      }));

      if (userLat && userLng) {
        providersWithDetails.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
      }

      return providersWithDetails;
    },
    enabled: true,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    const channel = supabase
      .channel('providers-status')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'providers' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['featured-providers'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const handleLocationSelect = (type: 'state' | 'lga', id: string, label: string) => {
    const params = new URLSearchParams(searchParams);
    if (type === 'state') {
      params.set('state', id);
      params.delete('lga');
      setLocationLabel(label);
    } else {
      params.set('lga', id);
      setLocationLabel(label);
    }
    setSearchParams(params);
    setShowLocationDropdown(false);
    autoLocationApplied.current = true;
  };

  const clearLocation = () => {
    setSearchParams({});
    setLocationLabel('All Nigeria');
    setShowLocationDropdown(false);
    autoLocationApplied.current = true;
  };

  const handleSearch = () => {
    const query = searchInputRef.current?.value.trim();
    if (query) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    } else {
      navigate('/search');
    }
  };

  const NoProvidersBanner = () => (
    <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl p-6 md:p-8 text-center border-2 border-dashed border-primary-300">
      <div className="text-4xl md:text-5xl mb-3 md:mb-4">🚀</div>
      <h3 className="text-lg md:text-xl font-bold text-primary-800 mb-2 md:mb-3">
        Be the First Provider in This Area!
      </h3>
      <p className="text-primary-700 mb-4 text-sm md:text-base">
        Get <span className="font-bold text-xl md:text-2xl">₦1,000</span> when you register as the first provider in your LGA.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          to="/auth/signup?role=provider"
          className="inline-block bg-primary-600 text-white px-6 md:px-8 py-2.5 md:py-3 rounded-lg font-medium hover:bg-primary-700 transition"
        >
          Claim ₦1,000 Now →
        </Link>
        <button
          onClick={() => clearLocation()}
          className="inline-block bg-white text-primary-600 border border-primary-300 px-6 md:px-8 py-2.5 md:py-3 rounded-lg font-medium hover:bg-primary-50 transition"
        >
          View All Nigeria 🇳🇬
        </button>
      </div>
      <p className="text-xs text-primary-600 mt-3 md:mt-4">
        Limited to first 10 providers per area. Terms apply.
      </p>
    </div>
  );

  const OfflineBanner = () => (
    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center mb-4">
      <WifiOff className="h-12 w-12 text-yellow-600 mx-auto mb-3" />
      <h3 className="font-semibold text-gray-900 mb-1">You're offline</h3>
      <p className="text-gray-600 text-sm">
        Connect to the internet to load the latest providers.
      </p>
      <p className="text-gray-500 text-xs mt-2">
        Previously loaded providers may still be visible below.
      </p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SEO />

      <section className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-6 md:p-8 mb-8 text-white">
        <p className="text-base md:text-lg text-white/90 text-center mb-5">
          Connect with professionals near you
        </p>

        <div className="flex flex-row justify-center md:justify-start gap-3 max-w-3xl mx-auto">
          <div className="relative w-36 sm:w-44 md:w-auto">
            <button
              onClick={() => setShowLocationDropdown(!showLocationDropdown)}
              className="w-full bg-white/20 backdrop-blur-sm text-white border border-white/30 rounded-lg px-3 md:px-4 py-3 flex items-center justify-between gap-1 md:gap-2 hover:bg-white/30 transition"
            >
              <div className="flex items-center gap-1 md:gap-2">
                <MapPin className="h-5 w-5 flex-shrink-0" />
                <span className="truncate text-sm md:text-base">{locationLabel}</span>
              </div>
              <ChevronDown className="h-4 w-4 flex-shrink-0" />
            </button>
            {showLocationDropdown && (
              <LocationDropdown
                onSelectState={(id, name) => handleLocationSelect('state', id, name)}
                onSelectLga={(id, name) => handleLocationSelect('lga', id, `${name} LGA`)}
                onClear={clearLocation}
                onClose={() => setShowLocationDropdown(false)}
                preloadedStates={states}
              />
            )}
          </div>

          <div className="flex bg-white rounded-lg overflow-hidden w-40 sm:w-52 md:flex-1">
            <div className="hidden md:flex items-center pl-3">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="I am looking for..."
              className="w-full px-3 py-3 text-gray-900 focus:outline-none text-sm md:text-base"
            />
            <button
              onClick={handleSearch}
              className="bg-accent-500 hover:bg-accent-600 text-white px-3 md:px-6 transition flex items-center justify-center"
            >
              <Search className="h-5 w-5" />
              <span className="hidden md:inline ml-2">Search</span>
            </button>
          </div>
        </div>
      </section>

      {/* Desktop Layout */}
      <div className="hidden md:flex gap-6">
        <div className="w-64 flex-shrink-0">
          <CategorySidebar providerCounts={providerCounts} subcategoryCounts={subcategoryCounts} />
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              {lgaFilter || stateFilter ? 'Providers in Selected Area' : 'Featured Providers'}
            </h2>
            <Link to="/search" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              View all →
            </Link>
          </div>

          {isOffline && <OfflineBanner />}

          {isLoading ? (
            <div className="flex justify-center py-16">
              <NimartSpinner size="lg" />
            </div>
          ) : (
            <>
              {featuredProviders?.length === 0 && !isOffline ? (
                <NoProvidersBanner />
              ) : featuredProviders && featuredProviders.length > 0 ? (
                <div className="grid grid-cols-3 gap-4">
                  {featuredProviders.map((provider) => (
                    <ProviderCard key={provider.id} provider={provider} />
                  ))}
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="block md:hidden">
        <section className="mb-6">
          <CategoryButtons />
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              {lgaFilter || stateFilter ? 'Providers in Selected Area' : 'Featured Providers'}
            </h2>
            <Link to="/search" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              View all →
            </Link>
          </div>

          {isOffline && <OfflineBanner />}

          {isLoading ? (
            <div className="flex justify-center py-16">
              <NimartSpinner size="lg" />
            </div>
          ) : (
            <>
              {featuredProviders?.length === 0 && !isOffline ? (
                <NoProvidersBanner />
              ) : featuredProviders && featuredProviders.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {featuredProviders.map((provider) => (
                    <ProviderCard key={provider.id} provider={provider} />
                  ))}
                </div>
              ) : null}
            </>
          )}
        </section>
      </div>
    </div>
  );
}