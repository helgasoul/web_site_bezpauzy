-- Создание таблицы для экспертов проекта
-- Расширяет информацию об экспертах для страниц

CREATE TABLE IF NOT EXISTS menohub_experts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT NOT NULL UNIQUE CHECK (category IN ('gynecologist', 'mammologist', 'nutritionist')),
  category_name TEXT NOT NULL, -- 'Кабинет гинеколога', 'Кабинет маммолога', 'Кухня нутрициолога'
  name TEXT NOT NULL, -- Полное имя эксперта
  specialization TEXT NOT NULL, -- Специализация (например, 'Гинеколог-эндокринолог')
  role TEXT NOT NULL, -- Роль для отображения (например, 'Гинеколог')
  description TEXT NOT NULL, -- Краткое описание
  image TEXT, -- URL фото эксперта
  cv TEXT, -- Портфолио/CV (текст или Markdown)
  cv_html TEXT, -- CV в HTML формате (если нужно)
  bio TEXT, -- Биография эксперта
  
  -- Контактная информация для записи
  bot_command TEXT, -- Команда для бота (например, 'consultation_gynecologist')
  telegram_bot_link TEXT, -- Ссылка на бота с контекстом записи
  
  -- Метаданные
  order_index INTEGER DEFAULT 0, -- Порядок отображения
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_experts_category ON menohub_experts(category);
CREATE INDEX IF NOT EXISTS idx_experts_order ON menohub_experts(order_index);

-- Enable Row Level Security
ALTER TABLE menohub_experts ENABLE ROW LEVEL SECURITY;

-- Удаляем существующие политики, если они есть (для повторного применения миграции)
DROP POLICY IF EXISTS "Anyone can read experts" ON menohub_experts;
DROP POLICY IF EXISTS "Service role can manage experts" ON menohub_experts;

-- Policy: Все могут читать информацию об экспертах
CREATE POLICY "Anyone can read experts"
  ON menohub_experts
  FOR SELECT
  USING (true);

-- Policy: Service role может управлять экспертами
CREATE POLICY "Service role can manage experts"
  ON menohub_experts
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_experts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер для обновления updated_at (удаляем, если существует)
DROP TRIGGER IF EXISTS update_experts_updated_at ON menohub_experts;
CREATE TRIGGER update_experts_updated_at
  BEFORE UPDATE ON menohub_experts
  FOR EACH ROW
  EXECUTE FUNCTION update_experts_updated_at();

-- Вставка данных о существующих экспертах
INSERT INTO menohub_experts (category, category_name, name, specialization, role, description, bot_command, telegram_bot_link, order_index, image)
VALUES
  (
    'mammologist',
    'Кабинет маммолога',
    'Пучкова Ольга',
    'Маммолог-онколог',
    'Маммолог',
    'Специалист по диагностике и лечению заболеваний молочной железы. Помогает женщинам после 40 лет правильно организовать скрининг и заботиться о здоровье груди.',
    'consultation_mammologist',
    'https://t.me/bezpauzy_bot?start=consultation_mammologist',
    1
  ),
  (
    'gynecologist',
    'Кабинет гинеколога',
    'Шамугия Натия',
    'Гинеколог-эндокринолог',
    'Гинеколог',
    'Специалист по женскому здоровью и гормональной терапии. Помогает разобраться в симптомах менопаузы и подобрать индивидуальный подход к лечению.',
    'consultation_gynecologist',
    'https://t.me/bezpauzy_bot?start=consultation_gynecologist',
    2
  ),
  (
    'nutritionist',
    'Кухня нутрициолога',
    'Климкова Марина',
    'Нутрициолог',
    'Нутрициолог',
    'Специалист по питанию в менопаузе. Помогает составить рацион, который поддерживает здоровье, контролирует вес и снижает риски возрастных изменений.',
    'consultation_nutritionist',
    'https://t.me/bezpauzy_bot?start=consultation_nutritionist',
    3,
    '/marina-klimkova.jpg'
  )
ON CONFLICT (category) DO UPDATE SET
  name = EXCLUDED.name,
  specialization = EXCLUDED.specialization,
  role = EXCLUDED.role,
  description = EXCLUDED.description,
  bot_command = EXCLUDED.bot_command,
  telegram_bot_link = EXCLUDED.telegram_bot_link,
  image = EXCLUDED.image,
  updated_at = NOW();

COMMENT ON TABLE menohub_experts IS 'Информация об экспертах проекта. Используется для создания персональных страниц экспертов.';
COMMENT ON COLUMN menohub_experts.cv IS 'Портфолио эксперта в формате текста или Markdown';
COMMENT ON COLUMN menohub_experts.bot_command IS 'Команда для бота для записи на консультацию к этому эксперту';

