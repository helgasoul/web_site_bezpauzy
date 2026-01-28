import { LucideIcon } from 'lucide-react'

interface AnalyticsMetricCardProps {
  title: string
  value: number | string
  icon: LucideIcon
  change?: number // процент изменения относительно предыдущего периода
  format?: 'number' | 'currency' | 'percent'
  trend?: 'up' | 'down' | 'neutral'
}

export function AnalyticsMetricCard({
  title,
  value,
  icon: Icon,
  change,
  format = 'number',
  trend = 'neutral',
}: AnalyticsMetricCardProps) {
  const formatValue = (val: number | string) => {
    if (typeof val === 'string') return val

    switch (format) {
      case 'currency':
        return `${(val / 100).toLocaleString('ru-RU')}₽`
      case 'percent':
        return `${val.toFixed(1)}%`
      default:
        return val.toLocaleString('ru-RU')
    }
  }

  const getTrendColor = () => {
    if (trend === 'up') return 'text-green-600'
    if (trend === 'down') return 'text-red-600'
    return 'text-gray-600'
  }

  const getTrendIcon = () => {
    if (trend === 'up') return '↑'
    if (trend === 'down') return '↓'
    return '→'
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{formatValue(value)}</p>
          {change !== undefined && (
            <p className={`mt-2 text-sm font-medium ${getTrendColor()}`}>
              {getTrendIcon()} {Math.abs(change).toFixed(1)}% vs предыдущий период
            </p>
          )}
        </div>
        <div className="flex-shrink-0">
          <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
            <Icon className="h-6 w-6 text-purple-600" />
          </div>
        </div>
      </div>
    </div>
  )
}
