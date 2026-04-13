import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { calculateDistance } from '../../lib/distance';
import { useAuth } from '../../contexts/AuthContext';

const fetchProviders = async (lat?: number, lng?: number, filters?: any) => {
  let query = supabase
    .from('providers')
    .select(`
      *,
      profile:profiles(*),
      portfolio_images(*)
    `)
    .eq('is_available', true)
    .order('boost_until', { ascending: false, nullsFirst: false })
    .limit(20);

  const { data } = await query;

  if (!data) return [];

  if (lat && lng) {
    return data.map(provider => ({
      ...provider,
      distance: calculateDistance(lat, lng, provider.profile.lat, provider.profile.lng)
    })).sort((a, b) => a.distance - b.distance);
  }

  return data;
};