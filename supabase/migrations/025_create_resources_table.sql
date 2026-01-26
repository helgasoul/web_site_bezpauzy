-- Create table for checklists and guides (resources)
-- Resources can be either checklists or guides, distinguished by resource_type

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS menohub_resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resource_type TEXT NOT NULL CHECK (resource_type IN ('checklist', 'guide')),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    icon_name TEXT, -- Имя иконки из lucide-react (например, 'Stethoscope', 'BookOpen')
    cover_image TEXT, -- Путь к изображению обложки в public/
    
    -- PDF файл
    pdf_source TEXT NOT NULL CHECK (pdf_source IN ('static', 'dynamic', 'supabase_storage')), -- 'static' = файл в public/, 'dynamic' = генерируется через API, 'supabase_storage' = в Supabase Storage
    pdf_file_path TEXT, -- Путь к PDF файлу (для static - путь в public/, для dynamic - API route, для supabase_storage - путь в Storage)
    pdf_filename TEXT, -- Имя файла для скачивания (например, "Чеклист_лабораторных_анализов_менопауза.pdf")
    
    -- Метаданные
    category TEXT, -- Категория для группировки (опционально)
    tags TEXT[], -- Теги для поиска и фильтрации
    order_index INTEGER DEFAULT 0, -- Порядок отображения
    
    -- Статус
    published BOOLEAN DEFAULT TRUE,
    coming_soon BOOLEAN DEFAULT FALSE,
    
    -- SEO
    meta_title TEXT,
    meta_description TEXT,
    meta_keywords TEXT[],
    
    -- Статистика (опционально, для аналитики)
    download_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_menohub_resources_type ON menohub_resources(resource_type);
CREATE INDEX IF NOT EXISTS idx_menohub_resources_slug ON menohub_resources(slug);
CREATE INDEX IF NOT EXISTS idx_menohub_resources_published ON menohub_resources(published) WHERE published = TRUE;
CREATE INDEX IF NOT EXISTS idx_menohub_resources_published_at ON menohub_resources(published_at DESC) WHERE published = TRUE;
CREATE INDEX IF NOT EXISTS idx_menohub_resources_order ON menohub_resources(order_index ASC) WHERE published = TRUE;
CREATE INDEX IF NOT EXISTS idx_menohub_resources_category ON menohub_resources(category) WHERE category IS NOT NULL;

-- Enable Row Level Security
ALTER TABLE menohub_resources ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read published resources
-- Удаляем существующие политики, если они есть
DROP POLICY IF EXISTS "Anyone can read published resources" ON menohub_resources;
DROP POLICY IF EXISTS "Service role can insert resources" ON menohub_resources;
DROP POLICY IF EXISTS "Service role can update resources" ON menohub_resources;
DROP POLICY IF EXISTS "Service role can delete resources" ON menohub_resources;
DROP POLICY IF EXISTS "Service role can select resources" ON menohub_resources;

CREATE POLICY "Anyone can read published resources"
    ON menohub_resources
    FOR SELECT
    USING (published = TRUE AND published_at <= NOW());

-- Policy: Service role can do everything (for API routes)
CREATE POLICY "Service role can insert resources"
    ON menohub_resources
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Service role can update resources"
    ON menohub_resources
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Service role can delete resources"
    ON menohub_resources
    FOR DELETE
    USING (true);

CREATE POLICY "Service role can select resources"
    ON menohub_resources
    FOR SELECT
    USING (true);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_menohub_resources_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on UPDATE
-- Удаляем существующий триггер, если он есть
DROP TRIGGER IF EXISTS update_menohub_resources_updated_at ON menohub_resources;

CREATE TRIGGER update_menohub_resources_updated_at
    BEFORE UPDATE ON menohub_resources
    FOR EACH ROW
    EXECUTE FUNCTION update_menohub_resources_updated_at();

-- RPC Functions for incrementing counters
CREATE OR REPLACE FUNCTION increment_resource_view_count(resource_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE menohub_resources
    SET view_count = view_count + 1
    WHERE id = resource_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_resource_download_count(resource_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE menohub_resources
    SET download_count = download_count + 1
    WHERE id = resource_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments
COMMENT ON TABLE menohub_resources IS 'Checklists and guides (resources) available for download. PDF files can be static, dynamically generated, or stored in Supabase Storage.';
COMMENT ON COLUMN menohub_resources.pdf_source IS 'Source of PDF: static (file in public/), dynamic (generated via API), or supabase_storage (stored in Supabase Storage bucket)';
COMMENT ON COLUMN menohub_resources.pdf_file_path IS 'Path to PDF file. For static: path in public/ (e.g., "/guides/file.pdf"). For dynamic: API route (e.g., "/api/guides/lab-checklist"). For supabase_storage: path in Storage bucket.';

