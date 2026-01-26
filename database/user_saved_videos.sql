-- Таблица для сохраненных видео пользователей
-- Выполните этот SQL в Supabase SQL Editor

CREATE TABLE IF NOT EXISTS user_saved_videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id BIGINT NOT NULL REFERENCES menohub_users(id) ON DELETE CASCADE,
  video_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  duration INTEGER, -- в секундах
  category TEXT,
  video_url TEXT,
  saved_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, video_id)
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_user_saved_videos_user_id ON user_saved_videos(user_id);
CREATE INDEX IF NOT EXISTS idx_user_saved_videos_saved_at ON user_saved_videos(saved_at DESC);

-- RLS политики (Row Level Security)
ALTER TABLE user_saved_videos ENABLE ROW LEVEL SECURITY;

-- Пользователи могут видеть только свои сохраненные видео
CREATE POLICY "Users can view their own saved videos"
  ON user_saved_videos
  FOR SELECT
  USING (auth.uid()::text = user_id::text OR 
         EXISTS (
           SELECT 1 FROM menohub_users 
           WHERE id = user_saved_videos.user_id 
           AND telegram_id = (current_setting('request.jwt.claims', true)::json->>'telegram_id')::bigint
         ));

-- Пользователи могут добавлять свои сохраненные видео
CREATE POLICY "Users can insert their own saved videos"
  ON user_saved_videos
  FOR INSERT
  WITH CHECK (true); -- Можно ограничить через приложение

-- Пользователи могут удалять свои сохраненные видео
CREATE POLICY "Users can delete their own saved videos"
  ON user_saved_videos
  FOR DELETE
  USING (auth.uid()::text = user_id::text OR 
         EXISTS (
           SELECT 1 FROM menohub_users 
           WHERE id = user_saved_videos.user_id 
           AND telegram_id = (current_setting('request.jwt.claims', true)::json->>'telegram_id')::bigint
         ));

