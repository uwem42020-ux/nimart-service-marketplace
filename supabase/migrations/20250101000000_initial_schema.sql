-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TABLES
-- =============================================

-- 1. LGA Centers (774 LGAs with coordinates)
CREATE TABLE lga_centers (
  lga_id INTEGER PRIMARY KEY,
  lga_name TEXT NOT NULL,
  state_id INTEGER NOT NULL,
  state_name TEXT NOT NULL,
  lat DECIMAL(10,8),
  lng DECIMAL(11,8),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Subcategories table
CREATE TABLE subcategories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category_id INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Profiles (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT UNIQUE,
  role TEXT CHECK (role IN ('customer', 'provider')) DEFAULT 'customer',
  avatar_url TEXT,
  lga_id INTEGER REFERENCES lga_centers(lga_id),
  lga_name TEXT,
  lat DECIMAL(10,8),
  lng DECIMAL(11,8),
  is_complete BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Providers table
CREATE TABLE providers (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT,
  description TEXT,
  selected_tier_slug TEXT NOT NULL,
  selected_category_slug TEXT NOT NULL,
  selected_subcategory_id INTEGER REFERENCES subcategories(id),
  tags TEXT[] DEFAULT '{}',
  is_available BOOLEAN DEFAULT true,
  status TEXT CHECK (status IN ('available', 'busy', 'away')) DEFAULT 'available',
  boost_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Bookings
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_number TEXT UNIQUE NOT NULL,
  customer_id UUID NOT NULL REFERENCES profiles(id),
  provider_id UUID NOT NULL REFERENCES providers(id),
  service_name TEXT NOT NULL,
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  price NUMERIC(10,2),
  location TEXT,
  special_instructions TEXT,
  status TEXT CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled_by_customer', 'cancelled_by_provider', 'no_show')) DEFAULT 'pending',
  cancelled_at TIMESTAMPTZ,
  cancelled_by UUID REFERENCES profiles(id),
  cancellation_reason TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Reviews
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES profiles(id),
  provider_id UUID NOT NULL REFERENCES providers(id),
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Threads
CREATE TABLE threads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID NOT NULL REFERENCES profiles(id),
  customer_id UUID NOT NULL REFERENCES profiles(id),
  booking_id UUID REFERENCES bookings(id),
  last_message TEXT,
  last_message_at TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(provider_id, customer_id, booking_id)
);

-- 8. Messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id UUID NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id),
  recipient_id UUID NOT NULL REFERENCES profiles(id),
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Portfolio Images
CREATE TABLE portfolio_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES (for performance)
-- =============================================

-- Provider search
CREATE INDEX CONCURRENTLY idx_providers_available_status ON providers(is_available, status, selected_subcategory_id);
CREATE INDEX CONCURRENTLY idx_providers_tier_available ON providers(selected_tier_slug, is_available);
CREATE INDEX CONCURRENTLY idx_providers_category_available ON providers(selected_category_slug, is_available);
CREATE INDEX CONCURRENTLY idx_providers_subcategory ON providers(selected_subcategory_id) WHERE is_available = true;

-- Location search
CREATE INDEX CONCURRENTLY idx_profiles_location ON profiles(lat, lng) WHERE lat IS NOT NULL AND lng IS NOT NULL;
CREATE INDEX CONCURRENTLY idx_profiles_lga ON profiles(lga_id, role);

-- Bookings
CREATE INDEX CONCURRENTLY idx_bookings_provider_status ON bookings(provider_id, status, booking_date);
CREATE INDEX CONCURRENTLY idx_bookings_customer_status ON bookings(customer_id, status, booking_date);
CREATE INDEX CONCURRENTLY idx_bookings_date ON bookings(booking_date, status);

-- Messages
CREATE INDEX CONCURRENTLY idx_messages_thread_recipient ON messages(thread_id, recipient_id, is_read, created_at DESC);
CREATE INDEX CONCURRENTLY idx_messages_recipient_unread ON messages(recipient_id, is_read, created_at DESC);
CREATE INDEX CONCURRENTLY idx_messages_sender ON messages(sender_id, created_at DESC);

-- Threads
CREATE INDEX CONCURRENTLY idx_threads_provider_updated ON threads(provider_id, updated_at DESC);
CREATE INDEX CONCURRENTLY idx_threads_customer_updated ON threads(customer_id, updated_at DESC);
CREATE INDEX CONCURRENTLY idx_threads_participants ON threads(provider_id, customer_id);

-- Notifications
CREATE INDEX CONCURRENTLY idx_notifications_user_read ON notifications(user_id, is_read, created_at DESC);
CREATE INDEX CONCURRENTLY idx_notifications_user_type ON notifications(user_id, type, created_at DESC);

-- Reviews
CREATE INDEX CONCURRENTLY idx_reviews_provider_rating ON reviews(provider_id, rating DESC, created_at DESC);

-- LGA centers
CREATE INDEX CONCURRENTLY idx_lga_centers_coords ON lga_centers(lat, lng);
CREATE INDEX CONCURRENTLY idx_lga_centers_name ON lga_centers(lga_name);

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_images ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read any profile, update only own
CREATE POLICY "Anyone can view profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Providers: public read, owner write
CREATE POLICY "Anyone can view providers" ON providers FOR SELECT USING (true);
CREATE POLICY "Providers can update own record" ON providers FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Providers can insert own record" ON providers FOR INSERT WITH CHECK (auth.uid() = id);

-- Bookings: customers and providers involved can view, create, update
CREATE POLICY "Users can view their bookings" ON bookings FOR SELECT USING (
  auth.uid() = customer_id OR auth.uid() = provider_id
);
CREATE POLICY "Customers can create bookings" ON bookings FOR INSERT WITH CHECK (
  auth.uid() = customer_id
);
CREATE POLICY "Involved users can update bookings" ON bookings FOR UPDATE USING (
  auth.uid() = customer_id OR auth.uid() = provider_id
);

-- Reviews: public read, only reviewer can create/update
CREATE POLICY "Anyone can view reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Reviewers can create reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);
CREATE POLICY "Reviewers can update own reviews" ON reviews FOR UPDATE USING (auth.uid() = reviewer_id);

-- Threads: participants can view/create
CREATE POLICY "Participants can view threads" ON threads FOR SELECT USING (
  auth.uid() = provider_id OR auth.uid() = customer_id
);
CREATE POLICY "Users can create threads" ON threads FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Participants can update threads" ON threads FOR UPDATE USING (
  auth.uid() = provider_id OR auth.uid() = customer_id
);

-- Messages: participants can view/create
CREATE POLICY "Thread participants can view messages" ON messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM threads 
    WHERE threads.id = messages.thread_id 
    AND (threads.provider_id = auth.uid() OR threads.customer_id = auth.uid())
  )
);
CREATE POLICY "Participants can send messages" ON messages FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM threads 
    WHERE threads.id = messages.thread_id 
    AND (threads.provider_id = auth.uid() OR threads.customer_id = auth.uid())
  )
);

-- Notifications: users can only see their own
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "System can insert notifications" ON notifications FOR INSERT WITH CHECK (true);

-- Portfolio: public read, provider write
CREATE POLICY "Anyone can view portfolio" ON portfolio_images FOR SELECT USING (true);
CREATE POLICY "Providers can manage own portfolio" ON portfolio_images FOR ALL USING (auth.uid() = provider_id);

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- Update updated_at column automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_providers_updated_at BEFORE UPDATE ON providers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_threads_updated_at BEFORE UPDATE ON threads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Generate booking number
CREATE OR REPLACE FUNCTION generate_booking_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.booking_number := 'BK' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || UPPER(SUBSTRING(MD5(NEW.id::text) FROM 1 FOR 6));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_booking_number BEFORE INSERT ON bookings
  FOR EACH ROW EXECUTE FUNCTION generate_booking_number();

-- Auto-create profile after signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, is_complete)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', 
          COALESCE(NEW.raw_user_meta_data->>'role', 'customer'), 
          false);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();