
-- Enums
CREATE TYPE user_role AS ENUM ('ADMIN', 'CLIENT', 'PROVIDER');
CREATE TYPE provider_type AS ENUM ('CRAFTSMAN', 'MATERIAL_SUPPLIER', 'EQUIPMENT_OWNER', 'TRANSPORTER');
CREATE TYPE listing_category AS ENUM ('MATERIAL', 'EQUIPMENT', 'CRAFTSMAN', 'WASTE');
CREATE TYPE booking_status AS ENUM ('PENDING', 'ACCEPTED', 'DISPATCHED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  role user_role DEFAULT 'CLIENT' NOT NULL,
  full_name TEXT,
  phone TEXT,
  wilaya INTEGER, -- 1 to 58
  baladia TEXT,
  avatar_url TEXT,
  bio TEXT,
  provider_type provider_type,
  specialty TEXT, -- For craftsmen
  is_verified BOOLEAN DEFAULT FALSE,
  rating_avg DECIMAL DEFAULT 0,
  completed_jobs INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Listings table
CREATE TABLE listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  category listing_category NOT NULL,
  sub_category TEXT,
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL,
  price_type TEXT, -- 'fixed', 'day', 'kg', 'm3'
  condition TEXT, -- 'new', 'used'
  wilaya INTEGER NOT NULL,
  images TEXT[] DEFAULT '{}',
  is_available BOOLEAN DEFAULT TRUE,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Waste Listings table (Specific for construction waste)
CREATE TABLE waste_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL, -- 'DISPOSAL', 'RECYCLING', 'RENOVATION'
  waste_type TEXT NOT NULL, -- 'iron', 'concrete', 'wood', etc.
  quantity DECIMAL,
  unit TEXT, -- 'kg', 'm3'
  asking_price DECIMAL,
  pickup_available BOOLEAN DEFAULT FALSE,
  wilaya INTEGER NOT NULL,
  images TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'ACTIVE',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookings table
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES profiles(id) NOT NULL,
  provider_id UUID REFERENCES profiles(id),
  listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
  status booking_status DEFAULT 'PENDING' NOT NULL,
  service_type TEXT,
  urgency TEXT DEFAULT 'normal',
  wilaya INTEGER,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  total_price DECIMAL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES profiles(id) NOT NULL,
  content TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- Reviews table
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE NOT NULL,
  reviewer_id UUID REFERENCES profiles(id) NOT NULL,
  reviewee_id UUID REFERENCES profiles(id) NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  provider_response TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE waste_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can view all, but only edit own
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Listings: Everyone can view, only owners can edit
CREATE POLICY "Listings are viewable by everyone" ON listings FOR SELECT USING (true);
CREATE POLICY "Users can insert own listings" ON listings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own listings" ON listings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own listings" ON listings FOR DELETE USING (auth.uid() = user_id);

-- Waste Listings: Similar to listings
CREATE POLICY "Waste listings are viewable by everyone" ON waste_listings FOR SELECT USING (true);
CREATE POLICY "Users can insert own waste listings" ON waste_listings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own waste listings" ON waste_listings FOR UPDATE USING (auth.uid() = user_id);

-- Bookings: Only involved parties can see/edit
CREATE POLICY "Users can view own bookings" ON bookings FOR SELECT USING (auth.uid() IN (client_id, provider_id));
CREATE POLICY "Clients can create bookings" ON bookings FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Parties can update own bookings" ON bookings FOR UPDATE USING (auth.uid() IN (client_id, provider_id));

-- Messages: Only involved parties
CREATE POLICY "Users can view messages in their bookings" ON messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM bookings 
    WHERE bookings.id = messages.booking_id 
    AND auth.uid() IN (bookings.client_id, bookings.provider_id)
  )
);
CREATE POLICY "Users can send messages in their bookings" ON messages FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM bookings 
    WHERE bookings.id = messages.booking_id 
    AND auth.uid() IN (bookings.client_id, bookings.provider_id)
  )
);

-- Reviews: Viewable by all, only client can create after completion
CREATE POLICY "Reviews are viewable by everyone" ON reviews FOR SELECT USING (true);
CREATE POLICY "Clients can create reviews for completed bookings" ON reviews FOR INSERT WITH CHECK (
  auth.uid() = reviewer_id AND 
  EXISTS (
    SELECT 1 FROM bookings 
    WHERE bookings.id = booking_id AND bookings.status = 'COMPLETED'
  )
);
