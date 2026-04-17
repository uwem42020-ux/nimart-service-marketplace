// src/pages/Search.tsx
import { useQuery } from '@tanstack/react-query';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ProviderCard } from '../components/provider/ProviderCard';
import { useAuth } from '../contexts/AuthContext';
import { calculateDistance } from '../lib/distance';
import { FilterSidebar } from '../components/search/FilterSidebar';
import { SortDropdown } from '../components/search/SortDropdown';
import { useState } from 'react';
import type { Database } from '../types/database';

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

export default function Search() {
  const { profile } = useAuth();
  const [searchParams] = useSearchParams();
  const [sortBy, setSortBy] = useState<string>('distance');

  const keyword = searchParams.get('q') || '';
  const tier = searchParams.get('tier');
  const category = searchParams.get('category');
  const subcategory = searchParams.get('subcategory');
  const state = searchParams.get('state');
  const lga = searchParams.get('lga');

  const userLat = profile?.lat ?? undefined;
  const userLng = profile?.lng ?? undefined;

  const { data: providers, isLoading } = useQuery({
    queryKey: ['search-providers', keyword, tier, category, subcategory, state, lga, userLat, userLng, sortBy],
    queryFn: async () => {
      let query = supabase
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
        .eq('is_available', true);

      if (keyword) {
        query = query.or(`business_name.ilike.%${keyword}%,description.ilike.%${keyword}%`);
      }
      if (tier) {
        query = query.eq('selected_tier_slug', tier);
      }
      if (category) {
        query = query.eq('selected_category_slug', category);
      }
      if (subcategory) {
        query = query.eq('selected_subcategory_id', parseInt(subcategory));
      }
      if (lga) {
        query = query.eq('profile.lga_id', parseInt(lga));
      } else if (state) {
        const { data: lgasInState } = await supabase
          .from('lga_centers')
          .select('lga_id')
          .eq('state_id', parseInt(state));
        if (lgasInState && lgasInState.length > 0) {
          query = query.in('profile.lga_id', lgasInState.map(l => l.lga_id));
        }
      }

      query = query.limit(50);
      const { data: providersData, error } = await query;
      if (error) throw error;
      if (!providersData || providersData.length === 0) return [] as ProviderWithProfile[];

      const providerIds = providersData.map(p => p.id);
      const [profilesRes, portfolioRes] = await Promise.all([
        supabase.from('profiles').select('*').in('id', providerIds),
        supabase.from('portfolio_images').select('*').in('provider_id', providerIds)
      ]);
      const profiles = profilesRes.data ?? [];
      const portfolioImages = portfolioRes.data ?? [];

      const providersWithDetails = await Promise.all(providersData.map(async (provider) => {
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

      // Sort
      if (sortBy === 'distance') {
        providersWithDetails.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
      } else if (sortBy === 'rating') {
        providersWithDetails.sort((a, b) => (b.average_rating ?? 0) - (a.average_rating ?? 0));
      } else if (sortBy === 'availability') {
        providersWithDetails.sort((a, b) => (a.status === 'available' ? -1 : 1));
      }

      return providersWithDetails;
    },
    enabled: true,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-64 flex-shrink-0">
          <FilterSidebar />
        </aside>

        <main className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">
              {keyword ? `Results for "${keyword}"` : tier ? `${tier} Services` : 'All Providers'}
            </h1>
            <SortDropdown value={sortBy} onChange={setSortBy} />
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              {providers?.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">No providers found.</p>
                  <Link to="/" className="mt-2 inline-block text-primary-600 hover:underline">
                    Browse all providers
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {providers?.map((provider) => (
                    <ProviderCard key={provider.id} provider={provider} />
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}