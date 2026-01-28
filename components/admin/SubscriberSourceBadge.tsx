import { Home, BookOpen, Book, Mail } from 'lucide-react'

interface SubscriberSourceBadgeProps {
  source: string | null
}

const sourceConfig: Record<string, { label: string; icon: any; className: string }> = {
  homepage: {
    label: 'Главная',
    icon: Home,
    className: 'bg-blue-100 text-blue-800',
  },
  blog: {
    label: 'Блог',
    icon: BookOpen,
    className: 'bg-purple-100 text-purple-800',
  },
  book_page: {
    label: 'Страница книги',
    icon: Book,
    className: 'bg-pink-100 text-pink-800',
  },
  newsletter_page: {
    label: 'Страница рассылки',
    icon: Mail,
    className: 'bg-cyan-100 text-cyan-800',
  },
}

export function SubscriberSourceBadge({ source }: SubscriberSourceBadgeProps) {
  const config = source ? sourceConfig[source] : null

  if (!config) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        Не указан
      </span>
    )
  }

  const Icon = config.icon

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  )
}
