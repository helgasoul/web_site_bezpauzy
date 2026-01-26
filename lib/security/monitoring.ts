/**
 * Security Monitoring Utility
 * 
 * Логирует подозрительную активность, отслеживает неудачные попытки входа
 * и мониторит необычные паттерны запросов.
 */

export interface SecurityEvent {
  type: 'failed_login' | 'rate_limit_exceeded' | 'suspicious_request' | 'unusual_pattern'
  severity: 'low' | 'medium' | 'high' | 'critical'
  timestamp: string
  ip: string
  userAgent?: string
  path?: string
  details?: Record<string, any>
}

// In-memory store для отслеживания событий (в production лучше использовать Redis или БД)
const securityEvents: SecurityEvent[] = []
const MAX_EVENTS = 1000 // Максимум событий в памяти

// Отслеживание неудачных попыток входа по IP
const failedLoginAttempts = new Map<string, { count: number; lastAttempt: number }>()
const FAILED_LOGIN_THRESHOLD = 5 // После 5 неудачных попыток - алерт
const FAILED_LOGIN_WINDOW = 15 * 60 * 1000 // 15 минут

/**
 * Логирует событие безопасности
 */
export function logSecurityEvent(event: Omit<SecurityEvent, 'timestamp'>): void {
  const fullEvent: SecurityEvent = {
    ...event,
    timestamp: new Date().toISOString(),
  }

  // Добавляем в память (в production лучше писать в БД или внешний сервис)
  securityEvents.push(fullEvent)
  
  // Ограничиваем размер массива
  if (securityEvents.length > MAX_EVENTS) {
    securityEvents.shift()
  }

  // Логируем в консоль (в production можно отправлять в внешний сервис)
  const logLevel = event.severity === 'critical' || event.severity === 'high' 
    ? 'error' 
    : 'warn'
  
  console[logLevel]('[SECURITY]', {
    type: event.type,
    severity: event.severity,
    ip: event.ip,
    path: event.path,
    details: event.details,
  })

  // В production можно отправлять в:
  // - Sentry для критических событий
  // - CloudWatch / Logging service
  // - Email/Slack алерты для критических событий
  if (event.severity === 'critical' && process.env.NODE_ENV === 'production') {
    // TODO: Отправить алерт администратору
    // sendSecurityAlert(fullEvent)
  }
}

/**
 * Отслеживает неудачную попытку входа
 * Возвращает true, если превышен порог и нужно заблокировать
 */
export function trackFailedLogin(ip: string, username?: string): boolean {
  const now = Date.now()
  const attempt = failedLoginAttempts.get(ip)

  if (!attempt || now - attempt.lastAttempt > FAILED_LOGIN_WINDOW) {
    // Первая попытка или окно истекло
    failedLoginAttempts.set(ip, { count: 1, lastAttempt: now })
    return false
  }

  // Увеличиваем счетчик
  attempt.count++
  attempt.lastAttempt = now
  failedLoginAttempts.set(ip, attempt)

  // Логируем событие
  logSecurityEvent({
    type: 'failed_login',
    severity: attempt.count >= FAILED_LOGIN_THRESHOLD ? 'high' : 'medium',
    ip,
    details: {
      attemptCount: attempt.count,
      username: username || 'unknown',
    },
  })

  // Если превышен порог - возвращаем true для блокировки
  if (attempt.count >= FAILED_LOGIN_THRESHOLD) {
    return true
  }

  return false
}

/**
 * Сбрасывает счетчик неудачных попыток (при успешном входе)
 */
export function resetFailedLoginAttempts(ip: string): void {
  failedLoginAttempts.delete(ip)
}

/**
 * Логирует превышение rate limit
 */
export function logRateLimitExceeded(
  ip: string,
  path: string,
  config: { limit: number; interval: number }
): void {
  logSecurityEvent({
    type: 'rate_limit_exceeded',
    severity: 'medium',
    ip,
    path,
    details: {
      limit: config.limit,
      interval: config.interval,
    },
  })
}

/**
 * Логирует подозрительный запрос
 */
export function logSuspiciousRequest(
  ip: string,
  path: string,
  reason: string,
  details?: Record<string, any>
): void {
  logSecurityEvent({
    type: 'suspicious_request',
    severity: 'medium',
    ip,
    path,
    details: {
      reason,
      ...details,
    },
  })
}

/**
 * Обнаруживает необычные паттерны запросов
 */
export function detectUnusualPattern(
  ip: string,
  path: string,
  userAgent?: string
): boolean {
  // Простая эвристика: много запросов к разным endpoints за короткое время
  // В production можно использовать более сложные алгоритмы (ML, статистика)
  
  const recentEvents = securityEvents.filter(
    (event) =>
      event.ip === ip &&
      Date.now() - new Date(event.timestamp).getTime() < 60 * 1000 // Последняя минута
  )

  // Если за минуту больше 20 событий - подозрительно
  if (recentEvents.length > 20) {
    logSecurityEvent({
      type: 'unusual_pattern',
      severity: 'high',
      ip,
      path,
      userAgent,
      details: {
        eventCount: recentEvents.length,
        timeWindow: '1 minute',
      },
    })
    return true
  }

  return false
}

/**
 * Получает статистику безопасности для IP
 */
export function getSecurityStats(ip: string): {
  failedLoginAttempts: number
  recentEvents: number
  isBlocked: boolean
} {
  const attempt = failedLoginAttempts.get(ip)
  const recentEvents = securityEvents.filter(
    (event) =>
      event.ip === ip &&
      Date.now() - new Date(event.timestamp).getTime() < 60 * 60 * 1000 // Последний час
  )

  return {
    failedLoginAttempts: attempt?.count || 0,
    recentEvents: recentEvents.length,
    isBlocked: attempt ? attempt.count >= FAILED_LOGIN_THRESHOLD : false,
  }
}

/**
 * Получает последние события безопасности
 */
export function getRecentSecurityEvents(limit: number = 50): SecurityEvent[] {
  return securityEvents.slice(-limit).reverse()
}

/**
 * Очищает старые события (вызывать периодически)
 */
export function cleanupOldEvents(maxAge: number = 24 * 60 * 60 * 1000): void {
  const now = Date.now()
  const cutoff = now - maxAge

  // Удаляем старые события
  while (securityEvents.length > 0 && new Date(securityEvents[0].timestamp).getTime() < cutoff) {
    securityEvents.shift()
  }

  // Очищаем старые попытки входа
  for (const [ip, attempt] of failedLoginAttempts.entries()) {
    if (now - attempt.lastAttempt > FAILED_LOGIN_WINDOW) {
      failedLoginAttempts.delete(ip)
    }
  }
}

// Периодическая очистка старых событий (каждый час)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    cleanupOldEvents()
  }, 60 * 60 * 1000) // 1 час
}

