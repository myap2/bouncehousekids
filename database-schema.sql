-- My Bounce Place Booking System Database Schema
-- Run this in your Supabase SQL Editor

-- Bounce Houses Table
CREATE TABLE IF NOT EXISTS bounce_houses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  theme VARCHAR(100),
  dimensions JSONB,
  capacity JSONB,
  price_daily DECIMAL(10,2) NOT NULL DEFAULT 150.00,
  price_weekend DECIMAL(10,2) DEFAULT 200.00,
  price_weekly DECIMAL(10,2) DEFAULT 800.00,
  images TEXT[],
  features TEXT[],
  rating DECIMAL(2,1) DEFAULT 4.8,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bounce_house_id UUID REFERENCES bounce_houses(id),

  -- Customer Info
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20),

  -- Event Details
  event_date DATE NOT NULL,
  event_start_time TIME,
  event_address TEXT NOT NULL,
  event_city VARCHAR(100),
  event_zip VARCHAR(10),
  delivery_zone VARCHAR(20) DEFAULT 'outside', -- 'cache_valley' or 'outside'

  -- Rental Details
  rental_type VARCHAR(20) NOT NULL DEFAULT 'daily', -- 'daily', 'weekend', 'weekly'
  guests_count INTEGER,
  special_requests TEXT,

  -- Pricing
  base_price DECIMAL(10,2) NOT NULL,
  delivery_fee DECIMAL(10,2) DEFAULT 0,
  deposit_amount DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,

  -- Payment
  stripe_session_id VARCHAR(255),
  stripe_payment_intent_id VARCHAR(255),
  payment_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'deposit_paid', 'fully_paid', 'refunded'
  deposit_paid_at TIMESTAMP WITH TIME ZONE,

  -- Booking Status
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'confirmed', 'cancelled', 'completed'

  -- Waiver
  waiver_signed BOOLEAN DEFAULT false,
  waiver_signature_data TEXT,
  waiver_signed_at TIMESTAMP WITH TIME ZONE,
  waiver_signer_name VARCHAR(255),

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT -- Admin notes
);

-- Blocked Dates Table (replaces hardcoded arrays)
CREATE TABLE IF NOT EXISTS blocked_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  bounce_house_id UUID REFERENCES bounce_houses(id), -- NULL = all bounce houses blocked
  reason VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_bookings_event_date ON bookings(event_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_date_status ON bookings(event_date, status);
CREATE INDEX IF NOT EXISTS idx_bookings_bounce_house ON bookings(bounce_house_id);
CREATE INDEX IF NOT EXISTS idx_blocked_dates_date ON blocked_dates(date);

-- Seed data: Insert the existing bounce house
INSERT INTO bounce_houses (name, description, theme, dimensions, capacity, price_daily, price_weekend, price_weekly, features, rating, is_active)
VALUES (
  'Bounce Castle with a Slide',
  'A fantastic bounce castle featuring a built-in slide, basketball hoop, and mesh safety walls. Perfect for birthdays, parties, and family gatherings!',
  'Castle',
  '{"length": 15, "width": 15, "height": 12}',
  '{"minAge": 3, "maxAge": 12, "maxWeight": 150, "maxOccupants": 8}',
  150.00,
  200.00,
  800.00,
  ARRAY['Slide included', 'Basketball hoop', 'Mesh safety walls', 'Anchor points included'],
  4.8,
  true
) ON CONFLICT DO NOTHING;

-- Seed blocked dates (holidays)
INSERT INTO blocked_dates (date, reason) VALUES
  ('2025-12-25', 'Christmas Day'),
  ('2025-12-31', 'New Year''s Eve'),
  ('2026-01-01', 'New Year''s Day'),
  ('2026-01-19', 'Martin Luther King Jr. Day'),
  ('2026-02-16', 'Presidents'' Day'),
  ('2026-05-25', 'Memorial Day'),
  ('2026-07-04', 'Independence Day'),
  ('2026-09-07', 'Labor Day'),
  ('2026-10-12', 'Columbus Day'),
  ('2026-11-11', 'Veterans Day'),
  ('2026-11-26', 'Thanksgiving Day'),
  ('2026-12-25', 'Christmas Day 2026'),
  ('2026-12-31', 'New Year''s Eve 2026'),
  ('2027-01-01', 'New Year''s Day 2027')
ON CONFLICT DO NOTHING;

-- Promo Codes Table
CREATE TABLE IF NOT EXISTS promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  discount_type VARCHAR(20) NOT NULL DEFAULT 'percentage', -- 'percentage' or 'fixed'
  discount_value DECIMAL(10,2) NOT NULL,
  min_order_amount DECIMAL(10,2) DEFAULT 0,
  max_uses INTEGER, -- NULL = unlimited
  uses_count INTEGER DEFAULT 0,
  valid_from DATE,
  valid_until DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON promo_codes(code);

-- Seed some example promo codes
INSERT INTO promo_codes (code, description, discount_type, discount_value, valid_until, is_active)
VALUES
  ('WELCOME10', 'Welcome discount - 10% off first booking', 'percentage', 10, '2026-12-31', true),
  ('SUMMER25', 'Summer special - $25 off', 'fixed', 25, '2025-08-31', true),
  ('REPEAT15', 'Repeat customer discount - 15% off', 'percentage', 15, '2026-12-31', true)
ON CONFLICT (code) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE bounce_houses ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_dates ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access to bounce houses and blocked dates
CREATE POLICY "Allow public read access to bounce_houses" ON bounce_houses
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access to blocked_dates" ON blocked_dates
  FOR SELECT USING (true);

-- Create policy for service role to manage all tables
CREATE POLICY "Allow service role full access to bookings" ON bookings
  USING (true) WITH CHECK (true);

CREATE POLICY "Allow service role full access to blocked_dates" ON blocked_dates
  USING (true) WITH CHECK (true);
