# Инструкция по применению миграций для экспертов

## Проблема
На страницах экспертов (гинеколог и нутрициолог) не отображаются:
- Фотографии экспертов
- Портфолио (CV)

## Причина
Миграции SQL не применены к базе данных Supabase.

## Решение

### Шаг 1: Откройте Supabase Dashboard
1. Перейдите на https://app.supabase.com
2. Выберите ваш проект
3. Перейдите в раздел **SQL Editor**

### Шаг 2: Примените миграцию для гинеколога

Откройте файл `supabase/migrations/038_update_shamugia_expert_data.sql` и скопируйте весь SQL.

Выполните этот SQL в Supabase SQL Editor. Он добавит:
- Изображение: `/shamugia-natiya.jpg`
- Полное портфолио (CV) в формате Markdown

### Шаг 3: Примените миграцию для нутрициолога

Откройте файл `supabase/migrations/036_update_klimkova_expert_data.sql` и скопируйте весь SQL.

Выполните этот SQL в Supabase SQL Editor. Он добавит:
- Изображение: `/marina-klimkova.jpg`
- (CV уже было в этой миграции)

### Шаг 4: Проверьте результаты

После применения миграций:

1. Откройте консоль браузера (F12 → Console)
2. Перейдите на страницу эксперта (например, `/experts/gynecologist`)
3. В консоли вы увидите логи:
   ```
   ExpertPage expert data: {
     name: "...",
     hasImage: true/false,
     image: "/shamugia-natiya.jpg",
     hasCv: true/false,
     cvLength: 1234
   }
   ```

Если `hasImage: false` или `hasCv: false`, значит миграции не применены или данные не обновились.

### Шаг 5: Проверка через Supabase Dashboard

Вы можете также проверить данные напрямую:

1. В Supabase Dashboard перейдите в **Table Editor**
2. Откройте таблицу `menohub_experts`
3. Проверьте записи для:
   - `category = 'gynecologist'` - должно быть поле `image` и `cv`
   - `category = 'nutritionist'` - должно быть поле `image` и `cv`

## Альтернативный способ: Проверка SQL запросом

Выполните в Supabase SQL Editor:

```sql
-- Проверка данных экспертов
SELECT 
  category,
  name,
  image,
  CASE 
    WHEN cv IS NULL OR cv = '' THEN 'НЕТ CV'
    ELSE 'ЕСТЬ CV (' || LENGTH(cv) || ' символов)'
  END as cv_status,
  CASE 
    WHEN image IS NULL OR image = '' THEN 'НЕТ ИЗОБРАЖЕНИЯ'
    ELSE 'ЕСТЬ: ' || image
  END as image_status
FROM menohub_experts
WHERE category IN ('gynecologist', 'nutritionist', 'mammologist')
ORDER BY category;
```

Этот запрос покажет статус данных для всех экспертов.

## Если миграции не работают

Если после применения миграций данные все еще не отображаются:

1. Проверьте, что файлы изображений существуют:
   - `/public/shamugia-natiya.jpg` - для гинеколога
   - `/public/marina-klimkova.jpg` - для нутрициолога

2. Очистите кэш Next.js:
   ```bash
   rm -rf .next
   npm run dev
   ```

3. Проверьте, что серверная функция `getExpertByCategory` правильно получает данные из базы.
