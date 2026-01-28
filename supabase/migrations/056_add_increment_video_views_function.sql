-- Функция для увеличения счетчика просмотров видео
-- Используется в Telegram боте при просмотре видео

CREATE OR REPLACE FUNCTION increment_video_views(video_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE menohub_video_content
  SET views_count = COALESCE(views_count, 0) + 1
  WHERE id = video_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION increment_video_views IS 'Увеличивает счетчик просмотров видео на 1';
