-- Create menohub_video_content table for storing video content (podcasts and Eva explains videos)
CREATE TABLE IF NOT EXISTS menohub_video_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Basic info
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    
    -- Content type
    content_type TEXT NOT NULL CHECK (content_type IN ('podcast', 'eva_explains')),
    
    -- Podcast-specific fields (for content_type = 'podcast')
    podcast_series TEXT, -- 'noPause подкаст'
    guest_expert_id BIGINT, -- References menohub_users(id) if expert has account
    guest_expert_name TEXT, -- Name of the expert (e.g., "Пучкова Ольга")
    guest_expert_role TEXT, -- Role of the expert (e.g., "Гинеколог-эндокринолог")
    guest_expert_avatar TEXT, -- URL to expert avatar
    host_name TEXT DEFAULT 'noPause', -- Host name for podcast
    
    -- Eva explains specific fields (for content_type = 'eva_explains')
    topic TEXT, -- Main topic (e.g., "Приливы", "ЗГТ", "Питание")
    
    -- Video metadata
    video_url TEXT NOT NULL, -- URL to video file (YouTube, Vimeo, or direct URL)
    video_type TEXT NOT NULL DEFAULT 'youtube' CHECK (video_type IN ('youtube', 'vimeo', 'direct', 'telegram')),
    video_id TEXT, -- Video ID for YouTube/Vimeo (e.g., YouTube video ID)
    thumbnail_url TEXT NOT NULL, -- Thumbnail image URL
    duration INTEGER NOT NULL, -- Duration in seconds
    
    -- Categorization
    category TEXT NOT NULL CHECK (category IN (
        'menopause', -- Менопауза
        'hormones', -- Гормоны и ЗГТ
        'nutrition', -- Питание
        'sports', -- Спорт и фитнес
        'mental_health', -- Психоэмоциональное здоровье
        'sexual_health', -- Сексуальное здоровье
        'bone_health', -- Здоровье костей
        'heart_health', -- Сердечно-сосудистое здоровье
        'sleep', -- Сон
        'skin_health', -- Кожа и волосы
        'general' -- Общее
    )),
    category_name TEXT NOT NULL, -- Display name in Russian
    
    -- SEO and display
    meta_title TEXT, -- SEO title
    meta_description TEXT, -- SEO description (120-155 chars)
    meta_keywords TEXT[], -- SEO keywords
    
    -- Access control
    access_level TEXT NOT NULL DEFAULT 'free' CHECK (access_level IN ('free', 'paid1', 'paid2')),
    -- free: доступно всем
    -- paid1: требуется подписка Paid1 (800₽/мес)
    -- paid2: требуется подписка Paid2 (2500₽/мес)
    
    -- Status
    published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMPTZ,
    
    -- Metadata
    views_count INTEGER DEFAULT 0, -- View count (can be updated via API)
    likes_count INTEGER DEFAULT 0, -- Likes count (optional)
    
    -- Additional data
    tags TEXT[], -- Array of tags for filtering
    transcript TEXT, -- Full transcript (optional, for search)
    timestamps JSONB, -- Timestamps for chapters/sections: [{"time": 120, "title": "Глава 1"}]
    related_articles UUID[], -- Array of blog_posts IDs
    related_videos UUID[], -- Array of other video_content IDs
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by BIGINT -- References menohub_users(id) - who created the video entry
);

-- Create indexes for menohub_video_content
CREATE INDEX IF NOT EXISTS idx_menohub_video_content_slug ON menohub_video_content(slug);
CREATE INDEX IF NOT EXISTS idx_menohub_video_content_content_type ON menohub_video_content(content_type);
CREATE INDEX IF NOT EXISTS idx_menohub_video_content_category ON menohub_video_content(category);
CREATE INDEX IF NOT EXISTS idx_menohub_video_content_access_level ON menohub_video_content(access_level);
CREATE INDEX IF NOT EXISTS idx_menohub_video_content_published ON menohub_video_content(published);
CREATE INDEX IF NOT EXISTS idx_menohub_video_content_published_at ON menohub_video_content(published_at DESC) WHERE published = TRUE;
CREATE INDEX IF NOT EXISTS idx_menohub_video_content_podcast_series ON menohub_video_content(podcast_series) WHERE content_type = 'podcast';
CREATE INDEX IF NOT EXISTS idx_menohub_video_content_tags ON menohub_video_content USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_menohub_video_content_views_count ON menohub_video_content(views_count DESC);
CREATE INDEX IF NOT EXISTS idx_menohub_video_content_created_at ON menohub_video_content(created_at DESC);

-- Enable Row Level Security
ALTER TABLE menohub_video_content ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read published videos (based on access_level will be checked in application)
CREATE POLICY "Anyone can read published video content"
    ON menohub_video_content
    FOR SELECT
    USING (published = TRUE AND published_at <= NOW());

-- Policy: Service role can do everything (for API routes)
-- Using separate policies for better compatibility
CREATE POLICY "Service role can insert video content"
    ON menohub_video_content
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Service role can update video content"
    ON menohub_video_content
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Service role can delete video content"
    ON menohub_video_content
    FOR DELETE
    USING (true);

CREATE POLICY "Service role can select video content"
    ON menohub_video_content
    FOR SELECT
    USING (true);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_menohub_video_content_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on UPDATE
CREATE TRIGGER update_menohub_video_content_updated_at
    BEFORE UPDATE ON menohub_video_content
    FOR EACH ROW
    EXECUTE FUNCTION update_menohub_video_content_updated_at();

COMMENT ON TABLE menohub_video_content IS 'Video content library: noPause podcasts and Eva explains videos';
COMMENT ON COLUMN menohub_video_content.content_type IS 'Type: podcast (noPause подкаст) or eva_explains (Ева объясняет)';
COMMENT ON COLUMN menohub_video_content.video_url IS 'Full URL to video (YouTube, Vimeo, or direct link)';
COMMENT ON COLUMN menohub_video_content.video_id IS 'Video ID for YouTube/Vimeo (extracted from URL)';
COMMENT ON COLUMN menohub_video_content.access_level IS 'Access control: free, paid1, or paid2';
COMMENT ON COLUMN menohub_video_content.transcript IS 'Full video transcript for search functionality';
COMMENT ON COLUMN menohub_video_content.timestamps IS 'JSON array of timestamps for chapters: [{"time": 120, "title": "Глава 1"}]';

