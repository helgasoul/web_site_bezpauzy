'use client'

import { FC } from 'react'
import { FileText } from 'lucide-react'

interface Reference {
  id: number
  text: string
}

interface ReferencesProps {
  references: Reference[]
}

export const References: FC<ReferencesProps> = ({ references }) => {
  return (
    <div className="border-t border-lavender-bg pt-8">
      <div className="flex items-center gap-3 mb-6">
        <FileText className="w-5 h-5 text-primary-purple" />
        <h3 className="text-h4 font-semibold text-deep-navy">
          Научные источники
        </h3>
      </div>
      <ol className="space-y-3">
        {references.map((ref) => (
          <li key={ref.id} className="text-body-small text-deep-navy/70">
            <span className="font-medium text-primary-purple">[{ref.id}]</span>{' '}
            {ref.text}
          </li>
        ))}
      </ol>
    </div>
  )
}
