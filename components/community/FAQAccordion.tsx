'use client'

import { FC, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus } from 'lucide-react'

interface FAQItem {
  question: string
  answer: string
}

interface FAQAccordionProps {
  items: FAQItem[]
}

export const FAQAccordion: FC<FAQAccordionProps> = ({ items }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="space-y-4">
      {items.map((item, index) => {
        const isOpen = openIndex === index

        return (
          <div
            key={index}
            className="bg-white rounded-card shadow-card overflow-hidden transition-all duration-300 hover:shadow-card-hover"
          >
            <button
              onClick={() => toggleItem(index)}
              className="w-full flex items-center justify-between p-6 md:p-8 text-left focus:outline-none focus:ring-2 focus:ring-primary-purple/20 focus:ring-offset-2 rounded-card hover:bg-lavender-bg/30 transition-colors"
              aria-expanded={isOpen}
              aria-controls={`faq-answer-${index}`}
            >
              <h3 className="text-h4 font-semibold text-deep-navy pr-8 flex-1">
                {item.question}
              </h3>
              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-primary-purple/10 transition-all duration-300 hover:bg-primary-purple/20">
                {isOpen ? (
                  <Minus className="w-5 h-5 text-primary-purple transition-all duration-300" />
                ) : (
                  <Plus className="w-5 h-5 text-primary-purple transition-all duration-300" />
                )}
              </div>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={`faq-answer-${index}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="px-6 md:px-8 pb-6 md:pb-8 pt-0">
                    <p className="text-body text-deep-navy/70 leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}

