-- Insert "ЧЕК-ЛИСТ: МОЙ ПЛАН ЗАЩИТЫ ГРУДИ ОТ РАКА" checklist into menohub_resources table

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
  category,
  tags,
  order_index,
  published,
  coming_soon,
  meta_title,
  meta_description,
  meta_keywords,
  published_at
) VALUES (
  'checklist',
  'ЧЕК-ЛИСТ: МОЙ ПЛАН ЗАЩИТЫ ГРУДИ ОТ РАКА',
  'breast-cancer-protection-plan',
  'Практический чек-лист для составления личного плана защиты груди от рака. Включает рекомендации по обследованиям, профилактике и самоконтролю.',
  'CheckCircle2',
  '/article_10.png',
  'static',
  '/guides/CHEKLIST-PLAN_PITANIE.pdf',
  'CHEKLIST-PLAN_PITANIE.pdf',
  'health',
  ARRAY['рак груди', 'маммология', 'профилактика', 'здоровье груди', 'обследование', 'чек-лист'],
  4,
  true,
  false,
  'Чек-лист: Мой план защиты груди от рака | Без |Паузы',
  'Практический чек-лист для составления личного плана защиты груди от рака. Скачайте бесплатный PDF.',
  ARRAY['чек-лист рак груди', 'профилактика рака груди', 'маммология', 'здоровье груди'],
  NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  pdf_file_path = EXCLUDED.pdf_file_path,
  pdf_filename = EXCLUDED.pdf_filename,
  updated_at = NOW();
