'use client'

import { FC, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Info, Lightbulb, X, CheckCircle2 } from 'lucide-react'

type CardType = 'fact' | 'tip' | 'myth_fact' | 'checklist'

interface InteractiveCard {
  id: string
  type: CardType
  title: string
  content: string | string[]
}

interface InteractiveCardsProps {
  cards?: InteractiveCard[]
}

export const InteractiveCards: FC<InteractiveCardsProps> = ({ cards }) => {
  // Используем переданные карточки
  const displayCards = (cards && Array.isArray(cards) && cards.length > 0) ? cards : []

  if (!displayCards || displayCards.length === 0) {
    return <></>
  }

  return (
    <section className="py-12 bg-soft-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-h3 font-bold text-deep-navy mb-2">Интерактивные материалы</h2>
          <p className="text-body text-deep-navy/70">
            Факты, советы и полезная информация
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayCards.map((card, index) => (
            <CardComponent key={card.id} card={card} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}

interface CardComponentProps {
  card: InteractiveCard
  index: number
}

const CardComponent: FC<CardComponentProps> = ({ card, index }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const renderContent = (): JSX.Element => {
    if (card.type === 'checklist' && Array.isArray(card.content)) {
      return (
        <ul className="space-y-2">
          {card.content.map((item, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary-purple flex-shrink-0 mt-0.5" />
              <span className="text-body text-deep-navy/80">{String(item)}</span>
            </li>
          ))}
        </ul>
      )
    }

    if (card.type === 'myth_fact' && typeof card.content === 'string') {
      const parts = card.content.split('\n\n')
      return (
        <div className="space-y-4">
          {parts.map((part, idx) => {
            if (part.startsWith('Миф:')) {
              return (
                <div key={idx} className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
                  <div className="font-semibold text-red-900 mb-1">Миф</div>
                  <div className="text-body text-red-800">{part.replace('Миф: ', '')}</div>
                </div>
              )
            }
            if (part.startsWith('Факт:')) {
              return (
                <div key={idx} className="bg-green-50 border-l-4 border-green-400 p-4 rounded">
                  <div className="font-semibold text-green-900 mb-1">Факт</div>
                  <div className="text-body text-green-800">{part.replace('Факт: ', '')}</div>
                </div>
              )
            }
            return <div key={idx} className="text-body text-deep-navy/80">{part}</div>
          })}
        </div>
      )
    }

    if (card.type === 'tip' && Array.isArray(card.content)) {
      return (
        <ul className="space-y-2">
          {card.content.map((item, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-purple/20 text-primary-purple flex items-center justify-center text-body-small font-semibold mt-0.5">
                {idx + 1}
              </span>
              <span className="text-body text-deep-navy/80">{String(item)}</span>
            </li>
          ))}
        </ul>
      )
    }

    return <div className="text-body text-deep-navy/80 whitespace-pre-line">{String(card.content || '')}</div>
  }

  const getIcon = () => {
    switch (card.type) {
      case 'fact':
        return Info
      case 'tip':
        return Lightbulb
      case 'myth_fact':
        return Lightbulb
      case 'checklist':
        return CheckCircle2
      default:
        return Info
    }
  }

  const getGradient = () => {
    switch (card.type) {
      case 'fact':
        return 'from-primary-purple to-ocean-wave-start'
      case 'tip':
        return 'from-ocean-wave-start to-primary-purple'
      case 'myth_fact':
        return 'from-warm-accent to-primary-purple'
      case 'checklist':
        return 'from-primary-purple to-warm-accent'
      default:
        return 'from-primary-purple to-ocean-wave-start'
    }
  }

  const Icon = getIcon()
  const isExpandable = card.type === 'tip' && Array.isArray(card.content) && card.content.length > 5

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <div className="bg-soft-white rounded-card p-6 shadow-card border border-lavender-bg h-full">
        {/* Header */}
        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getGradient()} flex items-center justify-center mb-4`}>
          <Icon className="w-6 h-6 text-white" />
        </div>

        <h3 className="text-h5 font-semibold text-deep-navy mb-4">
          {card.title}
        </h3>

        {/* Content */}
        {isExpandable ? (
          <>
            {!isExpanded && (
              <div className="text-body text-deep-navy/80">
                <ul className="space-y-2">
                  {(card.content as string[]).slice(0, 3).map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-purple/20 text-primary-purple flex items-center justify-center text-body-small font-semibold mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="text-body text-deep-navy/80">{item}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => setIsExpanded(true)}
                  className="mt-4 text-primary-purple text-body-small font-medium hover:underline"
                >
                  Показать все советы ({card.content.length}) →
                </button>
              </div>
            )}
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-body text-deep-navy/80"
              >
                {renderContent()}
                <button
                  onClick={() => setIsExpanded(false)}
                  className="mt-4 text-primary-purple text-body-small font-medium hover:underline flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Свернуть
                </button>
              </motion.div>
            )}
          </>
        ) : (
          <div className="text-body text-deep-navy/80">
            {renderContent()}
          </div>
        )}
      </div>
    </motion.div>
  )
}

