-- Добавление колонок для синхронизации чата между Telegram и сайтом
-- Позволяет отслеживать источник сообщения и связывать с Telegram message_id

-- Добавить колонку source для указания источника сообщения ('telegram' или 'website')
ALTER TABLE menohub_queries
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'website';

-- Добавить колонку telegram_message_id для хранения ID сообщения из Telegram
ALTER TABLE menohub_queries
ADD COLUMN IF NOT EXISTS telegram_message_id BIGINT;

-- Обновить существующие записи, установив source='website' для всех NULL значений
UPDATE menohub_queries
SET source = 'website'
WHERE source IS NULL;

-- Добавить индекс для быстрого поиска по источнику и пользователю
CREATE INDEX IF NOT EXISTS idx_menohub_queries_user_source
ON menohub_queries(user_id, source, created_at DESC);

-- Добавить индекс для поиска по telegram_message_id
CREATE INDEX IF NOT EXISTS idx_menohub_queries_telegram_message_id
ON menohub_queries(telegram_message_id)
WHERE telegram_message_id IS NOT NULL;

-- Комментарии для документации
COMMENT ON COLUMN menohub_queries.source IS 'Источник сообщения: telegram или website';
COMMENT ON COLUMN menohub_queries.telegram_message_id IS 'ID сообщения в Telegram (если сообщение пришло из Telegram)';
