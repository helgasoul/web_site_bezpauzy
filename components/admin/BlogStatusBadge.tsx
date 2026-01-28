import { cn } from '@/lib/utils'

interface BlogStatusBadgeProps {
  published: boolean
  publishedAt?: string | null
}

export function BlogStatusBadge({ published, publishedAt }: BlogStatusBadgeProps) {
  if (published && publishedAt) {
    return (
      <span className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        'bg-green-100 text-green-800'
      )}>
        Опубликована
      </span>
    )
  }

  if (published && !publishedAt) {
    return (
      <span className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        'bg-yellow-100 text-yellow-800'
      )}>
        Запланирована
      </span>
    )
  }

  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      'bg-gray-100 text-gray-800'
    )}>
      Черновик
    </span>
  )
}
