// lib/map-types.ts - CORRECTED VERSION
export interface MapProvider {
    id: string;
    business_name: string;
    service_type: string;
    rating: number;
    total_reviews: number;
    profile_picture_url: string | null;
    latitude: number;
    longitude: number;
    state_id: string;
    lga_id: string;
    states: { name: string }[] | null;
    lgas: { name: string }[] | null;
    years_experience: number;
    is_verified: boolean;
    verification_status: 'pending_email' | 'unverified' | 'pending' | 'verified' | 'demo';
    created_at: string;
    bio: string;
    phone: string;
    total_bookings: number;
    response_time: string | null;
    city: string;
    response_rate: number | null;
    is_online: boolean;
    map_visibility?: boolean;
    distance_km?: number;
  }
  
  export interface ProviderMarker {
    id: string;
    lat: number;
    lng: number;
    business_name: string;
    service_type: string;
    rating: number;
    profile_picture_url: string | null;
    is_verified: boolean;
    verification_status: string;
    is_online: boolean;
    distance_km?: number;
  }
  
  export interface MapLocation {
    lat: number;
    lng: number;
    zoom?: number;
  }
  
  export interface MapBounds {
    north: number;
    south: number;
    east: number;
    west: number;
  }
  
  export interface NigerianState {
    name: string;
    capital: string;
    lat: number;
    lng: number;
  }
  
  export interface NigerianCity {
    name: string;
    state: string;
    lat: number;
    lng: number;
    population_category: 'small' | 'medium' | 'large' | 'mega';
    is_commercial_hub: boolean;
  }
  
  export interface MapSettings {
    default_nigeria_center: MapLocation;
    nigeria_bounds: MapBounds;
    provider_markers: {
      verified_size: number;
      unverified_size: number;
      cluster_radius: number;
    };
    map_tiles: {
      url: string;
      attribution: string;
    };
    mobile_settings: {
      initial_zoom: number;
      max_zoom: number;
      min_zoom: number;
    };
    desktop_settings: {
      initial_zoom: number;
      max_zoom: number;
      min_zoom: number;
    };
  }
  
  export const NIGERIA_DEFAULT_CENTER: MapLocation = {
    lat: 9.0765,
    lng: 7.3986,
    zoom: 6
  };
  
  export const NIGERIA_BOUNDS: MapBounds = {
    north: 13.9,
    south: 4.0,
    east: 14.7,
    west: 2.7
  };
  
  export const NIGERIAN_MAJOR_CITIES: NigerianCity[] = [
    { name: 'Lagos', state: 'Lagos', lat: 6.5244, lng: 3.3792, population_category: 'mega', is_commercial_hub: true },
    { name: 'Abuja', state: 'FCT', lat: 9.0765, lng: 7.3986, population_category: 'large', is_commercial_hub: true },
    { name: 'Kano', state: 'Kano', lat: 12.0022, lng: 8.5927, population_category: 'mega', is_commercial_hub: true },
    { name: 'Ibadan', state: 'Oyo', lat: 7.3775, lng: 3.9470, population_category: 'large', is_commercial_hub: true },
    { name: 'Port Harcourt', state: 'Rivers', lat: 4.8156, lng: 7.0498, population_category: 'large', is_commercial_hub: true },
    { name: 'Benin City', state: 'Edo', lat: 6.3176, lng: 5.6145, population_category: 'medium', is_commercial_hub: true },
    { name: 'Aba', state: 'Abia', lat: 5.1167, lng: 7.3667, population_category: 'medium', is_commercial_hub: true },
    { name: 'Onitsha', state: 'Anambra', lat: 6.1667, lng: 6.7833, population_category: 'medium', is_commercial_hub: true },
    { name: 'Warri', state: 'Delta', lat: 5.5167, lng: 5.7500, population_category: 'medium', is_commercial_hub: true },
  ];
  
  export const MAP_CONFIG = {
    tileUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    tileAttribution: '© OpenStreetMap contributors',
    maxZoom: 19,
    minZoom: 5,
    clusterRadius: 60,
    maxClusterZoom: 14,
  };
  
  export const MARKER_COLORS = {
    verified: '#10b981',
    pending: '#3b82f6',
    unverified: '#f59e0b',
    demo: '#6b7280',
  };
  
  export const MARKER_SIZES = {
    verified: 40,
    pending: 35,
    unverified: 30,
    demo: 25,
  };
  
  export const NIGERIAN_STATES: NigerianState[] = [
    { name: 'Abia', capital: 'Umuahia', lat: 5.5333, lng: 7.4833 },
    { name: 'Adamawa', capital: 'Yola', lat: 9.2300, lng: 12.4800 },
    { name: 'Akwa Ibom', capital: 'Uyo', lat: 5.0333, lng: 7.9167 },
    { name: 'Anambra', capital: 'Awka', lat: 6.2100, lng: 7.0700 },
    { name: 'Bauchi', capital: 'Bauchi', lat: 10.3100, lng: 9.8400 },
    { name: 'Bayelsa', capital: 'Yenagoa', lat: 4.9267, lng: 6.2676 },
    { name: 'Benue', capital: 'Makurdi', lat: 7.7300, lng: 8.5400 },
    { name: 'Borno', capital: 'Maiduguri', lat: 11.8333, lng: 13.1500 },
    { name: 'Cross River', capital: 'Calabar', lat: 4.9500, lng: 8.3250 },
    { name: 'Delta', capital: 'Asaba', lat: 6.2000, lng: 6.7300 },
    { name: 'Ebonyi', capital: 'Abakaliki', lat: 6.3249, lng: 8.1137 },
    { name: 'Edo', capital: 'Benin City', lat: 6.3176, lng: 5.6145 },
    { name: 'Ekiti', capital: 'Ado-Ekiti', lat: 7.6167, lng: 5.2167 },
    { name: 'Enugu', capital: 'Enugu', lat: 6.4500, lng: 7.5000 },
    { name: 'FCT', capital: 'Abuja', lat: 9.0765, lng: 7.3986 },
    { name: 'Gombe', capital: 'Gombe', lat: 10.2897, lng: 11.1711 },
    { name: 'Imo', capital: 'Owerri', lat: 5.4833, lng: 7.0333 },
    { name: 'Jigawa', capital: 'Dutse', lat: 11.7592, lng: 9.3389 },
    { name: 'Kaduna', capital: 'Kaduna', lat: 10.5264, lng: 7.4388 },
    { name: 'Kano', capital: 'Kano', lat: 12.0000, lng: 8.5167 },
    { name: 'Katsina', capital: 'Katsina', lat: 12.9889, lng: 7.6000 },
    { name: 'Kebbi', capital: 'Birnin Kebbi', lat: 12.4539, lng: 4.1975 },
    { name: 'Kogi', capital: 'Lokoja', lat: 7.8022, lng: 6.7333 },
    { name: 'Kwara', capital: 'Ilorin', lat: 8.5000, lng: 4.5500 },
    { name: 'Lagos', capital: 'Ikeja', lat: 6.6000, lng: 3.3500 },
    { name: 'Nasarawa', capital: 'Lafia', lat: 8.4900, lng: 8.5200 },
    { name: 'Niger', capital: 'Minna', lat: 9.6139, lng: 6.5569 },
    { name: 'Ogun', capital: 'Abeokuta', lat: 7.1500, lng: 3.3500 },
    { name: 'Ondo', capital: 'Akure', lat: 7.2500, lng: 5.1950 },
    { name: 'Osun', capital: 'Oshogbo', lat: 7.7667, lng: 4.5667 },
    { name: 'Oyo', capital: 'Ibadan', lat: 7.3964, lng: 3.9167 },
    { name: 'Plateau', capital: 'Jos', lat: 9.9300, lng: 8.8900 },
    { name: 'Rivers', capital: 'Port Harcourt', lat: 4.8100, lng: 7.0100 },
    { name: 'Sokoto', capital: 'Sokoto', lat: 13.0622, lng: 5.2339 },
    { name: 'Taraba', capital: 'Jalingo', lat: 8.9000, lng: 11.3667 },
    { name: 'Yobe', capital: 'Damaturu', lat: 11.9667, lng: 11.7000 },
    { name: 'Zamfara', capital: 'Gusau', lat: 12.1642, lng: 6.6667 }
  ];