interface SubscriberStatusBadgeProps {
  status: 'pending' | 'active' | 'unsubscribed'
}

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: {
    label: 'Ожидает подтверждения',
    className: 'bg-orange-100 text-orange-800',
  },
  active: {
    label: 'Активен',
    className: 'bg-green-100 text-green-800',
  },
  unsubscribed: {
    label: 'Отписан',
    className: 'bg-gray-100 text-gray-800',
  },
}

export function SubscriberStatusBadge({ status }: SubscriberStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.pending

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  )
}
