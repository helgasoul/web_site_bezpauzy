'use client'

import { FC } from 'react'
import { Quote } from 'lucide-react'

interface ExpertQuoteProps {
  quote: string
  author: string
  role: string
}

export const ExpertQuote: FC<ExpertQuoteProps> = ({ quote, author, role }) => {
  return (
    <div className="bg-white border-2 border-lavender-bg rounded-3xl p-8 md:p-10 my-8 relative shadow-card">
      {/* Decorative quote mark */}
      <div className="absolute -top-4 -left-4 w-16 h-16 bg-primary-purple/10 rounded-full flex items-center justify-center">
        <Quote className="w-8 h-8 text-primary-purple opacity-50" />
      </div>

      <blockquote className="font-playfair text-quote text-deep-navy italic mb-6 relative z-10">
        {'"'}{quote}{'"'}
      </blockquote>

      <div className="flex items-center gap-3 pt-4 border-t border-lavender-bg">
        <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
          <span className="text-white font-semibold">
            {author.split(' ').map(n => n[0]).join('')}
          </span>
        </div>
        <div>
          <div className="font-semibold text-deep-navy">{author}</div>
          <div className="text-body-small text-deep-navy/70">{role}</div>
        </div>
      </div>
    </div>
  )
}






