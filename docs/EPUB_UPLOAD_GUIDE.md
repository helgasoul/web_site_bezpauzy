# Инструкция по загрузке EPUB в Supabase Storage

## 📋 Обзор

EPUB файлы для платных гайдов должны храниться в Supabase Storage для безопасности и контроля доступа.

---

## 🎯 Шаг 1: Создать Bucket в Supabase Storage

1. Откройте [Supabase Dashboard](https://app.supabase.com)
2. Перейдите в ваш проект
3. Откройте раздел **Storage**
4. Нажмите **New bucket**
5. Создайте bucket с именем: `paid-resources` (или `epub-files`)
6. Настройки:
   - **Public bucket**: ❌ НЕТ (приватный, доступ только через API)
   - **File size limit**: 50 MB (или больше, если нужно)
   - **Allowed MIME types**: `application/epub+zip`

---

## 🎯 Шаг 2: Загрузить EPUB файл

### Вариант A: Через Supabase Dashboard (проще)

1. В Supabase Dashboard → **Storage** → выберите bucket `paid-resources`
2. Нажмите **Upload file**
3. Выберите ваш EPUB файл
4. После загрузки скопируйте путь к файлу (например: `paid-resources/anti-inflammatory-nutrition.epub`)

### Вариант B: Через API (программно)

Можно использовать скрипт для загрузки (см. ниже).

---

## 🎯 Шаг 3: Обновить запись в БД

После загрузки файла нужно обновить запись в таблице `menohub_resources`:

```sql
UPDATE menohub_resources
SET 
  epub_file_path = 'epub-files/anti-inflammatory-nutrition.epub',
  is_paid = true,
  price_kopecks = 39900
WHERE slug = 'anti-inflammatory-nutrition';
```

**Где:**
- `epub_file_path` — путь к файлу в Storage (bucket/имя_файла.epub)
- `is_paid` — `true` для платного гайда
- `price_kopecks` — цена в копейках (39900 = 399₽)

---

## 📝 Пример SQL запроса

```sql
-- Пример для гайда "Противовоспалительное питание"
UPDATE menohub_resources
SET 
  epub_file_path = 'epub-files/anti-inflammatory-nutrition.epub',
  is_paid = true,
  price_kopecks = 39900,
  download_limit = 3
WHERE slug = 'anti-inflammatory-nutrition';
```

---

## 🔒 Настройка RLS (Row Level Security) для Storage

Важно настроить политики доступа, чтобы файлы были доступны только через API:

1. В Supabase Dashboard → **Storage** → **Policies**
2. Для bucket `paid-resources` создайте политику:

```sql
-- Политика: Доступ только через service role (для API)
CREATE POLICY "Service role can access epub-files"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'epub-files' AND
  auth.role() = 'service_role'
);
```

Или используйте более строгую политику:

```sql
-- Политика: Доступ только для загруженных файлов
CREATE POLICY "Allow service role to read paid resources"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'paid-resources'
);
```

---

## 🛠️ Скрипт для загрузки (опционально)

Если нужно загружать файлы программно, можно создать скрипт:

```typescript
// scripts/upload-epub.ts
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function uploadEPUB(filePath: string, fileName: string) {
  const fileContent = readFileSync(filePath)
  
  const { data, error } = await supabase.storage
    .from('paid-resources')
    .upload(fileName, fileContent, {
      contentType: 'application/epub+zip',
      upsert: true, // Перезаписать, если существует
    })

  if (error) {
    console.error('Error uploading file:', error)
    return null
  }

  console.log('✅ File uploaded:', data.path)
  return data.path
}

// Использование:
// uploadEPUB('./path/to/file.epub', 'anti-inflammatory-nutrition.epub')
```

---

## 📁 Рекомендуемая структура файлов

```
Supabase Storage:
  paid-resources/
    ├── anti-inflammatory-nutrition.epub
    ├── bone-health-guide.epub
    └── ...
```

**Имена файлов:**
- Используйте slug ресурса: `anti-inflammatory-nutrition.epub`
- Или UUID: `abc123-def456.epub` (если нужна дополнительная безопасность)

---

## ✅ Проверка загрузки

После загрузки проверьте:

1. **Файл в Storage:**
   - Supabase Dashboard → Storage → `paid-resources`
   - Файл должен быть виден

2. **Запись в БД:**
   ```sql
   SELECT slug, title, is_paid, price_kopecks, epub_file_path
   FROM menohub_resources
   WHERE is_paid = true;
   ```

3. **Доступ через API:**
   - Файл должен быть доступен только через API route `/api/resources/download/[token]`
   - Прямой доступ к Storage URL должен быть заблокирован

---

## 🔐 Безопасность

1. **Bucket должен быть приватным** (не public)
2. **RLS политики** должны разрешать доступ только через service role
3. **Прямые ссылки на файлы не должны быть доступны** пользователям
4. **Доступ только через токен** в API route

---

## 📝 Резюме

1. ✅ Создать bucket `paid-resources` в Supabase Storage
2. ✅ Загрузить EPUB файл в bucket
3. ✅ Обновить запись в `menohub_resources` с путем к файлу
4. ✅ Настроить RLS политики для безопасности
5. ✅ Проверить доступ через API

---

## 🆘 Если что-то не работает

1. **Файл не загружается:**
   - Проверьте размер файла (лимит bucket)
   - Проверьте MIME type
   - Проверьте права доступа

2. **Файл не доступен через API:**
   - Проверьте RLS политики
   - Проверьте путь к файлу в БД
   - Проверьте service role key

3. **Ошибка при скачивании:**
   - Проверьте, что файл существует в Storage
   - Проверьте путь в `epub_file_path`
   - Проверьте логи API route

