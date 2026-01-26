/**
 * Rate limiter with support for both Upstash Redis and in-memory fallback
 * 
 * Priority:
 * 1. Upstash Redis (if UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are set)
 * 2. In-memory (fallback for development or if Upstash not configured)
 */

export interface RateLimitConfig {
  interval: number // Time window in milliseconds
  limit: number // Max requests per interval
}

interface RateLimitEntry {
  count: number
  resetTime: number
}

interface RateLimitResult {
  success: boolean
  remaining: number
  resetTime: number
}

// Check if Upstash is configured
const UPSTASH_ENABLED = 
  typeof process !== 'undefined' &&
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN

// Lazy load Upstash (only if configured)
let upstashRatelimit: any = null
let upstashRedis: any = null

async function initUpstash() {
  // Only initialize on server-side (Node.js environment)
  if (typeof window !== 'undefined' || typeof process === 'undefined') {
    return
  }
  
  if (!UPSTASH_ENABLED || upstashRatelimit) {
    return
  }

  try {
    // Dynamic import only on server-side
    // Use require for server-side only to avoid webpack bundling
    const { Ratelimit } = await import('@upstash/ratelimit')
    const { Redis } = await import('@upstash/redis')

    upstashRedis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })

    upstashRatelimit = new Ratelimit({
      redis: upstashRedis,
      limiter: Ratelimit.slidingWindow(10, '1 m'), // Default, will be overridden
      analytics: true,
    })
  } catch (error) {
    console.error('Failed to initialize Upstash:', error)
    // Fallback to in-memory
  }
}

// In-memory store (fallback)
const rateLimitStore = new Map<string, RateLimitEntry>()

// Cleanup old entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of rateLimitStore.entries()) {
      if (entry.resetTime < now) {
        rateLimitStore.delete(key)
      }
    }
  }, 5 * 60 * 1000) // 5 minutes
}

/**
 * Check if request should be rate limited
 * Uses Upstash Redis if configured, otherwise falls back to in-memory
 * @param identifier - Unique identifier (IP address, user ID, etc.)
 * @param config - Rate limit configuration
 * @returns Object with success status and remaining requests
 */
export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  // Try to use Upstash if configured
  if (UPSTASH_ENABLED) {
    try {
      await initUpstash()
      
      if (upstashRedis) {
        // Convert interval to Upstash format
        const intervalSeconds = Math.floor(config.interval / 1000)
        let intervalString: string
        
        if (intervalSeconds < 60) {
          intervalString = `${intervalSeconds} s`
        } else if (intervalSeconds < 3600) {
          intervalString = `${Math.floor(intervalSeconds / 60)} m`
        } else {
          intervalString = `${Math.floor(intervalSeconds / 3600)} h`
        }

        // Create a new ratelimit instance with the specific config
        // We create a new instance per request to support different configs
        // Only import on server-side
        if (typeof window === 'undefined') {
          const { Ratelimit } = await import('@upstash/ratelimit')
          const ratelimit = new Ratelimit({
            redis: upstashRedis,
            limiter: Ratelimit.slidingWindow(config.limit, intervalString as any),
            analytics: true,
          })

          const result = await ratelimit.limit(identifier)
          
          // Calculate reset time (approximate, based on interval)
          const resetTime = Date.now() + config.interval

          return {
            success: result.success,
            remaining: result.remaining,
            resetTime,
          }
        }
      }
    } catch (error) {
      // If Upstash fails, fallback to in-memory
      if (process.env.NODE_ENV === 'development') {
        console.warn('Upstash rate limiting failed, using in-memory fallback:', error)
      }
    }
  }

  // Fallback to in-memory rate limiting
  return checkRateLimitInMemory(identifier, config)
}

/**
 * In-memory rate limiting (fallback)
 */
function checkRateLimitInMemory(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now()
  const key = `${identifier}:${config.interval}`

  const entry = rateLimitStore.get(key)

  // If no entry or reset time passed, create new entry
  if (!entry || entry.resetTime < now) {
    const newEntry: RateLimitEntry = {
      count: 1,
      resetTime: now + config.interval,
    }
    rateLimitStore.set(key, newEntry)
    return {
      success: true,
      remaining: config.limit - 1,
      resetTime: newEntry.resetTime,
    }
  }

  // If limit exceeded
  if (entry.count >= config.limit) {
    return {
      success: false,
      remaining: 0,
      resetTime: entry.resetTime,
    }
  }

  // Increment count
  entry.count++
  rateLimitStore.set(key, entry)

  return {
    success: true,
    remaining: config.limit - entry.count,
    resetTime: entry.resetTime,
  }
}

/**
 * Get client IP address from request
 * Works with both Request and NextRequest
 */
export function getClientIP(request: Request | { headers: Headers; ip?: string }): string {
  // Try to get IP from various headers (for proxies/load balancers)
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  const realIP = request.headers.get('x-real-ip')
  if (realIP) {
    return realIP
  }

  // Try to get IP from request.ip (NextRequest)
  if ('ip' in request && request.ip) {
    return request.ip
  }

  // Fallback
  return 'unknown'
}

/**
 * Predefined rate limit configurations
 */
export const RateLimitConfigs = {
  // Strict limits for authentication endpoints
  auth: {
    interval: 15 * 60 * 1000, // 15 minutes
    limit: 5, // 5 requests per 15 minutes
  },
  // Moderate limits for newsletter/community
  subscription: {
    interval: 60 * 60 * 1000, // 1 hour
    limit: 3, // 3 requests per hour
  },
  // More lenient for general API
  api: {
    interval: 60 * 1000, // 1 minute
    limit: 60, // 60 requests per minute
  },
  // Very strict for sensitive operations
  sensitive: {
    interval: 60 * 60 * 1000, // 1 hour
    limit: 10, // 10 requests per hour
  },
} as const

