-- Создание функции для публикации контента через API
-- Эта функция будет вызываться триггерами при публикации контента

-- Функция для вызова API публикации контента
CREATE OR REPLACE FUNCTION notify_content_published()
RETURNS TRIGGER AS $$
DECLARE
  api_url TEXT;
  content_type TEXT;
  payload JSONB;
BEGIN
  -- Определяем URL API (из переменной окружения или дефолтный)
  api_url := COALESCE(
    current_setting('app.content_publish_api_url', true),
    'http://localhost:3000/api/content/publish'
  );

  -- Определяем тип контента по таблице
  IF TG_TABLE_NAME = 'menohub_blog_posts' THEN
    content_type := 'blog';
  ELSIF TG_TABLE_NAME = 'menohub_video_content' THEN
    content_type := 'video';
  ELSIF TG_TABLE_NAME = 'menohub_resources' THEN
    content_type := 'resource';
  ELSE
    -- Неизвестная таблица, пропускаем
    RETURN NEW;
  END IF;

  -- Формируем payload для API
  payload := jsonb_build_object(
    'contentType', content_type,
    'contentId', NEW.id::TEXT
  );

  -- Выполняем HTTP запрос к API (требует расширения http)
  -- ВАЖНО: Для работы этого триггера нужно установить расширение http в Supabase
  -- Если расширение недоступно, используйте альтернативный подход через webhook или Edge Function
  
  -- Альтернативный подход: запись в таблицу очереди публикаций
  -- Создадим таблицу для очереди публикаций
  INSERT INTO menohub_content_publish_queue (
    content_type,
    content_id,
    created_at
  ) VALUES (
    content_type,
    NEW.id,
    NOW()
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Логируем ошибку, но не прерываем транзакцию
    RAISE WARNING 'Ошибка при создании задачи публикации: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Создание таблицы очереди публикаций (если расширение http недоступно)
CREATE TABLE IF NOT EXISTS menohub_content_publish_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_type TEXT NOT NULL CHECK (content_type IN ('blog', 'video', 'resource')),
  content_id UUID NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  retry_count INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_content_publish_queue_status 
  ON menohub_content_publish_queue(status) 
  WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_content_publish_queue_created 
  ON menohub_content_publish_queue(created_at DESC);

-- Триггеры для автоматической публикации при изменении статуса published

-- ВАЖНО:
-- Для INSERT в триггерах нет записи OLD, поэтому условия с OLD.* нужно держать только для UPDATE.

-- blog_posts: публикуем при INSERT если уже published=true, и при UPDATE когда published/published_at изменились
DROP TRIGGER IF EXISTS trigger_publish_blog_post_insert ON menohub_blog_posts;
CREATE TRIGGER trigger_publish_blog_post_insert
  AFTER INSERT ON menohub_blog_posts
  FOR EACH ROW
  WHEN (NEW.published = TRUE)
  EXECUTE FUNCTION notify_content_published();

DROP TRIGGER IF EXISTS trigger_publish_blog_post_update ON menohub_blog_posts;
CREATE TRIGGER trigger_publish_blog_post_update
  AFTER UPDATE OF published, published_at ON menohub_blog_posts
  FOR EACH ROW
  WHEN (
    NEW.published = TRUE
    AND (
      OLD.published IS DISTINCT FROM NEW.published
      OR OLD.published_at IS DISTINCT FROM NEW.published_at
    )
  )
  EXECUTE FUNCTION notify_content_published();

-- video_content: INSERT/UPDATE аналогично
DROP TRIGGER IF EXISTS trigger_publish_video_insert ON menohub_video_content;
CREATE TRIGGER trigger_publish_video_insert
  AFTER INSERT ON menohub_video_content
  FOR EACH ROW
  WHEN (NEW.published = TRUE)
  EXECUTE FUNCTION notify_content_published();

DROP TRIGGER IF EXISTS trigger_publish_video_update ON menohub_video_content;
CREATE TRIGGER trigger_publish_video_update
  AFTER UPDATE OF published, published_at ON menohub_video_content
  FOR EACH ROW
  WHEN (
    NEW.published = TRUE
    AND (
      OLD.published IS DISTINCT FROM NEW.published
      OR OLD.published_at IS DISTINCT FROM NEW.published_at
    )
  )
  EXECUTE FUNCTION notify_content_published();

-- resources: INSERT/UPDATE аналогично
DROP TRIGGER IF EXISTS trigger_publish_resource_insert ON menohub_resources;
CREATE TRIGGER trigger_publish_resource_insert
  AFTER INSERT ON menohub_resources
  FOR EACH ROW
  WHEN (NEW.published = TRUE)
  EXECUTE FUNCTION notify_content_published();

DROP TRIGGER IF EXISTS trigger_publish_resource_update ON menohub_resources;
CREATE TRIGGER trigger_publish_resource_update
  AFTER UPDATE OF published, published_at ON menohub_resources
  FOR EACH ROW
  WHEN (
    NEW.published = TRUE
    AND (
      OLD.published IS DISTINCT FROM NEW.published
      OR OLD.published_at IS DISTINCT FROM NEW.published_at
    )
  )
  EXECUTE FUNCTION notify_content_published();

COMMENT ON TABLE menohub_content_publish_queue IS 'Очередь публикации контента. Записи обрабатываются через API /api/content/publish';
COMMENT ON FUNCTION notify_content_published() IS 'Функция-триггер для автоматического создания задач публикации при публикации контента';

