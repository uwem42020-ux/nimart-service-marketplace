// src/pages/customer/Home.tsx
import { useQuery } from '@tanstack/react-query';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ProviderCard } from '../../components/provider/ProviderCard';
import { useAuth } from '../../contexts/AuthContext';
import { calculateDistance } from '../../lib/distance';
import { LocationDropdown } from '../../components/common/LocationDropdown';
import { MapPin, ChevronDown, Search } from 'lucide-react';
import { useState } from 'react';
import type { ProviderWithProfile } from '../../types/database';
import { TIERS } from '../../data/categories';
import { CategoryButtons } from '../../components/common/CategoryButtons';
import { useLocationStore } from '../../stores/locationStore';
import { useGeolocation } from '../../hooks/useGeolocation';

export default function Home() {
  const { profile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const stateFilter = searchParams.get('state');
  const lgaFilter = searchParams.get('lga');
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [locationLabel, setLocationLabel] = useState('All Nigeria');

  // Request geolocation for all users
  useGeolocation();
  const { lat: globalLat, lng: globalLng } = useLocationStore();

  // Prefer logged-in profile location, fallback to browser geolocation
  const userLat = profile?.lat || globalLat;
  const userLng = profile?.lng || globalLng;

  const { data: featuredProviders, isLoading } = useQuery({
    queryKey: ['featured-providers', userLat, userLng, stateFilter, lgaFilter],
    queryFn: async () => {
      // 1. Build the providers query
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

      // Apply location filters
      if (lgaFilter) {
        const { data: profilesInLga } = await supabase
          .from('profiles')
          .select('id')
          .eq('lga_id', parseInt(lgaFilter));
        if (profilesInLga && profilesInLga.length > 0) {
          providerQuery = providerQuery.in('id', profilesInLga.map(p => p.id));
        } else {
          return [];
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
            return [];
          }
        } else {
          return [];
        }
      }

      const { data: providers, error } = await providerQuery;
      if (error) throw error;
      if (!providers || providers.length === 0) return [];

      // 2. Get profiles for these providers
      const providerIds = providers.map(p => p.id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('id', providerIds);

      // 3. Get portfolio images
      const { data: portfolioImages } = await supabase
        .from('portfolio_images')
        .select('*')
        .in('provider_id', providerIds);

      // 4. Combine data
      const combined = providers.map(provider => {
        const providerProfile = profiles?.find(p => p.id === provider.id) || null;
        const images = portfolioImages?.filter(img => img.provider_id === provider.id) || [];
        const distance = (userLat && userLng && providerProfile?.lat && providerProfile?.lng)
          ? calculateDistance(userLat, userLng, providerProfile.lat, providerProfile.lng)
          : undefined;

        return {
          ...provider,
          profile: providerProfile,
          portfolio_images: images,
          distance,
        } as ProviderWithProfile;
      });

      // Sort by distance if user location available
      if (userLat && userLng) {
        combined.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
      }

      return combined;
    },
    enabled: true,
  });

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
      {/* Hero Section with Search + Location */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-6 md:p-8 mb-8 text-white">
        <h1 className="text-2xl md:text-4xl font-bold mb-3">
          Find Trusted Service Providers in Nigeria
        </h1>
        <p className="text-base md:text-lg opacity-90 mb-6">
          Connect with verified professionals for any service you need
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 bg-white rounded-lg p-1 flex items-center">
            <Search className="h-5 w-5 text-gray-400 ml-3" />
            <input
              type="text"
              placeholder="What service do you need?"
              className="w-full px-3 py-3 text-gray-900 focus:outline-none rounded-lg"
            />
          </div>

          <div className="relative">
            <button
              onClick={() => setShowLocationDropdown(!showLocationDropdown)}
              className="w-full sm:w-auto bg-white/20 backdrop-blur-sm text-white border border-white/30 rounded-lg px-4 py-3 flex items-center justify-between gap-2 hover:bg-white/30 transition"
            >
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                <span className="truncate max-w-[150px]">{locationLabel}</span>
              </div>
              <ChevronDown className="h-4 w-4 flex-shrink-0" />
            </button>
            {showLocationDropdown && (
              <LocationDropdown
                onSelectState={(id, name) => handleLocationSelect('state', id, name)}
                onSelectLga={(id, name) => handleLocationSelect('lga', id, `${name} LGA`)}
                onClear={clearLocation}
                onClose={() => setShowLocationDropdown(false)}
              />
            )}
          </div>

          <button className="bg-accent-500 hover:bg-accent-600 text-white px-6 py-3 rounded-lg font-medium transition">
            Search
          </button>
        </div>
      </section>

      {/* Categories as Buttons (Jiji style) */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Browse by Category</h2>
        <CategoryButtons tiers={TIERS} />
      </section>

      {/* Featured Providers */}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg animate-pulse" />
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {featuredProviders?.map((provider: ProviderWithProfile) => (
                  <ProviderCard key={provider.id} provider={provider} />
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}