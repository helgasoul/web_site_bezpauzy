'use client'

import { Bell, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface AdminHeaderProps {
  admin: {
    id: string
    email: string
    role: string
  }
}

export function AdminHeader({ admin }: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-40 h-16 border-b border-gray-200 bg-white">
      <div className="flex h-full items-center justify-between px-8">
        {/* Search */}
        <div className="flex-1 max-w-lg">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="search"
              placeholder="Поиск..."
              className="pl-10"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{admin.email}</p>
              <p className="text-xs text-gray-500 capitalize">{admin.role.replace('_', ' ')}</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white text-sm font-medium">
              {admin.email.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
