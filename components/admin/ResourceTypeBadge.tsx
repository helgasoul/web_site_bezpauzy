import { cn } from '@/lib/utils'
import { FileCheck, BookOpen } from 'lucide-react'

interface ResourceTypeBadgeProps {
  type: 'checklist' | 'guide'
}

export function ResourceTypeBadge({ type }: ResourceTypeBadgeProps) {
  const config = {
    checklist: {
      label: 'Чек-лист',
      icon: FileCheck,
      className: 'bg-blue-100 text-blue-800',
    },
    guide: {
      label: 'Гайд',
      icon: BookOpen,
      className: 'bg-emerald-100 text-emerald-800',
    },
  }

  const { label, icon: Icon, className } = config[type]

  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium',
      className
    )}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  )
}
