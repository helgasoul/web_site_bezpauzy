-- ============================================================
-- Увеличение лимита размера файла для bucket (Supabase Storage)
-- ============================================================
-- Если в Supabase UI при Edit bucket появляетcя
-- "Failed to update bucket: API error happened while trying
-- to communicate with the server" — лимит не сохраняется через
-- интерфейс. Меняйте его напрямую в БД через SQL Editor.
--
-- Лимит задаётся ОТДЕЛЬНО по каждому bucket (public-assets,
-- menohub_videos и т.д.). Ниже: посмотреть лимиты и выставить нужные.
-- ============================================================

-- 1) Посмотреть все bucket и их лимиты (SQL Editor в Supabase):
SELECT
  name,
  file_size_limit,
  file_size_limit / 1024.0 / 1024.0 AS limit_mb
FROM storage.buckets
ORDER BY name;

-- 2) menohub_videos: лимит 500 MB (524288000 байт)
--    Выполните в SQL Editor, если через Edit bucket не сохраняется.
UPDATE storage.buckets
SET file_size_limit = 524288000
WHERE name = 'menohub_videos';

-- 3) menohub_videos: убрать ограничение (NULL)
-- UPDATE storage.buckets
-- SET file_size_limit = NULL
-- WHERE name = 'menohub_videos';

-- 4) menohub_videos: лимит 500 GB (если нужен очень большой)
-- UPDATE storage.buckets
-- SET file_size_limit = 536870912000
-- WHERE name = 'menohub_videos';

-- 5) public-assets (для welcome-video и т.п.):
UPDATE storage.buckets
SET file_size_limit = 536870912000
WHERE name = 'public-assets';

-- UPDATE storage.buckets SET file_size_limit = NULL WHERE name = 'public-assets';

--6) Выровнять лимит у всех bucket (500 GB):
-- UPDATE storage.buckets SET file_size_limit = 536870912000;
