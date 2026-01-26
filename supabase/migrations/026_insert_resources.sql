-- Insert existing checklists and guides into menohub_resources table

-- CHECKLISTS

-- 1. Чек-лист лабораторных анализов (динамически генерируется)
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
  'Чек-лист лабораторных анализов при менопаузе',
  'lab-checklist',
  'Подробный список анализов, которые рекомендуется сдавать в период менопаузы. Возьмите с собой на приём к врачу.',
  'Stethoscope',
  '/чек-лист лабор тесты.png',
  'dynamic', -- Генерируется через API
  '/api/guides/lab-checklist',
  'Chek-list-laboratornyh-analizov-menopauza.pdf',
  'health',
  ARRAY['анализы', 'менопауза', 'здоровье', 'подготовка к врачу'],
  1,
  true,
  false,
  'Чек-лист лабораторных анализов при менопаузе | Без |Паузы',
  'Подробный список анализов для женщин в менопаузе. Скачайте бесплатный чек-лист.',
  ARRAY['чек-лист анализов', 'менопауза анализы', 'лабораторные анализы'],
  '2024-12-20T10:00:00Z'
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  updated_at = NOW();

-- 2. Подготовка к первому разговору о менопаузе с гинекологом
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
  'Подготовка к первому разговору о менопаузе с гинекологом',
  'doctor-visit',
  'Чек-лист вопросов и информации, которую стоит подготовить перед визитом к врачу.',
  'Calendar',
  '/Gyn visit check list.png',
  'static', -- Будет статический файл
  '/guides/doctor-visit-checklist.pdf',
  'doctor-visit-checklist.pdf',
  'health',
  ARRAY['гинеколог', 'визит к врачу', 'подготовка', 'менопауза'],
  2,
  true,
  true, -- Coming soon
  'Подготовка к визиту к гинекологу | Без |Паузы',
  'Чек-лист вопросов для подготовки к визиту к гинекологу по поводу менопаузы.',
  ARRAY['чек-лист визита', 'гинеколог', 'подготовка к врачу'],
  '2024-12-21T10:00:00Z'
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  updated_at = NOW();

-- 3. Чек-лист для путешествий с приливами
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
  'Чек-лист для путешествий с приливами',
  'travel-checklist',
  'Что взять с собой в поездку, чтобы чувствовать себя комфортно и быть готовой к приливам.',
  'Plane',
  '/чек-лист путешествия.png',
  'static',
  '/guides/travel-checklist.pdf',
  'Чеклист_для_путешествий_с_приливами.pdf',
  'lifestyle',
  ARRAY['путешествия', 'приливы', 'комфорт', 'менопауза'],
  3,
  true,
  true, -- Coming soon
  'Чек-лист для путешествий с приливами | Без |Паузы',
  'Что взять в поездку для комфорта при приливах. Скачайте бесплатный чек-лист.',
  ARRAY['чек-лист путешествий', 'приливы', 'комфорт в поездке'],
  '2024-12-22T10:00:00Z'
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  updated_at = NOW();

-- GUIDES

-- 1. Противовоспалительное питание
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
  'guide',
  'Противовоспалительное питание',
  'anti-inflammatory-nutrition',
  'PDF-гайд с детальными рекомендациями, рецептами и планом питания на 21 день для снижения воспаления в организме.',
  'UtensilsCrossed',
  '/Противовоспалительное пттание гайд.png',
  'static',
  '/guides/anti-inflammatory-nutrition.pdf',
  'Гайд_по_противовоспалительному_питанию.pdf',
  'nutrition',
  ARRAY['питание', 'воспаление', 'рецепты', 'диета', 'менопауза'],
  1,
  true,
  false,
  'Противовоспалительное питание в менопаузе | Без |Паузы',
  'PDF-гайд с рецептами и планом питания на 21 день для снижения воспаления в организме.',
  ARRAY['противовоспалительное питание', 'диета менопауза', 'рецепты здоровье'],
  '2024-12-20T10:00:00Z'
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  updated_at = NOW();

-- 2. Управление приливами
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
  'guide',
  'Управление приливами',
  'hot-flashes-management',
  'Практическое руководство по уменьшению частоты и интенсивности приливов с помощью питания и образа жизни.',
  'Heart',
  '/Гайд Управление приливами.png',
  'static',
  '/guides/hot-flashes-management.pdf',
  'Гайд_по_управлению_приливами.pdf',
  'symptoms',
  ARRAY['приливы', 'симптомы', 'менопауза', 'управление'],
  2,
  true,
  true, -- Coming soon
  'Управление приливами в менопаузе | Без |Паузы',
  'Практическое руководство по уменьшению частоты и интенсивности приливов.',
  ARRAY['приливы', 'управление симптомами', 'менопауза'],
  '2024-12-21T10:00:00Z'
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  updated_at = NOW();

-- 3. Улучшение качества сна
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
  'guide',
  'Улучшение качества сна',
  'sleep-improvement',
  'Научно обоснованные методы для улучшения сна в период менопаузы.',
  'Sparkles',
  '/Гайд сон.png',
  'static',
  '/guides/sleep-improvement.pdf',
  'Гайд_по_улучшению_сна_в_менопаузе.pdf',
  'health',
  ARRAY['сон', 'бессонница', 'менопауза', 'здоровье'],
  3,
  true,
  false,
  'Улучшение сна в менопаузе | Без |Паузы',
  'Научно обоснованные методы для улучшения качества сна в период менопаузы.',
  ARRAY['сон менопауза', 'бессонница', 'качество сна'],
  '2024-12-22T10:00:00Z'
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  updated_at = NOW();

