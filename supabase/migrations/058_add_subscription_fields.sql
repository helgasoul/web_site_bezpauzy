-- Add and update subscription management fields in menohub_users table
-- Existing fields: subscription_plan (text), payment_status (text), data_subscription_end (text)
-- Need to add: subscription_status, last_payment_date
-- Need to rename: data_subscription_end -> subscription_end_date
-- Need to change type: subscription_end_date from text to timestamptz

-- 1. Add new subscription_status field
ALTER TABLE menohub_users
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive' 
CHECK (subscription_status IN ('inactive', 'active', 'cancelled', 'expired'));

-- 2. Rename data_subscription_end to subscription_end_date (if exists)
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'menohub_users' 
    AND column_name = 'data_subscription_end'
  ) THEN
    ALTER TABLE menohub_users 
    RENAME COLUMN data_subscription_end TO subscription_end_date;
  END IF;
END $$;

-- 3. Change subscription_end_date type from text to timestamptz
-- First, we need to convert existing text values to timestamptz
-- If the column contains NULL or empty strings, this will handle it safely
DO $$
BEGIN
  -- Check if column exists and is text type
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'menohub_users' 
    AND column_name = 'subscription_end_date'
    AND data_type = 'text'
  ) THEN
    -- Convert text to timestamptz using USING clause
    ALTER TABLE menohub_users 
    ALTER COLUMN subscription_end_date TYPE TIMESTAMPTZ 
    USING CASE 
      WHEN subscription_end_date IS NULL OR subscription_end_date = '' THEN NULL
      ELSE subscription_end_date::TIMESTAMPTZ
    END;
  END IF;
END $$;

-- 4. If subscription_end_date doesn't exist at all, create it
ALTER TABLE menohub_users
ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMPTZ;

-- 5. Add last_payment_date field
ALTER TABLE menohub_users
ADD COLUMN IF NOT EXISTS last_payment_date TIMESTAMPTZ;

-- 6. Update CHECK constraints for existing fields (if not already set)
-- For subscription_plan
DO $$
BEGIN
  -- Drop existing constraint if it exists
  ALTER TABLE menohub_users DROP CONSTRAINT IF EXISTS menohub_users_subscription_plan_check;
  
  -- Add new constraint
  ALTER TABLE menohub_users 
  ADD CONSTRAINT menohub_users_subscription_plan_check 
  CHECK (subscription_plan IN ('monthly', 'annual', 'Free') OR subscription_plan IS NULL);
END $$;

-- For payment_status
DO $$
BEGIN
  -- Drop existing constraint if it exists
  ALTER TABLE menohub_users DROP CONSTRAINT IF EXISTS menohub_users_payment_status_check;
  
  -- Add new constraint
  ALTER TABLE menohub_users 
  ADD CONSTRAINT menohub_users_payment_status_check 
  CHECK (payment_status IN ('unpaid', 'paid', 'refunded') OR payment_status IS NULL);
END $$;

-- 7. Create indexes for faster subscription status lookups
CREATE INDEX IF NOT EXISTS idx_menohub_users_subscription_status 
ON menohub_users(subscription_status);

CREATE INDEX IF NOT EXISTS idx_menohub_users_subscription_end_date 
ON menohub_users(subscription_end_date);

-- 8. Add comments for documentation
COMMENT ON COLUMN menohub_users.subscription_status IS 
'Current subscription status: inactive (no subscription), active (paid and valid), cancelled (cancelled but still valid until end_date), expired (end_date passed)';

COMMENT ON COLUMN menohub_users.subscription_plan IS 
'Subscription plan type: monthly, annual, or Free (default)';

COMMENT ON COLUMN menohub_users.payment_status IS 
'Last payment status: unpaid, paid, refunded';

COMMENT ON COLUMN menohub_users.subscription_end_date IS 
'Date when the current subscription period ends';

COMMENT ON COLUMN menohub_users.last_payment_date IS 
'Date of the last successful payment';

-- 9. Function to automatically mark expired subscriptions
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

COMMENT ON FUNCTION check_expired_subscriptions() IS 
'Marks subscriptions as expired if their end_date has passed. Should be run periodically via cron job.';
