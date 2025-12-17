# Подключение Supabase к проекту

> **Примечание**: Если у вас Supabase развернут на Beget (self-hosted), перейдите сразу к [Шагу 2](#шаг-2-получение-ключей-api).

## Шаг 1: Создание проекта в Supabase (только для облачного Supabase)

1. Перейдите на [supabase.com](https://supabase.com)
2. Войдите в аккаунт или зарегистрируйтесь
3. Нажмите **"New Project"**
4. Заполните форму:
   - **Name**: `bezpauzy` (или любое другое название)
   - **Database Password**: создайте надежный пароль (сохраните его!)
   - **Region**: выберите ближайший регион (например, `West US` или `Central EU`)
   - **Pricing Plan**: выберите **Free** для начала
5. Нажмите **"Create new project"**
6. Дождитесь создания проекта (обычно 1-2 минуты)

## Шаг 2: Получение ключей API

### Для облачного Supabase (supabase.com):

1. В Dashboard вашего проекта перейдите в **Settings** → **API**
2. Найдите секцию **Project API keys**
3. Скопируйте следующие значения:
   - **Project URL** (например: `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon public** ключ (начинается с `eyJ...`)

### Для self-hosted Supabase на Beget:

1. Обратитесь к администратору Supabase инстанса на Beget
2. Получите следующие данные:
   - **Supabase URL** (например: `https://supabase.yourdomain.com` или `https://your-ip:port`)
   - **anon public key** (JWT токен для анонимного доступа)
   - **service_role key** (только для серверных операций, НЕ добавляйте в `.env.local`)

⚠️ **Важно**: 
- `anon public` ключ безопасно использовать в клиентском коде (он защищен RLS политиками)
- **service_role** ключ НЕ копируйте в `.env.local` - он только для серверных операций
- Для self-hosted Supabase URL может быть на другом домене или IP-адресе

## Шаг 3: Создание файла с переменными окружения

1. В корне проекта создайте файл `.env.local` (если его еще нет)
2. Добавьте следующие переменные:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Пример для облачного Supabase:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzODk2ODAwMCwiZXhwIjoxOTU0NTQ0MDAwfQ.example
```

**Пример для self-hosted Supabase на Beget:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://supabase.yourdomain.com
# или
NEXT_PUBLIC_SUPABASE_URL=https://your-ip:8000
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-from-beget
```

3. Сохраните файл

⚠️ **Важно**: 
- Файл `.env.local` уже должен быть в `.gitignore` (не коммитьте его в Git!)
- Перезапустите dev-сервер после изменения `.env.local`

## Шаг 4: Выполнение SQL миграции

### Для облачного Supabase:

1. В Supabase Dashboard перейдите в **SQL Editor**
2. Нажмите **"New query"**
3. Откройте файл `supabase/migrations/001_create_community_members.sql` из проекта
4. Скопируйте весь SQL код
5. Вставьте в SQL Editor
6. Нажмите **"Run"** (или `Cmd/Ctrl + Enter`)

### Для self-hosted Supabase на Beget:

1. Подключитесь к Supabase Dashboard на вашем Beget сервере
   - Обычно доступен по адресу: `https://your-domain.com` или через порт
2. Перейдите в **SQL Editor**
3. Откройте файл `supabase/migrations/001_create_community_members.sql` из проекта
4. Скопируйте весь SQL код
5. Вставьте в SQL Editor и выполните

**Альтернативный способ** (через psql или другой клиент):
```bash
# Если у вас есть доступ к серверу через SSH
psql -h localhost -U postgres -d postgres -f supabase/migrations/001_create_community_members.sql
```

Вы должны увидеть сообщение об успешном выполнении:
```
Success. No rows returned
```

## Шаг 5: Проверка создания таблицы

1. В Dashboard (облачный или на Beget) перейдите в **Table Editor**
2. Вы должны увидеть таблицу `menohub_community_members`
3. Откройте таблицу и проверьте структуру:
   - `id` (uuid)
   - `name` (text)
   - `email` (text)
   - `age` (text)
   - `location` (text)
   - `interests` (jsonb)
   - `status` (text)
   - `joined_at` (timestamptz)
   - и другие поля

**Для self-hosted**: Если Dashboard недоступен, проверьте через SQL:
```sql
SELECT * FROM information_schema.tables 
WHERE table_name = 'menohub_community_members';
```

## Шаг 6: Проверка подключения

1. Убедитесь, что dev-сервер запущен:
   ```bash
   npm run dev
   ```

2. Откройте браузер и перейдите на страницу сообщества:
   ```
   http://localhost:3000/community
   ```

3. Нажмите кнопку **"Присоединиться к сообществу"**

4. Заполните форму и отправьте

5. Проверьте в Supabase Dashboard → **Table Editor** → `menohub_community_members`:
   - Должна появиться новая запись с вашими данными

## Шаг 7: Настройка Row Level Security (RLS)

RLS уже настроен в миграции, но вы можете проверить политики:

1. В Dashboard перейдите в **Authentication** → **Policies**
2. Найдите таблицу `menohub_community_members`
3. Должны быть две политики:
   - "Service role can insert community members"
   - "Service role can read community members"

## Устранение проблем

### Ошибка: "Missing Supabase environment variables"

**Решение:**
- Убедитесь, что файл `.env.local` существует в корне проекта
- Проверьте, что переменные названы правильно (с `NEXT_PUBLIC_` префиксом)
- Перезапустите dev-сервер после изменения `.env.local`

### Ошибка: "relation does not exist"

**Решение:**
- Убедитесь, что SQL миграция выполнена успешно
- Проверьте название таблицы: должно быть `menohub_community_members` (не `community_members`)

### Ошибка: "new row violates row-level security policy"

**Решение:**
- Проверьте, что RLS политики созданы правильно
- В SQL Editor выполните:
  ```sql
  SELECT * FROM pg_policies WHERE tablename = 'menohub_community_members';
  ```

### Ошибка подключения к Supabase

**Решение:**
- Проверьте, что URL правильный (без лишних пробелов)
- Проверьте, что проект не приостановлен (Free tier может приостанавливаться после неактивности)
- Проверьте интернет-соединение

### Для self-hosted Supabase на Beget:

**Дополнительные проверки:**
- Убедитесь, что Supabase API доступен по указанному URL
- Проверьте, что порты открыты (обычно 8000 для API)
- Проверьте настройки firewall на Beget
- Убедитесь, что SSL сертификат настроен правильно (если используете HTTPS)
- Проверьте логи Supabase на сервере Beget для диагностики ошибок

## Специальные настройки для Beget

### Получение доступа к Supabase на Beget

1. **URL Supabase**: Обычно доступен по адресу вашего домена или через поддомен
   - Например: `https://supabase.yourdomain.com` 
   - Или: `https://yourdomain.com:8000`
   - Уточните у администратора Beget точный адрес

2. **Получение ключей**:
   - Обратитесь к администратору сервера Beget
   - Или найдите файл `.env` в директории Supabase на сервере
   - Нужны: `SUPABASE_URL` и `SUPABASE_ANON_KEY`

3. **Доступ к Dashboard**:
   - Обычно доступен по адресу: `https://yourdomain.com` или через порт
   - Или через SSH туннель, если настроен

### Настройка переменных окружения для Beget

В `.env.local` укажите URL вашего Supabase на Beget:

```env
NEXT_PUBLIC_SUPABASE_URL=https://supabase.yourdomain.com
# или
NEXT_PUBLIC_SUPABASE_URL=https://yourdomain.com:8000
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-from-beget
```

⚠️ **Важно для Beget**:
- Убедитесь, что домен/поддомен правильно настроен в панели Beget
- Проверьте, что SSL сертификат установлен (для HTTPS)
- Если используете нестандартный порт, убедитесь, что он открыт

## Дополнительные настройки (опционально)

### Настройка CORS (если нужно)

Если вы планируете использовать Supabase с фронтендом на другом домене:

1. В Dashboard → **Settings** → **API**
2. Добавьте ваш домен в **Allowed CORS origins**

**Для self-hosted на Beget**: Настройте CORS в конфигурации Supabase на сервере

### Настройка email (для приветственных писем)

1. В Dashboard → **Settings** → **Auth**
2. Настройте SMTP для отправки email (опционально)

## Полезные ссылки

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Dashboard](https://app.supabase.com)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)

## Следующие шаги

После успешного подключения:

1. ✅ Проверьте работу формы регистрации
2. ⏳ Настройте email-рассылку (SendGrid/Mailchimp)
3. ⏳ Добавьте другие таблицы (если нужно)
4. ⏳ Настройте аналитику регистраций
