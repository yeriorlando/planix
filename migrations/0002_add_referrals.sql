-- Migration 0002: Add referral fields to profiles and support referral tracking
ALTER TABLE profiles ADD COLUMN referral_code TEXT;
ALTER TABLE profiles ADD COLUMN referred_by TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_referral_code ON profiles(referral_code);
CREATE INDEX IF NOT EXISTS idx_profiles_referred_by ON profiles(referred_by);
