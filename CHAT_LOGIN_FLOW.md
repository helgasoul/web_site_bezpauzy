# Flow для пользователя с логином/паролем, который нажимает "Спросить Еву"

## Сценарий:
Пользователь:
- ✅ Имеет логин и пароль на сайте
- ❌ Не заходил на сайт (нет сессии)
- Нажимает кнопку "Спросить Еву"

---

## Что должно происходить:

### ШАГ 1: Пользователь нажимает "Спросить Еву"

**Текущее поведение:**
- Открывается страница `/chat`
- Проверяется сессия через cookie `telegram_session`
- Если сессии нет → показывается `ChatAuthGate`

**Проблема:** В `ChatAuthGate` нет опции входа через логин/пароль!

---

## Решение: Добавить вход через логин/пароль в ChatAuthGate

### Вариант 1: Добавить кнопку "Войти через логин/пароль" в ChatAuthGate

**Где:** `components/chat/ChatAuthGate.tsx`

**Что добавить:**
1. Новое модальное окно `WebsiteLoginModal` для входа через логин/пароль
2. Кнопку "Войти через логин/пароль" в `ChatAuthGate`
3. Логику проверки после входа:
   - Есть ли Telegram ID?
   - Есть ли активная подписка?
   - Показать соответствующий экран

---

## Детальный Flow после добавления:

### 1. Пользователь нажимает "Спросить Еву"
```
/chat → ChatAuthGate (нет сессии)
```

### 2. Пользователь видит экран входа
```
ChatAuthGate показывает:
- Кнопка "Зарегистрироваться"
- Кнопка "Войти через Telegram"
- Кнопка "Войти через логин/пароль" ← НОВОЕ
```

### 3. Пользователь нажимает "Войти через логин/пароль"
```
Открывается WebsiteLoginModal:
- Поле "Логин"
- Поле "Пароль"
- Кнопка "Войти"
```

### 4. После успешного входа
```
Проверка:
1. Есть ли telegram_id?
   ├─ ДА → Проверка подписки
   │       ├─ Активна → Показать ChatInterface
   │       └─ Не активна → Показать экран "Нужна подписка"
   └─ НЕТ → Показать экран "Привяжите Telegram"
```

### 5. Если нет Telegram ID
```
Показываем:
- Сообщение: "Для общения с Евой нужно привязать Telegram"
- Кнопка "Привязать Telegram" → Генерирует код и показывает инструкцию
- Кнопка "Продолжить без Telegram" → НЕ показываем чат (только если нет подписки)
```

### 6. Если есть Telegram ID, но нет подписки
```
Показываем:
- Сообщение: "Для общения с Евой нужна подписка"
- Кнопка "Оформить подписку" → Ссылка на бота
```

### 7. Если есть Telegram ID и активная подписка
```
Показываем ChatInterface:
- Загружается история из menohub_queries по user_id
- Пользователь может общаться с Евой
```

---

## Синхронизация разговоров между ботом и сайтом:

### Как это работает:

1. **Все сообщения хранятся в `menohub_queries`:**
   - `user_id` - ID пользователя из `menohub_users`
   - `query_text` - вопрос пользователя
   - `response_text` - ответ Евы
   - `query_status` - статус (processing, completed)

2. **История загружается по `user_id`:**
   - Если пользователь общался в боте → сообщения есть в БД
   - Если пользователь общался на сайте → сообщения тоже в БД
   - История объединена, так как используется один `user_id`

3. **Отправка сообщений:**
   - С сайта: `/api/chat/send-message` → сохраняет в `menohub_queries`
   - Из бота: n8n workflow → сохраняет в `menohub_queries`
   - Оба используют один `user_id` → история синхронизирована

---

## Что нужно реализовать:

### 1. Создать компонент `WebsiteLoginModal`

**Файл:** `components/auth/WebsiteLoginModal.tsx`

**Функционал:**
- Поля: логин, пароль
- Кнопка "Войти"
- Обработка ошибок
- После успешного входа → проверка Telegram ID и подписки

### 2. Обновить `ChatAuthGate`

**Добавить:**
- Кнопку "Войти через логин/пароль"
- Логику проверки после входа:
  - Если нет Telegram ID → показать экран привязки
  - Если нет подписки → показать экран подписки
  - Если все есть → показать чат

### 3. Обновить `app/chat/page.tsx`

**Изменить логику проверки:**
- Проверять не только `telegram_session`, но и возможность входа через логин/пароль
- После входа через логин/пароль → проверять Telegram ID и подписку

### 4. Обновить API `/api/chat/history`

**Изменить:**
- Загружать историю по `user_id` (не только по `telegram_id`)
- Если у пользователя нет `telegram_id`, но есть `user_id` → загружать историю

### 5. Обновить API `/api/chat/send-message`

**Изменить:**
- Разрешить отправку сообщений, даже если нет `telegram_id`
- Сохранять сообщения по `user_id`
- Если нет `telegram_id` → отправлять через n8n webhook с `user_id`

---

## Пример кода для WebsiteLoginModal:

```typescript
'use client'

import { FC, useState } from 'react'
import { motion } from 'framer-motion'
import { X, Loader2, AlertCircle, User, Lock } from 'lucide-react'

interface WebsiteLoginModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (user: {
    id: string
    hasTelegramId: boolean
    subscriptionStatus?: string
  }) => void
}

export const WebsiteLoginModal: FC<WebsiteLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async () => {
    if (!username || !password) {
      setError('Введите логин и пароль')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/website/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка при входе')
      }

      // Успешный вход
      onSuccess({
        id: data.user.id,
        hasTelegramId: data.user.hasTelegramId,
        subscriptionStatus: data.user.subscriptionStatus,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при входе')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-deep-navy/60 backdrop-blur-sm"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-soft-white rounded-3xl shadow-2xl max-w-md w-full p-8 md:p-10 z-10"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-deep-navy/60 hover:text-deep-navy"
        >
          <X size={24} />
        </button>

        <div className="w-16 h-16 bg-gradient-to-br from-primary-purple to-ocean-wave-start rounded-2xl flex items-center justify-center mx-auto mb-6">
          <User className="w-8 h-8 text-white" />
        </div>

        <h2 className="text-h3 font-bold text-deep-navy mb-2 text-center">
          Вход на сайт
        </h2>
        <p className="text-body text-deep-navy/70 mb-6 text-center">
          Введите ваш логин и пароль
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-deep-navy mb-2">
              Логин
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value)
                setError(null)
              }}
              placeholder="Ваш логин"
              className="w-full px-4 py-3 border-2 border-lavender-bg rounded-xl focus:outline-none focus:border-primary-purple"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-deep-navy mb-2">
              Пароль
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError(null)
              }}
              placeholder="Ваш пароль"
              className="w-full px-4 py-3 border-2 border-lavender-bg rounded-xl focus:outline-none focus:border-primary-purple"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-error text-sm">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={loading || !username || !password}
            className="w-full bg-gradient-to-r from-primary-purple to-ocean-wave-start text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Вход...</span>
              </>
            ) : (
              <>
                <Lock className="w-5 h-5" />
                <span>Войти</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
```

---

## Обновление ChatAuthGate:

Добавить состояние и обработчик:

```typescript
const [showWebsiteLogin, setShowWebsiteLogin] = useState(false)

// В JSX добавить кнопку:
<button
  onClick={() => setShowWebsiteLogin(true)}
  className="flex-1 inline-flex items-center justify-center gap-2 bg-white border-2 border-primary-purple text-primary-purple px-8 py-4 rounded-full text-lg font-semibold hover:bg-primary-purple hover:text-white transition-all duration-300"
>
  <Lock className="w-5 h-5" />
  Войти через логин/пароль
</button>

// Добавить модальное окно:
<WebsiteLoginModal
  isOpen={showWebsiteLogin}
  onClose={() => setShowWebsiteLogin(false)}
  onSuccess={(user) => {
    // Перезагружаем страницу для обновления сессии
    window.location.reload()
  }}
/>
```

---

## Обновление API `/api/chat/history`:

Изменить логику загрузки истории:

```typescript
// Вместо проверки только telegram_id, проверяем user_id из сессии
const sessionData = JSON.parse(Buffer.from(sessionToken, 'base64').toString())
const dbUserId = sessionData.userId

// Загружаем историю по user_id (независимо от наличия telegram_id)
const { data: queries } = await supabase
  .from('menohub_queries')
  .select('id, query_text, response_text, created_at, query_status')
  .eq('user_id', dbUserId) // Используем user_id напрямую
  .order('created_at', { ascending: true })
  .limit(50)
```

---

## Обновление API `/api/chat/send-message`:

Изменить логику отправки:

```typescript
// Получаем user_id из сессии
const sessionData = JSON.parse(Buffer.from(sessionToken, 'base64').toString())
const dbUserId = sessionData.userId
const userTelegramId = sessionData.telegramId || null

// Находим пользователя по user_id (не по telegram_id)
const { data: user } = await supabase
  .from('menohub_users')
  .select('id, telegram_id')
  .eq('id', dbUserId)
  .single()

// Сохраняем запрос
const { data: queryRecord } = await supabase
  .from('menohub_queries')
  .insert({
    user_id: user.id,
    query_text: message.trim(),
    query_status: 'processing',
    response_text: 'processing',
  })
  .select()
  .single()

// Отправляем в n8n webhook (если есть telegram_id) или обрабатываем на сайте
if (user.telegram_id && n8nWebhookUrl) {
  // Отправляем в бот через webhook
} else {
  // Обрабатываем на сайте (можно использовать API напрямую)
}
```

---

## Итоговый Flow:

```
Пользователь нажимает "Спросить Еву"
    ↓
Нет сессии → ChatAuthGate
    ↓
Выбирает "Войти через логин/пароль"
    ↓
WebsiteLoginModal → Ввод логина/пароля
    ↓
Успешный вход → Создается сессия
    ↓
Проверка:
    ├─ Есть telegram_id?
    │   ├─ ДА → Проверка подписки
    │   │       ├─ Активна → ChatInterface (загружает историю по user_id)
    │   │       └─ Не активна → Экран "Нужна подписка"
    │   └─ НЕТ → Экран "Привяжите Telegram"
    │               ├─ Генерация кода
    │               ├─ Инструкция по привязке
    │               └─ После привязки → Проверка подписки → Чат
```

---

## Важные моменты:

1. **История синхронизирована:** Все сообщения хранятся в `menohub_queries` по `user_id`, поэтому история объединена между ботом и сайтом

2. **Отправка сообщений:** Если нет `telegram_id`, сообщения можно обрабатывать на сайте напрямую (через API) или отправлять в n8n webhook с `user_id`

3. **Подписка:** Проверяется при каждом открытии чата, так как может измениться

4. **Привязка Telegram:** После привязки Telegram ID история автоматически объединяется, так как используется один `user_id`

