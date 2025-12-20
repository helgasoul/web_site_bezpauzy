'use client'

import { FC, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { TrendingUp, Calendar } from 'lucide-react'

interface QuizResult {
  id: string
  total_score: number
  vasomotor_score: number
  psychological_score: number
  urogenital_score: number
  somatic_score: number
  severity: 'mild' | 'moderate' | 'severe'
  created_at: string
}

interface QuizStatisticsProps {
  results: QuizResult[]
}

export const QuizStatistics: FC<QuizStatisticsProps> = ({ results }) => {
  const chartData = useMemo(() => {
    return results
      .slice()
      .reverse()
      .map((result, index) => {
        const date = new Date(result.created_at)
        return {
          name: date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
          date: date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }),
          'Общий балл': result.total_score,
          'Вазомоторные': result.vasomotor_score,
          'Психоэмоциональные': result.psychological_score,
          'Урогенитальные': result.urogenital_score,
          'Соматические': result.somatic_score,
          index: index + 1,
        }
      })
  }, [results])

  const categoryData = useMemo(() => {
    if (results.length === 0) return []
    
    const latest = results[0]
    return [
      {
        name: 'Вазомоторные',
        value: latest.vasomotor_score,
        max: 8,
        color: '#8B7FD6',
      },
      {
        name: 'Психоэмоциональные',
        value: latest.psychological_score,
        max: 20,
        color: '#7DD3E0',
      },
      {
        name: 'Урогенитальные',
        value: latest.urogenital_score,
        max: 8,
        color: '#F5A623',
      },
      {
        name: 'Соматические',
        value: latest.somatic_score,
        max: 8,
        color: '#EF4444',
      },
    ]
  }, [results])

  const calculateTrend = () => {
    if (results.length < 2) return null
    
    const latest = results[0].total_score
    const previous = results[1].total_score
    const diff = latest - previous
    const percent = previous !== 0 ? Math.round((diff / previous) * 100) : 0
    
    return {
      diff,
      percent,
      isImprovement: diff < 0,
    }
  }

  const trend = calculateTrend()

  if (results.length === 0) {
    return null
  }

  return (
    <div className="space-y-8">
      {/* Trend Summary */}
      {trend && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-primary-purple/10 to-ocean-wave-start/10 rounded-2xl p-6 border border-primary-purple/20"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-purple to-ocean-wave-start rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-h4 font-bold text-deep-navy">Общий тренд</h3>
              <p className="text-body-small text-deep-navy/70">
                Изменение за последние прохождения
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className={`text-3xl font-bold ${trend.isImprovement ? 'text-green-600' : 'text-red-600'}`}>
              {trend.diff > 0 ? '+' : ''}
              {trend.diff}
            </div>
            <div className="text-body text-deep-navy/70">
              <span className="font-semibold">{trend.percent > 0 ? '+' : ''}{trend.percent}%</span> от
              предыдущего результата
            </div>
            {trend.isImprovement && (
              <div className="ml-auto px-4 py-2 bg-green-50 border border-green-200 rounded-full">
                <span className="text-sm font-semibold text-green-700">✓ Улучшение</span>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Line Chart - Total Score Over Time */}
      {results.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 md:p-8 shadow-card"
        >
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="w-5 h-5 text-primary-purple" />
            <h3 className="text-h4 font-bold text-deep-navy">
              Динамика общего балла
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B7FD6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8B7FD6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E5F2" />
              <XAxis
                dataKey="name"
                stroke="#3D4461"
                fontSize={12}
                tick={{ fill: '#3D4461' }}
              />
              <YAxis
                stroke="#3D4461"
                fontSize={12}
                tick={{ fill: '#3D4461' }}
                domain={[0, 44]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #E8E5F2',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#3D4461', fontWeight: 'bold' }}
              />
              <Area
                type="monotone"
                dataKey="Общий балл"
                stroke="#8B7FD6"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorTotal)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Multi-line Chart - Categories Over Time */}
      {results.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 md:p-8 shadow-card"
        >
          <h3 className="text-h4 font-bold text-deep-navy mb-6">
            Динамика по категориям
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E5F2" />
              <XAxis
                dataKey="name"
                stroke="#3D4461"
                fontSize={12}
                tick={{ fill: '#3D4461' }}
              />
              <YAxis
                stroke="#3D4461"
                fontSize={12}
                tick={{ fill: '#3D4461' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #E8E5F2',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#3D4461', fontWeight: 'bold' }}
              />
              <Legend
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="line"
              />
              <Line
                type="monotone"
                dataKey="Вазомоторные"
                stroke="#8B7FD6"
                strokeWidth={2}
                dot={{ fill: '#8B7FD6', r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="Психоэмоциональные"
                stroke="#7DD3E0"
                strokeWidth={2}
                dot={{ fill: '#7DD3E0', r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="Урогенитальные"
                stroke="#F5A623"
                strokeWidth={2}
                dot={{ fill: '#F5A623', r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="Соматические"
                stroke="#EF4444"
                strokeWidth={2}
                dot={{ fill: '#EF4444', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Bar Chart - Latest Results by Category */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl p-6 md:p-8 shadow-card"
      >
        <h3 className="text-h4 font-bold text-deep-navy mb-6">
          Последний результат по категориям
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={categoryData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#E8E5F2" />
            <XAxis type="number" domain={[0, 'dataMax']} stroke="#3D4461" fontSize={12} />
            <YAxis
              dataKey="name"
              type="category"
              stroke="#3D4461"
              fontSize={12}
              width={120}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #E8E5F2',
                borderRadius: '8px',
              }}
              labelStyle={{ color: '#3D4461', fontWeight: 'bold' }}
            />
            <Bar dataKey="value" radius={[0, 8, 8, 0]}>
              {categoryData.map((entry, index) => (
                <Bar key={index} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  )
}

