/**
 * Middleware для проверки авторизации админов
 */

import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { getAdminById } from './auth'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

// Убеждаемся, что JWT_SECRET установлен
if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
  console.warn('⚠️ JWT_SECRET не установлен! Это критично для безопасности.')
}

export interface AdminRequest extends NextRequest {
  admin?: {
    id: string
    email: string
    role: string
  }
}

/**
 * Получение токена из заголовков или cookies
 */
export function getAdminToken(request: NextRequest | { cookies: any; headers: Headers }): string | null {
  // Проверяем заголовок Authorization
  if ('headers' in request && request.headers) {
    if (typeof request.headers.get === 'function') {
      const authHeader = request.headers.get('authorization')
      if (authHeader?.startsWith('Bearer ')) {
        return authHeader.substring(7)
      }
    }
  }

  // Проверяем cookie
  let token: string | undefined
  if ('cookies' in request && request.cookies) {
    if (typeof request.cookies.get === 'function') {
      token = request.cookies.get('admin_token')?.value
    } else if (request.cookies.admin_token) {
      token = request.cookies.admin_token
    }
  }

  return token || null
}

/**
 * Проверка авторизации админа
 */
export async function requireAdmin(request: NextRequest | { cookies: any; headers: Headers }): Promise<{
  admin: { id: string; email: string; role: string } | null
  error: string | null
}> {
  const token = getAdminToken(request)

  if (!token) {
    return {
      admin: null,
      error: 'Требуется авторизация',
    }
  }

  try {
    // Проверяем JWT токен
    const decoded = jwt.verify(token, JWT_SECRET) as {
      adminId: string
      email: string
      role: string
    }

    // Проверяем, что админ существует и активен
    const admin = await getAdminById(decoded.adminId)

    if (!admin) {
      return {
        admin: null,
        error: 'Админ не найден или деактивирован',
      }
    }

    return {
      admin: {
        id: admin.id,
        email: admin.email,
        role: admin.role,
      },
      error: null,
    }
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return {
        admin: null,
        error: 'Недействительный токен',
      }
    }

    return {
      admin: null,
      error: 'Ошибка проверки токена',
    }
  }
}

/**
 * Middleware для защиты API routes
 */
export async function adminMiddleware(
  request: NextRequest,
  requiredRole?: 'super_admin' | 'content_manager' | 'order_manager' | 'support_manager' | 'analyst'
) {
  const { admin, error } = await requireAdmin(request)

  if (!admin || error) {
    return NextResponse.json(
      { error: error || 'Требуется авторизация' },
      { status: 401 }
    )
  }

  // Проверка роли, если требуется
  if (requiredRole) {
    const roleHierarchy: Record<string, number> = {
      super_admin: 5,
      content_manager: 4,
      order_manager: 3,
      support_manager: 2,
      analyst: 1,
    }

    // Super admin имеет доступ ко всему
    if (admin.role !== 'super_admin') {
      const adminLevel = roleHierarchy[admin.role] || 0
      const requiredLevel = roleHierarchy[requiredRole] || 0

      if (adminLevel < requiredLevel) {
        return NextResponse.json(
          { error: 'Недостаточно прав доступа' },
          { status: 403 }
        )
      }
    }
  }

  return { admin }
}
