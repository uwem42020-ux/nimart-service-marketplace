// lib/types.ts - COMPLETE FIXED VERSION (NO DUPLICATE EXPORTS)
export interface HomepageMapProps {
  userLocation: UserLocation;
  isExpanded?: boolean;
}

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

export interface ServiceRequest {
  id: string;
  customer_id: string;
  service_type: string;
  description: string;
  location: string;
  budget?: number;
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'assigned' | 'completed' | 'cancelled';
  assigned_provider_id?: string;
  created_at: string;
  updated_at: string;
}

export interface ServiceArea {
  id: string;
  provider_id: string;
  state_id: string;
  lga_id: string;
  radius_km: number;
  created_at: string;
}

export interface ProviderAvailability {
  id: string;
  provider_id: string;
  day_of_week: number; // 0 = Sunday, 1 = Monday, etc.
  start_time: string;
  end_time: string;
  is_available: boolean;
  created_at: string;
}

export interface CategoryStats {
  category_id: string;
  category_name: string;
  total_providers: number;
  avg_rating: number;
  total_bookings: number;
  avg_response_time: number;
}

export interface LocationStats {
  state_id: string;
  state_name: string;
  total_providers: number;
  top_categories: string[];
  avg_rating: number;
}

export interface ProviderStats {
  provider_id: string;
  total_completed_bookings: number;
  total_earnings: number;
  avg_rating: number;
  response_rate: number;
  cancellation_rate: number;
  repeat_customer_rate: number;
}

export interface CustomerStats {
  customer_id: string;
  total_bookings: number;
  total_spent: number;
  favorite_category: string;
  avg_booking_value: number;
}

export interface PlatformStats {
  total_providers: number;
  total_customers: number;
  total_bookings: number;
  total_revenue: number;
  avg_provider_rating: number;
  avg_response_time: number;
  platform_fee_percentage: number;
}

export interface Payment {
  id: string;
  booking_id: string;
  customer_id: string;
  provider_id: string;
  amount: number;
  platform_fee: number;
  provider_amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  payment_method: 'card' | 'bank_transfer' | 'wallet' | 'cash';
  transaction_reference?: string;
  paid_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  currency: string;
  last_transaction_at?: string;
  created_at: string;
  updated_at: string;
}

export interface WalletTransaction {
  id: string;
  wallet_id: string;
  amount: number;
  transaction_type: 'deposit' | 'withdrawal' | 'payment' | 'refund' | 'earning';
  description: string;
  reference_id?: string;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
}

export interface RatingAnalytics {
  provider_id: string;
  total_ratings: number;
  average_rating: number;
  rating_distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  last_30_days_avg: number;
  trend: 'up' | 'down' | 'stable';
}

export interface SearchAnalytics {
  search_term: string;
  count: number;
  location?: string;
  category?: string;
  date: string;
}

export interface UserActivity {
  user_id: string;
  user_type: 'customer' | 'provider';
  activity_type: 'search' | 'view_profile' | 'booking_request' | 'message' | 'login' | 'logout';
  details?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface NotificationPreferences {
  user_id: string;
  email_notifications: boolean;
  push_notifications: boolean;
  sms_notifications: boolean;
  booking_updates: boolean;
  promotional_offers: boolean;
  provider_verifications: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProviderVerificationRequest {
  id: string;
  provider_id: string;
  request_type: 'initial' | 'upgrade' | 'renewal' | 'document_update';
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  documents: string[];
  reviewer_id?: string;
  reviewer_notes?: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CategoryPricing {
  id: string;
  category_id: string;
  service_type: string;
  min_price: number;
  max_price: number;
  avg_price: number;
  currency: string;
  unit: 'hour' | 'day' | 'project' | 'unit';
  updated_at: string;
}

export interface ProviderPortfolioItem {
  id: string;
  provider_id: string;
  title: string;
  description?: string;
  image_url: string;
  category?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface CustomerSupportTicket {
  id: string;
  user_id: string;
  user_type: 'customer' | 'provider';
  issue_type: 'technical' | 'billing' | 'booking' | 'verification' | 'other';
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface PlatformAnnouncement {
  id: string;
  title: string;
  content: string;
  audience: 'all' | 'providers' | 'customers' | 'specific_group';
  priority: 'normal' | 'important' | 'urgent';
  start_date: string;
  end_date?: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ReferralProgram {
  id: string;
  referrer_id: string;
  referred_id: string;
  referral_code: string;
  status: 'pending' | 'completed' | 'expired';
  reward_type: 'credit' | 'discount' | 'cash';
  reward_amount: number;
  reward_issued: boolean;
  issued_at?: string;
  created_at: string;
}

export interface MaintenanceMode {
  is_active: boolean;
  message?: string;
  start_time?: string;
  estimated_end_time?: string;
  affected_services?: string[];
  created_at: string;
  updated_at: string;
}

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  is_active: boolean;
  last_used?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  user_type?: 'customer' | 'provider' | 'admin' | 'system';
  action: string;
  entity_type: string;
  entity_id?: string;
  details?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

// REMOVED DUPLICATE EXPORT SECTION - All types are already exported above