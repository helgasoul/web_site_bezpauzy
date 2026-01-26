-- Create table for resource purchases (paid guides/checklists)
CREATE TABLE IF NOT EXISTS menohub_resource_purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resource_id UUID NOT NULL REFERENCES menohub_resources(id) ON DELETE CASCADE,
    
    -- Информация о покупателе
    email TEXT NOT NULL,
    name TEXT,
    user_id BIGINT REFERENCES menohub_users(id), -- Если залогинен через Telegram
    
    -- Информация о платеже
    amount_kopecks INTEGER NOT NULL, -- 39900 = 399₽
    yookassa_payment_id TEXT UNIQUE, -- ID платежа в ЮКасса
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled', 'refunded')),
    
    -- Уникальная ссылка для скачивания
    download_token TEXT UNIQUE NOT NULL, -- UUID токен для ссылки
    download_token_expires_at TIMESTAMPTZ NOT NULL, -- Срок действия (30 дней)
    download_count INTEGER DEFAULT 0, -- Сколько раз скачали
    max_downloads INTEGER DEFAULT 1, -- Максимум скачиваний (для платных гайдов: 1 раз - одноразовая ссылка)
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    paid_at TIMESTAMPTZ,
    first_downloaded_at TIMESTAMPTZ,
    last_downloaded_at TIMESTAMPTZ,
    
    -- Метаданные
    metadata JSONB -- Дополнительная информация (IP, user agent, etc.)
);

-- Добавляем столбец max_downloads, если он еще не существует
-- Если таблица уже существует, но столбца нет, добавим его
ALTER TABLE menohub_resource_purchases 
    ADD COLUMN IF NOT EXISTS max_downloads INTEGER DEFAULT 1;

-- Изменяем DEFAULT значение для max_downloads на 1 (одноразовая ссылка)
-- Это нужно, даже если столбец уже существует с другим DEFAULT
ALTER TABLE menohub_resource_purchases 
    ALTER COLUMN max_downloads SET DEFAULT 1;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_resource_purchases_resource_id ON menohub_resource_purchases(resource_id);
CREATE INDEX IF NOT EXISTS idx_resource_purchases_email ON menohub_resource_purchases(email);
CREATE INDEX IF NOT EXISTS idx_resource_purchases_user_id ON menohub_resource_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_resource_purchases_status ON menohub_resource_purchases(status);
CREATE INDEX IF NOT EXISTS idx_resource_purchases_download_token ON menohub_resource_purchases(download_token);
CREATE INDEX IF NOT EXISTS idx_resource_purchases_yookassa_payment_id ON menohub_resource_purchases(yookassa_payment_id);
CREATE INDEX IF NOT EXISTS idx_resource_purchases_created_at ON menohub_resource_purchases(created_at DESC);

-- Enable Row Level Security
ALTER TABLE menohub_resource_purchases ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can do everything (for API routes)
-- Удаляем существующие политики, если они есть
DROP POLICY IF EXISTS "Service role can insert purchases" ON menohub_resource_purchases;
DROP POLICY IF EXISTS "Service role can select purchases" ON menohub_resource_purchases;
DROP POLICY IF EXISTS "Service role can update purchases" ON menohub_resource_purchases;
DROP POLICY IF EXISTS "Service role can delete purchases" ON menohub_resource_purchases;

CREATE POLICY "Service role can insert purchases"
    ON menohub_resource_purchases
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Service role can select purchases"
    ON menohub_resource_purchases
    FOR SELECT
    USING (true);

CREATE POLICY "Service role can update purchases"
    ON menohub_resource_purchases
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Service role can delete purchases"
    ON menohub_resource_purchases
    FOR DELETE
    USING (true);

-- Function to automatically update timestamps
CREATE OR REPLACE FUNCTION update_resource_purchases_timestamps()
RETURNS TRIGGER AS $$
BEGIN
    -- Update last_downloaded_at when download_count changes
    IF NEW.download_count > OLD.download_count THEN
        NEW.last_downloaded_at = NOW();
        IF NEW.first_downloaded_at IS NULL THEN
            NEW.first_downloaded_at = NOW();
        END IF;
    END IF;
    
    -- Update paid_at when status changes to 'paid'
    IF NEW.status = 'paid' AND OLD.status != 'paid' THEN
        NEW.paid_at = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update timestamps
-- Удаляем существующий триггер, если он есть
DROP TRIGGER IF EXISTS update_resource_purchases_timestamps ON menohub_resource_purchases;

CREATE TRIGGER update_resource_purchases_timestamps
    BEFORE UPDATE ON menohub_resource_purchases
    FOR EACH ROW
    EXECUTE FUNCTION update_resource_purchases_timestamps();

-- Comments
COMMENT ON TABLE menohub_resource_purchases IS 'Purchases of paid resources (guides/checklists). Each purchase gets a unique download token valid for 30 days with max 1 download (one-time use).';
COMMENT ON COLUMN menohub_resource_purchases.download_token IS 'Unique UUID token for download link. Valid for 30 days.';
COMMENT ON COLUMN menohub_resource_purchases.download_token_expires_at IS 'Expiration date for download token (30 days from purchase).';
COMMENT ON COLUMN menohub_resource_purchases.download_count IS 'Number of times the resource was downloaded (max 1 for paid resources).';
COMMENT ON COLUMN menohub_resource_purchases.max_downloads IS 'Maximum number of downloads allowed (default 1 for paid resources - one-time download).';

