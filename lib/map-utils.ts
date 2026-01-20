import { MapProvider, ProviderMarker, MapLocation, NIGERIA_BOUNDS } from './map-types';

// Calculate distance between two points using Haversine formula
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100; // Distance in km with 2 decimals
}

// Format distance for display
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) return '< 1 km away';
  if (distanceKm < 10) return `${distanceKm.toFixed(1)} km away`;
  if (distanceKm < 100) return `${Math.round(distanceKm)} km away`;
  return `~${Math.round(distanceKm)} km away`;
}

// Convert providers to map markers
export function providersToMarkers(
  providers: MapProvider[],
  userLocation?: MapLocation
): ProviderMarker[] {
  return providers
    .filter(provider => provider.latitude && provider.longitude)
    .map(provider => {
      let distance_km: number | undefined;
      
      if (userLocation) {
        distance_km = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          provider.latitude,
          provider.longitude
        );
      }
      
      return {
        id: provider.id,
        lat: provider.latitude,
        lng: provider.longitude,
        business_name: provider.business_name,
        service_type: provider.service_type,
        rating: provider.rating || 0,
        profile_picture_url: provider.profile_picture_url,
        is_verified: provider.is_verified,
        verification_status: provider.verification_status,
        is_online: provider.is_online || false,
        distance_km
      };
    });
}

// Check if coordinates are within Nigeria
export function isWithinNigeria(lat: number, lng: number): boolean {
  return (
    lat >= NIGERIA_BOUNDS.south &&
    lat <= NIGERIA_BOUNDS.north &&
    lng >= NIGERIA_BOUNDS.west &&
    lng <= NIGERIA_BOUNDS.east
  );
}

// Get appropriate zoom level based on device
export function getInitialZoomLevel(isMobile: boolean): number {
  return isMobile ? 10 : 7;
}

// Get marker color based on verification status
export function getMarkerColor(status: string): string {
  const { verified, pending, unverified, demo } = require('./map-types').MARKER_COLORS;
  
  switch (status) {
    case 'verified': return verified;
    case 'pending': return pending;
    case 'unverified': return unverified;
    case 'demo': return demo;
    default: return unverified;
  }
}

// Get marker size based on verification status
export function getMarkerSize(status: string): number {
  const { verified, pending, unverified, demo } = require('./map-types').MARKER_SIZES;
  
  switch (status) {
    case 'verified': return verified;
    case 'pending': return pending;
    case 'unverified': return unverified;
    case 'demo': return demo;
    default: return unverified;
  }
}

// Create custom marker HTML
export function createMarkerHTML(
  profilePictureUrl: string | null,
  businessName: string,
  status: string,
  size: number = 40
): string {
  const color = getMarkerColor(status);
  const borderSize = status === 'verified' ? 3 : 2;
  
  let imageSrc = profilePictureUrl;
  if (!imageSrc) {
    // Create SVG avatar with business name initial
    const initial = businessName.charAt(0).toUpperCase();
    imageSrc = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><rect width="100%" height="100%" fill="${color}"/><text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size * 0.5}" fill="white" text-anchor="middle" dy=".3em">${initial}</text></svg>`;
  }
  
  return `
    <div style="
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      border: ${borderSize}px solid ${color};
      background: white;
      overflow: hidden;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <img 
        src="${imageSrc}" 
        alt="${businessName}"
        style="
          width: 100%;
          height: 100%;
          object-fit: cover;
        "
        onerror="this.src='data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"${size}\" height=\"${size}\" viewBox=\"0 0 ${size} ${size}\"><rect width=\"100%\" height=\"100%\" fill=\"%236b7280\"/><text x=\"50%\" y=\"50%\" font-family=\"Arial, sans-serif\" font-size=\"${size * 0.5}\" fill=\"white\" text-anchor=\"middle\" dy=\".3em\">${businessName.charAt(0).toUpperCase()}</text></svg>';"
      />
    </div>
  `;
}

// Get Nigerian state by coordinates
export function getNigerianStateByCoordinates(lat: number, lng: number): string | null {
  const { NIGERIAN_STATES } = require('./map-types');
  
  // Simple check - find nearest state capital
  let closestState: string | null = null;
  let closestDistance = Infinity;
  
  for (const state of NIGERIAN_STATES) {
    const distance = calculateDistance(lat, lng, state.lat, state.lng);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestState = state.name;
    }
  }
  
  return closestState;
}

// Generate popup content for provider
export function generatePopupContent(marker: ProviderMarker): string {
  return `
    <div style="padding: 8px; min-width: 200px;">
      <div style="display: flex; align-items: center; margin-bottom: 8px;">
        <div style="width: 40px; height: 40px; border-radius: 50%; overflow: hidden; margin-right: 12px;">
          <img 
            src="${marker.profile_picture_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(marker.business_name)}&background=008751&color=fff&size=80`}" 
            alt="${marker.business_name}"
            style="width: 100%; height: 100%; object-fit: cover;"
          />
        </div>
        <div>
          <strong style="font-size: 14px; color: #111827;">${marker.business_name}</strong>
          <div style="font-size: 12px; color: #6b7280; margin-top: 2px;">
            ${marker.service_type}
          </div>
        </div>
      </div>
      
      <div style="margin-bottom: 8px;">
        <div style="display: flex; align-items: center; font-size: 12px; color: #6b7280;">
          <span style="margin-right: 8px;">⭐ ${marker.rating.toFixed(1)}</span>
          ${
            marker.is_verified 
              ? '<span style="background: #10b981; color: white; padding: 2px 6px; border-radius: 10px; font-size: 10px;">Verified</span>'
              : '<span style="background: #f59e0b; color: white; padding: 2px 6px; border-radius: 10px; font-size: 10px;">Unverified</span>'
          }
          ${
            marker.is_online
              ? '<span style="background: #3b82f6; color: white; padding: 2px 6px; border-radius: 10px; font-size: 10px; margin-left: 4px;">Online</span>'
              : ''
          }
        </div>
      </div>
      
      ${
        marker.distance_km !== undefined
          ? `<div style="font-size: 12px; color: #374151; margin-bottom: 8px;">
              📍 ${formatDistance(marker.distance_km)}
            </div>`
          : ''
      }
      
      <a 
        href="/providers/${marker.id}"
        style="
          display: block;
          text-align: center;
          background: #008751;
          color: white;
          padding: 6px 12px;
          border-radius: 6px;
          text-decoration: none;
          font-size: 12px;
          font-weight: 500;
          margin-top: 8px;
        "
        onMouseOver="this.style.backgroundColor='#006e41'"
        onMouseOut="this.style.backgroundColor='#008751'"
      >
        View Profile
      </a>
    </div>
  `;
}

// Filter providers by distance
export function filterProvidersByDistance(
  providers: MapProvider[],
  userLocation: MapLocation,
  maxDistanceKm: number = 100
): MapProvider[] {
  return providers.filter(provider => {
    if (!provider.latitude || !provider.longitude) return false;
    
    const distance = calculateDistance(
      userLocation.lat,
      userLocation.lng,
      provider.latitude,
      provider.longitude
    );
    
    return distance <= maxDistanceKm;
  });
}

// Sort providers by distance
export function sortProvidersByDistance(
  providers: MapProvider[],
  userLocation: MapLocation
): MapProvider[] {
  return providers
    .filter(provider => provider.latitude && provider.longitude)
    .sort((a, b) => {
      const distanceA = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        a.latitude!,
        a.longitude!
      );
      const distanceB = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        b.latitude!,
        b.longitude!
      );
      return distanceA - distanceB;
    });
}

// Calculate map bounds to fit all markers
export function calculateMapBounds(markers: ProviderMarker[]): [number, number][] {
  if (markers.length === 0) {
    return [
      [NIGERIA_BOUNDS.south, NIGERIA_BOUNDS.west],
      [NIGERIA_BOUNDS.north, NIGERIA_BOUNDS.east]
    ];
  }
  
  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLng = Infinity;
  let maxLng = -Infinity;
  
  markers.forEach(marker => {
    minLat = Math.min(minLat, marker.lat);
    maxLat = Math.max(maxLat, marker.lat);
    minLng = Math.min(minLng, marker.lng);
    maxLng = Math.max(maxLng, marker.lng);
  });
  
  // Add some padding
  const padding = 0.1;
  minLat -= padding;
  maxLat += padding;
  minLng -= padding;
  maxLng += padding;
  
  // Ensure within Nigeria bounds
  minLat = Math.max(minLat, NIGERIA_BOUNDS.south);
  maxLat = Math.min(maxLat, NIGERIA_BOUNDS.north);
  minLng = Math.max(minLng, NIGERIA_BOUNDS.west);
  maxLng = Math.min(maxLng, NIGERIA_BOUNDS.east);
  
  return [
    [minLat, minLng],
    [maxLat, maxLng]
  ];
}