'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface DataPoint {
  date: string
  count?: number
  amount?: number
}

interface AnalyticsTrendChartProps {
  data: DataPoint[]
  dataKey: 'count' | 'amount'
  title: string
  color?: string
  format?: 'number' | 'currency'
}

export function AnalyticsTrendChart({
  data,
  dataKey,
  title,
  color = '#9333ea',
  format = 'number',
}: AnalyticsTrendChartProps) {
  const formatValue = (value: number) => {
    if (format === 'currency') {
      return `${(value / 100).toLocaleString('ru-RU')}₽`
    }
    return value.toLocaleString('ru-RU')
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            tickFormatter={(value) => formatValue(value)}
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <Tooltip
            formatter={(value: number) => [formatValue(value), title]}
            labelFormatter={(label) => new Date(label).toLocaleDateString('ru-RU')}
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
          />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            dot={{ fill: color, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
