-- Create menohub_telegram_auth_codes table for temporary authentication codes
-- Note: menohub_users table should exist (created by bot/n8n workflow)
-- If it doesn't exist, create it first or update the reference
CREATE TABLE IF NOT EXISTS menohub_telegram_auth_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT NOT NULL UNIQUE,
    telegram_id BIGINT NOT NULL DEFAULT 0, -- 0 = not activated yet
    user_id UUID, -- Optional reference to menohub_users (if table exists)
    expires_at TIMESTAMPTZ NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_menohub_telegram_auth_codes_code ON menohub_telegram_auth_codes(code);
CREATE INDEX IF NOT EXISTS idx_menohub_telegram_auth_codes_telegram_id ON menohub_telegram_auth_codes(telegram_id);
CREATE INDEX IF NOT EXISTS idx_menohub_telegram_auth_codes_expires_at ON menohub_telegram_auth_codes(expires_at);
CREATE INDEX IF NOT EXISTS idx_menohub_telegram_auth_codes_used ON menohub_telegram_auth_codes(used);

-- Enable Row Level Security
ALTER TABLE menohub_telegram_auth_codes ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for now (will be restricted later with proper auth)
DROP POLICY IF EXISTS "Allow all operations on menohub_telegram_auth_codes" ON menohub_telegram_auth_codes;

CREATE POLICY "Allow all operations on menohub_telegram_auth_codes"
    ON menohub_telegram_auth_codes
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Function to automatically clean up expired codes (optional, can be run via cron)
CREATE OR REPLACE FUNCTION menohub_cleanup_expired_auth_codes()
RETURNS void AS $$
BEGIN
    DELETE FROM menohub_telegram_auth_codes
    WHERE expires_at < NOW() 
       OR (used = TRUE AND created_at < (NOW() - INTERVAL '1 hour'));
END;
$$ LANGUAGE plpgsql;

