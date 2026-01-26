-- Insert "Кожа и слизистые в менопаузе" guide into menohub_resources table
-- This guide is available for free download and is stored in public/guides/

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
  'Кожа и слизистые в менопаузе — от науки к практике',
  'skin-mucous-membranes-menopause-guide',
  'Научно обоснованный EPUB-гайд о здоровье кожи и слизистых оболочек в период менопаузы. Практические рекомендации по уходу за кожей, влагалищем и мочевыводящими путями. Основан на последних клинических исследованиях 2020-2025 годов.',
  'Sparkles',
  '/guide_menopause.png', -- Используем существующее изображение или можно добавить отдельное
  'static',
  '/guides/skin-mucous-membranes-menopause-guide.epub', -- Путь к EPUB файлу в public/guides/
  'Кожа_и_слизистые_в_менопаузе.epub', -- Имя файла при скачивании
  '/guides/skin-mucous-membranes-menopause-guide.epub', -- Дублируем для EPUB поля
  'health',
  ARRAY['кожа', 'слизистые', 'менопауза', 'уход за кожей', 'вагинальная сухость', 'GSM', 'урогенитальный синдром'],
  6, -- Порядковый номер после существующих гайдов
  true,
  false,
  false, -- Бесплатный гайд
  'Кожа и слизистые в менопаузе — от науки к практике | Без |Паузы',
  'Научно обоснованный EPUB-гайд о здоровье кожи и слизистых оболочек в период менопаузы. Бесплатное скачивание.',
  ARRAY['кожа менопауза', 'слизистые менопауза', 'уход за кожей', 'вагинальная сухость', 'GSM'],
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
