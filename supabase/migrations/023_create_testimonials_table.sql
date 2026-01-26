-- Создание таблицы для отзывов/отзывов пользователей
CREATE TABLE IF NOT EXISTS menohub_testimonials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Основная информация
    quote TEXT NOT NULL,
    author_name TEXT NOT NULL,
    author_age INTEGER,
    author_location TEXT,
    author_role TEXT, -- например, "Пользователь", "Эксперт", "Врач"
    
    -- Метаданные
    rating INTEGER CHECK (rating >= 1 AND rating <= 5), -- Оценка от 1 до 5
    source TEXT, -- 'bot', 'website', 'telegram', 'email'
    verified BOOLEAN DEFAULT false, -- Проверен ли отзыв модератором
    
    -- Связи
    user_id BIGINT REFERENCES menohub_users(id) ON DELETE SET NULL, -- Если отзыв от зарегистрированного пользователя
    
    -- Медиа
    avatar_url TEXT, -- URL аватара (опционально)
    
    -- Статус
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')), -- Статус модерации
    featured BOOLEAN DEFAULT false, -- Показывать ли на главной странице
    
    -- SEO
    meta_keywords TEXT[], -- Ключевые слова для поиска
    
    -- Даты
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ, -- Дата публикации (после одобрения)
    
    -- Модерация
    moderated_by BIGINT REFERENCES menohub_users(id) ON DELETE SET NULL,
    moderated_at TIMESTAMPTZ,
    moderation_notes TEXT
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_testimonials_status ON menohub_testimonials(status);
CREATE INDEX IF NOT EXISTS idx_testimonials_featured ON menohub_testimonials(featured);
CREATE INDEX IF NOT EXISTS idx_testimonials_published_at ON menohub_testimonials(published_at);
CREATE INDEX IF NOT EXISTS idx_testimonials_rating ON menohub_testimonials(rating);
CREATE INDEX IF NOT EXISTS idx_testimonials_user_id ON menohub_testimonials(user_id);

-- RLS политики
ALTER TABLE menohub_testimonials ENABLE ROW LEVEL SECURITY;

-- Политика: все могут читать одобренные отзывы
CREATE POLICY "Anyone can view approved testimonials"
    ON menohub_testimonials
    FOR SELECT
    USING (status = 'approved' AND published_at IS NOT NULL);

-- Политика: пользователи могут создавать отзывы
CREATE POLICY "Users can create testimonials"
    ON menohub_testimonials
    FOR INSERT
    WITH CHECK (true); -- Разрешаем всем создавать, модерация через статус

-- Политика: только service role может обновлять/удалять
-- (это будет обрабатываться через API с проверкой прав)

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_testimonials_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер для автоматического обновления updated_at
CREATE TRIGGER update_testimonials_updated_at
    BEFORE UPDATE ON menohub_testimonials
    FOR EACH ROW
    EXECUTE FUNCTION update_testimonials_updated_at();

-- Комментарии
COMMENT ON TABLE menohub_testimonials IS 'Отзывы и рекомендации пользователей проекта';
COMMENT ON COLUMN menohub_testimonials.quote IS 'Текст отзыва';
COMMENT ON COLUMN menohub_testimonials.author_name IS 'Имя автора отзыва';
COMMENT ON COLUMN menohub_testimonials.verified IS 'Проверен ли отзыв модератором';
COMMENT ON COLUMN menohub_testimonials.status IS 'Статус модерации: pending, approved, rejected';
COMMENT ON COLUMN menohub_testimonials.featured IS 'Показывать ли на главной странице';

