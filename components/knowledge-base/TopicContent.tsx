'use client'

import { FC } from 'react'
import ReactMarkdown from 'react-markdown'

interface TopicContentProps {
  content: string
}

/**
 * Компонент для отображения контента темы с поддержкой markdown
 */
export const TopicContent: FC<TopicContentProps> = ({ content }) => {
  if (!content) return null

  // Используем any для компонентов из-за проблем совместимости типов react-markdown с React 18
  const markdownComponents: any = {
    p: ({ children }: any) => (
      <p className="text-body text-deep-navy/85 mb-6 leading-relaxed">
        {children}
      </p>
    ),
    strong: ({ children }: any) => (
      <strong className="font-semibold text-deep-navy bg-gradient-to-r from-primary-purple to-ocean-wave-start bg-clip-text text-transparent">
        {children}
      </strong>
    ),
    h2: ({ children }: any) => (
      <h2 className="text-h3 font-bold mt-12 mb-6 pb-4 border-b-2 border-lavender-bg first:mt-0 bg-gradient-to-r from-primary-purple to-ocean-wave-start bg-clip-text text-transparent">
        {children}
      </h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="text-h4 font-semibold text-deep-navy mt-8 mb-4 bg-gradient-to-r from-primary-purple to-ocean-wave-start bg-clip-text text-transparent">
        {children}
      </h3>
    ),
    ul: ({ children }: any) => (
      <ul className="list-none pl-0 mb-6 space-y-3">
        {children}
      </ul>
    ),
    li: ({ children }: any) => (
      <li className="text-body text-deep-navy/85 flex items-start gap-3">
        <span className="text-primary-purple mt-1.5 font-bold text-lg">•</span>
        <span>{children}</span>
      </li>
    ),
    ol: ({ children }: any) => (
      <ol className="list-decimal list-inside mb-6 space-y-3 pl-4 marker:text-primary-purple marker:font-semibold">
        {children}
      </ol>
    ),
  }

  return (
    <section className="py-12 md:py-16 bg-soft-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="prose prose-lg max-w-none">
            <ReactMarkdown components={markdownComponents}>
              {content}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </section>
  )
}
