import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { checkRateLimit, RateLimitConfigs } from '@/lib/rate-limit-middleware'
import type { RateLimitConfig } from '@/lib/rate-limit-middleware'

/**
 * Security middleware for Next.js
 * Handles basic security checks and rate limiting
 * 
 * Note: Next.js middleware supports async functions
 */
export async function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Add security headers (дополнительно к next.config.js)
  // Некоторые заголовки лучше добавлять здесь для динамических маршрутов
  
  // CORS headers для API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const origin = request.headers.get('origin')
    const referer = request.headers.get('referer')
    
    // Список разрешенных origins
    const allowedOrigins = [
      process.env.NEXT_PUBLIC_SITE_URL,
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'https://bezpauzy.com',
      'https://www.bezpauzy.com',
      // Добавьте другие разрешенные домены здесь
    ].filter(Boolean)

    // Проверяем origin
    const isOriginAllowed = origin && allowedOrigins.includes(origin)
    
    // Разрешаем ngrok домены (для разработки)
    const isNgrokOrigin = origin && (
      origin.includes('ngrok-free.app') ||
      origin.includes('ngrok-free.dev') ||
      origin.includes('ngrok.io')
    )
    
    // Для same-origin запросов (без origin header) разрешаем
    const isSameOrigin = !origin || origin === request.nextUrl.origin

    // В development режиме разрешаем все origins
    const isDevelopment = process.env.NODE_ENV === 'development'

    if (isOriginAllowed || isNgrokOrigin || isSameOrigin || isDevelopment) {
      // Устанавливаем CORS заголовки
      if (origin) {
        response.headers.set('Access-Control-Allow-Origin', origin)
      }
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-CSRF-Token')
      response.headers.set('Access-Control-Allow-Credentials', 'true')
      response.headers.set('Access-Control-Max-Age', '86400') // 24 часа для preflight cache
      
      // CSRF защита: проверяем Referer для state-changing запросов
      if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
        if (origin && !isOriginAllowed && !isNgrokOrigin && !isSameOrigin && !isDevelopment) {
          // Блокируем запросы с неразрешенных origins (только в production)
          return NextResponse.json(
            { error: 'CORS policy: Origin not allowed' },
            { status: 403 }
          )
        }
        
        // Дополнительная проверка Referer для POST/PUT/DELETE
        if (referer) {
          const refererUrl = new URL(referer)
          const isRefererAllowed = allowedOrigins.some(allowed => {
            if (!allowed) return false
            try {
              const allowedUrl = new URL(allowed)
              return refererUrl.origin === allowedUrl.origin
            } catch {
              return false
            }
          })
          
          if (!isRefererAllowed && refererUrl.origin !== request.nextUrl.origin) {
            // Логируем подозрительный запрос
            const { logSuspiciousRequest } = await import('@/lib/security/monitoring')
            const clientIP = request.ip || request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown'
            logSuspiciousRequest(
              clientIP,
              request.nextUrl.pathname,
              'Mismatched Referer header',
              {
                origin,
                referer: refererUrl.origin,
              }
            )
          }
        }
      }
    } else {
      // Origin не разрешен - блокируем запрос (только в production)
      if (!isDevelopment) {
        return NextResponse.json(
          { error: 'CORS policy: Origin not allowed' },
          { status: 403 }
        )
      }
      // В development режиме все равно разрешаем, но устанавливаем заголовки
      if (origin) {
        response.headers.set('Access-Control-Allow-Origin', origin)
      }
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-CSRF-Token')
      response.headers.set('Access-Control-Allow-Credentials', 'true')
    }

    // Handle preflight requests (OPTIONS)
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 200,
        headers: response.headers,
      })
    }

    // Rate limiting for API routes
    const pathname = request.nextUrl.pathname
    const method = request.method

    // Skip rate limiting for GET requests (except sensitive endpoints)
    if (method === 'GET' && !pathname.includes('/auth/') && !pathname.includes('/quiz/get-results')) {
      return response
    }

    // Determine rate limit config based on endpoint
    let config: RateLimitConfig = RateLimitConfigs.api // default

    if (pathname.includes('/auth/')) {
      config = RateLimitConfigs.auth
    } else if (
      pathname.includes('/newsletter/subscribe') ||
      pathname.includes('/community/join')
    ) {
      config = RateLimitConfigs.subscription
    } else if (
      pathname.includes('/quiz/save-results') ||
      pathname.includes('/account/')
    ) {
      config = RateLimitConfigs.sensitive
    }

    // Get client identifier (IP address)
    // Try to get IP from NextRequest
    const clientIP = request.ip || request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown'
    const identifier = `${clientIP}:${pathname}`

    // Check rate limit (synchronous for Edge Runtime compatibility)
    const rateLimitResult = checkRateLimit(identifier, config)

    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', config.limit.toString())
    response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString())
    response.headers.set('X-RateLimit-Reset', new Date(rateLimitResult.resetTime).toISOString())

    // If rate limit exceeded, return 429
    if (!rateLimitResult.success) {
      // Логируем превышение rate limit
      const { logRateLimitExceeded, detectUnusualPattern } = await import('@/lib/security/monitoring')
      logRateLimitExceeded(clientIP, pathname, config)
      
      // Проверяем на необычные паттерны
      const userAgent = request.headers.get('user-agent')
      detectUnusualPattern(clientIP, pathname, userAgent || undefined)
      
      return NextResponse.json(
        {
          error: 'Слишком много запросов. Пожалуйста, попробуйте позже.',
          retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString(),
            ...Object.fromEntries(response.headers.entries()),
          },
        }
      )
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

