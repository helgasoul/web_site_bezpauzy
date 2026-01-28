# Интеграция n8n с Supabase для отправки email уведомлений

## Текущая реализация

В базе данных уже созданы триггеры, которые при публикации контента (статьи, видео, гайды) создают записи в таблице `menohub_content_publish_queue`.

### Таблица очереди
```sql
menohub_content_publish_queue (
  id UUID PRIMARY KEY,
  content_type TEXT, -- 'blog', 'video', 'resource'
  content_id UUID,
  status TEXT, -- 'pending', 'processing', 'completed', 'failed'
  created_at TIMESTAMPTZ,
  processed_at TIMESTAMPTZ
)
```

## Варианты интеграции с n8n

### Вариант 1: Polling (опрос таблицы) - РЕКОМЕНДУЕТСЯ ✅

**Как работает:**
1. Триггер в Supabase создает запись в `menohub_content_publish_queue` со статусом `pending`
2. n8n периодически (каждые 1-5 минут) проверяет таблицу на новые записи
3. Находит записи со статусом `pending`
4. Обрабатывает их (отправляет письма через Resend)
5. Обновляет статус на `completed` или `failed`

**Преимущества:**
- ✅ Не требует настройки URL в Supabase
- ✅ Надежнее (не зависит от доступности n8n в момент публикации)
- ✅ Легко добавить retry логику
- ✅ Можно обрабатывать несколько записей за раз

**Недостатки:**
- ⚠️ Небольшая задержка (1-5 минут между проверками)

**Настройка в n8n:**
1. Создайте workflow с триггером "Schedule" (каждые 5 минут)
2. Добавьте узел "Supabase" → "Select" для получения записей:
   ```sql
   SELECT * FROM menohub_content_publish_queue 
   WHERE status = 'pending' 
   ORDER BY created_at ASC 
   LIMIT 10
   ```
3. Для каждой записи:
   - Получите данные контента из соответствующей таблицы
   - Отправьте письмо через Resend
   - Обновите статус на `completed`

---

### Вариант 2: Supabase Database Webhooks (прямой HTTP вызов)

**Как работает:**
1. В Supabase Dashboard настраивается Database Webhook
2. При публикации контента Supabase делает HTTP POST запрос к n8n webhook
3. n8n получает данные и отправляет письма

**Преимущества:**
- ✅ Мгновенная отправка (без задержки)
- ✅ Простая настройка

**Недостатки:**
- ⚠️ Требует публичный URL n8n webhook
- ⚠️ Если n8n недоступен, запрос теряется (нужна retry логика)
- ⚠️ Нужно настраивать в Supabase Dashboard (не в коде)

**Настройка:**

1. **В n8n:**
   - Создайте workflow с триггером "Webhook"
   - Скопируйте Production URL webhook (например: `https://your-n8n-instance.com/webhook/content-publish`)

2. **В Supabase Dashboard:**
   - Перейдите в Database → Webhooks
   - Создайте новый webhook:
     - **Name**: `content-publish-notification`
     - **Table**: `menohub_content_publish_queue` (или напрямую `menohub_blog_posts`)
     - **Events**: `INSERT`
     - **HTTP Request**:
       - **URL**: `https://your-n8n-instance.com/webhook/content-publish`
       - **Method**: `POST`
       - **HTTP Headers**: 
         ```json
         {
           "Content-Type": "application/json",
           "X-Webhook-Secret": "ваш-секретный-ключ"
         }
       ```
     - **HTTP Request Body**:
       ```json
       {
         "content_type": "{{ $event.data.content_type }}",
         "content_id": "{{ $event.data.content_id }}",
         "id": "{{ $event.data.id }}"
       }
       ```

3. **Альтернатива через миграцию (если хотите хранить в коде):**

   Нужно будет использовать расширение `pg_net` или настроить через Edge Function.

---

## РЕКОМЕНДАЦИЯ: Использовать Вариант 1 (Polling)

**Почему:**
- Не требует публичного URL n8n
- Надежнее и проще в поддержке
- Можно легко добавить логику повторных попыток
- Не зависит от доступности n8n в момент публикации

**Пример workflow в n8n для Варианта 1:**

```
1. Schedule Trigger (каждые 5 минут)
   ↓
2. Supabase → Select (получить pending записи)
   ↓
3. Loop (для каждой записи)
   ↓
4. Supabase → Select (получить данные контента)
   ↓
5. Supabase → Select (получить список подписчиков)
   ↓
6. Resend → Send Email (для каждого подписчика)
   ↓
7. Supabase → Update (обновить статус на 'completed')
```

---

## Для продакшна

**Если используете Вариант 1 (Polling):**
- ✅ URL не нужен в Supabase
- ✅ Убедитесь, что n8n имеет доступ к Supabase (credentials настроены)
- ✅ Настройте schedule триггер на нужную частоту (1-5 минут)

**Если используете Вариант 2 (Webhook):**
- ⚠️ Нужен публичный HTTPS URL вашего n8n webhook
- ⚠️ Настройте в Supabase Dashboard → Database → Webhooks
- ⚠️ Убедитесь, что webhook защищен (используйте секретный ключ в заголовках)

---

## Проверка работы

1. Опубликуйте тестовую статью в Supabase
2. Проверьте таблицу `menohub_content_publish_queue` - должна появиться запись
3. Дождитесь запуска n8n workflow
4. Проверьте, что письма отправлены
5. Проверьте, что статус обновлен на `completed`
