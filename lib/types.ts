// lib/types.ts - FIXED VERSION (just add the 3 missing fields)
export interface FastProvider {
  id: string;
  business_name: string;
  service_type: string;
  rating: number;
  total_reviews: number;
  profile_picture_url: string | null;
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
  
  // ADD THESE TWO FIELDS:
  latitude?: number | null;
  longitude?: number | null;
  
  // ADD THESE 3 CRITICAL FIELDS THAT ARE MISSING:
  user_id?: string;
  email?: string;
  hourly_rate?: number;
  
  // Optional: You might also want these commonly used fields
  address?: string;
  total_earnings?: number;
  is_active?: boolean;
}

// The rest of your types remain EXACTLY the same...
export interface ServiceCategory {
  id: string;
  name: string;
  icon: string | null;
  description: string | null;
  sort_order: number;
  provider_count?: number;
  color?: string;
  darkColor?: string;
}

export interface UserLocation {
  state: string | null;
  lga: string | null;
  coordinates: { latitude: number; longitude: number } | null;
  detected: boolean;
}

export interface State {
  id: string;
  name: string;
}

export interface LGA {
  id: string;
  name: string;
  state_id: string;
}

export interface SortOption {
  key: 'distance' | 'rating' | 'experience' | 'bookings' | 'response' | 'recent';
  label: string;
}

// Optional: You might also want these types for other parts of your app
export interface ProviderDocument {
  id: string;
  provider_id: string;
  document_type: 'id_card' | 'business_registration' | 'tax_certificate' | 'portfolio' | 'other';
  document_url: string;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  verified_by?: string;
  verified_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ProviderReview {
  id: string;
  provider_id: string;
  customer_id: string;
  rating: number;
  comment: string;
  created_at: string;
  customer_name?: string;
  customer_avatar?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'booking' | 'verification' | 'message' | 'system';
  read: boolean;
  data?: Record<string, any>;
  created_at: string;
}

export interface Booking {
  id: string;
  customer_id: string;
  provider_id: string;
  service_type: string;
  description: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  scheduled_date: string;
  scheduled_time: string;
  address: string;
  estimated_cost?: number;
  final_cost?: number;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  read: boolean;
  created_at: string;
  sender_name?: string;
  receiver_name?: string;
  sender_avatar?: string;
  receiver_avatar?: string;
}

// Auth related types
export interface UserProfile {
  id: string;
  user_id: string;
  display_name: string;
  email: string;
  avatar_url?: string;
  phone?: string;
  user_type: 'customer' | 'provider';
  created_at: string;
  updated_at: string;
}