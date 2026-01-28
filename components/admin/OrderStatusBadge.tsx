import { formatOrderStatus, getOrderStatusColor } from '@/lib/admin/formatters'
import { cn } from '@/lib/utils'

interface OrderStatusBadgeProps {
  status: 'pending' | 'paid' | 'shipped' | 'cancelled' | 'refunded'
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        getOrderStatusColor(status)
      )}
    >
      {formatOrderStatus(status)}
    </span>
  )
}
