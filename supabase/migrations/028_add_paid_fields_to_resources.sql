-- Add paid resource fields to menohub_resources table
ALTER TABLE menohub_resources 
    ADD COLUMN IF NOT EXISTS is_paid BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS price_kopecks INTEGER, -- 39900 = 399₽
    ADD COLUMN IF NOT EXISTS epub_file_path TEXT, -- Путь к EPUB в Supabase Storage
    ADD COLUMN IF NOT EXISTS download_limit INTEGER DEFAULT 1; -- Лимит скачиваний для платных гайдов (1 раз)

-- Create index for paid resources
CREATE INDEX IF NOT EXISTS idx_menohub_resources_is_paid ON menohub_resources(is_paid) WHERE is_paid = TRUE;

-- Comments
COMMENT ON COLUMN menohub_resources.is_paid IS 'Whether this resource is paid (requires purchase)';
COMMENT ON COLUMN menohub_resources.price_kopecks IS 'Price in kopecks (39900 = 399₽)';
COMMENT ON COLUMN menohub_resources.epub_file_path IS 'Path to EPUB file in Supabase Storage (for paid resources)';
COMMENT ON COLUMN menohub_resources.download_limit IS 'Maximum number of downloads allowed for paid resources (default 1 - one-time download). Free resources have unlimited downloads.';

