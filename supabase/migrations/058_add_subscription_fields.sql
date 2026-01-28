-- Add subscription management fields to menohub_users table
-- These fields are needed for tracking paid subscriptions via YooKassa

-- Add subscription fields if they don't exist
ALTER TABLE menohub_users
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive' CHECK (subscription_status IN ('inactive', 'active', 'cancelled', 'expired')),
ADD COLUMN IF NOT EXISTS subscription_plan TEXT CHECK (subscription_plan IN ('monthly', 'annual')),
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'refunded')),
ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS last_payment_date TIMESTAMPTZ;

-- Create index for faster subscription status lookups
CREATE INDEX IF NOT EXISTS idx_menohub_users_subscription_status ON menohub_users(subscription_status);
CREATE INDEX IF NOT EXISTS idx_menohub_users_subscription_end_date ON menohub_users(subscription_end_date);

-- Add comments for documentation
COMMENT ON COLUMN menohub_users.subscription_status IS 'Current subscription status: inactive (no subscription), active (paid and valid), cancelled (cancelled but still valid until end_date), expired (end_date passed)';
COMMENT ON COLUMN menohub_users.subscription_plan IS 'Subscription plan type: monthly or annual';
COMMENT ON COLUMN menohub_users.payment_status IS 'Last payment status: unpaid, paid, refunded';
COMMENT ON COLUMN menohub_users.subscription_end_date IS 'Date when the current subscription period ends';
COMMENT ON COLUMN menohub_users.last_payment_date IS 'Date of the last successful payment';

-- Function to automatically mark expired subscriptions
CREATE OR REPLACE FUNCTION check_expired_subscriptions()
RETURNS void AS $$
BEGIN
  UPDATE menohub_users
  SET 
    subscription_status = 'expired',
    is_subscribed = false
  WHERE 
    subscription_status = 'active'
    AND subscription_end_date < NOW();
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to check expired subscriptions (if pg_cron is enabled)
-- This would need to be configured separately in Supabase dashboard
-- For now, we'll rely on checking subscription status at API level

COMMENT ON FUNCTION check_expired_subscriptions() IS 'Marks subscriptions as expired if their end_date has passed. Should be run periodically via cron job.';
