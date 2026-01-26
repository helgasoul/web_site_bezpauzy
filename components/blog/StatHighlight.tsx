'use client'

import { FC } from 'react'
import { BarChart3 } from 'lucide-react'

interface StatHighlightProps {
  source: string
  stats: string[]
}

export const StatHighlight: FC<StatHighlightProps> = ({ source, stats }) => {
  return (
    <div className="bg-gradient-to-br from-lavender-bg to-soft-white rounded-2xl p-6 md:p-8 my-8 border-l-4 border-primary-purple shadow-card">
      <div className="flex items-center gap-3 mb-4">
        <BarChart3 className="w-6 h-6 text-primary-purple" />
        <h4 className="text-h5 font-semibold text-deep-navy">
          {source}{source.endsWith(':') ? '' : ':'}
        </h4>
      </div>
      <ul className="space-y-2">
        {stats.map((stat, index) => (
          <li key={index} className="text-body text-deep-navy/85 flex items-start gap-2">
            <span className="text-primary-purple mt-1">•</span>
            <span>{stat}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}






