# Быстрый старт: Supabase на Beget

## Что вам нужно от администратора Beget

1. **URL Supabase API**:
   - Например: `https://supabase.yourdomain.com`
   - Или: `https://yourdomain.com:8000`

2. **Anon Key** (публичный ключ):
   - JWT токен для анонимного доступа
   - Безопасен для использования в клиентском коде

3. **Доступ к Dashboard** (опционально, но желательно):
   - URL для доступа к веб-интерфейсу Supabase
   - Для выполнения SQL миграций

## Шаг 1: Создание .env.local

В корне проекта создайте файл `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://supabase.yourdomain.com
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Пример:**

```env
NEXT_PUBLIC_SUPABASE_URL=https://supabase.bezpauzy.ru
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Шаг 2: Выполнение SQL миграции

### Вариант 1: Через Dashboard (если доступен)

1. Откройте Supabase Dashboard на вашем Beget сервере
2. Перейдите в **SQL Editor**
3. Откройте файл `supabase/migrations/001_create_community_members.sql`
4. Скопируйте весь SQL код
5. Вставьте в SQL Editor и выполните

### Вариант 2: Через SSH (если есть доступ)

```bash
# Подключитесь к серверу Beget через SSH
ssh user@yourdomain.com

# Перейдите в директорию Supabase
cd /path/to/supabase

# Выполните миграцию через psql
psql -h localhost -U postgres -d postgres -f /path/to/001_create_community_members.sql
```

### Вариант 3: Через API (если есть доступ к REST API)

Используйте Supabase Management API для выполнения SQL (требует service_role key).

## Шаг 3: Проверка подключения

1. Запустите dev-сервер:

   ```bash
   npm run dev
   ```

2. Откройте `http://localhost:3000/community`

3. Попробуйте зарегистрироваться через форму

4. Проверьте в Dashboard или через SQL, что данные сохранились:

   ```sql
   SELECT * FROM menohub_community_members;
   ```

## Частые проблемы на Beget

### Проблема: CORS ошибки

**Решение**: Настройте CORS в конфигурации Supabase на сервере Beget. Добавьте ваш домен в список разрешенных.

### Проблема: SSL сертификат

**Решение**: Убедитесь, что SSL сертификат установлен для домена Supabase. Beget обычно предоставляет Let's Encrypt сертификаты.

### Проблема: Порт недоступен

**Решение**:

- Проверьте настройки firewall в панели Beget
- Убедитесь, что порт открыт для внешних подключений
- Проверьте настройки nginx/apache, если используется reverse proxy

### Проблема: Не могу найти ключи

**Решение**:

- Обратитесь к администратору сервера
- Или найдите файл `.env` в директории Supabase на сервере
- Ключи обычно находятся в `/opt/supabase/.env` или подобной директории

## Полезные команды для диагностики

```bash
# Проверка доступности Supabase API
curl https://supabase.yourdomain.com/rest/v1/

# Проверка с ключом
curl -H "apikey: YOUR_ANON_KEY" https://supabase.yourdomain.com/rest/v1/
```

## Следующие шаги

После успешного подключения:

1. ✅ Проверьте работу формы регистрации
2. ✅ Убедитесь, что данные сохраняются в таблице
3. ⏳ Настройте email-рассылку (если нужно)
4. ⏳ Добавьте другие таблицы (если нужно)

## Контакты для помощи

Если возникли проблемы:

1. Проверьте логи Supabase на сервере Beget
2. Обратитесь к администратору Beget
3. См. полную инструкцию в `SUPABASE_SETUP.md`
