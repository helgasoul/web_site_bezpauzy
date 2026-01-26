-- Add double opt-in fields to menohub_newsletter_subscribers table
ALTER TABLE menohub_newsletter_subscribers
ADD COLUMN IF NOT EXISTS confirmation_token TEXT,
ADD COLUMN IF NOT EXISTS confirmation_sent_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS welcome_email_sent BOOLEAN DEFAULT false;

-- Update status check constraint to include 'pending'
ALTER TABLE menohub_newsletter_subscribers
DROP CONSTRAINT IF EXISTS menohub_newsletter_subscribers_status_check;

ALTER TABLE menohub_newsletter_subscribers
ADD CONSTRAINT menohub_newsletter_subscribers_status_check
CHECK (status IN ('pending', 'active', 'unsubscribed'));

-- Set default status to 'pending' for new subscribers
ALTER TABLE menohub_newsletter_subscribers
ALTER COLUMN status SET DEFAULT 'pending';

-- Create index for confirmation_token
CREATE INDEX IF NOT EXISTS idx_menohub_newsletter_subscribers_confirmation_token 
ON menohub_newsletter_subscribers(confirmation_token) 
WHERE confirmation_token IS NOT NULL;

-- Add comments
COMMENT ON COLUMN menohub_newsletter_subscribers.confirmation_token IS 'Токен для подтверждения подписки (double opt-in)';
COMMENT ON COLUMN menohub_newsletter_subscribers.confirmation_sent_at IS 'Время отправки письма с подтверждением';
COMMENT ON COLUMN menohub_newsletter_subscribers.confirmed_at IS 'Время подтверждения подписки';
COMMENT ON COLUMN menohub_newsletter_subscribers.welcome_email_sent IS 'Отправлено ли приветственное письмо';
