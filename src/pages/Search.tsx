// src/pages/Search.tsx
import { useQuery } from '@tanstack/react-query';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ProviderCard } from '../components/provider/ProviderCard';
import { useAuth } from '../contexts/AuthContext';
import { calculateDistance } from '../lib/distance';
import { FilterSidebar } from '../components/search/FilterSidebar';
import { SortDropdown } from '../components/search/SortDropdown';
import { SEO } from '../components/common/SEO';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useDebounce } from '../hooks/useDebounce';
import { Search as SearchIcon, X } from 'lucide-react';
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

interface Suggestion {
  type: 'service' | 'provider' | 'category';
  text: string;
  subtext?: string;
  link: string;
}

export default function Search() {
  const { profile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [sortBy, setSortBy] = useState<string>('distance');

  const keyword = searchParams.get('q') || '';
  const tier = searchParams.get('tier');
  const category = searchParams.get('category');
  const subcategory = searchParams.get('subcategory');
  const state = searchParams.get('state');
  const lga = searchParams.get('lga');

  const userLat = profile?.lat ?? undefined;
  const userLng = profile?.lng ?? undefined;

  // Local state for search input
  const [searchInput, setSearchInput] = useState(keyword);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const debouncedSearchTerm = useDebounce(searchInput, 300);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Update input when URL keyword changes
  useEffect(() => {
    setSearchInput(keyword);
  }, [keyword]);

  // Fetch smart suggestions
  useEffect(() => {
    if (!debouncedSearchTerm || debouncedSearchTerm.length < 2) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      const term = debouncedSearchTerm.trim();
      
      // Search providers (name + business_name)
      const providerPromise = supabase
        .from('providers')
        .select('id, business_name, profile:profiles(full_name)')
        .or(`business_name.ilike.%${term}%,profile.full_name.ilike.%${term}%`)
        .limit(3);

      // Search categories and subcategories (from static data, but we can also query DB)
      // For simplicity, we'll just search provider services
      const servicePromise = supabase
        .from('provider_services')
        .select('id, name, provider:providers(business_name)')
        .ilike('name', `%${term}%`)
        .limit(3);

      const [providerRes, serviceRes] = await Promise.all([providerPromise, servicePromise]);

      const newSuggestions: Suggestion[] = [];

      if (providerRes.data) {
        providerRes.data.forEach(p => {
          const name = p.business_name || p.profile?.full_name;
          if (name) {
            newSuggestions.push({
              type: 'provider',
              text: name,
              subtext: 'Provider',
              link: `/provider/${p.id}`,
            });
          }
        });
      }

      if (serviceRes.data) {
        serviceRes.data.forEach(s => {
          newSuggestions.push({
            type: 'service',
            text: s.name,
            subtext: s.provider?.business_name || 'Service',
            link: `/search?q=${encodeURIComponent(s.name)}`,
          });
        });
      }

      // Deduplicate by text
      const unique = newSuggestions.filter(
        (v, i, a) => a.findIndex(t => t.text === v.text) === i
      );
      setSuggestions(unique.slice(0, 6));
    };

    fetchSuggestions();
  }, [debouncedSearchTerm]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchInput.trim()) {
      params.set('q', searchInput.trim());
    } else {
      params.delete('q');
    }
    setSearchParams(params);
    setShowSuggestions(false);
    setIsTyping(false);
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    if (suggestion.type === 'provider') {
      window.location.href = suggestion.link;
    } else {
      const params = new URLSearchParams(searchParams);
      params.set('q', suggestion.text);
      setSearchParams(params);
      setSearchInput(suggestion.text);
    }
    setShowSuggestions(false);
  };

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

      // Full-text search across business_name and description (and optionally profile.full_name via join)
      if (keyword) {
        // Join with profiles to search full_name as well
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
        const { data: profilesInLga } = await supabase
          .from('profiles')
          .select('id')
          .eq('lga_id', parseInt(lga));
        if (profilesInLga && profilesInLga.length > 0) {
          query = query.in('id', profilesInLga.map(p => p.id));
        } else {
          return [] as ProviderWithProfile[];
        }
      } else if (state) {
        const { data: lgasInState } = await supabase
          .from('lga_centers')
          .select('lga_id')
          .eq('state_id', parseInt(state));
        if (lgasInState && lgasInState.length > 0) {
          const lgaIds = lgasInState.map(l => l.lga_id);
          const { data: profilesInState } = await supabase
            .from('profiles')
            .select('id')
            .in('lga_id', lgaIds);
          if (profilesInState && profilesInState.length > 0) {
            query = query.in('id', profilesInState.map(p => p.id));
          } else {
            return [] as ProviderWithProfile[];
          }
        } else {
          return [] as ProviderWithProfile[];
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
      <SEO
        title={`Search${keyword ? `: ${keyword}` : ''}`}
        description={`Find trusted service providers in Nigeria. Browse by category, location, and ratings.`}
        url={`https://nimart.ng/search?${searchParams.toString()}`}
      />

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-64 flex-shrink-0">
          <FilterSidebar />
        </aside>

        <main className="flex-1">
          {/* Smart Search Bar */}
          <div className="mb-6 relative">
            <form onSubmit={handleSearchSubmit} className="relative">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchInput}
                  onChange={(e) => {
                    setSearchInput(e.target.value);
                    setShowSuggestions(true);
                    setIsTyping(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="Search services, providers..."
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchInput('');
                      setSuggestions([]);
                      const params = new URLSearchParams(searchParams);
                      params.delete('q');
                      setSearchParams(params);
                      inputRef.current?.focus();
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <button type="submit" className="hidden">Search</button>
            </form>

            {/* Smart Suggestions Dropdown */}
            {showSuggestions && debouncedSearchTerm && suggestions.length > 0 && (
              <div
                ref={suggestionsRef}
                className="absolute z-20 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden"
              >
                {suggestions.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(s)}
                    className="w-full flex items-center px-4 py-3 hover:bg-gray-50 transition text-left border-b last:border-0"
                  >
                    <SearchIcon className="h-4 w-4 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{s.text}</p>
                      {s.subtext && (
                        <p className="text-xs text-gray-500">{s.subtext}</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

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