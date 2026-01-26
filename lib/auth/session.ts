/**
 * Secure session management using JWT
 * Replaces unsafe base64-encoded JSON tokens
 */

import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export interface SessionData {
  userId: number
  telegramId?: number | null
  username?: string | null
  email?: string | null
  ageRange?: string | null
}

// Lazy getter for JWT_SECRET (prevents errors during build time)
function getJWTSecret(): string {
  const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXT_PUBLIC_JWT_SECRET
  
  // Fallback secret for development (should be replaced in production)
  const FALLBACK_SECRET = 'dev-secret-change-in-production-' + Date.now()
  
  // Show warning only once per process and only in development
  if (!JWT_SECRET && process.env.NODE_ENV === 'development') {
    if (!(global as any).__JWT_WARNING_SHOWN) {
      (global as any).__JWT_WARNING_SHOWN = true
      console.warn('⚠️  JWT_SECRET not set. Using fallback secret (OK for development, REQUIRED for production)')
    }
  }
  
  // In production runtime (not build time), throw error if JWT_SECRET is missing
  // Skip check during build phase (when NEXT_PHASE is set to phase-production-build)
  const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build'
  if (!JWT_SECRET && process.env.NODE_ENV === 'production' && !isBuildTime) {
    throw new Error('JWT_SECRET environment variable is required in production')
  }
  
  return JWT_SECRET || FALLBACK_SECRET
}
const SESSION_COOKIE_NAME = 'telegram_session'
const SESSION_DURATION = 60 * 60 * 24 * 30 // 30 days in seconds

/**
 * Create a secure JWT session token
 */
export function createSessionToken(data: SessionData): string {
  const payload = {
    userId: data.userId,
    telegramId: data.telegramId || null,
    username: data.username || null,
    email: data.email || null,
    ageRange: data.ageRange || null,
    iat: Math.floor(Date.now() / 1000), // Issued at
    exp: Math.floor(Date.now() / 1000) + SESSION_DURATION, // Expiration
  }

  return jwt.sign(payload, getJWTSecret(), {
    algorithm: 'HS256',
  })
}

/**
 * Verify and decode a JWT session token
 * Returns null if token is invalid or expired
 */
export function verifySessionToken(token: string): SessionData | null {
  try {
    const decoded = jwt.verify(token, getJWTSecret()) as jwt.JwtPayload & SessionData

    // Validate required fields
    if (!decoded.userId || typeof decoded.userId !== 'number') {
      return null
    }

    return {
      userId: decoded.userId,
      telegramId: decoded.telegramId,
      username: decoded.username,
      email: decoded.email,
      ageRange: decoded.ageRange,
    }
  } catch (error) {
    // Token is invalid, expired, or tampered with
    if (process.env.NODE_ENV === 'development') {
      console.error('[session] Token verification failed:', error instanceof Error ? error.message : 'Unknown error')
    }
    return null
  }
}

/**
 * Get session data from cookie
 */
export async function getSession(): Promise<SessionData | null> {
  try {
    const cookieStore = cookies()
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value

    if (!sessionToken) {
      return null
    }

    // Handle URL-encoded tokens (legacy support)
    let decodedToken = sessionToken
    try {
      decodedToken = decodeURIComponent(sessionToken)
    } catch (e) {
      // Not URL-encoded, use as is
      decodedToken = sessionToken
    }

    // Try to verify as JWT first
    const jwtSession = verifySessionToken(decodedToken)
    if (jwtSession) {
      return jwtSession
    }

    // Fallback: try to parse as legacy base64 token (for migration)
    try {
      const legacyData = JSON.parse(Buffer.from(decodedToken, 'base64').toString())
      if (legacyData.userId) {
        // Legacy token found - convert to JWT
        const sessionData: SessionData = {
          userId: legacyData.userId,
          telegramId: legacyData.telegramId,
          username: legacyData.username,
          email: legacyData.email,
          ageRange: legacyData.ageRange,
        }
        // Optionally, we could update the cookie here with a new JWT token
        return sessionData
      }
    } catch (e) {
      // Not a legacy token either
    }

    return null
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[session] Error getting session:', error)
    }
    return null
  }
}

/**
 * Set session cookie with JWT token
 */
export function setSessionCookie(sessionData: SessionData, response?: NextResponse): void {
  const token = createSessionToken(sessionData)
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: SESSION_DURATION,
    path: '/',
  }

  if (response) {
    // If response object is provided, set cookie on it
    response.cookies.set(SESSION_COOKIE_NAME, token, cookieOptions)
  } else {
    // Otherwise, use cookies() directly
    cookies().set(SESSION_COOKIE_NAME, token, cookieOptions)
  }
}

/**
 * Delete session cookie
 */
export function deleteSessionCookie(response?: NextResponse): void {
  if (response) {
    response.cookies.delete(SESSION_COOKIE_NAME)
  } else {
    cookies().delete(SESSION_COOKIE_NAME)
  }
}

