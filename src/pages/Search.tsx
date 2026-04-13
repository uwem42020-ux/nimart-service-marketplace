// src/pages/Search.tsx
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { ProviderCard } from '../components/provider/ProviderCard';
import { useAuth } from '../contexts/AuthContext';
import { calculateDistance } from '../lib/distance';
import { FilterSidebar } from '../components/search/FilterSidebar';
import { SortDropdown } from '../components/search/SortDropdown';
import { useState, useEffect } from 'react';
import type { ProviderWithProfile } from '../types/database';

export default function Search() {
  const { profile } = useAuth();
  const [searchParams] = useSearchParams();
  const [sortBy, setSortBy] = useState<string>('distance');
  
  // Extract filters from URL
  const keyword = searchParams.get('q') || '';
  const tier = searchParams.get('tier');
  const category = searchParams.get('category');
  const subcategory = searchParams.get('subcategory');
  const state = searchParams.get('state');
  const lga = searchParams.get('lga');

  const { data: providers, isLoading } = useQuery({
    queryKey: ['search-providers', keyword, tier, category, subcategory, state, lga, profile?.lat, profile?.lng, sortBy],
    queryFn: async () => {
      let query = supabase
        .from('providers')
        .select(`
          *,
          profile:profiles!inner(*),
          portfolio_images(*),
          reviews(rating)
        `)
        .eq('is_available', true);

      // Apply filters
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

      const { data } = await query.limit(50);
      if (!data) return [];

      // Calculate average rating and distance
      let providers = data.map((provider: any) => {
        const ratings = provider.reviews?.map((r: any) => r.rating) || [];
        const avgRating = ratings.length ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length : 0;
        const distance = (profile?.lat && profile?.lng && provider.profile.lat && provider.profile.lng)
          ? calculateDistance(profile.lat, profile.lng, provider.profile.lat, provider.profile.lng)
          : undefined;

        return {
          ...provider,
          average_rating: avgRating,
          review_count: ratings.length,
          distance,
        };
      });

      // Sort
      if (sortBy === 'distance') {
        providers.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
      } else if (sortBy === 'rating') {
        providers.sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0));
      } else if (sortBy === 'availability') {
        providers.sort((a, b) => (a.status === 'available' ? -1 : 1));
      }

      return providers;
    },
    enabled: true,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filter Sidebar */}
        <aside className="lg:w-64 flex-shrink-0">
          <FilterSidebar />
        </aside>

        {/* Results */}
        <main className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">
              {keyword ? `Results for "${keyword}"` : tier ? `${tier} Services` : 'All Providers'}
            </h1>
            <SortDropdown value={sortBy} onChange={setSortBy} />
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-200 rounded-lg animate-pulse" />
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {providers?.map((provider: ProviderWithProfile) => (
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