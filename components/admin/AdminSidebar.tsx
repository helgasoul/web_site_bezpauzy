'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  FileText,
  MessageSquare,
  Settings,
  BarChart3,
  Mail,
  HelpCircle,
  LogOut,
  Package,
  Stethoscope,
  TestTube,
  UsersRound,
  FileVideo,
} from 'lucide-react'

interface AdminSidebarProps {
  admin: {
    id: string
    email: string
    role: string
  }
}

const menuItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, roles: ['*'] },
  { href: '/admin/users', label: 'Пользователи', icon: Users, roles: ['super_admin', 'support_manager'] },
  { href: '/admin/orders', label: 'Заказы', icon: ShoppingCart, roles: ['super_admin', 'order_manager'] },
  { href: '/admin/blog', label: 'Блог', icon: FileText, roles: ['super_admin', 'content_manager'] },
  { href: '/admin/resources', label: 'Ресурсы', icon: Package, roles: ['super_admin', 'content_manager'] },
  { href: '/admin/doctors', label: 'Врачи', icon: Stethoscope, roles: ['super_admin', 'content_manager'] },
  { href: '/admin/videos', label: 'Видео', icon: FileVideo, roles: ['super_admin', 'content_manager'] },
  { href: '/admin/chat', label: 'Чат с ботом', icon: MessageSquare, roles: ['super_admin', 'support_manager'] },
  { href: '/admin/tests', label: 'Тесты', icon: TestTube, roles: ['super_admin', 'support_manager'] },
  { href: '/admin/subscribers', label: 'Подписчики', icon: UsersRound, roles: ['super_admin', 'content_manager', 'support_manager'] },
  { href: '/admin/contact', label: 'Обратная связь', icon: HelpCircle, roles: ['super_admin', 'support_manager'] },
  { href: '/admin/analytics', label: 'Аналитика', icon: BarChart3, roles: ['*'] },
  { href: '/admin/settings', label: 'Настройки', icon: Settings, roles: ['super_admin'] },
]

export function AdminSidebar({ admin }: AdminSidebarProps) {
  const pathname = usePathname()

  const hasAccess = (roles: string[]) => {
    if (roles.includes('*')) return true
    return roles.includes(admin.role) || admin.role === 'super_admin'
  }

  const filteredMenuItems = menuItems.filter(item => hasAccess(item.roles))

  const handleLogout = async () => {
    await fetch('/api/admin/auth/logout', { method: 'POST' })
    window.location.href = '/admin/login'
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-center h-16 border-b border-gray-200">
          <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
            Без |Паузы
          </h1>
          <span className="ml-2 text-xs text-gray-500">Admin</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                  isActive
                    ? 'bg-purple-50 text-purple-700'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* User info & Logout */}
        <div className="border-t border-gray-200 p-4">
          <div className="mb-3">
            <p className="text-sm font-medium text-gray-900">{admin.email}</p>
            <p className="text-xs text-gray-500 capitalize">{admin.role.replace('_', ' ')}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Выйти
          </button>
        </div>
      </div>
    </aside>
  )
}
