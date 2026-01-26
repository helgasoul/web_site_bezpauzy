-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create menohub_blog_posts table for storing articles
CREATE TABLE IF NOT EXISTS menohub_blog_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    excerpt TEXT NOT NULL,
    content TEXT NOT NULL, -- Markdown content
    category TEXT NOT NULL CHECK (category IN ('gynecologist', 'mammologist', 'nutritionist')),
    category_name TEXT NOT NULL, -- 'Кабинет гинеколога', 'Кабинет маммолога', 'Кухня нутрициолога'
    author_id BIGINT, -- References menohub_users(id) - can be NULL for manual entry
    author_name TEXT NOT NULL, -- For display
    author_role TEXT NOT NULL, -- 'Гинеколог-эндокринолог', etc.
    author_avatar TEXT, -- URL to avatar image
    image TEXT NOT NULL, -- Hero image URL
    published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    read_time INTEGER, -- Reading time in minutes (calculated from content length)
    key_takeaways TEXT[], -- Array of key takeaways
    article_references JSONB, -- Array of reference objects [{id: number, text: string}]
    meta_title TEXT, -- SEO title (if different from title)
    meta_description TEXT, -- SEO description (120-155 chars)
    meta_keywords TEXT[], -- SEO keywords
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by BIGINT -- References menohub_users(id) - who created the post
);

-- Create indexes for menohub_blog_posts
CREATE INDEX IF NOT EXISTS idx_menohub_blog_posts_slug ON menohub_blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_menohub_blog_posts_category ON menohub_blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_menohub_blog_posts_published ON menohub_blog_posts(published);
CREATE INDEX IF NOT EXISTS idx_menohub_blog_posts_published_at ON menohub_blog_posts(published_at DESC) WHERE published = TRUE;
CREATE INDEX IF NOT EXISTS idx_menohub_blog_posts_author_id ON menohub_blog_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_menohub_blog_posts_created_at ON menohub_blog_posts(created_at DESC);

-- Enable Row Level Security
ALTER TABLE menohub_blog_posts ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read published posts
CREATE POLICY "Anyone can read published blog posts"
    ON menohub_blog_posts
    FOR SELECT
    USING (published = TRUE AND published_at <= NOW());

-- Policy: Service role can do everything (for API routes)
-- Using separate policies for better compatibility
CREATE POLICY "Service role can insert blog posts"
    ON menohub_blog_posts
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Service role can update blog posts"
    ON menohub_blog_posts
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Service role can delete blog posts"
    ON menohub_blog_posts
    FOR DELETE
    USING (true);

CREATE POLICY "Service role can select blog posts"
    ON menohub_blog_posts
    FOR SELECT
    USING (true);

-- Policy: Authenticated users with admin role can manage posts (if you add admin role later)
-- CREATE POLICY "Admins can manage blog posts"
--     ON menohub_blog_posts
--     FOR ALL
--     USING (
--         EXISTS (
--             SELECT 1 FROM menohub_users
--             WHERE id = auth.uid()::BIGINT
--             AND role = 'admin'
--         )
--     )
--     WITH CHECK (
--         EXISTS (
--             SELECT 1 FROM menohub_users
--             WHERE id = auth.uid()::BIGINT
--             AND role = 'admin'
--         )
--     );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_menohub_blog_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on UPDATE
CREATE TRIGGER update_menohub_blog_posts_updated_at
    BEFORE UPDATE ON menohub_blog_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_menohub_blog_posts_updated_at();

-- Function to calculate read_time (approximate: 200 words per minute)
CREATE OR REPLACE FUNCTION calculate_read_time(content_text TEXT)
RETURNS INTEGER AS $$
BEGIN
    -- Simple calculation: ~200 words per minute
    -- Average word length in Russian is ~5 characters, so roughly 1 word = 5 chars
    -- Approximate: (character_count / 5) / 200 = minutes
    RETURN GREATEST(1, ROUND((length(content_text) / 1000.0)::NUMERIC, 0)::INTEGER);
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE menohub_blog_posts IS 'Blog articles for the website. Content is stored as Markdown text.';
COMMENT ON COLUMN menohub_blog_posts.content IS 'Article content in Markdown format';
COMMENT ON COLUMN menohub_blog_posts.key_takeaways IS 'Array of key takeaways (bullet points)';
COMMENT ON COLUMN menohub_blog_posts.article_references IS 'JSON array of references: [{"id": 1, "text": "..."}]';

