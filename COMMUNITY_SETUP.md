# Настройка формы регистрации в сообщество

## 1. Создание таблицы в Supabase

Выполните SQL миграцию в Supabase Dashboard:

1. Откройте Supabase Dashboard → SQL Editor
2. Скопируйте содержимое файла `supabase/migrations/001_create_community_members.sql`
3. Выполните SQL запрос

Или выполните через CLI:
```bash
supabase migration up
```

## 2. Структура таблицы `menohub_community_members`

Таблица содержит следующие поля:
- `id` - UUID, первичный ключ
- `name` - Имя участника (обязательно)
- `email` - Email адрес (обязательно, уникальный)
- `age` - Возрастная группа (например, "45-50")
- `location` - Город (необязательно)
- `interests` - JSONB массив интересов (необязательно)
- `status` - Статус: 'active', 'inactive', 'unsubscribed'
- `joined_at` - Дата присоединения
- `last_active_at` - Дата последней активности
- `unsubscribed_at` - Дата отписки
- `created_at` - Дата создания записи
- `updated_at` - Дата обновления записи

## 3. API Endpoint

Форма отправляет данные на `/api/community/join` (POST запрос).

### Request Body:
```json
{
  "name": "Имя",
  "email": "email@example.com",
  "age": "45-50",
  "location": "Москва",
  "consent": true
}
```

### Response (Success):
```json
{
  "success": true,
  "message": "Вы успешно присоединились к сообществу",
  "member": {
    "id": "uuid",
    "email": "email@example.com"
  }
}
```

### Response (Error):
```json
{
  "error": "Сообщение об ошибке"
}
```

## 4. Компоненты

### `CommunityJoinModal`
Модальное окно с формой регистрации. Использует:
- `react-hook-form` для управления формой
- `zod` для валидации
- `framer-motion` для анимаций

### `JoinCommunityButton`
Кнопка, которая открывает модальное окно регистрации.

## 5. Интеграция email-рассылки (TODO)

После успешной регистрации можно добавить отправку приветственного письма:

1. Интегрировать SendGrid или другой email-сервис
2. Добавить отправку письма в `app/api/community/join/route.ts` после успешного сохранения

Пример:
```typescript
// После успешного сохранения в БД
await sendWelcomeEmail({
  to: validatedData.email,
  name: validatedData.name,
})
```

## 6. Безопасность

- Валидация данных на клиенте и сервере
- Проверка уникальности email
- Row Level Security (RLS) включен в Supabase
- Защита от спама (можно добавить rate limiting)

## 7. Следующие шаги

1. ✅ Создать таблицу в Supabase
2. ✅ Настроить переменные окружения (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)
3. ⏳ Настроить email-рассылку (опционально)
4. ⏳ Добавить аналитику регистраций
5. ⏳ Создать админ-панель для управления участниками (опционально)

