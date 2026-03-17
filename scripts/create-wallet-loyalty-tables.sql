-- Wallet System Tables
-- User wallets for storing balance and refunds

-- Create wallets table
CREATE TABLE IF NOT EXISTS wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  balance DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  currency VARCHAR(3) NOT NULL DEFAULT 'AED',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Wallet transactions table
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('credit', 'debit', 'refund', 'withdrawal', 'loyalty_bonus', 'promotional')),
  amount DECIMAL(12, 2) NOT NULL,
  balance_after DECIMAL(12, 2) NOT NULL,
  reference_type VARCHAR(50), -- 'booking', 'deposit', 'loyalty', 'promotion', 'manual'
  reference_id UUID, -- booking_id, deposit_id, etc.
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'reversed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  processed_by UUID REFERENCES profiles(id)
);

-- Refund requests table
CREATE TABLE IF NOT EXISTS refund_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  booking_id UUID,
  amount DECIMAL(12, 2) NOT NULL,
  refund_type VARCHAR(20) NOT NULL CHECK (refund_type IN ('wallet', 'bank_transfer', 'card')),
  reason VARCHAR(100) NOT NULL,
  notes TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'processing', 'completed')),
  -- Bank details for bank transfers
  bank_name VARCHAR(100),
  account_number VARCHAR(50),
  iban VARCHAR(50),
  swift_code VARCHAR(20),
  account_holder_name VARCHAR(100),
  -- Processing details
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  processed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Loyalty System Tables

-- Loyalty tiers
CREATE TABLE IF NOT EXISTS loyalty_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL UNIQUE,
  min_km INTEGER NOT NULL DEFAULT 0,
  max_km INTEGER,
  multiplier DECIMAL(3, 2) NOT NULL DEFAULT 1.00, -- Points multiplier
  benefits JSONB DEFAULT '[]',
  color VARCHAR(20), -- For UI display
  icon VARCHAR(50),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User loyalty accounts
CREATE TABLE IF NOT EXISTS loyalty_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tier_id UUID REFERENCES loyalty_tiers(id),
  total_km DECIMAL(12, 2) NOT NULL DEFAULT 0,
  yearly_km DECIMAL(12, 2) NOT NULL DEFAULT 0,
  total_points INTEGER NOT NULL DEFAULT 0,
  available_points INTEGER NOT NULL DEFAULT 0,
  lifetime_points INTEGER NOT NULL DEFAULT 0,
  yearly_spend DECIMAL(12, 2) NOT NULL DEFAULT 0,
  total_bookings INTEGER NOT NULL DEFAULT 0,
  current_streak INTEGER NOT NULL DEFAULT 0, -- Consecutive months with bookings
  last_booking_date DATE,
  year_start_date DATE NOT NULL DEFAULT DATE_TRUNC('year', CURRENT_DATE),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Loyalty transactions (points earned/spent)
CREATE TABLE IF NOT EXISTS loyalty_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loyalty_account_id UUID NOT NULL REFERENCES loyalty_accounts(id) ON DELETE CASCADE,
  type VARCHAR(30) NOT NULL CHECK (type IN ('earn', 'redeem', 'expire', 'bonus', 'adjustment')),
  points INTEGER NOT NULL,
  points_balance_after INTEGER NOT NULL,
  km_earned DECIMAL(10, 2) DEFAULT 0,
  reference_type VARCHAR(50), -- 'booking', 'promotion', 'referral', 'milestone', 'manual'
  reference_id UUID,
  description TEXT,
  multiplier_applied DECIMAL(3, 2) DEFAULT 1.00,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Loyalty milestones and achievements
CREATE TABLE IF NOT EXISTS loyalty_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  type VARCHAR(30) NOT NULL CHECK (type IN ('km_total', 'km_yearly', 'bookings', 'spend', 'streak', 'special')),
  threshold INTEGER NOT NULL,
  reward_points INTEGER NOT NULL DEFAULT 0,
  reward_type VARCHAR(30), -- 'points', 'discount', 'upgrade', 'voucher'
  reward_value DECIMAL(10, 2),
  icon VARCHAR(50),
  badge_color VARCHAR(20),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User achieved milestones
CREATE TABLE IF NOT EXISTS user_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  milestone_id UUID NOT NULL REFERENCES loyalty_milestones(id) ON DELETE CASCADE,
  achieved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reward_claimed BOOLEAN NOT NULL DEFAULT false,
  reward_claimed_at TIMESTAMPTZ,
  UNIQUE(user_id, milestone_id)
);

-- Insert default loyalty tiers
INSERT INTO loyalty_tiers (name, min_km, max_km, multiplier, benefits, color, icon) VALUES
('Bronze', 0, 999, 1.00, '["Basic support", "Standard booking"]', '#CD7F32', 'medal'),
('Silver', 1000, 4999, 1.25, '["Priority support", "5% discount on insurance", "Free car upgrade (subject to availability)"]', '#C0C0C0', 'award'),
('Gold', 5000, 14999, 1.50, '["24/7 VIP support", "10% discount on all bookings", "Free premium insurance", "Airport pickup priority"]', '#FFD700', 'crown'),
('Platinum', 15000, 49999, 2.00, '["Personal concierge", "15% discount on all bookings", "Complimentary chauffeur (2x/year)", "Exclusive vehicle access", "Free delivery anywhere"]', '#E5E4E2', 'gem'),
('Diamond', 50000, NULL, 2.50, '["Dedicated account manager", "20% discount on all bookings", "Unlimited free chauffeur", "First access to new vehicles", "Exclusive events", "Complimentary spa vouchers"]', '#B9F2FF', 'diamond')
ON CONFLICT (name) DO NOTHING;

-- Insert default milestones
INSERT INTO loyalty_milestones (name, description, type, threshold, reward_points, reward_type, icon, badge_color) VALUES
('First Ride', 'Complete your first booking', 'bookings', 1, 100, 'points', 'car', '#4CAF50'),
('Road Warrior', 'Drive 500 km total', 'km_total', 500, 250, 'points', 'road', '#2196F3'),
('Explorer', 'Drive 1,000 km total', 'km_total', 1000, 500, 'points', 'compass', '#9C27B0'),
('Adventurer', 'Drive 5,000 km total', 'km_total', 5000, 1500, 'points', 'mountain', '#FF9800'),
('Globetrotter', 'Drive 10,000 km total', 'km_total', 10000, 3000, 'points', 'globe', '#E91E63'),
('Regular', 'Complete 5 bookings', 'bookings', 5, 200, 'points', 'repeat', '#00BCD4'),
('Frequent Rider', 'Complete 10 bookings', 'bookings', 10, 500, 'points', 'star', '#FFC107'),
('VIP Customer', 'Complete 25 bookings', 'bookings', 25, 1000, 'points', 'vip', '#9C27B0'),
('Big Spender', 'Spend 10,000 AED in a year', 'spend', 10000, 1000, 'points', 'wallet', '#4CAF50'),
('High Roller', 'Spend 50,000 AED in a year', 'spend', 50000, 5000, 'points', 'diamond', '#FFD700'),
('Loyal Customer', 'Book 3 months in a row', 'streak', 3, 300, 'points', 'flame', '#FF5722'),
('Super Loyal', 'Book 6 months in a row', 'streak', 6, 750, 'points', 'fire', '#F44336'),
('Yearly Champion', 'Drive 2,000 km in one year', 'km_yearly', 2000, 1000, 'points', 'trophy', '#FFD700')
ON CONFLICT DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_wallet_id ON wallet_transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_created_at ON wallet_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_refund_requests_user_id ON refund_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_refund_requests_status ON refund_requests(status);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_account_id ON loyalty_transactions(loyalty_account_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_created_at ON loyalty_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_milestones_user_id ON user_milestones(user_id);

-- Function to automatically create wallet for new users
CREATE OR REPLACE FUNCTION create_user_wallet()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO wallets (user_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  INSERT INTO loyalty_accounts (user_id, tier_id) 
  SELECT NEW.id, id FROM loyalty_tiers WHERE name = 'Bronze' LIMIT 1
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create wallet on profile creation
DROP TRIGGER IF EXISTS trigger_create_user_wallet ON profiles;
CREATE TRIGGER trigger_create_user_wallet
AFTER INSERT ON profiles
FOR EACH ROW
EXECUTE FUNCTION create_user_wallet();

-- Function to update loyalty tier based on km
CREATE OR REPLACE FUNCTION update_loyalty_tier()
RETURNS TRIGGER AS $$
DECLARE
  new_tier_id UUID;
BEGIN
  SELECT id INTO new_tier_id
  FROM loyalty_tiers
  WHERE NEW.total_km >= min_km 
    AND (max_km IS NULL OR NEW.total_km <= max_km)
  ORDER BY min_km DESC
  LIMIT 1;
  
  IF new_tier_id IS NOT NULL AND new_tier_id != OLD.tier_id THEN
    NEW.tier_id := new_tier_id;
  END IF;
  
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update tier on loyalty account update
DROP TRIGGER IF EXISTS trigger_update_loyalty_tier ON loyalty_accounts;
CREATE TRIGGER trigger_update_loyalty_tier
BEFORE UPDATE ON loyalty_accounts
FOR EACH ROW
EXECUTE FUNCTION update_loyalty_tier();
