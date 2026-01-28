interface ContactStatusBadgeProps {
  status: 'new' | 'in_progress' | 'resolved' | 'closed'
}

const statusConfig: Record<string, { label: string; className: string }> = {
  new: {
    label: 'Новое',
    className: 'bg-blue-100 text-blue-800',
  },
  in_progress: {
    label: 'В работе',
    className: 'bg-orange-100 text-orange-800',
  },
  resolved: {
    label: 'Решено',
    className: 'bg-green-100 text-green-800',
  },
  closed: {
    label: 'Закрыто',
    className: 'bg-gray-100 text-gray-800',
  },
}

export function ContactStatusBadge({ status }: ContactStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.new

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  )
}
