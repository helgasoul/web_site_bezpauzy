-- Create menohub_support_requests table
CREATE TABLE IF NOT EXISTS menohub_support_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT,
    message TEXT NOT NULL,
    user_id BIGINT, -- References menohub_users(id) if logged in
    page_url TEXT, -- URL where the request was submitted
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved', 'closed')),
    telegram_message_id BIGINT, -- Message ID from Telegram admin chat
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for menohub_support_requests
CREATE INDEX IF NOT EXISTS idx_menohub_support_requests_email ON menohub_support_requests(email);
CREATE INDEX IF NOT EXISTS idx_menohub_support_requests_user_id ON menohub_support_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_menohub_support_requests_status ON menohub_support_requests(status);
CREATE INDEX IF NOT EXISTS idx_menohub_support_requests_created_at ON menohub_support_requests(created_at DESC);

-- Enable Row Level Security for menohub_support_requests
ALTER TABLE menohub_support_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Allow service role to insert and read
CREATE POLICY "Service role can insert support requests"
    ON menohub_support_requests
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Service role can read support requests"
    ON menohub_support_requests
    FOR SELECT
    USING (true);

CREATE POLICY "Service role can update support requests"
    ON menohub_support_requests
    FOR UPDATE
    USING (true);

-- Function to update updated_at timestamp for menohub_support_requests
CREATE OR REPLACE FUNCTION update_menohub_support_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for menohub_support_requests
DROP TRIGGER IF EXISTS update_menohub_support_requests_updated_at ON menohub_support_requests;
CREATE TRIGGER update_menohub_support_requests_updated_at
    BEFORE UPDATE ON menohub_support_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_menohub_support_requests_updated_at();
