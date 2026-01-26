-- Создание таблицы для хранения настроек cookie авторизованных пользователей
-- Это позволяет синхронизировать настройки между устройствами

CREATE TABLE IF NOT EXISTS menohub_user_cookie_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id BIGINT NOT NULL, -- References menohub_users(id) - если используете Supabase Auth, можно использовать UUID
  preferences JSONB NOT NULL, -- {"necessary": true, "analytics": false, "marketing": false, "functional": false, "timestamp": ...}
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Один пользователь - одна запись (обновляем при изменении)
  UNIQUE(user_id)
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_user_cookie_preferences_user_id 
  ON menohub_user_cookie_preferences(user_id);

CREATE INDEX IF NOT EXISTS idx_user_cookie_preferences_updated_at 
  ON menohub_user_cookie_preferences(updated_at DESC);

-- Enable Row Level Security
ALTER TABLE menohub_user_cookie_preferences ENABLE ROW LEVEL SECURITY;

-- Policy: Пользователи могут читать только свои настройки (через RLS будет проверяться на уровне приложения)
-- RLS политики будут настроены через сервисную роль в API routes
-- Для простоты используем только service role для всех операций

-- Service role может все (для API routes)
CREATE POLICY "Service role can manage all cookie preferences"
  ON menohub_user_cookie_preferences
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_user_cookie_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер для обновления updated_at
CREATE TRIGGER update_user_cookie_preferences_updated_at
  BEFORE UPDATE ON menohub_user_cookie_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_user_cookie_preferences_updated_at();

COMMENT ON TABLE menohub_user_cookie_preferences IS 'Настройки cookie для авторизованных пользователей. Позволяет синхронизировать настройки между устройствами.';
COMMENT ON COLUMN menohub_user_cookie_preferences.preferences IS 'JSON объект с настройками: {"necessary": true, "analytics": false, "marketing": false, "functional": false, "timestamp": 1234567890}';

