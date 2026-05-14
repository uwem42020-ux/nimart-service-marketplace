// src/pages/ServiceLocationPage.tsx
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { ProviderCardPortrait } from '../components/provider/ProviderCardPortrait';
import { SEO } from '../components/common/SEO';
import { NimartSpinner } from '../components/common/NimartSpinner';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { calculateDistance } from '../lib/distance';
import { useAuth } from '../contexts/AuthContext';
import type { Database } from '../types/database';

type ProviderRow = Database['public']['Tables']['providers']['Row'];
type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type PortfolioImageRow = Database['public']['Tables']['portfolio_images']['Row'];

interface ProviderWithProfile extends ProviderRow {
  profile: ProfileRow;
  portfolio_images: PortfolioImageRow[];
  distance?: number;
  average_rating?: number;
  review_count?: number;
  lastSignInAt?: string | null;
}

export default function ServiceLocationPage() {
  const { categorySlug, lgaId } = useParams<{ categorySlug: string; lgaId: string }>();
  const { profile } = useAuth();

  // ---- Meta data (category name, LGA name, state) ----
  const { data: meta } = useQuery({
    queryKey: ['service-location-meta', categorySlug, lgaId],
    queryFn: async () => {
      const { data: cat } = await supabase
        .from('categories')
        .select('name')
        .eq('slug', categorySlug)
        .maybeSingle();

      const { data: lga } = await supabase
        .from('lga_centers')
        .select('lga_name, state_name')
        .eq('lga_id', parseInt(lgaId || '0'))
        .maybeSingle();

      return {
        categoryName: cat?.name || (categorySlug ? categorySlug.replace(/-/g, ' ') : 'Service'),
        lgaName: lga?.lga_name || 'this area',
        stateName: lga?.state_name || '',
      };
    },
    enabled: !!categorySlug && !!lgaId,
  });

  const pageCategoryName = meta?.categoryName || 'Service';
  const pageLgaName = meta?.lgaName || 'your area';
  const pageStateName = meta?.stateName || 'Nigeria';

  // ---- Providers in this category + LGA ----
  const { data: providers, isLoading } = useQuery({
    queryKey: ['service-location-providers', categorySlug, lgaId],
    queryFn: async () => {
      if (!categorySlug || !lgaId) return [];

      // Step 1: find profiles with this LGA
      const { data: profilesInLga } = await supabase
        .from('profiles')
        .select('id')
        .eq('lga_id', parseInt(lgaId));

      if (!profilesInLga || profilesInLga.length === 0) return [];

      const providerIdsInLga = profilesInLga.map(p => p.id);

      // Step 2: fetch providers in those ids AND matching category slug
      const { data: providers } = await supabase
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
          boost_until,
          top_placement_until
        `)
        .eq('selected_category_slug', categorySlug)
        .in('id', providerIdsInLga)
        .eq('is_available', true)
        .order('boost_until', { ascending: false, nullsFirst: false })
        .order('status', { ascending: true })
        .limit(30);

      if (!providers || providers.length === 0) return [];

      const ids = providers.map(p => p.id);

      const [profilesRes, portfolioRes] = await Promise.all([
        supabase.from('profiles').select('*').in('id', ids),
        supabase.from('portfolio_images').select('*').in('provider_id', ids),
      ]);

      const profiles = profilesRes.data ?? [];
      const images = portfolioRes.data ?? [];

      const userLat = profile?.lat;
      const userLng = profile?.lng;

      return providers.map(provider => {
        const p = profiles.find(pr => pr.id === provider.id) ?? ({} as ProfileRow);
        const imgs = images.filter(img => img.provider_id === provider.id);
        const distance = (userLat && userLng && p.lat && p.lng)
          ? calculateDistance(userLat, userLng, p.lat, p.lng)
          : undefined;
        return {
          ...provider,
          profile: p,
          portfolio_images: imgs,
          distance,
          average_rating: 0,
          review_count: 0,
        } as ProviderWithProfile;
      });
    },
    enabled: !!categorySlug && !!lgaId,
  });

  // ---- Breadcrumbs ----
  const breadcrumbItems = [
    { label: 'Home', to: '/' },
    { label: pageCategoryName, to: `/search?category=${categorySlug}` },
    { label: pageLgaName },
  ];

  // ---- Page title & description ----
  const title = `${pageCategoryName} in ${pageLgaName}, ${pageStateName} – Nimart`;
  const description = `Find trusted ${pageCategoryName.toLowerCase()} in ${pageLgaName}, ${pageStateName}. Compare ratings, view profiles, and book directly on Nimart.`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SEO
        title={title}
        description={description}
        url={`https://nimart.ng/services/${categorySlug}/in/${lgaId}`}
      />

      {/* Breadcrumb navigation */}
      <Breadcrumbs items={breadcrumbItems} />

      <h1 className="text-2xl font-bold text-gray-900 mb-6">{title}</h1>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <NimartSpinner size="lg" />
        </div>
      ) : providers?.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border">
          <p className="text-gray-500">
            No {pageCategoryName.toLowerCase()} found in {pageLgaName}.
          </p>
          <Link to="/search" className="mt-2 inline-block text-primary-600 hover:underline">
            Browse all providers
          </Link>
        </div>
      ) : (
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
          {providers!.map(provider => (
            <div key={provider.id} className="mb-4 break-inside-avoid">
              <ProviderCardPortrait provider={provider} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}