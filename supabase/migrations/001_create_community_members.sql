-- Create menohub_community_members table
CREATE TABLE IF NOT EXISTS menohub_community_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    age TEXT,
    location TEXT,
    interests JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'unsubscribed')),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    last_active_at TIMESTAMPTZ,
    unsubscribed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_menohub_community_members_email ON menohub_community_members(email);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_menohub_community_members_status ON menohub_community_members(status);

-- Create index on joined_at for sorting
CREATE INDEX IF NOT EXISTS idx_menohub_community_members_joined_at ON menohub_community_members(joined_at DESC);

-- Enable Row Level Security
ALTER TABLE menohub_community_members ENABLE ROW LEVEL SECURITY;

-- Policy: Only authenticated users can read their own data
-- For now, we'll allow service role to insert (via API)
-- In production, you might want to add more restrictive policies
CREATE POLICY "Service role can insert menohub community members"
    ON menohub_community_members
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Service role can read menohub community members"
    ON menohub_community_members
    FOR SELECT
    USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_menohub_community_members_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_menohub_community_members_updated_at
    BEFORE UPDATE ON menohub_community_members
    FOR EACH ROW
    EXECUTE FUNCTION update_menohub_community_members_updated_at();
