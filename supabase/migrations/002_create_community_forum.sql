-- Create forum categories table
CREATE TABLE IF NOT EXISTS menohub_forum_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    slug TEXT UNIQUE NOT NULL,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create forum topics table
CREATE TABLE IF NOT EXISTS menohub_forum_topics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES menohub_forum_categories(id) ON DELETE CASCADE,
    author_email TEXT NOT NULL,
    author_name TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    is_pinned BOOLEAN DEFAULT false,
    is_locked BOOLEAN DEFAULT false,
    views_count INTEGER DEFAULT 0,
    replies_count INTEGER DEFAULT 0,
    last_reply_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create forum replies table
CREATE TABLE IF NOT EXISTS menohub_forum_replies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    topic_id UUID REFERENCES menohub_forum_topics(id) ON DELETE CASCADE,
    author_email TEXT NOT NULL,
    author_name TEXT NOT NULL,
    content TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_menohub_forum_topics_category ON menohub_forum_topics(category_id);
CREATE INDEX IF NOT EXISTS idx_menohub_forum_topics_created ON menohub_forum_topics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_menohub_forum_topics_pinned ON menohub_forum_topics(is_pinned DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_menohub_forum_replies_topic ON menohub_forum_replies(topic_id);
CREATE INDEX IF NOT EXISTS idx_menohub_forum_replies_created ON menohub_forum_replies(created_at);

-- Create function to update topic's last_reply_at and replies_count
CREATE OR REPLACE FUNCTION menohub_update_topic_stats()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE menohub_forum_topics
    SET 
        replies_count = (
            SELECT COUNT(*) 
            FROM menohub_forum_replies 
            WHERE topic_id = NEW.topic_id AND is_approved = true
        ),
        last_reply_at = (
            SELECT MAX(created_at)
            FROM menohub_forum_replies
            WHERE topic_id = NEW.topic_id AND is_approved = true
        )
    WHERE id = NEW.topic_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for replies
CREATE TRIGGER menohub_trigger_update_topic_stats
AFTER INSERT OR UPDATE OR DELETE ON menohub_forum_replies
FOR EACH ROW
EXECUTE FUNCTION menohub_update_topic_stats();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION menohub_update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER menohub_trigger_forum_categories_updated_at
BEFORE UPDATE ON menohub_forum_categories
FOR EACH ROW
EXECUTE FUNCTION menohub_update_updated_at();

CREATE TRIGGER menohub_trigger_forum_topics_updated_at
BEFORE UPDATE ON menohub_forum_topics
FOR EACH ROW
EXECUTE FUNCTION menohub_update_updated_at();

CREATE TRIGGER menohub_trigger_forum_replies_updated_at
BEFORE UPDATE ON menohub_forum_replies
FOR EACH ROW
EXECUTE FUNCTION menohub_update_updated_at();

-- Enable RLS
ALTER TABLE menohub_forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menohub_forum_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE menohub_forum_replies ENABLE ROW LEVEL SECURITY;

-- RLS Policies for forum_categories (read-only for everyone)
CREATE POLICY "Anyone can read forum categories"
ON menohub_forum_categories FOR SELECT
USING (true);

-- RLS Policies for forum_topics
CREATE POLICY "Anyone can read forum topics"
ON menohub_forum_topics FOR SELECT
USING (true);

CREATE POLICY "Service role can insert forum topics"
ON menohub_forum_topics FOR INSERT
WITH CHECK (true);

CREATE POLICY "Service role can update forum topics"
ON menohub_forum_topics FOR UPDATE
USING (true);

-- RLS Policies for forum_replies
CREATE POLICY "Anyone can read forum replies"
ON menohub_forum_replies FOR SELECT
USING (is_approved = true);

CREATE POLICY "Service role can insert forum replies"
ON menohub_forum_replies FOR INSERT
WITH CHECK (true);

CREATE POLICY "Service role can update forum replies"
ON menohub_forum_replies FOR UPDATE
USING (true);

-- Insert default categories
INSERT INTO menohub_forum_categories (name, description, slug, order_index) VALUES
('Общие вопросы', 'Обсуждение общих вопросов о менопаузе', 'general', 1),
('Симптомы и их облегчение', 'Обсуждение симптомов и способов их облегчения', 'symptoms', 2),
('ЗГТ и лечение', 'Вопросы о заместительной гормональной терапии и других методах лечения', 'treatment', 3),
('Питание и образ жизни', 'Обсуждение питания, физической активности и образа жизни', 'lifestyle', 4),
('Эмоциональное здоровье', 'Поддержка и обсуждение эмоциональных аспектов менопаузы', 'emotional', 5),
('Вопросы экспертам', 'Вопросы, которые будут переданы нашим экспертам', 'experts', 6)
ON CONFLICT (slug) DO NOTHING;

