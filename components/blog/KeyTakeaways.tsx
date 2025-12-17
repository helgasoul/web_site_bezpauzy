'use client'

import { FC } from 'react'
import { CheckCircle2 } from 'lucide-react'

interface KeyTakeawaysProps {
  takeaways: string[]
}

export const KeyTakeaways: FC<KeyTakeawaysProps> = ({ takeaways }) => {
  return (
    <div className="bg-lavender-bg rounded-3xl p-6 md:p-8 border border-primary-purple/10">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-primary-purple rounded-full flex items-center justify-center">
          <span className="text-xl">📌</span>
        </div>
        <h3 className="text-h4 font-semibold text-deep-navy">
          Ключевые выводы
        </h3>
      </div>
      <ul className="space-y-3">
        {takeaways.map((takeaway, index) => (
          <li key={index} className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-primary-purple flex-shrink-0 mt-0.5" />
            <span className="text-body text-deep-navy/85">{takeaway}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
