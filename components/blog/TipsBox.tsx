'use client'

import { FC } from 'react'
import { Lightbulb } from 'lucide-react'

interface TipsBoxProps {
  tips: string[]
}

export const TipsBox: FC<TipsBoxProps> = ({ tips }) => {
  return (
    <div className="bg-gradient-to-br from-ocean-wave-start/20 to-ocean-wave-end/20 rounded-3xl p-6 md:p-8 my-8 border border-ocean-wave-start/30">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-ocean rounded-full flex items-center justify-center">
          <Lightbulb className="w-5 h-5 text-deep-navy" />
        </div>
        <h4 className="text-h5 font-semibold text-deep-navy">
          Что делать прямо сейчас:
        </h4>
      </div>
      <ol className="space-y-3">
        {tips.map((tip, index) => (
          <li key={index} className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-ocean-wave-start text-white rounded-full flex items-center justify-center text-sm font-semibold">
              {index + 1}
            </span>
            <span className="text-body text-deep-navy/85">{tip}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}






