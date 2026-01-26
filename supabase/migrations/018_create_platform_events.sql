-- Create table for platform events (podcasts, webinars, etc.)
CREATE TABLE IF NOT EXISTS platform_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL CHECK (event_type IN ('podcast', 'webinar', 'article', 'course', 'other')),
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMPTZ NOT NULL,
  duration INTEGER, -- в минутах
  location TEXT, -- URL для онлайн-событий или адрес для офлайн
  image_url TEXT,
  is_online BOOLEAN DEFAULT true,
  registration_url TEXT, -- ссылка на регистрацию (если нужна)
  metadata JSONB, -- дополнительная информация
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_published BOOLEAN DEFAULT true -- для возможности скрывать события
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_platform_events_event_date ON platform_events(event_date);
CREATE INDEX IF NOT EXISTS idx_platform_events_event_type ON platform_events(event_type);
CREATE INDEX IF NOT EXISTS idx_platform_events_is_published ON platform_events(is_published);
CREATE INDEX IF NOT EXISTS idx_platform_events_published_date ON platform_events(is_published, event_date) WHERE is_published = true;

-- Enable Row Level Security
ALTER TABLE platform_events ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all users to read published events
CREATE POLICY "Allow all users to read published events"
  ON platform_events
  FOR SELECT
  USING (is_published = true);

-- Add comment to table
COMMENT ON TABLE platform_events IS 'Platform events (podcasts, webinars, articles, courses) that users can add to their calendar';
COMMENT ON COLUMN platform_events.event_type IS 'Type of event: podcast, webinar, article, course, other';
COMMENT ON COLUMN platform_events.duration IS 'Duration in minutes';
COMMENT ON COLUMN platform_events.location IS 'URL for online events or address for offline events';
COMMENT ON COLUMN platform_events.is_online IS 'Whether the event is online (true) or offline (false)';

