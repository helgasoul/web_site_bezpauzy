-- Insert free EPUB guides into menohub_resources table
-- These guides are available for free download and are stored in public/guides/

-- 1. ГАЙД ПО РАСШИРЕНИЮ ВОЗМОЖНОСТЕЙ В МЕНОПАУЗЕ (Libido/Sexuality Guide)
INSERT INTO menohub_resources (
  resource_type,
  title,
  slug,
  description,
  icon_name,
  cover_image,
  pdf_source,
  pdf_file_path,
  pdf_filename,
  epub_file_path,
  category,
  tags,
  order_index,
  published,
  coming_soon,
  is_paid,
  meta_title,
  meta_description,
  meta_keywords,
  published_at
) VALUES (
  'guide',
  'Гайд по расширению возможностей в менопаузе',
  'libido-expansion-menopause-guide',
  'Научно обоснованный EPUB-гайд о сексуальном здоровье и либидо в период менопаузы. Практические рекомендации, решения проблем и улучшение качества интимной жизни.',
  'Heart',
  '/guide_antiage.png', -- Используем существующее изображение
  'static',
  '/guides/ГАЙД ПО РАСШИРЕНИЮ ВОЗМОЖНОСТЕЙ В МЕНОПАУЗЕ.epub', -- Путь к EPUB файлу в public/guides/
  'Гайд_по_расширению_возможностей_в_менопаузе.epub', -- Имя файла при скачивании
  '/guides/ГАЙД ПО РАСШИРЕНИЮ ВОЗМОЖНОСТЕЙ В МЕНОПАУЗЕ.epub', -- Дублируем для EPUB поля (для будущей логики EPUB)
  'health',
  ARRAY['либидо', 'сексуальность', 'менопауза', 'интимное здоровье', 'GSM', 'вагинальная сухость'],
  4, -- Следующий порядковый номер после существующих гайдов
  true,
  false,
  false, -- Бесплатный гайд
  'Гайд по расширению возможностей в менопаузе | Без |Паузы',
  'Научно обоснованный EPUB-гайд о сексуальном здоровье и либидо в период менопаузы. Бесплатное скачивание.',
  ARRAY['либидо менопауза', 'сексуальное здоровье', 'интимная жизнь', 'вагинальная сухость'],
  NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  pdf_file_path = EXCLUDED.pdf_file_path,
  epub_file_path = EXCLUDED.epub_file_path,
  pdf_filename = EXCLUDED.pdf_filename,
  is_paid = EXCLUDED.is_paid,
  updated_at = NOW();

-- ====================================================================
-- КОММЕНТАРИИ ДЛЯ БУДУЩИХ ОБНОВЛЕНИЙ
-- ====================================================================

-- Обновление существующих бесплатных гайдов: Управление приливами и Улучшение качества сна
-- Эти гайды должны быть в формате EPUB, но сейчас указаны как PDF
-- Когда EPUB файлы будут готовы, можно обновить пути через отдельную миграцию

-- Комментарий для будущих обновлений:
-- Для "Управление приливами" (slug: 'hot-flashes-management'):
-- UPDATE menohub_resources 
-- SET pdf_file_path = '/guides/hot-flashes-management.epub',
--     epub_file_path = '/guides/hot-flashes-management.epub',
--     pdf_filename = 'Гайд_по_управлению_приливами.epub',
--     pdf_source = 'static',
--     is_paid = false,
--     updated_at = NOW()
-- WHERE slug = 'hot-flashes-management';

-- Для "Улучшение качества сна" (slug: 'sleep-improvement'):
-- UPDATE menohub_resources 
-- SET pdf_file_path = '/guides/sleep-improvement.epub',
--     epub_file_path = '/guides/sleep-improvement.epub',
--     pdf_filename = 'Гайд_по_улучшению_сна_в_менопаузе.epub',
--     pdf_source = 'static',
--     is_paid = false,
--     updated_at = NOW()
-- WHERE slug = 'sleep-improvement';

-- 3. Для "Здоровье молочных желез" - нужно будет добавить, когда будет готов файл
-- Пример структуры (когда файл будет готов):
-- INSERT INTO menohub_resources (
--   resource_type, title, slug, description, icon_name, cover_image,
--   pdf_source, pdf_file_path, pdf_filename, epub_file_path,
--   category, tags, order_index, published, coming_soon, is_paid,
--   meta_title, meta_description, meta_keywords, published_at
-- ) VALUES (
--   'guide',
--   'Здоровье молочных желез',
--   'breast-health-menopause-guide',
--   'Научно обоснованный EPUB-гайд о здоровье молочных желез в период менопаузы.',
--   'HeartPulse',
--   '/cover-breast-health.png',
--   'static',
--   '/guides/breast-health-menopause-guide.epub',
--   'Гайд_по_здоровью_молочных_желез.epub',
--   '/guides/breast-health-menopause-guide.epub',
--   'health',
--   ARRAY['молочные железы', 'маммология', 'скрининг', 'менопауза'],
--   5,
--   true,
--   false,
--   false,
--   'Здоровье молочных желез в менопаузе | Без |Паузы',
--   'Научно обоснованный EPUB-гайд о здоровье молочных желез в период менопаузы. Бесплатное скачивание.',
--   ARRAY['молочные железы', 'маммография', 'скрининг груди'],
--   NOW()
-- )
-- ON CONFLICT (slug) DO UPDATE SET
--   title = EXCLUDED.title,
--   description = EXCLUDED.description,
--   updated_at = NOW();

-- ====================================================================
-- ПЛАТНЫЙ ГАЙД: Антивозрастная медицина 40+ (499₽)
-- ====================================================================
INSERT INTO menohub_resources (
  resource_type,
  title,
  slug,
  description,
  icon_name,
  cover_image,
  pdf_source,
  pdf_file_path,
  pdf_filename,
  epub_file_path,
  category,
  tags,
  order_index,
  published,
  coming_soon,
  is_paid,
  price_kopecks,
  download_limit,
  meta_title,
  meta_description,
  meta_keywords,
  published_at
) VALUES (
  'guide',
  'Антивозрастная медицина 40+',
  'anti-aging-medicine-menopause-guide',
  'Премиальный EPUB-гайд по антивозрастной медицине специально для женщин в период менопаузы. Научно обоснованные протоколы, биомаркеры старения, гормональная оптимизация и долголетие.',
  'Sparkles',
  '/guide_antiage.png', -- Обложка для гайда по антивозрастной медицине
  'supabase_storage', -- Платные гайды хранятся в Supabase Storage
  NULL, -- Для платных EPUB не используем pdf_file_path
  'Гайд_по_антивозрастной_медицине_в_менопаузе.epub', -- Имя файла при скачивании
  'epub-files/anti-aging-medicine-menopause-guide.epub', -- Путь к EPUB в Supabase Storage bucket 'epub-files'
  'health',
  ARRAY['антивозрастная медицина', 'долголетие', 'биомаркеры', 'менопауза', 'здоровье', 'омоложение'],
  5, -- Порядковый номер для платного гайда
  true,
  false,
  true, -- Платный гайд
  49900, -- 499 рублей = 49900 копеек
  1, -- Лимит скачиваний: 1 раз (одноразовая ссылка)
  'Антивозрастная медицина 40+ | Без |Паузы',
  'Премиальный EPUB-гайд по антивозрастной медицине для женщин 40+. Научные протоколы долголетия и здоровья. Цена: 499₽',
  ARRAY['антивозрастная медицина', 'долголетие', 'биомаркеры старения', 'менопауза', 'здоровье после 40'],
  NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  epub_file_path = EXCLUDED.epub_file_path,
  pdf_filename = EXCLUDED.pdf_filename,
  is_paid = EXCLUDED.is_paid,
  price_kopecks = EXCLUDED.price_kopecks,
  download_limit = EXCLUDED.download_limit,
  updated_at = NOW();

-- Комментарии
COMMENT ON TABLE menohub_resources IS 'Checklists and guides (resources) available for download. Supports both PDF and EPUB formats. Free resources are stored in public/guides/, paid resources in Supabase Storage bucket ''epub-files''.';