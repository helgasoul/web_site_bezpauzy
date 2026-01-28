# Мониторинг безопасности

Система мониторинга безопасности отслеживает подозрительную активность, неудачные попытки входа и необычные паттерны запросов.

## Обзор

Мониторинг безопасности реализован в `lib/security/monitoring.ts` и интегрирован в:
- `middleware.ts` - для отслеживания rate limiting и CORS
- `app/api/auth/website/login/route.ts` - для отслеживания неудачных попыток входа

## Функции

### 1. Логирование событий безопасности

```typescript
import { logSecurityEvent } from '@/lib/security/monitoring'

logSecurityEvent({
  type: 'suspicious_request',
  severity: 'medium',
  ip: '192.168.1.1',
  path: '/api/auth/login',
  details: { reason: 'Mismatched Referer' },
})
```

**Типы событий:**
- `failed_login` - неудачная попытка входа
- `rate_limit_exceeded` - превышение rate limit
- `suspicious_request` - подозрительный запрос
- `unusual_pattern` - необычный паттерн запросов

**Уровни серьезности:**
- `low` - информационные события
- `medium` - подозрительная активность
- `high` - потенциальная атака
- `critical` - критическая угроза

### 2. Отслеживание неудачных попыток входа

```typescript
import { trackFailedLogin, resetFailedLoginAttempts } from '@/lib/security/monitoring'

// При неудачной попытке
const shouldBlock = trackFailedLogin(ip, username)
if (shouldBlock) {
  // Блокируем после 5 попыток за 15 минут
  return NextResponse.json({ error: 'Слишком много неудачных попыток' }, { status: 429 })
}

// При успешном входе
resetFailedLoginAttempts(ip)
```

**Параметры:**
- Порог блокировки: **5 неудачных попыток**
- Временное окно: **15 минут**
- После блокировки: возвращается статус `429 Too Many Requests`

### 3. Логирование превышений rate limit

```typescript
import { logRateLimitExceeded } from '@/lib/security/monitoring'

logRateLimitExceeded(ip, path, { limit: 5, interval: 900000 })
```

Автоматически вызывается в `middleware.ts` при превышении rate limit.

### 4. Логирование подозрительных запросов

```typescript
import { logSuspiciousRequest } from '@/lib/security/monitoring'

logSuspiciousRequest(
  ip,
  path,
  'Mismatched Referer header',
  { origin: 'https://evil.com', referer: 'https://example.com' }
)
```

Используется для логирования:
- CORS нарушений
- Несоответствий Referer header
- Других подозрительных паттернов

### 5. Обнаружение необычных паттернов

```typescript
import { detectUnusualPattern } from '@/lib/security/monitoring'

const isUnusual = detectUnusualPattern(ip, path, userAgent)
```

**Эвристика:**
- Более **20 событий за минуту** с одного IP считается подозрительным
- Автоматически логируется как `unusual_pattern` с уровнем `high`

### 6. Получение статистики

```typescript
import { getSecurityStats } from '@/lib/security/monitoring'

const stats = getSecurityStats(ip)
// {
//   failedLoginAttempts: 3,
//   recentEvents: 5,
//   isBlocked: false
// }
```

### 7. Получение последних событий

```typescript
import { getRecentSecurityEvents } from '@/lib/security/monitoring'

const events = getRecentSecurityEvents(50) // Последние 50 событий
```

## Интеграция

### Middleware

В `middleware.ts` автоматически логируются:
- Превышения rate limit
- Подозрительные CORS запросы
- Необычные паттерны запросов

### Auth Routes

В `app/api/auth/website/login/route.ts`:
- Отслеживаются неудачные попытки входа
- Блокировка после 5 неудачных попыток
- Сброс счетчика при успешном входе

## Хранение данных

**Текущая реализация:**
- In-memory хранилище (до 1000 событий)
- Автоматическая очистка старых событий (каждый час)
- Очистка старых попыток входа (окно 15 минут)

**Рекомендации для production:**

1. **База данных (Supabase):**
   ```sql
   CREATE TABLE security_events (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     type TEXT NOT NULL,
     severity TEXT NOT NULL,
     ip TEXT NOT NULL,
     path TEXT,
     user_agent TEXT,
     details JSONB,
     created_at TIMESTAMPTZ DEFAULT NOW()
   );
   
   CREATE INDEX idx_security_events_ip ON security_events(ip);
   CREATE INDEX idx_security_events_created ON security_events(created_at);
   ```

2. **Redis для счетчиков:**
   - Использовать Redis для распределенного хранения счетчиков неудачных попыток
   - Интегрировать с существующим Upstash Redis

3. **Внешние сервисы:**
   - **Sentry** - для критических событий
   - **CloudWatch / Logging service** - для централизованного логирования
   - **Email/Slack алерты** - для критических событий

## Настройка алертов

Для настройки алертов в production добавьте в `lib/security/monitoring.ts`:

```typescript
async function sendSecurityAlert(event: SecurityEvent) {
  // Отправка email
  // await sendEmail({
  //   to: 'admin@example.com',
  //   subject: `[SECURITY] ${event.type} - ${event.severity}`,
  //   body: JSON.stringify(event, null, 2),
  // })
  
  // Отправка в Slack
  // await fetch(SLACK_WEBHOOK_URL, {
  //   method: 'POST',
  //   body: JSON.stringify({ text: `Security alert: ${event.type}` }),
  // })
  
  // Отправка в Sentry
  // Sentry.captureMessage(`Security event: ${event.type}`, {
  //   level: event.severity === 'critical' ? 'error' : 'warning',
  //   extra: event,
  // })
}
```

## Мониторинг в production

1. **Регулярный просмотр событий:**
   - Ежедневный просмотр критических и высокоприоритетных событий
   - Еженедельный анализ паттернов

2. **Настройка дашборда:**
   - Количество событий по типам
   - Топ IP адресов с подозрительной активностью
   - График событий по времени

3. **Автоматические действия:**
   - Автоматическая блокировка IP после N критических событий
   - Уведомления администраторам при критических событиях

## Тестирование

Для тестирования мониторинга:

```typescript
// Тест отслеживания неудачных попыток
for (let i = 0; i < 6; i++) {
  const blocked = trackFailedLogin('192.168.1.1', 'testuser')
  console.log(`Attempt ${i + 1}: ${blocked ? 'BLOCKED' : 'allowed'}`)
}

// Тест обнаружения необычных паттернов
for (let i = 0; i < 25; i++) {
  detectUnusualPattern('192.168.1.1', '/api/test', 'test-agent')
}
```

## См. также

- [Rate Limiting](./RATE_LIMITING.md)
- [JWT Session Setup](./JWT_SESSION_SETUP.md)
- [Security Audit](../SECURITY_AUDIT.md)

