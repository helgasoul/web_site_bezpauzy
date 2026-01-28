/**
 * Утилиты для авторизации админов
 * Используем Service Role для доступа к admin_users (RLS блокирует anon)
 */

import { createServiceRoleClient } from '@/lib/supabase/server'
import * as bcrypt from 'bcryptjs'

function getAdminClient() {
  try {
    return createServiceRoleClient()
  } catch {
    return null
  }
}

export type AdminRole = 'super_admin' | 'content_manager' | 'order_manager' | 'support_manager' | 'analyst'

export interface AdminUser {
  id: string
  email: string
  role: AdminRole
  is_active: boolean
  last_login_at: string | null
}

/**
 * Проверка пароля админа
 */
export async function verifyAdminPassword(email: string, password: string): Promise<AdminUser | null> {
  const supabase = getAdminClient()
  if (!supabase) return null

  // Получаем админа по email
  const { data: admin, error } = await supabase
    .from('admin_users')
    .select('id, email, password_hash, role, is_active, last_login_at, failed_login_attempts, locked_until')
    .eq('email', email)
    .single()

  if (error || !admin) {
    return null
  }

  // Проверяем, не заблокирован ли аккаунт
  if (admin.locked_until && new Date(admin.locked_until) > new Date()) {
    throw new Error('Аккаунт временно заблокирован из-за множественных неудачных попыток входа')
  }

  // Проверяем пароль
  const isValid = await bcrypt.compare(password, admin.password_hash)

  if (!isValid) {
    // Увеличиваем счетчик неудачных попыток
    const failedAttempts = (admin.failed_login_attempts || 0) + 1
    const updateData: any = { failed_login_attempts: failedAttempts }

    // Блокируем после 5 неудачных попыток на 30 минут
    if (failedAttempts >= 5) {
      const lockUntil = new Date()
      lockUntil.setMinutes(lockUntil.getMinutes() + 30)
      updateData.locked_until = lockUntil.toISOString()
    }

    await supabase
      .from('admin_users')
      .update(updateData)
      .eq('id', admin.id)

    return null
  }

  // Пароль верный - обновляем last_login_at и сбрасываем счетчик
  await supabase
    .from('admin_users')
    .update({
      last_login_at: new Date().toISOString(),
      failed_login_attempts: 0,
      locked_until: null,
    })
    .eq('id', admin.id)

  if (!admin.is_active) {
    throw new Error('Аккаунт деактивирован')
  }

  return {
    id: admin.id,
    email: admin.email,
    role: admin.role as AdminRole,
    is_active: admin.is_active,
    last_login_at: admin.last_login_at,
  }
}

/**
 * Проверка роли админа
 */
export async function checkAdminRole(
  adminId: string,
  requiredRole: AdminRole
): Promise<boolean> {
  const supabase = getAdminClient()
  if (!supabase) return false

  const { data: admin } = await supabase
    .from('admin_users')
    .select('role, is_active')
    .eq('id', adminId)
    .eq('is_active', true)
    .single()

  if (!admin) return false

  // Super admin имеет доступ ко всему
  if (admin.role === 'super_admin') return true

  // Проверка конкретной роли
  const roleHierarchy: Record<AdminRole, number> = {
    super_admin: 5,
    content_manager: 4,
    order_manager: 3,
    support_manager: 2,
    analyst: 1,
  }

  return roleHierarchy[admin.role as AdminRole] >= roleHierarchy[requiredRole]
}

/**
 * Получение информации об админе по ID
 */
export async function getAdminById(adminId: string): Promise<AdminUser | null> {
  const supabase = getAdminClient()
  if (!supabase) return null

  const { data: admin, error } = await supabase
    .from('admin_users')
    .select('id, email, role, is_active, last_login_at')
    .eq('id', adminId)
    .eq('is_active', true)
    .single()

  if (error || !admin) return null

  return {
    id: admin.id,
    email: admin.email,
    role: admin.role as AdminRole,
    is_active: admin.is_active,
    last_login_at: admin.last_login_at,
  }
}

/**
 * Проверка доступа к разделу
 */
export async function hasAccessToSection(
  adminId: string,
  section: 'users' | 'orders' | 'blog' | 'resources' | 'doctors' | 'chat' | 'tests' | 'subscribers' | 'contact' | 'forum' | 'analytics' | 'settings'
): Promise<boolean> {
  const admin = await getAdminById(adminId)
  if (!admin) return false

  // Super admin имеет доступ ко всему
  if (admin.role === 'super_admin') return true

  // Матрица доступа
  const accessMatrix: Record<AdminRole, string[]> = {
    super_admin: ['*'], // Все
    content_manager: ['blog', 'resources', 'doctors', 'subscribers', 'analytics'],
    order_manager: ['orders', 'analytics'],
    support_manager: ['users', 'chat', 'tests', 'subscribers', 'contact', 'forum', 'analytics'],
    analyst: ['analytics'], // Только просмотр
  }

  const allowedSections = accessMatrix[admin.role]
  return allowedSections.includes('*') || allowedSections.includes(section)
}
