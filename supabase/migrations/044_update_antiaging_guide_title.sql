-- Обновление названия платного гайда "Антивозрастная медицина в менопаузе" на "Антивозрастная медицина 40+"

UPDATE menohub_resources
SET 
  title = 'Антивозрастная медицина 40+',
  updated_at = NOW()
WHERE slug = 'anti-aging-medicine-menopause-guide';

-- Проверка обновления
-- SELECT title, slug FROM menohub_resources WHERE slug = 'anti-aging-medicine-menopause-guide';
