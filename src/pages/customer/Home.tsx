// src/pages/customer/Home.tsx
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ProviderCard } from '../../components/provider/ProviderCard';
import { useAuth } from '../../contexts/AuthContext';
import { calculateDistance } from '../../lib/distance';
import { LocationDropdown } from '../../components/common/LocationDropdown';
import { MapPin, ChevronDown, Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { TIERS } from '../../data/categories';
import { CategoryButtons } from '../../components/common/CategoryButtons';
import { CategorySidebar } from '../../components/common/CategorySidebar';
import { useLocationStore } from '../../stores/locationStore';
import { useGeolocation } from '../../hooks/useGeolocation';
import { SEO } from '../../components/common/SEO';
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
  const [searchParams, setSearchParams] = useSearchParams();
  const stateFilter = searchParams.get('state');
  const lgaFilter = searchParams.get('lga');
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [locationLabel, setLocationLabel] = useState('All Nigeria');
  const [states, setStates] = useState<any[]>([]);
  const [providerCounts, setProviderCounts] = useState<Record<string, number>>({});
  const [subcategoryCounts, setSubcategoryCounts] = useState<Record<number, number>>({});

  useGeolocation();
  const { lat: globalLat, lng: globalLng } = useLocationStore();
  const userLat = profile?.lat ?? globalLat ?? undefined;
  const userLng = profile?.lng ?? globalLng ?? undefined;

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
      const [profilesRes, portfolioRes] = await Promise.all([
        supabase.from('profiles').select('*').in('id', providerIds),
        supabase.from('portfolio_images').select('*').in('provider_id', providerIds)
      ]);
      const profiles = profilesRes.data ?? [];
      const portfolioImages = portfolioRes.data ?? [];

      const providersWithDetails = await Promise.all(providers.map(async (provider) => {
        const providerProfile = profiles.find(p => p.id === provider.id) ?? ({} as ProfileRow);
        const images = portfolioImages.filter(img => img.provider_id === provider.id) ?? [];
        const distance = (userLat && userLng && providerProfile.lat && providerProfile.lng)
          ? calculateDistance(userLat, userLng, providerProfile.lat, providerProfile.lng)
          : undefined;

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
  };

  const clearLocation = () => {
    setSearchParams({});
    setLocationLabel('All Nigeria');
    setShowLocationDropdown(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SEO />

      {/* Hero Section - Mobile Optimized */}
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
              type="text"
              placeholder="I am looking for..."
              className="w-full px-3 py-3 text-gray-900 focus:outline-none text-sm md:text-base"
            />
            <button className="bg-accent-500 hover:bg-accent-600 text-white px-3 md:px-6 transition flex items-center justify-center">
              <Search className="h-5 w-5" />
              <span className="hidden md:inline ml-2">Search</span>
            </button>
          </div>
        </div>
      </section>

      {/* Desktop: Category Sidebar + Providers */}
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

          {isLoading ? (
            <div className="grid grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              {featuredProviders?.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">No providers found in this area.</p>
                  <button onClick={clearLocation} className="mt-2 text-primary-600 hover:underline">
                    View all Nigeria
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  {featuredProviders?.map((provider) => (
                    <ProviderCard key={provider.id} provider={provider} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile: Category Grid + Providers */}
      <div className="block md:hidden">
        <section className="mb-10">
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

          {isLoading ? (
            <div className="grid grid-cols-2 gap-4">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              {featuredProviders?.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">No providers found in this area.</p>
                  <button onClick={clearLocation} className="mt-2 text-primary-600 hover:underline">
                    View all Nigeria
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {featuredProviders?.map((provider) => (
                    <ProviderCard key={provider.id} provider={provider} />
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}