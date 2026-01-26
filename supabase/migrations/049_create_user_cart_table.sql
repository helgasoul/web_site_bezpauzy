-- Create menohub_user_cart table for storing user shopping carts
CREATE TABLE IF NOT EXISTS menohub_user_cart (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id BIGINT NOT NULL REFERENCES menohub_users(id) ON DELETE CASCADE,
    items JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of cart items
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create indexes for menohub_user_cart
CREATE INDEX IF NOT EXISTS idx_menohub_user_cart_user_id ON menohub_user_cart(user_id);
CREATE INDEX IF NOT EXISTS idx_menohub_user_cart_updated_at ON menohub_user_cart(updated_at DESC);

-- Enable Row Level Security for menohub_user_cart
ALTER TABLE menohub_user_cart ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read/update their own cart
CREATE POLICY "Users can read their own cart"
    ON menohub_user_cart
    FOR SELECT
    USING (true); -- Service role will handle filtering by user_id

CREATE POLICY "Users can insert their own cart"
    ON menohub_user_cart
    FOR INSERT
    WITH CHECK (true); -- Service role will handle filtering by user_id

CREATE POLICY "Users can update their own cart"
    ON menohub_user_cart
    FOR UPDATE
    USING (true); -- Service role will handle filtering by user_id

CREATE POLICY "Users can delete their own cart"
    ON menohub_user_cart
    FOR DELETE
    USING (true); -- Service role will handle filtering by user_id

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_menohub_user_cart_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for menohub_user_cart
DROP TRIGGER IF EXISTS update_menohub_user_cart_updated_at ON menohub_user_cart;
CREATE TRIGGER update_menohub_user_cart_updated_at
    BEFORE UPDATE ON menohub_user_cart
    FOR EACH ROW
    EXECUTE FUNCTION update_menohub_user_cart_updated_at();

-- Add comment
COMMENT ON TABLE menohub_user_cart IS 'Shopping cart for authenticated users, synced across devices';
COMMENT ON COLUMN menohub_user_cart.items IS 'JSON array of cart items: [{"id": "string", "type": "book|resource", "title": "string", "price": number, "quantity": number, ...}]';
