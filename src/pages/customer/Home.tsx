import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ProviderCardPortrait } from '../../components/provider/ProviderCardPortrait';
import { ProviderCardHorizontal } from '../../components/provider/ProviderCardHorizontal';
import { useAuth } from '../../contexts/AuthContext';
import { LocationDropdown } from '../../components/common/LocationDropdown';
import { QuickLinksBanner } from '../../components/common/QuickLinksBanner';
import { TopProvidersSlider } from '../../components/common/TopProvidersSlider';
import { CategoryButtons } from '../../components/common/CategoryButtons';
import { CategorySidebar } from '../../components/common/CategorySidebar';
import { FindProvidersRadar } from '../../components/customer/FindProvidersRadar';
import { MapPin, ChevronDown, Search, WifiOff, LayoutGrid, List } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useLocationStore } from '../../stores/locationStore';
import { useGeolocation } from '../../hooks/useGeolocation';
import { useOffline } from '../../hooks/useOffline';
import { SEO } from '../../components/common/SEO';
import { ProviderGridSkeleton } from '../../components/skeletons/ProviderGridSkeleton';
import { cn } from '../../lib/utils';
import { useSmartSort } from '../../hooks/useSmartSort';
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

// ========== STRUCTURED DATA SCHEMAS ==========

const homeSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Nimart",
  "url": "https://nimart.ng",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://nimart.ng/search?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
};

const siteNavSchema = {
  "@context": "https://schema.org",
  "@type": "SiteNavigationElement",
  "name": "Main Navigation",
  "url": "https://nimart.ng",
  "hasPart": [
    { "@type": "SiteNavigationElement", "name": "Home", "url": "https://nimart.ng/" },
    { "@type": "SiteNavigationElement", "name": "Search Providers", "url": "https://nimart.ng/search" },
    { "@type": "SiteNavigationElement", "name": "Map", "url": "https://nimart.ng/map" },
    { "@type": "SiteNavigationElement", "name": "Sign Up as Provider", "url": "https://nimart.ng/auth/signup?role=provider" }
  ]
};

// =============================================

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
  const [preloadedLgas, setPreloadedLgas] = useState<Record<string, any[]>>({});
  const [radarOpen, setRadarOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const locationButtonRef = useRef<HTMLButtonElement>(null);
  const autoLocationApplied = useRef(false);
  const isOffline = useOffline();

  useGeolocation();
  const { lat: globalLat, lng: globalLng } = useLocationStore();
  const userLat = profile?.lat ?? globalLat ?? undefined;
  const userLng = profile?.lng ?? globalLng ?? undefined;

  // AI sorting hook
  const { data: smartSortData } = useSmartSort(
    profile?.id,
    userLat,
    userLng,
    undefined,
    undefined,
    20
  );

  // Provider counts (cached)
  const [providerCounts, setProviderCounts] = useState<Record<string, number>>(() => {
    try { const saved = localStorage.getItem('nimart_provider_counts'); return saved ? JSON.parse(saved) : {}; }
    catch { return {}; }
  });

  const [subcategoryCounts, setSubcategoryCounts] = useState<Record<number, number>>(() => {
    try { const saved = localStorage.getItem('nimart_subcategory_counts'); return saved ? JSON.parse(saved) : {}; }
    catch { return {}; }
  });

  useEffect(() => {
    if (Object.keys(providerCounts).length > 0) localStorage.setItem('nimart_provider_counts', JSON.stringify(providerCounts));
  }, [providerCounts]);

  useEffect(() => {
    if (Object.keys(subcategoryCounts).length > 0) localStorage.setItem('nimart_subcategory_counts', JSON.stringify(subcategoryCounts));
  }, [subcategoryCounts]);

  // Preload states and LGAs
  useEffect(() => {
    async function preloadLocations() {
      const { data: allStates } = await supabase.from('lga_centers').select('state_id, state_name').order('state_name');
      const uniqueStates = allStates?.filter((v, i, a) => a.findIndex(t => t.state_id === v.state_id) === i) || [];
      setStates(uniqueStates);

      const { data: allLgas } = await supabase.from('lga_centers').select('lga_id, lga_name, state_id, lat, lng').order('lga_name');
      if (allLgas) {
        const grouped: Record<string, any[]> = {};
        allLgas.forEach((lga) => {
          const key = lga.state_id.toString();
          if (!grouped[key]) grouped[key] = [];
          grouped[key].push(lga);
        });
        setPreloadedLgas(grouped);
      }
    }
    preloadLocations();
  }, []);

  // Featured providers query
  const { data: featuredProviders, isLoading } = useQuery({
    queryKey: ['featured-providers', userLat, userLng, stateFilter, lgaFilter],
    queryFn: async () => {
      const { data: allProviders, error: allError } = await supabase
        .from('providers').select('id, selected_category_slug, selected_subcategory_id').eq('is_available', true);

      if (!allError && allProviders) {
        const catCounts: Record<string, number> = {};
        const subCounts: Record<number, number> = {};
        allProviders.forEach(p => {
          if (p.selected_category_slug) catCounts[p.selected_category_slug] = (catCounts[p.selected_category_slug] || 0) + 1;
          if (p.selected_subcategory_id) subCounts[p.selected_subcategory_id] = (subCounts[p.selected_subcategory_id] || 0) + 1;
        });
        setProviderCounts(catCounts); setSubcategoryCounts(subCounts);
      }

      let providerQuery = supabase.from('providers').select(`
          id, business_name, description, status, is_available, selected_tier_slug,
          selected_category_slug, selected_subcategory_id, tags, boost_until, top_placement_until
        `).eq('is_available', true)
        .order('boost_until', { ascending: false, nullsFirst: false })
        .order('status', { ascending: true })
        .limit(50);

      if (lgaFilter) {
        const { data: profilesInLga } = await supabase.from('profiles').select('id').eq('lga_id', parseInt(lgaFilter));
        if (profilesInLga && profilesInLga.length > 0) providerQuery = providerQuery.in('id', profilesInLga.map(p => p.id));
        else return [] as ProviderWithProfile[];
      } else if (stateFilter) {
        const { data: lgasInState } = await supabase.from('lga_centers').select('lga_id').eq('state_id', parseInt(stateFilter));
        if (lgasInState && lgasInState.length > 0) {
          const lgaIds = lgasInState.map(l => l.lga_id);
          const { data: profilesInState } = await supabase.from('profiles').select('id').in('lga_id', lgaIds);
          if (profilesInState && profilesInState.length > 0) providerQuery = providerQuery.in('id', profilesInState.map(p => p.id));
          else return [] as ProviderWithProfile[];
        } else return [] as ProviderWithProfile[];
      }

      const { data: providers, error } = await providerQuery;
      if (error) throw error;
      if (!providers || providers.length === 0) return [] as ProviderWithProfile[];
      const providerIds = providers.map(p => p.id);

      const [profilesRes, portfolioRes, reviewsRes, lgaDataRes] = await Promise.all([
        supabase.from('profiles').select('*').in('id', providerIds),
        supabase.from('portfolio_images').select('*').in('provider_id', providerIds),
        supabase.from('reviews').select('provider_id, rating').in('provider_id', providerIds),
        supabase.from('lga_centers').select('lga_id, lga_name, state_name'),
      ]);

      const profiles = profilesRes.data ?? [];
      const portfolioImages = portfolioRes.data ?? [];
      const allReviews = reviewsRes.data ?? [];
      const allLgas = lgaDataRes.data ?? [];

      const lgaLookup = new Map<number, { lga_name: string; state_name: string }>();
      allLgas.forEach(lga => lgaLookup.set(lga.lga_id, { lga_name: lga.lga_name, state_name: lga.state_name }));

      const enrichedProfiles = profiles.map(p => {
        if (p.lga_id != null) {
          const lgaData = lgaLookup.get(p.lga_id);
          if (lgaData) return { ...p, lga_name: lgaData.lga_name, state_name: lgaData.state_name };
        }
        return p;
      });

      const reviewsMap = new Map<string, { sum: number; count: number }>();
      allReviews.forEach(r => {
        const curr = reviewsMap.get(r.provider_id) || { sum: 0, count: 0 };
        curr.sum += r.rating; curr.count += 1;
        reviewsMap.set(r.provider_id, curr);
      });

      let distancesMap: Record<string, number> = {};
      if (userLat && userLng) {
        const { data: distances, error: rpcError } = await supabase.rpc('get_provider_distances', { user_lat: userLat, user_lng: userLng, provider_ids: providerIds });
        if (!rpcError && distances) distances.forEach((d: any) => { distancesMap[d.provider_id] = d.distance_meters; });
      }

      let lastSignInMap: Record<string, string | null> = {};
      if (providerIds.length > 0) {
        const { data: signInData, error: signInError } = await supabase.rpc('get_users_last_sign_in', { user_ids: providerIds });
        if (!signInError && signInData) signInData.forEach((row: any) => { lastSignInMap[row.user_id] = row.last_sign_in_at; });
      }

      const providersWithDetails = providers.map(provider => {
        const providerProfile = enrichedProfiles.find(p => p.id === provider.id) ?? ({} as ProfileRow);
        const images = portfolioImages.filter(img => img.provider_id === provider.id) ?? [];
        const distanceMeters = distancesMap[provider.id];
        const distance = distanceMeters ? distanceMeters / 1000 : undefined;
        const reviewStats = reviewsMap.get(provider.id);
        const avgRating = reviewStats ? reviewStats.sum / reviewStats.count : 0;
        const reviewCount = reviewStats?.count || 0;
        const lastSignInAt = lastSignInMap[provider.id] ?? null;
        return { ...provider, profile: providerProfile, portfolio_images: images, distance, average_rating: avgRating, review_count: reviewCount, lastSignInAt } as ProviderWithProfile;
      });

      if (smartSortData && smartSortData.length > 0) {
        const scoreMap = new Map(smartSortData.map(s => [s.provider_id, s.score]));
        providersWithDetails.sort((a, b) => (scoreMap.get(b.id) || 0) - (scoreMap.get(a.id) || 0));
      }
      return providersWithDetails;
    },
    enabled: true,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    const channel = supabase.channel('providers-status')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'providers' }, () => queryClient.invalidateQueries({ queryKey: ['featured-providers'] }))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  const handleLocationSelect = (type: 'state' | 'lga', id: string, label: string) => {
    const params = new URLSearchParams(searchParams);
    if (type === 'state') { params.set('state', id); params.delete('lga'); setLocationLabel(label); }
    else { params.set('lga', id); setLocationLabel(label); }
    setSearchParams(params); setShowLocationDropdown(false); autoLocationApplied.current = true;
  };

  const clearLocation = () => { setSearchParams({}); setLocationLabel('All Nigeria'); setShowLocationDropdown(false); autoLocationApplied.current = true; };

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    const query = searchInputRef.current?.value.trim();
    navigate(query ? `/search?q=${encodeURIComponent(query)}` : '/search');
  };

  const locationName = lgaFilter ? locationLabel.split(',')[0]?.trim() || locationLabel : stateFilter ? locationLabel : '';

  const NoProvidersBanner = () => (
    <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl p-6 md:p-8 text-center border-2 border-dashed border-primary-300">
      <img src="/logo.png" alt="Nimart" className="h-12 w-auto mx-auto mb-4" width={48} height={48} />
      <h3 className="text-lg md:text-xl font-bold text-primary-800 mb-2">
        {lgaFilter || stateFilter ? `No Provider in ${locationName} for now` : "Be the First Provider in This Area!"}
      </h3>
      <p className="text-primary-700 mb-1">{lgaFilter || stateFilter ? `Be the First Provider in ${locationName}` : "Get ₦1,000 when you register as the first provider in your LGA."}</p>
      <p className="text-primary-700 mb-4 text-sm md:text-base">Get <span className="font-bold text-xl md:text-2xl">₦1,000</span> when you register as the first provider in your LGA.</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link to="/auth/signup?role=provider" className="inline-block bg-primary-600 text-white px-6 md:px-8 py-2.5 md:py-3 rounded-lg font-medium hover:bg-primary-700 transition">Claim ₦1,000 Now →</Link>
        <button onClick={() => clearLocation()} className="inline-block bg-white text-primary-600 border border-primary-300 px-6 md:px-8 py-2.5 md:py-3 rounded-lg font-medium hover:bg-primary-50 transition">View All Nigeria 🇳🇬</button>
      </div>
      <p className="text-xs text-primary-600 mt-3 md:mt-4">Limited to first 10 providers per area. Terms apply.</p>
    </div>
  );

  const OfflineBanner = () => (
    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center mb-4">
      <WifiOff className="h-12 w-12 text-yellow-600 mx-auto mb-3" />
      <h3 className="font-semibold text-gray-900 mb-1">You're offline</h3>
      <p className="text-gray-600 text-sm">Connect to the internet to load the latest providers.</p>
      <p className="text-gray-500 text-xs mt-2">Previously loaded providers may still be visible below.</p>
    </div>
  );

  return (
    <>
      <SEO
        title="Nimart - Nigeria's Trusted Service Marketplace"
        description="Connect with verified professionals across Nigeria. Book trusted services for home, auto, beauty, and more."
        url="https://nimart.ng"
        schema={[homeSchema, siteNavSchema]}
        breadcrumbs={[{ label: 'Home', to: '/' }]}
      />

      <section className="w-full bg-gray-50 py-6 md:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-base md:text-lg text-[#008751] text-center mb-4 font-medium">Connect with professionals near you</p>
          <div className="bg-white/80 backdrop-blur-md rounded-lg shadow-sm border border-gray-200/50 p-4 max-w-3xl mx-auto">
            <div className="flex flex-row justify-center md:justify-start gap-3">
              <div className="relative flex-1 md:w-auto">
                <button ref={locationButtonRef} onClick={() => setShowLocationDropdown(!showLocationDropdown)} className="w-full bg-white text-[#008751] border border-[#008751]/30 rounded-lg px-3 md:px-4 py-3 flex items-center justify-between gap-1 md:gap-2 hover:bg-green-50 transition">
                  <div className="flex items-center gap-1 md:gap-2"><MapPin className="h-5 w-5 flex-shrink-0" /><span className="truncate">{locationLabel}</span></div><ChevronDown className="h-4 w-4 flex-shrink-0" />
                </button>
                {showLocationDropdown && <LocationDropdown onSelectState={(id, name) => handleLocationSelect('state', id, name)} onSelectLga={(id, name) => handleLocationSelect('lga', id, `${name} LGA`)} onClear={clearLocation} onClose={() => setShowLocationDropdown(false)} preloadedStates={states} preloadedLgas={preloadedLgas} triggerRef={locationButtonRef} />}
              </div>
              <form onSubmit={handleSearch} className="flex bg-white rounded-lg overflow-hidden flex-1 md:flex-1 border border-[#008751]/30">
                <div className="hidden md:flex items-center pl-3"><Search className="h-5 w-5 text-[#008751]" /></div>
                <input ref={searchInputRef} type="text" placeholder="I am looking for..." className="w-full px-3 py-3 text-gray-900 focus:outline-none text-sm md:text-base" />
                <button type="submit" className="bg-[#008751] hover:bg-green-700 text-white px-3 md:px-6 transition flex items-center justify-center"><Search className="h-5 w-5" /><span className="hidden md:inline ml-2">Search</span></button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="hidden md:flex gap-6">
          <div className="w-64 flex-shrink-0 self-start"><CategorySidebar providerCounts={providerCounts} subcategoryCounts={subcategoryCounts} /></div>
          <div className="flex-1">
            <QuickLinksBanner onFindProviders={() => setRadarOpen(true)} /><TopProvidersSlider />
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">{lgaFilter ? `Providers in ${locationName}` : stateFilter ? `Providers in ${locationName}` : 'Recommended Providers'}</h2>
              <div className="flex items-center gap-2">
                <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                  <button onClick={() => setViewMode('grid')} className={cn('p-2 text-gray-500 hover:text-primary-600', viewMode === 'grid' && 'bg-primary-50 text-primary-600')} title="Grid view"><LayoutGrid className="h-5 w-5" /></button>
                  <button onClick={() => setViewMode('list')} className={cn('p-2 text-gray-500 hover:text-primary-600', viewMode === 'list' && 'bg-primary-50 text-primary-600')} title="List view"><List className="h-5 w-5" /></button>
                </div>
                <Link to="/search" className="text-primary-600 hover:text-primary-700 text-sm font-medium">View all →</Link>
              </div>
            </div>
            {isOffline && <OfflineBanner />}
            {isLoading ? <ProviderGridSkeleton /> : (
              featuredProviders?.length === 0 && !isOffline ? <NoProvidersBanner /> :
              featuredProviders && featuredProviders.length > 0 && (
                viewMode === 'grid' ? (
                  <div className="columns-2 sm:columns-3 lg:columns-3 xl:columns-3 gap-4 pr-2">
                    {featuredProviders.map((provider, index) => (
                      <div key={provider.id} className="mb-4 break-inside-avoid">
                        <ProviderCardPortrait provider={provider} imageLoading={index === 0 ? 'eager' : 'lazy'} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {featuredProviders.map((provider) => <ProviderCardHorizontal key={provider.id} provider={provider} />)}
                  </div>
                )
              )
            )}
          </div>
        </div>

        <div className="block md:hidden">
          <QuickLinksBanner onFindProviders={() => setRadarOpen(true)} /><TopProvidersSlider />
          <div className="mb-4 px-4"><CategoryButtons providerCounts={providerCounts} subcategoryCounts={subcategoryCounts} /></div>
          <section>
            <div className="flex items-center justify-between mb-3 px-4">
              <h2 className="text-lg font-bold text-gray-900">{lgaFilter ? `Providers in ${locationName}` : stateFilter ? `Providers in ${locationName}` : 'Recommended'}</h2>
              <div className="flex items-center gap-2">
                <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                  <button onClick={() => setViewMode('grid')} className={cn('p-2', viewMode === 'grid' && 'bg-primary-50 text-primary-600')} title="Grid view"><LayoutGrid className="h-4 w-4" /></button>
                  <button onClick={() => setViewMode('list')} className={cn('p-2', viewMode === 'list' && 'bg-primary-50 text-primary-600')} title="List view"><List className="h-4 w-4" /></button>
                </div>
                <Link to="/search" className="text-xs text-primary-600 font-medium">View all →</Link>
              </div>
            </div>
            {isOffline && <OfflineBanner />}
            {isLoading ? <ProviderGridSkeleton /> : (
              featuredProviders?.length === 0 && !isOffline ? <NoProvidersBanner /> :
              featuredProviders && featuredProviders.length > 0 && (
                viewMode === 'grid' ? (
                  <div className="columns-2 gap-2">
                    {featuredProviders.map((provider, index) => (
                      <div key={provider.id} className="mb-2 break-inside-avoid">
                        <ProviderCardPortrait provider={provider} imageLoading={index === 0 ? 'eager' : 'lazy'} className="shadow-sm rounded-lg" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 px-4">
                    {featuredProviders.map((provider) => <ProviderCardHorizontal key={provider.id} provider={provider} />)}
                  </div>
                )
              )
            )}
          </section>
        </div>
      </div>
      <FindProvidersRadar isOpen={radarOpen} onClose={() => setRadarOpen(false)} userLat={userLat ?? null} userLng={userLng ?? null} />
    </>
  );
}