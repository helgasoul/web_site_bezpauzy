/**
 * Simplified rate limiter for Next.js middleware (Edge Runtime compatible)
 * 
 * Middleware runs on Edge Runtime which doesn't support Node.js modules,
 * so we use only in-memory rate limiting here.
 * 
 * For API routes (Node.js runtime), use lib/rate-limit.ts which supports Upstash Redis.
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

// In-memory store for middleware (Edge Runtime compatible)
const rateLimitStore = new Map<string, RateLimitEntry>()

// Cleanup old entries periodically
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
 * Check if request should be rate limited (Edge Runtime compatible)
 * Uses in-memory store only (no Upstash Redis support)
 * @param identifier - Unique identifier (IP address, user ID, etc.)
 * @param config - Rate limit configuration
 * @returns Object with success status and remaining requests
 */
export function checkRateLimit(
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
 * Predefined rate limit configurations
 */
export const RateLimitConfigs = {
  // Limits for authentication endpoints (исключая get-session)
  auth: {
    interval: 15 * 60 * 1000, // 15 minutes
    limit: 20, // 20 requests per 15 minutes (увеличено с 5)
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
