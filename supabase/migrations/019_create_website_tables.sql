-- Create menohub_newsletter_subscribers table
CREATE TABLE IF NOT EXISTS menohub_newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    subscribed_at TIMESTAMPTZ DEFAULT NOW(),
    source TEXT, -- 'homepage', 'blog', 'book_page', 'newsletter_page'
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed')),
    unsubscribed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for menohub_newsletter_subscribers
CREATE INDEX IF NOT EXISTS idx_menohub_newsletter_subscribers_email ON menohub_newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_menohub_newsletter_subscribers_status ON menohub_newsletter_subscribers(status);
CREATE INDEX IF NOT EXISTS idx_menohub_newsletter_subscribers_subscribed_at ON menohub_newsletter_subscribers(subscribed_at DESC);

-- Enable Row Level Security for menohub_newsletter_subscribers
ALTER TABLE menohub_newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Policy: Allow service role to insert and read
CREATE POLICY "Service role can insert newsletter subscribers"
    ON menohub_newsletter_subscribers
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Service role can read newsletter subscribers"
    ON menohub_newsletter_subscribers
    FOR SELECT
    USING (true);

-- Create menohub_book_orders table
CREATE TABLE IF NOT EXISTS menohub_book_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    user_id BIGINT, -- References menohub_users(id) if logged in via Telegram
    book_type TEXT NOT NULL CHECK (book_type IN ('digital', 'physical')),
    amount_kopecks INTEGER NOT NULL, -- 120000 = 1200₽
    yookassa_payment_id TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'shipped', 'cancelled', 'refunded')),
    shipping_address JSONB, -- {country, city, street, zip, postal_code}
    bonus_activated BOOLEAN DEFAULT FALSE, -- Whether Paid1 bonus was activated
    created_at TIMESTAMPTZ DEFAULT NOW(),
    paid_at TIMESTAMPTZ,
    shipped_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for menohub_book_orders
CREATE INDEX IF NOT EXISTS idx_menohub_book_orders_email ON menohub_book_orders(email);
CREATE INDEX IF NOT EXISTS idx_menohub_book_orders_user_id ON menohub_book_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_menohub_book_orders_status ON menohub_book_orders(status);
CREATE INDEX IF NOT EXISTS idx_menohub_book_orders_yookassa_payment_id ON menohub_book_orders(yookassa_payment_id);
CREATE INDEX IF NOT EXISTS idx_menohub_book_orders_created_at ON menohub_book_orders(created_at DESC);

-- Enable Row Level Security for menohub_book_orders
ALTER TABLE menohub_book_orders ENABLE ROW LEVEL SECURITY;

-- Policy: Allow service role to insert and read
CREATE POLICY "Service role can insert book orders"
    ON menohub_book_orders
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Service role can read book orders"
    ON menohub_book_orders
    FOR SELECT
    USING (true);

CREATE POLICY "Service role can update book orders"
    ON menohub_book_orders
    FOR UPDATE
    USING (true);

-- Create menohub_contact_submissions table
CREATE TABLE IF NOT EXISTS menohub_contact_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'replied', 'closed')),
    replied_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for menohub_contact_submissions
CREATE INDEX IF NOT EXISTS idx_menohub_contact_submissions_email ON menohub_contact_submissions(email);
CREATE INDEX IF NOT EXISTS idx_menohub_contact_submissions_status ON menohub_contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_menohub_contact_submissions_created_at ON menohub_contact_submissions(created_at DESC);

-- Enable Row Level Security for menohub_contact_submissions
ALTER TABLE menohub_contact_submissions ENABLE ROW LEVEL SECURITY;

-- Policy: Allow service role to insert and read
CREATE POLICY "Service role can insert contact submissions"
    ON menohub_contact_submissions
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Service role can read contact submissions"
    ON menohub_contact_submissions
    FOR SELECT
    USING (true);

CREATE POLICY "Service role can update contact submissions"
    ON menohub_contact_submissions
    FOR UPDATE
    USING (true);

-- Create menohub_page_views table for analytics
CREATE TABLE IF NOT EXISTS menohub_page_views (
    id BIGSERIAL PRIMARY KEY,
    page_path TEXT NOT NULL,
    referrer TEXT,
    user_agent TEXT,
    ip_address INET,
    user_id BIGINT, -- References menohub_users(id) if logged in
    session_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for menohub_page_views
CREATE INDEX IF NOT EXISTS idx_menohub_page_views_path ON menohub_page_views(page_path);
CREATE INDEX IF NOT EXISTS idx_menohub_page_views_created_at ON menohub_page_views(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_menohub_page_views_user_id ON menohub_page_views(user_id);
CREATE INDEX IF NOT EXISTS idx_menohub_page_views_session_id ON menohub_page_views(session_id);

-- Enable Row Level Security for menohub_page_views (read-only for analytics)
ALTER TABLE menohub_page_views ENABLE ROW LEVEL SECURITY;

-- Policy: Allow service role to insert and read
CREATE POLICY "Service role can insert page views"
    ON menohub_page_views
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Service role can read page views"
    ON menohub_page_views
    FOR SELECT
    USING (true);

-- Create menohub_test_results table (for additional interactive tools, separate from quiz_results)
CREATE TABLE IF NOT EXISTS menohub_test_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id BIGINT, -- References menohub_users(id), can be NULL if anonymous
    email TEXT, -- For anonymous users
    test_type TEXT NOT NULL, -- 'menopause_stage', 'mrs_scale', etc.
    answers JSONB NOT NULL, -- {"q1": "answer", "q2": "answer"}
    result JSONB NOT NULL, -- {"stage": "perimenopause", "score": 15}
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for menohub_test_results
CREATE INDEX IF NOT EXISTS idx_menohub_test_results_user_id ON menohub_test_results(user_id);
CREATE INDEX IF NOT EXISTS idx_menohub_test_results_email ON menohub_test_results(email);
CREATE INDEX IF NOT EXISTS idx_menohub_test_results_test_type ON menohub_test_results(test_type);
CREATE INDEX IF NOT EXISTS idx_menohub_test_results_created_at ON menohub_test_results(created_at DESC);

-- Enable Row Level Security for menohub_test_results
ALTER TABLE menohub_test_results ENABLE ROW LEVEL SECURITY;

-- Policy: Allow service role to insert and read
CREATE POLICY "Service role can insert test results"
    ON menohub_test_results
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Service role can read test results"
    ON menohub_test_results
    FOR SELECT
    USING (true);

-- Function to update updated_at timestamp for menohub_newsletter_subscribers
CREATE OR REPLACE FUNCTION update_menohub_newsletter_subscribers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for menohub_newsletter_subscribers
DROP TRIGGER IF EXISTS update_menohub_newsletter_subscribers_updated_at ON menohub_newsletter_subscribers;
CREATE TRIGGER update_menohub_newsletter_subscribers_updated_at
    BEFORE UPDATE ON menohub_newsletter_subscribers
    FOR EACH ROW
    EXECUTE FUNCTION update_menohub_newsletter_subscribers_updated_at();

-- Function to update updated_at timestamp for menohub_book_orders
CREATE OR REPLACE FUNCTION update_menohub_book_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for menohub_book_orders
DROP TRIGGER IF EXISTS update_menohub_book_orders_updated_at ON menohub_book_orders;
CREATE TRIGGER update_menohub_book_orders_updated_at
    BEFORE UPDATE ON menohub_book_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_menohub_book_orders_updated_at();

-- Function to update updated_at timestamp for menohub_contact_submissions
CREATE OR REPLACE FUNCTION update_menohub_contact_submissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for menohub_contact_submissions
DROP TRIGGER IF EXISTS update_menohub_contact_submissions_updated_at ON menohub_contact_submissions;
CREATE TRIGGER update_menohub_contact_submissions_updated_at
    BEFORE UPDATE ON menohub_contact_submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_menohub_contact_submissions_updated_at();

-- Function to update updated_at timestamp for menohub_test_results
CREATE OR REPLACE FUNCTION update_menohub_test_results_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for menohub_test_results
DROP TRIGGER IF EXISTS update_menohub_test_results_updated_at ON menohub_test_results;
CREATE TRIGGER update_menohub_test_results_updated_at
    BEFORE UPDATE ON menohub_test_results
    FOR EACH ROW
    EXECUTE FUNCTION update_menohub_test_results_updated_at();

