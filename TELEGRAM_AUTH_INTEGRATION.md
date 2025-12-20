# Интеграция аутентификации через Telegram

## Обзор

Система позволяет пользователям, зарегистрированным в Telegram боте, входить в личный кабинет на сайте через временный код.

## Как это работает

1. **Пользователь на сайте** нажимает "Войти через Telegram"
2. **Сайт генерирует** уникальный 6-значный код и сохраняет в Supabase
3. **Пользователь открывает бота** в Telegram и запрашивает код
4. **Бот отправляет код** пользователю
5. **Пользователь вводит код** на сайте
6. **Сайт проверяет код** и создает сессию

## Настройка в n8n

### Шаг 1: Добавьте команду `/code` в бот

В вашем n8n workflow добавьте обработку команды `/code`:

```
Если message.text содержит "/code":
  → Получить telegram_id пользователя
  → Найти последний неиспользованный код для этого telegram_id
  → Если код найден, отправить его пользователю
  → Если код не найден, сообщить пользователю, что нужно сначала создать код на сайте
```

### Шаг 2: Обновите код при запросе

Когда пользователь запрашивает код в боте, нужно обновить запись в таблице `menohub_telegram_auth_codes`:

```sql
UPDATE menohub_telegram_auth_codes
SET telegram_id = {telegram_id пользователя}
WHERE code = {код, который был создан на сайте}
AND telegram_id = 0
AND used = FALSE
AND expires_at > NOW()
ORDER BY created_at DESC
LIMIT 1
```

### Пример n8n workflow для команды `/code`:

1. **Switch node** - проверяет, содержит ли сообщение "/code"
2. **Get user from Supabase** - получает telegram_id из `menohub_users`
3. **Execute SQL** или **Supabase Update**:
   - Ищет последний неиспользованный код в таблице `menohub_telegram_auth_codes` (где `telegram_id = 0`)
   - Обновляет его, устанавливая `telegram_id` пользователя
4. **Send Telegram message** - отправляет код пользователю

### SQL запрос для n8n:

```sql
-- Найти последний неиспользованный код и связать с пользователем
UPDATE menohub_telegram_auth_codes
SET telegram_id = {{ $json.telegram_id }}
WHERE id = (
  SELECT id 
  FROM menohub_telegram_auth_codes
  WHERE telegram_id = 0
    AND used = FALSE
    AND expires_at > NOW()
  ORDER BY created_at DESC
  LIMIT 1
)
RETURNING code;
```

### Альтернативный подход (проще для n8n):

1. **HTTP Request node** в n8n:
   - Method: POST
   - URL: `https://ваш-сайт.ru/api/auth/telegram/generate-code`
   - Это создаст код и вернет его
   
2. **Supabase Update node**:
   - Обновляет код, устанавливая `telegram_id` пользователя
   
3. **Send Telegram message**:
   - Отправляет код пользователю

## Структура таблицы `menohub_telegram_auth_codes`

```sql
CREATE TABLE menohub_telegram_auth_codes (
    id UUID PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,        -- 6-значный код
    telegram_id BIGINT,               -- ID пользователя в Telegram (0 = не активирован)
    user_id UUID,                     -- Связь с menohub_users (опционально)
    expires_at TIMESTAMPTZ NOT NULL,  -- Время истечения (5 минут)
    used BOOLEAN DEFAULT FALSE,       -- Использован ли код
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## API Endpoints

### 1. `POST /api/auth/telegram/generate-code`
Генерирует новый код.

**Response:**
```json
{
  "success": true,
  "code": "123456",
  "expiresAt": "2024-01-01T12:05:00Z"
}
```

### 2. `POST /api/auth/telegram/verify-code`
Проверяет код и создает сессию.

**Request:**
```json
{
  "code": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "telegramId": 123456789,
    "email": "user@example.com",
    "ageRange": "46-50",
    "city": "Москва",
    "subscriptionStatus": "active",
    "subscriptionPlan": "Paid1"
  }
}
```

### 3. `GET /api/auth/telegram/get-session`
Проверяет текущую сессию.

**Response:**
```json
{
  "authenticated": true,
  "user": { ... }
}
```

### 4. `POST /api/auth/telegram/logout`
Выход из системы.

## Использование в компонентах

```tsx
import { TelegramAuthModal } from '@/components/auth/TelegramAuthModal'

function MyComponent() {
  const [showAuth, setShowAuth] = useState(false)
  const [user, setUser] = useState(null)

  return (
    <>
      <button onClick={() => setShowAuth(true)}>
        Войти через Telegram
      </button>
      
      <TelegramAuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        onSuccess={(userData) => {
          setUser(userData)
          // Перенаправить в личный кабинет
        }}
      />
    </>
  )
}
```

## Безопасность

1. **Коды истекают через 5 минут**
2. **Код можно использовать только один раз**
3. **Код должен быть активирован ботом** (telegram_id должен быть установлен)
4. **Сессии хранятся в httpOnly cookies**

## Дополнительные улучшения

1. **Rate limiting** - ограничить количество попыток генерации кода
2. **Email уведомления** - отправлять код на email (если есть)
3. **QR-код** - генерировать QR-код для быстрого входа
4. **Telegram Login Widget** - использовать официальный виджет Telegram (альтернатива)

