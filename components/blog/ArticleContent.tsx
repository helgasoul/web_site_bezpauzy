'use client'

import { FC } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { KeyTakeaways } from './KeyTakeaways'
import { StatHighlight } from './StatHighlight'
import { ExpertQuote } from './ExpertQuote'
import { TipsBox } from './TipsBox'
import { References } from './References'

interface Article {
  id: number
  title: string
  content: string
  keyTakeaways: string[]
  references?: Array<{ id: number; text: string }>
}

interface ArticleContentProps {
  article: Article
}

export const ArticleContent: FC<ArticleContentProps> = ({ article }) => {
  // Parse content - in real app, this would be MDX or rich text
  // For now, we'll render it as simple markdown-like structure
  const parseContent = (content: string) => {
    // Simple parser for demonstration
    const lines = content.trim().split('\n')
    const elements: JSX.Element[] = []
    let currentParagraph: string[] = []
    let key = 0

    lines.forEach((line) => {
      if (line.startsWith('## ')) {
        // H2
        if (currentParagraph.length > 0) {
          elements.push(
            <p key={key++} className="text-body text-deep-navy/85 mb-6 leading-relaxed">
              {currentParagraph.join(' ')}
            </p>
          )
          currentParagraph = []
        }
        elements.push(
          <h2 key={key++} className="text-h2 font-semibold text-deep-navy mt-12 mb-6 first:mt-0">
            {line.replace('## ', '')}
          </h2>
        )
      } else if (line.startsWith('### ')) {
        // H3
        if (currentParagraph.length > 0) {
          elements.push(
            <p key={key++} className="text-body text-deep-navy/85 mb-6 leading-relaxed">
              {currentParagraph.join(' ')}
            </p>
          )
          currentParagraph = []
        }
        elements.push(
          <h3 key={key++} className="text-h3 font-semibold text-deep-navy mt-8 mb-4">
            {line.replace('### ', '')}
          </h3>
        )
      } else if (line.trim() === '') {
        // Empty line
        if (currentParagraph.length > 0) {
          elements.push(
            <p key={key++} className="text-body text-deep-navy/85 mb-6 leading-relaxed">
              {currentParagraph.join(' ')}
            </p>
          )
          currentParagraph = []
        }
      } else if (line.match(/^\d+\.\s/)) {
        // Numbered list item - add to current paragraph as formatted text
        if (currentParagraph.length > 0) {
          elements.push(
            <p key={key++} className="text-body text-deep-navy/85 mb-6 leading-relaxed">
              {currentParagraph.join(' ')}
            </p>
          )
          currentParagraph = []
        }
        const listItem = line.replace(/^\d+\.\s/, '')
        const parts = listItem.split(':')
        elements.push(
          <p key={key++} className="text-body text-deep-navy/85 mb-3 ml-6">
            <span className="font-semibold">{parts[0]}:</span>
            {parts.length > 1 ? parts.slice(1).join(':') : ''}
          </p>
        )
      } else {
        currentParagraph.push(line.trim())
      }
    })

    if (currentParagraph.length > 0) {
      elements.push(
        <p key={key++} className="text-body text-deep-navy/85 mb-6 leading-relaxed">
          {currentParagraph.join(' ')}
        </p>
      )
    }

    return elements
  }

  return (
    <section className="py-12 md:py-16 bg-soft-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Key Takeaways */}
          {article.keyTakeaways && article.keyTakeaways.length > 0 && (
            <motion.div
              className="mb-12"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <KeyTakeaways takeaways={article.keyTakeaways} />
            </motion.div>
          )}

          {/* Article Body */}
          <motion.article
            className="prose prose-lg max-w-none"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="article-content">
              {parseContent(article.content)}
            </div>

            {/* Example: Stat Highlight */}
            <StatHighlight
              source="По данным IMS"
              stats={[
                '75% женщин испытывают приливы в перименопаузе',
                'Средняя длительность: 7.4 года',
              ]}
            />

            {/* Example: Expert Quote */}
            <ExpertQuote
              quote="Приливы — это нормальная часть менопаузы, но они не должны мешать вашей жизни. Если приливы возникают чаще 10 раз в день или сильно нарушают сон, стоит обсудить это с врачом."
              author="Др. Анна Иванова"
              role="Гинеколог-эндокринолог, к.м.н."
            />

            {/* Example: Tips Box */}
            <TipsBox
              tips={[
                'Одевайтесь слоями — легко снять лишнее при начале прилива',
                'Избегайте триггеров: острая еда, алкоголь, стресс',
                'Дышите глубоко при начале прилива',
                'Прохладный душ перед сном',
              ]}
            />
          </motion.article>

          {/* References */}
          {article.references && article.references.length > 0 && (
            <motion.div
              className="mt-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <References references={article.references} />
            </motion.div>
          )}
        </div>
      </div>
    </section>
  )
}
