-- Добавление поля unsubscribe_token для безопасной отписки
ALTER TABLE menohub_newsletter_subscribers
ADD COLUMN IF NOT EXISTS unsubscribe_token TEXT;

-- Создание индекса для быстрого поиска по токену
CREATE INDEX IF NOT EXISTS idx_menohub_newsletter_subscribers_unsubscribe_token 
ON menohub_newsletter_subscribers(unsubscribe_token) 
WHERE unsubscribe_token IS NOT NULL;

-- Комментарий
COMMENT ON COLUMN menohub_newsletter_subscribers.unsubscribe_token IS 'Токен для безопасной отписки от рассылки';

