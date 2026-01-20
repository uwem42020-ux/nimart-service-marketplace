import { supabase } from './supabase';
import { MapProvider, MapLocation } from './map-types';

// Get providers with locations for map
export async function getMapProviders(
  userLocation?: MapLocation,
  radiusKm: number = 100,
  serviceType?: string
): Promise<MapProvider[]> {
  try {
    let query = supabase
      .from('providers')
      .select(`
        *,
        states (name),
        lgas (name)
      `)
      .eq('is_active', true)
      .not('latitude', 'is', null)
      .not('longitude', 'is', null)
      .eq('map_visibility', true)
      .not('verification_status', 'in', '("pending_email","demo")')
      .limit(200);
    
    if (serviceType) {
      query = query.ilike('service_type', `%${serviceType}%`);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching map providers:', error);
      throw error;
    }
    
    // Convert to MapProvider type
    const providers: MapProvider[] = (data || []).map((provider: any) => ({
      id: provider.id,
      business_name: provider.business_name || 'Provider',
      service_type: provider.service_type || 'Service',
      rating: provider.rating || 0,
      total_reviews: provider.total_reviews || 0,
      profile_picture_url: provider.profile_picture_url || null,
      latitude: provider.latitude,
      longitude: provider.longitude,
      state_id: provider.state_id,
      lga_id: provider.lga_id,
      states: provider.states ? [{ name: provider.states.name }] : null,
      lgas: provider.lgas ? [{ name: provider.lgas.name }] : null,
      years_experience: provider.years_experience || 0,
      is_verified: provider.is_verified || false,
      verification_status: provider.verification_status || 'unverified',
      created_at: provider.created_at,
      bio: provider.bio || '',
      phone: provider.phone || '',
      total_bookings: provider.total_bookings || 0,
      response_time: provider.response_time,
      city: provider.city || '',
      response_rate: provider.response_rate,
      is_online: provider.is_online || false,
      map_visibility: provider.map_visibility !== false
    }));
    
    // If user location provided, calculate distances
    if (userLocation) {
      return providers.map(provider => {
        if (provider.latitude && provider.longitude) {
          const distance = calculateDistance(
            userLocation.lat,
            userLocation.lng,
            provider.latitude,
            provider.longitude
          );
          return { ...provider, distance_km: distance };
        }
        return provider;
      });
    }
    
    return providers;
    
  } catch (error) {
    console.error('Error in getMapProviders:', error);
    return [];
  }
}

// Helper function for distance calculation
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100;
}

// Get nearby providers using RPC function
export async function getNearbyProviders(
  userLat: number,
  userLng: number,
  radiusKm: number = 50,
  maxResults: number = 50
): Promise<MapProvider[]> {
  try {
    const { data, error } = await supabase
      .rpc('get_nearby_providers', {
        user_lat: userLat,
        user_lng: userLng,
        radius_km: radiusKm,
        max_results: maxResults
      });
    
    if (error) {
      console.error('RPC Error getting nearby providers:', error);
      return await getMapProviders({ lat: userLat, lng: userLng }, radiusKm);
    }
    
    return (data || []).map((item: any) => ({
      id: item.id,
      business_name: item.business_name,
      service_type: item.service_type,
      rating: item.rating,
      total_reviews: 0, // RPC doesn't return this
      profile_picture_url: item.profile_picture_url,
      latitude: item.latitude,
      longitude: item.longitude,
      state_id: '',
      lga_id: '',
      states: null,
      lgas: null,
      years_experience: 0,
      is_verified: item.is_verified,
      verification_status: item.verification_status,
      created_at: new Date().toISOString(),
      bio: '',
      phone: '',
      total_bookings: 0,
      response_time: null,
      city: '',
      response_rate: null,
      is_online: false,
      distance_km: item.distance_km
    }));
    
  } catch (error) {
    console.error('Error in getNearbyProviders:', error);
    return [];
  }
}

// Get providers for map using RPC function
export async function getProvidersForMapRPC(
  userLat?: number,
  userLng?: number,
  radiusKm: number = 100,
  serviceType?: string
): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .rpc('get_providers_for_map', {
        user_lat: userLat || null,
        user_lng: userLng || null,
        radius_km: radiusKm,
        service_type_filter: serviceType || null
      });
    
    if (error) {
      console.error('RPC Error getting providers for map:', error);
      return [];
    }
    
    return data || [];
    
  } catch (error) {
    console.error('Error in getProvidersForMapRPC:', error);
    return [];
  }
}

// Update provider location
export async function updateProviderLocation(
  providerId: string,
  latitude: number,
  longitude: number,
  updateReason: string = 'manual_update'
): Promise<boolean> {
  try {
    const { error } = await supabase
      .rpc('update_provider_location', {
        provider_id: providerId,
        new_latitude: latitude,
        new_longitude: longitude,
        update_reason: updateReason
      });
    
    if (error) {
      console.error('Error updating provider location:', error);
      
      // Fallback to direct update
      const { error: updateError } = await supabase
        .from('providers')
        .update({
          latitude,
          longitude,
          last_location_update: new Date().toISOString()
        })
        .eq('id', providerId);
      
      if (updateError) throw updateError;
    }
    
    return true;
    
  } catch (error) {
    console.error('Error in updateProviderLocation:', error);
    return false;
  }
}

// Get map settings from database
export async function getMapSettings(): Promise<any> {
  try {
    const { data, error } = await supabase
      .from('map_settings')
      .select('setting_key, setting_value')
      .in('setting_key', [
        'default_nigeria_center',
        'nigeria_bounds',
        'provider_markers',
        'map_tiles',
        'mobile_settings',
        'desktop_settings'
      ]);
    
    if (error) {
      console.error('Error fetching map settings:', error);
      return getDefaultMapSettings();
    }
    
    const settings: any = {};
    (data || []).forEach((item: any) => {
      settings[item.setting_key] = item.setting_value;
    });
    
    return {
      ...getDefaultMapSettings(),
      ...settings
    };
    
  } catch (error) {
    console.error('Error in getMapSettings:', error);
    return getDefaultMapSettings();
  }
}

// Default map settings fallback
function getDefaultMapSettings(): any {
  return {
    default_nigeria_center: { lat: 9.0765, lng: 7.3986, zoom: 6 },
    nigeria_bounds: { north: 13.9, south: 4.0, east: 14.7, west: 2.7 },
    provider_markers: { verified_size: 40, unverified_size: 30, cluster_radius: 60 },
    map_tiles: { 
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '© OpenStreetMap contributors'
    },
    mobile_settings: { initial_zoom: 10, max_zoom: 18, min_zoom: 6 },
    desktop_settings: { initial_zoom: 7, max_zoom: 19, min_zoom: 5 }
  };
}

// Get Nigerian states coordinates
export async function getNigerianStates(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('nigerian_states_coordinates')
      .select('*')
      .order('state_name');
    
    if (error) {
      console.error('Error fetching Nigerian states:', error);
      return [];
    }
    
    return data || [];
    
  } catch (error) {
    console.error('Error in getNigerianStates:', error);
    return [];
  }
}

// Get Nigerian major cities
export async function getNigerianMajorCities(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('nigerian_major_cities')
      .select('*')
      .order('city_name');
    
    if (error) {
      console.error('Error fetching Nigerian cities:', error);
      return [];
    }
    
    return data || [];
    
  } catch (error) {
    console.error('Error in getNigerianMajorCities:', error);
    return [];
  }
}

// Get map statistics
export async function getMapStatistics(): Promise<any> {
  try {
    const { data, error } = await supabase
      .from('map_statistics')
      .select('*')
      .single();
    
    if (error) {
      console.error('Error fetching map statistics:', error);
      return getDefaultMapStatistics();
    }
    
    return data || getDefaultMapStatistics();
    
  } catch (error) {
    console.error('Error in getMapStatistics:', error);
    return getDefaultMapStatistics();
  }
}

// Default map statistics fallback
function getDefaultMapStatistics(): any {
  return {
    total_providers: 0,
    providers_with_location: 0,
    verified_providers: 0,
    pending_verification: 0,
    online_now: 0,
    avg_providers_per_state: 0,
    state_with_most_providers: null
  };
}

// Toggle provider map visibility
export async function toggleProviderMapVisibility(
  providerId: string,
  isVisible: boolean
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('providers')
      .update({ map_visibility: isVisible })
      .eq('id', providerId);
    
    if (error) throw error;
    
    return true;
    
  } catch (error) {
    console.error('Error toggling map visibility:', error);
    return false;
  }
}